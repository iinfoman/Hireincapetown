// Pushes db/seed.json into the hireincapetown schema, and keeps the database
// awake by doing so.
//
// Direction matters. db/seed.json is what a human edits and what the site is
// built from; the database is a replica that stays current and warm. Syncing
// the other way round would mean two places claiming to be the truth, and a
// scheduled job quietly overwriting a listing someone had just added by hand.
//
// The free Supabase tier pauses a project after about a week with no queries,
// and a paused project has to be restored by hand in the dashboard. A run of
// this script every few days is enough activity to stop that happening. If it
// ever does fail, the site is unaffected: nothing in the build reads the
// database unless DATABASE_URL is set.
//
// Safe to run repeatedly. Existing listings are updated in place, matched on
// slug, and the whole file goes in as one transaction or not at all.
import { readFile } from 'node:fs/promises';

const REQUIRED = ['slug', 'name', 'category', 'status'];
const STATUSES = new Set(['pending', 'listed', 'verified', 'rejected']);

if (!process.env.DATABASE_URL) {
  // Not an error. A clean checkout has no credentials, and CI proves the site
  // builds without them. Exit 0 so this never blocks a green run.
  console.log('DATABASE_URL is not set — nothing to sync.');
  console.log('The site builds from db/seed.json either way; see HANDOVER.md.');
  process.exit(0);
}

const businesses = JSON.parse(await readFile(new URL('../db/seed.json', import.meta.url), 'utf8'));
if (!Array.isArray(businesses)) throw new Error('db/seed.json must be an array of businesses');

// Validate the whole file before opening a connection. A typo should be caught
// here, with the offending slug named, rather than half-applied to the database.
const seen = new Set();
const problems = [];
for (const [i, b] of businesses.entries()) {
  const where = b?.slug ? `"${b.slug}"` : `entry ${i + 1}`;
  for (const field of REQUIRED) {
    if (!b?.[field]) problems.push(`${where}: missing "${field}"`);
  }
  if (b?.status && !STATUSES.has(b.status)) {
    problems.push(`${where}: status "${b.status}" is not one of ${[...STATUSES].join(', ')}`);
  }
  if (b?.slug && seen.has(b.slug)) problems.push(`${where}: duplicate slug`);
  if (b?.slug) seen.add(b.slug);
}
if (problems.length) {
  console.error('db/seed.json has problems, nothing was written:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const { default: pg } = await import('pg');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

try {
  await client.connect();
} catch (err) {
  console.error('\nCould not reach the database.');
  console.error(`  ${err.message}`);
  console.error('\nTwo usual causes:');
  console.error('  1. The Supabase project is paused. Free projects pause after about');
  console.error('     a week idle and have to be restored by hand at supabase.com/dashboard.');
  console.error('  2. DATABASE_URL is the direct connection, which is IPv6-only. Use the');
  console.error('     Session pooler URI from Supabase -> Connect instead.');
  console.error('\nThe live site is not affected — it builds from db/seed.json.');
  process.exit(1);
}

let created = 0, updated = 0, checksAdded = 0;

try {
  await client.query('begin');

  for (const b of businesses) {
    const { rows: [existing] } = await client.query(
      'select id, rating_count from hireincapetown.businesses where slug = $1', [b.slug]);

    // rating_avg / rating_count are maintained by a trigger off real reviews.
    // Once a listing has any, the file's placeholder numbers must not clobber
    // them — the reviews are the truth at that point, not the fixture.
    const keepRating = existing && existing.rating_count > 0;

    const values = [
      b.name, b.slug, b.category, b.suburbs_served ?? [], b.services ?? [],
      b.description ?? null, b.phone ?? null, b.whatsapp ?? null, b.website ?? null, b.status,
      b.promoted ?? false,
      b.rating_avg ?? null, b.rating_count ?? 0, b.callout_from ?? null,
      b.hours ? JSON.stringify(b.hours) : null,
    ];

    const { rows: [row] } = await client.query(
      `insert into hireincapetown.businesses
         (name, slug, category, suburbs_served, services, description, phone,
          whatsapp, website, status, promoted, rating_avg, rating_count, callout_from, hours)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       on conflict (slug) do update set
         name           = excluded.name,
         category       = excluded.category,
         suburbs_served = excluded.suburbs_served,
         services       = excluded.services,
         description    = excluded.description,
         phone          = excluded.phone,
         whatsapp       = excluded.whatsapp,
         website        = excluded.website,
         status         = excluded.status,
         promoted       = excluded.promoted,
         rating_avg     = case when $16 then hireincapetown.businesses.rating_avg   else excluded.rating_avg   end,
         rating_count   = case when $16 then hireincapetown.businesses.rating_count else excluded.rating_count end,
         callout_from   = excluded.callout_from,
         hours          = excluded.hours,
         updated_at     = now()
       returning id`,
      [...values, keepRating]);

    existing ? updated++ : created++;

    // b.reviews is deliberately not synced. The database's reviews table hangs
    // off a recorded hire with a real auth user behind it, which a review
    // typed in from a form has no way to supply. The file's reviews are the
    // operator's moderated copy; the table stays for the signed-in flow.

    // Verification records are added and refreshed, never deleted. A row here
    // may point at a document that was actually uploaded; the file is not
    // allowed to erase that history.
    const { rows: onFile } = await client.query(
      'select id, doc_type from hireincapetown.verification_docs where business_id = $1', [row.id]);

    for (const c of b.checks ?? []) {
      const match = onFile.find((d) => d.doc_type === c.type);
      if (match) {
        await client.query(
          'update hireincapetown.verification_docs set checked_at = $1, label = $2 where id = $3',
          [c.checked_on ?? null, c.label ?? null, match.id]);
      } else {
        // storage_path is a placeholder until a real document is uploaded. The
        // row records that a check happened and when, never the document itself.
        await client.query(
          `insert into hireincapetown.verification_docs
             (business_id, doc_type, storage_path, checked_at, label)
           values ($1, $2, $3, $4, $5)`,
          [row.id, c.type, `verification/${b.slug}/${c.type}`, c.checked_on ?? null, c.label ?? null]);
        checksAdded++;
      }
    }
  }

  await client.query('commit');
} catch (err) {
  await client.query('rollback').catch(() => {});
  console.error('\nSync failed and was rolled back. The database is unchanged.');
  throw err;
} finally {
  await client.end();
}

const live = businesses.filter((b) => b.status === 'verified' || b.status === 'listed').length;
console.log(`synced ${businesses.length} businesses: ${created} added, ${updated} updated`);
if (checksAdded) console.log(`  ${checksAdded} verification records added`);
const ver = businesses.filter((b) => b.status === 'verified').length;
console.log(`  ${live} live (${ver} verified, ${live - ver} listed), ${businesses.length - live} held back`);
console.log('  database is awake; the pause clock has been reset');

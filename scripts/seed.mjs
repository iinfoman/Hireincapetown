// Loads db/seed.json into the hireincapetown schema. Idempotent on slug.
//
// This is also the cold-start playbook made executable: the brief calls for
// 20-30 real verified businesses per category before launch, and this is where
// they go once you have collected them.
import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const businesses = JSON.parse(await readFile(new URL('../db/seed.json', import.meta.url), 'utf8'));
let created = 0, skipped = 0;

try {
  for (const b of businesses) {
    const { rows: existing } = await client.query(
      'select id from hireincapetown.businesses where slug = $1', [b.slug]);
    if (existing.length) { skipped++; continue; }

    // owner_id is left null for seeded listings: there is no auth user behind
    // them yet, and profiles.id references auth.users. A real signup claims the
    // listing and fills this in.
    const { rows } = await client.query(
      `insert into hireincapetown.businesses
         (name, slug, category, suburbs_served, services, description, phone,
          whatsapp, status, rating_avg, rating_count, callout_from, hours)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       returning id`,
      [b.name, b.slug, b.category, b.suburbs_served, b.services, b.description,
       b.phone, b.whatsapp, b.status, b.rating_avg, b.rating_count,
       b.callout_from, JSON.stringify(b.hours)]);

    for (const c of b.checks ?? []) {
      // storage_path is a placeholder until a real document is uploaded — the
      // row records that a check happened and when, never the document itself.
      await client.query(
        `insert into hireincapetown.verification_docs (business_id, doc_type, storage_path, checked_at)
         values ($1, $2, $3, $4)`,
        [rows[0].id, c.type, `verification/${b.slug}/${c.type}`, c.checked_on]);
    }
    created++;
  }
  console.log(`seeded ${created} businesses, skipped ${skipped} already present`);
} finally {
  await client.end();
}

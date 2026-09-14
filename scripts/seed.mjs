// Loads db/seed.json into Neon. Idempotent on slug, so it is safe to re-run.
//
// This is also the cold-start playbook made executable: the brief calls for
// 20-30 real verified businesses per category before launch, and this is where
// they go once you have collected them.
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const businesses = JSON.parse(await readFile(new URL('../db/seed.json', import.meta.url), 'utf8'));

let created = 0;
let skipped = 0;

for (const b of businesses) {
  const [existing] = await sql`select id from businesses where slug = ${b.slug}`;
  if (existing) { skipped++; continue; }

  // Seeded listings need an owner row to satisfy the foreign key. A real
  // signup replaces this when the business claims the listing.
  const ownerId = randomUUID();
  await sql`
    insert into profiles (id, role, display_name)
    values (${ownerId}, 'business', ${b.name})`;

  const [row] = await sql`
    insert into businesses
      (owner_id, name, slug, category, suburbs_served, services, description,
       phone, whatsapp, status, rating_avg, rating_count, callout_from, hours)
    values
      (${ownerId}, ${b.name}, ${b.slug}, ${b.category}, ${b.suburbs_served},
       ${b.services}, ${b.description}, ${b.phone}, ${b.whatsapp}, ${b.status},
       ${b.rating_avg}, ${b.rating_count}, ${b.callout_from}, ${JSON.stringify(b.hours)})
    returning id`;

  for (const c of b.checks ?? []) {
    // r2_key is a placeholder until a real document is uploaded — the row
    // records that a check happened and when, never the document itself.
    await sql`
      insert into verification_docs (business_id, doc_type, r2_key, checked_at)
      values (${row.id}, ${c.type}, ${`seed/${b.slug}/${c.type}`}, ${c.checked_on})`;
  }
  created++;
}

console.log(`seeded ${created} businesses, skipped ${skipped} already present`);

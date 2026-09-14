// One read path for the whole build.
//
// With DATABASE_URL set this queries Neon. Without it, it falls back to
// db/seed.json — which is how the site builds before the database exists, and
// how a contributor gets a working site with no credentials at all.
import { readFile } from 'node:fs/promises';
import { slugify } from '../lib/slug.js';

const SELECT = `
  select b.slug, b.name, b.category, b.suburbs_served, b.services, b.description,
         b.phone, b.whatsapp, b.status, b.rating_avg, b.rating_count,
         b.callout_from, b.hours,
         coalesce(
           (select json_agg(json_build_object('type', v.doc_type, 'checked_on', v.checked_at))
              from verification_docs v
             where v.business_id = b.id and v.checked_at is not null),
           '[]'::json) as checks
    from businesses b
   where b.status = 'verified'
   order by b.rating_avg desc nulls last, b.rating_count desc`;

let cache;

export async function loadBusinesses() {
  if (cache) return cache;

  if (process.env.DATABASE_URL) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    cache = await sql(SELECT);
    console.log(`  data: ${cache.length} verified businesses from Neon`);
  } else {
    const raw = JSON.parse(await readFile(new URL('../../db/seed.json', import.meta.url), 'utf8'));
    // The public site only ever shows verified listings — mirror that here so
    // the fallback can't accidentally be more permissive than the query.
    cache = raw.filter((b) => b.status === 'verified')
               .sort((a, b) => (b.rating_avg - a.rating_avg) || (b.rating_count - a.rating_count));
    console.log(`  data: ${cache.length} verified businesses from db/seed.json (no DATABASE_URL)`);
  }
  return cache;
}

/** Every category × suburb pair that actually has listings. Drives the SEO pages. */
export async function suburbIndex() {
  const all = await loadBusinesses();
  const map = new Map();
  for (const b of all) {
    for (const suburb of b.suburbs_served) {
      const key = `${b.category}/${slugify(suburb)}`;
      if (!map.has(key)) map.set(key, { category: b.category, suburb, slug: slugify(suburb), businesses: [] });
      map.get(key).businesses.push(b);
    }
  }
  return map;
}

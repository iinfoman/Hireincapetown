// Turns the React pages into static HTML, one file per route.
//
// Nothing hydrates. React is a build-time template engine here — the shipped
// page is HTML, CSS and the ~1 KB of script in src/client.js. That is what
// keeps a listing page affordable on a prepaid data bundle.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { render } from '../dist/server/entry-server.js';
import { loadBusinesses, suburbIndex } from '../src/data/source.js';
import { CATEGORIES, byCategorySlug } from '../src/lib/categories.js';
import { slugify } from '../src/lib/slug.js';

const OUT = 'dist/client';
const SITE = process.env.SITE_URL || 'https://hireincapetown.co.za';
const BUDGET_KB = 180;

const manifest = JSON.parse(await readFile(`${OUT}/.vite/manifest.json`, 'utf8'));
const entry = manifest['src/client.js'];
const js = `/${entry.file}`;
const css = (entry.css ?? []).map((f) => `/${f}`);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function shell({ title, description, canonical, body, jsonLd }) {
  return `<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_ZA">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Karla:wght@400;500;600;700&display=swap">
${css.map((h) => `<link rel="stylesheet" href="${h}">`).join('\n')}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>${body}<script type="module" src="${js}"></script></body>
</html>`;
}

const pages = [];
async function emit(route, html) {
  const dir = path.join(OUT, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
  pages.push({ route: route || '/', bytes: gzipSync(html).length });
}

const businesses = await loadBusinesses();
const index = await suburbIndex();

// Every suburb that actually has a listing, for the need-bar's dropdown.
const suburbs = [...new Set(businesses.flatMap((b) => b.suburbs_served))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ name, slug: slugify(name) }));

const liveCategories = CATEGORIES.filter((c) => businesses.some((b) => b.category === c.slug));

// --- home -------------------------------------------------------------------
const seoLinks = [...index.values()]
  .sort((a, b) => b.businesses.length - a.businesses.length)
  .slice(0, 12)
  .map((e) => ({
    href: `/${e.category}/${e.slug}`,
    label: `${byCategorySlug(e.category)?.label ?? e.category} in ${e.suburb}`,
  }));

await emit('', shell({
  title: 'HireInCapeTown — find local, hire with confidence',
  description: 'Vetted Cape Town businesses: plumbers, electricians, cleaners and movers. ID and trade licence checked, reviewed only by people who actually hired them.',
  canonical: '/',
  body: render('Home', { suburbs, featured: businesses.slice(0, 6), seoLinks }),
}));

// --- category and the category x suburb pages -------------------------------
for (const category of liveCategories) {
  const inCategory = businesses.filter((b) => b.category === category.slug);

  await emit(category.slug, shell({
    title: `${category.label} in Cape Town — verified and reviewed | HireInCapeTown`,
    description: `${inCategory.length} verified ${category.label.toLowerCase()} across Cape Town. ID and trade registration checked. Contact them on WhatsApp or call directly.`,
    canonical: `/${category.slug}`,
    body: render('Results', {
      category, suburb: null, businesses: inCategory, suburbs,
      heading: `${category.label} in Cape Town`,
      intro: `Every ${category.one} here has had their ID and address checked, and the trade registration where the work calls for one. Reviews come only from customers who recorded a hire.`,
      nearby: [...index.values()]
        .filter((e) => e.category === category.slug)
        .sort((a, b) => b.businesses.length - a.businesses.length)
        .slice(0, 12)
        .map((e) => ({ href: `/${e.category}/${e.slug}`, label: e.suburb })),
    }),
  }));

  for (const entry of [...index.values()].filter((e) => e.category === category.slug)) {
    const n = entry.businesses.length;
    await emit(`${category.slug}/${entry.slug}`, shell({
      title: `${category.label} in ${entry.suburb}, Cape Town — ${n} verified | HireInCapeTown`,
      description: `${n} verified ${n === 1 ? category.one : category.label.toLowerCase()} serving ${entry.suburb}. Checked ID and trade registration, WhatsApp or call direct.`,
      canonical: `/${category.slug}/${entry.slug}`,
      body: render('Results', {
        category, suburb: { name: entry.suburb, slug: entry.slug },
        businesses: entry.businesses, suburbs,
        heading: `${category.label} in ${entry.suburb}`,
        intro: `${n} verified ${n === 1 ? category.one : category.label.toLowerCase()} covering ${entry.suburb} and the surrounding area. We check ID, business address and trade registration before a listing goes live.`,
        nearby: [...index.values()]
          .filter((e) => e.category === category.slug && e.slug !== entry.slug)
          .slice(0, 10)
          .map((e) => ({ href: `/${e.category}/${e.slug}`, label: e.suburb })),
      }),
    }));
  }
}

// --- business profiles ------------------------------------------------------
for (const b of businesses) {
  const category = byCategorySlug(b.category);
  await emit(`business/${b.slug}`, shell({
    title: `${b.name} — ${category?.one ?? b.category} in ${b.suburbs_served[0]} | HireInCapeTown`,
    description: `${b.name}, verified ${category?.one ?? ''} in ${b.suburbs_served[0]}. ${b.services.slice(0, 3).join(', ')}. ${b.rating_count} reviews from recorded hires.`,
    canonical: `/business/${b.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: b.name,
      description: b.description,
      telephone: b.phone,
      areaServed: b.suburbs_served.map((s) => ({ '@type': 'Place', name: `${s}, Cape Town` })),
      address: { '@type': 'PostalAddress', addressLocality: b.suburbs_served[0], addressRegion: 'Western Cape', addressCountry: 'ZA' },
      ...(b.rating_count > 0 && {
        aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(b.rating_avg), reviewCount: b.rating_count, bestRating: 5 },
      }),
      url: `${SITE}/business/${b.slug}`,
    },
    body: render('Business', {
      business: b, category,
      alsoIn: businesses.filter((o) => o.category === b.category && o.slug !== b.slug).slice(0, 3),
    }),
  }));
}

// --- /find: the need-bar's target ------------------------------------------
// A form GET lands here and bounces to the real page, so the need-bar needs no
// JavaScript of its own and no serverless function sits in the hot path.
await emit('find', `<!doctype html>
<html lang="en-ZA"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Finding businesses…</title></head><body>
<script>(function(){var p=new URLSearchParams(location.search),c=p.get('category'),s=p.get('suburb');
location.replace(c?(s?'/'+c+'/'+s:'/'+c):'/');})();</script>
<noscript><p>Choose a service from the <a href="/">home page</a>.</p></noscript>
</body></html>`);

// --- sitemap + robots -------------------------------------------------------
await writeFile(`${OUT}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.filter((p) => p.route !== 'find')
       .map((p) => `  <url><loc>${SITE}${p.route === '/' ? '/' : '/' + p.route}</loc></url>`).join('\n') +
  `\n</urlset>\n`);

await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /find\n\nSitemap: ${SITE}/sitemap.xml\n`);

// --- budget -----------------------------------------------------------------
const { readFileSync } = await import('node:fs');
const assets = [js, ...css].reduce((n, f) => n + gzipSync(readFileSync(OUT + f)).length, 0);
const heaviest = pages.reduce((a, b) => (b.bytes > a.bytes ? b : a));
const worstKb = (heaviest.bytes + assets) / 1024;

console.log(`\n  ${pages.length} pages · sitemap · robots.txt`);
console.log(`  assets (gzip): ${(assets / 1024).toFixed(1)} KB  [css + ${(gzipSync(readFileSync(OUT + js)).length / 1024).toFixed(1)} KB js]`);
console.log(`  heaviest page: ${heaviest.route} → ${worstKb.toFixed(1)} KB gzip total`);
if (worstKb > BUDGET_KB) {
  console.error(`\n  ✗ over the ${BUDGET_KB} KB budget. Prepaid data is a real cost — fix this, don't raise the number.\n`);
  process.exit(1);
}
console.log(`  ✓ within the ${BUDGET_KB} KB budget\n`);

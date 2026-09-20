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
import { ldJson } from '../src/lib/jsonld.js';
import { CONTACT_EMAIL } from '../src/lib/site.js';

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
${jsonLd ? `<script type="application/ld+json">${ldJson(jsonLd)}</script>` : ''}
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

const all = await loadBusinesses();

// One malformed row must not take the whole site down. suburbs_served defaults
// to an empty array in the schema, and a category not in src/lib/categories.js
// has no pages to link to — skip both, loudly.
const businesses = all.filter((b) => {
  if (!b.suburbs_served?.length) {
    console.warn(`  ! skipped ${b.slug}: no suburbs_served`);
    return false;
  }
  if (!byCategorySlug(b.category)) {
    console.warn(`  ! skipped ${b.slug}: category "${b.category}" is not in src/lib/categories.js`);
    return false;
  }
  return true;
});

const index = await suburbIndex(businesses);

// Every suburb that actually has a listing, for the need-bar's dropdown.
const suburbs = [...new Set(businesses.flatMap((b) => b.suburbs_served))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ name, slug: slugify(name) }));

// Every category gets a page, listings or not. The home page links all eight
// chips, so a category page that only exists once someone is listed in it is a
// 404 on the most-clicked element of the site — which was true for beauty,
// home repairs, auto and photography from the day this launched.

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
for (const category of CATEGORIES) {
  const inCategory = businesses.filter((b) => b.category === category.slug);

  await emit(category.slug, shell({
    title: inCategory.length
      ? `${category.label} in Cape Town — verified and reviewed | HireInCapeTown`
      : `${category.label} in Cape Town | HireInCapeTown`,
    description: inCategory.length
      ? `${inCategory.length} ${category.label.toLowerCase()} across Cape Town, each marked verified or not yet verified. Contact them on WhatsApp or call directly.`
      : `We are verifying our first ${category.label.toLowerCase()} in Cape Town. Every listing has its ID, trading address and trade registration checked before it goes up.`,
    canonical: `/${category.slug}`,
    body: render('Results', {
      category, suburb: null, businesses: inCategory, suburbs,
      heading: `${category.label} in Cape Town`,
      intro: inCategory.length
        ? `Each listing says whether we have checked it. A verified ${category.one} has had their ID, address and trade registration seen by a person; the rest are listed from public details and marked as not yet verified.`
        : `We vet before we publish, so this page fills up slower than a directory that lists whoever asks.`,
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
      title: `${category.label} in ${entry.suburb}, Cape Town — ${n} listed | HireInCapeTown`,
      description: `${n} ${n === 1 ? category.one : category.label.toLowerCase()} serving ${entry.suburb}, each marked verified or not yet verified. WhatsApp or call direct.`,
      canonical: `/${category.slug}/${entry.slug}`,
      body: render('Results', {
        category, suburb: { name: entry.suburb, slug: entry.slug },
        businesses: entry.businesses, suburbs,
        heading: `${category.label} in ${entry.suburb}`,
        intro: `${n} ${n === 1 ? category.one : category.label.toLowerCase()} covering ${entry.suburb} and the surrounding area. Every listing says plainly whether a person has checked it.`,
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
    description: b.status === 'verified'
      ? `${b.name}, verified ${category?.one ?? ''} in ${b.suburbs_served[0]}. ${b.services.slice(0, 3).join(', ')}. ${b.rating_count} reviews from recorded hires.`
      : `${b.name}, ${category?.one ?? ''} in ${b.suburbs_served[0]}. ${b.services.slice(0, 3).join(', ')}. Listed from public details and not yet verified by HireInCapeTown.`,
    canonical: `/business/${b.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: b.name,
      description: b.description,
      ...(b.phone && { telephone: b.phone }),
      // sameAs, not url: `url` below is this listing's canonical page. A second
      // `url` key would silently overwrite it.
      ...(b.website && { sameAs: [b.website] }),
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

// --- the pages linked from every header and footer -------------------------
// These are not optional furniture: they are linked from the site chrome on
// every page, so any one of them missing is a 404 on every page there is.
const INFO = [
  ['list-your-business', 'ListYourBusiness', 'List your business — free on HireInCapeTown',
   'List your Cape Town business free. We check your ID, trading address and trade registration, then customers call or WhatsApp you directly. No listing fee, no commission.'],
  ['how-vetting-works', 'HowVettingWorks', 'How vetting works | HireInCapeTown',
   'What the verified badge means: identity, trading address and trade registration checked at source, with the date we checked. And what we do not check.'],
  ['report', 'Report', 'Report a listing | HireInCapeTown',
   'Report wrong details, a closed business or a bad experience. Listings go to pending while we investigate.'],
  ['privacy', 'Privacy', 'Privacy & POPIA | HireInCapeTown',
   'We set no cookies, run no analytics and store no documents. What we hold about listed businesses, and how to have it corrected or removed.'],
];

for (const [route, page, title, description] of INFO) {
  await emit(route, shell({ title, description, canonical: `/${route}`, body: render(page, {}) }));
}

if (!CONTACT_EMAIL) {
  // These pages exist to be acted on. Shipping them with no way to reply is a
  // worse failure than a 404, because it looks like it works.
  console.warn('\n  ' + '!'.repeat(64));
  console.warn('  ! CONTACT_EMAIL is empty in src/lib/site.js.');
  console.warn('  ! /list-your-business, /report and /privacy have shipped with no');
  console.warn('  ! way for anyone to get in touch. Set it and redeploy.');
  console.warn('  ' + '!'.repeat(64) + '\n');
}

// --- /find: the need-bar's target ------------------------------------------
// A form GET lands here and bounces to the real page, so the need-bar needs no
// JavaScript of its own and no serverless function sits in the hot path.
// The slugs are baked in at build time and the target is checked against them,
// so a crafted ?category=//evil.com cannot turn this into an open redirect.
const knownRoutes = JSON.stringify([
  ...CATEGORIES.map((c) => `/${c.slug}`),
  ...[...index.keys()].map((k) => `/${k}`),
]);

await emit('find', `<!doctype html>
<html lang="en-ZA"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Finding businesses…</title></head><body>
<script>(function(){
  var ok = ${knownRoutes};
  var p = new URLSearchParams(location.search);
  var c = (p.get('category') || '').toLowerCase();
  var s = (p.get('suburb') || '').toLowerCase();
  var slug = /^[a-z0-9-]+$/;
  var target = '/';
  if (slug.test(c)) {
    var want = slug.test(s) ? '/' + c + '/' + s : '/' + c;
    if (ok.indexOf(want) !== -1) target = want;
    else if (ok.indexOf('/' + c) !== -1) target = '/' + c;
  }
  location.replace(target);
})();</script>
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
const { readFileSync, existsSync } = await import('node:fs');
const assets = [js, ...css].reduce((n, f) => n + gzipSync(readFileSync(OUT + f)).length, 0);

// The hero photograph counts. It is already compressed, so it does not gzip
// further — but it is real bytes over a real prepaid bundle, and a budget that
// quietly ignores the largest thing on the page is not a budget. Measured at
// the variant a phone actually fetches, which is the smallest one.
const HERO = `${OUT}/hero/tall-540.avif`;
const heroBytes = existsSync(HERO) ? readFileSync(HERO).length : 0;

const heaviest = pages.reduce((a, b) => (b.bytes > a.bytes ? b : a));
const worstKb = (heaviest.bytes + assets + heroBytes) / 1024;

console.log(`\n  ${pages.length} pages · sitemap · robots.txt`);
console.log(`  assets (gzip): ${(assets / 1024).toFixed(1)} KB  [css + ${(gzipSync(readFileSync(OUT + js)).length / 1024).toFixed(1)} KB js]`);
if (heroBytes) console.log(`  hero photo:    ${(heroBytes / 1024).toFixed(1)} KB  [avif, phone variant]`);
console.log(`  heaviest page: ${heaviest.route} → ${worstKb.toFixed(1)} KB total over the wire`);
if (worstKb > BUDGET_KB) {
  console.error(`\n  ✗ over the ${BUDGET_KB} KB budget. Prepaid data is a real cost — fix this, don't raise the number.\n`);
  process.exit(1);
}
console.log(`  ✓ within the ${BUDGET_KB} KB budget\n`);

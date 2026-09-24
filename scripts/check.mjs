// The guard rails. Runs in CI after the build; a failure blocks the merge.
//
// Every rule here exists because the mistake it catches has already happened
// on this project once, or would have silently shipped. See BLUEPRINT.md,
// "Mistakes that must not repeat".
//
//   node scripts/check.mjs          checks db/seed.json and the built site
//   node scripts/check.mjs --seed   checks db/seed.json only (no build needed)
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '../src/lib/categories.js';

const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- seed.json
const STATUSES = ['pending', 'listed', 'verified', 'rejected'];
const CHECKS = ['id_document', 'proof_of_address', 'trade_registration', 'liability_cover'];
const cats = new Set(CATEGORIES.map((c) => c.slug));
const today = new Date().toISOString().slice(0, 10);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? '') && !Number.isNaN(Date.parse(s));

let seed;
try { seed = JSON.parse(readFileSync('db/seed.json', 'utf8')); }
catch (e) { err(`db/seed.json is not valid JSON: ${e.message}`); seed = []; }
if (!Array.isArray(seed)) { err('db/seed.json must be a list'); seed = []; }

const seen = new Set();
for (const [i, b] of seed.entries()) {
  const at = b?.slug ? `"${b.slug}"` : `entry ${i + 1}`;
  if (!b?.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug)) err(`${at}: slug must be lower-case-with-hyphens`);
  if (seen.has(b.slug)) err(`${at}: duplicate slug`); seen.add(b.slug);
  if (!b.name) err(`${at}: no name`);
  if (!cats.has(b.category)) err(`${at}: category "${b.category}" is not in src/lib/categories.js`);
  if (!STATUSES.includes(b.status)) err(`${at}: status "${b.status}" is not one of ${STATUSES.join(', ')}`);

  const live = b.status === 'verified' || b.status === 'listed';
  const checks = b.checks ?? [];

  // The one that matters most: the badge is the product.
  if (b.status === 'verified' && !checks.length) err(`${at}: marked verified with no checks recorded`);
  if (b.status === 'listed' && checks.length) warn(`${at}: has checks but is only "listed" — should it be verified?`);
  for (const c of checks) {
    if (!CHECKS.includes(c.type)) err(`${at}: unknown check type "${c.type}"`);
    if (!isDate(c.checked_on)) err(`${at}: check "${c.type}" has no valid checked_on date`);
    else if (c.checked_on > today) err(`${at}: check "${c.type}" is dated in the future`);
    else if (c.type === 'trade_registration' && Date.now() - Date.parse(c.checked_on) > 365 * 864e5)
      warn(`${at}: trade registration last checked over a year ago`);
  }

  if (live && !(b.suburbs_served ?? []).length) err(`${at}: live with no suburbs — the build would skip it silently`);
  if (live && !b.phone && !b.whatsapp && !b.website) err(`${at}: live with no phone, WhatsApp or website`);
  if (live && !(b.services ?? []).length) warn(`${at}: no services listed`);
  if (b.whatsapp && !/^27\d{9}$/.test(b.whatsapp)) err(`${at}: WhatsApp "${b.whatsapp}" must be 27 then 9 digits, e.g. 27824319076`);
  if (b.website && !/^https?:\/\//.test(b.website)) err(`${at}: website must start with https://`);
  if (b.promoted && !live) warn(`${at}: promoted but not on the site`);

  for (const [j, r] of (b.reviews ?? []).entries()) {
    const rat = `${at} review ${j + 1}`;
    if (!Number.isInteger(Number(r.rating)) || r.rating < 1 || r.rating > 5) err(`${rat}: rating must be 1 to 5`);
    if (!r.body?.trim()) err(`${rat}: no text`);
    if (r.status && !['published', 'removed'].includes(r.status)) err(`${rat}: status must be published or removed`);
    if (r.date && !isDate(r.date)) err(`${rat}: date is not YYYY-MM-DD`);
  }
}

// ---------------------------------------------------------------- built site
if (!process.argv.includes('--seed')) {
  const OUT = 'dist/client';
  if (!existsSync(OUT)) err('dist/client does not exist — run npm run build first');
  else {
    const files = [];
    const walk = (d) => readdirSync(d).forEach((f) => {
      const p = path.join(d, f);
      statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p);
    });
    walk(OUT);
    const routes = new Set(files.map((f) => '/' + path.relative(OUT, path.dirname(f)).replaceAll(path.sep, '/')).map((r) => r === '/.' ? '/' : r.replace(/\/$/, '') || '/'));

    // Every internal link resolves. Eight dead links shipped before this existed.
    const dead = new Map();
    for (const f of files) {
      for (const [, href] of readFileSync(f, 'utf8').matchAll(/href="(\/[^"#?]*)"/g)) {
        const h = href.replace(/\/$/, '') || '/';
        if (h.startsWith('/assets') || h.startsWith('/hero') || routes.has(h) || existsSync(path.join(OUT, h))) continue;
        dead.set(h, path.relative(OUT, f));
      }
    }
    for (const [h, f] of dead) err(`dead link ${h} (from ${f})`);

    // Netlify only registers forms it can see in the deployed HTML.
    for (const [route, name] of [['list-your-business', 'business-listing'], ['review', 'review'], ['report', 'report']]) {
      const f = path.join(OUT, route, 'index.html');
      const html = existsSync(f) ? readFileSync(f, 'utf8') : '';
      if (!/data-netlify="true"/.test(html) || !html.includes(`name="form-name" value="${name}"`))
        err(`/${route} is missing its Netlify form "${name}"`);
    }
  }
}

// ---------------------------------------------------------------- report
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);
console.log(`\n  check: ${seed.length} listings, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length) { console.error('  Fix the FAIL lines above. Nothing ships until they are gone.\n'); process.exit(1); }

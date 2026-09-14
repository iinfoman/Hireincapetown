# HireInCapeTown

A vetted marketplace for hiring local businesses in Cape Town.
Strategy and decisions live in [`BRIEF.md`](BRIEF.md); the visual design lives in
[`design/`](design/) and on the [design canvas](https://claude.ai/code/artifact/06567147-3f01-495f-bcbc-3b1640744ac4).

## How this is built, and why

**The public site is static.** Every browse, category and business page is
generated at build time and shipped as HTML. React renders them during the
build and is not sent to the browser at all — the only client-side JavaScript is
`src/client.js`, currently under 2 KB.

That is a deliberate response to the audience: most visitors are on prepaid
mobile data, where every kilobyte is a real cost. The build fails if the
heaviest page exceeds **180 KB gzipped** including CSS and JS. It currently
lands around 11 KB.

The one thing that cannot be prerendered is **"open now"** — it depends on when
the visitor looks. The build emits each business's hours and the browser works
it out. Without JavaScript every listing simply shows, which is the right
fallback for a directory.

Authenticated flows (business dashboard, admin queue, review submission) will be
a normal React app on their own routes, where the framework cost buys something.

## Getting started

```bash
npm install
npm run build        # builds into dist/client
npm run preview
```

**No database is required to build.** Without `DATABASE_URL`, the build reads
[`db/seed.json`](db/seed.json), so a fresh clone produces a working site with no
credentials. Set `DATABASE_URL` and the same build reads Neon instead — the
only read path is `src/data/source.js`.

## Setting up the database

```bash
cp .env.example .env          # then fill in DATABASE_URL from the Neon console
npm run db:push               # applies db/migrations/0001_init.sql
npm run db:seed               # loads db/seed.json into Neon (idempotent)
```

Two parts of the schema are load-bearing and should survive refactoring:

- **`reviews` carries a composite foreign key to `hires (id, business_id, user_id)`,
  with `hire_id` unique.** A review unbacked by a recorded hire between that exact
  author and that exact business cannot exist, and one hire yields one review.
  The fraud defence is a database constraint, not a code path someone can forget.
- **`verification_docs` stores a Cloudflare R2 object key** — never the file, never
  a URL. See the POPIA section of the brief.

## Layout

```
db/migrations/     schema, applied with npm run db:push
db/seed.json       seed businesses; also the build's no-credentials fallback
design/            design canvas artboards + tokens
scripts/prerender.mjs   turns the React pages into static HTML, enforces the budget
src/data/source.js      the single read path: Neon, or seed.json
src/lib/hours.js        "open now" — the one thing computed in the browser
src/pages/              Home, Results (category and category x suburb), Business
```

## Not built yet

Business registration, the admin approval queue, review submission, the
one-to-many quote request, and the Netlify Functions API that will back them.
The public directory works without any of it, which is why it came first.

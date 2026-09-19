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
credentials. Set `DATABASE_URL` and the same build reads Supabase instead — the
only read path is `src/data/source.js`.

## The database is shared — read this before touching it

This app's tables live in the **`hireincapetown` schema of the SolarinstallersSA
Supabase project** (`alogcohoopgzerrxheiw`). Solar owns `public` and has its own
`installers`, `ads`, `reviews` and `settings` tables. Both apps have a table
called `reviews`; the schema split is the only thing keeping them apart.

Two rules, always:

1. **Never run unqualified DDL.** Every statement names the schema. A bare
   `create table businesses` lands in Solar's `public`.
2. **Never alter or drop anything in `public`.** That is a different application.

Consequences worth knowing: a pause or a restore-from-backup hits **both** apps
together, and `auth.users` is shared — a Solar account is an account here too.
Membership of this app is a row in `hireincapetown.profiles`, and every policy
checks that via `is_member()`, never "is signed in".

```bash
cp .env.example .env          # DATABASE_URL from Supabase → Connect → Session pooler
npm run db:push               # applies db/migrations/0001_init.sql
npm run db:sync               # pushes db/seed.json into the schema, idempotent
```

`db/seed.json` is the source of truth and the database is a replica of it, never
the other way round. The sync only ever reads the file and writes the database,
so a scheduled run can never overwrite a listing someone just added by hand.
`.github/workflows/sync-db.yml` runs it every three days, which doubles as the
keep-alive that stops the free tier pausing the project.

Three parts of the schema are load-bearing and should survive refactoring:

- **`reviews` carries a composite foreign key to `hires (id, business_id, user_id)`,
  with `hire_id` unique.** A review unbacked by a recorded hire between that exact
  author and that exact business cannot exist, and one hire yields one review.
  The fraud defence is a database constraint, not a code path someone can forget.
  Verified against the live database: a review inserted with a fabricated
  `hire_id` is rejected with a foreign key violation.
- **`verification_docs` stores a Storage object path** — never the file, never a
  URL. RLS is on with *no policy at all*, so every client role is denied by
  construction. See the POPIA section of the brief.
- **The schema is not granted to `anon` or `authenticated`.** Client roles cannot
  see into it at all; the build reads as the owner. When the authenticated flows
  arrive, grant deliberately and narrowly rather than opening the schema.

## Layout

```
db/migrations/     schema, applied with npm run db:push
db/seed.json       seed businesses; also the build's no-credentials fallback
design/            design canvas artboards + tokens
scripts/prerender.mjs   turns the React pages into static HTML, enforces the budget
src/data/source.js      the single read path: Supabase, or seed.json
scripts/sync-db.mjs     pushes seed.json into the database; also the keep-alive
src/lib/hours.js        "open now" — the one thing computed in the browser
src/pages/              Home, Results (category and category x suburb), Business
```

## Not built yet

Business registration, the admin approval queue, review submission, the
one-to-many quote request, and the Netlify Functions API that will back them.
The public directory works without any of it, which is why it came first.

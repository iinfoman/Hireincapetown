# HireInCapeTown — Build Brief

**One line:** Not a directory. A *find-someone-now* marketplace for Cape Town, where the trust layer is the product.

> Planning context, not code. Design direction lives in `design/` and on the
> canvas: https://claude.ai/code/artifact/06567147-3f01-495f-bcbc-3b1640744ac4

## Positioning (decided)

Don't ship "Cape Town Business Directory" — that's the thing being competed away.
Ship **"Find local. Hire with confidence."**

The whole product is one sentence, and every screen is one step of it:

> **I need something → show me who can do it → contact them now.**

Closer in feel to Google Maps + Thumbtack + WhatsApp than to Yellow Pages. Generic
directories are lists; this is vetted, and it knows who's *open right now*.

## The wedge

- **Business verification** — ID, proof of address, trade registration where it applies
  (PIRB for plumbers, sparkies, gas). The Verified badge is the core signal.
- **Reviews with fraud protection** — only from users with a recorded hire. Eleven honest
  reviews beat four hundred bought ones, and the UI says so out loud.
- **Dispute/report path** — flag a scam listing, admin queue that acts on it.
- **Open now** — the live availability layer. For emergency trades this is the killer
  feature, and no incumbent has it.

## Stack (decided)

- **Tier 2 app:** React + Vite + Tailwind, GitHub → Netlify.
- **Database: Supabase, sharing the `SolarinstallersSA` project**
  (`alogcohoopgzerrxheiw`, eu-west-1). HireInCapeTown lives in its own Postgres
  schema, `hireincapetown`; Solar keeps `public` and is untouched.
- **Auth: Supabase Auth — shared with Solar.** `auth.users` is one table per
  project, so a Solar account is an account here too. Membership of this app is a
  row in `hireincapetown.profiles`, and every policy checks that, never "is signed
  in". `is_member()` and `is_admin()` exist for exactly this reason.
- **File storage: a private Supabase Storage bucket** for verification documents.
- The dormant `hire in capetown` project (`adexrspbgcsnumcgpzgq`) is now unused.

### Why this shape, and what it costs

The free plan allows 2 active projects and auto-pauses anything idle for about a
week. Sharing one project with Solar keeps both apps inside that budget. These
are the costs, accepted knowingly:

- **One lifecycle.** If the shared project pauses or is restored from backup,
  BOTH sites pause or roll back together. There is no way to move one without
  the other.
- **One user pool.** Handled by the membership rule above, but it must never be
  forgotten in a new policy.
- **One blast radius.** HireInCapeTown holds ID documents. They now sit in the
  same project as an unrelated solar directory.
- **Harder to separate later.** Mitigated by the schema split: `pg_dump
  --schema=hireincapetown` lifts this app out whole if it ever needs its own home.

### The architectural consequence

Build-time reads use a **direct Postgres connection**, not PostgREST, so the
`hireincapetown` schema does not need to be exposed over the API for the public
site to work — and while it stays unexposed, no client can reach these tables at
all. When the authenticated flows arrive, either expose the schema in
Settings → API, or put them behind Netlify Functions with the service role.

### What barely matters, because of prerendering

Public pages are generated at build time (see SEO below), so the database does
almost no runtime work. Storage is the limit to watch, and it is shared with
Solar — which is another reason verification documents must be pruned on a
retention schedule, not kept forever.

## MVP scope (build this, nothing more)

1. Public browse/search by **category** and **suburb**, with an **Open now** filter.
2. Business detail page: services, areas served, verification detail, reviews,
   **WhatsApp "Get a quote"** (SA default — not a contact form).
3. Business self-registration → **admin approval queue**. This is where vetting happens.
4. Admin dashboard: approve/reject, handle reports.
5. Verified reviews tied to a recorded hire.
6. **One-to-many quote request** — describe the job once, it fans out to open verified
   businesses nearby. This is the lead-gen model's actual surface, and the answer to
   "I don't want to phone around."

**Later, not now:** payments, featured placements, in-app messaging, mobile app,
auto-generated mini-sites per business.

## Data model — Postgres

Full DDL in `db/migrations/0001_init.sql`. Two parts of it are load-bearing:

**Reviews are gated by a composite foreign key, not by application code.**
`reviews` references `hires (id, business_id, user_id)` as a triple, and `hire_id`
is unique. A review that isn't backed by a recorded hire between that exact author
and that exact business cannot physically exist, and one hire can yield one review.
The fraud defence is a database constraint — there is no code path to forget.

**Ratings are a denormalised column kept in step by a trigger**, so the directory
never computes an average across a table to render a card.

Tables: `profiles`, `businesses`, `hires`, `reviews`, `verification_docs`,
`reports`, `quote_requests`, `quote_request_recipients`.

The one hot query — category + suburb, best-rated first — is served by a GIN index
on `suburbs_served` plus a `(status, rating_avg desc)` index.

## Access control

RLS is on for every table, default deny, and the public internet may read
verified listings and nothing else.

- `businesses`: public read **only where `status = 'verified'`**. Owners and
  admins see their own pending and rejected rows.
- `reviews`: insert allowed only when the referenced hire belongs to the author
  and to that business — the same rule the composite foreign key enforces,
  restated at the row level.
- `verification_docs`: **RLS on and no policy at all.** Nothing grants access, so
  every client role is denied by construction. Reachable only server-side with
  the service role.
- Because `auth.users` is shared with Solar, no policy may treat "signed in" as
  "belongs here". Use `hireincapetown.is_member()`.

## Compliance — POPIA (the most commonly-missed piece)

Collecting IDs and proof of address makes this personal information with real duties:

- Explicit consent + a privacy policy stating what's collected and why.
- **Verification documents live in a private Supabase Storage bucket** with no
  public access. The admin UI reaches them through a short-lived signed URL minted
  server-side; the browser never holds a durable link. Postgres stores the object
  path, the type, and the date checked — never the file.
- The bucket is **private and separate from anything Solar uses**. Since the two
  apps now share a project, bucket separation plus RLS is the only thing keeping
  ID documents out of the other app's reach — treat it as load-bearing.
- **The UI never displays an ID document.** It displays the *date it was checked.*
- A retention/deletion policy and a working deletion request path. Deleting a
  business must delete its R2 objects, not just its rows.
- Mishandling ID documents is legal exposure, not a polish item.

## SEO — this is how a directory actually gets traffic

- **Programmatic local pages:** one prerendered, indexable page per `category × suburb`
  — "Plumbers in Claremont", "Cleaners in Bellville". This is the whole engine.
- Surfaced in the UI too (see the desktop home artboard), not just in a sitemap.
- Clean URLs, per-page title/meta, `LocalBusiness` structured data, sitemap.
- Real content per page. Google ignores thin directory pages.

## Monetization (design for it, don't build it yet)

- **Free basic listing** — get supply on board first.
- **Paid Verified + Featured** — top of a category/suburb page, ~R150–R350/month.
  Sell it with the real number: "421 people searched this page last month."
- **Lead fee** later, once quote-request volume is real.
- SA rails: **Yoco, PayFast or Paystack** (recurring supported). Not Stripe.

## Cold-start (the risk nobody plans for)

A directory with no listings is useless, and businesses won't join an empty one.

- Manually seed 20–30 real verified businesses per top category before launch.
- Launch **one category + a few suburbs deep**, not all of Cape Town shallow.
- Southern Suburbs plumbers is the obvious beachhead — the design is drawn around it.

## Design system

Full spec in `design/StyleTile.dc.html`; tokens in `design/_tokens.md`.

- **Protea `#A8325A`** is the brand and the single primary action. Deliberately not
  green, so that **fynbos `#0F6B4F`** can mean *verified/open* and nothing else, and
  **WhatsApp `#25D366`** (with ink text, for AA contrast) can mean WhatsApp.
  Amber `#E8A317` is stars only.
- Bricolage Grotesque / Karla. 44 px minimum hit targets. WCAG AA — customers skew older.
- Trust is a **ladder**, not a badge: verified → partially checked → listed-not-yet-checked.
  Never red for "new" — a new business isn't a suspect.
- Rands, not ranges. "Callout R450" beats "affordable rates".
- WhatsApp is the primary contact everywhere. Contact forms are a last resort.

## Working with the database from Claude

The Supabase connector is available in this session, so schema changes can be
applied directly. Everything is also committed as SQL, which is the source of
truth: `db/migrations/0001_init.sql`.

Because the project is shared, two rules when applying anything:

1. **Never run unqualified DDL.** Every statement names the `hireincapetown`
   schema. A bare `create table businesses` would land in Solar's `public`.
2. **Never drop or alter anything in `public`.** That is Solar's app.

## First moves

1. Apply `db/migrations/0001_init.sql` to the shared project (creates the
   `hireincapetown` schema — nothing in `public` is touched).
2. Create the private Storage bucket for verification documents.
3. Scaffold is done: Vite + React + Tailwind using `design/_tokens.md`.
4. Public browse, category × suburb pages and business profiles are **built** and
   prerendered, reading the database at build time. No client-side database
   access on these routes.
5. Next: the auth flow and registration → admin approval → quote-request fan-out.

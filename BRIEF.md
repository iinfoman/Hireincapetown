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
- **Database: Neon** — serverless Postgres. Free plan gives **100 projects**
  (against Supabase's 2 active), 0.5 GB storage and 100 CU-hours per project.
  Compute suspends after 5 min idle and wakes automatically in under a second —
  it is *not* the manual unpause that made Supabase painful across many clients.
- **Auth: Neon Auth** (Managed Better Auth, 60k MAU free). Low lock-in on purpose:
  it is the Better Auth library managed for you, so if the managed service
  disappoints, self-hosting the same library against the same database is the
  escape hatch — not a migration.
- **File storage: Cloudflare R2**, *not* Neon Object Storage. See POPIA below.
- The old Supabase project `adexrspbgcsnumcgpzgq` is now unused — leave it paused
  or delete it.

### The architectural consequence, stated up front

Supabase and Firebase let the browser talk to the database directly, with RLS or
security rules standing guard. **Neon does not work that way, and must not be made
to.** A Postgres connection string in client code is a full-database credential.

So the app grows a thin server layer: **Netlify Functions** using
`@neondatabase/serverless` (HTTP, not TCP — it works in a serverless runtime).
Every write and every authenticated read goes through a handler that checks who
is asking. Postgres RLS stays on underneath as defence in depth, but the API
handlers are the real gate.

This is more code than Supabase gave us for free, and it is the honest price of
the move. It buys back the relational model, a much lighter client bundle, and
100 project slots.

### What barely matters, because of prerendering

Public pages are generated at build time (see SEO below), so the database does
almost no runtime work. The free-tier compute and egress allowances are not a
constraint we will come near at launch — the 0.5 GB storage cap is the one to
watch, and it is why files live in R2.

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

Postgres RLS plus checks in the Netlify Function handlers:

- Public reads see `businesses` **only where `status = 'verified'`**. Pending and
  rejected listings are visible to their owner and to admins, nobody else.
- Review creation is structurally impossible without the matching hire (above).
- `verification_docs` is admin-only at every layer, and the API never returns
  `r2_key` to a browser.
- Role lives on `profiles.role` and is read server-side per request.

## Compliance — POPIA (the most commonly-missed piece)

Collecting IDs and proof of address makes this personal information with real duties:

- Explicit consent + a privacy policy stating what's collected and why.
- **Verification documents live in a private Cloudflare R2 bucket** with no public
  access. The admin UI reaches them through a short-lived signed URL minted
  server-side; the browser never holds a durable link. Postgres stores the object
  key, the type, and the date checked — never the file.
- **Deliberately not Neon Object Storage**, which is still in beta. Everything else
  in this stack can be beta; the bucket holding copies of people's identity
  documents cannot. R2 is S3-compatible and mature, and effectively free at this volume.
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

## Working with Neon from Claude

Neon is not in claude.ai's connector directory either. It doesn't need to be —
the schema is a committed `.sql` file, applied with `psql` or any migration
runner. That is the whole workflow, and it works from any session.

Neon's branching is the useful trick here: fork the database (schema *and* data)
per preview deploy, test a migration against real data, throw the branch away.
10 branches per project on the free plan.

## First moves

1. Create the Neon project and apply `db/migrations/0001_init.sql`.
2. Create the private R2 bucket for verification documents.
3. Scaffold Vite + React + Tailwind with the tokens in `design/_tokens.md`.
4. Build the public browse + business detail + WhatsApp quote — the part that
   delivers value with no listings logic — as **prerendered static pages**, reading
   Neon at build time. No client-side database access at all on these routes.
5. Stand up the Netlify Functions API and the auth flow; only then registration →
   admin approval → the quote-request fan-out.

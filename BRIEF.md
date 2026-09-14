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
- **Database/auth/storage: Firebase** (Firestore + Firebase Auth + Cloud Storage).
  Replaces the earlier Supabase plan. Netlify still hosts; Firebase is backend only.
- **Blaze (pay-as-you-go) plan required** — Cloud Functions are needed for rating
  aggregation, admin custom claims and lead fan-out. Spark alone won't cover it.
- The old Supabase project `adexrspbgcsnumcgpzgq` is now unused — leave it paused or delete it.

### The one real cost of choosing Firebase

The modular Firebase SDK is heavier than `supabase-js` — roughly 150 KB gzipped for
app + firestore + auth, against ~40 KB. Against a *prepaid-data* audience that is a
genuine regression, and it's the project's stated top constraint. **Measure it, don't
assume it.**

Mitigation, which the SEO plan wants anyway: **prerender every public page at build
time.** Read Firestore in the Vite build, emit static category × suburb pages and
business profiles. Then the SDK only ships to authenticated flows — dashboard, admin,
review submission, quote requests. Most visitors never load Firebase at all.

Budget: **180 KB on first load** for public pages.

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

## Data model — Firestore (document, not relational)

The relational sketch does not port directly. Denormalize deliberately:

- `businesses/{id}` — name, category, `suburbs_served: []`, description, contact,
  whatsapp, status (pending|verified|rejected), ownerUid, `ratingAvg`, `ratingCount`,
  `isOpenNow`, `hours`.
  Denormalized aggregates (`ratingAvg`/`ratingCount`) are maintained by a Cloud
  Function or a transaction — never computed client-side across a collection.
- `businesses/{id}/reviews/{reviewId}` — subcollection. rating, body, authorUid,
  hireId, status.
- `hires/{uid}_{businessId}` — the proof-of-transaction. Deliberately a composite key
  so a security rule can gate review writes with a single `exists()` lookup.
- `verificationDocs/{businessId}/{docId}` — metadata only. See POPIA below.
- `reports/{id}` — businessId, reporterUid, reason, status.
- `profiles/{uid}` — role (user|business|admin). Role also mirrored into an Auth
  **custom claim**, because security rules must not pay a document read per check.

**Indexes** (`firestore.indexes.json`, committed): the core query is
`category == X AND suburbs_served array-contains Y ORDER BY ratingAvg desc` — that
needs a composite index, and it will fail loudly in production without one.

## Security rules replace RLS

- Public read on `businesses` **only where `status == "verified"`**. Pending and
  rejected listings are invisible to everyone but their owner and admins.
- Review create allowed only if `exists(/hires/$(uid)_$(businessId))`. This is the
  fraud defence, and it belongs in the rules, not the client.
- `profiles` self-read/write, role field admin-only.
- Rules are committed, reviewed and tested (`firebase emulators:exec`) — they are the
  actual access-control layer, not a formality.

## Compliance — POPIA (the most commonly-missed piece)

Collecting IDs and proof of address makes this personal information with real duties:

- Explicit consent + a privacy policy stating what's collected and why.
- Verification docs in **Cloud Storage with a deny-all client read rule** — retrieved
  only server-side through the Admin SDK, never a public or long-lived URL. Firestore
  holds metadata (type, checked-on date, reviewer), never the document itself.
- **The UI never displays an ID document.** It displays the *date it was checked.*
- A retention/deletion policy and a working deletion request path.
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

## Working with Firebase from Claude

There is **no Firebase connector** in claude.ai's connector directory. Firebase ships
its own MCP server in the CLI instead — on a local machine, in this folder:

```
claude mcp add firebase npx -- -y firebase-tools@latest mcp
```

Optionally scoped with `--only auth,firestore,storage`. It authenticates from your
local `firebase login`, so it does not work in a remote/web session.

It's also largely optional: there's no schema migration to apply, and `firestore.rules`,
`firestore.indexes.json`, `storage.rules` and the seed script are just files in this
repo, shipped with `firebase deploy`.

## First moves

1. Create the Firebase project, enable Firestore + Auth + Storage, upgrade to Blaze.
2. Scaffold Vite + React + Tailwind with the tokens above.
3. Build the public browse + business detail + WhatsApp quote — the part that delivers
   value with no listings logic at all — as **prerendered static pages**.
4. Write and emulator-test `firestore.rules` and `storage.rules` before any real ID
   document is ever uploaded.
5. Then registration → admin approval → the quote-request fan-out.

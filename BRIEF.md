# Hire in Cape Town — Build Brief

**One line:** A *vetted* directory where Cape Town residents hire trusted local businesses — the trust layer is the product, not the listings.

> This brief was prepared in a separate planning session. The dedicated build session
> for this repo should start here. It is planning context, not code.

## Stack (decided — don't re-litigate)
- **Tier 2 app:** React + Vite + Tailwind + Supabase, GitHub → Netlify. Mirrors the `solar-directory` repo exactly, so patterns carry over.
- **Database already exists:** Supabase project **"hire in capetown"**, ref `adexrspbgcsnumcgpzgq` (currently paused — wake it first thing).
- **Mobile-first, strict performance budget.** Most users are on prepaid data. Every KB is a real cost.

## The wedge (why this beats Yellow Pages / Yep)
Generic directories are lists. **Yours is vetted.** That's the entire reason to exist:
- **Business verification** — ID, proof of address, trade licence where relevant (electricians, plumbers, gas). A "Verified" badge is the core trust signal.
- **Reviews with fraud protection** — only from users with a recorded hire, to kill fake reviews (the plague of SA listings).
- **Dispute/report path** — a way to flag a scam listing, and an admin queue that acts on it.

## MVP scope (build this first, nothing more)
1. Public directory: browse/search by **category** (plumber, electrician, cleaner, builder…) and **suburb** (Claremont, Bellville, Sea Point…).
2. Business detail page: services, area served, contact, **WhatsApp "Get a quote"** button (SA default, not a contact form), verified badge, reviews.
3. Business self-registration → **admin approval queue** (this is where vetting happens).
4. Admin dashboard: approve/reject listings, handle reports.
5. Verified reviews tied to a hire.

**Later, not now:** payments, featured placements, in-app messaging, mobile app.

## Data model (starting sketch — the empty DB is ready for it)
- `businesses` (name, category, suburbs_served, description, contact, whatsapp, status: pending/verified/rejected, owner_user_id)
- `verification_docs` (business_id, type, file ref, reviewed_by) — **sensitive, see POPIA below**
- `reviews` (business_id, user_id, rating, body, hire_id, status)
- `hires` (business_id, user_id, date) — the proof-of-transaction that gates reviews
- `reports` (business_id, reporter_id, reason, status)
- `profiles` (Supabase auth users + role: user/business/admin)

## Monetization (design for it, don't build it yet)
Directories make money from **businesses, not browsers**:
- **Free basic listing** (get supply on board first — see cold-start below).
- **Paid "Verified + Featured"** — top of category/suburb, ~R150–R350/month.
- **Lead fee** option later (pay per quote request).
- SA payment rails when you get there: **Yoco, PayFast, or Paystack** (recurring supported). Not Stripe — card-only SA coverage is poor.

## SEO (this is how a directory actually gets traffic — plan it from day one)
- **Programmatic local pages:** one indexable page per `category × suburb` — "Plumbers in Claremont", "Cleaners in Bellville". This is the whole SEO engine for a directory.
- Clean URLs, per-page title/meta, `LocalBusiness` structured data, a sitemap.
- Real content per page, not empty templates (Google ignores thin directory pages).

## Compliance — POPIA (the most commonly-missed piece)
You're collecting IDs and proof-of-address. Under **POPIA** that's personal information with real obligations:
- Explicit consent + a privacy policy stating what you collect and why.
- Verification docs stored securely (Supabase Storage with row-level security, not public).
- A retention/deletion policy and a way for people to request deletion.
- This isn't optional polish — mishandling ID documents is a legal exposure.

## The risk nobody plans for: cold-start
A directory with no listings is useless, and businesses won't join an empty directory — **chicken and egg.** Plan the seed:
- Manually seed 20–30 real, verified businesses per top category before any public launch (the same playbook used on `solar-directory`).
- Launch **one category + a few suburbs** deep, not all of Cape Town shallow.

## Design direction
- **Trade-appropriate, trustworthy, not flashy.** Verification badges and reviews are the visual hierarchy — trust reads at a glance.
- Avoid the generic-directory look (three equal cards, stock icons). Real SA business names, real suburbs, Rand pricing, untidy real numbers.
- WCAG AA contrast — customers skew older.

## First moves for the dedicated session
1. Wake Supabase `adexrspbgcsnumcgpzgq`, confirm it's empty, apply the schema above.
2. Scaffold the Vite app (copy `solar-directory`'s setup — it's proven).
3. Build the public browse + business detail + WhatsApp quote first (the part that delivers value with zero listings logic).
4. Then registration → admin approval.

---

*Gaps this brief closes vs. the original idea: POPIA/legal, dispute handling, the cold-start seeding problem, and the SEO page structure.*

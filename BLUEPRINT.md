# Blueprint — a directory that runs itself

Read this first, before building anything, in any session, with any helper.
It is the plan, the money model, the rules, and every mistake already paid for.

---

## 1. What exists today

| Piece | Where | Status |
|---|---|---|
| Public site, 43 pages, 12 listings | hireincapetown.co.za | Live |
| Dashboard: edit everything, save to GitHub | /tools/dashboard (password) | Live |
| Forms: list business, review, report | Netlify -> Forms | Live, 100/month free |
| Promoted placement, reviews, moderation | dashboard | Live |
| Guard rails that block bad data and dead links | scripts/check.mjs in CI | Live |
| Database (Supabase, shared with Solar) | hireincapetown schema | Optional, kept warm |

Cost to run: **R0 a month** plus the domain.

## 2. The one gap: submissions are retyped by hand

Today: submission -> Netlify email -> you read it -> you retype it in the
dashboard -> Save. Everything below closes that gap, cheapest first.
**Do them in this order and stop when it is enough.**

**Step A — Inbox tab in the dashboard (one session).**
The dashboard reads Netlify Forms submissions directly and shows an
**Import** button on each: "Create listing", "Publish review", "Mark
handled". Two minutes per item becomes fifteen seconds. Needs a Netlify
personal access token stored in your browser, like the GitHub one.
*Unverified risk:* Netlify's API may refuse calls from a browser page. Test
this first; if refused, go to Step B.

**Step B — Weekly housekeeping robot (one session, free).**
A scheduled GitHub Action every Monday opens an issue listing: trade
registrations due for re-check, live listings with no phone, promoted
listings whose paid month has ended, unanswered reports. No database needed.

**Step C — Live database (two to three sessions). Only past ~20 submissions a week.**
Forms write straight into Supabase. Dashboard signs in with Supabase Auth
and approves with one click; approval triggers a Netlify build hook. The
schema, row-level security and keep-alive already exist. The cost is a
moving part that must stay awake — which is why it is last.

Not planned, on purpose: customer accounts, businesses editing their own
listings, online payments inside the site. Each is weeks of work and none
earns money before you have traffic.

## 3. Money, in the order it becomes possible

| # | Product | Suggested price | Needs first |
|---|---|---|---|
| 1 | **Promoted listing** — top of category, labelled | R150–R350/month | Built. Needs traffic numbers to sell. |
| 2 | **Category sponsor banner** — e.g. a solar company | R500–R1,500/month | Small build. One per page, labelled "Sponsored". |
| 3 | **Pro listing** — photos, logo, WhatsApp button first | R99/month | Small build. |
| 4 | **Paid leads** — customer asks for quotes, business pays per lead | R25–R60 per lead | Volume. Schema exists (`quote_requests`). |

Prices are starting points, not research. Test and adjust.

**How to collect money without building anything:** invoice and EFT for the
first ten clients. Then Payfast or Yoco *payment links* — you create a link
in their dashboard and WhatsApp it. No code until manual invoicing hurts.

**Rules that protect the income:**
- **Never sell the verified badge, a review, or its removal.** The day that is
  for sale, nothing on the site is worth paying for.
- Every paid placement is labelled. Always.
- Cap promoted slots at three per category, or "top" means nothing.
- Keep an advertiser's end date in the dashboard; take it down on time.

## 4. Mistakes that must not repeat

Every line below happened on this project. Most are now blocked by
`scripts/check.mjs`; the rest are rules.

**Building**

| Mistake | Now |
|---|---|
| Invented businesses with dialable numbers went live | Never invent listings. Only first-hand sources. |
| 8 links pointed at pages that did not exist, from launch | **Blocked** — CI fails on any dead link |
| Site claimed things that were not true ("verified", "reviews only from hires", "no password set") | Every sentence on the site must match what the code does. Check copy in every review. |
| A rating was stored next to the reviews it came from | Derive, never store, anything computable |
| CI counted pages, so a content change failed the build | Test structure, not numbers that move with content |
| Open redirect and script injection almost shipped | Tests exist; review every change before merge |
| "noindex" treated as private | Private means a password at the edge |
| Web-search data was mostly lead-generation middlemen | Facebook groups, referrals, van signs. Not search. |
| Told you the wrong Netlify URL | Confirm a path exists before giving it |
| Forms and password only worked after a rebuild | Any Netlify setting change needs a redeploy, then a test |

**Running it (you)**

- Names are exact and case-sensitive: `TOOLS_PASSWORD`, not `Tools_password`.
- After changing anything in Netlify settings: **Deploys -> Trigger deploy**, then check it.
- A complaint gets **Removed**, not Deleted. Keep the record.
- Owner asks to be taken down: same day, no argument.
- Never paste a password or token into a chat.
- Tell every business you list, before they find out.

**For any AI helper working in this repo**

- Heredocs can write invisible line-separator characters (U+2028) that break
  JavaScript. Run the line-separator check on anything written that way.
- `git checkout <file>` throws away uncommitted edits to it.
- `pkill -f <pattern>` can match and kill its own shell.
- This sandbox blocks most outbound websites; Netlify previews cannot be opened.
- Playwright: `executablePath: '/opt/pw-browsers/chromium'`.
- Drive changes in a real browser before calling them done.

## 5. Checking

**Automatic, on every change (CI):** unit tests; build; 180 KB page budget;
`scripts/check.mjs` — listing rules, dead links, Netlify forms present;
every category and info page emitted. Red CI means nothing ships.

**Manual, two minutes after anything merges:**
1. Open the home page, one category, one business page.
2. Submit nothing — just confirm the three forms load.
3. If a Netlify setting changed: trigger a deploy first.

Run locally any time: `npm run verify`.

## 6. Missing, in priority order

1. **Analytics.** You cannot sell a promoted slot without visitor numbers.
   Cloudflare Web Analytics is free and sets no cookies. Update the privacy
   page in the same change — it currently says there is no analytics.
2. **Google Search Console** — verify the domain, submit `/sitemap.xml`.
   Free, and the single biggest traffic lever for a directory.
3. **Terms of use** — you connect people, you do not contract the work, you
   are not liable for it; paid placement is labelled; how takedowns work.
   Have someone who knows South African consumer law look at it.
4. **POPIA admin** — register an Information Officer with the Information
   Regulator, and confirm whether you need a PAIA manual.
5. **Real phone and WhatsApp numbers** on the 12 listings. Most have none.
6. **Email that arrives** — check SPF and DKIM on the IONOS domain so replies
   from info@ do not land in spam.
7. **Uptime alert** — UptimeRobot, free, emails you if the site goes down.
8. **Photos or logos** on listings.
9. Leftovers: delete the unused old Supabase project; check the IONOS web
   hosting package is not still billing.

Done since this list was first drawn up: 404 page, WhatsApp link preview image.

## 7. Working with Claude without wasting tokens

- Start every session with: *"Read BLUEPRINT.md and HANDOVER.md first."*
- One task per message, named precisely: *"Build Step A"* beats *"improve the dashboard"*.
- Say *"short answer"* when you want one.
- Send a screenshot instead of describing a screen.
- Ask for a plan before a big build, not after.

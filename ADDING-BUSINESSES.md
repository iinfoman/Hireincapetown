# Adding a business — with nothing but a web browser

No code editor, no terminal, no AI subscription, no developer. Everything below
happens on github.com, and the site rebuilds itself within about a minute.

This is how you get from 14 invented listings to the 20–30 real ones the
project actually needs.

This file is the **mechanics** — where the fields go and how to commit. For the
part that matters, finding businesses and checking that they are what they claim
to be, see **[VETTING.md](VETTING.md)**. Do that first; this is where the result
gets typed up.

---

## The easy way: use the form

**[hireincapetown.co.za/tools/new-listing/](https://hireincapetown.co.za/tools/new-listing/)**

Fill it in, press **Copy**, paste into `db/seed.json` on GitHub, commit. The form
writes the JSON for you, so there are no commas to get wrong, and it converts
the WhatsApp number into the format the site needs — type `082 431 9076` and it
saves `27824319076`, which is the mistake most worth not making.

The page is `noindex`, so it will not appear in search results. Bookmark it.

If you would rather type the JSON by hand, the rest of this file explains every
field.

## The loop, by hand

1. Go to **[db/seed.json](https://github.com/iinfoman/Hireincapetown/blob/main/db/seed.json)**
2. Click the **pencil icon** (top right of the file)
3. Add your business (copy the template below)
4. Scroll down, click **Commit changes**
5. Wait about a minute. The site updates itself.

That's it. If you make a mistake the build fails, the old site stays up, and
nothing breaks for visitors — GitHub emails you that it failed.

## The template

Copy this, paste it just after the opening `[` at the very top of the file, and
fill it in. **Keep the comma after the closing `}`.**

```json
  {
    "slug": "kritzinger-plumbing-diep-river",
    "name": "Kritzinger Plumbing & Drains",
    "category": "plumbers",
    "suburbs_served": ["Diep River", "Plumstead", "Bergvliet"],
    "services": ["Burst pipes", "Blocked drains", "Geyser replacement"],
    "description": "Two vans, running out of Diep River since 2009. Burst pipes get priority over scheduled work.",
    "phone": "021 712 4408",
    "whatsapp": "27824319076",
    "status": "verified",
    "rating_avg": null,
    "rating_count": 0,
    "callout_from": 450,
    "hours": {
      "mon": ["07:30", "17:00"],
      "tue": ["07:30", "17:00"],
      "wed": ["07:30", "17:00"],
      "thu": ["07:30", "17:00"],
      "fri": ["07:30", "17:00"],
      "sat": ["08:00", "13:00"],
      "sun": null,
      "emergency24h": true
    },
    "checks": [
      { "type": "id_document", "checked_on": "2026-09-17" },
      { "type": "proof_of_address", "checked_on": "2026-09-17" },
      { "type": "trade_registration", "checked_on": "2026-09-17", "label": "PIRB plumber registration" }
    ]
  },
```

## Field by field

| Field | What to put |
|---|---|
| `slug` | The web address. Lowercase, hyphens only, no spaces. Business name + suburb works well. **Must be unique.** |
| `name` | Exactly as the business writes it. |
| `category` | One of: `plumbers`, `electricians`, `cleaning`, `movers`, `beauty`, `home-repairs`, `auto`, `photography`. Must match exactly or the listing is skipped. |
| `suburbs_served` | Real suburbs. Each one creates a page like "Plumbers in Plumstead" — this is how people find them on Google. **More suburbs, more pages.** |
| `services` | What they actually do. The first four show on the listing card. |
| `description` | Two or three honest sentences. Specific beats polished: *"Books a week out — not the people to call at midnight, and they say so."* |
| `phone` | As dialled. Spaces are fine. |
| `whatsapp` | **International format, no `+`, no spaces.** 082 431 9076 becomes `27824319076`. Get this wrong and the WhatsApp button goes nowhere. |
| `status` | `verified` shows on the site. `pending` keeps it hidden until you've checked them. |
| `rating_avg` | `null` until they have real reviews. Never invent one. |
| `rating_count` | `0` to start. |
| `callout_from` | Rands, digits only, e.g. `450`. Or `null` if they don't quote one. |
| `hours` | `["07:30", "17:00"]` per day, or `null` if closed. `emergency24h: true` means they take after-hours calls. |
| `checks` | One entry per document you actually saw. **Only list what you checked.** |

## Rules worth keeping

**Never invent a rating.** An empty rating shows "No reviews yet", which is
honest and fine. A fabricated one is the exact thing this directory exists to
be an alternative to.

**Only list checks you actually did.** The verified badge is the entire product.
One fake badge and the whole thing is just another directory.

**`status: "pending"`** is your friend. Add a business as pending while you wait
for their documents; it stays invisible until you switch it to `verified`.

**Phone-format the WhatsApp number carefully.** It is the most common mistake
and the most costly — a broken WhatsApp button is a lost customer.

## If the build fails

GitHub emails you. Almost always one of:

- a **missing or extra comma** between businesses
- a **duplicate `slug`**
- a **category** that isn't in the list above

Open the file again, fix it, commit again. The live site is untouched until a
build succeeds, so a mistake costs you a minute and nothing else.

## Checking your work

After the build, the business appears at:

```
hireincapetown.co.za/business/<your-slug>
```

and on every `hireincapetown.co.za/<category>/<suburb>` page for the suburbs you
listed.

---

## Is there a private dashboard?

Not a custom one. It is designed (see the business dashboard artboard in
`design/`) and specced in `BRIEF.md`, but it was never built — the public
directory came first on purpose, because it delivers value with no listings
logic at all.

What exists instead are two admin surfaces you already own, both free, both
password-protected, neither needing a line of code.

### Option A — github.com (what this file describes)

Edit `db/seed.json`, commit, the site rebuilds. Private to your GitHub account.

**Good:** nothing to set up, nothing to break, and a bad edit fails the build
without touching the live site.
**Less good:** it is raw JSON. Commas matter.

### Option B — the Supabase Table Editor

This is the closest thing to the dashboard you are picturing: a real admin UI
with rows, columns, add/edit/delete buttons, and a login. It already exists at
[supabase.com/dashboard](https://supabase.com/dashboard) → the
**SolarinstallersSA** project → **Table Editor** → schema **`hireincapetown`**.

**Read it freely. Do not edit listings there while the sync is running.**

`.github/workflows/sync-db.yml` copies `db/seed.json` into those tables every
three days and on every change to the file. It runs one way only — file to
database — so a row you edit by hand in the Table Editor gets written over on
the next run, with no warning. There is one source of truth on purpose; two
would eventually disagree, and you would find out from a customer.

So the Table Editor is for *looking*: checking what the database holds, reading
the verification records, and, later, seeing business registrations and quote
requests arrive — those are written by the public, and the sync does not touch
those tables.

If you would rather edit there and treat the database as the truth, that is a
real choice, but make it deliberately, all three steps together:

1. GitHub → **Actions** → **Sync database** → **⋯** → **Disable workflow**.
   Skipping this is what causes silent overwrites.
2. Supabase → **Connect** → **Session pooler** → copy the URI, fill in your
   database password.
3. Netlify → your project → **Project configuration → Environment variables** →
   add `DATABASE_URL` with that value, then **Trigger deploy**.

From then on the loop is: edit a row in Supabase → Netlify → **Trigger deploy**.
About a minute. But now the sleeping database is your problem again: with the
keep-alive disabled the project pauses after about a week idle, and a paused
project has to be restored by hand. The build will not fail — it falls back to
whatever `seed.json` last held and prints a loud warning in the deploy log — but
your new listings will not appear. **If a listing you added does not show up,
read the Netlify deploy log.**

### Which to use

**Option A, for a long time.** For the first twenty or thirty listings it is
simpler, has fewer moving parts, and cannot be broken by a sleeping database.
The database stays current underneath it, so nothing is lost by waiting.

Switch to **Option B** when the JSON genuinely starts to hurt — realistically a
few hundred listings — or when you need to record things the public site does
not show and the file has no place for: who you spoke to, what you thought of
them, which check is due for renewal.

Either way, the real work is the same: find good businesses, check their
documents, and write down honestly what you checked.

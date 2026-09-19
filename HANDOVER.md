# Where this project stands

Written so the project can be picked up cold — by you in a month, by another
developer, or with any tool. **Nothing below depends on a Claude subscription.**

## Everything is already saved

| Thing | Where | Cost |
|---|---|---|
| All code | github.com/iinfoman/Hireincapetown | free |
| Database + 14 seeded businesses | Supabase project `alogcohoopgzerrxheiw` | free tier |
| Netlify site (created, not yet deployed) | site id `5bc3cd1e-a3f0-41ef-877a-bd2a2e9cfefd` | free tier |
| Design canvas | https://claude.ai/code/artifact/06567147-3f01-495f-bcbc-3b1640744ac4 | free |
| Domain | hireincapetown.co.za → Netlify, registered at IONOS | **paid — see below** |

**The only thing that can actually be lost is the domain.** If the IONOS
registration lapses it can be bought by someone else and is gone for good.
Everything else is on a free tier and simply sits there. If money is tight,
that renewal is the one to protect.

## Done

- Public directory builds: 78 static pages — home, category pages, one page per
  `category × suburb`, one per business. Heaviest page 11 KB gzipped.
- Database schema applied and seeded, in the `hireincapetown` schema of the
  shared SolarinstallersSA Supabase project.
- Design system and 8 artboards.
- CI on every push: unit tests plus a build that fails above 180 KB per page.
- PR #1 open, green, mergeable.

## Next steps, in order

**1. Merge PR #1.** `main` currently holds only `BRIEF.md`, so nothing can build
from it until this merges. github.com/iinfoman/Hireincapetown/pull/1

**2. Deploy.** app.netlify.com/projects/hireincapetown →
Site configuration → Build & deploy → Continuous deployment → Link repository →
`iinfoman/Hireincapetown`. Build settings come from `netlify.toml`.
No environment variables needed — the build falls back to `db/seed.json`.

**3. Point the domain.** ✅ Done, 17 Sep 2026.

`hireincapetown.co.za` is the primary domain on the Netlify project, with
`www` redirecting to it. Both A records now point at Netlify's load balancer
(`75.2.60.5`), verified through Cloudflare and Google resolvers. The MX records
(`mx00`/`mx01.ionos.com`) were left untouched, so email still works.

Notes for anyone changing this later:

- The A records were tagged SERVICE: Webhosting in IONOS, meaning an IONOS
  hosting package was attached to the domain. Editing the record value
  disconnects it. **That package may still be billing** — worth checking, but
  confirm the email is not bundled with it before cancelling anything.
- `www` is an A record rather than a CNAME. A CNAME to
  `hireincapetown.netlify.app` is marginally more correct and survives Netlify
  changing its load balancer IP; the A record was chosen because editing one
  value on a phone is safer than deleting a service-managed record and
  recreating it. Switch it when convenient.
- Never point the A record at whatever `hireincapetown.netlify.app` resolves to.
  That is a rotating CDN edge address. `75.2.60.5` is the stable apex target.
- Do not move this domain to Netlify DNS. It carries email, and the MX records
  do not follow the nameservers automatically.

**4. Use the live database** (optional, later). Add `DATABASE_URL` as a Netlify
environment variable. Until then the site builds from the committed fixture,
which is a perfectly good public site.

## Then the real work

**Replacing the 14 invented listings with real vetted ones.** This needs no code
and no tooling. There is a form at **`/tools/new-listing/`** on the live site
that writes the entry for you; paste its output into `db/seed.json` on
github.com and commit. See **[ADDING-BUSINESSES.md](ADDING-BUSINESSES.md)**.
The site rebuilds itself. The directory is useful to nobody until the listings
are real, and this is the part that does not require a developer.

After that: registration → admin approval queue → review submission → the
quote-request fan-out. See `BRIEF.md`.

## Things that will bite if forgotten

- **The database is shared with the solar directory.** HireInCapeTown owns the
  `hireincapetown` schema; Solar owns `public`. Never run unqualified DDL — a
  bare `create table businesses` lands in Solar's schema. Both apps have a table
  called `reviews`.
- **Supabase free tier allows 2 active projects** and pauses anything idle for
  about a week. Ovibe and SolarinstallersSA are the two currently active. A
  pause takes both apps in the shared project down together, and restoring one
  is a manual click in the dashboard — nothing wakes it automatically. See
  "The sleeping database" below, which is the arrangement that prevents it.
- **The old standalone `hire in capetown` Supabase project** (`adexrspbgcsnumcgpzgq`)
  is unused and safe to delete: Settings → General → Danger Zone.
- **Reviews are gated by a database constraint**, not by application code — see
  `db/migrations/0001_init.sql`. Do not "simplify" the composite foreign key
  from `reviews` to `hires`; it is the entire fraud defence.
- **ID documents are never shown in the UI** — only the date they were checked.
  POPIA. `verification_docs` has RLS on with no policy, so it is unreachable
  from any client.

## The site currently shows no businesses

All 14 seeded listings are `"status": "pending"`. They were invented — realistic
Cape Town names, suburbs and prices, but not real companies, with phone numbers
that could plausibly dial a stranger. A directory that sells verification cannot
publish unverified listings, so they are held back rather than deleted: the
records are still in `db/seed.json` as a shape reference for real ones.

The site handles this properly rather than looking broken. The home page and
every category page carry an honest empty state, and every category now gets a
page whether or not anyone is listed in it — previously the home page linked all
eight category chips while only four had pages, so beauty, home repairs, auto and
photography had been 404ing since launch.

To bring a listing back, change one word to `"verified"`. See VETTING.md first.

## The sleeping database

The free Supabase tier pauses a project after about a week with no queries. That
is a real problem for anything that reads the database to serve a page, and a
non-problem here, because of how this is arranged:

**The site never reads the database.** `hireincapetown.co.za` is built from
`db/seed.json`, a file in this repository. A paused database, a lost password or
a deleted Supabase account cannot take the site down or block a deploy. That is
the actual fix — not a workaround for one.

**The database is kept in step and kept awake** by
`.github/workflows/sync-db.yml`, which runs `scripts/sync-db.mjs` every three
days and on every push that changes `db/seed.json`. It reads the file, writes the
database, and never the reverse, so there is one source of truth and a scheduled
job can never overwrite a listing added by hand. Each run is enough activity to
reset the pause clock; three days leaves room for one missed run.

To switch it on, once, and then never again:

1. Supabase dashboard → **Connect** → **Session pooler** → copy the URI, and
   put the database password into it where it says `[YOUR-PASSWORD]`.
   It must be the *pooler*, not the direct connection: direct is IPv6-only and
   GitHub Actions runners are IPv4-only.
2. GitHub → this repository → **Settings** → **Secrets and variables** →
   **Actions** → **New repository secret**. Name it `DATABASE_URL`, paste the
   URI, save.
3. **Actions** tab → **Sync database** → **Run workflow**, to prove it works.

Until that secret exists the workflow still runs and still passes — the script
exits cleanly with an explanation rather than failing on a missing credential.

Two things to know about the arrangement:

- **A failed run is the alarm, not an outage.** If the workflow goes red, the
  database needs restoring at supabase.com/dashboard. The site carries on
  regardless; fix it when convenient.
- **GitHub disables scheduled workflows after 60 days with no repository
  activity**, and a commit pushed by the workflow itself does not count. If you
  go two months without touching the repo, the keep-alive stops and the project
  eventually pauses. Nothing breaks when that happens — restore the project and
  re-enable the workflow from the Actions tab.

## Running it anywhere

```bash
git clone https://github.com/iinfoman/Hireincapetown.git
cd Hireincapetown
npm install
npm test        # 14 regression tests
npm run build   # → dist/client, 78 pages
```

No credentials required.

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
| Domain | hireincapetown.co.za at IONOS | **paid — see below** |

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

**3. Point the domain.** Half done.

*Done in Netlify:* `hireincapetown.co.za` is added as the **primary** domain and
`www.hireincapetown.co.za` redirects to it. Both sit at "Pending DNS
verification" until the records below change — that is expected, not a fault.

*Still to do, at IONOS → Domains & SSL → hireincapetown.co.za → DNS:*

| Type | Host | Currently | Change to |
|---|---|---|---|
| A | `@` | 74.208.236.12 (IONOS) | `75.2.60.5` |
| CNAME | `www` | an A record to 74.208.236.12 | `hireincapetown.netlify.app` |

For `www`, delete the A record first — IONOS won't allow an A and a CNAME on the
same host. Drop the TTL to 1 hour before starting so a mistake costs an hour.

**Leave the MX records alone.** The domain carries email (2 MX records were
present when this was written); removing them breaks it, and changing A records
does not affect mail.

Do not use Netlify DNS for this domain. It moves the nameservers off IONOS and
the MX records do not follow automatically.

Do not point the A record at whatever `hireincapetown.netlify.app` resolves to —
that is a rotating CDN edge address. `75.2.60.5` is the stable apex target.
Cross-check against the IP shown under "Pending DNS verification" in Netlify;
that is authoritative.

**4. Use the live database** (optional, later). Add `DATABASE_URL` as a Netlify
environment variable. Until then the site builds from the committed fixture,
which is a perfectly good public site.

## Then the real work

Registration → admin approval queue → review submission → the quote-request
fan-out. And replacing the 14 invented seed businesses with real vetted ones —
see the cold-start section of `BRIEF.md`. The directory is useful to nobody
until the listings are real.

## Things that will bite if forgotten

- **The database is shared with the solar directory.** HireInCapeTown owns the
  `hireincapetown` schema; Solar owns `public`. Never run unqualified DDL — a
  bare `create table businesses` lands in Solar's schema. Both apps have a table
  called `reviews`.
- **Supabase free tier allows 2 active projects** and pauses anything idle for
  about a week. Ovibe and SolarinstallersSA are the two currently active. A
  pause takes both apps in the shared project down together.
- **The old standalone `hire in capetown` Supabase project** (`adexrspbgcsnumcgpzgq`)
  is unused and safe to delete: Settings → General → Danger Zone.
- **Reviews are gated by a database constraint**, not by application code — see
  `db/migrations/0001_init.sql`. Do not "simplify" the composite foreign key
  from `reviews` to `hires`; it is the entire fraud defence.
- **ID documents are never shown in the UI** — only the date they were checked.
  POPIA. `verification_docs` has RLS on with no policy, so it is unreachable
  from any client.

## Running it anywhere

```bash
git clone https://github.com/iinfoman/Hireincapetown.git
cd Hireincapetown
npm install
npm test        # 14 regression tests
npm run build   # → dist/client, 78 pages
```

No credentials required.

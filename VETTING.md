# Vetting a business

The verification is the product. Anyone can list a plumber; the reason someone
trusts HireInCapeTown over a Facebook thread is that a human checked documents
and wrote down the date. This file is that process, so it is the same every time
and so it survives you forgetting it.

Nothing here needs a subscription, a login, or a tool you do not already have.

## 1. Find candidates

In rough order of how well it works:

**Suburb Facebook groups.** Search "plumber" inside the group — Plumstead,
Meadowridge, Southern Suburbs Recommendations, and the equivalent for whatever
area you are filling. The same three or four names come back repeatedly with
real thanks underneath. Your neighbours have already done a year of vetting for
free. This is the best source by a distance.

**Van signage and hardware-shop noticeboards.** Diep River, Retreat, Ottery.
A sign-written van with a landline on it is someone with something to lose.

**Referrals from businesses already listed.** Once you have five good ones, ask
each who they call when they are booked out. Tradespeople know who is competent
and are blunt about who is not.

Not worth it: scraping Google results, buying a lead list, or anything that
gives you a name without a reason to believe in it. The list is not the asset.

## 2. Verify

Ask for the registration number and check it yourself. Do not accept a
photographed certificate as proof of anything — check the number at source.

**Plumbers — PIRB.** The Plumbing Industry Registration Board is the SAQA-
recognised body, and only a registered plumber can issue a Certificate of
Compliance. Search by name or registration number at
[pirb.co.za/verify-plumber](https://www.pirb.co.za/verify-plumber/). Confirm the
name matches and that the registration is current, not expired.

**Electricians — the registration is with the Department of Employment and
Labour**, which issues the letter of registration under Regulation 6 of the
Electrical Installation Regulations. The department has no public searchable
database, so there are two routes:

- Search the trade bodies, which do: the Electrical Contractors Association at
  [search.ecasa.co.za](https://search.ecasa.co.za/) and the Electrical
  Conformance Board at [electrician.org.za](https://electrician.org.za/).
  Membership is not the same thing as registration, but a member who is not
  registered is rare and easy to catch at the next step.
- To confirm a letter of registration is genuine, phone the department on
  051 505 6371 / 051 505 6200. They handle exactly this query.

A "wireman's licence" is the colloquial name for the Installation Electrician
qualification. The person holding it and the registered contractor are sometimes
not the same person. Ask who will actually be on site.

**Cleaners and movers** have no equivalent register. Verify what exists: the
company registration at [bizportal.gov.za](https://bizportal.gov.za) (free, by
company name or number), whether movers carry goods-in-transit cover, and
whether either carries public liability cover. Ask for the policy schedule, not
a verbal assurance.

*Note: the PIRB and ECA search pages could not be opened from the machine this
file was written on, so the exact field layout is unconfirmed — the routes come
from the Department of Employment and Labour's own guidance. If a link has moved,
start at the organisation's home page.*

## 3. Phone them

Fifteen minutes. You are checking two things: that the paperwork is real, and
that you would send your own mother to them.

Ask, in this order:

1. Are you PIRB registered / registered with Labour? What is the number?
2. How long have you been trading, and under this name?
3. Which suburbs do you actually get to — not which ones you would like to.
4. What is your call-out fee, and is it deducted from the job?
5. Do you work after hours, and what changes about the price when you do?
6. Do you carry public liability cover?
7. Who arrives at the house — you, or someone who works for you?

Then ask for a copy of the ID, something with the trading address on it, and the
registration certificate. Anyone legitimate has sent these to an insurer before
and will not find the request strange. Anyone who stalls has told you something.

Listen for what they say when they cannot help: "I can't get there tonight" is a
better sign than "no problem" from someone who will not arrive.

## 4. Write it down

Straight into the form at
[hireincapetown.co.za/tools/new-listing](https://hireincapetown.co.za/tools/new-listing/),
then paste the block into `db/seed.json` on github.com and commit.

The `checks` array is the record, and it only takes four types:

| `type` | means |
|---|---|
| `id_document` | you saw the ID of the person responsible |
| `proof_of_address` | you saw the trading address |
| `trade_registration` | you checked the number **at source**, and `label` says which register |
| `liability_cover` | you saw the policy schedule |

`checked_on` is the date **you** looked, not the date on the certificate. Only
record a check you actually did. An empty `checks` array is honest; a padded one
is the only thing that can destroy this site's reason to exist.

Set `"status": "pending"` while you are still waiting on a document. It stays out
of the build until you change that word to `"verified"`.

## 5. Tell them afterwards

List them first, then make contact. A live page with their own name on it, free,
with the date you verified their registration on it, is a far better opening than
a cold pitch for a directory that does not exist yet.

> Hi — I've listed your business on hireincapetown.co.za. It's a Cape Town
> directory where every listing is checked before it goes up. I verified your
> PIRB registration on [date]. Your page is [link]. It's free and there's
> nothing to sign. If anything on it is wrong, or you'd rather not be listed,
> tell me and I'll fix or remove it today.

Publishing a business's advertised trading details is legitimate under POPIA.
The removal promise is what keeps it that way, so honour it the same day, no
questions.

## 6. Keep it true

Registrations expire. A `trade_registration` check more than a year old is a
claim you are no longer standing behind — re-check it, and update `checked_on`.

If a customer reports a problem, the listing goes to `"pending"` first and you
investigate second. The site's only asset is that "verified" means something.

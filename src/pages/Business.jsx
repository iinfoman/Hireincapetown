import { Layout } from '../components/Layout.jsx';
import { VerifiedBadge, UnverifiedBadge, Rating, OpenNow, ContactRow, Initials } from '../components/bits.jsx';
import { Check, Dot, Clock, Flag, Star } from '../components/Icons.jsx';
import { rands, rating as fmtRating } from '../lib/slug.js';
import { slugify } from '../lib/slug.js';

const CHECK_LABELS = {
  id_document: "Owner's ID document",
  proof_of_address: 'Business address',
  trade_registration: 'Trade registration',
  liability_cover: 'Public liability cover',
};

const ALL_CHECKS = ['id_document', 'proof_of_address', 'trade_registration', 'liability_cover'];

const monthYear = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
};

const DAY_ROWS = [
  ['Mon – Fri', ['mon', 'tue', 'wed', 'thu', 'fri']],
  ['Saturday', ['sat']],
  ['Sunday', ['sun']],
];

const describeDays = (hours, keys) => {
  if (!hours) return 'Not listed';
  const vals = keys.map((k) => hours[k]).map((v) => (v ? `${v[0]} – ${v[1]}` : 'Closed'));
  const uniq = [...new Set(vals)];
  return uniq.length === 1 ? uniq[0] : vals.join(' · ');
};

export const Business = ({ business: b, category, alsoIn }) => {
  const checks = new Map((b.checks ?? []).map((c) => [c.type, c]));
  const verified = b.status === 'verified';
  const homeSuburb = b.suburbs_served?.[0];
  const message = `Hi ${b.name}, I found you on HireInCapeTown — I need help with ${category?.one ?? 'a job'}.`;

  return (
    <Layout>
      <article className="mx-auto max-w-[1180px] px-4 md:px-10">
        <nav className="py-4 text-[13px] text-ink-2">
          <a href="/" className="hover:text-protea">Home</a> <span className="px-1">/</span>
          <a href={`/${b.category}`} className="hover:text-protea">{category?.label ?? b.category}</a>
          <span className="px-1">/</span>
          {homeSuburb && <a href={`/${b.category}/${slugify(homeSuburb)}`} className="hover:text-protea">{homeSuburb}</a>}
        </nav>

        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-10">
          <div>
            <header className="rounded-card bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {verified ? <VerifiedBadge full /> : <UnverifiedBadge full />}
                <OpenNow hours={b.hours} className="rounded-full bg-surface px-3 py-1.5" />
              </div>
              <div className="mt-3.5 flex gap-3.5">
                <Initials name={b.name} size={56} />
                <div>
                  <h1 className="font-dsp text-[24px] font-extrabold leading-tight md:text-[30px]">{b.name}</h1>
                  <div className="mt-2"><Rating avg={b.rating_avg} count={b.rating_count} /></div>
                </div>
              </div>
              <p className="mt-3 text-[14px] text-ink-2">{b.services.join(' · ')}</p>
              <div className="mt-4 md:hidden"><ContactRow business={b} message={message} size="lg" /></div>
            </header>

            {!verified ? (
              <section className="mt-3.5 rounded-card border border-line-strong bg-surface p-4 md:p-6">
                <h2 className="font-dsp text-[17.5px] font-bold">We have not checked this business yet</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                  These details were taken from {b.name}'s own website and public listings. Nobody
                  here has seen an ID, confirmed the trading address, or checked a trade
                  registration — so treat this the way you would any name you found online, and
                  ask for the registration number yourself before work starts.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                  We are working through these listings. When the checks are done this panel is
                  replaced by what was checked and when.
                  <a href="/how-vetting-works" className="ml-1 font-semibold text-protea hover:underline">How vetting works</a>
                </p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-2">
                  Is this your business? <a href="/report" className="font-semibold text-protea hover:underline">Tell us</a> and
                  we will correct it or take it down the same day.
                </p>
              </section>
            ) : (
            <section className="mt-3.5 rounded-card border border-line bg-white p-4 md:p-6">
              <h2 className="font-dsp text-[17.5px] font-bold">What we checked</h2>
              <ul className="mt-3.5 space-y-2.5">
                {ALL_CHECKS.map((type) => {
                  const c = checks.get(type);
                  const label = c?.label ?? CHECK_LABELS[type];
                  return (
                    <li key={type} className="flex items-center gap-2.5">
                      <span className={c ? 'text-trust' : 'text-line-strong'}>{c ? <Check size={18} /> : <Dot size={18} />}</span>
                      <span className={`text-[14px] font-semibold ${c ? '' : 'text-ink-2'}`}>{label}</span>
                      <span className="ml-auto text-[12.5px] text-ink-2">{c ? monthYear(c.checked_on) : 'Not supplied'}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-2">
                We hold the documents, not this page — we only ever show the date they were checked.
                <a href="/how-vetting-works" className="ml-1 font-semibold text-protea hover:underline">How vetting works</a>
              </p>
            </section>
            )}

            <section className="mt-3.5 rounded-card border border-line bg-white p-4 md:p-6">
              <h2 className="font-dsp text-[17.5px] font-bold">About</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed">{b.description}</p>
              {b.callout_from && (
                <p className="mt-4 flex items-center gap-2.5 rounded-[11px] bg-protea-tint px-3.5 py-3 text-[13.5px] font-semibold">
                  <span className="text-protea"><Clock size={17} /></span>
                  Callout {rands(b.callout_from)}, quoted before work starts.
                </p>
              )}
            </section>

            <section className="mt-3.5 rounded-card border border-line bg-white p-4 md:p-6">
              <h2 className="font-dsp text-[17.5px] font-bold">Reviews</h2>
              {b.rating_count > 0 && fmtRating(b.rating_avg) ? (
                <div className="mt-3.5 flex items-center gap-5">
                  <div className="text-center">
                    <div className="font-dsp text-[42px] font-extrabold leading-none">{fmtRating(b.rating_avg)}</div>
                    <div className="mt-1.5 flex justify-center gap-0.5 text-star">
                      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} />)}
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink-2">
                    From <strong className="text-ink">{b.rating_count}</strong> customers who recorded a hire
                    through HireInCapeTown. Nobody else can review this business.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                  No reviews yet. The first will appear once someone records a hire here.
                </p>
              )}
            </section>

            <section className="mt-3.5 rounded-card border border-line bg-white p-4 md:p-6">
              <h2 className="font-dsp text-[17.5px] font-bold">Where they work</h2>
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {b.suburbs_served.map((s) => (
                  <li key={s}>
                    <a href={`/${b.category}/${slugify(s)}`}
                       className="inline-flex min-h-tap items-center rounded-full border border-line-strong px-3.5 text-[13px] font-semibold hover:border-protea hover:text-protea">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="my-5 h-px bg-line" />

              <h3 className="font-dsp text-[15.5px] font-bold">Opening hours</h3>
              <dl className="mt-3 space-y-2">
                {DAY_ROWS.map(([label, keys]) => (
                  <div key={label} className="flex justify-between text-[13.5px]">
                    <dt className="font-semibold">{label}</dt>
                    <dd className="text-ink-2">{describeDays(b.hours, keys)}</dd>
                  </div>
                ))}
                {b.hours?.emergency24h && (
                  <div className="flex justify-between text-[13.5px]">
                    <dt className="font-semibold text-trust">Emergencies</dt>
                    <dd className="text-trust">Any hour</dd>
                  </div>
                )}
              </dl>
            </section>

            <p className="py-6 text-center">
              <a href={`/report?business=${b.slug}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2 hover:text-protea">
                <Flag size={16} /> Something wrong with this listing? Report it
              </a>
            </p>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-6 rounded-card border border-line bg-white p-5">
              <ContactRow business={b} message={message} size="lg" />
              <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-2">
                Free to contact. {b.name} answers you directly — we don't sit in the middle.
              </p>
              {alsoIn.length > 0 && (
                <>
                  <div className="my-5 h-px bg-line" />
                  <h2 className="font-dsp text-[14.5px] font-bold">Other {category?.label.toLowerCase()} nearby</h2>
                  <ul className="mt-3 space-y-3">
                    {alsoIn.map((o) => (
                      <li key={o.slug}>
                        <a href={`/business/${o.slug}`} className="group flex items-center gap-2.5">
                          <Initials name={o.name} size={36} tone={1} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-semibold group-hover:text-protea">{o.name}</span>
                            <span className="block text-[12px] text-ink-2">{[fmtRating(o.rating_avg), o.suburbs_served?.[0]].filter(Boolean).join(' · ')}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
};

import { VerifiedBadge, Rating, OpenNow, ContactRow, Initials } from './bits.jsx';
import { rands } from '../lib/slug.js';

export const BusinessCard = ({ business: b, index = 0, context }) => {
  const verified = b.status === 'verified';
  const message = context
    ? `Hi ${b.name}, I found you on HireInCapeTown — I need help with ${context}.`
    : `Hi ${b.name}, I found you on HireInCapeTown.`;

  return (
    <article className="rounded-card border border-line bg-white p-3.5">
      <div className="flex gap-3">
        <Initials name={b.name} tone={index} />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-dsp text-[16.5px] font-bold leading-tight">
            <a href={`/business/${b.slug}`} className="hover:text-protea focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea">
              {b.name}
            </a>
            {verified && <VerifiedBadge />}
          </h3>
          <div className="mt-1"><Rating avg={b.rating_avg} count={b.rating_count} /></div>
          <p className="mt-1 text-[13px] text-ink-2">{b.suburbs_served[0]}</p>
        </div>
      </div>

      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-2">{b.services.slice(0, 4).join(' · ')}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1">
        <OpenNow hours={b.hours} />
        {b.callout_from && <span className="text-[12.5px] text-ink-2">Callout from {rands(b.callout_from)}</span>}
      </div>

      <div className="mt-3"><ContactRow business={b} message={message} /></div>
    </article>
  );
};

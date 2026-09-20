import { Shield, Star, Chat, Phone, Pin, Dot } from './Icons.jsx';
import { rating as fmtRating } from '../lib/slug.js';

export const VerifiedBadge = ({ full = false }) =>
  full ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-trust px-2.5 py-1.5 text-xs font-bold text-white">
      <Shield size={13} /> Verified business
    </span>
  ) : (
    <span className="text-trust" title="Verified business"><Shield size={16} /></span>
  );

/**
 * The counterpart to VerifiedBadge, and the reason the site can publish a
 * business nobody has checked without lying about it. Never omit this on a
 * 'listed' record — a listing with neither badge reads as verified.
 */
export const UnverifiedBadge = ({ full = false }) =>
  full ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-2.5 py-1.5 text-xs font-bold text-ink-2">
      <Dot size={13} /> Not verified yet
    </span>
  ) : (
    <span className="rounded-full border border-line-strong px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-2"
          title="Nobody has checked this business's documents yet">
      Unverified
    </span>
  );

/**
 * Paid placement must be labelled. A reader who cannot tell the difference
 * between "first because they are good" and "first because they paid" stops
 * trusting either, which costs more than the advert earns.
 */
export const PromotedBadge = () => (
  <span className="rounded-full bg-star/15 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[#8A6200]"
        title="This business pays for placement. It is not ranked by merit.">
    Promoted
  </span>
);

export const Rating = ({ avg, count }) => {
  const value = fmtRating(avg);
  // A newly verified business has no rating. Showing "0,0" would read as a
  // terrible score rather than an absent one.
  if (value === null || !count) {
    return <span className="text-[13px] text-ink-2">No reviews yet</span>;
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-star"><Star size={13} /></span>
      <span className="text-[13.5px] font-bold">{value}</span>
      <span className="text-[13px] text-ink-2">· {count} review{count === 1 ? '' : 's'}</span>
    </span>
  );
};

/** Filled in by the browser — see src/lib/hours.js for why. */
export const OpenNow = ({ hours, className = '' }) => (
  <span className={`js-open flex items-center gap-1.5 ${className}`} data-hours={JSON.stringify(hours ?? null)}>
    <span className="js-open-dot block h-1.5 w-1.5 rounded-full bg-ink-3" />
    <span className="js-open-label text-[12.5px] font-semibold text-ink-2">Checking hours…</span>
  </span>
);

const waLink = (n, text) => `https://wa.me/${n}?text=${encodeURIComponent(text)}`;

/**
 * Both columns are nullable, and a listing with neither is still a valid
 * listing. Render only the channels the business actually gave us — never a
 * dead `tel:` or a `wa.me/null` link.
 */
export const ContactRow = ({ business, message, size = 'md' }) => {
  const h = size === 'lg' ? 'min-h-[52px]' : 'min-h-tap';
  const base = `flex flex-1 items-center justify-center gap-2 rounded-ctl px-4 ${h} text-[14.5px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea`;
  const wa = business.whatsapp?.trim();
  const tel = business.phone?.replace(/[^\d+]/g, '');

  const site = business.website?.trim();

  if (!wa && !tel && !site) {
    return <p className="text-[13px] text-ink-2">No contact details on file yet.</p>;
  }

  return (
    <div className="flex gap-2">
      {wa && (
        <a href={waLink(wa, message)} rel="nofollow noopener" className={`${base} bg-whatsapp text-ink`}>
          <Chat size={17} /> WhatsApp
        </a>
      )}
      {tel && (
        <a href={`tel:${tel}`} className={`${base} border border-line-strong bg-white text-ink`}>
          <Phone size={16} /> Call
        </a>
      )}
      {/* Last resort. An unverified listing often has a website and nothing
          else, and a listing with no way to make contact is not a listing. */}
      {!wa && !tel && site && (
        <a href={site} rel="nofollow noopener" target="_blank"
           className={`${base} border border-line-strong bg-white text-ink`}>
          Visit website
        </a>
      )}
    </div>
  );
};

export const Initials = ({ name, tone = 0, size = 54 }) => {
  const tones = [['bg-protea-tint', 'text-protea'], ['bg-trust-tint', 'text-trust'], ['bg-surface', 'text-ink-2']];
  const [bg, fg] = tones[tone % tones.length];
  const letters = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
  return (
    <span style={{ width: size, height: size }}
          className={`flex shrink-0 items-center justify-center rounded-tile ${bg} ${fg} font-dsp font-extrabold`}>
      {letters.toUpperCase()}
    </span>
  );
};

export const Suburb = ({ children }) => (
  <span className="flex items-center gap-1 text-[13px] text-ink-2"><Pin size={13} /> {children}</span>
);

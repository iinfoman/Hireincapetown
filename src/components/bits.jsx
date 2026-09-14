import { Shield, Star, Chat, Phone, Pin } from './Icons.jsx';
import { rating as fmtRating } from '../lib/slug.js';

export const VerifiedBadge = ({ full = false }) =>
  full ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-trust px-2.5 py-1.5 text-xs font-bold text-white">
      <Shield size={13} /> Verified business
    </span>
  ) : (
    <span className="text-trust" title="Verified business"><Shield size={16} /></span>
  );

export const Rating = ({ avg, count }) => (
  <span className="flex items-center gap-1.5">
    <span className="text-star"><Star size={13} /></span>
    <span className="text-[13.5px] font-bold">{fmtRating(Number(avg))}</span>
    <span className="text-[13px] text-ink-2">· {count} review{count === 1 ? '' : 's'}</span>
  </span>
);

/** Filled in by the browser — see src/lib/hours.js for why. */
export const OpenNow = ({ hours, className = '' }) => (
  <span className={`js-open flex items-center gap-1.5 ${className}`} data-hours={JSON.stringify(hours ?? null)}>
    <span className="js-open-dot block h-1.5 w-1.5 rounded-full bg-ink-3" />
    <span className="js-open-label text-[12.5px] font-semibold text-ink-2">Checking hours…</span>
  </span>
);

const waLink = (n, text) => `https://wa.me/${n}?text=${encodeURIComponent(text)}`;

export const ContactRow = ({ business, message, size = 'md' }) => {
  const h = size === 'lg' ? 'min-h-[52px]' : 'min-h-tap';
  return (
    <div className="flex gap-2">
      <a href={waLink(business.whatsapp, message)} rel="nofollow noopener"
         className={`flex flex-1 items-center justify-center gap-2 rounded-ctl bg-whatsapp px-4 ${h} text-[14.5px] font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea`}>
        <Chat size={17} /> WhatsApp
      </a>
      <a href={`tel:${business.phone.replace(/\s/g, '')}`}
         className={`flex flex-1 items-center justify-center gap-2 rounded-ctl border border-line-strong bg-white px-4 ${h} text-[14.5px] font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea`}>
        <Phone size={16} /> Call
      </a>
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

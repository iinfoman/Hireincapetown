import { Search, Pin } from './Icons.jsx';
import { CATEGORIES } from '../lib/categories.js';

/**
 * The signature element. A real <form> with a GET action, so it works with
 * zero JavaScript — which is the entire reason the public pages stay under
 * a couple of KB of script.
 */
export const NeedBar = ({ suburbs, category = '', suburb = '' }) => (
  <form action="/find" method="get"
        className="rounded-[18px] bg-white p-1.5 shadow-[0_10px_28px_rgba(22,28,36,0.14)] md:flex md:items-stretch md:p-3.5">
    <label className="flex flex-1 items-center gap-3 px-3 py-3.5 md:px-4">
      <span className="text-protea"><Search size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-3">What do you need?</span>
        <select name="category" defaultValue={category}
                className="mt-0.5 w-full appearance-none bg-transparent font-dsp text-[17px] font-semibold text-ink focus:outline-none">
          <option value="">Choose a service…</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </span>
    </label>

    <span className="mx-3 hidden w-px bg-line md:block" />
    <span className="mx-3 h-px bg-line md:hidden" />

    <label className="flex flex-1 items-center gap-3 px-3 py-3.5 md:px-4">
      <span className="text-protea"><Pin size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-3">Where</span>
        <select name="suburb" defaultValue={suburb}
                className="mt-0.5 w-full appearance-none bg-transparent font-dsp text-[17px] font-semibold text-ink focus:outline-none">
          <option value="">Anywhere in Cape Town</option>
          {suburbs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </span>
    </label>

    <button type="submit"
            className="mt-1.5 min-h-[52px] w-full rounded-ctl bg-protea px-6 font-dsp text-[16.5px] font-bold text-white hover:bg-protea-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:mt-0 md:w-auto md:shrink-0">
      Find a business
    </button>
  </form>
);

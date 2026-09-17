import { Layout } from '../components/Layout.jsx';
import { NeedBar } from '../components/NeedBar.jsx';
import { BusinessCard } from '../components/BusinessCard.jsx';
import { Trade, Shield, Star, Chat } from '../components/Icons.jsx';
import { CATEGORIES } from '../lib/categories.js';
import { HeroArt } from '../components/HeroArt.jsx';


export const Home = ({ suburbs, featured, seoLinks }) => (
  <Layout>
    <section className="relative isolate overflow-hidden bg-ink">
      <HeroArt />
      <div className="relative mx-auto flex min-h-[540px] max-w-[1180px] flex-col px-4 pb-40 pt-7 md:min-h-[620px] md:px-10 md:pb-44 md:pt-20">
        <h1 className="max-w-[300px] text-pretty font-dsp text-[33px] font-extrabold leading-[1.06] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:max-w-[560px] md:text-[54px]">
          Need someone you can trust?
        </h1>
        <p className="mt-3 max-w-[300px] text-[15px] font-medium leading-relaxed text-[#C9D2DC] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] md:mt-4 md:max-w-[480px] md:text-[17.5px]">
          Real Cape Town businesses — checked, rated by people who actually hired them,
          and one tap from your WhatsApp.
        </p>
      </div>
    </section>

    <div className="relative z-10 mx-auto -mt-[66px] max-w-[1180px] px-3.5 md:-mt-[52px] md:px-10">
      <NeedBar suburbs={suburbs} />
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 px-1">
        <li className="flex items-center gap-2 text-[13.5px] font-semibold"><span className="text-trust"><Shield size={16} /></span> ID &amp; trade licence checked</li>
        <li className="flex items-center gap-2 text-[13.5px] font-semibold"><span className="text-star"><Star size={16} /></span> Reviews only from recorded hires</li>
        <li className="flex items-center gap-2 text-[13.5px] font-semibold"><Chat size={16} /> Straight to WhatsApp</li>
      </ul>
    </div>

    <section className="mx-auto max-w-[1180px] px-4 pt-12 md:px-10 md:pt-14">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 className="font-dsp text-[20px] font-bold md:text-[27px]">What do you need today?</h2>
      </div>
      <ul className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-3">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <a href={`/${c.slug}`}
               className="flex min-h-tap flex-col items-center gap-2 rounded-[14px] border border-line bg-white px-1.5 py-3 hover:border-protea hover:text-protea focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-protea">
              <Trade icon={c.icon} />
              <span className="text-center text-[11.5px] font-semibold leading-tight">{c.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>

    <section className="mx-auto max-w-[1180px] px-4 pt-12 md:px-10 md:pt-14">
      <div className="flex items-center gap-2.5">
        <span className="block h-2 w-2 rounded-full bg-open shadow-[0_0_0_4px_rgba(31,164,94,0.16)]" />
        <h2 className="font-dsp text-[20px] font-bold md:text-[27px]">Open right now</h2>
      </div>
      {/* Prerendered in full; the browser hides whoever is shut. Without JS you
          simply see everyone, which is the correct fallback for a directory. */}
      <p className="mb-4 mt-2 text-[13px] text-ink-2 md:text-[15px]">
        <span className="js-open-count" data-total={featured.length}>{featured.length} businesses</span> taking calls across Cape Town.
      </p>
      <ul data-open-only className="grid gap-2.5 md:grid-cols-3 md:gap-4">
        {featured.map((b, i) => (
          <li key={b.slug} data-hours={JSON.stringify(b.hours ?? null)}><BusinessCard business={b} index={i} /></li>
        ))}
      </ul>
    </section>

    <section className="mx-auto max-w-[1180px] px-4 pt-12 md:px-10 md:pt-14">
      <h2 className="font-dsp text-[20px] font-bold md:text-[22px]">People in Cape Town are searching for</h2>
      <p className="mb-4 mt-1.5 text-[13px] text-ink-2 md:text-[14.5px]">Every one of these is its own page, with real listings on it.</p>
      <ul className="grid grid-cols-1 gap-x-7 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {seoLinks.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-[14.5px] font-medium text-protea hover:text-protea-deep hover:underline">{l.label}</a>
          </li>
        ))}
      </ul>
    </section>
  </Layout>
);

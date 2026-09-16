import { Layout } from '../components/Layout.jsx';
import { NeedBar } from '../components/NeedBar.jsx';
import { BusinessCard } from '../components/BusinessCard.jsx';

/** Serves both /:category and the money pages, /:category/:suburb. */
export const Results = ({ category, suburb, businesses, suburbs, nearby, heading, intro }) => (
  <Layout>
    <div className="bg-ink px-4 pb-16 pt-7 md:px-10 md:pb-20 md:pt-12">
      <div className="mx-auto max-w-[1180px]">
        <nav className="mb-3 text-[13px] text-[#8B94A1]">
          <a href="/" className="hover:text-white">Home</a> <span className="px-1">/</span>
          <a href={`/${category.slug}`} className="hover:text-white">{category.label}</a>
          {suburb && <><span className="px-1">/</span><span className="text-white">{suburb.name}</span></>}
        </nav>
        <h1 className="text-pretty font-dsp text-[28px] font-extrabold leading-tight text-white md:text-[42px]">{heading}</h1>
        <p className="mt-3 max-w-[620px] text-[14.5px] leading-relaxed text-[#A3AEBB] md:text-[16px]">{intro}</p>
      </div>
    </div>

    <div className="relative z-10 mx-auto -mt-10 max-w-[1180px] px-3.5 md:px-10">
      <NeedBar suburbs={suburbs} category={category.slug} suburb={suburb?.slug ?? ''} />
    </div>

    <section className="mx-auto max-w-[1180px] px-4 pt-10 md:px-10">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 className="font-dsp text-[17px] font-bold md:text-[20px]">
          {businesses.length} verified {businesses.length === 1 ? category.one : category.label.toLowerCase()}
          {suburb ? ` serving ${suburb.name}` : ' in Cape Town'}
        </h2>
      </div>

      <ul className="grid gap-2.5 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {businesses.map((b, i) => (
          <li key={b.slug}><BusinessCard business={b} index={i} context={category.one} /></li>
        ))}
      </ul>

      <aside className="mt-4 flex items-start gap-3 rounded-[14px] bg-protea-tint p-3.5 md:max-w-[640px]">
        <p className="text-[13px] leading-relaxed">
          Only people who recorded a hire here can leave a review. That's why some listings show eleven
          reviews and not four hundred.
        </p>
      </aside>

      {nearby.length > 0 && (
        <div className="mt-12">
          <h2 className="font-dsp text-[17px] font-bold md:text-[20px]">{category.label} in nearby suburbs</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-flex min-h-tap items-center rounded-full border border-line-strong bg-white px-3.5 text-[13px] font-semibold hover:border-protea hover:text-protea">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  </Layout>
);

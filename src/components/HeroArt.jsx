/**
 * The hero photograph, art-directed.
 *
 * Two crops rather than one. A phone showing a 16:9 landscape in a portrait-ish
 * band either letterboxes it or crops the people out, so narrow screens get a
 * crop centred on the trades — and download a smaller file for it: 25 KB as
 * AVIF against 90 KB for the desktop frame. On a prepaid bundle that gap is the
 * whole argument for doing this properly.
 *
 * Regenerate with: node scripts/build-hero-images.mjs <source>
 */
const ALT =
  'Four Cape Town tradespeople — a cleaner, a plumber, a handyman and a chef — ' +
  'standing above the city at sunset, with Table Mountain behind them.';

export const HeroArt = () => (
  <div className="absolute inset-0 -z-10" aria-hidden="false">
    <picture>
      {/* Tablet and up: the full scene, including the van and Lion's Head. */}
      <source
        media="(min-width: 768px)"
        type="image/avif"
        srcSet="/hero/wide-1100.avif 1100w, /hero/wide-1600.avif 1600w"
        sizes="100vw"
      />
      <source
        media="(min-width: 768px)"
        type="image/webp"
        srcSet="/hero/wide-1100.webp 1100w, /hero/wide-1600.webp 1600w"
        sizes="100vw"
      />
      {/* Phones: the people, close. */}
      <source type="image/avif" srcSet="/hero/tall-540.avif 540w, /hero/tall-760.avif 760w" sizes="100vw" />
      <source type="image/webp" srcSet="/hero/tall-540.webp 540w, /hero/tall-760.webp 760w" sizes="100vw" />
      <img
        src="/hero/tall-760.webp"
        alt={ALT}
        width="760"
        height="813"
        // This is the largest element on the page; tell the browser to get on
        // with it rather than discovering it late.
        fetchPriority="high"
        decoding="async"
        className="h-full w-full object-cover object-[50%_42%] md:object-[50%_46%]"
      />
    </picture>

    {/*
      Two scrims, because the two layouts have different problems.

      Phones stack: bright sky at the top, people below, so a vertical ramp is
      enough — dark where the headline sits, clear across the faces.

      On desktop the text runs horizontally straight across the plumber and the
      cleaner. The image cannot be shifted to solve it: at 1440px the frame is
      exactly as wide as the scaled photograph, so there is no horizontal crop
      to play with. So the left third is deliberately sunk into shadow and the
      text lives there, with the chef, the city and the sunset carrying the
      right-hand side.
    */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(to bottom,' +
          ' rgba(22,28,36,0.92) 0%,' +
          ' rgba(22,28,36,0.72) 20%,' +
          ' rgba(22,28,36,0.30) 44%,' +
          ' rgba(22,28,36,0.36) 70%,' +
          ' rgba(22,28,36,0.86) 100%)',
      }}
    />
    <div
      className="absolute inset-0 hidden md:block"
      style={{
        background:
          'linear-gradient(to right,' +
          ' rgba(22,28,36,0.88) 0%,' +
          ' rgba(22,28,36,0.74) 26%,' +
          ' rgba(22,28,36,0.34) 48%,' +
          ' rgba(22,28,36,0.00) 66%)',
      }}
    />
  </div>
);

/**
 * Turns the source hero photograph into the handful of files the site actually
 * ships. Run manually when the photo changes; the outputs are committed so the
 * normal build needs no image tooling.
 *
 *   node scripts/build-hero-images.mjs path/to/source.png
 *
 * Two crops, not one. A phone showing a 16:9 landscape photo in a portrait-ish
 * band either letterboxes it or crops the subject out — so the narrow screens
 * get their own crop centred on the people, and download a smaller file for it.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = process.argv[2];
if (!SOURCE) {
  console.error('usage: node scripts/build-hero-images.mjs <source image>');
  process.exit(1);
}

const OUT = 'public/hero';
await mkdir(OUT, { recursive: true });

// Crop boxes against the 1672x941 source.
const CROPS = {
  // Full scene: the trades, Table Mountain, Lion's Head and the van.
  wide: null,
  // Phones: the people and the left of the mountain. The van and the sun fall
  // outside, which is the right trade — faces matter more than scenery here.
  tall: { left: 40, top: 0, width: 880, height: 941 },
};

const WIDTHS = { wide: [1600, 1100], tall: [760, 540] };

const report = [];
for (const [crop, box] of Object.entries(CROPS)) {
  for (const width of WIDTHS[crop]) {
    for (const [ext, opts] of [['avif', { quality: 52, effort: 6 }], ['webp', { quality: 74 }]]) {
      const name = `${crop}-${width}.${ext}`;
      let img = sharp(SOURCE);
      if (box) img = img.extract(box);
      const info = await img
        .resize({ width, withoutEnlargement: true })
        .toFormat(ext, opts)
        .toFile(`${OUT}/${name}`);
      report.push({ name, kb: +(info.size / 1024).toFixed(1), w: info.width, h: info.height });
    }
  }
}

const meta = await sharp(SOURCE).metadata();
console.log(`source ${meta.width}x${meta.height} ${(meta.size / 1024 / 1024).toFixed(1)} MB\n`);
for (const r of report.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${r.name.padEnd(18)} ${String(r.w).padStart(4)}x${String(r.h).padEnd(4)}  ${String(r.kb).padStart(6)} KB`);
}

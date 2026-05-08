import sharp from 'sharp';
import { existsSync } from 'fs';

const imgDir = 'public/img';

const conversions = [
  // story-scoop is the LCP CSS background — full-width section, 1600px is sufficient for 2x desktop
  { src: `${imgDir}/story-scoop.png`,    out: `${imgDir}/story-scoop.webp`,    width: 1600 },
  // bottle-bccb displays at ~370px wide; 800px covers 2x retina
  { src: `${imgDir}/bottle-bccb.png`,    out: `${imgDir}/bottle-bccb.webp`,    width: 800  },
  // la-cityscape displays at ~820px wide; 1640px covers 2x retina
  { src: `${imgDir}/la-cityscape.jpg`,   out: `${imgDir}/la-cityscape.webp`,   width: 1640 },
  // merch-flatlay displays at ~420px wide; 840px covers 2x retina
  { src: `${imgDir}/merch-flatlay.png`,  out: `${imgDir}/merch-flatlay.webp`,  width: 840  },
  // bottle-hero only used for OG tags — convert for completeness
  { src: `${imgDir}/bottle-hero.png`,    out: `${imgDir}/bottle-hero.webp`,    width: 1200 },
];

for (const { src, out, width } of conversions) {
  if (!existsSync(src)) { console.log(`SKIP (missing): ${src}`); continue; }
  const { width: origW, height: origH } = await sharp(src).metadata();
  await sharp(src)
    .resize({ width: Math.min(width, origW), withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  const { size: inSize } = await import('fs').then(m => m.promises.stat(src));
  const { size: outSize } = await import('fs').then(m => m.promises.stat(out));
  console.log(`${src.split('/').pop()} (${origW}x${origH}) → ${out.split('/').pop()} | ${(inSize/1024).toFixed(0)}KB → ${(outSize/1024).toFixed(0)}KB (saved ${((1-outSize/inSize)*100).toFixed(0)}%)`);
}

// Generates Apex Sportswear brand images via sharp (SVG -> PNG).
//   node scripts/make-cover.mjs
// Outputs:
//   public/og-image.png          1200×630  — social-share / link-preview card (OG + Twitter)
//   public/cover-1920x1080.png   1920×1080 — 16:9 cover (uploads requiring min 1920×1080)

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (f) => join(__dirname, "..", "public", f);

const FONT = "DejaVu Sans, sans-serif";

// Layout tuned per canvas (ratios differ, so positions aren't just scaled).
function buildSvg({ w, h, eyebrowY, eyebrowSize, eyebrowLS, wordX, wordY, wordSize,
                    sloganX, sloganY, sloganSize, urlX, urlY, urlSize,
                    glowCx, glowCy, glowR }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00e676" stop-opacity="0.40"/>
      <stop offset="60%" stop-color="#00e676" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#00e676" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0a0a0a"/>
  <ellipse cx="${glowCx}" cy="${glowCy}" rx="${glowR}" ry="${glowR * 0.82}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${w}" height="${Math.round(h * 0.012)}" fill="#00e676"/>
  <text x="${wordX + 6}" y="${eyebrowY}" font-family="${FONT}" font-weight="bold"
        font-size="${eyebrowSize}" letter-spacing="${eyebrowLS}" fill="#00e676">FOOTBALL · NBA · F1</text>
  <text x="${wordX}" y="${wordY}" font-family="${FONT}" font-weight="bold"
        font-size="${wordSize}" letter-spacing="-4" fill="#ffffff">APEX<tspan fill="#00e676">.</tspan></text>
  <text x="${sloganX}" y="${sloganY}" font-family="${FONT}" font-weight="bold"
        font-size="${sloganSize}" letter-spacing="1" fill="#e4e4e7">Wear your <tspan fill="#00e676">allegiance</tspan></text>
  <text x="${urlX}" y="${urlY}" font-family="${FONT}"
        font-size="${urlSize}" letter-spacing="3" fill="#8a8a8f">apexswear.co.uk</text>
</svg>`;
}

const variants = [
  {
    file: "og-image.png",
    cfg: { w: 1200, h: 630, eyebrowY: 180, eyebrowSize: 28, eyebrowLS: 8,
      wordX: 74, wordY: 380, wordSize: 200, sloganX: 80, sloganY: 468, sloganSize: 46,
      urlX: 80, urlY: 560, urlSize: 28, glowCx: 1030, glowCy: 150, glowR: 560 },
  },
  {
    file: "cover-1920x1080.png",
    cfg: { w: 1920, h: 1080, eyebrowY: 360, eyebrowSize: 42, eyebrowLS: 14,
      wordX: 130, wordY: 700, wordSize: 340, sloganX: 138, sloganY: 838, sloganSize: 78,
      urlX: 138, urlY: 980, urlSize: 42, glowCx: 1640, glowCy: 270, glowR: 920 },
  },
];

for (const { file, cfg } of variants) {
  const out = pub(file);
  await sharp(Buffer.from(buildSvg(cfg))).png().toFile(out);
  const m = await sharp(out).metadata();
  console.log(`✅ ${file} — ${m.width}×${m.height} ${Math.round((m.size || 0) / 1024)}KB`);
}

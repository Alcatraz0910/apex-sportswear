// Generates the Apex Sportswear cover / social-share image (1200×630 PNG).
// Run from the storefront dir:  node scripts/make-cover.mjs
// Output: public/og-image.png  (used as OG + Twitter card, and a downloadable cover)

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "og-image.png");

const W = 1200;
const H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00e676" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#00e676" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#00e676" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="#0a0a0a"/>
  <!-- brand glow, top-right so it never washes out the text -->
  <ellipse cx="1030" cy="150" rx="560" ry="460" fill="url(#glow)"/>
  <!-- accent rule top -->
  <rect x="0" y="0" width="${W}" height="8" fill="#00e676"/>

  <!-- eyebrow -->
  <text x="80" y="180" font-family="DejaVu Sans, sans-serif" font-weight="bold"
        font-size="28" letter-spacing="8" fill="#00e676">FOOTBALL · NBA · F1</text>

  <!-- wordmark -->
  <text x="74" y="380" font-family="DejaVu Sans, sans-serif" font-weight="bold"
        font-size="200" letter-spacing="-4" fill="#ffffff">APEX<tspan fill="#00e676">.</tspan></text>

  <!-- slogan -->
  <text x="80" y="468" font-family="DejaVu Sans, sans-serif" font-weight="bold"
        font-size="46" letter-spacing="1" fill="#e4e4e7">Wear your <tspan fill="#00e676">allegiance</tspan></text>

  <!-- url -->
  <text x="80" y="560" font-family="DejaVu Sans, sans-serif"
        font-size="28" letter-spacing="3" fill="#8a8a8f">apexswear.co.uk</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`✅ wrote ${OUT} — ${meta.width}×${meta.height} ${Math.round((meta.size||0)/1024)}KB`);

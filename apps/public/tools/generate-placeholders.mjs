// Generates warm-paper / warm-ink placeholder JPEGs for local preview.
// Run: node tools/generate-placeholders.mjs
//
// When real photos are dropped into apps/public/public/img/, they take precedence
// (this script never overwrites existing files unless --force is passed).
import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/img");
const force = process.argv.includes("--force");

const paper = { r: 245, g: 240, b: 232 };
const paperDeep = { r: 14, g: 12, b: 10 };
const inkLight = "#e8ddd0";
const accent = "#8c6f47";

const images = [
  { name: "hero-4_vor_dem_klavier.jpg", w: 2560, h: 1707, label: "hero" },
  { name: "secondary-2_auf_klaviatur_liegend.jpg", w: 2400, h: 1600, label: "intermezzo" },
  { name: "tertiary-10_vor_der_wand.jpg", w: 2400, h: 1500, label: "intermezzo" },
  { name: "about-hero.jpg", w: 2400, h: 1500, label: "biography" },
  { name: "press-hero.jpg", w: 2400, h: 1500, label: "press" },
  { name: "schedule-hero.jpg", w: 2400, h: 1500, label: "schedule" },
  { name: "archive-hero.jpg", w: 2400, h: 1500, label: "archive" },
  { name: "media-hero.jpg", w: 2400, h: 1500, label: "media" },
  { name: "media-elm-court.jpg", w: 1280, h: 720, label: "video" },
  { name: "media-tvc-carnegie.jpg", w: 1280, h: 720, label: "video" },
  { name: "media-yca-winners.jpg", w: 1280, h: 720, label: "video" },
  { name: "media-yca-announcement.jpg", w: 1280, h: 720, label: "video" },
  { name: "media-placeholder.jpg", w: 1280, h: 720, label: "video" },
];

for (let i = 1; i <= 12; i++) {
  images.push({
    name: `gallery-${String(i).padStart(2, "0")}.jpg`,
    w: 800,
    h: 1000 + ((i * 47) % 320),
    label: `${i}`,
  });
}

for (let i = 1; i <= 17; i++) {
  images.push({
    name: `gallery/${String(i).padStart(2, "0")}.jpg`,
    w: 800,
    h: 1000 + ((i * 47) % 320),
    label: `${i}`,
  });
}

const exists = async (p) => {
  try { await access(p, constants.F_OK); return true; }
  catch { return false; }
};

await mkdir(outDir, { recursive: true });

const buildSvg = (w, h, label) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${rgbCss(paperDeep, 0.92)}" />
      <stop offset="100%" stop-color="${rgbCss(paperDeep, 0.78)}" />
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="${rgbCss(paperDeep, 0)}" />
      <stop offset="100%" stop-color="${rgbCss(paperDeep, 0.55)}" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <rect width="${w}" height="${h}" fill="url(#vig)" />
  <text
    x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Georgia, serif"
    font-style="italic"
    font-size="${Math.round(Math.min(w, h) * 0.18)}"
    fill="${inkLight}"
    opacity="0.32"
  >${label}</text>
  <text
    x="50%" y="${h - Math.round(h * 0.06)}"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="${Math.round(Math.min(w, h) * 0.024)}"
    letter-spacing="0.2em"
    fill="${accent}"
    opacity="0.7"
  >PLACEHOLDER</text>
</svg>`;

function rgbCss(c, a) {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

let generated = 0;
let skipped = 0;
for (const img of images) {
  const dest = path.join(outDir, img.name);
  if (!force && (await exists(dest))) { skipped++; continue; }
  await mkdir(path.dirname(dest), { recursive: true });
  const svg = Buffer.from(buildSvg(img.w, img.h, img.label));
  await sharp(svg).jpeg({ quality: 78, mozjpeg: true }).toFile(dest);
  generated++;
}

console.log(`Placeholders: ${generated} generated, ${skipped} skipped (already exist).`);

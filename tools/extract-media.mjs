// Extracts all media entries from source-snapshot/media.html into JSON.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const decode = (s) =>
  s
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&ouml;/g, "ö")
    .replace(/&auml;/g, "ä")
    .replace(/&uuml;/g, "ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const ytIdFromUrl = (u) => {
  if (!u) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = u.match(re);
    if (m) return m[1];
  }
  return null;
};

const sourceOf = (u) => {
  if (!u) return "external";
  if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
  if (/instagram\.com/.test(u)) return "instagram";
  if (/orf\.at/.test(u)) return "orf";
  return "external";
};

const html = await readFile(path.join(root, "source-snapshot/media.html"), "utf8");

const entries = [];
const re = /<!-- MEDIA ENTRY START -->([\s\S]*?)<!-- media entry col END -->/g;

for (const match of html.matchAll(re)) {
  const block = match[1];
  const url =
    (block.match(/<a class="play"\s+href="([^"]+)"/) || [])[1] ?? null;
  const thumb =
    (block.match(/<img class="figure-img[^"]*"\s+src="([^"]+)"/) || [])[1] ?? null;
  const title =
    (block.match(/<h2 class="media-title">([\s\S]*?)<\/h2>/) || [])[1] ?? "";
  const desc =
    (block.match(/<div class="media-entry-description">([\s\S]*?)<\/div>/) ||
      [])[1] ?? "";
  const details =
    (block.match(/<div class="media-entry-details[^"]*">([\s\S]*?)<\/div>/) ||
      [])[1] ?? null;

  entries.push({
    title: decode(title),
    description: decode(desc),
    details: details ? decode(details) : null,
    url,
    source: sourceOf(url),
    youtubeId: ytIdFromUrl(url),
    thumbnail: thumb,
  });
}

await writeFile(
  path.join(root, "apps/public/src/data/media.json"),
  JSON.stringify({ items: entries }, null, 2),
);

console.log(`Media items: ${entries.length}`);

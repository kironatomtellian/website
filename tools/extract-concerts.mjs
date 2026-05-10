// Parses the saved schedule.html and schedule-archive.html snapshots and emits
// JSON arrays of concert entries. Output goes to apps/public/src/data/.
// Run: node tools/extract-concerts.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
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
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Uuml;/g, "Ü")
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
    .replace(/&atilde;/g, "ã")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#x27;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const monthMap = {
  january: "01", february: "02", march: "03", april: "04", may: "05",
  june: "06", july: "07", august: "08", september: "09", october: "10",
  november: "11", december: "12",
};

const parseDate = (s) => {
  const cleaned = s.replace(/^\w+,\s*/, "").trim();
  const m = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})(?:[–-]\d{1,2})?,?\s+(\d{4})$/);
  if (!m) return null;
  const mm = monthMap[m[1].toLowerCase()];
  if (!mm) return null;
  return `${m[3]}-${mm}-${String(m[2]).padStart(2, "0")}`;
};

const extract = (html) => {
  const entries = [];
  const re = /<!-- CALENDAR ENTRY START -->([\s\S]*?)<!-- CALENDAR ENTRY END -->/g;
  for (const match of html.matchAll(re)) {
    const block = match[1];
    const date =
      (block.match(/class="event-date">\s*([\s\S]*?)\s*<\/span>/) || [])[1];
    const programme =
      (block.match(/class="event-program[^"]*">([\s\S]*?)<\/div>/) || [])[1];
    const venue =
      (block.match(/class="event-location">([\s\S]*?)<\/span>/) || [])[1];
    const tickets =
      (block.match(
        /class="event-details-and-tickets[^"]*"[\s\S]*?<a\s+href="([^"]+)"/,
      ) || [])[1];

    if (!date) continue;
    const displayDate = decode(date);
    const iso = parseDate(displayDate);
    entries.push({
      date: iso ?? "",
      displayDate,
      venue: decode(venue ?? ""),
      programme: decode(programme ?? ""),
      ticketsUrl: tickets ?? null,
      type: null,
      orchestra: null,
      conductor: null,
      chamberPartners: [],
      notes: null,
    });
  }
  return entries;
};

const sched = await readFile(
  path.join(root, "source-snapshot/schedule.html"),
  "utf8",
);
const archive = await readFile(
  path.join(root, "source-snapshot/schedule-archive.html"),
  "utf8",
);

const upcoming = extract(sched);
const past = extract(archive);

const outDir = path.join(root, "apps/public/src/data");
await mkdir(outDir, { recursive: true });
await writeFile(
  path.join(outDir, "concerts-upcoming.json"),
  JSON.stringify(upcoming, null, 2),
);
await writeFile(
  path.join(outDir, "concerts-past.json"),
  JSON.stringify(past, null, 2),
);

console.log(`Upcoming: ${upcoming.length}`);
console.log(`Past: ${past.length}`);

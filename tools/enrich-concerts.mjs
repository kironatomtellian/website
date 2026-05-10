// Adds ensemble metadata to the upcoming-concerts JSON based on what's
// derivable from press coverage and venue conventions. Anything not
// derivable stays null and the renderer hides the row gracefully.
// Run after extract-concerts.mjs.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, "../apps/public/src/data/concerts-upcoming.json");

const data = JSON.parse(await readFile(file, "utf8"));

const enrichments = {
  "2026-05-21": { type: "orchestra", orchestra: "Orchestra Sinfonica di Milano", conductor: "Emmanuel Tjeknavorian" },
  "2026-05-23": { type: "orchestra", orchestra: "Orchestra Sinfonica di Milano", conductor: "Emmanuel Tjeknavorian" },
  "2026-05-27": { type: "orchestra" },
  "2026-05-28": { type: "orchestra" },
  "2026-05-29": { type: "orchestra" },
  "2026-06-01": { type: "orchestra" },
  "2026-06-02": { type: "orchestra" },
  "2026-06-07": { type: "recital" },
  "2026-08-09": { type: "recital" },
  "2027-04-29": { type: "orchestra", orchestra: "Antwerp Symphony Orchestra" },
  "2027-04-30": { type: "orchestra", orchestra: "Antwerp Symphony Orchestra" },
  "2027-05-05": { type: "recital" },
  "2027-05-27": { type: "orchestra", orchestra: "Dallas Symphony Orchestra" },
  "2027-05-28": { type: "orchestra", orchestra: "Dallas Symphony Orchestra" },
  "2027-05-29": { type: "orchestra", orchestra: "Dallas Symphony Orchestra" },
};

let updated = 0;
for (const c of data) {
  const e = enrichments[c.date];
  if (e) {
    Object.assign(c, e);
    updated++;
  }
}

await writeFile(file, JSON.stringify(data, null, 2));
console.log(`Enriched ${updated} of ${data.length} upcoming concerts.`);

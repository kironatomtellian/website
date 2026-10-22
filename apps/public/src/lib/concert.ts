export interface ChamberPartner {
  name: string;
  instrument?: string;
}

export interface Concert {
  date: string;
  displayDate: string;
  city?: string | null;
  venue: string;
  programme: string;
  ticketsUrl?: string | null;
  type?: "orchestra" | "recital" | "chamber" | null;
  orchestra?: string | null;
  conductor?: string | null;
  chamberPartners?: ChamberPartner[] | null;
  notes?: string | null;
}

export function ensembleLabel(c: Concert): string | null {
  if (c.type === "orchestra") {
    const parts: string[] = [];
    if (c.orchestra) parts.push(`with ${c.orchestra}`);
    if (c.conductor) parts.push(`conducted by ${c.conductor}`);
    if (parts.length === 0) return "Orchestral concert";
    return parts.join(" · ");
  }
  if (c.type === "recital") return "Solo recital";
  if (c.type === "chamber") {
    if (!c.chamberPartners || c.chamberPartners.length === 0) {
      return "Chamber music";
    }
    const names = c.chamberPartners
      .map((p) => (p.instrument ? `${p.name} (${p.instrument})` : p.name))
      .join(" · ");
    return `Chamber music · ${names}`;
  }
  return null;
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function groupByMonth(concerts: Concert[]): Array<{ key: string; label: string; items: Concert[] }> {
  const groups = new Map<string, { label: string; items: Concert[] }>();
  for (const c of concerts) {
    if (!c.date) continue;
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en", { month: "long", year: "numeric" });
    let g = groups.get(key);
    if (!g) {
      g = { label, items: [] };
      groups.set(key, g);
    }
    g.items.push(c);
  }
  return Array.from(groups.entries()).map(([key, v]) => ({ key, ...v }));
}

export function groupByYear(concerts: Concert[]): Array<{ year: string; items: Concert[] }> {
  const groups = new Map<string, Concert[]>();
  for (const c of concerts) {
    if (!c.date) continue;
    const year = c.date.slice(0, 4);
    let arr = groups.get(year);
    if (!arr) { arr = []; groups.set(year, arr); }
    arr.push(c);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, items]) => ({ year, items }));
}

const AMERICAS = ["USA", "Colombia", "Brazil", "Mexico", "Canada", "Argentina", "Chile", "NY", "Florida"];

/** Large display name for a concert: its city, else the first part of the venue. */
export function cityOf(c: Concert): string {
  if (c.city) return c.city;
  return c.venue.split(",")[0].trim();
}

/** "europe" or "americas", read off the country at the end of the venue. */
export function regionOf(c: Concert): "europe" | "americas" {
  const tail = c.venue.split(",").pop()?.trim() ?? "";
  return AMERICAS.some((a) => tail.includes(a)) ? "americas" : "europe";
}

/** Hall name without the country suffix. */
export function hallOf(c: Concert): string {
  const parts = c.venue.split(",").map((p) => p.trim());
  return parts.length > 1 ? parts.slice(0, -1).join(", ") : parts[0];
}

/**
 * Upcoming vs past is decided by the build date, not by which JSON file an
 * entry sits in, so a concert moves to the archive on the next build after it
 * happened, without anyone editing the files.
 */
export function splitByDate(
  upcoming: Concert[],
  past: Concert[],
  now: Date = new Date(),
): { upcoming: Concert[]; past: Concert[] } {
  const today = now.toISOString().slice(0, 10);
  const all = [...upcoming, ...past].filter((c) => c.date);
  const seen = new Set<string>();
  const unique = all.filter((c) => {
    const key = `${c.date}|${c.venue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    upcoming: unique.filter((c) => c.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    past: unique.filter((c) => c.date < today).sort((a, b) => b.date.localeCompare(a.date)),
  };
}

/** Consecutive nights with the same hall and programme, shown as one row. */
export function groupRuns(concerts: Concert[]): Concert[][] {
  const runs: Concert[][] = [];
  for (const c of concerts) {
    const prev = runs[runs.length - 1];
    if (prev && prev[0].venue === c.venue && prev[0].programme === c.programme) prev.push(c);
    else runs.push([c]);
  }
  return runs;
}

/** "APR 1 + 3" over "2027 · 2 concerts", so a run never reads as one date. */
export function runLabel(runIn: Concert[]): { days: string; sub: string } {
  const run = [...runIn].sort((a, b) => a.date.localeCompare(b.date));
  const first = run[0].date;
  const month = new Date(first + "T12:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" }).toUpperCase();
  const days = run.map((c) => String(Number(c.date.slice(8, 10)))).join(" + ");
  const year = first.slice(0, 4);
  return { days: `${month} ${days}`, sub: run.length > 1 ? `${year} · ${run.length} concerts` : year };
}

const COUNTRY_FIX: Record<string, string> = { AT: "Austria", Salzburg: "Austria", NY: "USA", "New York": "USA", Florida: "USA" };
const CONTINENT: Record<string, string> = { USA: "Americas", Colombia: "Americas", Brazil: "Americas", Israel: "Asia" };

/** Country, read off the end of the venue ("NY" and "Florida" count as USA). */
export function countryOf(c: Concert): string {
  const tail = c.venue.split(",").pop()?.trim() ?? "";
  return COUNTRY_FIX[tail] ?? tail;
}

/** Continent for the schedule counts: the Americas count as one, anything unlisted as Europe. */
export function continentOf(c: Concert): string {
  return CONTINENT[countryOf(c)] ?? "Europe";
}

/** Main line of a concert row: the programme, or the kind of concert while it is still open. */
export function whatOf(c: Concert): string {
  return c.programme === "To be announced" || !c.programme ? ensembleLabel(c) ?? "Programme to be announced" : c.programme;
}

/** Second line of a concert row: who with, else the hall. */
export function withLineOf(c: Concert): string {
  return c.programme === "To be announced" ? hallOf(c) : ensembleLabel(c) ?? hallOf(c);
}

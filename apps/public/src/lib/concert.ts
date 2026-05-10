export interface ChamberPartner {
  name: string;
  instrument?: string;
}

export interface Concert {
  date: string;
  displayDate: string;
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

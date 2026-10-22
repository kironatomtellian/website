import type { APIRoute } from "astro";
import { cityOf, ensembleLabel, hallOf } from "../lib/concert";
import { upcomingConcerts } from "../lib/season";

// A subscribable calendar of every upcoming concert. All-day events, because
// start times are not kept in the data.
const esc = (s: string) => s.replace(/[\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
const day = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

export const GET: APIRoute = () => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const events = upcomingConcerts.map((c) => {
    const details = [c.programme, ensembleLabel(c), c.ticketsUrl].filter(Boolean).join("\n");
    return [
      "BEGIN:VEVENT",
      `UID:${c.date}-${day(c.venue.replace(/[^a-z0-9]/gi, "").slice(0, 24))}@kironatomtellian.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(c.date)}`,
      `DTEND;VALUE=DATE:${nextDay(c.date)}`,
      `SUMMARY:${esc(`Kiron Atom Tellian · ${cityOf(c)}`)}`,
      `LOCATION:${esc(hallOf(c))}`,
      `DESCRIPTION:${esc(details)}`,
      c.ticketsUrl ? `URL:${c.ticketsUrl}` : "",
      "END:VEVENT",
    ].filter(Boolean).join("\r\n");
  });

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kironatomtellian.com//Concerts//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Kiron Atom Tellian — Concerts",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(body + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
};

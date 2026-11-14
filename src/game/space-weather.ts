// Turns real NASA DONKI records into what happens on each game sol.
import { ARCHIVED_SUN } from "./data/sun-archive";
import { KM_PER_AU, MISSION_SOLS } from "./constants";
import { earthMars } from "./orbit";
import type { SolSpaceWeather, SunWindow, SunWindowRaw } from "./types";

const DONKI = "https://ccmc.gsfc.nasa.gov/DONKI/WS/get";
/** Only fast CMEs become game events; slower ones are common and mostly harmless. */
export const FAST_CME_KMS = 800;

const flareRank = (c: string) => {
  const base = { A: 0, B: 1, C: 2, M: 3, X: 4 }[c[0] as "A"] ?? 0;
  return base * 100 + (parseFloat(c.slice(1)) || 0);
};

export function strongest(classes: string[]): string | null {
  if (!classes.length) return null;
  return [...classes].sort((a, b) => flareRank(b) - flareRank(a))[0];
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildSchedule(win: SunWindowRaw, sols = MISSION_SOLS): SolSpaceWeather[] {
  const days: SolSpaceWeather[] = Array.from({ length: sols }, (_, i) => {
    const date = addDays(win.start, i);
    const flares = win.flares.filter((f) => f.t.startsWith(date)).map((f) => f.c);
    return {
      date,
      flares,
      strongestFlare: strongest(flares),
      sep: win.seps.some((t) => t.startsWith(date)),
      cmeLaunches: [],
      cmeArrival: null,
    };
  });
  for (const c of win.cmes) {
    if (c.v < FAST_CME_KMS) continue;
    const i = days.findIndex((d) => c.t.startsWith(d.date));
    if (i < 0) continue;
    // Travel time to Mars at the real Mars–Sun distance that day (constant speed: a simplification).
    const marsKm = earthMars(new Date(days[i].date + "T12:00:00Z")).marsSunAU * KM_PER_AU;
    const travelSols = Math.max(1, Math.round(marsKm / c.v / 86400));
    const arrivesSol = i + 1 + travelSols; // 1-based sol
    days[i].cmeLaunches.push({ speed: c.v, arrivesSol, travelSols });
    const j = arrivesSol - 1;
    if (j < sols && (!days[j].cmeArrival || days[j].cmeArrival!.speed < c.v)) {
      days[j].cmeArrival = { speed: c.v };
    }
  }
  return days;
}

async function getJson(url: string, signal: AbortSignal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`DONKI ${r.status}`);
  const t = await r.text();
  return t.trim() ? JSON.parse(t) : [];
}

interface DonkiFlr { peakTime?: string; beginTime: string; classType?: string }
interface DonkiSep { eventTime: string }
interface DonkiCme { startTime: string; cmeAnalyses?: { speed?: number; isMostAccurate?: boolean }[] | null }

export async function fetchDonkiWindow(start: string, end: string, name: string, source: SunWindow["source"]): Promise<SunWindow> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const q = `?startDate=${start}&endDate=${end}`;
    const [flr, sep, cme] = (await Promise.all([
      getJson(`${DONKI}/FLR${q}`, ctrl.signal),
      getJson(`${DONKI}/SEP${q}`, ctrl.signal),
      getJson(`${DONKI}/CME${q}`, ctrl.signal),
    ])) as [DonkiFlr[], DonkiSep[], DonkiCme[]];
    return {
      id: `${source}-${start}`,
      name,
      start,
      end,
      source,
      flares: flr.filter((f) => f.classType).map((f) => ({ t: f.peakTime || f.beginTime, c: f.classType! })),
      seps: sep.map((s) => s.eventTime),
      cmes: cme
        .map((c) => {
          const list = c.cmeAnalyses ?? [];
          const best = list.find((a) => a.isMostAccurate && a.speed) ?? list.find((a) => a.speed);
          return best?.speed ? { t: c.startTime, v: Math.round(best.speed) } : null;
        })
        .filter((x): x is { t: string; v: number } => !!x),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function recentWindowDates(today = new Date()) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
  const endIso = end.toISOString().slice(0, 10);
  return { start: addDays(endIso, -(MISSION_SOLS - 1)), end: endIso };
}

export function randomWindowDates(rand: () => number, today = new Date()) {
  const min = Date.UTC(2012, 0, 1);
  const max = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - 60 * 86400000;
  const start = new Date(min + Math.floor(rand() * (max - min) / 86400000) * 86400000).toISOString().slice(0, 10);
  return { start, end: addDays(start, MISSION_SOLS - 1) };
}

export function archived(id: string, source: SunWindow["source"] = "archived"): SunWindow {
  const w = ARCHIVED_SUN.find((x) => x.id === id) ?? ARCHIVED_SUN[0];
  return { ...w, source };
}

export function randomArchived(rand: () => number): SunWindow {
  return archived(ARCHIVED_SUN[Math.floor(rand() * ARCHIVED_SUN.length)].id, "archived-fallback");
}

export function donkiBrowseUrl(date: string) {
  return `https://kauai.ccmc.gsfc.nasa.gov/DONKI/search/?startDate=${date}&endDate=${date}`;
}

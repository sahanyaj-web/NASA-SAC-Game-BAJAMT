// Pure game rules. No React, no network — easy to test.
import {
  AIR_PER_POWER, BASE_BATTERY_CAP, BASE_SOLAR, CME_ARRIVAL_DOSE, DUST_PER_SOL, DUST_STORM_FACTOR,
  FOOD_PER_POWER, LATE_SHELTER_FACTOR, MARS_SURFACE_MSV_PER_SOL, MAX_ALLOC, MISSION_DOSE_LIMIT,
  MISSION_SOLS, SCIENCE_PER_POWER, SHELTER_FACTOR, SHIELD_FACTOR, heaterCost, stormDoseFor,
} from "./constants";
import { DECK } from "./events";
import type { Allocation, CrateId, Effect, GameEvent, GameState, MarsWeatherSol, SolSpaceWeather } from "./types";

export interface Crate {
  id: CrateId;
  name: string;
  emoji: string;
  what: string;
  real: string;
}

export const CRATES: Crate[] = [
  { id: "solar", name: "Extra solar panels", emoji: "🔆", what: "+3⚡ every sunny sol (less when dusty)", real: "Most Mars robots ran on sunlight." },
  { id: "reactor", name: "Mini nuclear reactor", emoji: "⚛️", what: "+3⚡ every sol — even in dust storms", real: "NASA's Kilopower (KRUSTY) reactor was tested in 2018." },
  { id: "water", name: "Water tanks", emoji: "💧", what: "+1 shield level forever and +2 days of air", real: "Water blocks radiation, and splitting it makes oxygen." },
  { id: "battery", name: "Big battery", emoji: "🔋", what: "Store 8⚡ more for nights and storms", real: "Batteries kept rovers warm through freezing Mars nights." },
  { id: "food", name: "Food stash", emoji: "🥫", what: "+5 days of food", real: "Astronaut food is packed to last years." },
  { id: "rover", name: "Science rover", emoji: "🚙", what: "+1 science every sol, automatically", real: "Rovers explore while the crew stays safe inside." },
];

export const CRATE_PICKS = 2;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGame(seed: number, crates: CrateId[]): GameState {
  const has = (c: CrateId) => crates.includes(c);
  return {
    sol: 1,
    totalSols: MISSION_SOLS,
    air: 5 + (has("water") ? 2 : 0),
    food: 6 + (has("food") ? 5 : 0),
    battery: 5,
    batteryCap: BASE_BATTERY_CAP + (has("battery") ? 8 : 0),
    dose: 0,
    doseLimit: MISSION_DOSE_LIMIT,
    science: 0,
    panel: 1,
    shieldBonus: has("water") ? 1 : 0,
    crates,
    statuses: {},
    seenEvents: [],
    log: [],
    over: null,
    seed,
  };
}

export interface PowerToday {
  solar: number;
  reactor: number;
  total: number;
  available: number; // total + battery
}

export function powerToday(s: GameState): PowerToday {
  const panels = (BASE_SOLAR + (s.crates.includes("solar") ? 3 : 0)) * s.panel * (s.statuses.dustStorm ? DUST_STORM_FACTOR : 1);
  const solar = Math.max(0, Math.round(panels));
  const reactor = s.crates.includes("reactor") ? 3 : 0;
  return { solar, reactor, total: solar + reactor, available: solar + reactor + s.battery };
}

export const allocTotal = (a: Allocation) => a.air + a.greenhouse + a.shield + a.science;

export function clampAlloc(a: Allocation): Allocation {
  return {
    air: Math.max(0, Math.min(MAX_ALLOC.air, a.air)),
    greenhouse: Math.max(0, Math.min(MAX_ALLOC.greenhouse, a.greenhouse)),
    shield: Math.max(0, Math.min(MAX_ALLOC.shield, a.shield)),
    science: Math.max(0, Math.min(MAX_ALLOC.science, a.science)),
  };
}

export function shieldLevel(s: GameState, a: Allocation) {
  return Math.min(SHIELD_FACTOR.length - 1, a.shield + s.shieldBonus);
}

export type Shelter = "full" | "late" | "none";

export interface SolContext {
  weather: MarsWeatherSol;
  space: SolSpaceWeather;
  /** previous sol's space weather (particles can follow a flare from late the day before) */
  prevSpace?: SolSpaceWeather | undefined;
  shelter: Shelter;
}

export interface Forecast {
  airMade: number;
  foodMade: number;
  scienceMade: number;
  doseToday: number;
  baseDose: number;
  stormDose: number;
  heat: number;
  batteryAfterDay: number;
  wasted: number;
  batteryAfterNight: number;
  coldNight: boolean;
  airAfter: number;
  foodAfter: number;
  shieldLevel: number;
}

export function stormBaseDose(ctx: Pick<SolContext, "space" | "prevSpace">) {
  let d = 0;
  if (ctx.space.sep) d += stormDoseFor(ctx.space.strongestFlare ?? ctx.prevSpace?.strongestFlare ?? null);
  if (ctx.space.cmeArrival) d += CME_ARRIVAL_DOSE;
  return d;
}

export function forecast(s: GameState, alloc: Allocation, ctx: SolContext): Forecast {
  const p = powerToday(s);
  const spent = allocTotal(alloc);
  const sheltered = ctx.shelter === "full";
  const airMade = alloc.air * AIR_PER_POWER * (s.statuses.airClog ? 0.5 : 1);
  const foodMade = alloc.greenhouse * FOOD_PER_POWER * (sheltered ? 0.5 : 1);
  const extra =
    (s.crates.includes("rover") ? 1 : 0) - (s.statuses.fatigue ? 1 : 0) + (s.statuses.happyCrew ? 1 : 0);
  const scienceMade = sheltered ? 0 : Math.max(0, alloc.science * SCIENCE_PER_POWER + extra);
  const lvl = shieldLevel(s, alloc);
  const factor = SHIELD_FACTOR[lvl] ?? 1;
  const baseDose = MARS_SURFACE_MSV_PER_SOL * factor;
  const storm = stormBaseDose(ctx);
  const stormFactor =
    ctx.shelter === "full" ? Math.min(factor, SHELTER_FACTOR) : ctx.shelter === "late" ? Math.min(factor, LATE_SHELTER_FACTOR) : factor;
  const stormDose = storm * stormFactor;
  const raw = p.available - spent;
  const batteryAfterDay = Math.min(s.batteryCap, raw);
  const wasted = Math.max(0, raw - s.batteryCap);
  const heat = heaterCost(ctx.weather.min);
  const coldNight = batteryAfterDay < heat;
  const batteryAfterNight = coldNight ? 0 : batteryAfterDay - heat;
  return {
    airMade,
    foodMade,
    scienceMade,
    baseDose,
    stormDose,
    doseToday: baseDose + stormDose,
    heat,
    batteryAfterDay,
    wasted,
    batteryAfterNight,
    coldNight,
    airAfter: s.air + airMade - 1,
    foodAfter: s.food + foodMade - 1 - (coldNight ? 1 : 0),
    shieldLevel: lvl,
  };
}

export function applyEffect(s: GameState, e: Effect): GameState {
  const n: GameState = { ...s, statuses: { ...s.statuses } };
  n.air = Math.max(0, n.air + (e.air ?? 0));
  n.food = Math.max(0, n.food + (e.food ?? 0));
  n.battery = Math.max(0, Math.min(n.batteryCap, n.battery + (e.battery ?? 0)));
  n.science = Math.max(0, n.science + (e.science ?? 0));
  n.dose = n.dose + (e.dose ?? 0);
  if (e.panel) n.panel = Math.max(0.2, Math.min(1, n.panel + e.panel));
  if (e.setPanel !== undefined) n.panel = e.setPanel;
  if (e.shieldBonus) n.shieldBonus += e.shieldBonus;
  for (const st of e.status ?? []) n.statuses[st.id] = Math.max(n.statuses[st.id] ?? 0, st.sols);
  for (const id of e.clearStatus ?? []) delete n.statuses[id];
  return checkOver(n);
}

/** Can the player afford this option right now? (battery costs need stored power) */
export function canAfford(s: GameState, e: Effect) {
  return (e.battery ?? 0) >= 0 || s.battery + (e.battery ?? 0) >= 0;
}

export function stormEvent(ctx: Pick<SolContext, "space" | "prevSpace">, oneWayMin: number): GameEvent | null {
  const { space } = ctx;
  if (!space.sep && !space.cmeArrival) return null;
  const isSep = space.sep;
  const flare = space.strongestFlare ?? ctx.prevSpace?.strongestFlare;
  const dose = stormBaseDose(ctx);
  return {
    id: isSep ? "sep" : "cme",
    kind: isSep ? "storm" : "cme",
    emoji: isSep ? "☢️" : "🌊",
    title: isSep ? "RADIATION ALERT!" : "Solar plasma cloud arriving!",
    text: isSep
      ? `On ${space.date}, NASA really recorded a burst of super-fast solar particles${flare ? ` after a ${flare} flare` : ""}. Your particle counter is starting to climb. Particles will hit in about 30 minutes. Without protection this storm adds ${dose} mSv.`
      : `A fast cloud of solar plasma (a CME, ${space.cmeArrival!.speed.toLocaleString()} km/s) is reaching Mars. It pushes extra particles ahead of it: up to ${dose} mSv without protection.`,
    fact: {
      text: "When the Sun had huge flares in September 2017, NASA's Curiosity rover measured radiation on Mars's surface more than double anything it had seen before.",
      source: "NASA JPL / Curiosity RAD & MAVEN",
      url: "https://www.jpl.nasa.gov/news/nasa-mission-tracks-a-sudden-solar-event-at-mars/",
    },
    options: [
      { id: "shelter", label: "Everyone into the storm shelter!", cost: "No science today and the greenhouse gets only half care", gain: "Blocks most of the storm", effect: { shelter: "full" } },
      { id: "work", label: "Keep working", cost: "Storm radiation gets through your water walls", gain: "A normal work day", effect: { shelter: "none" } },
      {
        id: "ask",
        label: "Ask Mission Control on Earth",
        cost: `Your question takes ${Math.round(oneWayMin)} min to reach Earth, and the answer takes ${Math.round(oneWayMin)} min to come back`,
        gain: "Experts decide for you… if they answer in time",
        effect: {},
        askEarth: true,
      },
    ],
  };
}

export function drawDeckEvent(s: GameState, oneWayMin: number): GameEvent | null {
  const rng = mulberry32(s.seed * 31 + s.sol * 977);
  if (s.sol === 1 || rng() > 0.7) return null;
  const pool = DECK.filter((c) => !s.seenEvents.includes(c.id) && (!c.when || c.when(s)));
  if (!pool.length) return null;
  const total = pool.reduce((t, c) => t + c.weight, 0);
  let r = rng() * total;
  for (const c of pool) {
    r -= c.weight;
    if (r <= 0) return c.build(s, oneWayMin);
  }
  return pool[pool.length - 1]!.build(s, oneWayMin);
}

export function eventForSol(s: GameState, ctx: Pick<SolContext, "space" | "prevSpace">, oneWayMin: number) {
  return stormEvent(ctx, oneWayMin) ?? drawDeckEvent(s, oneWayMin);
}

export interface SolReport {
  forecast: Forecast;
  notes: string[];
}

export function endSol(s: GameState, alloc: Allocation, ctx: SolContext): { state: GameState; report: SolReport } {
  const f = forecast(s, alloc, ctx);
  const notes: string[] = [];
  const rng = mulberry32(s.seed * 7 + s.sol * 131);
  const n: GameState = { ...s, statuses: { ...s.statuses } };
  const p = powerToday(s);
  n.air = Math.max(0, f.airAfter);
  n.food = f.foodAfter;
  n.science = s.science + f.scienceMade;
  n.dose = s.dose + f.doseToday;
  n.battery = f.batteryAfterNight;
  if (f.wasted > 0) notes.push(`Battery was full, so ${f.wasted}⚡ of sunlight went to waste.`);
  if (f.coldNight) notes.push(`Not enough battery to heat tonight (${ctx.weather.min}°C outside). Some plants froze: −1 day of food.`);
  if (f.stormDose > 0) notes.push(`The storm added ${f.stormDose.toFixed(1)} mSv of radiation.`);
  if (s.statuses.moldRisk && rng() < 0.4) {
    n.food -= 2;
    delete n.statuses.moldRisk;
    notes.push("The mold spread! −2 days of food.");
  }
  for (const k of Object.keys(n.statuses) as (keyof GameState["statuses"])[]) {
    const left = (n.statuses[k] ?? 0) - 1;
    if (left <= 0) delete n.statuses[k];
    else n.statuses[k] = left;
  }
  n.food = Math.max(0, n.food);
  n.panel = Math.max(0.3, +(s.panel - DUST_PER_SOL).toFixed(2));
  n.log = [
    ...s.log,
    { sol: s.sol, air: n.air, food: n.food, battery: n.battery, dose: +n.dose.toFixed(2), science: n.science, solar: p.total, notes },
  ];
  n.sol = s.sol + 1;
  return { state: checkOver(n), report: { forecast: f, notes } };
}

export function checkOver(s: GameState): GameState {
  if (s.over) return s;
  if (s.air <= 0) return { ...s, over: { result: "air", message: "The oxygen ran out. The crew had to escape in their return rocket." } };
  if (s.food <= 0) return { ...s, over: { result: "food", message: "The food ran out. The crew had to head home early." } };
  if (s.dose >= s.doseLimit)
    return { ...s, over: { result: "dose", message: "The crew got too much radiation. The flight surgeon ordered everyone home." } };
  if (s.sol > s.totalSols) return { ...s, over: { result: "success", message: "Mission complete! Your crew survived every sol on Mars." } };
  return s;
}

export function markSeen(s: GameState, id: string): GameState {
  return s.seenEvents.includes(id) ? s : { ...s, seenEvents: [...s.seenEvents, id] };
}

export interface Rating {
  stars: number;
  badges: { emoji: string; name: string; why: string }[];
}

export function rate(s: GameState): Rating {
  const badges: Rating["badges"] = [];
  const ok = s.over?.result === "success";
  if (ok) badges.push({ emoji: "🏁", name: "Mission Complete", why: `Survived all ${s.totalSols} sols` });
  if (s.science >= 30) badges.push({ emoji: "🔬", name: "Star Scientist", why: "30+ science points" });
  if (ok && s.dose < s.doseLimit / 2) badges.push({ emoji: "🛡️", name: "Radiation Guardian", why: "Kept dose under half the limit" });
  if (ok && s.air >= 3 && s.food >= 3) badges.push({ emoji: "🫁", name: "Careful Planner", why: "Finished with 3+ days of air and food" });
  const stars = (ok ? 1 : 0) + (s.science >= 15 ? 1 : 0) + (s.science >= 30 ? 1 : 0) + (ok && s.dose < s.doseLimit / 2 ? 1 : 0);
  return { stars: Math.min(3, stars), badges };
}

export const emptyAlloc = (): Allocation => ({ air: 0, greenhouse: 0, shield: 0, science: 0 });
/** Starting suggestion: just enough to stay even on air and food. */
export const suggestedAlloc = (): Allocation => ({ air: 2, greenhouse: 3, shield: 0, science: 0 });

/** Spacewalk to brush the panels: costs suit oxygen and outdoor radiation. */
export const CLEAN_PANELS_EFFECT: Effect = { air: -0.5, dose: 0.3, setPanel: 1 };

/** Shrink a plan to fit the power actually available (science goes first, air last). */
export function fitAlloc(a: Allocation, available: number): Allocation {
  const out = { ...a };
  let over = allocTotal(out) - Math.max(0, available);
  for (const k of ["science", "shield", "greenhouse", "air"] as const) {
    if (over <= 0) break;
    const cut = Math.min(out[k], over);
    out[k] -= cut;
    over -= cut;
  }
  return out;
}

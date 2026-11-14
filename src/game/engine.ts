// Pure game rules. No React, no network — easy to test.
import {
  AIR_PER_POWER, BASE_BATTERY_CAP, BASE_SOLAR, CME_ARRIVAL_DOSE, DUST_PER_SOL, DUST_STORM_FACTOR,
  FOOD_PER_POWER, LATE_SHELTER_FACTOR, MARS_SURFACE_MSV_PER_SOL, MAX_ALLOC, MISSION_DOSE_LIMIT,
  RESEARCH_CAP, MOON_DUST_PER_DAY, MOON_SURFACE_MSV_PER_DAY, SCIENCE_PER_POWER, SHELTER_FACTOR, SHIELD_FACTOR, heaterCost, stormDoseFor,
} from "./constants";
import { DECK, firstDayEvent } from "./events";
import { flarePhrase, placeWords } from "./words";
import type { Allocation, CrateId, Place, Effect, EventOption, GameEvent, GameState, MarsWeatherSol, SolSpaceWeather } from "./types";

export interface Crate {
  id: CrateId;
  name: string;
  emoji: string;
  what: string;
  real: string;
}

export const CRATES: Crate[] = [
  { id: "solar", name: "Extra solar panels", emoji: "🔆", what: "More sunlight power to refill your battery", real: "Lots of NASA's Mars robots ran on sunlight." },
  { id: "reactor", name: "Mini nuclear power plant", emoji: "⚛️", what: "Extra power every day, even in dust storms", real: "NASA tested a small nuclear power maker called Kilopower in 2018." },
  { id: "water", name: "Water tanks", emoji: "💧", what: "Better radiation blocking and bigger air tanks", real: "Water blocks radiation, and water can be turned into oxygen." },
  { id: "battery", name: "Big battery", emoji: "🔋", what: "A bigger full battery lasts longer at night", real: "Batteries kept NASA's rovers warm on freezing Mars nights." },
  { id: "food", name: "Food stash", emoji: "🥫", what: "Bigger full food stores last longer", real: "Astronaut food is packed so it lasts for years." },
  { id: "rover", name: "Robot science car", emoji: "🚙", what: "Helps keep your research system working each day", real: "Robot cars (rovers) explore while the crew stays safe inside." },
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

export function createGame(seed: number, crates: CrateId[], place: Place = "mars"): GameState {
  const has = (c: CrateId) => crates.includes(c);
  return {
    sol: 1,
    air: 5 + (has("water") ? 2 : 0),
    airCap: 5 + (has("water") ? 2 : 0),
    food: 6 + (has("food") ? 5 : 0),
    foodCap: 6 + (has("food") ? 5 : 0),
    battery: BASE_BATTERY_CAP + (has("battery") ? 8 : 0),
    batteryCap: BASE_BATTERY_CAP + (has("battery") ? 8 : 0),
    dose: 0,
    doseLimit: MISSION_DOSE_LIMIT,
    science: RESEARCH_CAP,
    scienceCap: RESEARCH_CAP,
    panel: 1,
    shieldBonus: has("water") ? 1 : 0,
    crates,
    statuses: {},
    seenEvents: [],
    story: [],
    log: [],
    over: null,
    seed,
    place,
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
  // Panels folded away (to protect them from a dust storm) make nothing.
  const solar = s.statuses.panelsAway ? 0 : Math.max(0, Math.round(panels));
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
  const baseDose = (s.place === "moon" ? MOON_SURFACE_MSV_PER_DAY : MARS_SURFACE_MSV_PER_SOL) * factor;
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

const capped = (value: number, max: number) => Math.max(0, Math.min(max, value));

/** All visible systems share a 0–100% scale; physical units stay inside the engine. */
export function resourcePercentages(s: Pick<GameState, "air" | "airCap" | "food" | "foodCap" | "battery" | "batteryCap" | "dose" | "doseLimit" | "science" | "scienceCap">) {
  const percent = (n: number, cap: number) => Math.round(capped(n / cap * 100, 100) * 10) / 10;
  return { air: percent(s.air, s.airCap), food: percent(s.food, s.foodCap), power: percent(s.battery, s.batteryCap), safety: percent(s.doseLimit - s.dose, s.doseLimit), research: percent(s.science, s.scienceCap) };
}

export function applyEffect(s: GameState, e: Effect): GameState {
  const n: GameState = { ...s, statuses: { ...s.statuses } };
  n.air = capped(n.air + (e.air ?? 0), n.airCap);
  n.food = capped(n.food + (e.food ?? 0), n.foodCap);
  n.battery = Math.max(0, Math.min(n.batteryCap, n.battery + (e.battery ?? 0)));
  n.science = capped(n.science + (e.science ?? 0), n.scienceCap);
  n.dose = capped(n.dose + (e.dose ?? 0), n.doseLimit);
  if (e.panel) n.panel = Math.max(0.2, Math.min(1, n.panel + e.panel));
  if (e.setPanel !== undefined) n.panel = e.setPanel;
  if (e.shieldBonus) n.shieldBonus += e.shieldBonus;
  if (e.batteryCap) {
    n.batteryCap = Math.max(0, n.batteryCap + e.batteryCap);
    n.battery = Math.min(n.battery, n.batteryCap);
  }
  for (const st of e.status ?? []) n.statuses[st.id] = Math.max(n.statuses[st.id] ?? 0, st.sols);
  for (const id of e.clearStatus ?? []) delete n.statuses[id];
  return checkOver(n);
}

export function stormEvent(ctx: Pick<SolContext, "space" | "prevSpace">, _oneWayMin: number, place: Place = "mars"): GameEvent | null {
  const { space } = ctx;
  if (!space.sep && !space.cmeArrival) return null;
  const isSep = space.sep;
  const flare = space.strongestFlare ?? ctx.prevSpace?.strongestFlare;
  const dose = stormBaseDose(ctx);
  const P = placeWords(place);
  return {
    id: isSep ? "sep" : "cme",
    kind: isSep ? "storm" : "cme",
    who: "mia",
    emoji: isSep ? "☢️" : "🌊",
    title: isSep ? "RADIATION STORM!" : "A giant Sun cloud is here!",
    text: isSep
      ? `On ${space.date}, NASA really saw the Sun shoot out tiny, invisible, super-fast bits${flare ? ` after ${flarePhrase(flare)}` : ""}. Your radiation alarm is beeping! The storm will hit in about 30 minutes. If nobody hides, it adds ${dose} radiation units.`
      : `A giant cloud of hot gas from the Sun is reaching ${P.name}. It left the Sun going ${space.cmeArrival?.speed.toLocaleString()} km every second! It pushes radiation ahead of it: up to ${dose} radiation units if nobody hides.`,
    fact: place === "moon" ? {
      text: "The Moon has no air at all to block the Sun's storms. That's why NASA is planning storm shelters for Artemis astronauts, and why NASA's LRO spacecraft measures radiation around the Moon.",
      source: "NASA — Lunar Reconnaissance Orbiter",
      url: "https://science.nasa.gov/mission/lro/",
    } : {
      text: "When the Sun had huge flashes in September 2017, NASA's Curiosity rover measured radiation on Mars more than double what it normally sees.",
      source: "NASA — Jet Propulsion Laboratory",
      url: "https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface",
    },
    options: [
      {
        id: "shelter",
        label: "Everyone into the storm shelter!",
        cost: "No science today, and the plants only get half the care",
        gain: "The shelter blocks most of the storm",
        effect: { shelter: "full", science: -1 },
        outcome: "Everyone squeezes into the tiny shelter behind thick water walls. It's cramped, but the storm's invisible bits mostly can't get through.",
      },
      {
        id: "work",
        label: "Keep working",
        cost: `Storm radiation gets through: up to ${dose} radiation units if your water walls are thin`,
        gain: "A normal work day: science and plant care go on",
        effect: { shelter: "none" },
        outcome: "The crew keeps working while the alarm beeps. Your water walls are the only thing blocking the storm today.",
      },
    ],
  };
}

/** Every day tells a story: day 1 is the landing, later days draw a new problem from the deck. */
export function drawDeckEvent(s: GameState, oneWayMin: number): GameEvent | null {
  if (s.sol === 1) return firstDayEvent(s);
  const rng = mulberry32(s.seed * 31 + s.sol * 977);
  const eligible = DECK.filter((c) => !c.when || c.when(s));
  const unseen = eligible.filter((c) => !s.seenEvents.includes(c.id));
  const pool = (unseen.length ? unseen : eligible)
    .map((c) => ({ c, e: c.build(s, oneWayMin) }));
  if (!pool.length) return null;
  const total = pool.reduce((t, p) => t + p.c.weight, 0);
  let r = rng() * total;
  for (const p of pool) {
    r -= p.c.weight;
    if (r <= 0) return p.e;
  }
  return pool[pool.length - 1]?.e ?? null;
}

export function eventForSol(s: GameState, ctx: Pick<SolContext, "space" | "prevSpace">, oneWayMin: number) {
  return stormEvent(ctx, oneWayMin, s.place) ?? drawDeckEvent(s, oneWayMin);
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
  n.air = capped(f.airAfter, n.airCap);
  n.food = capped(f.foodAfter, n.foodCap);
  // Daily wear means research needs care too; exploration choices restore it.
  n.science = capped(s.science - 1 + f.scienceMade * 0.25, n.scienceCap);
  n.dose = capped(s.dose + f.doseToday, n.doseLimit);
  n.battery = f.batteryAfterNight;
  if (f.wasted > 0) notes.push(`The battery was full, so ${f.wasted}⚡ of sunlight went to waste.`);
  if (f.coldNight) notes.push(`Not enough battery for the heater tonight (${ctx.weather.min}°C outside). Some plants froze: 1 day of food lost.`);
  if (f.stormDose > 0) notes.push(`The storm added ${f.stormDose.toFixed(1)} radiation units.`);
  if (s.statuses.moldRisk && rng() < 0.4) {
    n.food -= 2;
    delete n.statuses.moldRisk;
    notes.push(`The mold spread! Food dropped by ${(2 / n.foodCap * 100).toFixed(1)} percentage points.`);
  }
  for (const k of Object.keys(n.statuses) as (keyof GameState["statuses"])[]) {
    const left = (n.statuses[k] ?? 0) - 1;
    if (left <= 0) delete n.statuses[k];
    else n.statuses[k] = left;
  }
  n.food = Math.max(0, n.food);
  n.panel = Math.max(0.3, +(s.panel - (s.place === "moon" ? MOON_DUST_PER_DAY : DUST_PER_SOL)).toFixed(2));
  n.log = [
    ...s.log,
    { sol: s.sol, air: n.air, food: n.food, battery: n.battery, dose: +n.dose.toFixed(2), science: n.science, solar: p.total, notes },
  ];
  n.sol = s.sol + 1;
  return { state: checkOver(n), report: { forecast: f, notes } };
}

export function checkOver(s: GameState): GameState {
  if (s.over) return s;
  if (s.air <= 0) return { ...s, over: { result: "air", message: "The air ran out. The crew had to fly home early in their rocket." } };
  if (s.food <= 0) return { ...s, over: { result: "food", message: "The food ran out. The crew had to fly home early." } };
  if (s.battery <= 0) return { ...s, over: { result: "power", message: "The power ran out. The base cannot keep the crew warm, so everyone had to fly home early." } };
  if (s.science <= 0) return { ...s, over: { result: "science", message: "The research system reached 0%. The crew cannot keep studying their new home, so the mission is over." } };
  if (s.dose >= s.doseLimit)
    return { ...s, over: { result: "dose", message: "The crew got too much radiation. The space doctor sent everyone home to stay safe." } };
  return s;
}

export function markSeen(s: GameState, id: string): GameState {
  return s.seenEvents.includes(id) ? s : { ...s, seenEvents: [...s.seenEvents, id] };
}

/** Play one story choice: remember it for the end-of-trip story, then apply what it costs and gives. */
export function chooseOption(s: GameState, event: GameEvent, opt: EventOption): GameState {
  if (s.over) return s;
  const seen = markSeen(s, event.id);
  const told = { ...seen, story: [...seen.story, { sol: s.sol, emoji: event.emoji, title: event.title, choice: opt.label }] };
  return applyEffect(told, opt.effect);
}

/** The base runs its daily machines automatically; players decide through stories, not a power planner. */
export function endStoryDay(s: GameState, ctx: SolContext) {
  if (s.over) return { state: s, report: { forecast: forecast(s, emptyAlloc(), ctx), notes: [] } };
  const automatic = fitAlloc({ air: 2, greenhouse: 3, shield: 1, science: 1 }, powerToday(s).available);
  return endSol(s, automatic, ctx);
}

/** Short, kid-friendly list of what a choice changed, e.g. "−0.5 days of air". */
export function effectChips(e: Effect): { text: string; good: boolean }[] {
  const out: { text: string; good: boolean }[] = [];
  const num = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
  if (e.air) out.push({ text: `🫁 ${num(e.air)} days of air`, good: e.air > 0 });
  if (e.food) out.push({ text: `🥬 ${num(e.food)} days of food`, good: e.food > 0 });
  if (e.battery) out.push({ text: `🔋 ${num(e.battery)}⚡ battery`, good: e.battery > 0 });
  if (e.science) out.push({ text: `🔬 ${num(e.science)} science`, good: e.science > 0 });
  if (e.dose) out.push({ text: `☢️ +${e.dose} radiation units`, good: false });
  if (e.panel && e.panel < 0) out.push({ text: "🔆 Dirty, scratched panels", good: false });
  if (e.setPanel === 1) out.push({ text: "🔆 Clean panels", good: true });
  if (e.shieldBonus) out.push({ text: "🛡️ Thicker water walls", good: true });
  if (e.batteryCap) out.push({ text: `🔋 Battery holds ${num(e.batteryCap)}⚡`, good: e.batteryCap > 0 });
  for (const st of e.status ?? []) {
    const label: Record<string, [string, boolean]> = {
      dustStorm: [`🌪️ Dark, dusty sky for ${st.sols} days`, false],
      panelsAway: ["🔆 No sunlight power today", false],
      airClog: [`🫁 Half air from the oxygen maker for ${st.sols} day${st.sols > 1 ? "s" : ""}`, false],
      fatigue: [`😴 Tired crew for ${st.sols} days`, false],
      moldRisk: ["🦠 Mold might spread", false],
      happyCrew: [`🎉 Happy crew for ${st.sols} day${st.sols > 1 ? "s" : ""}`, true],
    };
    const l = label[st.id];
    if (l) out.push({ text: l[0], good: l[1] });
  }
  if (e.shelter === "full") out.push({ text: "🛡️ Hiding in the shelter today", good: true });
  return out;
}

export interface Rating {
  stars: number;
  badges: { emoji: string; name: string; why: string }[];
}

export function rate(s: GameState): Rating {
  const badges: Rating["badges"] = [];
  const days = s.log.length;
  if (days >= 10) badges.push({ emoji: "🏁", name: "Space Survivor", why: `Kept the base going for ${days} days` });
  return { stars: days >= 20 ? 3 : days >= 10 ? 2 : days >= 1 ? 1 : 0, badges };
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

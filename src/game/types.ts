// Shared game types. Raw data shapes mirror NASA sources; game state is plain JSON.

export interface SunWindowRaw {
  id: string;
  name: string;
  blurb?: string;
  start: string; // YYYY-MM-DD
  end: string;
  flares: { t: string; c: string }[]; // DONKI FLR peakTime + classType
  seps: string[]; // DONKI SEP eventTime
  cmes: { t: string; v: number }[]; // DONKI CME startTime + analysed speed km/s
}

export type SunSource = "live-recent" | "live-random" | "archived" | "archived-fallback";

export interface SunWindow extends SunWindowRaw {
  source: SunSource;
}

export interface MarsWeatherSol {
  sol: number;
  min: number;
  max: number;
  pressure: number;
  uv: string;
}

export interface MarsWeatherWindow {
  startSol: number;
  earthDate: string;
  season: string;
  ls: number;
  sols: MarsWeatherSol[];
}

/** What the Sun did on one game sol, derived from real DONKI records. */
export interface SolSpaceWeather {
  date: string;
  flares: string[]; // class types seen that day
  strongestFlare: string | null;
  sep: boolean; // a real solar energetic particle event was logged
  cmeLaunches: { speed: number; arrivesSol: number; travelSols: number }[];
  cmeArrival: { speed: number } | null;
}

export type CrateId = "solar" | "reactor" | "water" | "battery" | "food" | "rover";

export interface Allocation {
  air: number;
  greenhouse: number;
  shield: number;
  science: number;
}

export type StatusId = "dustStorm" | "airClog" | "fatigue" | "moldRisk" | "earthFix" | "happyCrew";

export interface Effect {
  air?: number;
  food?: number;
  battery?: number;
  science?: number;
  dose?: number;
  panel?: number; // change to panel cleanliness 0..1
  setPanel?: number;
  shieldBonus?: number; // permanent water-wall level
  status?: { id: StatusId; sols: number }[];
  clearStatus?: StatusId[];
  shelter?: "full" | "late" | "none";
}

export interface EventOption {
  id: string;
  label: string;
  cost: string; // kid-language summary of what you give up
  gain: string; // and what you get
  effect: Effect;
  askEarth?: boolean;
}

export interface GameEvent {
  id: string;
  kind: "deck" | "storm" | "cme" | "info";
  title: string;
  emoji: string;
  text: string;
  fact?: { text: string; source: string; url?: string };
  options: EventOption[];
}

export interface SolLog {
  sol: number;
  air: number;
  food: number;
  battery: number;
  dose: number;
  science: number;
  solar: number;
  notes: string[];
}

export interface GameState {
  sol: number; // 1-based current sol
  totalSols: number;
  air: number; // crew-days of breathable oxygen
  food: number; // crew-days of food
  battery: number;
  batteryCap: number;
  dose: number; // mSv (simplified)
  doseLimit: number;
  science: number;
  panel: number; // 0..1 cleanliness
  shieldBonus: number;
  crates: CrateId[];
  statuses: Partial<Record<StatusId, number>>;
  seenEvents: string[];
  log: SolLog[];
  over: null | { result: "success" | "air" | "food" | "dose"; message: string };
  seed: number;
}

// Real-world numbers that drive the game, each with its source.
// Where the game simplifies, the comment says so and the in-game text says so too.

// NASA records are read in short windows; this is not a mission time limit.
export const DATA_WINDOW_DAYS = 15;
export const CREW = 4;

/** One Mars day (sol) = 24 h 39 m 35 s. Source: NASA Mars Fact Sheet. */
export const SOL_LENGTH_TEXT = "24 hours 39 minutes";

/** Each astronaut breathes about 0.84 kg of oxygen per day. Source: NASA Baseline Values & Assumptions Document (BVAD, NASA/TP-2015-218570). */
export const O2_KG_PER_PERSON_DAY = 0.84;

/** Average radiation on Mars's surface ≈ 0.64 mSv per sol. Source: Curiosity RAD (NASA: science.nasa.gov/resource/radiation-measurements-on-mars). */
export const MARS_SURFACE_MSV_PER_SOL = 0.64;
/** Moon surface ≈ 1.37 mSv per day, about twice Mars, because the Moon has no air at all.
 *  Measured by the Chang'e-4 LND instrument (Zhang et al., Science Advances 2020); NASA's LRO CRaTER instrument reports similar levels. */
export const MOON_SURFACE_MSV_PER_DAY = 1.37;
/** One-way light time Earth→Moon: 384,400 km average distance (NASA Moon Fact Sheet) ÷ speed of light ≈ 1.28 s. */
export const EARTH_MOON_KM = 384_400;
/** Moon dust is not blown around by wind, so panels get dusty more slowly (game scale). */
export const MOON_DUST_PER_DAY = 0.02;
/** Natural background on Earth ≈ 3 mSv per year ≈ 0.008 per day (NASA Space Math, science.gsfc.nasa.gov). */
export const EARTH_MSV_PER_DAY = 0.008;
/** NASA's career limit for astronauts: 600 mSv (NASA-STD-3001, 2022). */
export const NASA_CAREER_LIMIT_MSV = 600;
/** Game simplification: this short trip gets its own small "flight surgeon" budget. */
export const MISSION_DOSE_LIMIT = 25;

/** Power units (⚡) from clean solar panels on a clear sol. Game scale. */
export const BASE_SOLAR = 10;
export const BASE_BATTERY_CAP = 10;
/** Dust settles on panels each sol. InSight's panels fell from ~5,000 Wh/sol to ~500 Wh/sol over 4 years (NASA JPL). Sped up for the game. */
export const DUST_PER_SOL = 0.05;
/** Regional dust storm lets ~40% of sunlight through (game scale). The 2018 global storm cut Opportunity from ~645 to ~22 Wh/sol. */
export const DUST_STORM_FACTOR = 0.4;

/** Conversions (game scale): */
export const AIR_PER_POWER = 0.5; // 2⚡ → 1 crew-day of oxygen
export const FOOD_PER_POWER = 1 / 3; // 3⚡ → 1 crew-day of food

export const MAX_ALLOC = { air: 6, greenhouse: 6, shield: 3 } as const;

/** Fraction of radiation that gets through for each water-wall level. Water is a good radiation shield (NASA HRP). Game scale. */
export const SHIELD_FACTOR = [1, 0.65, 0.45, 0.3, 0.2, 0.15];
/** Hiding in the storm shelter blocks most storm particles (game scale). */
export const SHELTER_FACTOR = 0.2;
export const LATE_SHELTER_FACTOR = 0.6;

/** Extra storm dose (mSv, simplified, worst-case planning) by strongest flare that day. */
export function stormDoseFor(flare: string | null): number {
  if (!flare) return 2;
  const cls = flare[0];
  const mag = parseFloat(flare.slice(1)) || 1;
  if (cls === "X") return mag >= 5 ? 12 : 8;
  if (cls === "M") return mag >= 5 ? 5 : 3;
  return 2;
}
export const CME_ARRIVAL_DOSE = 3;
export const EVA_DOSE = 0.3;
export const EVA_AIR = 0.5;

/** Heater cost tonight from the REAL Curiosity minimum temperature. */
export function heaterCost(minTempC: number): number {
  if (minTempC < -85) return 4;
  if (minTempC < -75) return 3;
  return 2;
}

/** Speed of light: 1 AU takes 499.005 s. */
export const LIGHT_SECONDS_PER_AU = 499.005;
export const KM_PER_AU = 149_597_870.7;
/** Real SEP particles reach Mars ~30 min after a flare; in the game 1 real minute = 0.5 s. */
export const SEP_ARRIVAL_MINUTES = 30;
export const SECONDS_PER_GAME_MINUTE = 0.5;

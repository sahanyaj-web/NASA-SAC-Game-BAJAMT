// Where are Earth and Mars today? JPL "Approximate Positions of the Planets"
// Keplerian elements (Standish, valid 1800–2050). Accurate to well under 1% for distance.
import { KM_PER_AU, LIGHT_SECONDS_PER_AU } from "./constants";

interface Elements {
  a: [number, number];
  e: [number, number];
  I: [number, number];
  L: [number, number];
  w: [number, number]; // longitude of perihelion (varpi)
  O: [number, number]; // longitude of ascending node
}

const EARTH: Elements = {
  a: [1.00000261, 0.00000562],
  e: [0.01671123, -0.00004392],
  I: [-0.00001531, -0.01294668],
  L: [100.46457166, 35999.37244981],
  w: [102.93768193, 0.32327364],
  O: [0, 0],
};

const MARS: Elements = {
  a: [1.52371034, 0.00001847],
  e: [0.0933941, 0.00007882],
  I: [1.84969142, -0.00813131],
  L: [-4.55343205, 19140.30268499],
  w: [-23.94362959, 0.44441088],
  O: [49.55953891, -0.29257343],
};

const RAD = Math.PI / 180;

function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function helio(el: Elements, date: Date): [number, number, number] {
  const T = (julianDay(date) - 2451545.0) / 36525;
  const v = (p: [number, number]) => p[0] + p[1] * T;
  const a = v(el.a);
  const e = v(el.e);
  const I = v(el.I) * RAD;
  const L = v(el.L);
  const w = v(el.w);
  const O = v(el.O);
  const argPeri = (w - O) * RAD;
  let M = (((L - w) % 360) + 540) % 360 - 180;
  M *= RAD;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 10; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const Or = O * RAD;
  const cw = Math.cos(argPeri), sw = Math.sin(argPeri);
  const cO = Math.cos(Or), sO = Math.sin(Or);
  const cI = Math.cos(I), sI = Math.sin(I);
  const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
  const y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
  const z = sw * sI * xp + cw * sI * yp;
  return [x, y, z];
}

export interface EarthMarsInfo {
  distanceAU: number;
  distanceKm: number;
  oneWayMinutes: number;
  marsSunAU: number;
  /** Sun–Earth–Mars angle in degrees; under ~2° NASA pauses commands (solar conjunction). */
  elongationDeg: number;
  conjunction: boolean;
}

export function earthMars(date: Date): EarthMarsInfo {
  const E = helio(EARTH, date);
  const M = helio(MARS, date);
  const d: [number, number, number] = [M[0] - E[0], M[1] - E[1], M[2] - E[2]];
  const distanceAU = Math.hypot(...d);
  const toSun = [-E[0], -E[1], -E[2]];
  const cos =
    (toSun[0] * d[0] + toSun[1] * d[1] + toSun[2] * d[2]) / (Math.hypot(...toSun) * distanceAU);
  const elongationDeg = Math.acos(Math.max(-1, Math.min(1, cos))) / RAD;
  return {
    distanceAU,
    distanceKm: distanceAU * KM_PER_AU,
    oneWayMinutes: (distanceAU * LIGHT_SECONDS_PER_AU) / 60,
    marsSunAU: Math.hypot(...M),
    elongationDeg,
    conjunction: elongationDeg < 2,
  };
}

export function formatMinutes(min: number) {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}

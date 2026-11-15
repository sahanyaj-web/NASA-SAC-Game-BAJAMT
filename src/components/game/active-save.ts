// Mission progress for this open page only (never browser storage).
// Closing or reloading the page discards it.
import type { GameEvent, GameState, MarsWeatherWindow, SolSpaceWeather, SunWindow } from "@/game/types";
import type { Shelter, SolReport } from "@/game/engine";

export interface Mission {
  sun: SunWindow;
  schedule: SolSpaceWeather[];
  weather: MarsWeatherWindow;
  notice?: string | undefined;
}

export interface SaveData {
  mission: Mission;
  state: GameState;
  shelter: Shelter;
  summary: { sol: number; report: SolReport } | null;
  showReport: boolean;
  event: GameEvent | null;
}

let activeSave: SaveData | null = null;
export const getActiveSave = () => activeSave;
export const setActiveSave = (s: SaveData | null) => { activeSave = s; };

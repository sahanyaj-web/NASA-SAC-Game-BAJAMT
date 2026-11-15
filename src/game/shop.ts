import { COINS_PER_MILESTONE, COIN_MILESTONE_DAYS, SHIELD_FACTOR } from "./constants";
import type { CrateId, GameState } from "./types";

/** Coins earned when the crew has survived `days` days (0 unless it is a milestone). */
export function milestoneCoins(days: number): number {
  if (days <= 0 || days % COIN_MILESTONE_DAYS !== 0) return 0;
  return (days / COIN_MILESTONE_DAYS) * COINS_PER_MILESTONE;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  what: string;
  /** One-time items can only be bought once. */
  once?: boolean;
  apply: (s: GameState) => GameState;
}

const addCrate = (s: GameState, c: CrateId): GameState => (s.crates.includes(c) ? s : { ...s, crates: [...s.crates, c] });

// Game-scale upgrades; the crate effects reuse the engine's existing crate rules.
export const SHOP: ShopItem[] = [
  { id: "watertank", name: "Water tank", emoji: "💧", price: 15, what: "Thicker water walls, so radiation safety drops more slowly.", apply: (s) => ({ ...s, shieldBonus: Math.min(SHIELD_FACTOR.length - 1, s.shieldBonus + 1) }) },
  { id: "oxygen", name: "Oxygen tank", emoji: "🫁", price: 15, what: "Holds one more day of air and fills it.", apply: (s) => ({ ...s, airCap: s.airCap + 1, air: s.air + 1 }) },
  { id: "garden", name: "Plant shelf", emoji: "🥬", price: 15, what: "Stores two more days of food and fills it.", apply: (s) => ({ ...s, foodCap: s.foodCap + 2, food: s.food + 2 }) },
  { id: "battery", name: "Extra battery", emoji: "🔋", price: 20, what: "Saves more power for cold nights and fills it.", apply: (s) => ({ ...s, batteryCap: s.batteryCap + 4, battery: s.battery + 4 }) },
  { id: "solar", name: "Bigger solar panels", emoji: "☀️", price: 25, once: true, what: "Makes more power every day.", apply: (s) => addCrate(s, "solar") },
  { id: "rover", name: "Rover", emoji: "🚙", price: 25, once: true, what: "A robot car that helps grow food every day.", apply: (s) => addCrate(s, "rover") },
  { id: "brushbot", name: "Dust brush robot", emoji: "🧹", price: 10, what: "Brushes all the dust off your solar panels right now.", apply: (s) => ({ ...s, panel: 1 }) },
  { id: "supplyrocket", name: "Supply rocket", emoji: "🚀", price: 12, what: "A rocket from Earth drops off air and food, filling both up.", apply: (s) => ({ ...s, air: s.airCap, food: s.foodCap }) },
  { id: "radiodish", name: "Big radio dish", emoji: "📡", price: 20, once: true, what: "A bigger battery room comes with the dish: stores more power and fills it.", apply: (s) => ({ ...s, batteryCap: s.batteryCap + 3, battery: s.batteryCap + 3 }) },
  { id: "livingdome", name: "Extra living dome", emoji: "🏠", price: 30, once: true, what: "More room for air tanks and food shelves: holds more of both and fills them.", apply: (s) => ({ ...s, airCap: s.airCap + 1, air: s.airCap + 1, foodCap: s.foodCap + 2, food: s.foodCap + 2 }) },
  { id: "bermwall", name: "Dirt wall", emoji: "🧱", price: 25, once: true, what: "Robots pile dirt around the base to block more radiation.", apply: (s) => ({ ...s, shieldBonus: Math.min(SHIELD_FACTOR.length - 1, s.shieldBonus + 1) }) },
];

export function canBuy(s: GameState, item: ShopItem): boolean {
  if (s.over || (s.coins ?? 0) < item.price) return false;
  if (item.once && (s.purchases?.includes(item.id) || (item.id === "rover" || item.id === "solar") && s.crates.includes(item.id as CrateId))) return false;
  return true;
}

export function buyItem(s: GameState, id: string): GameState {
  const item = SHOP.find((i) => i.id === id);
  if (!item || !canBuy(s, item)) return s;
  const n = item.apply(s);
  return { ...n, coins: (s.coins ?? 0) - item.price, purchases: [...(s.purchases ?? []), id] };
}

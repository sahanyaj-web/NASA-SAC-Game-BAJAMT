import { describe, expect, it } from "vitest";
import { createGame } from "./engine";
import { buyItem, milestoneCoins } from "./shop";

describe("NASA Commodities coins", () => {
  it("pays 1 coin every 2 survived days", () => {
    expect(milestoneCoins(1)).toBe(0);
    expect(milestoneCoins(2)).toBe(1);
    expect(milestoneCoins(4)).toBe(2);
  });
  it("spends coins and refuses when too poor", () => {
    const g = { ...createGame(1, [], "mars"), coins: 12 };
    const r = buyItem(g, "rover");
    expect(r.coins).toBe(4);
    expect(r.crates).toContain("rover");
    expect(buyItem(r, "solar")).toBe(r);
    expect(buyItem({ ...r, coins: 99 }, "rover").coins).toBe(99);
  });
  it("keeps every shop price between 3 and 8 coins", () => {
    for (const item of SHOP) {
      expect(item.price).toBeGreaterThanOrEqual(3);
      expect(item.price).toBeLessThanOrEqual(8);
    }
  });
});

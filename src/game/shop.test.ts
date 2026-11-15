import { describe, expect, it } from "vitest";
import { createGame } from "./engine";
import { buyItem, milestoneCoins } from "./shop";

describe("NASA Commodities coins", () => {
  it("pays coins only every 5 survived days", () => {
    expect(milestoneCoins(4)).toBe(0);
    expect(milestoneCoins(5)).toBe(10);
    expect(milestoneCoins(10)).toBe(20);
  });
  it("spends coins and refuses when too poor", () => {
    const g = { ...createGame(1, [], "mars"), coins: 30 };
    const r = buyItem(g, "rover");
    expect(r.coins).toBe(5);
    expect(r.crates).toContain("rover");
    expect(buyItem(r, "watertank")).toBe(r);
    expect(buyItem({ ...r, coins: 99 }, "rover").coins).toBe(99);
  });
});

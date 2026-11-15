import { describe, expect, it } from "vitest";
import { applyEffect, checkOver, chooseOption, createGame, endSol, endStoryDay, eventForSol, forecast, powerToday, resourcePercentages, stormEvent } from "./engine";
import { CREW_CAST, DECK, firstDayEvent } from "./events";
import { earthMars, earthMoon } from "./orbit";
import { buildSchedule, recordForDay } from "./space-weather";
import { heaterCost, stormDoseFor } from "./constants";
import type { SolContext } from "./engine";

const quietDay = { date: "2020-01-01", flares: [], strongestFlare: null, sep: false, cmeLaunches: [], cmeArrival: null };
const mild = { sol: 1, min: -70, max: -10, pressure: 800, uv: "Moderate" };
const ctx = (over: Partial<SolContext> = {}): SolContext => ({ weather: mild, space: quietDay, shelter: "none", ...over });

describe("rotating daily stories", () => {
  it.each(["mars", "moon"] as const)("does not repeat consecutive daily problems on %s, even after using the deck", (place) => {
    let state = createGame(42, [], place);
    let previous = "";
    for (let day = 1; day <= 60; day++) {
      const event = eventForSol({ ...state, sol: day }, ctx(), 10);
      if (!event) throw new Error("Missing daily story");
      expect(event.id).not.toBe(previous);
      expect(event.options).toHaveLength(2);
      previous = event.id;
      state = { ...state, seenEvents: [...state.seenEvents.filter((id) => id !== event.id), event.id] };
    }
  });

  it("new missions do not always open with the same landing story", () => {
    const ids = new Set(Array.from({ length: 20 }, (_, seed) => eventForSol(createGame(seed, []), ctx(), 10)?.id));
    expect(ids.size).toBeGreaterThan(1);
    expect(ids.has("landing")).toBe(false);
  });
});

describe("life support", () => {
  it.each(["air", "food", "battery"] as const)("zero %s immediately loses the game", (resource) => {
    const state = checkOver({ ...createGame(1, []), sol: 16, [resource]: 0 });
    expect(state.over?.result).toBe(resource === "battery" ? "power" : resource);
  });

  it("zero radiation safety immediately loses the game", () => {
    expect(checkOver({ ...createGame(1, []), dose: 25 }).over?.result).toBe("dose");
  });

  it("a decrease with supplies still above zero does not end the game", () => {
    const state = applyEffect(createGame(1, []), { air: -0.5 });
    expect(state.air).toBe(4.5);
    expect(state.over).toBeNull();
  });

  it("story decisions update supplies without a player power plan", () => {
    const game = createGame(1, []);
    const event = firstDayEvent(game);
    const plants = event.options.find((o) => o.id === "plants");
    if (!plants) throw new Error("Missing plant choice");
    const picked = chooseOption(game, event, plants);
    expect(picked.food).toBe(6);
    expect(picked.air).toBe(4.8);
    const next = endStoryDay(picked, ctx()).state;
    expect(next.sol).toBe(2);
    expect(next.food).toBe(6);
    expect(next.battery).toBe(8);
  });

  it("every day still has two story choices after the deck has been used", () => {
    const game = { ...createGame(1, []), sol: 14, seenEvents: DECK.map((c) => c.id) };
    expect(eventForSol(game, ctx(), 10)?.options).toHaveLength(2);
  });

  it("folding panels away can use up the last power overnight", () => {
    const game = { ...createGame(1, []), battery: 5, statuses: { panelsAway: 1 } };
    expect(endStoryDay(game, ctx()).state.over?.result).toBe("power");
  });

  it("the crew breathes 1 day of air per sol, and 2⚡ in the oxygen maker makes exactly 1 day", () => {
    const g = createGame(1, []);
    const { state } = endSol(g, { air: 2, greenhouse: 0, shield: 0 }, ctx());
    expect(state.air).toBe(g.air);
    const { state: s2 } = endSol(g, { air: 0, greenhouse: 0, shield: 0 }, ctx());
    expect(s2.air).toBe(g.air - 1);
  });

  it("3⚡ in the greenhouse grows exactly 1 day of food", () => {
    const g = createGame(1, []);
    const f = forecast(g, { air: 0, greenhouse: 3, shield: 0 }, ctx());
    expect(f.foodMade).toBeCloseTo(1);
  });

  it("running out of air ends the mission", () => {
    const g = { ...createGame(1, []), air: 1 };
    const { state } = endSol(g, { air: 0, greenhouse: 3, shield: 0 }, ctx());
    expect(state.over?.result).toBe("air");
  });
});

describe("power", () => {
  it("clean panels on a clear sol give 10⚡; a dust storm cuts that to 40%", () => {
    const g = createGame(1, []);
    expect(powerToday(g).solar).toBe(10);
    expect(powerToday({ ...g, statuses: { dustStorm: 2 } }).solar).toBe(4);
  });

  it("the reactor keeps giving 3⚡ during a dust storm", () => {
    const g = { ...createGame(1, ["reactor"]), statuses: { dustStorm: 2 } };
    expect(powerToday(g).reactor).toBe(3);
  });

  it("a colder real night costs more heater power, and an empty battery freezes plants", () => {
    expect(heaterCost(-70)).toBe(2);
    expect(heaterCost(-80)).toBe(3);
    expect(heaterCost(-90)).toBe(4);
    const g = { ...createGame(1, []), battery: 0 };
    const f = forecast(g, { air: 6, greenhouse: 6, shield: 0 }, ctx({ weather: { ...mild, min: -90 } }));
    expect(f.coldNight).toBe(true);
  });
});

describe("radiation", () => {
  it("a quiet sol on Mars's surface is 0.64 mSv unshielded (Curiosity RAD)", () => {
    const f = forecast(createGame(1, []), { air: 0, greenhouse: 0, shield: 0 }, ctx());
    expect(f.doseToday).toBeCloseTo(0.64);
  });

  it("an X-class particle storm adds 8 mSv unshielded, and the shelter blocks at least 80%", () => {
    expect(stormDoseFor("X2.1")).toBe(8);
    const storm = { ...quietDay, sep: true, strongestFlare: "X2.1" };
    const g = createGame(1, []);
    const open = forecast(g, { air: 0, greenhouse: 0, shield: 0 }, ctx({ space: storm }));
    const hid = forecast(g, { air: 0, greenhouse: 0, shield: 0 }, ctx({ space: storm, shelter: "full" }));
    expect(open.stormDose).toBe(8);
    expect(hid.stormDose).toBeLessThanOrEqual(8 * 0.2);
  });

  it("sheltering is not free: half greenhouse output", () => {
    const storm = { ...quietDay, sep: true };
    const f = forecast(createGame(1, []), { air: 0, greenhouse: 3, shield: 0 }, ctx({ space: storm, shelter: "full" }));
    expect(f.foodMade).toBeCloseTo(0.5);
  });

  it("reaching the 25 mSv mission limit sends the crew home", () => {
    const g = { ...createGame(1, []), dose: 24.8 };
    const { state } = endSol(g, { air: 2, greenhouse: 3, shield: 0 }, ctx());
    expect(state.over?.result).toBe("dose");
  });

  it("storm events come only from real DONKI particle events or CME arrivals", () => {
    expect(stormEvent({ space: quietDay }, 10)).toBeNull();
    expect(stormEvent({ space: { ...quietDay, sep: true } }, 10)?.kind).toBe("storm");
  });
});

describe("no free choices", () => {
  it("every decision card has at least two options and each one names a cost", () => {
    const g = { ...createGame(1, []), panel: 0.5 };
    for (const card of DECK) {
      const e = card.build(g, 10);
      if (e.kind !== "deck") continue;
      expect(e.options.length).toBeGreaterThanOrEqual(2);
      for (const o of e.options) expect(o.cost.length).toBeGreaterThan(3);
    }
  });
});

describe("story choices never need battery", () => {
  it("no story choice costs battery, on Mars or the Moon, so both choices can always be picked", () => {
    for (const place of ["mars", "moon"] as const) {
      const g = { ...createGame(1, [], place), panel: 0.5, batteryCap: 10 };
      for (const card of [...DECK.map((c) => c.build(g, 10)), firstDayEvent(g)]) {
        expect(card.options.length).toBe(2);
        for (const o of card.options) expect(o.effect.battery ?? 0).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("crew are called by their job, never a name", () => {
    const g = createGame(1, []);
    const text = JSON.stringify([...DECK.map((c) => c.build(g, 10)), firstDayEvent(g), CREW_CAST]);
    for (const name of ["Ada", "Leo", "Mia", "Sam"]) expect(text).not.toMatch(new RegExp(`\\b${name}\\b`));
  });
});

describe("moon base", () => {
  it("a quiet day on the Moon is 1.37 radiation units unshielded, about twice Mars", () => {
    const f = forecast(createGame(1, [], "moon"), { air: 0, greenhouse: 0, shield: 0 }, ctx());
    expect(f.doseToday).toBeCloseTo(1.37);
  });

  it("a message to the Moon takes about 1.3 seconds", () => {
    expect(earthMoon().oneWayMinutes * 60).toBeCloseTo(1.28, 1);
  });
});

describe("real geometry & data", () => {
  it("Mars at its 2018 close approach was about 57.6 million km away (~3.2 light-minutes)", () => {
    const i = earthMars(new Date("2018-07-31T08:00:00Z"));
    expect(i.distanceKm / 1e6).toBeGreaterThan(55);
    expect(i.distanceKm / 1e6).toBeLessThan(60);
    expect(i.oneWayMinutes).toBeGreaterThan(3);
    expect(i.oneWayMinutes).toBeLessThan(3.4);
  });

  it("flags the January 2026 solar conjunction, when messages can't get through", () => {
    expect(earthMars(new Date("2026-01-09T12:00:00Z")).conjunction).toBe(true);
    expect(earthMars(new Date("2025-06-01T12:00:00Z")).conjunction).toBe(false);
  });

  it("a fast CME arrives at Mars a few sols after launch", () => {
    const sched = buildSchedule({ id: "t", name: "t", start: "2024-05-01", end: "2024-05-15", flares: [], seps: [], cmes: [{ t: "2024-05-02T10:00Z", v: 1500 }] });
    const launch = sched[1]!.cmeLaunches[0]!;
    expect(launch.travelSols).toBeGreaterThanOrEqual(1);
    expect(launch.travelSols).toBeLessThanOrEqual(2);
    expect(sched[launch.arrivesSol - 1]!.cmeArrival?.speed).toBe(1500);
  });

});

describe("percentage survival missions", () => {
  it.each(["mars", "moon"] as const)("all systems start at exactly 100%% on %s, with any cargo", (place) => {
    for (const crates of [[], ["water", "food"], ["battery", "rover"]] as const) {
      expect(resourcePercentages(createGame(1, [...crates], place))).toEqual({ air: 100, food: 100, power: 100, safety: 100 });
    }
  });

  it("positive changes never exceed 100% and negative changes lower the percentage", () => {
    const game = createGame(1, []);
    const full = applyEffect(game, { air: 100, food: 100, battery: 10000, dose: -100 });
    expect(resourcePercentages(full)).toEqual({ air: 100, food: 100, power: 100, safety: 100 });
    expect(resourcePercentages(applyEffect(full, { air: -1, food: -3, battery: -5, dose: 12.5 }))).toEqual({ air: 80, food: 50, power: 50, safety: 50 });
  });

  it("daily production cannot overfill systems", () => {
    const next = endSol(createGame(1, ["reactor", "rover"]), { air: 6, greenhouse: 6, shield: 1 }, ctx()).state;
    expect(next.air).toBe(next.airCap);
    expect(next.food).toBe(next.foodCap);
    expect(next.battery).toBeLessThanOrEqual(next.batteryCap);
  });

  it("does not end at day 15, day 16, or a later day", () => {
    for (const sol of [15, 16, 10000]) {
      const game = { ...createGame(1, []), sol };
      expect(checkOver(game).over).toBeNull();
      expect(endStoryDay(game, ctx()).state.sol).toBe(sol + 1);
      expect(eventForSol(game, ctx(), 10)?.options).toHaveLength(2);
    }
  });

  it("legacy research values cannot end the mission or consume power", () => {
    const game = { ...createGame(1, []), science: 0, scienceCap: 20 };
    expect(checkOver(game).over).toBeNull();
    expect(resourcePercentages(game)).toEqual({ air: 100, food: 100, power: 100, safety: 100 });
    expect(endStoryDay(game, ctx()).state.battery).toBe(8);
  });

  it("all choices use remaining resources, never a research score", () => {
    const game = createGame(1, []);
    for (const event of [firstDayEvent(game), ...DECK.map((c) => c.build(game, 10))]) {
      for (const option of event.options) expect(option.effect).not.toHaveProperty("science");
    }
    const leak = DECK.find((c) => c.id === "leak")?.build(game, 10);
    const patch = leak?.options.find((o) => o.id === "patch");
    if (!leak || !patch) throw new Error("Missing patch choice");
    expect(chooseOption(game, leak, patch).air).toBe(4.8);
  });

  it("tired crew grow less food; happy crew and robot cargo help plant care", () => {
    const game = createGame(1, []);
    const alloc = { air: 2, greenhouse: 3, shield: 1 };
    expect(forecast({ ...game, statuses: { fatigue: 3 } }, alloc, ctx()).foodMade).toBe(0.75);
    expect(forecast({ ...game, statuses: { happyCrew: 2 } }, alloc, ctx()).foodMade).toBe(1.1);
    expect(forecast(createGame(1, ["rover"]), alloc, ctx()).foodMade).toBe(1.1);
  });

  it("NASA records cycle after the saved window without changing real dates", () => {
    const days = buildSchedule({ id: "t", name: "t", start: "2024-05-01", end: "2024-05-15", flares: [], seps: [], cmes: [] });
    expect(recordForDay(days, 16)?.date).toBe("2024-05-01");
    expect(recordForDay(days, 31)?.date).toBe("2024-05-01");
    expect(recordForDay([], 16)).toBeUndefined();
  });
});

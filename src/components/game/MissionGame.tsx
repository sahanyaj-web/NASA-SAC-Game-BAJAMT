import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MARS_WEATHER } from "@/game/data/mars-weather";
import { MOON_WEATHER } from "@/game/data/moon-weather";
import {
  chooseOption, createGame, endStoryDay, eventForSol, mulberry32, resourcePercentages,
  stormEvent, type Shelter, type SolReport,
} from "@/game/engine";
import { DECK, firstDayEvent } from "@/game/events";
import { earthMars, earthMoon } from "@/game/orbit";
import {
  archived, buildSchedule, fetchDonkiWindow, randomArchived, randomWindowDates, recentWindowDates, recordForDay,
} from "@/game/space-weather";
import type { CrateId, EventOption, Place, GameEvent, GameState, MarsWeatherWindow, SolSpaceWeather, SunWindow } from "@/game/types";
import { EventOverlay } from "./EventOverlay";
import { Gauge } from "./Gauge";
import { MissionReport } from "./MissionReport";
import { MissionSetup, type SunChoice } from "./MissionSetup";
import { SourceBadge } from "./SourceBadge";
import { SummaryOverlay } from "./SummaryOverlay";
import { Term } from "./Term";
import { TodayPanel } from "./TodayPanel";
import { placeWords } from "@/game/words";

interface Mission {
  sun: SunWindow;
  schedule: SolSpaceWeather[];
  weather: MarsWeatherWindow;
  notice?: string | undefined;
}

// Progress is kept in the browser so leaving for "Real facts" and coming back
// does not lose the mission. Cleared when a mission ends and a new one starts.
const SAVE_KEY = "jam-mission-save";

interface SaveData {
  mission: Mission;
  state: GameState;
  shelter: Shelter;
  summary: { sol: number; report: SolReport } | null;
  showReport: boolean;
  event: GameEvent | null;
}

export function MissionGame({ initialStorm }: { initialStorm?: string | undefined }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [shelter, setShelter] = useState<Shelter>("none");
  const [summary, setSummary] = useState<{ sol: number; report: SolReport } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [askRestart, setAskRestart] = useState(false);

  // Bring back a saved mission after the page loads (runs once, in the browser only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SaveData;
      if (saved.mission && saved.state && !saved.state.over) {
        setMission(saved.mission);
        setState(saved.state);
        setShelter(saved.shelter);
        setSummary(saved.summary);
        // Refresh pending choices from current rules without erasing the trip.
        const space = recordForDay(saved.mission.schedule, saved.state.sol);
        const wait = saved.state.place === "moon" ? earthMoon().oneWayMinutes : earthMars(new Date((space?.date ?? saved.mission.sun.start) + "T12:00:00Z")).oneWayMinutes;
        const currentEvent = !saved.event ? null : saved.event.id === "landing"
          ? firstDayEvent(saved.state)
          : saved.event.kind === "deck"
            ? DECK.find((card) => card.id === saved.event?.id)?.build(saved.state, wait) ?? null
            : space ? stormEvent({ space, prevSpace: recordForDay(saved.mission.schedule, saved.state.sol - 1) }, wait, saved.state.place) : null;
        setEvent(currentEvent);
      }
    } catch {
      // A broken or old save is ignored.
    }
  }, []);

  // Save progress whenever it changes.
  useEffect(() => {
    try {
      if (!mission || !state) {
        window.localStorage.removeItem(SAVE_KEY);
        return;
      }
      const data: SaveData = { mission, state, shelter, summary, showReport, event };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable: the game still works, it just won't save.
    }
  }, [mission, state, shelter, summary, showReport, event]);

  const launch = async (place: Place, choice: SunChoice, crates: CrateId[]) => {
    setLoading(true);
    const seed = Math.floor(Math.random() * 1e9);
    const rand = mulberry32(seed);
    let sun: SunWindow;
    let notice: string | undefined;
    try {
      if (choice.kind === "archived") sun = archived(choice.id);
      else if (choice.kind === "recent") {
        const d = recentWindowDates();
        sun = await fetchDonkiWindow(d.start, d.end, "Today's Sun", "live-recent");
      } else {
        const d = randomWindowDates(rand);
        sun = await fetchDonkiWindow(d.start, d.end, "A random stretch of real Sun", "live-random");
      }
    } catch {
      sun = randomArchived(rand);
      notice = "We couldn't reach NASA just now, so this trip uses saved real NASA records instead.";
    }
    const pool = place === "moon" ? MOON_WEATHER : MARS_WEATHER;
    const weather = pool[Math.floor(rand() * pool.length)];
    if (!weather) { setLoading(false); return; }
    const schedule = buildSchedule(sun);
    const g = createGame(seed, crates, place);
    setMission({ sun, schedule, weather, notice });
    setState(g);
    setLoading(false);
    startSol(g, schedule);
  };

  const linkFor = (sol: number, sched = mission?.schedule, place = state?.place) =>
    place === "moon" ? earthMoon() : earthMars(new Date((recordForDay(sched ?? [], sol)?.date ?? new Date().toISOString().slice(0, 10)) + "T12:00:00Z"));

  const startSol = (g: GameState, sched: SolSpaceWeather[]) => {
    setShelter("none");
    const link = linkFor(g.sol, sched, g.place);
    const space = recordForDay(sched, g.sol);
    if (!space) return;
    const ev = eventForSol(g, { space, prevSpace: g.sol > 1 ? recordForDay(sched, g.sol - 1) : undefined }, link.oneWayMinutes);
    setEvent(ev);
  };

  const choose = (opt: EventOption, shelterOverride?: "full" | "late") => {
    if (!state || !event) return;
    const g = chooseOption(state, event, opt);
    const sh = shelterOverride ?? opt.effect.shelter;
    if (sh) setShelter(sh);
    setState(g);
    return g;
  };

  const closeEvent = () => {
    setEvent(null);
    if (state?.over) { setShowReport(true); return; }
    endToday();
  };

  const sol = state?.sol ?? 1;
  const ctx = useMemo(() => {
    if (!mission) return null;
    const weather = recordForDay(mission.weather.sols, sol);
    const space = recordForDay(mission.schedule, sol);
    if (!weather || !space) return null;
    return {
      weather,
      space,
      prevSpace: sol > 1 ? recordForDay(mission.schedule, sol - 1) : undefined,
      shelter,
    };
  }, [mission, sol, shelter]);

  const delays = useMemo<[number, number]>(() => {
    if (!mission) return [0, 0];
    const m = mission.schedule.map((d) => (state?.place === "moon" ? earthMoon() : earthMars(new Date(d.date + "T12:00:00Z"))).oneWayMinutes);
    return [Math.min(...m), Math.max(...m)];
  }, [mission, state?.place]);

  const reset = () => {
    setMission(null);
    setState(null);
    setSummary(null);
    setShowReport(false);
    setEvent(null);
    setShelter("none");
    setAskRestart(false);
  };

  if (!mission || !state || !ctx) {
    return <MissionSetup initialStorm={initialStorm} loading={loading} onLaunch={launch} />;
  }

  if (showReport) {
    return <MissionReport state={state} schedule={mission.schedule} sun={mission.sun} delays={delays} onAgain={reset} />;
  }

  const P = placeWords(state.place);
  const pct = resourcePercentages(state);
  const replay = state.sol > mission.schedule.length;
  const shownSun: SunWindow = replay ? { ...mission.sun, source: "archived" } : mission.sun;
  const link = linkFor(state.sol);
  const upcoming = [1, 2, 3]
    .map((offset) => ({ sol: state.sol + offset, speed: recordForDay(mission.schedule, state.sol + offset)?.cmeArrival?.speed ?? 0 }))
    .filter((u) => u.speed);

  const endToday = () => {
    const { state: next, report } = endStoryDay(state, ctx);
    setSummary({ sol: state.sol, report });
    setState(next);
  };

  const nextSol = () => {
    setSummary(null);
    if (state.over) {
      setShowReport(true);
      return;
    }
    startSol(state, mission.schedule);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
      {/* Stays stuck under the site header so the crew can always find these. */}
      <div className="sticky top-[61px] z-30 -mx-3 mb-4 rounded-b-xl bg-background/95 px-3 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="panel" size="sm" asChild>
            <Link to="/">🏠 Back to home</Link>
          </Button>
          <Button variant="panel" size="sm" onClick={() => setAskRestart(true)}>
            🔁 Restart mission
          </Button>
          {askRestart && (
            <span className="flex flex-wrap items-center gap-2 rounded-xl border border-radiation/60 bg-radiation/10 p-2 text-sm">
              <span className="font-semibold">Start a brand-new mission? This erases the one you're on.</span>
              <Button variant="panel" size="sm" onClick={() => setAskRestart(false)}>Keep playing</Button>
              <Button variant="alert" size="sm" onClick={reset}>Yes, restart</Button>
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-data text-xs uppercase tracking-widest text-primary">{P.base} · {P.on}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {state.place === "moon" ? "Day" : <Term k="sol">Mars day</Term>} {state.sol}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Survived {state.log.length} days · Keep going!</p>
        </div>
        <SourceBadge sun={shownSun} />
      </div>
      {replay && <p className="mb-4 text-sm text-muted-foreground">SAVED NASA records are repeating from their original dates. Your mission keeps going.</p>}
      {mission.notice && <p className="mb-4 rounded-xl border border-power/50 bg-power/10 p-3 text-sm">{mission.notice}</p>}
      {shelter !== "none" && (
        <p className="mb-4 rounded-xl border border-radiation/60 bg-radiation/10 p-3 text-sm font-semibold">
          🛡️ {shelter === "full" ? "The crew is hiding in the storm shelter today: most storm radiation is blocked, but the plants get half the care." : "The crew got to the shelter late: some storm radiation got through."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Gauge tone="air" emoji="🫁" label="Air" value={pct.air} unit="%" max={100} danger={pct.air < 25} />
        <Gauge tone="food" emoji="🥬" label="Food" value={pct.food} unit="%" max={100} danger={pct.food < 25} />
        <Gauge tone="power" emoji="🔋" label="Power" value={pct.power} unit="%" max={100} danger={pct.power < 25} />
        <Gauge
          tone="radiation"
          emoji="🛡️"
          label="Radiation safety"
          value={pct.safety}
          unit="%"
          max={100}
          danger={pct.safety < 25}
          hint={<Term k="waterwall">Water walls block radiation</Term>}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[22rem_1fr]">
        <TodayPanel place={state.place} sol={state.sol} space={ctx.space} upcoming={upcoming} weather={ctx.weather} link={link} />
        {event && !summary && <EventOverlay key={`${state.sol}-${event.id}`} inline event={event} state={state} link={link} onChoose={choose} onClose={closeEvent} />}
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="link" asChild>
          <Link to="/science">Where do these facts come from?</Link>
        </Button>
      </div>

      {summary && <SummaryOverlay sol={summary.sol} report={summary.report} state={state} onNext={nextSol} />}
    </div>
  );
}

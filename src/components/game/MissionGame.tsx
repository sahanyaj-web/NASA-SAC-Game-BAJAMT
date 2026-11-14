import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MARS_WEATHER } from "@/game/data/mars-weather";
import { MOON_WEATHER } from "@/game/data/moon-weather";
import {
  chooseOption, createGame, endStoryDay, eventForSol, mulberry32, resourcePercentages,
  type Shelter, type SolReport,
} from "@/game/engine";
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

export function MissionGame({ initialStorm }: { initialStorm?: string | undefined }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [shelter, setShelter] = useState<Shelter>("none");
  const [summary, setSummary] = useState<{ sol: number; report: SolReport } | null>(null);
  const [showReport, setShowReport] = useState(false);

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="panel" size="sm" asChild className="mb-2">
            <Link to="/">🏠 Back to home</Link>
          </Button>
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
          🛡️ {shelter === "full" ? "The crew is hiding in the storm shelter today: most storm radiation is blocked, but no science and the plants get half the care." : "The crew got to the shelter late: some storm radiation got through."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Gauge tone="air" emoji="🫁" label="Air" value={pct.air} unit="%" max={100} danger={pct.air < 25} />
        <Gauge tone="food" emoji="🥬" label="Food" value={pct.food} unit="%" max={100} danger={pct.food < 25} />
        <Gauge tone="power" emoji="🔋" label="Power" value={pct.power} unit="%" max={100} danger={pct.power < 25} />
        <Gauge
          tone="radiation"
          emoji="☢️"
          label="Radiation safety"
          value={pct.safety}
          unit="%"
          max={100}
          danger={pct.safety < 25}
        />
        <Gauge tone="science" emoji="🔬" label="Research" value={pct.research} unit="%" max={100} danger={pct.research < 25} hint="The crew's science work" />
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

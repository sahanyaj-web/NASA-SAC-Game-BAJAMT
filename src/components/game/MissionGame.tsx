import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MARS_WEATHER } from "@/game/data/mars-weather";
import {
  CLEAN_PANELS_EFFECT, applyEffect, fitAlloc, createGame, endSol, eventForSol, forecast, markSeen, mulberry32, powerToday,
  suggestedAlloc, type Shelter, type SolReport,
} from "@/game/engine";
import { earthMars } from "@/game/orbit";
import {
  archived, buildSchedule, fetchDonkiWindow, randomArchived, randomWindowDates, recentWindowDates,
} from "@/game/space-weather";
import type { Allocation, CrateId, EventOption, GameEvent, GameState, MarsWeatherWindow, SolSpaceWeather, SunWindow } from "@/game/types";
import { EventOverlay } from "./EventOverlay";
import { Gauge } from "./Gauge";
import { MissionReport } from "./MissionReport";
import { MissionSetup, type SunChoice } from "./MissionSetup";
import { PowerPlanner } from "./PowerPlanner";
import { SourceBadge } from "./SourceBadge";
import { SummaryOverlay } from "./SummaryOverlay";
import { Term } from "./Term";
import { TodayPanel } from "./TodayPanel";

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
  const [alloc, setAlloc] = useState<Allocation>(suggestedAlloc());
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [shelter, setShelter] = useState<Shelter>("none");
  const [cleaned, setCleaned] = useState(false);
  const [summary, setSummary] = useState<{ sol: number; report: SolReport } | null>(null);
  const [showReport, setShowReport] = useState(false);

  const launch = async (choice: SunChoice, crates: CrateId[]) => {
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
      notice = "We couldn't reach NASA's live server just now, so this mission uses saved real NASA records instead.";
    }
    const weather = MARS_WEATHER[Math.floor(rand() * MARS_WEATHER.length)]!;
    const schedule = buildSchedule(sun);
    const g = createGame(seed, crates);
    setMission({ sun, schedule, weather, notice });
    setState(g);
    setLoading(false);
    startSol(g, schedule);
  };

  const linkFor = (sol: number, sched = mission?.schedule) =>
    earthMars(new Date((sched?.[Math.min(sol, sched.length) - 1]?.date ?? new Date().toISOString().slice(0, 10)) + "T12:00:00Z"));

  const startSol = (g: GameState, sched: SolSpaceWeather[]) => {
    setAlloc(suggestedAlloc());
    setShelter("none");
    setCleaned(false);
    const i = g.sol - 1;
    const link = linkFor(g.sol, sched);
    const ev = eventForSol(g, { space: sched[i]!, prevSpace: sched[i - 1] }, link.oneWayMinutes);
    setEvent(ev);
  };

  const choose = (opt: EventOption, shelterOverride?: "full" | "late") => {
    if (!state || !event) return;
    let g = markSeen(state, event.id);
    g = applyEffect(g, opt.effect);
    const sh = shelterOverride ?? opt.effect.shelter;
    if (sh) setShelter(sh);
    setState(g);
    setEvent(null);
    if (g.over) setShowReport(true);
  };

  const sol = state?.sol ?? 1;
  const idx = Math.min(sol, mission?.schedule.length ?? 1) - 1;
  const ctx = useMemo(() => {
    if (!mission) return null;
    return {
      weather: mission.weather.sols[idx]!,
      space: mission.schedule[idx]!,
      prevSpace: mission.schedule[idx - 1],
      shelter,
    };
  }, [mission, idx, shelter]);

  const delays = useMemo<[number, number]>(() => {
    if (!mission) return [0, 0];
    const m = mission.schedule.map((d) => earthMars(new Date(d.date + "T12:00:00Z")).oneWayMinutes);
    return [Math.min(...m), Math.max(...m)];
  }, [mission]);

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

  const power = powerToday(state);
  const plan = fitAlloc(alloc, power.available);
  const fc = forecast(state, plan, ctx);
  const link = linkFor(state.sol);
  const upcoming = mission.schedule
    .map((d, i) => ({ sol: i + 1, speed: d.cmeArrival?.speed ?? 0 }))
    .filter((u) => u.speed && u.sol > state.sol && u.sol <= state.sol + 3);

  const endToday = () => {
    const { state: next, report } = endSol(state, plan, ctx);
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

  const clean = () => {
    const g = applyEffect(state, CLEAN_PANELS_EFFECT);
    setState(g);
    setCleaned(true);
    if (g.over) setShowReport(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-data text-xs uppercase tracking-widest text-primary">Outpost Ares · Gale Crater, Mars</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            <Term k="sol">Sol</Term> {Math.min(state.sol, state.totalSols)} <span className="text-muted-foreground">of {state.totalSols}</span>
          </h1>
        </div>
        <SourceBadge sun={mission.sun} />
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${((state.sol - 1) / state.totalSols) * 100}%` }} />
      </div>
      {mission.notice && <p className="mb-4 rounded-xl border border-power/50 bg-power/10 p-3 text-sm">{mission.notice}</p>}
      {shelter !== "none" && (
        <p className="mb-4 rounded-xl border border-radiation/60 bg-radiation/10 p-3 text-sm font-semibold">
          🛡️ {shelter === "full" ? "Crew is in the storm shelter today: storm radiation blocked, but no science and half greenhouse care." : "Crew reached the shelter late: some storm radiation got through."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Gauge tone="air" emoji="🫁" label="Air" value={state.air} unit="days" max={10} danger={state.air < 2} hint="Crew breathes 1 a sol" />
        <Gauge tone="food" emoji="🥬" label="Food" value={state.food} unit="days" max={12} danger={state.food < 2} hint="Crew eats 1 a sol" />
        <Gauge tone="power" emoji="🔋" label="Battery" value={state.battery} unit={`/ ${state.batteryCap}⚡`} max={state.batteryCap} hint="Saved for nights" />
        <Gauge
          tone="radiation"
          emoji="☢️"
          label="Radiation"
          value={+state.dose.toFixed(1)}
          unit={`/ ${state.doseLimit} mSv`}
          max={state.doseLimit}
          danger={state.dose > state.doseLimit * 0.75}
          hint={<Term k="msv">What's mSv?</Term>}
        />
        <Gauge tone="science" emoji="🔬" label="Science" value={state.science} unit="pts" max={30} hint="15 = ⭐⭐ · 30 = ⭐⭐⭐" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[22rem_1fr]">
        <TodayPanel sol={state.sol} space={ctx.space} upcoming={upcoming} weather={ctx.weather} link={link} />
        <PowerPlanner
          state={state}
          alloc={plan}
          setAlloc={setAlloc}
          power={power}
          forecast={fc}
          weather={ctx.weather}
          shelter={shelter}
          cleanedToday={cleaned}
          onClean={clean}
          onEndSol={endToday}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="ghost" asChild>
          <Link to="/science">Where does this data come from?</Link>
        </Button>
      </div>

      {event && !summary && <EventOverlay event={event} state={state} link={link} onChoose={choose} />}
      {summary && <SummaryOverlay sol={summary.sol} report={summary.report} state={state} onNext={nextSol} />}
    </div>
  );
}

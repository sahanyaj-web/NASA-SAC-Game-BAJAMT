import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ALLOC } from "@/game/constants";
import { allocTotal, type Forecast, type PowerToday } from "@/game/engine";
import type { Allocation, GameState, MarsWeatherSol } from "@/game/types";
import { cn } from "@/lib/utils";
import { Term } from "./Term";

type Key = keyof Allocation;

const ROWS: { key: Key; emoji: string; name: ReactNode; rule: string; dot: string }[] = [
  { key: "air", emoji: "🫁", name: <Term k="moxie">Oxygen maker</Term>, rule: "2⚡ = 1 day of air. The crew breathes 1 day every sol.", dot: "bg-air" },
  { key: "greenhouse", emoji: "🌱", name: "Greenhouse lights", rule: "3⚡ = 1 day of food. The crew eats 1 day every sol.", dot: "bg-food" },
  { key: "shield", emoji: "🛡️", name: <Term k="waterwall">Water walls</Term>, rule: "Each ⚡ keeps more shielding water from freezing.", dot: "bg-radiation" },
  { key: "science", emoji: "🔬", name: "Science lab", rule: "1⚡ = 1 science point. Science is why you came!", dot: "bg-science" },
];

export function PowerPlanner({
  state,
  alloc,
  setAlloc,
  power,
  forecast,
  weather,
  shelter,
  cleanedToday,
  onClean,
  onEndSol,
}: {
  state: GameState;
  alloc: Allocation;
  setAlloc: (a: Allocation) => void;
  power: PowerToday;
  forecast: Forecast;
  weather: MarsWeatherSol;
  shelter: "full" | "late" | "none";
  cleanedToday: boolean;
  onClean: () => void;
  onEndSol: () => void;
}) {
  const used = allocTotal(alloc);
  const left = power.available - used;
  const set = (k: Key, v: number) => {
    const clamped = Math.max(0, Math.min(MAX_ALLOC[k], v));
    if (clamped - alloc[k] > left) return;
    setAlloc({ ...alloc, [k]: clamped });
  };
  const preview: Record<Key, string> = {
    air: `+${forecast.airMade.toFixed(1)} days of air${state.statuses.airClog ? " (clogged: half speed)" : ""}`,
    greenhouse: `+${forecast.foodMade.toFixed(1)} days of food${shelter === "full" ? " (half care: crew in shelter)" : ""}`,
    shield: `Shield level ${forecast.shieldLevel}${state.shieldBonus ? ` (${state.shieldBonus} free from water)` : ""} · radiation today ${forecast.doseToday.toFixed(2)} mSv`,
    science: shelter === "full" ? "No science while hiding in the shelter" : `+${forecast.scienceMade} science`,
  };

  return (
    <section className="panel p-4 sm:p-6" aria-labelledby="planner-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="planner-title" className="text-2xl font-bold">⚡ Power plan for today</h2>
          <p className="text-sm text-muted-foreground">Share out your power. Whatever is left charges the battery for tonight.</p>
        </div>
        <div className="text-right">
          <p className="text-data text-3xl font-bold text-power">{left}⚡</p>
          <p className="text-xs text-muted-foreground">left to share</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="panel-raised p-2">
          <p className="text-data text-lg font-bold text-power">{power.solar}⚡</p>
          <p className="text-xs text-muted-foreground">sunlight{state.statuses.dustStorm ? " (dust storm!)" : ""}</p>
        </div>
        <div className="panel-raised p-2">
          <p className="text-data text-lg font-bold text-power">{power.reactor}⚡</p>
          <p className="text-xs text-muted-foreground">reactor</p>
        </div>
        <div className="panel-raised p-2">
          <p className="text-data text-lg font-bold text-power">{state.battery}⚡</p>
          <p className="text-xs text-muted-foreground">from battery</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {ROWS.map((r) => (
          <li key={r.key} className="panel-raised p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">
                  <span aria-hidden className="mr-2">{r.emoji}</span>
                  {r.name}
                </p>
                <p className="text-xs text-muted-foreground">{r.rule}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="panel"
                  size="icon"
                  aria-label={`Less power to ${r.key}`}
                  disabled={alloc[r.key] === 0}
                  onClick={() => set(r.key, alloc[r.key] - 1)}
                >
                  <Minus />
                </Button>
                <div className="flex gap-1" aria-hidden>
                  {Array.from({ length: MAX_ALLOC[r.key] }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      tabIndex={-1}
                      onClick={() => set(r.key, alloc[r.key] === i + 1 ? i : i + 1)}
                      className={cn(
                        "size-5 rounded-md border transition-colors sm:size-6",
                        i < alloc[r.key] ? cn(r.dot, "border-transparent") : "border-border bg-muted",
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="panel"
                  size="icon"
                  aria-label={`More power to ${r.key}`}
                  disabled={alloc[r.key] >= MAX_ALLOC[r.key] || left <= 0}
                  onClick={() => set(r.key, alloc[r.key] + 1)}
                >
                  <Plus />
                </Button>
                <span className="text-data w-8 text-right font-bold">{alloc[r.key]}</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold">{preview[r.key]}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 panel-raised flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="text-sm">
          <p className="font-semibold">
            🔆 Solar panels are <span className="text-power">{Math.round(state.panel * 100)}%</span> clean
          </p>
          <p className="text-xs text-muted-foreground">
            <Term k="dust">Dust</Term> builds up every sol. Brushing needs a spacewalk: −0.5 day of air, +0.3 mSv.
          </p>
        </div>
        <Button variant="panel" disabled={cleanedToday || state.panel >= 0.99} onClick={onClean}>
          {cleanedToday ? "Brushed today ✓" : "Spacewalk: brush panels"}
        </Button>
      </div>

      <div className={cn("mt-4 rounded-xl border p-4", forecast.coldNight ? "border-radiation bg-radiation/10" : "border-border")}>
        <p className="font-display text-lg font-semibold">🌙 Tonight</p>
        <p className="text-sm">
          Curiosity measured <strong className="text-air">{weather.min}°C</strong> tonight at Gale Crater (warmest today:{" "}
          {weather.max}°C). The heater needs <strong className="text-power">{forecast.heat}⚡</strong> from the battery.
        </p>
        <p className="mt-1 text-sm">
          Battery after today: <strong>{forecast.batteryAfterDay}⚡</strong> → after the night:{" "}
          <strong>{forecast.batteryAfterNight}⚡</strong>
          {forecast.wasted > 0 && <span className="text-muted-foreground"> · {forecast.wasted}⚡ wasted (battery full)</span>}
        </p>
        {forecast.coldNight && (
          <p className="mt-1 text-sm font-bold text-radiation">⚠️ Not enough battery for the heater! Plants will freeze (−1 day of food).</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <Prediction label="Air at bedtime" value={forecast.airAfter} unit="days" warn={forecast.airAfter < 2} tone="text-air" />
        <Prediction label="Food at bedtime" value={forecast.foodAfter} unit="days" warn={forecast.foodAfter < 2} tone="text-food" />
        <Prediction label="Radiation total" value={state.dose + forecast.doseToday} unit="mSv" warn={state.dose + forecast.doseToday > state.doseLimit * 0.75} tone="text-radiation" />
      </div>

      <Button variant="mission" size="xl" className="mt-6 w-full" onClick={onEndSol}>
        🌙 End sol {state.sol}
      </Button>
    </section>
  );
}

function Prediction({ label, value, unit, warn, tone }: { label: string; value: number; unit: string; warn: boolean; tone: string }) {
  return (
    <div className={cn("panel-raised p-2", warn && "border-radiation")}>
      <p className={cn("text-data text-lg font-bold", warn ? "text-radiation" : tone)}>
        {value.toFixed(1)} <span className="text-xs">{unit}</span>
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

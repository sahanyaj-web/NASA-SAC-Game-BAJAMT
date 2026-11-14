import { Button } from "@/components/ui/button";
import { EARTH_MSV_PER_DAY } from "@/game/constants";
import { OSDR_FACTS, osdrUrl } from "@/game/data/osdr-facts";
import type { SolReport } from "@/game/engine";
import type { GameState } from "@/game/types";
import { Overlay } from "./Overlay";

export function SummaryOverlay({ sol, report, state, onNext }: { sol: number; report: SolReport; state: GameState; onNext: () => void }) {
  const f = report.forecast;
  const fact = OSDR_FACTS[(sol - 1) % OSDR_FACTS.length]!;
  const xrays = Math.round(state.dose / 0.1);
  const earthDays = Math.round(state.dose / EARTH_MSV_PER_DAY);
  const rows: [string, string, string][] = [
    ["🫁 Air", `made ${f.airMade.toFixed(1)}, breathed 1`, `${state.air.toFixed(1)} days left`],
    ["🥬 Food", `grew ${f.foodMade.toFixed(1)}, ate 1`, `${state.food.toFixed(1)} days left`],
    ["☢️ Radiation", `+${f.doseToday.toFixed(2)} today`, `${state.dose.toFixed(1)} of ${state.doseLimit}`],
    ["🔬 Science", `+${f.scienceMade}`, `${state.science} points`],
    ["🔋 Battery", `${f.heat}⚡ used by the heater`, `${state.battery}⚡ for the morning`],
  ];
  return (
    <Overlay label={`End of sol ${sol}`}>
      <p className="text-data text-xs uppercase tracking-widest text-primary">Night falls</p>
      <h2 className="text-3xl font-bold">🌙 Mars day {sol} is done</h2>
      <ul className="mt-4 divide-y divide-border">
        {rows.map(([a, b, c]) => (
          <li key={a} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 py-2 text-sm">
            <span className="font-bold">{a}</span>
            <span className="text-muted-foreground">{b}</span>
            <span className="text-data font-bold">{c}</span>
          </li>
        ))}
      </ul>
      {report.notes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {report.notes.map((n) => (
            <li key={n} className="rounded-lg bg-muted p-2 text-sm">⚠️ {n}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Your crew's radiation so far is about the same as <strong className="text-foreground">{xrays} chest X-rays</strong>, or{" "}
        <strong className="text-foreground">{earthDays} days</strong> of living on Earth.
      </p>
      <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
        <p className="font-bold text-accent">🧬 Real astronaut science from NASA</p>
        <p className="mt-1">{fact.kid}</p>
        <a href={osdrUrl(fact.id)} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-accent hover:underline">
          Read NASA study {fact.id} ↗
        </a>
      </div>
      <Button variant="mission" size="xl" className="mt-6 w-full" onClick={onNext} autoFocus>
        {state.over ? "See mission report" : `☀️ Wake up for Mars day ${sol + 1}`}
      </Button>
    </Overlay>
  );
}

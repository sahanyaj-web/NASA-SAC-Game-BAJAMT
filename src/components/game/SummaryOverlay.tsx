import { Button } from "@/components/ui/button";
import { resourcePercentages } from "@/game/engine";
import { OSDR_FACTS, osdrUrl } from "@/game/data/osdr-facts";
import type { SolReport } from "@/game/engine";
import type { GameState } from "@/game/types";
import { placeWords } from "@/game/words";
import { Overlay } from "./Overlay";

export function SummaryOverlay({ sol, report, state, onNext }: { sol: number; report: SolReport; state: GameState; onNext: () => void }) {
  const pct = resourcePercentages(state);
  const D = placeWords(state.place).day;
  const fact = OSDR_FACTS[(sol - 1) % OSDR_FACTS.length];
  const rows: [string, string][] = [
    ["🫁 Air", `${pct.air}%`],
    ["🥬 Food", `${pct.food}%`],
    ["☢️ Radiation safety", `${pct.safety}%`],
    ["🔋 Power", `${pct.power}%`],
  ];
  return (
    <Overlay label={`End of ${D} ${sol}`}>
      <p className="text-data text-xs uppercase tracking-widest text-primary">Night falls</p>
      <h2 className="text-3xl font-bold">🌙 {D} {sol} is done</h2>
      <ul className="mt-4 divide-y divide-border">
        {rows.map(([a, b]) => (
          <li key={a} className="grid grid-cols-2 items-center gap-2 py-2 text-sm sm:grid-cols-[1fr_auto]">
            <span className="font-bold">{a}</span>
            <span className="text-data font-bold">{b}</span>
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
      {fact && <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
        <p className="font-bold text-accent">🧬 Real astronaut science from NASA</p>
        <p className="mt-1">{fact.kid}</p>
        <a href={osdrUrl(fact.id)} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-accent hover:underline">
          Read NASA study {fact.id} ↗
        </a>
      </div>}
      <Button variant="mission" size="xl" className="mt-6 w-full" onClick={onNext} autoFocus>
        {state.over ? "See mission report" : `☀️ Wake up for ${D} ${sol + 1}`}
      </Button>
    </Overlay>
  );
}

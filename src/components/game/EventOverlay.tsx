import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { canAfford } from "@/game/engine";
import type { EarthMarsInfo } from "@/game/orbit";
import type { EventOption, GameEvent, GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { AskEarthRace } from "./AskEarthRace";
import { Overlay } from "./Overlay";
import { Term } from "./Term";

export function EventOverlay({
  event,
  state,
  link,
  onChoose,
}: {
  event: GameEvent;
  state: GameState;
  link: EarthMarsInfo;
  onChoose: (opt: EventOption, shelterOverride?: "full" | "late") => void;
}) {
  const [racing, setRacing] = useState<EventOption | null>(null);
  const urgent = event.kind === "storm" || event.kind === "cme";

  return (
    <Overlay label={event.title} alert={urgent}>
      <div className="flex items-start gap-4">
        <span aria-hidden className={cn("grid size-14 shrink-0 place-items-center rounded-2xl bg-muted text-3xl", urgent && "animate-alert")}>
          {event.emoji}
        </span>
        <div>
          <p className="text-data text-xs uppercase tracking-widest text-primary">Sol {state.sol} · {urgent ? "Emergency" : "Something happened"}</p>
          <h2 className="text-2xl font-bold sm:text-3xl">{event.title}</h2>
        </div>
      </div>
      <p className="mt-4 text-base leading-relaxed">{event.text}</p>
      {urgent && (
        <p className="mt-2 text-sm text-muted-foreground">
          Words to know: <Term k={event.kind === "storm" ? "sep" : "cme"} /> · <Term k="msv" />
        </p>
      )}

      {racing ? (
        <div className="mt-6">
          <AskEarthRace link={link} onDone={(inTime) => onChoose(racing, inTime ? "full" : "late")} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {event.options.map((o) => {
            const ok = canAfford(state, o.effect);
            return (
              <button
                key={o.id}
                type="button"
                disabled={!ok}
                onClick={() => (o.askEarth && urgent ? setRacing(o) : onChoose(o))}
                className="panel-raised p-4 text-left transition-all hover:border-primary hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="font-display text-lg font-semibold">{o.label}</p>
                <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  <p><span className="font-bold text-radiation">You give up:</span> {o.cost}</p>
                  <p><span className="font-bold text-food">You get:</span> {o.gain}</p>
                </div>
                {!ok && <p className="mt-1 text-xs text-radiation">Not enough battery for this.</p>}
              </button>
            );
          })}
        </div>
      )}

      {event.fact && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <p className="font-bold text-accent">🛰️ Real NASA science</p>
          <p className="mt-1">{event.fact.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Source:{" "}
            {event.fact.url ? (
              <a className="inline-flex items-center gap-1 text-accent hover:underline" href={event.fact.url} target="_blank" rel="noreferrer">
                {event.fact.source} <ExternalLink className="size-3" />
              </a>
            ) : (
              event.fact.source
            )}
          </p>
        </div>
      )}
    </Overlay>
  );
}

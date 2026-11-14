import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { effectChips } from "@/game/engine";
import { CREW_CAST } from "@/game/events";
import type { EarthMarsInfo } from "@/game/orbit";
import type { EventOption, GameEvent, GameState } from "@/game/types";
import { placeWords } from "@/game/words";
import { cn } from "@/lib/utils";
import { AskEarthRace } from "./AskEarthRace";
import { Overlay } from "./Overlay";
import { Term } from "./Term";

export function EventOverlay({
  event,
  state,
  link,
  onChoose,
  onClose,
  inline = false,
}: {
  event: GameEvent;
  state: GameState;
  link: EarthMarsInfo;
  onChoose: (opt: EventOption, shelterOverride?: "full" | "late") => void;
  onClose: () => void;
  inline?: boolean;
}) {
  const [racing, setRacing] = useState<EventOption | null>(null);
  const [picked, setPicked] = useState<EventOption | null>(null);
  const urgent = event.kind === "storm" || event.kind === "cme";
  const who = CREW_CAST[event.who];
  const P = placeWords(state.place);

  const pick = (o: EventOption, shelter?: "full" | "late") => {
    onChoose(o, shelter);
    setPicked(o);
    setRacing(null);
  };

  const content = (
    <>
      <div className="flex items-start gap-4">
        <span aria-hidden className={cn("grid size-14 shrink-0 place-items-center rounded-2xl bg-muted text-3xl", urgent && "animate-alert")}>
          {event.emoji}
        </span>
        <div>
          <p className="text-data text-xs uppercase tracking-widest text-primary">
            {P.day} {state.sol} · {urgent ? "Emergency" : "Something happened"}
          </p>
          <h2 className="text-2xl font-bold sm:text-3xl">{event.title}</h2>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
        <span aria-hidden>{who.emoji}</span> <strong>{who.name}</strong> <span className="text-muted-foreground">({who.job})</span>
      </p>
      <p className="mt-3 text-base leading-relaxed">{event.text}</p>
      {urgent && (
        <p className="mt-2 text-sm text-muted-foreground">
          Tap to learn: <Term k={event.kind === "storm" ? "sep" : "cme"} /> · <Term k="msv" />
        </p>
      )}

      {picked ? (
        <div className="mt-6 panel-raised animate-float-in p-4">
          <p className="text-data text-xs uppercase tracking-widest text-primary">What happened next</p>
          <p className="mt-1 font-display text-lg font-semibold">You chose: {picked.label}</p>
          <p className="mt-2">{picked.outcome}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {effectChips(picked.effect).map((c) => (
              <span key={c.text} className={cn("rounded-full border px-2 py-1 text-xs", c.good ? "border-food text-food" : "border-radiation text-radiation")}>
                {c.text}
              </span>
            ))}
          </div>
          <Button variant="mission" size="lg" className="mt-4 w-full" onClick={onClose} autoFocus>
            Continue
          </Button>
        </div>
      ) : racing ? (
        <div className="mt-6">
          <AskEarthRace link={link} onDone={(inTime) => pick(racing, inTime ? "full" : "late")} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {event.options.map((o) => (
            <Button
              key={o.id}
              type="button"
              onClick={() => (o.askEarth && urgent ? setRacing(o) : pick(o))}
              variant="panel"
              className="h-auto min-w-0 flex-col items-start whitespace-normal p-4 text-left transition-all hover:border-primary hover:shadow-glow"
            >
              <p className="font-display text-lg font-semibold">{o.label}</p>
              <p className="mt-2 text-sm"><span className="font-bold text-radiation">You give up:</span> {o.cost}</p>
              <p className="mt-1 text-sm"><span className="font-bold text-food">You get:</span> {o.gain}</p>
            </Button>
          ))}
        </div>
      )}

      {event.fact && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <p className="font-bold text-accent">🛰️ True NASA fact</p>
          <p className="mt-1">{event.fact.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            From:{" "}
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
    </>
  );
  return inline
    ? <section className="min-w-0 p-4 sm:p-6" aria-label={event.title}>{content}</section>
    : <Overlay label={event.title} alert={urgent}>{content}</Overlay>;
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ARCHIVED_SUN } from "@/game/data/sun-archive";
import { CRATES, CRATE_PICKS } from "@/game/engine";
import type { CrateId, Place } from "@/game/types";
import { cn } from "@/lib/utils";
import marsScene from "@/assets/mars-adventure.jpg";
import moonScene from "@/assets/moon-adventure.jpg";

export type SunChoice = { kind: "recent" } | { kind: "random" } | { kind: "archived"; id: string };

// Two Sun picks count as the same choice when they ask NASA for the same stretch of days.
function sameSun(a: SunChoice, b: SunChoice) {
  return a.kind === b.kind && (a.kind !== "archived" || b.kind !== "archived" || a.id === b.id);
}

export function MissionSetup({
  initialStorm,
  loading,
  onLaunch,
}: {
  initialStorm?: string | undefined;
  loading: boolean;
  onLaunch: (place: Place, sun: SunChoice, crates: CrateId[]) => void;
}) {
  const startingSun: SunChoice = initialStorm ? { kind: "archived", id: initialStorm } : { kind: "recent" };
  const [sun, setSun] = useState<SunChoice>(startingSun);
  const [crates, setCrates] = useState<CrateId[]>([]);
  const [place, setPlace] = useState<Place>("mars");

  // The reset button only shows once the player has changed something.
  const changed = place !== "mars" || !sameSun(sun, startingSun) || crates.length > 0;

  const resetPicks = () => {
    setPlace("mars");
    setSun(startingSun);
    setCrates([]);
  };

  const toggle = (id: CrateId) =>
    setCrates((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < CRATE_PICKS ? [...c, id] : [c[1]!, id]));

  const sunCard = (active: boolean) =>
    cn("panel-raised w-full p-4 text-left transition-all hover:border-primary/70", active && "border-primary shadow-glow");

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 animate-float-in">
      {changed && (
        <div className="flex justify-end">
          <Button variant="panel" size="sm" onClick={resetPicks}>
            🔄 Reset choices
          </Button>
        </div>
      )}
      <section>
        <p className="text-data text-xs uppercase tracking-widest text-primary">Step 1 of 3</p>
        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">Where is your base? 🚀</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Each place has its own real NASA facts, dangers and message wait.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Button variant="panel" type="button" aria-pressed={place === "moon"} className={cn(sunCard(place === "moon"), "h-auto flex-col items-stretch whitespace-normal overflow-hidden")} onClick={() => setPlace("moon")}>
            <img src={moonScene} alt="A friendly astronaut and rover at a Moon base with Earth overhead" width={1536} height={864} className="mb-4 aspect-[16/8] w-full rounded-md object-cover" />
            <p className="font-display text-xl font-semibold">🌕 Moon base</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Close to home: messages reach Earth in about 1 second. But the Moon has no air at all, so radiation is about twice as strong as on Mars.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Uses NASA's Moon orbiter, Apollo and Artemis facts.</p>
          </Button>
          <Button variant="panel" type="button" aria-pressed={place === "mars"} className={cn(sunCard(place === "mars"), "h-auto flex-col items-stretch whitespace-normal overflow-hidden")} onClick={() => setPlace("mars")}>
            <img src={marsScene} alt="A friendly astronaut and rover beside a Mars base and plant room" width={1536} height={864} className="mb-4 aspect-[16/8] w-full rounded-md object-cover" />
            <p className="font-display text-xl font-semibold">🔴 Mars base</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Far away: messages take many minutes, so you must decide alone. Thin air blocks a little radiation, but dust storms can hide the Sun.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Uses real weather from NASA's Curiosity rover.</p>
          </Button>
        </div>
      </section>

      <section>
        <p className="text-data text-xs uppercase tracking-widest text-primary">Step 2 of 3</p>
        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">Pick your Sun ☀️</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each day of your trip uses what the <strong>real Sun</strong> did on a real day. NASA keeps a log of
          everything the Sun does. Every Sun flash and radiation storm in the game really happened! These record dates repeat if you survive longer than the record set.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button type="button" className={sunCard(sun.kind === "recent")} onClick={() => setSun({ kind: "recent" })}>
            <p className="font-display text-xl font-semibold">📡 Today's Sun</p>
            <p className="mt-1 text-sm text-muted-foreground">Straight from NASA: what the Sun did in the last 15 days.</p>
          </button>
          <button type="button" className={sunCard(sun.kind === "random")} onClick={() => setSun({ kind: "random" })}>
            <p className="font-display text-xl font-semibold">🎲 Surprise me</p>
            <p className="mt-1 text-sm text-muted-foreground">Straight from NASA: 15 real days picked by chance since 2012. New every time!</p>
          </button>
        </div>
        <p className="mt-6 text-sm font-bold text-muted-foreground">…or survive a famous real Sun storm:</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARCHIVED_SUN.map((w) => (
            <button
              key={w.id}
              type="button"
              className={sunCard(sun.kind === "archived" && sun.id === w.id)}
              onClick={() => setSun({ kind: "archived", id: w.id })}
            >
              <p className="font-display text-lg font-semibold">{w.name}</p>
              <p className="text-data text-xs text-primary">{w.start} → {w.end}</p>
              <p className="mt-1 text-sm text-muted-foreground">{w.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-data text-xs uppercase tracking-widest text-primary">Step 3 of 3</p>
        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">Pack your rocket 🚀</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Rockets can only carry so much. Choose <strong>{CRATE_PICKS} boxes</strong> to bring. Every box you
          pick means another one stays on Earth.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CRATES.map((c) => {
            const on = crates.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} className={sunCard(on)} onClick={() => toggle(c.id)}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">
                    <span aria-hidden className="mr-2 text-2xl">{c.emoji}</span>
                    {c.name}
                  </p>
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full border-2 text-sm font-bold",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {on ? "✓" : ""}
                  </span>
                </div>
                <p className="mt-2 text-sm">{c.what}</p>
                <p className="mt-1 text-xs text-muted-foreground">True fact: {c.real}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-center gap-2 pb-8">
        <Button
          variant="mission"
          size="xl"
          disabled={crates.length !== CRATE_PICKS || loading}
          onClick={() => onLaunch(place, sun, crates)}
        >
          {loading ? "Asking NASA about the Sun…" : "🚀 Blast off!"}
        </Button>
        {crates.length !== CRATE_PICKS && (
          <p className="text-sm text-muted-foreground">Pick {CRATE_PICKS - crates.length} more box{CRATE_PICKS - crates.length === 1 ? "" : "es"}.</p>
        )}
      </div>
    </div>
  );
}

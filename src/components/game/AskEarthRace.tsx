import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SECONDS_PER_GAME_MINUTE, SEP_ARRIVAL_MINUTES } from "@/game/constants";
import type { EarthMarsInfo } from "@/game/orbit";

/**
 * Real-time race: the question to Earth + the answer back vs. the particles.
 * 1 real minute is shown as half a second so kids can *feel* the delay.
 */
export function AskEarthRace({ link, onDone }: { link: EarthMarsInfo; onDone: (inTime: boolean) => void }) {
  const roundTrip = link.conjunction ? Infinity : link.oneWayMinutes * 2;
  const end = Math.min(roundTrip, SEP_ARRIVAL_MINUTES);
  const inTime = roundTrip < SEP_ARRIVAL_MINUTES;
  const [min, setMin] = useState(0);
  const start = useRef<number | null>(null);
  const done = min >= end;

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (start.current === null) start.current = t;
      const m = (t - start.current) / 1000 / SECONDS_PER_GAME_MINUTE;
      setMin(Math.min(end, m));
      if (m < end) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);

  const bar = (value: number, total: number) => `${Math.min(100, (value / total) * 100)}%`;
  const outMin = link.conjunction ? Infinity : link.oneWayMinutes;

  return (
    <div className="space-y-4" aria-live="polite">
      <p className="text-data text-center text-4xl font-bold">{Math.floor(min)} min</p>
      <p className="text-center text-xs text-muted-foreground">real-life minutes passing (sped up: 1 minute = ½ second)</p>

      <div>
        <p className="text-sm font-semibold">☢️ Particles reach the outpost ({SEP_ARRIVAL_MINUTES} min)</p>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-radiation" style={{ width: bar(min, SEP_ARRIVAL_MINUTES) }} />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">
          📡 Your message flies to Earth ({link.conjunction ? "blocked by the Sun!" : `${Math.round(outMin)} min`})
        </p>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-air" style={{ width: link.conjunction ? "0%" : bar(min, outMin) }} />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">🌍 Earth's answer flies back {link.conjunction ? "" : `(${Math.round(outMin)} min)`}</p>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-science"
            style={{ width: link.conjunction ? "0%" : bar(Math.max(0, min - outMin), outMin) }}
          />
        </div>
      </div>

      {done && (
        <div className="panel-raised animate-float-in p-4">
          {inTime ? (
            <>
              <p className="font-display text-lg font-semibold text-food">🌍 "Go to the shelter now!" — Mission Control</p>
              <p className="mt-1 text-sm">
                The answer made it in time because Mars is fairly close to Earth on this date. Everyone hides safely.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-radiation">☢️ The particles got here first!</p>
              <p className="mt-1 text-sm">
                {link.conjunction
                  ? "The Sun blocked your message completely."
                  : `A reply needs ${Math.round(roundTrip)} minutes round-trip, but the particles came in ${SEP_ARRIVAL_MINUTES}.`}{" "}
                The crew rushed to the shelter late. Real Mars crews will have to make fast decisions themselves.
              </p>
            </>
          )}
          <Button variant="mission" className="mt-3 w-full" onClick={() => onDone(inTime)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

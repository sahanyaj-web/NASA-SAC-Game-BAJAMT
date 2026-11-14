import { useEffect, useState } from "react";
import { earthMars, formatMinutes, type EarthMarsInfo } from "@/game/orbit";
import { addDays, fetchDonkiWindow, strongest } from "@/game/space-weather";

/** Right-now facts, fetched in the browser after load. */
export function LiveStrip() {
  const [link, setLink] = useState<EarthMarsInfo | null>(null);
  const [sun, setSun] = useState<{ flare: string | null; count: number; sep: boolean } | "error" | null>(null);

  useEffect(() => {
    setLink(earthMars(new Date()));
    const today = new Date().toISOString().slice(0, 10);
    fetchDonkiWindow(addDays(today, -3), today, "now", "live-recent")
      .then((w) => setSun({ flare: strongest(w.flares.map((f) => f.c)), count: w.flares.length, sep: w.seps.length > 0 }))
      .catch(() => setSun("error"));
  }, []);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="panel p-4">
        <p className="text-data text-xs font-bold text-live">
          <span className="mr-1 inline-block size-2 rounded-full bg-live animate-blink" />
          LIVE · NASA DONKI · last 3 days
        </p>
        {sun === null && <p className="mt-2 text-sm text-muted-foreground">Asking NASA what the Sun is doing…</p>}
        {sun === "error" && <p className="mt-2 text-sm text-muted-foreground">NASA's server didn't answer right now. The game will use saved records.</p>}
        {sun && sun !== "error" && (
          <p className="mt-2">
            {sun.count === 0 ? (
              "The Sun has been calm — no flares recorded."
            ) : (
              <>
                <strong>{sun.count}</strong> solar flares, strongest <strong className="text-power">{sun.flare}</strong>.
              </>
            )}{" "}
            {sun.sep ? <span className="text-radiation">A particle storm was detected!</span> : "No particle storms."}
          </p>
        )}
      </div>
      <div className="panel p-4">
        <p className="text-data text-xs font-bold text-accent">TODAY · calculated from NASA JPL planet positions</p>
        {link ? (
          <p className="mt-2">
            Mars is <strong>{(link.distanceKm / 1e6).toFixed(0)} million km</strong> from Earth. A radio message takes{" "}
            <strong className="text-accent">{formatMinutes(link.oneWayMinutes)}</strong> to get there.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Measuring the distance to Mars…</p>
        )}
      </div>
    </div>
  );
}

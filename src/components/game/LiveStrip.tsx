import { useEffect, useState } from "react";
import { earthMars, formatMinutes, type EarthMarsInfo } from "@/game/orbit";
import { addDays, fetchDonkiWindow, strongest } from "@/game/space-weather";
import { flareWord } from "@/game/words";

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
          LIVE · from NASA · last 3 days
        </p>
        {sun === null && <p className="mt-2 text-sm text-muted-foreground">Asking NASA what the Sun is doing…</p>}
        {sun === "error" && <p className="mt-2 text-sm text-muted-foreground">NASA didn't answer just now. The game will use saved NASA records.</p>}
        {sun && sun !== "error" && (
          <p className="mt-2">
            {sun.count === 0 ? (
              "The Sun has been calm — no Sun flashes."
            ) : (
              <>
                <strong>{sun.count}</strong> Sun flash{sun.count === 1 ? "" : "es"}. The biggest was{" "}
                <strong className="text-power">{flareWord(sun.flare)}</strong> <span className="text-muted-foreground">({sun.flare})</span>.
              </>
            )}{" "}
            {sun.sep ? <span className="text-radiation">There was a radiation storm!</span> : "No radiation storms."}
          </p>
        )}
      </div>
      <div className="panel p-4">
        <p className="text-data text-xs font-bold text-accent">TODAY · worked out from NASA's planet maps</p>
        {link ? (
          <p className="mt-2">
            Mars is <strong>{(link.distanceKm / 1e6).toFixed(0)} million km</strong> from Earth. A message takes{" "}
            <strong className="text-accent">{formatMinutes(link.oneWayMinutes)}</strong> to get there.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Measuring the distance to Mars…</p>
        )}
      </div>
    </div>
  );
}

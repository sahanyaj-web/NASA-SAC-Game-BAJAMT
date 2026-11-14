import { ExternalLink } from "lucide-react";
import { formatMinutes, type EarthMarsInfo } from "@/game/orbit";
import { donkiBrowseUrl } from "@/game/space-weather";
import type { MarsWeatherSol, SolSpaceWeather } from "@/game/types";
import { Term } from "./Term";

export function TodayPanel({
  sol,
  space,
  upcoming,
  weather,
  link,
}: {
  sol: number;
  space: SolSpaceWeather;
  upcoming: { sol: number; speed: number }[];
  weather: MarsWeatherSol;
  link: EarthMarsInfo;
}) {
  const big = space.flares.filter((f) => f[0] === "M" || f[0] === "X");
  return (
    <aside className="space-y-4" aria-label="Today's report">
      <section className="panel p-4">
        <h3 className="text-lg font-bold">☀️ Real Sun today</h3>
        <p className="text-data text-xs text-primary">Earth date {space.date}</p>
        {space.flares.length === 0 ? (
          <p className="mt-2 text-sm">No <Term k="flare">flares</Term> recorded. A calm day on the Sun.</p>
        ) : (
          <p className="mt-2 text-sm">
            NASA recorded <strong>{space.flares.length}</strong> <Term k="flare">flare{space.flares.length > 1 ? "s" : ""}</Term>
            {space.strongestFlare && (
              <>
                , strongest: <strong className={big.length ? "text-radiation" : "text-power"}>{space.strongestFlare}</strong>
              </>
            )}
            .
          </p>
        )}
        {space.sep && (
          <p className="mt-2 text-sm font-bold text-radiation">☢️ A real <Term k="sep">particle storm</Term> was logged today.</p>
        )}
        {space.cmeLaunches.map((c, i) => (
          <p key={i} className="mt-2 text-sm">
            🌊 A fast <Term k="cme">CME</Term> left the Sun at <strong>{c.speed.toLocaleString()} km/s</strong>. At that
            speed it reaches Mars in about <strong>{c.travelSols} sol{c.travelSols > 1 ? "s" : ""}</strong>.
          </p>
        ))}
        {upcoming.length > 0 && (
          <div className="mt-3 rounded-lg border border-power/50 bg-power/10 p-2 text-sm">
            ⏳ Plasma cloud expected on{" "}
            {upcoming.map((u) => `sol ${u.sol}`).join(", ")}. Get your <Term k="waterwall">water walls</Term> ready!
          </div>
        )}
        <a
          href={donkiBrowseUrl(space.date)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          See this day in NASA DONKI <ExternalLink className="size-3" />
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          These flares were seen from Earth. Mars sits somewhere else in space, so in the game we pretend they faced Mars too.
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="text-lg font-bold">🌡️ Mars weather</h3>
        <p className="text-data text-xs text-primary">Curiosity rover · Gale Crater · Mars sol {weather.sol}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <div className="panel-raised p-2">
            <p className="text-data text-xl font-bold text-power">{weather.max}°C</p>
            <p className="text-xs text-muted-foreground">daytime high</p>
          </div>
          <div className="panel-raised p-2">
            <p className="text-data text-xl font-bold text-air">{weather.min}°C</p>
            <p className="text-xs text-muted-foreground">night low</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Real readings from NASA's Curiosity rover. Air pressure: {weather.pressure} Pa — less than 1% of Earth's!
          Your game <Term k="sol">sol</Term> {sol} uses this real Mars day.
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="text-lg font-bold">📡 Talking to Earth</h3>
        {link.conjunction ? (
          <p className="mt-2 text-sm font-bold text-radiation">
            ☀️ <Term k="conjunction">Solar conjunction</Term>! The Sun is between Earth and Mars. No messages today.
          </p>
        ) : (
          <p className="mt-2 text-sm">
            Earth is <strong>{(link.distanceKm / 1e6).toFixed(0)} million km</strong> away on {space.date}. Each message takes{" "}
            <strong className="text-accent">{formatMinutes(link.oneWayMinutes)}</strong> to arrive. That's the{" "}
            <Term k="delay">communication delay</Term>.
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Worked out from where Earth and Mars really were on that date (NASA JPL planet positions).
        </p>
      </section>
    </aside>
  );
}

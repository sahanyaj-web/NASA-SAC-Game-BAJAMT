import { ExternalLink } from "lucide-react";
import { formatMinutes, type EarthMarsInfo } from "@/game/orbit";
import { donkiBrowseUrl } from "@/game/space-weather";
import type { MarsWeatherSol, SolSpaceWeather } from "@/game/types";
import { flareWord } from "@/game/words";
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
  const strong = space.strongestFlare;
  const scary = strong && (strong[0] === "M" || strong[0] === "X");
  return (
    <aside className="space-y-4" aria-label="Today's report">
      <section className="panel p-4">
        <h3 className="text-lg font-bold">☀️ The real Sun today</h3>
        <p className="text-data text-xs text-primary">Earth date {space.date}</p>
        {space.flares.length === 0 ? (
          <p className="mt-2 text-sm">No <Term k="flare">Sun flashes</Term> today. The Sun was calm.</p>
        ) : (
          <p className="mt-2 text-sm">
            NASA saw <strong>{space.flares.length}</strong> <Term k="flare">Sun flash{space.flares.length > 1 ? "es" : ""}</Term>.
            {strong && (
              <>
                {" "}The biggest was <strong className={scary ? "text-radiation" : "text-power"}>{flareWord(strong)}</strong>{" "}
                <span className="text-muted-foreground">(scientists call it {strong})</span>.
              </>
            )}
          </p>
        )}
        {space.sep && (
          <p className="mt-2 text-sm font-bold text-radiation">☢️ NASA saw a real <Term k="sep">radiation storm</Term> today.</p>
        )}
        {space.cmeLaunches.map((c, i) => (
          <p key={i} className="mt-2 text-sm">
            🌊 A <Term k="cme">giant Sun cloud</Term> flew off the Sun at <strong>{c.speed.toLocaleString()} km every second</strong>!
            It will reach Mars in about <strong>{c.travelSols} day{c.travelSols > 1 ? "s" : ""}</strong>.
          </p>
        ))}
        {upcoming.length > 0 && (
          <div className="mt-3 rounded-lg border border-power/50 bg-power/10 p-2 text-sm">
            ⏳ A Sun cloud is coming on {upcoming.map((u) => `day ${u.sol}`).join(", ")}. Get your{" "}
            <Term k="waterwall">water walls</Term> ready!
          </div>
        )}
        <a
          href={donkiBrowseUrl(space.date)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Look up {space.date} in NASA's Sun-storm log <ExternalLink className="size-3" />
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          NASA saw these from near Earth. Mars is in a different spot in space, so in the game we pretend the Sun was pointing at Mars too.
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="text-lg font-bold">🌡️ Mars weather</h3>
        <p className="text-data text-xs text-primary">
          NASA's Curiosity <Term k="rover">rover</Term> · <Term k="crater">Gale Crater</Term>
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <div className="panel-raised p-2">
            <p className="text-data text-xl font-bold text-power">{weather.max}°C</p>
            <p className="text-xs text-muted-foreground">warmest today</p>
          </div>
          <div className="panel-raised p-2">
            <p className="text-data text-xl font-bold text-air">{weather.min}°C</p>
            <p className="text-xs text-muted-foreground">coldest tonight</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          These are real temperatures measured by Curiosity on Mars. The air there is about 100 times thinner than on Earth!
          Your <Term k="sol">Mars day</Term> {sol} uses this real day's weather.
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="text-lg font-bold">📡 Talking to Earth</h3>
        {link.conjunction ? (
          <p className="mt-2 text-sm font-bold text-radiation">
            ☀️ The <Term k="conjunction">Sun is in the way</Term>! It's between Earth and Mars, so no messages can get through today.
          </p>
        ) : (
          <p className="mt-2 text-sm">
            On {space.date}, Earth was <strong>{(link.distanceKm / 1e6).toFixed(0)} million km</strong> away. Each message takes{" "}
            <strong className="text-accent">{formatMinutes(link.oneWayMinutes)}</strong> to get there. That's the{" "}
            <Term k="delay">message wait</Term>.
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Worked out from where NASA says Earth and Mars really were on that date.</p>
      </section>
    </aside>
  );
}

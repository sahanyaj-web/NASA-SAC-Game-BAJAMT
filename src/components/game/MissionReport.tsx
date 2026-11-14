import { Link } from "@tanstack/react-router";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { rate } from "@/game/engine";
import { formatMinutes } from "@/game/orbit";
import { donkiBrowseUrl } from "@/game/space-weather";
import type { GameState, SolSpaceWeather, SunWindow } from "@/game/types";
import { SourceBadge } from "./SourceBadge";

const LESSON: Record<string, string> = {
  air: "Oxygen is the most urgent supply — people can't last even minutes without it. Real mission planners keep big oxygen reserves and backup machines.",
  food: "Growing food takes lots of power for the lights. Real Mars missions will bring most food from Earth and grow fresh plants as a bonus.",
  dose: "Radiation adds up, sol after sol, and storms add a lot at once. That's why NASA watches the Sun 24/7 and designs shelters for crews.",
  success: "You balanced power between air, food, shielding and science. That juggling act is exactly what real mission planners practise.",
};

export function MissionReport({
  state,
  schedule,
  sun,
  delays,
  onAgain,
}: {
  state: GameState;
  schedule: SolSpaceWeather[];
  sun: SunWindow;
  delays: [number, number];
  onAgain: () => void;
}) {
  const r = rate(state);
  const result = state.over?.result ?? "success";
  const realDays = schedule.filter((d) => d.sep || d.cmeArrival || d.flares.some((f) => f[0] === "X" || f[0] === "M"));
  const data = state.log.map((l) => ({ sol: l.sol, Air: +l.air.toFixed(1), Food: +l.food.toFixed(1), Battery: l.battery, Radiation: l.dose }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 animate-float-in">
      <section className="panel p-6 text-center sm:p-10">
        <p className="text-data text-xs uppercase tracking-widest text-primary">Mission report</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{result === "success" ? "🏁 Mission complete!" : "🚀 Mission ended early"}</h1>
        <p className="mt-3 text-lg">{state.over?.message}</p>
        <p className="mt-4 text-5xl" aria-label={`${r.stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < r.stars ? "" : "opacity-20"}>⭐</span>
          ))}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Survived {state.log.length} of {state.totalSols} sols · {state.science} science · {state.dose.toFixed(1)} mSv radiation
        </p>
        {r.badges.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {r.badges.map((b) => (
              <span key={b.name} className="panel-raised px-3 py-2 text-sm" title={b.why}>
                {b.emoji} <strong>{b.name}</strong> <span className="text-muted-foreground">· {b.why}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-bold">🧠 What you learned</h2>
        <p className="mt-2">{LESSON[result]}</p>
        <p className="mt-2">
          During your mission dates, a radio message to Earth took between{" "}
          <strong className="text-accent">{formatMinutes(delays[0])}</strong> and <strong className="text-accent">{formatMinutes(delays[1])}</strong>.
          Mars crews can't wait for help in an emergency — they have to decide for themselves.
        </p>
        <p className="mt-2">Try again with different cargo crates or a different Sun. There's more than one way to survive!</p>
      </section>

      {data.length > 1 && (
        <section className="panel p-6">
          <h2 className="text-2xl font-bold">📈 Your supplies, sol by sol</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="sol" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="Air" stroke="var(--air)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Food" stroke="var(--food)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Battery" stroke="var(--power)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Radiation" stroke="var(--radiation)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="panel p-6">
        <h2 className="text-2xl font-bold">☀️ What the real Sun did</h2>
        <SourceBadge sun={sun} className="mt-3" />
        {realDays.length === 0 ? (
          <p className="mt-3 text-sm">The Sun was quiet on these dates — no big flares or particle storms in NASA's records.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {realDays.map((d, i) => (
              <li key={d.date} className="panel-raised flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span>
                  <strong className="text-data">Sol {schedule.indexOf(d) + 1 || i + 1}</strong> · {d.date}:{" "}
                  {d.strongestFlare && <>strongest flare {d.strongestFlare}. </>}
                  {d.sep && <span className="text-radiation">Particle storm. </span>}
                  {d.cmeArrival && <span className="text-power">CME reached Mars ({d.cmeArrival.speed} km/s). </span>}
                </span>
                <a className="text-accent hover:underline" href={donkiBrowseUrl(d.date)} target="_blank" rel="noreferrer">
                  NASA DONKI ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col justify-center gap-3 pb-10 sm:flex-row">
        <Button variant="mission" size="xl" onClick={onAgain}>🔁 Play a new mission</Button>
        <Button variant="panel" size="xl" asChild>
          <Link to="/science">🔭 See the real NASA data</Link>
        </Button>
      </div>
    </div>
  );
}

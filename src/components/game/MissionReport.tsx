import { Link } from "@tanstack/react-router";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { rate, resourcePercentages } from "@/game/engine";
import { formatMinutes } from "@/game/orbit";
import { donkiBrowseUrl } from "@/game/space-weather";
import { flareWord, placeWords } from "@/game/words";
import type { GameState, SolSpaceWeather, SunWindow } from "@/game/types";
import { SourceBadge } from "./SourceBadge";

const LESSON: Record<string, string> = {
  air: "Air is the most important supply — people can't last even a few minutes without it. Real space teams pack lots of extra air and spare air machines.",
  food: "Growing food takes lots of power for the lights. Real Mars trips will bring most of their food from Earth and grow fresh plants as a treat.",
  dose: "Radiation adds up day after day, and storms add a lot all at once. That's why NASA watches the Sun all day and night, and plans safe shelters for crews.",
  power: "When power runs out, air machines, plant lights and heaters cannot work. NASA teams bring spare power and protect their solar panels.",
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
  const P = placeWords(state.place);
  const result = state.over?.result ?? "air";
  const realDays = schedule.filter((d) => d.sep || d.cmeArrival || d.flares.some((f) => f[0] === "X" || f[0] === "M"));
  const pct = resourcePercentages(state);
  const data = state.log.map((l) => {
    const p = resourcePercentages({ ...state, ...l });
    return { sol: l.sol, Air: p.air, Food: p.food, Power: p.power, Safety: p.safety };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 animate-float-in">
      <section className="panel p-6 text-center sm:p-10">
        <p className="text-data text-xs uppercase tracking-widest text-primary">Mission report</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">🚀 Your mission is over</h1>
        <p className="mt-3 text-lg">{state.over?.message}</p>
        <p className="mt-4 text-5xl" aria-label={`${r.stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < r.stars ? "" : "opacity-20"}>⭐</span>
          ))}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Survived {state.log.length} full days · Radiation safety {pct.safety}%
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
          On your trip's dates, a message to Earth took between{" "}
          <strong className="text-accent">{formatMinutes(delays[0])}</strong> and <strong className="text-accent">{formatMinutes(delays[1])}</strong>.
          {" "}{state.place === "moon" ? "That's so quick that Moon crews can get help from Earth almost right away. Mars crews can't — they have to decide for themselves." : "In an emergency, Mars crews can't wait that long for help — they have to decide for themselves."}
        </p>
        <p className="mt-2">Try again with different cargo crates or a different Sun. Can you survive longer next time?</p>
      </section>

      {state.story.length > 0 && (
        <section className="panel p-6">
          <h2 className="text-2xl font-bold">📖 Your {P.name} story</h2>
          <ol className="mt-3 space-y-2">
            {state.story.map((st, i) => (
              <li key={i} className="panel-raised flex items-start gap-3 p-3 text-sm">
                <span aria-hidden className="text-2xl">{st.emoji}</span>
                <span>
                  <strong className="text-data">Day {st.sol}</strong> · {st.title} <span className="text-muted-foreground">→ you chose:</span>{" "}
                  <strong>{st.choice}</strong>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.length > 1 && (
        <section className="panel p-6">
          <h2 className="text-2xl font-bold">📈 Your supplies, day by day</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="sol" stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} unit="%" stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="Air" stroke="var(--air)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Food" stroke="var(--food)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Power" stroke="var(--power)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Safety" stroke="var(--radiation)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="panel p-6">
        <h2 className="text-2xl font-bold">☀️ What the real Sun did</h2>
        <SourceBadge sun={state.sol > schedule.length ? { ...sun, source: "archived" } : sun} className="mt-3" />
        {state.sol > schedule.length && <p className="mt-2 text-sm text-muted-foreground">These saved record dates repeated during your mission.</p>}
        {realDays.length === 0 ? (
          <p className="mt-3 text-sm">The Sun was quiet on these dates — no big Sun flashes or radiation storms in NASA's records.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {realDays.map((d, i) => (
              <li key={d.date} className="panel-raised flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span>
                  <strong className="text-data">Day {schedule.indexOf(d) + 1 || i + 1}</strong> · {d.date}:{" "}
                  {d.strongestFlare && <>Biggest Sun flash: {flareWord(d.strongestFlare)} ({d.strongestFlare}). </>}
                  {d.sep && <span className="text-radiation">Radiation storm. </span>}
                  {d.cmeArrival && <span className="text-power">Giant Sun cloud reached {P.name}. </span>}
                </span>
                <a className="text-accent hover:underline" href={donkiBrowseUrl(d.date)} target="_blank" rel="noreferrer">
                  NASA log ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col justify-center gap-3 pb-10 sm:flex-row">
        <Button variant="mission" size="xl" onClick={onAgain}>🔁 Play a new mission</Button>
        <Button variant="panel" size="xl" asChild>
          <Link to="/science">🔭 See the real NASA facts</Link>
        </Button>
      </div>
    </div>
  );
}

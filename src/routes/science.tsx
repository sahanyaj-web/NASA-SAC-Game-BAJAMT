import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/game/SiteHeader";
import { ARCHIVED_SUN } from "@/game/data/sun-archive";
import { OSDR_FACTS, osdrUrl } from "@/game/data/osdr-facts";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "NASA facts | Junior Astronaut Mission Trainer" },
      { name: "description", content: "Where every fact in the Moon and Mars game comes from — all from NASA — and what we made simpler." },
      { property: "og:title", content: "NASA facts | Junior Astronaut Mission Trainer" },
      { property: "og:description", content: "Where every fact in the Moon and Mars game comes from — all from NASA — and what we made simpler." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

/** Every source below is a NASA website. `grownups` names the exact dataset for teachers and judges. */
const SOURCES = [
  {
    emoji: "☀️",
    name: "NASA's Sun-storm log",
    tag: "LIVE + SAVED",
    url: "https://ccmc.gsfc.nasa.gov/DONKI/",
    what: "NASA writes down every Sun flash, radiation storm and giant Sun cloud, every single day.",
    how: "Your trip replays real days from this log. When the records run out, their original dates repeat; repeats are labeled SAVED, never new live observations. If NASA saw a real radiation storm that day, you get a radiation alarm. If a fast Sun cloud flew off, you get a warning and it shows up a day or two later. \"Today's Sun\" and \"Surprise me\" ask NASA right when you start. The famous storms were saved from NASA on 14 Nov 2026.",
    grownups: "DONKI (Space Weather Database Of Notifications, Knowledge, Information), NASA Goddard CCMC — FLR, SEP and CME records. CMEs ≥ 800 km/s count; travel time uses the real Sun–Mars distance.",
  },
  {
    emoji: "🌡️",
    name: "Curiosity rover's weather station",
    tag: "SAVED",
    url: "https://science.nasa.gov/mission/msl-curiosity/",
    what: "NASA's Curiosity rover has measured how hot and cold it gets on Mars every day since 2012.",
    how: "Each trip repeats a saved set of real Mars temperatures. The colder the real night, the more battery your heater needs (2⚡, 3⚡ or 4⚡).",
    grownups: "Curiosity REMS daily min/max air temperature and pressure, Gale Crater, sols 223–4714.",
  },
  {
    emoji: "☢️",
    name: "Curiosity rover's radiation meter",
    tag: "NASA MEASUREMENT",
    url: "https://science.nasa.gov/resource/radiation-measurements-on-mars/",
    what: "Curiosity also measures the invisible radiation on Mars.",
    how: "On a normal day your crew gets about 0.64 radiation units, just like Curiosity measured. Water walls block some of it.",
    grownups: "Curiosity RAD: ~0.64 mSv/sol average surface dose equivalent.",
  },
  {
    emoji: "🌍",
    name: "NASA's planet maps",
    tag: "WORKED OUT",
    url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html",
    what: "NASA knows exactly where Earth and Mars are on any day.",
    how: "We work out how far apart Earth and Mars were on each day of your trip. That tells us how long a message takes (3 to 22 minutes), and when the Sun is in the way. Stories about asking Earth for help use this wait.",
    grownups: "NASA JPL Approximate Positions of the Planets (Keplerian elements, 1800–2050).",
  },
  {
    emoji: "🧬",
    name: "NASA's astronaut science library",
    tag: "NASA STUDIES",
    url: "https://osdr.nasa.gov/bio/repo/",
    what: "NASA keeps the results of experiments about how space changes plants, animals and people.",
    how: "The science cards at the end of each day link to real NASA studies.",
    grownups: "NASA Open Science Data Repository (OSDR / GeneLab).",
  },
  {
    emoji: "🫁",
    name: "NASA's numbers for keeping astronauts alive",
    tag: "NASA NUMBERS",
    url: "https://ntrs.nasa.gov/search?q=%22Baseline%20Values%20and%20Assumptions%20Document%22",
    what: "NASA has worked out how much air and food astronauts need. NASA robots also taught us about Mars dust and power.",
    how: "Your crew always uses 1 day of air and 1 day of food each day. Dust lowers your solar power, like it did to NASA's InSight and Opportunity. The nuclear power plant keeps working in dust storms, like NASA's Kilopower test.",
    grownups: "NASA Life Support Baseline Values and Assumptions Document (~0.84 kg O₂ per person per day); InSight, Opportunity, MOXIE and Kilopower mission results.",
  },
];

const SIMPLER = [
  "All four systems start at 100% and stay between 0% and 100%. These percentages are a game scale, not NASA measurements. Bigger cargo tanks still start full but hold more.",
  "The base runs its air maker, plant lights and water walls by itself. Your story choices change supplies and how well the machines work. If air, food, stored power or radiation safety reaches 0%, the mission ends. The goal is to survive as many full days as possible, with no time limit.",
  "NASA saw the Sun flashes and radiation storms from near Earth. Mars is usually in a different spot, so in the game we pretend the Sun was pointing at Mars too.",
  "Storm radiation in the game is a \"be ready for the worst\" amount. Mars's air blocks some radiation, and real storms can be bigger or smaller.",
  "The danger line of 25 radiation units is just for this game. NASA's real lifetime limit for an astronaut is 600.",
  "Dust piles up on the panels much faster than in real life, so you notice it during play.",
  "Dust storms and surprises are picked by chance. The Sun, the Mars weather and the message wait are real.",
];

const QUESTIONS = [
  "Why can't astronauts on Mars just call Earth when something goes wrong?",
  "When did hiding in the storm shelter help? What did you give up?",
  "Did the nuclear power plant or the extra solar panels help more? What happens in a dust storm?",
  "Play the same famous storm twice with different boxes. What changed?",
];

function SciencePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <header>
          <p className="text-data text-xs uppercase tracking-widest text-primary">For players, families, teachers & judges</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Where our facts come from</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            The facts in Junior Astronaut Mission Trainer come from NASA. Here's each one, what it changes in the game, and what we made
            simpler so it's fun to play.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Our NASA sources</h2>
          {SOURCES.map((d) => (
            <article key={d.name} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold">
                  <span aria-hidden className="mr-2">{d.emoji}</span>
                  {d.name}
                </h3>
                <span className="text-data rounded-full border px-2 py-0.5 text-xs text-power">{d.tag}</span>
              </div>
              <p className="mt-2"><strong>What it is:</strong> {d.what}</p>
              <p className="mt-1"><strong>In the game:</strong> {d.how}</p>
              <p className="mt-2 text-xs text-muted-foreground"><strong>For grown-ups:</strong> {d.grownups}</p>
              <a href={d.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                Visit the NASA page <ExternalLink className="size-3" />
              </a>
            </article>
          ))}
        </section>

        <section>
          <h2 className="text-3xl font-bold">Famous Sun storms you can play</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ARCHIVED_SUN.map((w) => (
              <Link key={w.id} to="/play" search={{ storm: w.id }} className="panel-raised p-4 transition-colors hover:border-primary">
                <p className="font-display text-lg font-semibold">{w.name}</p>
                <p className="text-data text-xs text-primary">
                  {w.start} → {w.end} · {w.flares.length} Sun flashes · {w.seps.length} radiation storms · {w.cmes.length} Sun clouds
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{w.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold">Astronaut science cards</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {OSDR_FACTS.map((f) => (
              <li key={f.id} className="panel p-4">
                <p className="text-sm">{f.kid}</p>
                <a href={osdrUrl(f.id)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-data text-xs font-bold text-accent hover:underline">
                  NASA study {f.id} ↗
                </a>
                <p className="mt-1 text-xs text-muted-foreground"><strong>Study name (for grown-ups):</strong> {f.title}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="text-3xl font-bold">What we made simpler</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {SIMPLER.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="text-3xl font-bold">Questions to talk about</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {QUESTIONS.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </section>

        <div className="flex justify-center pb-6">
          <Button variant="mission" size="xl" asChild>
            <Link to="/play">🚀 Start a mission</Link>
          </Button>
        </div>
        <p className="pb-10 text-center text-xs text-muted-foreground">Junior Astronaut Mission Trainer is a learning game. It is not made by NASA.</p>
      </main>
    </div>
  );
}

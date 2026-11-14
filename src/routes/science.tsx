import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/game/SiteHeader";
import { ARCHIVED_SUN } from "@/game/data/sun-archive";
import { OSDR_FACTS, osdrUrl } from "@/game/data/osdr-facts";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "The real NASA data behind Outpost Ares" },
      { name: "description", content: "Which NASA datasets power the Mars outpost game, how each one changes gameplay, and what we simplified." },
      { property: "og:title", content: "The real NASA data behind Outpost Ares" },
      { property: "og:description", content: "Which NASA datasets power the Mars outpost game, how each one changes gameplay, and what we simplified." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

const DATASETS = [
  {
    name: "DONKI — Space Weather Database (NASA CCMC)",
    tag: "LIVE + ARCHIVED",
    url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
    what: "Solar flares (FLR), solar energetic particle events (SEP) and coronal mass ejections (CME) with measured speeds.",
    how: "Each game sol is one real day. A real SEP event becomes a radiation emergency; the strongest flare that day sets how big it is. Fast CMEs (≥800 km/s) give a warning and arrive at Mars after a travel time worked out from their real speed and Mars's real distance from the Sun. 'Today's Sun' and 'Surprise me' call the API live from your browser; famous storms use records saved on 14 Nov 2026.",
  },
  {
    name: "Curiosity rover REMS weather (Gale Crater)",
    tag: "ARCHIVED",
    url: "https://mars.nasa.gov/msl/mission/instruments/environsensors/rems/",
    what: "Daily high/low air temperature and pressure measured on Mars, sols 223–4714.",
    how: "Each mission uses a real 15-sol stretch. The night's real low temperature sets how much battery the heater needs (2⚡ above −75°C, 3⚡ to −85°C, 4⚡ below).",
  },
  {
    name: "Curiosity RAD radiation measurements",
    tag: "PUBLISHED VALUE",
    url: "https://www.science.org/doi/10.1126/science.1244797",
    what: "Average surface dose on Mars of about 0.64 mSv per sol (Hassler et al., Science, 2014).",
    how: "This is the everyday radiation your crew gets before shielding. Water walls reduce it.",
  },
  {
    name: "JPL Approximate Positions of the Planets",
    tag: "CALCULATED",
    url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html",
    what: "Orbital elements for Earth and Mars.",
    how: "We calculate the real Earth–Mars distance on every mission date, giving the true radio delay (3–22 minutes) and detecting solar conjunction, when messages can't get through. Close to Earth, asking Mission Control during a storm works; far away, the particles win.",
  },
  {
    name: "NASA Open Science Data Repository (OSDR)",
    tag: "STUDY LINKS",
    url: "https://osdr.nasa.gov/bio/repo/",
    what: "Real spaceflight biology studies: plants grown on the ISS, muscle and bone loss, radiation effects.",
    how: "End-of-sol research cards and some event cards link to the actual study pages.",
  },
  {
    name: "NASA life-support baselines (BVAD) and mission history",
    tag: "PUBLISHED VALUES",
    url: "https://ntrs.nasa.gov/search?q=%22Baseline%20Values%20and%20Assumptions%20Document%22",
    what: "~0.84 kg oxygen per astronaut per day; MOXIE oxygen experiment; InSight and Opportunity dust power loss; Kilopower reactor test.",
    how: "Shape the rules: the crew always uses 1 day of air and food per sol, dust lowers solar power every sol, a reactor ignores dust storms.",
  },
];

const SIMPLIFIED = [
  "Power is counted in simple ⚡ units, and oxygen and food in 'crew-days', so kids can do the math in their heads.",
  "Flares and particle storms in DONKI were seen from near Earth. Mars is usually somewhere else, so we pretend each event faced Mars too.",
  "Storm doses are 'worst-case planning' numbers (2–12 mSv) based on flare class. Mars's air blocks some radiation, and real doses vary a lot.",
  "The 25 mSv mission limit is a game budget. NASA's real career limit is 600 mSv.",
  "Dust settles on panels much faster than in real life, so you notice it within 15 sols.",
  "Dust storms and surprise events are random. The Sun, the Mars weather and the radio delay are real.",
];

const QUESTIONS = [
  "Why can't astronauts on Mars just call Earth when something goes wrong?",
  "Your water walls cost power every sol. When was it worth paying for them?",
  "Did the reactor or the extra solar panels help more? Why might that change during a dust storm?",
  "Play the same famous storm twice with different cargo. What changed?",
];

function SciencePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <header>
          <p className="text-data text-xs uppercase tracking-widest text-primary">For players, parents, teachers & judges</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">The real science behind the game</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Outpost Ares turns real Mars mission problems into a game. Here's every NASA source we use, what it changes in
            the game, and what we simplified.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold">NASA data we use</h2>
          {DATASETS.map((d) => (
            <article key={d.name} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold">{d.name}</h3>
                <span className="text-data rounded-full border px-2 py-0.5 text-xs text-power">{d.tag}</span>
              </div>
              <p className="mt-2"><strong>What it is:</strong> {d.what}</p>
              <p className="mt-1"><strong>How the game uses it:</strong> {d.how}</p>
              <a href={d.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                Source <ExternalLink className="size-3" />
              </a>
            </article>
          ))}
        </section>

        <section>
          <h2 className="text-3xl font-bold">Famous storms you can play</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ARCHIVED_SUN.map((w) => (
              <Link key={w.id} to="/play" search={{ storm: w.id }} className="panel-raised p-4 transition-colors hover:border-primary">
                <p className="font-display text-lg font-semibold">{w.name}</p>
                <p className="text-data text-xs text-primary">{w.start} → {w.end} · {w.flares.length} flares · {w.seps.length} particle events · {w.cmes.length} CMEs</p>
                <p className="mt-1 text-sm text-muted-foreground">{w.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold">Astronaut research cards</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {OSDR_FACTS.map((f) => (
              <li key={f.id} className="panel p-4">
                <a href={osdrUrl(f.id)} target="_blank" rel="noreferrer" className="text-data text-sm font-bold text-accent hover:underline">{f.id} ↗</a>
                <p className="mt-1 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.kid}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="text-3xl font-bold">What we simplified (honestly)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {SIMPLIFIED.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section className="panel p-6">
          <h2 className="text-3xl font-bold">Classroom questions</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {QUESTIONS.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </section>

        <div className="flex justify-center pb-6">
          <Button variant="mission" size="xl" asChild>
            <Link to="/play">🚀 Start a mission</Link>
          </Button>
        </div>
        <p className="pb-10 text-center text-xs text-muted-foreground">Outpost Ares is an educational prototype and not an official NASA product.</p>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/mars-outpost-hero.jpg";
import { Button } from "@/components/ui/button";
import { LiveStrip } from "@/components/game/LiveStrip";
import { SiteHeader } from "@/components/game/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Junior Astronaut Mission Trainer — Moon and Mars adventures" },
      {
        name: "description",
         content: "A story game for kids 7–12: make choices to keep a Moon or Mars crew safe, using real NASA records.",
      },
      { property: "og:title", content: "Junior Astronaut Mission Trainer — Moon and Mars adventures" },
      {
        property: "og:description",
         content: "Make story choices to keep air, food, power and radiation safety above zero on the Moon or Mars.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { emoji: "☀️", title: "Pick a real Sun", text: "Every Sun flash and radiation storm in your trip really happened. NASA wrote them all down." },
  { emoji: "📖", title: "Choose what happens next", text: "A problem appears. You have two choices. What will your crew do?" },
  { emoji: "📡", title: "Earth is far away", text: "Messages take many minutes to reach Earth. In an emergency, YOU have to decide." },
];

const TRADES = [
  { a: "Repairing an air leak", b: "air used during the repair" },
  { a: "Folding panels away from dust", b: "no sunlight power that day" },
  { a: "Going outside to clean the panels", b: "spacesuit air + radiation outside" },
  { a: "Hiding from a Sun storm", b: "less food grown that day" },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <img src={hero} alt="Illustrated Mars outpost with habitat domes, a glowing greenhouse, solar panels and astronauts at sunset" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-32">
            <p className="text-data text-sm uppercase tracking-[0.3em] text-primary">A Moon or Mars mission game · ages 7–12</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Junior Astronaut Mission Trainer</h1>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl">
              How long can your Moon or Mars crew survive? Start every system at 100%. Each problem has two choices. Keep air, food, power and radiation safety above zero! The Sun's storms come
              from <strong>real NASA records</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="mission" size="xl" asChild>
                <Link to="/play">🚀 Start a mission</Link>
              </Button>
              <Button variant="panel" size="xl" asChild>
                <Link to="/science">🔭 The real science</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-3xl font-bold">Right now in space</h2>
          <div className="mt-4">
            <LiveStrip />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="text-3xl font-bold">How to play</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="panel p-6">
                <p className="text-data text-xs text-primary">STEP {i + 1}</p>
                <p className="mt-2 text-4xl" aria-hidden>{s.emoji}</p>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="panel grid gap-6 p-6 sm:p-10 md:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-bold">No choice is free</h2>
              <p className="mt-3 text-muted-foreground">
                 Real NASA teams have to make the same kinds of choices. Protecting one supply can mean giving up something else.
              </p>
            </div>
            <ul className="space-y-3">
              {TRADES.map((t) => (
                <li key={t.a} className="panel-raised flex flex-wrap items-center gap-2 p-4">
                  <span className="font-semibold text-food">{t.a}</span>
                  <span className="text-data text-muted-foreground">⇄</span>
                  <span className="font-semibold text-radiation">{t.b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-4 pb-12 text-sm text-muted-foreground">
          Facts from NASA: the Sun-storm log, the Curiosity rover's weather and radiation readings, NASA's planet maps
          and NASA astronaut studies. This game is not made by NASA. <Link to="/science" className="text-accent hover:underline">See all the NASA facts →</Link>
        </footer>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/mars-outpost-hero.jpg";
import { Button } from "@/components/ui/button";
import { LiveStrip } from "@/components/game/LiveStrip";
import { SiteHeader } from "@/components/game/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Outpost Ares — Run a Mars base with the real Sun" },
      {
        name: "description",
        content: "A free browser game for kids 7–12: share power between air, food, radiation shields and science on Mars, using real NASA space weather.",
      },
      { property: "og:title", content: "Outpost Ares — Run a Mars base with the real Sun" },
      {
        property: "og:description",
        content: "Share power between air, food, radiation shields and science on Mars, using real NASA space weather.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { emoji: "☀️", title: "Pick a real Sun", text: "Every flare and particle storm in your mission really happened. It comes from NASA's space weather records." },
  { emoji: "⚡", title: "Share your power", text: "You never have enough power for everything: oxygen, greenhouse, water walls and science all need it." },
  { emoji: "📡", title: "Earth is far away", text: "Messages take minutes to reach Earth. In an emergency, you're the one who decides." },
];

const TRADES = [
  { a: "More science today", b: "less oxygen or food tomorrow" },
  { a: "Thicker radiation shields", b: "a colder, darker night" },
  { a: "A spacewalk to clean the panels", b: "suit oxygen + radiation outside" },
  { a: "Hiding from a solar storm", b: "a lost day of research" },
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
            <p className="text-data text-sm uppercase tracking-[0.3em] text-primary">A Mars mission game · ages 7–12</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-7xl">Keep your crew alive on Mars.</h1>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl">
              You command Outpost Ares for 15 sols (Mars days). Every choice costs something, and the Sun's storms come
              from <strong>real NASA data</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="mission" size="xl" asChild>
                <Link to="/play">🚀 Start a mission</Link>
              </Button>
              <Button variant="panel" size="xl" asChild>
                <Link to="/science">🔭 The real science</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Free · plays in your browser · no account needed · about 10 minutes</p>
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
                Real mission planners juggle the same trade-offs. Every bit of power you give one system, another system
                doesn't get.
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
          Data: NASA DONKI space weather (CCMC), Curiosity rover REMS weather, Curiosity RAD radiation, NASA OSDR, JPL planet
          positions. Not an official NASA product. <Link to="/science" className="text-accent hover:underline">Full sources →</Link>
        </footer>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/moon-mars-outposts.jpg";
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
  { emoji: "🚀", title: "Choose your space home", text: "Press Start a mission. Pick a Moon base or a Mars base. The Moon is closer to Earth. Mars is farther away and has dust storms." },
  { emoji: "☀️", title: "Choose your Sun days", text: "Pick Today's Sun for recent NASA records, Surprise me for a random set, or a saved famous storm. These are real records of what the Sun did, not made-up storms." },
  { emoji: "📦", title: "Pack two boxes", text: "Choose two supply boxes for your crew. Read what each box helps with. You cannot take every box! When you have picked two, press Blast off." },
  { emoji: "📖", title: "Read the day's problem", text: "Your crew will tell you what happened. Maybe dust is covering the power panels, or air is leaking. Look at your four supply bars before deciding." },
  { emoji: "🤔", title: "Pick one of two choices", text: "Read You give up and You get for BOTH choices. Each choice helps in one way but costs something else. You can always pick either one. Choose what your crew needs most." },
  { emoji: "📅", title: "See what happens and keep going", text: "Read what happened after your choice. Press Continue to see how your supplies changed that day, then move to the next day. Try to keep your crew safe for as many days as you can!" },
];

const SUPPLIES = [
  { emoji: "🫁", title: "Air", text: "The air your crew needs to breathe.", tone: "text-air" },
  { emoji: "🥬", title: "Food", text: "The meals your crew needs to eat.", tone: "text-food" },
  { emoji: "🔋", title: "Power", text: "The stored energy that keeps your base's machines working.", tone: "text-power" },
  { emoji: "🛡️", title: "Radiation safety", text: "How much protection your crew has left from harmful space rays. Water walls help protect them.", tone: "text-radiation" },
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
          <img src={hero} alt="Matching Moon and Mars outposts: silver lunar ground and Earth on the left, red Martian ground and sunset on the right" width={1536} height={864} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-scene-shade via-scene-shade/60 to-scene-shade/10" />
          <div className="relative mx-auto flex min-h-[min(78vh,800px)] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 text-scene-foreground">
            <p className="text-data text-sm uppercase tracking-widest text-sunshine">A Moon or Mars mission game · ages 7–12</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Junior Astronaut Mission Trainer</h1>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl">
              You are in charge of a crew on the Moon or Mars! Help them solve a new problem each day.
              Every choice helps something and costs something else. Keep your crew safe for as many days as you can.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="mission" size="xl" asChild>
                <Link to="/play">🚀 Start a mission</Link>
              </Button>
              <Button variant="panel" size="xl" asChild>
                <Link to="/science">🔭 NASA Resources</Link>
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
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">Your goal: survive as long as you can. There is no last day to reach—each new day is another chance to make a good choice.</p>
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
          <div className="mt-10 border-t pt-8">
            <h3 className="text-2xl font-bold">Watch your four supply bars</h3>
            <p className="mt-3 max-w-3xl text-muted-foreground">All four start at 100%. That means they are full. Your choices and the base's daily needs can make them go down or fill back up, but never above 100%.</p>
            <dl className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SUPPLIES.map((s) => (
                <div key={s.title}>
                  <dt className={`font-bold ${s.tone}`}><span aria-hidden>{s.emoji}</span> {s.title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-l-4 border-radiation pl-4 font-semibold">If ANY bar reaches 0%, your mission ends. Try again and see if different choices help you last longer!</p>
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">Want to read the NASA facts? You can visit NASA Data and return to Play without losing your mission on this browser. Restart mission lets you start over—it asks you first.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 py-6 sm:py-10 md:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="text-3xl font-bold">Every choice gives and takes</h2>
              <p className="mt-3 text-muted-foreground">
                 There is not always a perfect answer. For example, putting power panels away protects them from dust, but they cannot collect sunlight while packed away. Look at what your crew has left before you choose.
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

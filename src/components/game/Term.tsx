import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const GLOSSARY = {
  sol: { word: "Sol", text: "A day on Mars. It lasts 24 hours and 39 minutes — a little longer than an Earth day." },
  msv: {
    word: "mSv (millisievert)",
    text: "Measures how much radiation your body soaks up. A chest X-ray is about 0.1 mSv. On Earth, nature gives you about 3 mSv a year.",
  },
  flare: {
    word: "Solar flare",
    text: "A sudden flash of light and X-rays from the Sun. Classes go C (small), M (medium), X (huge). Mars's thin air blocks most X-rays — but flares can be followed by dangerous particles.",
  },
  sep: {
    word: "Particle storm (SEP)",
    text: "Solar Energetic Particles: bits of atoms the Sun shoots out so fast they can zip through walls — and astronauts. They can arrive within an hour of a flare.",
  },
  cme: {
    word: "CME",
    text: "Coronal Mass Ejection: a giant cloud of the Sun's hot gas flung into space. It takes a day or more to reach Mars, so you get a warning.",
  },
  delay: {
    word: "Communication delay",
    text: "Radio travels at the speed of light, but Mars is so far that a message takes 3 to 22 minutes to arrive, depending on where the planets are.",
  },
  moxie: {
    word: "Oxygen maker",
    text: "A machine that pulls oxygen out of Mars's air (which is mostly carbon dioxide). NASA tested a small one called MOXIE on the Perseverance rover.",
  },
  waterwall: {
    word: "Water walls",
    text: "Tanks of water in the habitat walls. Water is great at stopping radiation — but at −80°C it freezes and cracks the tanks, so keeping walls full takes power.",
  },
  conjunction: {
    word: "Solar conjunction",
    text: "When the Sun is between Earth and Mars. Its glow drowns out radio, so NASA stops sending commands for about two weeks.",
  },
  dust: {
    word: "Dust",
    text: "Mars dust is finer than flour. It settles on solar panels and blocks sunlight, so panels make less power every sol unless cleaned.",
  },
} as const;

export type TermKey = keyof typeof GLOSSARY;

export function Term({ k, children }: { k: TermKey; children?: ReactNode }) {
  const g = GLOSSARY[k];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-help underline decoration-dotted decoration-2 underline-offset-4 decoration-accent/80 hover:text-accent"
        >
          {children ?? g.word}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm leading-relaxed">
        <p className="font-display text-base font-semibold text-accent">{g.word}</p>
        <p className="mt-1">{g.text}</p>
      </PopoverContent>
    </Popover>
  );
}

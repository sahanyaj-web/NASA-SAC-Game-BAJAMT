import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Tap-to-learn word helper. Every explanation is written for a 7-year-old. */
export const GLOSSARY = {
  sol: {
    word: "Mars day",
    text: "One day on Mars is a little longer than on Earth: 24 hours and 39 minutes. Scientists call a Mars day a \"sol\".",
  },
  msv: {
    word: "Radiation units",
    text: "Radiation is invisible energy that can hurt your body if you get too much. We count it in units (scientists call them millisieverts). One X-ray picture of your chest at the doctor is about 0.1 units. On Earth, nature gives you about 3 units a year.",
  },
  flare: {
    word: "Sun flash",
    text: "A sudden, super-bright flash on the Sun. Scientists call it a solar flare. Small ones are called C, big ones M, and huge ones X. The flash itself can't get through Mars's air very well, but tiny zooming bits can follow it.",
  },
  sep: {
    word: "Radiation storm",
    text: "Sometimes the Sun shoots out tiny, invisible bits that zoom through space super fast. They can go right through walls and into people. They can reach Mars less than an hour after a big Sun flash.",
  },
  cme: {
    word: "Giant Sun cloud",
    text: "A huge cloud of hot gas that the Sun throws into space. It is slower than a radiation storm and takes a day or more to reach Mars, so you get a warning.",
  },
  delay: {
    word: "Message wait",
    text: "Radio messages are the fastest thing there is, but Mars is SO far away that a message still takes 3 to 22 minutes to get there. Then you wait just as long for the answer!",
  },
  moxie: {
    word: "Oxygen maker",
    text: "A machine that pulls oxygen (the part of air we breathe) out of Mars's air. NASA tested a small one called MOXIE on the Perseverance rover.",
  },
  waterwall: {
    word: "Water walls",
    text: "Tanks of water inside the walls of your base. Water is great at blocking radiation. But Mars nights are colder than a freezer, so the water needs power to keep from freezing.",
  },
  conjunction: {
    word: "Sun in the way",
    text: "Sometimes the Sun sits right between Earth and Mars. Its glow drowns out radio messages, so nobody can talk for about two weeks.",
  },
  dust: {
    word: "Dust",
    text: "Mars dust is finer than flour. It settles on solar panels like a blanket and blocks sunlight, so the panels make less power every day unless someone brushes them.",
  },
  crater: {
    word: "Gale Crater",
    text: "A giant bowl-shaped hole on Mars, made long ago when a space rock crashed there. Long, long ago it was filled with a lake. NASA's Curiosity rover is exploring it.",
  },
  rover: {
    word: "Rover",
    text: "A robot car that drives around on Mars taking pictures and testing rocks. NASA's Curiosity rover has been on Mars since 2012.",
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

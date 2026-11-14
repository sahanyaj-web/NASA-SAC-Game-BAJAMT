// The surprise deck. Every option costs something — there is no free choice.
// All text is written for kids aged 7+: short words, no jargon.
import { EVA_AIR, EVA_DOSE } from "./constants";
import { osdrUrl } from "./data/osdr-facts";
import type { GameEvent, GameState } from "./types";

export interface DeckCard {
  id: string;
  weight: number;
  when?: (s: GameState) => boolean;
  build: (s: GameState, oneWayMin: number) => GameEvent;
}

const walkCost = `${EVA_AIR} day of air for the spacesuits, and ${EVA_DOSE} radiation units from being outside`;

export const DECK: DeckCard[] = [
  {
    id: "rock",
    weight: 3,
    build: () => ({
      id: "rock",
      kind: "deck",
      title: "A strange striped rock!",
      emoji: "🪨",
      text: "The crew spots a rock with stripes far away. Stripes can mean water flowed here a very long time ago.",
      fact: {
        text: "NASA's Curiosity rover found out that its part of Mars was once a big lake, billions of years ago.",
        source: "NASA — Curiosity rover",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
      options: [
        { id: "eva", label: "Put on spacesuits and go look", cost: walkCost, gain: "+4 science", effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 4 } },
        { id: "drone", label: "Send the little robot car", cost: "3⚡ from the battery", gain: "+2 science", effect: { battery: -3, science: 2 } },
        { id: "skip", label: "Leave it", cost: "You miss a discovery", gain: "Keep all your supplies", effect: {} },
      ],
    }),
  },
  {
    id: "clog",
    weight: 2,
    build: (_s, m) => ({
      id: "clog",
      kind: "deck",
      title: "The oxygen maker is clogged",
      emoji: "🫁",
      text: "Mars dust got stuck in the oxygen maker. Now it only makes half as much air to breathe.",
      fact: {
        text: "NASA's MOXIE machine made oxygen out of Mars air 16 times. It made 122 grams — about as much as a small dog breathes in 10 hours.",
        source: "NASA — Perseverance rover",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        { id: "fix", label: "Fix it ourselves right now", cost: "2⚡ from the battery, and 2 science (the crew is busy)", gain: "Works again right away", effect: { battery: -2, science: -2 } },
        { id: "slow", label: "Let it run slowly", cost: "Half as much air from the maker for 3 days", gain: "No work needed", effect: { status: [{ id: "airClog", sols: 3 }] } },
        {
          id: "earth",
          label: "Ask Earth how to fix it",
          cost: `Messages take ${Math.round(m)} minutes each way, so you get half the air until tomorrow`,
          gain: "Experts on Earth send the steps",
          effect: { status: [{ id: "airClog", sols: 1 }] },
          askEarth: true,
        },
      ],
    }),
  },
  {
    id: "mold",
    weight: 2,
    build: () => ({
      id: "mold",
      kind: "deck",
      title: "Fuzzy spots on the plants",
      emoji: "🥬",
      text: "Some lettuce leaves have fuzzy spots. It might be mold — or nothing at all.",
      fact: {
        text: "NASA checked lettuce grown on the Space Station for germs. It was safe to eat, because astronauts kept it clean.",
        source: "NASA study OSD-268",
        url: osdrUrl("OSD-268"),
      },
      options: [
        { id: "clean", label: "Clean everything", cost: "Throw out some plants: 1 day of food", gain: "The plants stay safe", effect: { food: -1 } },
        { id: "ignore", label: "Ignore it", cost: "The mold might spread and ruin 2 days of food", gain: "Keep all the plants (for now)", effect: { status: [{ id: "moldRisk", sols: 4 }] } },
      ],
    }),
  },
  {
    id: "ice",
    weight: 2,
    build: () => ({
      id: "ice",
      kind: "deck",
      title: "Ice under the ground!",
      emoji: "🧊",
      text: "Your scanner finds ice hiding just under the dirt. Water can block radiation — or be turned into air to breathe.",
      fact: {
        text: "NASA's Phoenix lander dug up real ice on Mars in 2008.",
        source: "NASA — Phoenix lander",
        url: "https://science.nasa.gov/mission/phoenix/",
      },
      options: [
        { id: "walls", label: "Dig it up for the water walls", cost: `${walkCost}, plus 2⚡`, gain: "Better radiation blocking for the rest of the trip", effect: { air: -EVA_AIR, dose: EVA_DOSE, battery: -2, shieldBonus: 1 } },
        { id: "o2", label: "Turn it into air", cost: "3⚡ from the battery", gain: "+2 days of air", effect: { battery: -3, air: 2 } },
        { id: "skip", label: "Leave it", cost: "You miss free water", gain: "Save power", effect: {} },
      ],
    }),
  },
  {
    id: "weak",
    weight: 2,
    build: () => ({
      id: "weak",
      kind: "deck",
      title: "An astronaut feels weak",
      emoji: "💪",
      text: "Mars pulls you down less than Earth does — you'd weigh about a third as much! Without exercise, muscles and bones get weaker.",
      fact: {
        text: "NASA studied mice on the Space Station to find ways to keep muscles and bones strong in space.",
        source: "NASA study OSD-342",
        url: osdrUrl("OSD-342"),
      },
      options: [
        { id: "gym", label: "Extra exercise time", cost: "2 science today", gain: "The crew stays strong", effect: { science: -2 } },
        { id: "skip", label: "Keep working", cost: "Tired crew: 1 less science every day for 3 days", gain: "No time lost today", effect: { status: [{ id: "fatigue", sols: 3 }] } },
      ],
    }),
  },
  {
    id: "panels",
    weight: 3,
    when: (s) => s.panel < 0.85,
    build: (s) => ({
      id: "panels",
      kind: "deck",
      title: "Dusty solar panels",
      emoji: "🔆",
      text: `Dust is covering the solar panels. They only make ${Math.round(s.panel * 100)}% of their power now.`,
      fact: {
        text: "Dust slowly covered the panels of NASA's InSight lander until it ran out of power in 2022.",
        source: "NASA — InSight lander",
        url: "https://science.nasa.gov/mission/insight/",
      },
      options: [
        { id: "clean", label: "Go outside and brush them", cost: walkCost, gain: "Panels as good as new", effect: { air: -EVA_AIR, dose: EVA_DOSE, setPanel: 1 } },
        { id: "wait", label: "Hope the wind cleans them", cost: "Less power every day", gain: "Stay safe inside", effect: {} },
      ],
    }),
  },
  {
    id: "dustdevil",
    weight: 1,
    when: (s) => s.panel < 0.9,
    build: () => ({
      id: "dustdevil",
      kind: "info",
      title: "A dust devil swept by!",
      emoji: "🌪️",
      text: "A spinning whirlwind blew right over the panels and cleaned them. Lucky!",
      fact: {
        text: "This really happened! Whirlwinds cleaned the panels of NASA's Spirit and Opportunity rovers many times.",
        source: "NASA — Spirit and Opportunity rovers",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [{ id: "ok", label: "Woohoo!", cost: "Nothing", gain: "Panels as good as new", effect: { setPanel: 1 } }],
    }),
  },
  {
    id: "duststorm",
    weight: 2,
    when: (s) => !s.statuses.dustStorm,
    build: () => ({
      id: "duststorm",
      kind: "info",
      title: "Dust storm coming!",
      emoji: "🌫️",
      text: "A big dust storm is on its way. For 3 days the sky will be dark, and your solar panels will make much less power. Plan ahead!",
      fact: {
        text: "In 2018 a dust storm covered ALL of Mars. NASA's Opportunity rover couldn't get enough sunlight and never woke up again.",
        source: "NASA — Opportunity rover",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [{ id: "ok", label: "Get ready", cost: "Less sunlight for 3 days", gain: "At least you got a warning", effect: { status: [{ id: "dustStorm", sols: 3 }] } }],
    }),
  },
  {
    id: "samples",
    weight: 2,
    build: () => ({
      id: "samples",
      kind: "deck",
      title: "Earth wants rock samples",
      emoji: "🧪",
      text: "Scientists back home want little tubes of Mars rock to study.",
      fact: {
        text: "NASA's Perseverance rover is filling real tubes with Mars rock right now, waiting for a future trip to bring them to Earth.",
        source: "NASA — Perseverance rover",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        { id: "drill", label: "Drill and fill the tubes", cost: "4⚡ from the battery", gain: "+3 science", effect: { battery: -4, science: 3 } },
        { id: "skip", label: "Not today", cost: "The scientists are sad", gain: "Save power", effect: {} },
      ],
    }),
  },
  {
    id: "birthday",
    weight: 1,
    build: (_s, m) => ({
      id: "birthday",
      kind: "deck",
      title: "It's Commander Ada's birthday!",
      emoji: "🎂",
      text: "The crew wants a party. Happy crews work better!",
      fact: {
        text: `You can't video-chat with Mars. Right now each message takes about ${Math.round(m)} minutes to get there, so astronauts send recorded videos instead.`,
        source: "Worked out from where NASA says the planets are",
      },
      options: [
        { id: "party", label: "Party with special food", cost: "Half a day of food", gain: "Happy crew: +1 science for 2 days", effect: { food: -0.5, status: [{ id: "happyCrew", sols: 2 }] } },
        { id: "video", label: "Record a video for family on Earth", cost: "1⚡ from the battery", gain: "Happy crew: +1 science for 1 day", effect: { battery: -1, status: [{ id: "happyCrew", sols: 1 }] } },
        { id: "skip", label: "Back to work", cost: "A sad birthday", gain: "Save supplies", effect: {} },
      ],
    }),
  },
  {
    id: "leak",
    weight: 2,
    build: () => ({
      id: "leak",
      kind: "deck",
      title: "Hissss… a tiny air leak!",
      emoji: "🔧",
      text: "A door seal is letting a little bit of air escape into space.",
      fact: {
        text: "The Space Station has had tiny leaks too. Astronauts once found one by watching floating tea leaves drift toward it!",
        source: "NASA — Space Station",
        url: "https://www.nasa.gov/international-space-station/",
      },
      options: [
        { id: "patch", label: "Patch it now", cost: "2 science (the crew is busy)", gain: "Leak fixed", effect: { science: -2 } },
        { id: "ignore", label: "Ignore it", cost: "1.5 days of air", gain: "Keep working", effect: { air: -1.5 } },
      ],
    }),
  },
];

// The surprise deck. Every option costs something — there is no free choice.
import { EVA_AIR, EVA_DOSE } from "./constants";
import { osdrUrl } from "./data/osdr-facts";
import type { GameEvent, GameState } from "./types";

export interface DeckCard {
  id: string;
  weight: number;
  when?: (s: GameState) => boolean;
  build: (s: GameState, oneWayMin: number) => GameEvent;
}

const evaCost = `−${EVA_AIR} day of air (spacesuits), +${EVA_DOSE} mSv radiation outside`;

export const DECK: DeckCard[] = [
  {
    id: "rock",
    weight: 3,
    build: () => ({
      id: "rock",
      kind: "deck",
      title: "A strange striped rock!",
      emoji: "🪨",
      text: "The crew spots a rock with stripes 2 km away. Stripes can mean water once flowed here long ago.",
      fact: {
        text: "Curiosity discovered that Gale Crater was once a lake, billions of years ago.",
        source: "NASA JPL — Curiosity mission",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
      options: [
        { id: "eva", label: "Walk out and study it", cost: evaCost, gain: "+4 science", effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 4 } },
        { id: "drone", label: "Send the little rover", cost: "−3⚡ from the battery", gain: "+2 science", effect: { battery: -3, science: 2 } },
        { id: "skip", label: "Leave it", cost: "Miss a discovery", gain: "Keep all supplies", effect: {} },
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
      text: "Martian dust got into the oxygen maker's filter. It's only making half as much air.",
      fact: {
        text: "NASA's MOXIE made oxygen from Mars's air 16 times between 2021 and 2023 — 122 grams in total, about what a small dog breathes in 10 hours.",
        source: "NASA — MOXIE on Perseverance",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        { id: "fix", label: "Fix it ourselves now", cost: "−2⚡ battery and −2 science (crew busy)", gain: "Works right away", effect: { battery: -2, science: -2 } },
        { id: "slow", label: "Let it run slowly", cost: "Half air from the maker for 3 sols", gain: "No work needed", effect: { status: [{ id: "airClog", sols: 3 }] } },
        {
          id: "earth",
          label: "Ask Earth for repair steps",
          cost: `Messages take ${Math.round(m)} min each way — half air until tomorrow`,
          gain: "Experts send the fix",
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
      title: "Fuzzy spots in the greenhouse",
      emoji: "🥬",
      text: "Some lettuce leaves have fuzzy spots. Could be mold — or nothing.",
      fact: {
        text: "NASA study OSD-268 checked lettuce grown on the Space Station for germs. It was safe to eat — because astronauts kept it clean.",
        source: "NASA OSDR — OSD-268 (VEG-01B)",
        url: osdrUrl("OSD-268"),
      },
      options: [
        { id: "clean", label: "Clean everything", cost: "Throw out plants: −1 day of food", gain: "Greenhouse stays safe", effect: { food: -1 } },
        { id: "ignore", label: "Ignore it", cost: "Risk: mold may spread and ruin 2 days of food", gain: "Keep all plants (for now)", effect: { status: [{ id: "moldRisk", sols: 4 }] } },
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
      text: "The radar finds ice just under the dirt. Water can become radiation shielding — or air to breathe.",
      fact: {
        text: "NASA's Phoenix lander scraped up real ice on Mars in 2008. Water is great at stopping radiation, and splitting it makes oxygen.",
        source: "NASA — Phoenix Mars Lander",
        url: "https://science.nasa.gov/mission/phoenix/",
      },
      options: [
        { id: "walls", label: "Dig it up for the water walls", cost: `${evaCost}, −2⚡`, gain: "+1 shield level for the rest of the mission", effect: { air: -EVA_AIR, dose: EVA_DOSE, battery: -2, shieldBonus: 1 } },
        { id: "o2", label: "Split it into oxygen", cost: "−3⚡ battery", gain: "+2 days of air", effect: { battery: -3, air: 2 } },
        { id: "skip", label: "Leave it", cost: "Miss free water", gain: "Save power", effect: {} },
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
      text: "Mars gravity is only 38% of Earth's. Without exercise, muscles and bones shrink.",
      fact: {
        text: "NASA study OSD-342 used mice on the Space Station to test ways to protect muscles and bones in low gravity.",
        source: "NASA OSDR — OSD-342",
        url: osdrUrl("OSD-342"),
      },
      options: [
        { id: "gym", label: "Extra workout time", cost: "−2 science today", gain: "Crew stays strong", effect: { science: -2 } },
        { id: "skip", label: "Keep working", cost: "Tired crew: −1 science every sol for 3 sols", gain: "No time lost today", effect: { status: [{ id: "fatigue", sols: 3 }] } },
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
      text: `Dust has covered the panels. They only make ${Math.round(s.panel * 100)}% of their power now.`,
      fact: {
        text: "NASA's InSight lander made about 5,000 watt-hours a sol at first. Dust slowly cut that to about 500 — and in 2022 it ran out of power.",
        source: "NASA JPL — InSight",
        url: "https://science.nasa.gov/mission/insight/",
      },
      options: [
        { id: "clean", label: "Go out and brush them", cost: evaCost, gain: "Panels back to 100%", effect: { air: -EVA_AIR, dose: EVA_DOSE, setPanel: 1 } },
        { id: "wait", label: "Hope the wind cleans them", cost: "Keep losing power every sol", gain: "Stay safe inside", effect: {} },
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
        text: "This really happened: dust devils cleaned the panels of NASA's Spirit and Opportunity rovers many times, helping them last for years.",
        source: "NASA JPL — Mars Exploration Rovers",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [{ id: "ok", label: "Woohoo!", cost: "Nothing", gain: "Panels back to 100%", effect: { setPanel: 1 } }],
    }),
  },
  {
    id: "duststorm",
    weight: 2,
    when: (s) => !s.statuses.dustStorm,
    build: () => ({
      id: "duststorm",
      kind: "info",
      title: "Dust storm rolling in",
      emoji: "🌫️",
      text: "A big dust storm is coming. For 3 sols the sky will be dark and solar panels will make much less power. Plan ahead!",
      fact: {
        text: "In 2018 a dust storm covered all of Mars. Opportunity's power fell from about 645 to just 22 watt-hours a sol, and the rover never woke up again.",
        source: "NASA JPL — Opportunity",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [{ id: "ok", label: "Brace for it", cost: "Less sunlight for 3 sols", gain: "You had a warning", effect: { status: [{ id: "dustStorm", sols: 3 }] } }],
    }),
  },
  {
    id: "samples",
    weight: 2,
    build: () => ({
      id: "samples",
      kind: "deck",
      title: "Earth asks for rock samples",
      emoji: "🧪",
      text: "Scientists back home want sealed tubes of Mars rock to study in their labs.",
      fact: {
        text: "Perseverance is collecting real sample tubes on Mars right now, waiting for a future mission to bring them to Earth.",
        source: "NASA — Mars 2020 Perseverance",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        { id: "drill", label: "Drill and seal samples", cost: "−4⚡ battery", gain: "+3 science", effect: { battery: -4, science: 3 } },
        { id: "skip", label: "Not today", cost: "Disappoint the scientists", gain: "Save power", effect: {} },
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
      text: "The crew wants to celebrate. Happy crews work better!",
      fact: {
        text: `Live video calls with Mars are impossible: today each message takes about ${Math.round(m)} minutes to arrive. Astronauts would send recorded video letters instead.`,
        source: "Light-travel time calculated from NASA JPL planet positions",
      },
      options: [
        { id: "party", label: "Party with special food", cost: "−0.5 day of food", gain: "Happy crew: +1 science for 2 sols", effect: { food: -0.5, status: [{ id: "happyCrew", sols: 2 }] } },
        { id: "video", label: "Record a video letter home", cost: "−1⚡ battery", gain: "Happy crew: +1 science for 1 sol", effect: { battery: -1, status: [{ id: "happyCrew", sols: 1 }] } },
        { id: "skip", label: "Back to work", cost: "Sad birthday", gain: "Save supplies", effect: {} },
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
      text: "A seal on the airlock is leaking a little air into space.",
      fact: {
        text: "The Space Station has had tiny leaks too. Crews hunt for them with ultrasound and even floating tea leaves!",
        source: "NASA — ISS operations",
        url: "https://www.nasa.gov/international-space-station/",
      },
      options: [
        { id: "patch", label: "Patch it now", cost: "−2 science (crew busy)", gain: "Leak fixed", effect: { science: -2 } },
        { id: "ignore", label: "Ignore it", cost: "−1.5 days of air", gain: "Keep working", effect: { air: -1.5 } },
      ],
    }),
  },
];

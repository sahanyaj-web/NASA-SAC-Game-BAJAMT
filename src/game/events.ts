// The story deck. Every day brings a problem and exactly TWO choices.
// Every choice costs something — there is no free choice.
// All text is written for kids aged 7+: short words, no jargon.
import { EVA_AIR, EVA_DOSE } from "./constants";
import { osdrUrl } from "./data/osdr-facts";
import type { CrewId, GameEvent, GameState } from "./types";

export const CREW_CAST: Record<CrewId, { name: string; job: string; emoji: string }> = {
  ada: { name: "Commander Ada", job: "the boss of the base", emoji: "👩‍🚀" },
  leo: { name: "Engineer Leo", job: "fixes machines", emoji: "👨‍🔧" },
  mia: { name: "Doctor Mia", job: "keeps the crew healthy", emoji: "👩‍⚕️" },
  sam: { name: "Scientist Sam", job: "studies Mars", emoji: "🧑‍🔬" },
};

export interface DeckCard {
  id: string;
  weight: number;
  when?: (s: GameState) => boolean;
  build: (s: GameState, oneWayMin: number) => GameEvent;
}

const walkCost = `${EVA_AIR} day of air for the spacesuits, and ${EVA_DOSE} radiation units from being outside`;
const mins = (m: number) => `${Math.round(m)} minutes`;

/** Day 1 is always the same story: you just landed. */
export function firstDayEvent(): GameEvent {
  return {
    id: "landing",
    kind: "deck",
    who: "ada",
    title: "Welcome to Mars!",
    emoji: "🚀",
    text: "Thump! Your rocket just landed. Boxes are everywhere. \"We only have enough battery to set up ONE room today,\" says Commander Ada. \"Which one first?\"",
    fact: {
      text: "NASA's Curiosity rover landed in a giant hole called Gale Crater in 2012. Your base is right next to it!",
      source: "NASA — Curiosity rover",
      url: "https://science.nasa.gov/mission/msl-curiosity/",
    },
    options: [
      {
        id: "plants",
        label: "Set up the plant room",
        cost: "2⚡ from the battery, and the science lab stays in boxes",
        gain: "+1.5 days of food",
        effect: { battery: -2, food: 1.5 },
        outcome: "The crew plants tiny lettuce seeds under bright lights. In a few days there will be fresh salad!",
      },
      {
        id: "lab",
        label: "Set up the science lab",
        cost: "2⚡ from the battery, and the plant room stays in boxes",
        gain: "+3 science",
        effect: { battery: -2, science: 3 },
        outcome: "Scientist Sam looks at Mars dirt under a microscope on the very first day. Exciting!",
      },
    ],
  };
}

export const DECK: DeckCard[] = [
  {
    id: "duststorm",
    weight: 3,
    when: (s) => !s.statuses.dustStorm,
    build: (s) => ({
      id: "duststorm",
      kind: "deck",
      who: "leo",
      title: "A dust storm is coming!",
      emoji: "🌪️",
      text: "A huge wall of red dust is rolling toward the base. \"The wind will blast sand at our solar panels,\" says Engineer Leo. \"The sky will stay dark for 2 days. What should we do with the panels?\"",
      fact: {
        text: "In 2018 a dust storm covered ALL of Mars. NASA's Opportunity rover couldn't get enough sunlight and never woke up again.",
        source: "NASA — Opportunity rover",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [
        {
          id: "leave",
          label: "Leave the solar panels out",
          cost: "Sand covers and scratches them: they make less power until someone goes out to clean them",
          gain: "A little power keeps coming in today",
          effect: { status: [{ id: "dustStorm", sols: 2 }], panel: -0.4 },
          outcome: `Whoosh! Sand hit the panels all day. They still caught a little sunlight, but now they're dirty and only make about ${Math.round(Math.max(0.2, s.panel - 0.4) * 100)}% of their power.`,
        },
        {
          id: "fold",
          label: "Fold the solar panels away",
          cost: "No sunlight power at all today — your battery has to last the whole night",
          gain: "The panels stay safe and clean",
          effect: { status: [{ id: "dustStorm", sols: 2 }, { id: "panelsAway", sols: 1 }] },
          outcome: "The crew folds the panels up tight. The base gets dark and chilly, so everyone wears an extra sweater and saves power.",
        },
      ],
    }),
  },
  {
    id: "rock",
    weight: 3,
    build: () => ({
      id: "rock",
      kind: "deck",
      who: "sam",
      title: "A strange striped rock!",
      emoji: "🪨",
      text: "\"Look out the window!\" shouts Scientist Sam. \"That rock has stripes! Stripes can mean water flowed here a very long time ago.\"",
      fact: {
        text: "NASA's Curiosity rover found out that its part of Mars was once a big lake, billions of years ago.",
        source: "NASA — Curiosity rover",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
      options: [
        {
          id: "eva", label: "Put on spacesuits and go look", cost: walkCost, gain: "+4 science",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 4 },
          outcome: "Sam picks up the rock with thick space gloves. Up close, the stripes look like old mud layers from a lake!",
        },
        {
          id: "drone", label: "Send the little robot car", cost: "3⚡ from the battery", gain: "+2 science (the robot's camera is not as good as eyes)",
          effect: { battery: -3, science: 2 },
          outcome: "The robot car beeps its way over and takes photos. Nobody had to go outside.",
        },
      ],
    }),
  },
  {
    id: "rover",
    weight: 2,
    build: (_s, m) => ({
      id: "rover",
      kind: "deck",
      who: "sam",
      title: "The robot car is stuck!",
      emoji: "🚙",
      text: "The little robot car drove into soft sand. Its wheels are spinning and spinning. \"If we push the wrong way, it could sink deeper,\" Sam worries.",
      fact: {
        text: "NASA's Spirit rover got stuck in soft sand in 2009. Drivers on Earth tried for months, but it never got out. Because of the message wait, rover drivers plan every move a day ahead.",
        source: "NASA — Spirit and Opportunity rovers",
        url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      },
      options: [
        {
          id: "push", label: "Go out and push it free", cost: walkCost, gain: "+2 science (the car gets back to work today)",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 2 },
          outcome: "Heave-ho! Two astronauts dig out the wheels with shovels. The car rolls free and keeps exploring.",
        },
        {
          id: "earth", label: "Ask the rover drivers on Earth", cost: `Each message takes ${mins(m)} to fly there, so the car sits still all day and needs 1⚡ to stay warm`, gain: "Experts plan a safe way out. Nobody goes outside.",
          effect: { battery: -1 }, askEarth: true,
          outcome: "The drivers on Earth send careful steps. Wiggle left, wiggle right… the car slowly crawls out of the sand.",
        },
      ],
    }),
  },
  {
    id: "clog",
    weight: 2,
    build: (_s, m) => ({
      id: "clog",
      kind: "deck",
      who: "leo",
      title: "The oxygen maker is clogged",
      emoji: "🫁",
      text: "\"Uh-oh,\" says Engineer Leo. \"Mars dust got stuck inside the oxygen maker. It only makes half as much air to breathe now.\"",
      fact: {
        text: "NASA's MOXIE machine made oxygen out of Mars air 16 times. It made 122 grams — about as much as a small dog breathes in 10 hours.",
        source: "NASA — Perseverance rover",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        {
          id: "fix", label: "Take it apart and fix it ourselves", cost: "2⚡ from the battery, and 2 science (the crew is busy)", gain: "Works again right away",
          effect: { battery: -2, science: -2 },
          outcome: "Leo opens the machine and blows out the dust with a tiny air pump. It hums back to life!",
        },
        {
          id: "earth", label: "Ask Earth how to fix it", cost: `Messages take ${mins(m)} each way, so you only get half the air until tomorrow`, gain: "Experts on Earth send the steps. No science time lost.",
          effect: { status: [{ id: "airClog", sols: 1 }] }, askEarth: true,
          outcome: "The team on Earth sends a fix-it video. Tomorrow morning Leo follows the steps and the machine works again.",
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
      who: "mia",
      title: "Fuzzy spots on the plants",
      emoji: "🥬",
      text: "Doctor Mia holds up a lettuce leaf. \"See these fuzzy spots? It might be mold — or nothing at all.\"",
      fact: {
        text: "NASA checked lettuce grown on the Space Station for germs. It was safe to eat, because astronauts kept it clean.",
        source: "NASA study OSD-268",
        url: osdrUrl("OSD-268"),
      },
      options: [
        {
          id: "clean", label: "Throw out the spotty plants", cost: "1 day of food", gain: "The rest of the plants stay safe",
          effect: { food: -1 },
          outcome: "The crew wipes every shelf clean. The plant room smells fresh again.",
        },
        {
          id: "ignore", label: "Keep them and hope", cost: "The mold might spread and ruin 2 days of food", gain: "Keep all the plants (for now)",
          effect: { status: [{ id: "moldRisk", sols: 4 }] },
          outcome: "The crew keeps the plants. Doctor Mia says she'll keep an eye on those fuzzy spots…",
        },
      ],
    }),
  },
  {
    id: "ice",
    weight: 2,
    build: () => ({
      id: "ice",
      kind: "deck",
      who: "sam",
      title: "Ice under the ground!",
      emoji: "🧊",
      text: "Beep beep! Sam's scanner finds ice hiding just under the dirt. Water can block radiation — or be turned into air to breathe. You can only dig enough for one job.",
      fact: {
        text: "NASA's Phoenix lander dug up real ice on Mars in 2008.",
        source: "NASA — Phoenix lander",
        url: "https://science.nasa.gov/mission/phoenix/",
      },
      options: [
        {
          id: "walls", label: "Pour it into the water walls", cost: `${walkCost}, plus 2⚡`, gain: "Better radiation blocking for the rest of the trip",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, battery: -2, shieldBonus: 1 },
          outcome: "The crew fills the walls with melted ice. Now the base is a thicker radiation blanket.",
        },
        {
          id: "o2", label: "Turn it into air", cost: "3⚡ from the battery", gain: "+2 days of air",
          effect: { battery: -3, air: 2 },
          outcome: "A machine splits the water into oxygen to breathe. Fresh air for 2 more days!",
        },
      ],
    }),
  },
  {
    id: "weak",
    weight: 2,
    build: () => ({
      id: "weak",
      kind: "deck",
      who: "mia",
      title: "An astronaut feels weak",
      emoji: "💪",
      text: "\"My legs feel wobbly,\" says Leo. Doctor Mia explains: on Mars you weigh about a third as much as on Earth, so muscles and bones get lazy without exercise.",
      fact: {
        text: "NASA studied mice on the Space Station to find ways to keep muscles and bones strong in space.",
        source: "NASA study OSD-342",
        url: osdrUrl("OSD-342"),
      },
      options: [
        {
          id: "gym", label: "Everyone exercises today", cost: "2 science today", gain: "The crew stays strong",
          effect: { science: -2 },
          outcome: "Jumping jacks on Mars! Everyone bounces extra high and feels great.",
        },
        {
          id: "skip", label: "Keep working", cost: "Tired crew: 1 less science every day for 3 days", gain: "No time lost today",
          effect: { status: [{ id: "fatigue", sols: 3 }] },
          outcome: "The crew keeps working, but by evening everyone is yawning and slow.",
        },
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
      who: "leo",
      title: "Dusty solar panels",
      emoji: "🔆",
      text: `"The solar panels are covered in dust," says Leo. "They only make ${Math.round(s.panel * 100)}% of their power now."`,
      fact: {
        text: "Dust slowly covered the panels of NASA's InSight lander until it ran out of power in 2022. Sometimes whirlwinds blew dust off NASA's Spirit and Opportunity rovers — lucky!",
        source: "NASA — InSight lander",
        url: "https://science.nasa.gov/mission/insight/",
      },
      options: [
        {
          id: "clean", label: "Go outside and brush them", cost: walkCost, gain: "Panels as good as new",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, setPanel: 1 },
          outcome: "Swish, swish! The panels shine in the sunlight again.",
        },
        {
          id: "wait", label: "Hope the wind cleans them", cost: "Less power every day", gain: "Stay safe inside",
          effect: {},
          outcome: "The crew stays inside. No wind came today, and the panels are still dusty.",
        },
      ],
    }),
  },
  {
    id: "samples",
    weight: 2,
    build: () => ({
      id: "samples",
      kind: "deck",
      who: "sam",
      title: "Earth wants rock samples",
      emoji: "🧪",
      text: "A message from Earth: scientists back home want little tubes of Mars rock to study. But the drill needs lots of power.",
      fact: {
        text: "NASA's Perseverance rover is filling real tubes with Mars rock right now, waiting for a future trip to bring them to Earth.",
        source: "NASA — Perseverance rover",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        {
          id: "drill", label: "Drill and fill the tubes", cost: "4⚡ from the battery", gain: "+3 science",
          effect: { battery: -4, science: 3 },
          outcome: "Bzzzzz! Five shiny tubes of Mars rock are packed and ready for Earth.",
        },
        {
          id: "skip", label: "Not today", cost: "No new science from the rocks", gain: "Save your battery for tonight",
          effect: {},
          outcome: "The drill stays in its box. The battery stays full for the cold night.",
        },
      ],
    }),
  },
  {
    id: "birthday",
    weight: 1,
    build: (_s, m) => ({
      id: "birthday",
      kind: "deck",
      who: "ada",
      title: "It's Commander Ada's birthday!",
      emoji: "🎂",
      text: "The crew wants to surprise Ada. Happy crews work better! But a party uses supplies.",
      fact: {
        text: `You can't video-chat with Mars. Right now each message takes about ${mins(m)} to get there, so astronauts send recorded videos instead.`,
        source: "Worked out from where NASA says the planets are",
      },
      options: [
        {
          id: "party", label: "Party with special food", cost: "Half a day of food", gain: "Happy crew: +1 science for 2 days",
          effect: { food: -0.5, status: [{ id: "happyCrew", sols: 2 }] },
          outcome: "Surprise! A space-cake with a glow-stick candle. Ada laughs so hard she floats… well, almost.",
        },
        {
          id: "video", label: "Record a video for her family", cost: "1⚡ from the battery", gain: "Happy crew: +1 science for 1 day",
          effect: { battery: -1, status: [{ id: "happyCrew", sols: 1 }] },
          outcome: `The crew sings "Happy Birthday" to the camera. The video takes ${mins(m)} to reach Ada's family.`,
        },
      ],
    }),
  },
  {
    id: "leak",
    weight: 2,
    build: () => ({
      id: "leak",
      kind: "deck",
      who: "leo",
      title: "Hissss… a tiny air leak!",
      emoji: "🔧",
      text: "Leo hears a soft hiss by the door. A seal is letting a little air escape into space.",
      fact: {
        text: "The Space Station has had tiny leaks too. Astronauts once found one by watching floating tea leaves drift toward it!",
        source: "NASA — Space Station",
        url: "https://www.nasa.gov/international-space-station/",
      },
      options: [
        {
          id: "patch", label: "Stop everything and patch it", cost: "2 science (the crew is busy)", gain: "Leak fixed",
          effect: { science: -2 },
          outcome: "Leo finds the leak and presses on a sticky patch. The hissing stops.",
        },
        {
          id: "ignore", label: "Keep working and let it hiss", cost: "1.5 days of air", gain: "Keep working",
          effect: { air: -1.5 },
          outcome: "The crew keeps working, but the air tanks get a little lower all day.",
        },
      ],
    }),
  },
  {
    id: "water",
    weight: 2,
    build: () => ({
      id: "water",
      kind: "deck",
      who: "leo",
      title: "The water cleaner stopped",
      emoji: "🚰",
      text: "On Mars, every drop of water gets cleaned and used again — even sweat! Today the water cleaner made a clunk and stopped.",
      fact: {
        text: "The Space Station cleans and reuses about 98 out of every 100 drops of water, so astronauts need very little from Earth.",
        source: "NASA — Space Station",
        url: "https://www.nasa.gov/international-space-station/",
      },
      options: [
        {
          id: "fix", label: "Fix it with a spare part", cost: "3⚡ from the battery to run the repair tools", gain: "Clean water again",
          effect: { battery: -3 },
          outcome: "Leo swaps in a new filter. Drip, drip — fresh clean water flows again.",
        },
        {
          id: "tank", label: "Drink from the emergency tank", cost: "That water was saved to make air: 1 day of air", gain: "Save your battery",
          effect: { air: -1 },
          outcome: "The crew drinks from the emergency tank. That's water the oxygen maker can't use now.",
        },
      ],
    }),
  },
  {
    id: "school",
    weight: 2,
    build: (_s, m) => ({
      id: "school",
      kind: "deck",
      who: "ada",
      title: "Kids on Earth have questions!",
      emoji: "🏫",
      text: `A school on Earth sent 20 questions, like "Do you sleep upside down?" You can't talk live — each message takes ${mins(m)} to fly between planets.`,
      fact: {
        text: "Astronauts on the Space Station often answer questions from school kids. Mars crews will have to send recorded videos because of the long message wait.",
        source: "NASA — Space Station",
        url: "https://www.nasa.gov/international-space-station/",
      },
      options: [
        {
          id: "answer", label: "Record video answers", cost: "2⚡ from the battery to send the big video", gain: "Happy crew: +1 science for 2 days",
          effect: { battery: -2, status: [{ id: "happyCrew", sols: 2 }] },
          outcome: `The crew answers every question (no, they don't sleep upside down!). ${mins(m)} later, the kids cheer.`,
        },
        {
          id: "skip", label: "Too busy — maybe later", cost: "The crew misses home: tired crew, 1 less science for 2 days", gain: "Save your battery",
          effect: { status: [{ id: "fatigue", sols: 2 }] },
          outcome: "The crew gets back to work, but everyone feels a bit homesick today.",
        },
      ],
    }),
  },
  {
    id: "lights",
    weight: 2,
    build: () => ({
      id: "lights",
      kind: "deck",
      who: "mia",
      title: "The plant lights are flickering",
      emoji: "💡",
      text: "The red and blue lights in the plant room keep blinking on and off. The plants look droopy.",
      fact: {
        text: "Astronauts on the Space Station grow lettuce under red, blue and green lights, because there is no sunshine inside.",
        source: "NASA study OSD-268",
        url: osdrUrl("OSD-268"),
      },
      options: [
        {
          id: "fix", label: "Put in new lights", cost: "2⚡ from the battery", gain: "The plants stay healthy",
          effect: { battery: -2 },
          outcome: "Click! Bright new lights. The lettuce perks right up.",
        },
        {
          id: "skip", label: "Let the plants rest in the dark", cost: "The plants grow slower: 1 day of food", gain: "Save your battery",
          effect: { food: -1 },
          outcome: "The plant room stays dim. Some leaves turn yellow before they grow back.",
        },
      ],
    }),
  },
  {
    id: "hotbattery",
    weight: 1,
    when: (s) => s.batteryCap > 6,
    build: () => ({
      id: "hotbattery",
      kind: "deck",
      who: "leo",
      title: "The battery is getting hot!",
      emoji: "🌡️",
      text: "\"The battery is too warm,\" says Leo. \"If it stays hot it will wear out. We could switch it off to cool down — but then we lose the power stored inside.\"",
      fact: {
        text: "NASA's Mars rovers have heaters AND coolers to keep their batteries not too cold and not too hot.",
        source: "NASA — Perseverance rover",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      options: [
        {
          id: "cool", label: "Switch it off to cool down", cost: "Lose 3⚡ of saved power", gain: "The battery stays healthy",
          effect: { battery: -3 },
          outcome: "The battery rests and cools off. It's ready to work again tomorrow.",
        },
        {
          id: "keep", label: "Keep it running", cost: "It wears out: it holds 2⚡ less for the rest of the trip", gain: "Keep all your saved power today",
          effect: { batteryCap: -2 },
          outcome: "The battery keeps working, but it's a little worn out now and can't hold as much.",
        },
      ],
    }),
  },
];

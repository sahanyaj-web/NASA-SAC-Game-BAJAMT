// The story deck. Every day brings a problem and exactly TWO choices.
// Every choice costs something — there is no free choice — but story choices never cost
// battery, so the player can always pick either one.
// All text is written for kids aged 7+: short words, no jargon. Crew are called by their job, never a name.
import { EVA_AIR, EVA_DOSE } from "./constants";
import { osdrUrl } from "./data/osdr-facts";
import type { CrewId, GameEvent, GameState } from "./types";
import { placeWords } from "./words";

export const CREW_CAST: Record<CrewId, { name: string; job: string; emoji: string }> = {
  ada: { name: "The commander", job: "the boss of the base", emoji: "👩‍🚀" },
  leo: { name: "The engineer", job: "fixes machines", emoji: "👨‍🔧" },
  mia: { name: "The doctor", job: "keeps the crew healthy", emoji: "👩‍⚕️" },
  sam: { name: "The scientist", job: "studies rocks and dirt", emoji: "🧑‍🔬" },
};

export interface DeckCard {
  id: string;
  weight: number;
  when?: (s: GameState) => boolean;
  build: (s: GameState, oneWayMin: number) => GameEvent;
}

const walkCost = "Spacesuit air is used up, and radiation safety drops outside";
const wait = (m: number) => (m < 1 ? `${Math.max(1, Math.round(m * 60))} second${Math.round(m * 60) > 1 ? "s" : ""}` : `${Math.round(m)} minutes`);
const moon = (s: GameState) => s.place === "moon";

/** Day 1 is always the same story: you just landed. */
export function firstDayEvent(s: GameState): GameEvent {
  const P = placeWords(s.place);
  return {
    id: "landing",
    kind: "deck",
    who: "ada",
    title: `Welcome to ${P.name}!`,
    emoji: "🚀",
    text: `Thump! Your rocket just landed. Boxes are everywhere. "We only have time to set up ONE room today," says the commander. "Which one first?"`,
    fact: moon(s)
      ? {
          text: "NASA's Artemis astronauts plan to land near the Moon's south pole, where some craters hide ice that never sees the Sun. Your base is there!",
          source: "NASA — Artemis",
          url: "https://www.nasa.gov/humans-in-space/artemis/",
        }
      : {
          text: "NASA's Curiosity rover landed in a giant hole called Gale Crater in 2012. Your base is right next to it!",
          source: "NASA — Curiosity rover",
          url: "https://science.nasa.gov/mission/msl-curiosity/",
        },
    options: [
      {
        id: "plants",
        label: "Set up the plant room",
        cost: "The research system waits while the crew sets up the plants",
        gain: "Refill some food (up to 100%)",
        effect: { food: 1.5, science: -2 },
        outcome: "The crew plants tiny lettuce seeds under bright lights. In a few days there will be fresh salad!",
      },
      {
        id: "lab",
        label: "Set up the science lab",
        cost: "The plant room waits, so the crew eats stored food",
        gain: "Restore some research (up to 100%)",
        effect: { science: 3, food: -0.5 },
        outcome: `The scientist looks at ${P.name} dirt under a microscope on the very first day. Exciting!`,
      },
    ],
  };
}

export const DECK: DeckCard[] = [
  {
    id: "duststorm",
    weight: 3,
    when: (s) => !s.statuses.dustStorm,
    build: (s) =>
      moon(s)
        ? {
            id: "duststorm",
            kind: "deck",
            who: "leo",
            title: "A rocket is landing nearby!",
            emoji: "🛬",
            text: `"A supply rocket is landing close to us," says the engineer. "Its engine will blast Moon dust super fast across the ground — right at our solar panels!"`,
            fact: {
              text: "When Apollo 12 landed in 1969, its rocket blasted dust that sanded and pitted parts of NASA's Surveyor 3 lander nearby. Moon dust is sharp like tiny bits of glass.",
              source: "NASA — Apollo 12",
              url: "https://www.nasa.gov/mission/apollo-12/",
            },
            options: [
              {
                id: "leave",
                label: "Leave the solar panels out",
                cost: "Dust blasts and scratches them: they make less power until someone goes out to clean them",
                gain: "Power keeps coming in today",
                effect: { panel: -0.4 },
                outcome: `Fwoosh! Dust sprayed across the panels. Now they're dirty and only make about ${Math.round(Math.max(0.2, s.panel - 0.4) * 100)}% of their power.`,
              },
              {
                id: "fold",
                label: "Fold the solar panels away",
                cost: "No sunlight power at all today",
                gain: "The panels stay safe and clean",
                effect: { status: [{ id: "panelsAway", sols: 1 }] },
                outcome: "The crew folds the panels up tight. The rocket lands safely, and the panels are shiny and safe.",
              },
            ],
          }
        : {
            id: "duststorm",
            kind: "deck",
            who: "leo",
            title: "A dust storm is coming!",
            emoji: "🌪️",
            text: `A huge wall of red dust is rolling toward the base. "The wind will blast sand at our solar panels," says the engineer. "The sky will stay dark for 2 days. What should we do with the panels?"`,
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
                cost: "No sunlight power at all today",
                gain: "The panels stay safe and clean",
                effect: { status: [{ id: "dustStorm", sols: 2 }, { id: "panelsAway", sols: 1 }] },
                outcome: "The crew folds the panels up tight. The base gets dark and chilly, so everyone wears an extra sweater.",
              },
            ],
          },
  },
  {
    id: "rock",
    weight: 3,
    build: (s) => ({
      id: "rock",
      kind: "deck",
      who: "sam",
      ...(moon(s)
        ? {
            title: "Orange dirt!",
            emoji: "🟠",
            text: `"Look out the window!" shouts the scientist. "That dirt is orange! It might be tiny glass beads from old volcanoes."`,
            fact: {
              text: "Apollo 17 astronauts found orange Moon soil in 1972. It was made of tiny glass beads sprayed out by volcanoes billions of years ago.",
              source: "NASA — Apollo 17",
              url: "https://www.nasa.gov/mission/apollo-17/",
            },
          }
        : {
            title: "A strange striped rock!",
            emoji: "🪨",
            text: `"Look out the window!" shouts the scientist. "That rock has stripes! Stripes can mean water flowed here a very long time ago."`,
            fact: {
              text: "NASA's Curiosity rover found out that its part of Mars was once a big lake, billions of years ago.",
              source: "NASA — Curiosity rover",
              url: "https://science.nasa.gov/mission/msl-curiosity/",
            },
          }),
      options: [
        {
          id: "eva", label: "Put on spacesuits and go look", cost: walkCost, gain: "Restore some research (up to 100%)",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 4 },
          outcome: "The scientist scoops it up with thick space gloves. Up close, it's even more amazing!",
        },
        {
          id: "drone", label: "Send the little robot car", cost: "The crew uses some air getting the robot ready", gain: "Restore some research (up to 100%), and nobody goes outside",
          effect: { science: 2, air: -0.2 },
          outcome: "The robot car beeps its way over and takes photos. Nobody had to go outside.",
        },
      ],
    }),
  },
  {
    id: "rover",
    weight: 2,
    build: (s, m) => ({
      id: "rover",
      kind: "deck",
      who: "sam",
      title: "The robot car is stuck!",
      emoji: "🚙",
      text: `The little robot car drove into soft dirt. Its wheels are spinning and spinning. "If we push the wrong way, it could sink deeper," the scientist worries.`,
      fact: moon(s)
        ? {
            text: `Apollo 15, 16 and 17 astronauts drove a Moon buggy. Messages to the Moon take only about ${wait(m)}, so people on Earth can drive Moon robots almost live!`,
            source: "NASA — Apollo 15",
            url: "https://www.nasa.gov/mission/apollo-15/",
          }
        : {
            text: "NASA's Spirit rover got stuck in soft sand in 2009. Drivers on Earth tried for months, but it never got out. Because of the message wait, rover drivers plan every move a day ahead.",
            source: "NASA — Spirit and Opportunity rovers",
            url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
          },
      options: [
        {
          id: "push", label: "Go out and push it free", cost: walkCost, gain: "Restore some research (up to 100%) (the car gets back to work today)",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 2 },
          outcome: "Heave-ho! Two astronauts dig out the wheels with shovels. The car rolls free and keeps exploring.",
        },
        {
          id: "earth", label: "Ask the robot drivers on Earth", cost: `Each message takes ${wait(m)} to fly there, so the car sits still and you lose some research`, gain: "Experts plan a safe way out. Nobody goes outside.",
          effect: { science: -1 }, askEarth: true,
          outcome: "The drivers on Earth send careful steps. Wiggle left, wiggle right… the car slowly crawls out.",
        },
      ],
    }),
  },
  {
    id: "clog",
    weight: 2,
    build: (s, m) => ({
      id: "clog",
      kind: "deck",
      who: "leo",
      title: "The oxygen maker is clogged",
      emoji: "🫁",
      text: `"Uh-oh," says the engineer. "Dust got stuck inside the oxygen maker. It only makes half as much air to breathe now."`,
      fact: moon(s)
        ? {
            text: "Moon rocks and dirt are almost half oxygen! NASA is testing machines that could pull it out so astronauts can breathe.",
            source: "NASA — Artemis",
            url: "https://www.nasa.gov/humans-in-space/artemis/",
          }
        : {
            text: "NASA's MOXIE machine made oxygen out of Mars air 16 times. It made 122 grams — about as much as a small dog breathes in 10 hours.",
            source: "NASA — Perseverance rover",
            url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
          },
      options: [
        {
          id: "fix", label: "Take it apart and fix it ourselves", cost: "some research (the crew is busy all day)", gain: "Works again right away",
          effect: { science: -3 },
          outcome: "The engineer opens the machine and blows out the dust with a tiny air pump. It hums back to life!",
        },
        {
          id: "earth", label: "Ask Earth how to fix it", cost: `Messages take ${wait(m)} each way, so you only get half the air until tomorrow`, gain: "Experts on Earth send the steps. No science time lost.",
          effect: { status: [{ id: "airClog", sols: 1 }] }, askEarth: true,
          outcome: "The team on Earth sends a fix-it video. Tomorrow morning the engineer follows the steps and the machine works again.",
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
      text: `The doctor holds up a lettuce leaf. "See these fuzzy spots? It might be mold — or nothing at all."`,
      fact: { text: "NASA checked lettuce grown on the Space Station for germs. It was safe to eat, because astronauts kept it clean.", source: "NASA study OSD-268", url: osdrUrl("OSD-268") },
      options: [
        {
          id: "clean", label: "Throw out the spotty plants", cost: "Some stored food", gain: "The rest of the plants stay safe",
          effect: { food: -1 },
          outcome: "The crew wipes every shelf clean. The plant room smells fresh again.",
        },
        {
          id: "ignore", label: "Keep them and hope", cost: "The mold might spread and ruin Some stored food", gain: "Keep all the plants (for now)",
          effect: { status: [{ id: "moldRisk", sols: 4 }] },
          outcome: "The crew keeps the plants. The doctor says she'll keep an eye on those fuzzy spots…",
        },
      ],
    }),
  },
  {
    id: "ice",
    weight: 2,
    build: (s) => ({
      id: "ice",
      kind: "deck",
      who: "sam",
      title: "Ice under the ground!",
      emoji: "🧊",
      text: "Beep beep! The scientist's scanner finds ice hiding in the dirt. Water can block radiation — or be turned into air to breathe. You can only dig enough for one job.",
      fact: moon(s)
        ? { text: "In 2009 NASA's LCROSS spacecraft crashed into a dark crater near the Moon's south pole on purpose — and found water ice in the dust it kicked up!", source: "NASA — LCROSS", url: "https://science.nasa.gov/mission/lcross/" }
        : { text: "NASA's Phoenix lander dug up real ice on Mars in 2008.", source: "NASA — Phoenix lander", url: "https://science.nasa.gov/mission/phoenix/" },
      options: [
        {
          id: "walls", label: "Pour it into the water walls", cost: walkCost, gain: "Better radiation blocking for the rest of the trip",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, shieldBonus: 1 },
          outcome: "The crew fills the walls with melted ice. Now the base is a thicker radiation blanket.",
        },
        {
          id: "o2", label: "Turn it into air", cost: "Digging takes all day: some research", gain: "Refill some air (up to 100%)",
          effect: { science: -2, air: 2 },
          outcome: "A machine splits the water into oxygen to breathe. The air tanks fill up again!",
        },
      ],
    }),
  },
  {
    id: "weak",
    weight: 2,
    build: (s) => ({
      id: "weak",
      kind: "deck",
      who: "mia",
      title: "An astronaut feels weak",
      emoji: "💪",
      text: `"My legs feel wobbly," says the engineer. The doctor explains: ${moon(s) ? "on the Moon you weigh about a sixth" : "on Mars you weigh about a third"} as much as on Earth, so muscles and bones get lazy without exercise.`,
      fact: { text: "NASA studied mice on the Space Station to find ways to keep muscles and bones strong in space.", source: "NASA study OSD-342", url: osdrUrl("OSD-342") },
      options: [
        {
          id: "gym", label: "Everyone exercises today", cost: "some research today", gain: "The crew stays strong",
          effect: { science: -2 },
          outcome: `Jumping jacks ${placeWords(s.place).on}! Everyone bounces extra high and feels great.`,
        },
        {
          id: "skip", label: "Keep working", cost: "Tired crew: research drops each day for 3 days", gain: "No time lost today",
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
      text: `"The solar panels are covered in dust," says the engineer. "They only make ${Math.round(s.panel * 100)}% of their power now."`,
      fact: moon(s)
        ? { text: "Apollo astronauts found that Moon dust stuck to everything — spacesuits, cameras and tools. It even made their noses itch!", source: "NASA — Apollo 17", url: "https://www.nasa.gov/mission/apollo-17/" }
        : { text: "Dust slowly covered the panels of NASA's InSight lander until it ran out of power in 2022.", source: "NASA — InSight lander", url: "https://science.nasa.gov/mission/insight/" },
      options: [
        {
          id: "clean", label: "Go outside and brush them", cost: walkCost, gain: "Panels as good as new",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, setPanel: 1 },
          outcome: "Swish, swish! The panels shine in the sunlight again.",
        },
        {
          id: "wait", label: "Leave them dusty for now", cost: "Less power every day", gain: "Stay safe inside",
          effect: {},
          outcome: "The crew stays inside. The panels are still dusty.",
        },
      ],
    }),
  },
  {
    id: "samples",
    weight: 2,
    build: (s) => ({
      id: "samples",
      kind: "deck",
      who: "sam",
      title: "Earth wants rock samples",
      emoji: "🧪",
      text: `A message from Earth: scientists back home want little tubes of ${placeWords(s.place).name} rock to study. The drill is outside.`,
      fact: moon(s)
        ? { text: "Apollo astronauts brought 382 kg of Moon rocks back to Earth. NASA still keeps them safe and lends them to scientists today.", source: "NASA — Moon rocks", url: "https://curator.jsc.nasa.gov/lunar/" }
        : { text: "NASA's Perseverance rover is filling real tubes with Mars rock right now.", source: "NASA — Perseverance rover", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
      options: [
        {
          id: "drill", label: "Go out and drill", cost: walkCost, gain: "Restore some research (up to 100%)",
          effect: { air: -EVA_AIR, dose: EVA_DOSE, science: 3 },
          outcome: "Bzzzzz! Five shiny tubes of rock are packed and ready for Earth.",
        },
        {
          id: "skip", label: "Not today", cost: "Research drops while the rock study waits", gain: "Nobody goes outside",
          effect: { science: -1 },
          outcome: "The drill stays in its box. Everyone stays safe inside.",
        },
      ],
    }),
  },
  {
    id: "birthday",
    weight: 1,
    build: (s, m) => ({
      id: "birthday",
      kind: "deck",
      who: "ada",
      title: "It's the commander's birthday!",
      emoji: "🎂",
      text: "The crew wants to surprise the commander. Happy crews work better! But a party takes time and supplies.",
      fact: moon(s)
        ? { text: `The Moon is close: a message gets there in about ${wait(m)}. Moon astronauts can video-call home almost like you do!`, source: "Worked out from NASA's Moon distance" }
        : { text: `You can't video-chat with Mars. Right now each message takes about ${wait(m)} to get there, so astronauts send recorded videos instead.`, source: "Worked out from where NASA says the planets are" },
      options: [
        {
          id: "party", label: "Party with special food", cost: "Some stored food", gain: "Happy crew: Restore some research (up to 100%) for 2 days",
          effect: { food: -0.5, status: [{ id: "happyCrew", sols: 2 }] },
          outcome: "Surprise! A space-cake with a glow-stick candle. The commander laughs and laughs.",
        },
        {
          id: "video", label: "Record a video for the family", cost: "Recording takes the evening: some research", gain: "Happy crew: Restore some research (up to 100%) for 1 day",
          effect: { science: -1, status: [{ id: "happyCrew", sols: 1 }] },
          outcome: `The crew sings "Happy Birthday" to the camera. The video takes ${wait(m)} to reach the commander's family.`,
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
      text: "The engineer hears a soft hiss by the door. A seal is letting a little air escape into space.",
      fact: { text: "The Space Station has had tiny leaks too. Astronauts once found one by watching floating tea leaves drift toward it!", source: "NASA — Space Station", url: "https://www.nasa.gov/international-space-station/" },
      options: [
        {
          id: "patch", label: "Stop everything and patch it", cost: "some research (the crew is busy)", gain: "Leak fixed",
          effect: { science: -2 },
          outcome: "The engineer finds the leak and presses on a sticky patch. The hissing stops.",
        },
        {
          id: "ignore", label: "Keep working and let it hiss", cost: "Some stored air", gain: "Keep working",
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
      text: "In space, every drop of water gets cleaned and used again — even sweat! Today the water cleaner made a clunk and stopped.",
      fact: { text: "The Space Station cleans and reuses about 98 out of every 100 drops of water, so astronauts need very little from Earth.", source: "NASA — Space Station", url: "https://www.nasa.gov/international-space-station/" },
      options: [
        {
          id: "fix", label: "Fix it with a spare part", cost: "The repair takes all day: some research", gain: "Clean water again",
          effect: { science: -2 },
          outcome: "The engineer swaps in a new filter. Drip, drip — fresh clean water flows again.",
        },
        {
          id: "tank", label: "Drink from the emergency tank", cost: "That water was saved to make air: Some stored air", gain: "Keep working",
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
      text: `A school on Earth sent 20 questions, like "Do you sleep upside down?" Each message takes ${wait(m)} to fly to Earth.`,
      fact: { text: "Astronauts on the Space Station often answer questions from school kids.", source: "NASA — Space Station", url: "https://www.nasa.gov/international-space-station/" },
      options: [
        {
          id: "answer", label: "Record video answers", cost: "Recording takes all morning: some research today", gain: "Happy crew: Restore some research (up to 100%) for 2 days",
          effect: { science: -2, status: [{ id: "happyCrew", sols: 2 }] },
          outcome: "The crew answers every question (no, they don't sleep upside down!). Soon, the kids cheer.",
        },
        {
          id: "skip", label: "Too busy — maybe later", cost: "The crew misses home: tired crew, research drops for 2 days", gain: "No time lost today",
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
      fact: { text: "Astronauts on the Space Station grow lettuce under red, blue and green lights, because there is no sunshine inside.", source: "NASA study OSD-268", url: osdrUrl("OSD-268") },
      options: [
        {
          id: "fix", label: "Take spare lights from the lab", cost: "The lab goes dark: some research", gain: "The plants stay healthy",
          effect: { science: -2 },
          outcome: "Click! Bright new lights. The lettuce perks right up.",
        },
        {
          id: "skip", label: "Let the plants rest in the dark", cost: "The plants grow slower: Some stored food", gain: "The lab keeps working",
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
      text: `"The battery is too warm," says the engineer. "If it stays hot it will wear out. We could turn off the lab machines so it can cool down."`,
      fact: { text: "NASA's rovers have heaters AND coolers to keep their batteries not too cold and not too hot.", source: "NASA — Perseverance rover", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
      options: [
        {
          id: "cool", label: "Turn off the lab to cool it", cost: "No lab today: some research", gain: "The battery stays healthy",
          effect: { science: -2 },
          outcome: "The battery rests and cools off. It's ready to work again tomorrow.",
        },
        {
          id: "keep", label: "Keep it running", cost: "It wears out: a smaller battery saves less power for future nights", gain: "The lab keeps working",
          effect: { batteryCap: -2 },
          outcome: "The battery keeps working, but it's a little worn out now and can't hold as much.",
        },
      ],
    }),
  },
];

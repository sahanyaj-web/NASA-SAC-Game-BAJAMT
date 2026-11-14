import type { Place } from "./types";

// Kid-friendly words for science labels.

/** NASA flare classes: C small, M big (10× C), X huge (10× M). */
export function flareWord(cls: string | null | undefined): string {
  if (!cls) return "";
  const c = cls[0];
  if (c === "X") return "huge";
  if (c === "M") return "big";
  if (c === "C") return "small";
  return "tiny";
}

/** "a huge Sun flash (X2.1)" */
export function flarePhrase(cls: string | null | undefined): string {
  if (!cls) return "";
  return `a ${flareWord(cls)} Sun flash (scientists call it ${cls})`;
}

/** Kid words that change with where the base is. */
export function placeWords(place: Place) {
  return place === "moon"
    ? { name: "the Moon", Name: "The Moon", on: "on the Moon", day: "Day", emoji: "🌕", base: "Outpost Selene" }
    : { name: "Mars", Name: "Mars", on: "on Mars", day: "Mars day", emoji: "🔴", base: "Outpost Ares" };
}

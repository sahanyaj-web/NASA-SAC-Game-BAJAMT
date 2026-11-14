import type { SunWindow } from "@/game/types";
import { cn } from "@/lib/utils";

export function sourceLabel(sun: SunWindow) {
  switch (sun.source) {
    case "live-recent":
      return { tag: "LIVE", text: `From NASA right now · the real Sun, ${sun.start} → ${sun.end}` };
    case "live-random":
      return { tag: "LIVE", text: `From NASA right now · the real Sun from ${sun.start} → ${sun.end}` };
    case "archived":
      return { tag: "SAVED", text: `Saved NASA records · ${sun.name} (${sun.start} → ${sun.end})` };
    default:
      return { tag: "SAVED", text: `Couldn't reach NASA, so using saved NASA records · ${sun.name}` };
  }
}

export function SourceBadge({ sun, className }: { sun: SunWindow; className?: string }) {
  const l = sourceLabel(sun);
  const live = l.tag === "LIVE";
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", className)}>
      <span className={cn("text-data font-bold", live ? "text-live" : "text-power")}>
        <span className={cn("mr-1 inline-block size-2 rounded-full", live ? "bg-live animate-blink" : "bg-power")} />
        {l.tag}
      </span>
      <span className="text-muted-foreground">{l.text}</span>
    </span>
  );
}

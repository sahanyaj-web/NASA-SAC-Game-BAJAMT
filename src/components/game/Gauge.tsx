import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "air" | "food" | "power" | "radiation" | "science";

const TONE: Record<Tone, { text: string; bar: string }> = {
  air: { text: "text-air", bar: "bg-air" },
  food: { text: "text-food", bar: "bg-food" },
  power: { text: "text-power", bar: "bg-power" },
  radiation: { text: "text-radiation", bar: "bg-radiation" },
  science: { text: "text-science", bar: "bg-science" },
};

export function Gauge({
  tone,
  emoji,
  label,
  value,
  unit,
  max,
  danger,
  hint,
}: {
  tone: Tone;
  emoji: string;
  label: ReactNode;
  value: number;
  unit: string;
  max: number;
  danger?: boolean;
  hint?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const t = TONE[tone];
  return (
    <div className={cn("panel resource-gauge flex flex-col gap-2 p-3 sm:p-4", t.text, danger && "animate-alert border-radiation")}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-2xl">{emoji}</span>
          {label}
        </span>
      </div>
      <div className={cn("text-data text-2xl font-bold sm:text-3xl", t.text)}>
        {Number.isInteger(value) ? value : value.toFixed(1)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={typeof label === "string" ? label : unit}
      >
        <div className={cn("h-full rounded-full transition-all duration-500", t.bar)} style={{ width: `${pct}%` }} />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

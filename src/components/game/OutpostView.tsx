import { lazy, Suspense, useEffect, useState } from "react";
import { CRATES } from "@/game/engine";
import type { GameState } from "@/game/types";

const OutpostScene = lazy(() => import("./OutpostScene"));

export function OutpostView({ state }: { state: GameState }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const brought = CRATES.filter((c) => state.crates.includes(c.id));
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-1 text-xl font-bold">🔭 View your outpost</h2>
      <p className="mb-3 text-sm text-muted-foreground">Drag to spin around your base, scroll or pinch to zoom. Things you buy in NASA Commodities show up here.</p>
      {brought.length > 0 && (
        <p className="mb-3 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">
          🌍 Earth supplies you brought: {brought.map((c) => `${c.emoji} ${c.name}`).join(" · ")}
        </p>
      )}
      {ready && <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}><OutpostScene state={state} /></Suspense>}
    </section>
  );
}

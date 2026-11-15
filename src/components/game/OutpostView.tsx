import { lazy, Suspense, useEffect, useState } from "react";
import type { GameState } from "@/game/types";

const OutpostScene = lazy(() => import("./OutpostScene"));

export function OutpostView({ state }: { state: GameState }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-1 text-xl font-bold">🔭 View your outpost</h2>
      <p className="mb-3 text-sm text-muted-foreground">Drag to spin around your base, scroll or pinch to zoom. Things you buy in NASA Commodities show up here.</p>
      {ready && <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}><OutpostScene state={state} /></Suspense>}
    </section>
  );
}

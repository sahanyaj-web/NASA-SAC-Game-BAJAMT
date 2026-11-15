import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getActiveSave, setActiveSave } from "@/components/game/active-save";
import { OutpostView } from "@/components/game/OutpostView";
import { ShopPanel } from "@/components/game/ShopPanel";
import { SiteHeader } from "@/components/game/SiteHeader";
import { buyItem } from "@/game/shop";
import type { GameState } from "@/game/types";

export const Route = createFileRoute("/outpost")({
  head: () => ({
    meta: [
      { title: "Your outpost & shop | Junior Astronaut Mission Trainer" },
      { name: "description", content: "See your Moon or Mars base in 3D and spend coins in the NASA Commodities shop to grow it." },
      { property: "og:title", content: "Your outpost & shop | Junior Astronaut Mission Trainer" },
      { property: "og:description", content: "See your Moon or Mars base in 3D and spend coins in the NASA Commodities shop to grow it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OutpostPage,
});

function OutpostPage() {
  const [state, setState] = useState<GameState | null>(null);
  useEffect(() => {
    const s = getActiveSave();
    if (s && !s.state.over) setState(s.state);
  }, []);
  useEffect(() => {
    if (!state?.place) return;
    document.documentElement.dataset["missionWorld"] = state.place;
    return () => { delete document.documentElement.dataset["missionWorld"]; };
  }, [state?.place]);

  const buy = (id: string) => {
    const save = getActiveSave();
    if (!save || !state) return;
    const next = buyItem(state, id);
    setActiveSave({ ...save, state: next });
    setState(next);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">🔭 Your outpost</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">Every 2 days you survive in your mission, you earn 🪙 1 coin. Spend your coins in the commodities shop below, then watch your base grow in the 3D view!</p>
        {!state ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <p className="mb-4">Start a mission first. Then you can see your base here and spend your coins.</p>
            <Button asChild><Link to="/play">🚀 Start a mission</Link></Button>
          </div>
        ) : (
          <>
            <div className="mt-3"><Button variant="panel" size="sm" asChild><Link to="/play">⬅ Back to mission</Link></Button></div>
            <ShopPanel state={state} onBuy={buy} />
            <OutpostView state={state} />
          </>
        )}
      </main>
    </div>
  );
}

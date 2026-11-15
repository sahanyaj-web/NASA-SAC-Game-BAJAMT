import { Button } from "@/components/ui/button";
import { canBuy, SHOP } from "@/game/shop";
import type { GameState } from "@/game/types";

export function ShopPanel({ state, onBuy }: { state: GameState; onBuy: (id: string) => void }) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">🛒 NASA Commodities</h2>
        <span className="rounded-full bg-power/15 px-3 py-1 font-semibold">🪙 {state.coins ?? 0} coins</span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">Every 2 days you survive, you earn 🪙 1 coin. Spend your coins here to grow your outpost.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP.map((item) => {
          const owned = item.once && (state.purchases?.includes(item.id) || state.crates.includes(item.id as never));
          return (
            <div key={item.id} className="flex flex-col rounded-xl border border-border p-3">
              <p className="font-semibold">{item.emoji} {item.name}</p>
              <p className="flex-1 text-sm text-muted-foreground">{item.what}</p>
              <Button className="mt-2" size="sm" disabled={!canBuy(state, item)} onClick={() => onBuy(item.id)}>
                {owned ? "Already have it" : `Buy for 🪙 ${item.price}`}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

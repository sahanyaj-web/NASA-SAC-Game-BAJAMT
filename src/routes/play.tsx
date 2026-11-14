import { createFileRoute } from "@tanstack/react-router";
import { MissionGame } from "@/components/game/MissionGame";
import { SiteHeader } from "@/components/game/SiteHeader";

interface PlaySearch {
  storm?: string | undefined;
}

export const Route = createFileRoute("/play")({
  validateSearch: (s: Record<string, unknown>): PlaySearch => ({
    storm: typeof s["storm"] === "string" ? s["storm"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Play — Outpost Ares Mars mission" },
      { name: "description", content: "Pick a real Sun from NASA records, pack your rocket and keep your Mars crew alive for 15 sols." },
      { property: "og:title", content: "Play — Outpost Ares Mars mission" },
      { property: "og:description", content: "Pick a real Sun from NASA records, pack your rocket and keep your Mars crew alive for 15 sols." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { storm } = Route.useSearch();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <MissionGame initialStorm={storm} />
      </main>
    </div>
  );
}

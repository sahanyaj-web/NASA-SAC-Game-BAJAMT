<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Keep mission scenery in presentation components and theme colors in global CSS; no visual refresh may alter the pure game rules. Why: graphics stay independent of mission outcomes.
- Set the document's mission-world theme only while setup or gameplay is mounted and derive it from the current place; global CSS owns world palettes and resource colors remain stable. Why: selection, restored missions and reports match their world without leaking the theme to other pages.

- Game rules live in pure modules under `src/game/` (engine, events, orbit, space-weather); UI components never compute outcomes themselves. Why: keeps rules testable in `src/game/engine.test.ts`.
- Keep active mission saves only in browser-document memory, never persistent storage; in-app navigation retains progress, but closing or reloading starts fresh. Why: players explicitly want progress cleared when leaving the website.
- Draw unseen eligible story cards first and avoid consecutive repeats when recycling the deck; NASA emergencies stay tied to their records. Why: daily problems provide varied trade-offs without inventing solar activity.
- Every real-world number in the game is defined once in `src/game/constants.ts` with its source in a comment. Why: judges and teachers must be able to trace each value.
- Live NASA DONKI data is fetched directly from the browser (`ccmc.gsfc.nasa.gov/DONKI/WS/get`, CORS-enabled, no key); any failure falls back to the embedded archive and the UI must label it SAVED (never LIVE). Why: never present static data as live.
- Embedded datasets in `src/game/data/` are generated snapshots of real NASA sources; regenerate rather than hand-edit values. Why: data authenticity.
- Every decision card option must state a cost (enforced by a test). Why: the educational goal is that no choice is free.
- The base location (`place`: mars | moon) lives in GameState; place-specific wording comes from `placeWords()` in `src/game/words.ts` and place-specific facts are chosen inside each event's `build`. Why: one rule set, two worlds.
- Story (deck) choices never cost battery (enforced by a test), so both options are always selectable. Why: choices are trade-offs, never blocked.
- Active missions advance through story choices and `endStoryDay`; automatic life support stays in the pure engine. Why: supply changes need no manual power planner and remain testable.
- Keep physical resource units and capacity caps in the pure engine; use `resourcePercentages` for all visible system values, for the four survival systems. Why: percentage displays retain NASA-grounded physical calculations and cargo trade-offs.
- Endless missions access finite NASA windows through `recordForDay`, retaining original dates and labeling repeated windows SAVED. Why: continued play must not invent live observations.

- Disable scroll-position restoration in the router; page navigation always starts at the top while mission saves remain independent. Why: returning from facts must not open mid-page.
- Story costs and automatic production use only survival resources; crew morale affects plant care and rover cargo helps food production. Why: no removed research score can influence mission survival.
- The 3D outpost view (three.js/R3F) is presentation-only, lazy-loaded in the browser, and draws from GameState (crates, shieldBonus, purchases). Why: no SSR canvas and no rule changes from visuals.

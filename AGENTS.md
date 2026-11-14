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

- Game rules live in pure modules under `src/game/` (engine, events, orbit, space-weather); UI components never compute outcomes themselves. Why: keeps rules testable in `src/game/engine.test.ts`.
- Every real-world number in the game is defined once in `src/game/constants.ts` with its source in a comment. Why: judges and teachers must be able to trace each value.
- Live NASA DONKI data is fetched directly from the browser (`ccmc.gsfc.nasa.gov/DONKI/WS/get`, CORS-enabled, no key); any failure falls back to the embedded archive and the UI must label it SAVED (never LIVE). Why: never present static data as live.
- Embedded datasets in `src/game/data/` are generated snapshots of real NASA sources; regenerate rather than hand-edit values. Why: data authenticity.
- Every decision card option must state a cost (enforced by a test). Why: the educational goal is that no choice is free.
- The base location (`place`: mars | moon) lives in GameState; place-specific wording comes from `placeWords()` in `src/game/words.ts` and place-specific facts are chosen inside each event's `build`. Why: one rule set, two worlds.
- Story (deck) choices never cost battery (enforced by a test), so both options are always selectable. Why: choices are trade-offs, never blocked.

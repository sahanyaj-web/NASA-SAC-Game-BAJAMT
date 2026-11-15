import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const link = "rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
  const active = { className: "bg-secondary text-foreground" };
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-sm font-bold sm:text-lg">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-lg">🚀</span>
          Junior Astronaut Mission Trainer
        </Link>
        <nav className="flex shrink-0 items-center gap-1">
          <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/play" className={link} activeProps={active}>Play</Link>
          <Link to="/science" className={link} activeProps={active}>NASA Data</Link>
        </nav>
      </div>
    </header>
  );
}

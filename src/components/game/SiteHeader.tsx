import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const link = "rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
  const active = { className: "bg-secondary text-foreground" };
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-gradient-primary text-lg">🔴</span>
          Outpost Ares
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/play" className={link} activeProps={active}>Play</Link>
          <Link to="/science" className={link} activeProps={active}>Real facts</Link>
        </nav>
      </div>
    </header>
  );
}

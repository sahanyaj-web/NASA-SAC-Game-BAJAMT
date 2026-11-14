import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MissionSetup } from "@/components/game/MissionSetup";

// The setup screen keeps the player's picks in its own state, so a reset has to
// put every pick back to the starting point instead of leaving half-chosen gear.
describe("Mission setup reset button", () => {
  it("only appears after a pick changes and puts every pick back", () => {
    render(<MissionSetup loading={false} onLaunch={() => {}} />);

    expect(screen.queryByRole("button", { name: /Reset choices/ })).toBeNull();

    const moon = screen.getByRole("button", { name: /Moon base/ });
    const crate = screen.getByRole("button", { name: /Extra solar panels/ });
    expect(moon).toHaveAttribute("aria-pressed", "false");
    expect(crate).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(moon);
    fireEvent.click(crate);

    expect(moon).toHaveAttribute("aria-pressed", "true");
    expect(crate).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Reset choices/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reset choices/ }));

    expect(moon).toHaveAttribute("aria-pressed", "false");
    expect(crate).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: /Reset choices/ })).toBeNull();
  });
});

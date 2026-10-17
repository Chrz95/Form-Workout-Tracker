import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TrainingWeek } from "./TrainingWeek";
import type { Studio } from "../../app/useStudio";
import { localDateKey } from "../../features/calendar/calendar.utils";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("Weekly training summary", () => {
  it("counts confirmed sessions in the local Monday-start week and marks only recorded days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 16, 12));
    const studio = {
      isConnected: true,
      sessions: [
        { date: localDateKey(new Date(2026, 9, 12, 12)) },
        { date: localDateKey(new Date(2026, 9, 12, 14)) },
        { date: localDateKey(new Date(2026, 9, 11, 12)) },
      ],
      setPage: vi.fn(),
    } as unknown as Studio;
    render(<TrainingWeek studio={studio} />);
    const panel = screen.getByRole("region", { name: "This week's training" });
    expect(panel).toHaveTextContent("2 sessions recorded");
    expect(screen.getByRole("listitem", { name: "Monday: workout recorded" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { name: "Friday: no workout recorded" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
  });
  it("shows an unknown total while disconnected instead of inventing a zero-session history", () => {
    const studio = { isConnected: false, sessions: [], setPage: vi.fn() } as unknown as Studio;
    render(<TrainingWeek studio={studio} />);
    expect(screen.getByRole("region", { name: "This week's training" })).toHaveTextContent("— sessions recorded");
    expect(screen.getAllByRole("listitem", { name: /awaiting training history/ })).toHaveLength(7);
  });
});

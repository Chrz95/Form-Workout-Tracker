import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExerciseProgress } from "./ExerciseProgress";
import { useStudio } from "../../../app/useStudio";
import type { Session } from "../../../../../shared/contracts";
import { beforeEach, vi } from "vitest";
const history: Session[] = [
  {
    id: "7c4f72b7-0114-4e9d-9b44-f45d9e23ff0b",
    createdAt: "2026-10-10T12:00:00Z",
    date: "2026-10-10",
    name: "First session",
    notes: "",
    duration: 30,
    items: [{ exerciseId: "Pushups", sets: 3, reps: 10, weight: 20 }],
  },
  {
    id: "66029d09-aa0c-41c7-a45b-7ee879b0305a",
    createdAt: "2026-10-12T12:00:00Z",
    date: "2026-10-12",
    name: "Second session",
    notes: "",
    duration: 40,
    items: [{ exerciseId: "Pushups", sets: 3, reps: 8, weight: 25 }],
  },
];
/** Supplies real component contracts while injecting deterministic saved history.
 * @returns {JSX.Element} Exercise progress test screen.
 */
function ProgressHarness() {
  const studio = useStudio();
  return <ExerciseProgress studio={{ ...studio, sessions: history }} />;
}
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify([]))),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Exercise progress interaction", () => {
  it("switches metrics and exposes the exact plotted values as a table", async () => {
    const user = userEvent.setup();
    render(<ProgressHarness />);
    await user.selectOptions(screen.getByLabelText("Measure"), "volume");
    await user.click(screen.getByText("View recorded values"));
    expect(screen.getByRole("table")).toHaveTextContent("First session");
    expect(screen.getByRole("table")).toHaveTextContent("Second session");
    expect(screen.getAllByText("600 kg")).toHaveLength(2);
    expect(screen.getByText(/Warm-ups are excluded/)).toBeInTheDocument();
  });
});

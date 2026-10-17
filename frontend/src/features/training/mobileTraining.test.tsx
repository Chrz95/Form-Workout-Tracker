import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Studio } from "../../app/useStudio";
import { exerciseSchema, type Workout, type WorkoutItem } from "../../../../shared/contracts";
import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { ExerciseDetail } from "../exercises/ExerciseDetail";
import { PrescriptionRow } from "./PrescriptionRow";
import { WorkoutPreviewItem } from "./WorkoutPreviewItem";
import { WorkoutCard } from "./WorkoutCard";
const exercise = exerciseSchema.parse({
  id: "bench",
  name: "Bench Press",
  level: "beginner",
  equipment: "barbell",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps"],
  instructions: ["Lower with control.", "Press upward."],
  images: ["/exercises/bench.webp"],
});
const item: WorkoutItem = {
  exerciseId: "bench",
  sets: 2,
  reps: 8,
  weight: 45,
  notes: "Rest 90 seconds.",
  plannedSets: [
    { reps: 12, weight: 20 },
    { reps: 8, weight: 45 },
  ],
};
const workout: Workout = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Upper body",
  notes: "Strength day",
  items: [item],
  createdAt: "2026-10-16T12:00:00Z",
};
let phone = true;
const listeners = new Set<() => void>();
beforeEach(() => {
  phone = true;
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query === "(max-width: 680px)" ? phone : true;
      },
      addEventListener: (_event: string, listener: () => void) => {
        if (query === "(max-width: 680px)") listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: () => void) => {
        listeners.delete(listener);
      },
    })),
  );
  /** Opens a native dialog substitute for DOM-only tests. */
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  /** Closes a native dialog substitute for DOM-only tests. */
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
/** Supplies the actual state updates used by compact exercise controls.
 * @returns {JSX.Element} Stateful prescription row.
 */
function EditorHarness() {
  const [items, setDraftItems] = useState([item]);
  const studio = { draftItems: items, setDraftItems, exercises: [exercise] } as unknown as Studio;
  return (
    <PrescriptionRow
      item={items[0]!}
      studio={studio}
    />
  );
}
describe("Compact phone training", () => {
  it("keeps disclosure values when reopening and adapting to a wider screen", async () => {
    const user = userEvent.setup();
    render(
      <ResponsiveDisclosure summary="Workout note">
        <textarea aria-label="Note" />
      </ResponsiveDisclosure>,
    );
    const section = screen.getByText("Workout note").closest("details")!;
    expect(section.open).toBe(false);
    await user.click(screen.getByText("Workout note"));
    await user.type(screen.getByLabelText("Note"), "Keep this draft");
    await user.click(screen.getByText("Workout note"));
    expect(section.open).toBe(false);
    act(() => {
      phone = false;
      listeners.forEach((listener) => listener());
    });
    expect(section.open).toBe(true);
    expect(screen.getByLabelText("Note")).toHaveValue("Keep this draft");
    act(() => {
      phone = true;
      listeners.forEach((listener) => listener());
    });
    expect(section.open).toBe(false);
    await user.click(screen.getByText("Workout note"));
    expect(screen.getByLabelText("Note")).toHaveValue("Keep this draft");
  });
  it("preserves notes, first-set replication and later overrides through compact editor toggles", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);
    const targets = screen.getByText(/Individual set targets/).closest("details")!;
    expect(targets.open).toBe(false);
    expect(targets.querySelector("summary")).toHaveTextContent("2 sets · 8–12 reps · 20–45 kg");
    await user.click(targets.querySelector("summary")!);
    fireEvent.change(screen.getByLabelText("Set 1 weight"), { target: { value: "30" } });
    expect(screen.getByLabelText("Set 2 weight")).toHaveValue(30);
    fireEvent.change(screen.getByLabelText("Set 2 weight"), { target: { value: "35" } });
    await user.click(targets.querySelector("summary")!);
    await user.click(targets.querySelector("summary")!);
    expect(screen.getByLabelText("Set 1 weight")).toHaveValue(30);
    expect(screen.getByLabelText("Set 2 weight")).toHaveValue(35);
    const options = screen.getByText("Options & note · Note added");
    await user.click(options);
    await user.clear(screen.getByLabelText("Note for Bench Press"));
    await user.type(screen.getByLabelText("Note for Bench Press"), "Pause at the bottom");
    await user.click(options);
    await user.click(options);
    expect(screen.getByLabelText("Note for Bench Press")).toHaveValue("Pause at the bottom");
  });
  it("expands exact preview targets and notes from a mixed-target summary", async () => {
    const user = userEvent.setup();
    const setSelectedExercise = vi.fn();
    render(
      <ol>
        <WorkoutPreviewItem
          entry={{ item, workoutPath: ["Upper body", "Push routine"] }}
          position={1}
          studio={{ exercises: [exercise], setSelectedExercise } as unknown as Studio}
        />
      </ol>,
    );
    const summary = screen.getByText("2 sets · 8–12 reps · 20–45 kg · Note");
    expect(summary.closest("details")!.open).toBe(false);
    await user.click(summary);
    const table = screen.getByRole("table", { name: "Bench Press planned set targets" });
    expect(
      within(table)
        .getAllByRole("row")
        .map((row) => row.textContent),
    ).toEqual(["SetRepsWeight (kg)", "11220", "2845"]);
    expect(screen.getByText("Rest 90 seconds.")).toBeInTheDocument();
    expect(screen.getByText("Push routine")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Bench Press" }));
    expect(setSelectedExercise).toHaveBeenCalledWith(exercise);
  });
  it("retains card actions and referenced-workout deletion protection behind More", async () => {
    const user = userEvent.setup();
    const openWorkout = vi.fn();
    const studio = { exercises: [exercise], workouts: [workout], openWorkout } as unknown as Studio;
    const { rerender } = render(
      <WorkoutCard
        workout={workout}
        studio={studio}
      />,
    );
    expect(screen.getByText("More").closest("details")!.open).toBe(false);
    await user.click(screen.getByText("More"));
    await user.click(screen.getByRole("button", { name: "Edit Upper body" }));
    expect(openWorkout).toHaveBeenCalledWith(workout, false);
    const parent = { ...workout, id: "parent", includedWorkoutIds: [workout.id], items: [] };
    rerender(
      <WorkoutCard
        workout={workout}
        studio={{ ...studio, workouts: [workout, parent] }}
      />,
    );
    const remove = screen.getByRole("button", { name: "Delete Upper body" });
    expect(remove).toBeDisabled();
    expect(remove).toHaveAccessibleDescription(/Used by 1 parent workout/);
  });
  it("keeps media visible and instructions available in compact exercise details", async () => {
    const user = userEvent.setup();
    const addExercise = vi.fn();
    render(
      <ExerciseDetail
        exercise={exercise}
        studio={
          {
            exercises: [exercise],
            draftSelectedItems: [],
            addExercise,
          } as unknown as Studio
        }
      />,
    );
    expect(screen.getByAltText("Bench Press, instructional image 1")).toBeInTheDocument();
    const instructions = screen.getByText("How to move · 2 steps");
    expect(instructions.closest("details")!.open).toBe(false);
    await user.click(instructions);
    expect(screen.getByText("Lower with control.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to workout" }));
    expect(addExercise).toHaveBeenCalledWith("bench");
    expect(screen.getByText(/Source: Free Exercise DB/)).toBeInTheDocument();
  });
});

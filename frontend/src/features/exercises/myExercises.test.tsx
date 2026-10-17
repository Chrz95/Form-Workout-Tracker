import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise, Workout, WorkoutItem } from "../../../../shared/contracts";
import { useCatalog } from "./useCatalog";
const press: Exercise = {
  id: "press",
  name: "Dumbbell Press",
  legacyIds: ["old-press"],
  equipment: "dumbbell",
  level: "beginner",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  images: ["/exercises/press.webp"],
  instructions: ["Press with control."],
};
const squat: Exercise = { ...press, id: "squat", name: "Squat", legacyIds: [], equipment: "barbell" };
const custom: Exercise = { ...press, id: "custom_10000000-0000-4000-8000-000000000001", name: "My Press" };
const archived: Exercise = { ...press, id: "archived", legacyIds: [], isArchived: true, images: [] };
const target: WorkoutItem = { exerciseId: "old-press", sets: 3, reps: 10, weight: 20 };
const child: Workout = { id: "child", name: "Push", createdAt: "2026-10-17T12:00:00Z", notes: "", items: [target] };
const parent: Workout = { ...child, id: "parent", items: [target], includedWorkoutIds: [child.id] };
interface CollectionProps {
  workouts: Workout[];
  draft: WorkoutItem[];
}
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (path: string) => new Response(JSON.stringify(path === "/exercises.json" ? [press, squat] : [archived])),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Automatic My exercises collection", () => {
  it("resolves custom entries, saved aliases and shared components once", async () => {
    const workouts = [child, parent, { ...child, id: "history", items: [{ ...target, exerciseId: "archived" }] }];
    const { result } = renderHook(() => useCatalog([custom], workouts, [target]));
    await waitFor(() => expect(result.current.discoverableExercises).toHaveLength(3));
    expect([...result.current.myExerciseIds]).toEqual(["press", custom.id]);
    act(() => result.current.setMineOnly(true));
    expect(result.current.filteredExercises.map((exercise) => exercise.id)).toEqual(["press", custom.id]);
    act(() => result.current.setEquipment("barbell"));
    expect(result.current.filteredExercises).toEqual([]);
    act(() => result.current.resetFilters());
    expect(result.current.mineOnly).toBe(false);
    expect(result.current.filteredExercises).toHaveLength(3);
  });
  it("updates immediately for draft additions and replacements and keeps saved membership after a reload", async () => {
    const initialProps: CollectionProps = { workouts: [], draft: [] };
    const { result, rerender, unmount } = renderHook(
      ({ workouts, draft }: CollectionProps) => useCatalog([custom], workouts, draft),
      { initialProps },
    );
    await waitFor(() => expect(result.current.discoverableExercises).toHaveLength(3));
    act(() => result.current.setMineOnly(true));
    expect(result.current.myExerciseIds.size).toBe(1);
    rerender({ workouts: [], draft: [target, { ...target, exerciseId: "press" }] });
    expect(result.current.myExerciseIds.size).toBe(2);
    expect(result.current.filteredExercises.map((exercise) => exercise.id)).toContain("press");
    rerender({ workouts: [], draft: [{ ...target, exerciseId: "squat" }] });
    expect([...result.current.myExerciseIds]).toEqual(["squat", custom.id]);
    rerender({ workouts: [child], draft: [] });
    expect([...result.current.myExerciseIds]).toEqual(["press", custom.id]);
    unmount();
    const restored = renderHook(() => useCatalog([custom], [child]));
    await waitFor(() => expect(restored.result.current.myExerciseIds.has("press")).toBe(true));
    expect(restored.result.current.myExerciseIds.size).toBe(2);
    expect(vi.mocked(fetch).mock.calls.every((call) => call.length === 1 || !call[1]?.method)).toBe(true);
  });
  it("retains shared references until removal and keeps custom entries", async () => {
    const { result, rerender } = renderHook(
      ({ workouts, draft }: CollectionProps) => useCatalog([custom], workouts, draft),
      { initialProps: { workouts: [child, parent], draft: [] } as CollectionProps },
    );
    await waitFor(() => expect(result.current.myExerciseIds.has("press")).toBe(true));
    rerender({ workouts: [child], draft: [] });
    expect(result.current.myExerciseIds.has("press")).toBe(true);
    rerender({ workouts: [], draft: [] });
    expect([...result.current.myExerciseIds]).toEqual([custom.id]);
  });
});

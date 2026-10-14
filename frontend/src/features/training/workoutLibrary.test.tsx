import { describe, expect, it } from "vitest";
import type { Exercise, Workout } from "../../../../shared/contracts";
import { workoutInputSchema } from "../../../../shared/contracts";
import { createWorkoutCopy } from "../../../../shared/workoutCopy";
import { createWorkoutLibrary, selectWorkoutLibrary } from "./workoutLibrary.utils";
const ids = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
];
const child: Workout = {
  id: ids[0]!,
  name: "Élan Push 10",
  notes: "Tempo upper",
  createdAt: "2026-10-12T12:00:00Z",
  items: [
    {
      exerciseId: "bench",
      sets: 2,
      reps: 8,
      weight: 45,
      plannedSets: [
        { reps: 12, weight: 20 },
        { reps: 8, weight: 45 },
      ],
    },
  ],
};
const parent: Workout = {
  ...child,
  id: ids[1]!,
  name: "Full day",
  notes: "",
  createdAt: "2026-10-13T12:00:00Z",
  includedWorkoutIds: [child.id],
  items: [{ exerciseId: "squat", sets: 4, reps: 10, weight: 30 }],
};
const legacy: Workout = {
  ...child,
  id: ids[2]!,
  name: "Push 2",
  notes: "",
  createdAt: "2026-10-11T12:00:00Z",
  items: [{ exerciseId: "old-bench", sets: 1, reps: 10, weight: 20 }],
};
const pull: Workout = {
  ...legacy,
  id: ids[3]!,
  name: "Pull",
  createdAt: "2026-10-14T12:00:00Z",
  items: [{ exerciseId: "pull", sets: 5, reps: 10, weight: 20 }],
};
const workouts = [child, parent, legacy, pull];
const exercises: Exercise[] = ["bench", "squat", "pull"].map((id) => ({
  id,
  name: id === "bench" ? "Bench Press" : id,
  primaryMuscles: id === "bench" ? ["chest"] : [],
  secondaryMuscles: [],
  aliases: id === "bench" ? ["Chest press"] : [],
  legacyIds: [`old-${id}`],
  instructions: [],
  images: [],
  level: "beginner",
  category: "strength",
  equipment: "barbell",
}));
const library = createWorkoutLibrary(workouts, exercises);
describe("Workout library search and independent duplication", () => {
  it("searches normalized names, notes, nested components, exercise aliases and muscles", () => {
    const options = { query: "ÉLAN! CHEST press", sort: "newest" as const, filter: "all" as const };
    expect(selectWorkoutLibrary(library, options).map((record) => record.id)).toEqual([parent.id, child.id]);
    expect(selectWorkoutLibrary(library, { ...options, query: "tempo upper" })).toEqual([child]);
    expect(selectWorkoutLibrary(library, { ...options, query: "chest press" })).toHaveLength(3);
    expect(selectWorkoutLibrary(library, { ...options, query: "not found" })).toEqual([]);
  });
  it("filters composition and use from the complete graph", () => {
    const options = { query: "", sort: "newest" as const, filter: "composed" as const };
    expect(selectWorkoutLibrary(library, options)).toEqual([parent]);
    expect(selectWorkoutLibrary(library, { ...options, filter: "used" })).toEqual([child]);
    expect(selectWorkoutLibrary(library, { ...options, filter: "standalone" })).toHaveLength(3);
  });
  it("sorts creation dates and expanded counts without mutating original ordering or targets", () => {
    const original = JSON.stringify(workouts);
    const options = { query: "", sort: "newest" as const, filter: "all" as const };
    expect(selectWorkoutLibrary(library, options).map((record) => record.id)).toEqual([
      pull.id,
      parent.id,
      child.id,
      legacy.id,
    ]);
    expect(selectWorkoutLibrary(library, { ...options, sort: "oldest" }).map((record) => record.id)).toEqual([
      legacy.id,
      child.id,
      parent.id,
      pull.id,
    ]);
    expect(selectWorkoutLibrary(library, { ...options, sort: "exercises" })[0]?.id).toBe(parent.id);
    expect(selectWorkoutLibrary(library, { ...options, sort: "sets" }).map((record) => record.id)).toEqual([
      parent.id,
      pull.id,
      child.id,
      legacy.id,
    ]);
    expect(JSON.stringify(workouts)).toBe(original);
  });
  it("orders names naturally and breaks equal-date ties deterministically", () => {
    const a = { ...child, name: "Workout 10" };
    const b = { ...legacy, name: "Workout 2", createdAt: child.createdAt };
    const indexed = createWorkoutLibrary([a, b], exercises);
    const options = { query: "", sort: "name" as const, filter: "all" as const };
    expect(selectWorkoutLibrary(indexed, options)).toEqual([b, a]);
    expect(selectWorkoutLibrary(indexed, { ...options, sort: "newest" })).toEqual([a, b]);
  });
  it("keeps invalid routines searchable while placing unavailable metrics after valid counts", () => {
    const broken = { ...parent, name: "Repair me", includedWorkoutIds: ["missing"] };
    const indexed = createWorkoutLibrary([broken, child], exercises);
    expect(indexed[0]?.setCount).toBeNull();
    const options = { query: "", sort: "sets" as const, filter: "all" as const };
    expect(selectWorkoutLibrary(indexed, options)).toEqual([child, broken]);
    expect(selectWorkoutLibrary(indexed, { ...options, query: "repair" })).toEqual([broken]);
  });
  it("creates a new input with independent targets and component order, without copied identities", () => {
    const source = { ...parent, items: child.items };
    const copy = createWorkoutCopy(source);
    expect(copy.name).toBe("Copy of Full day");
    expect("id" in copy).toBe(false);
    expect("createdAt" in copy).toBe(false);
    expect(copy.includedWorkoutIds).toEqual([child.id]);
    copy.items[0]!.plannedSets![0]!.weight = 99;
    copy.includedWorkoutIds![0] = pull.id;
    expect(source.items[0]?.plannedSets?.[0]?.weight).toBe(20);
    expect(source.includedWorkoutIds).toEqual([child.id]);
  });
  it("bounds copy names without cutting a Unicode character and retains legacy aggregate representation", () => {
    const source = { ...legacy, name: "x".repeat(91) + "😀" };
    const copy = createWorkoutCopy(source);
    expect(copy.name.length).toBeLessThanOrEqual(100);
    expect(copy.name).not.toMatch(/[\uD800-\uDBFF]$/);
    expect(workoutInputSchema.safeParse(copy).success).toBe(true);
    expect(copy.items[0]?.plannedSets).toBeUndefined();
    expect(copy.items).toEqual(legacy.items);
  });
});

import { describe, expect, it } from "vitest";
import type { Workout, Exercise } from "../../../../shared/contracts";
import { workoutInputSchema } from "../../../../shared/contracts";
import { resolveWorkout, resolveWorkoutEntries, workoutIdentities } from "../../../../shared/workoutGraph";
import { createLiveWorkout } from "./live/live.utils";
import { createTrainingCsv } from "./export/exportCsv";
import { readTrainingCsv } from "./import/importCsv";
import { reviewImport } from "./import/reviewImportRecords";
const ids = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
];
const targets = [
  { reps: 12, weight: 20 },
  { reps: 8, weight: 45 },
];
const child: Workout = {
  id: ids[0]!,
  name: "Push",
  notes: "",
  createdAt: "2026-10-13T12:00:00Z",
  items: [{ exerciseId: "bench", sets: 2, reps: 8, weight: 45, plannedSets: targets }],
};
const parent: Workout = { ...child, id: ids[1]!, name: "Upper", items: [], includedWorkoutIds: [child.id] };
const root: Workout = {
  ...parent,
  id: ids[2]!,
  name: "Full",
  includedWorkoutIds: [parent.id],
  items: [{ exerciseId: "squat", sets: 3, reps: 10, weight: 30 }],
};
const catalog: Exercise[] = ["bench", "squat"].map((id) => ({
  id,
  name: id,
  level: "beginner",
  equipment: "barbell",
  category: "strength",
  primaryMuscles: [],
  secondaryMuscles: [],
  instructions: [],
  images: [],
  legacyIds: [`old-${id}`],
}));
describe("Saved nested workout relationships", () => {
  it("preserves source paths and ordered individual targets for the resolved preview", () => {
    const entries = resolveWorkoutEntries(root, [child, parent, root]);
    expect(entries.map((entry) => entry.workoutPath)).toEqual([["Full"], ["Full", "Upper", "Push"]]);
    expect(entries.map((entry) => entry.item)).toEqual(resolveWorkout(root, [child, parent, root]));
    entries[1]!.item.plannedSets![0]!.weight = 99;
    entries[1]!.workoutPath[0] = "Changed";
    expect(child.items[0]?.plannedSets?.[0]?.weight).toBe(20);
    expect(root.name).toBe("Full");
  });
  it("accepts a reference-only routine while rejecting empty or repeated components", () => {
    expect(workoutInputSchema.safeParse(parent).success).toBe(true);
    expect(workoutInputSchema.safeParse({ ...parent, includedWorkoutIds: undefined }).success).toBe(false);
    expect(workoutInputSchema.safeParse({ ...parent, includedWorkoutIds: [child.id, child.id] }).success).toBe(false);
  });
  it("expands direct exercises followed by components and reflects new source targets", () => {
    expect(resolveWorkout(root, [child, parent, root]).map((item) => item.exerciseId)).toEqual(["squat", "bench"]);
    const updated = {
      ...child,
      items: [
        {
          ...child.items[0]!,
          reps: 6,
          weight: 50,
          plannedSets: [
            { reps: 10, weight: 25 },
            { reps: 6, weight: 50 },
          ],
        },
      ],
    };
    expect(resolveWorkout(parent, [updated, parent])[0]?.plannedSets).toEqual(updated.items[0]?.plannedSets);
  });
  it("leaves an already-started workout independent of later source edits", () => {
    const live = createLiveWorkout({ ...parent, items: resolveWorkout(parent, [child, parent]) }, [], Date.now());
    const expanded = resolveWorkout(parent, [child, parent]);
    expanded[0]!.plannedSets![0]!.weight = 99;
    expect(live.exercises[0]?.sets[0]?.weight).toBe(20);
    expect(child.items[0]?.plannedSets?.[0]?.weight).toBe(20);
  });
  it("rejects self-references, indirect cycles and missing components", () => {
    expect(() => resolveWorkout({ ...parent, includedWorkoutIds: [parent.id] }, [parent])).toThrow(/Circular/);
    const a = { ...parent, items: [], includedWorkoutIds: [root.id] };
    const b = { ...root, items: [], includedWorkoutIds: [parent.id] };
    expect(() => resolveWorkout(a, [a, b])).toThrow(/Circular/);
    expect(() => resolveWorkout(parent, [])).toThrow(/missing/);
  });
  it("rejects duplicate movements under current and retired exercise IDs", () => {
    const duplicate = { ...root, items: [{ ...child.items[0]!, exerciseId: "old-bench" }] };
    expect(() => resolveWorkout(duplicate, [child, parent], workoutIdentities(catalog))).toThrow(/Duplicate/);
    expect(() => resolveWorkout({ ...parent, includedWorkoutIds: [child.id, child.id] }, [child])).toThrow(/once/);
  });
  it("enforces expansion and depth bounds", () => {
    const tooLarge = {
      ...parent,
      includedWorkoutIds: undefined,
      items: Array.from({ length: 101 }, (_, index) => ({ ...child.items[0]!, exerciseId: String(index) })),
    };
    expect(() => resolveWorkout(tooLarge, [])).toThrow(/100/);
    const chain = Array.from({ length: 9 }, (_, index): Workout => ({
      ...parent,
      id: String(index),
      items: index === 8 ? child.items : [],
      ...(index < 8 ? { includedWorkoutIds: [String(index + 1)] } : { includedWorkoutIds: undefined }),
    }));
    expect(() => resolveWorkout(chain[0]!, chain)).toThrow(/eight/);
  });
  it("round trips reference-only parents, order and exact targets through CSV", () => {
    const records = [root, parent, child];
    const content = createTrainingCsv({ kind: "workouts", records, exercises: catalog });
    expect(readTrainingCsv(content, "workouts").input.records).toEqual(records);
    expect(reviewImport({ kind: "workouts", records }, [], catalog).every((row) => !row.blocked)).toBe(true);
  });
  it("blocks import reviews with missing components or cycles but accepts dependencies already saved", () => {
    expect(reviewImport({ kind: "workouts", records: [parent] }, [], catalog)[0]?.blocked).toBe(true);
    expect(reviewImport({ kind: "workouts", records: [parent] }, [child], catalog)[0]?.blocked).toBe(false);
    const circular = { ...parent, includedWorkoutIds: [parent.id] };
    expect(reviewImport({ kind: "workouts", records: [circular] }, [], catalog)[0]?.detail).toMatch(/Circular/);
  });
  it("rejects component rows with hidden numeric data or invalid positions", () => {
    const content = createTrainingCsv({ kind: "workouts", records: [parent], exercises: [] });
    expect(() =>
      readTrainingCsv(
        content.replace('"1","","","","","","","","workout_reference"', '"2","","","","","","","","workout_reference"'),
        "workouts",
      ),
    ).toThrow(/positions/);
    expect(() =>
      readTrainingCsv(content.replace('"","workout_reference"', '"8","workout_reference"'), "workouts"),
    ).toThrow(/conflicting/);
  });
});

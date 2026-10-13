import { describe, expect, it } from "vitest";
import { workoutItemSchema, type Exercise } from "../../../../shared/contracts";
import {
  composeWorkout,
  getPlannedSets,
  prescriptionToSession,
  withPlannedSets,
} from "../../../../shared/prescriptions";
import { createLiveWorkout } from "./live/live.utils";
import { createTrainingCsv } from "./export/exportCsv";
import { readTrainingCsv } from "./import/importCsv";
import { serializeImportedRecord } from "../../../../shared/importIdentity";
const exercise: Exercise = {
  id: "bench",
  name: "Bench press",
  level: "beginner",
  category: "strength",
  equipment: "barbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  images: [],
  legacyIds: ["old-bench"],
};
const item = {
  exerciseId: "bench",
  sets: 2,
  reps: 8,
  weight: 45,
  plannedSets: [
    { reps: 12, weight: 20 },
    { reps: 8, weight: 45 },
  ],
};
const workout = {
  id: "6bb6f3f5-6c48-47da-a2f0-d6427be73828",
  name: "Pyramid",
  notes: "",
  createdAt: "2026-10-13T12:00:00Z",
  items: [item],
};
describe("Individual prescription targets and composed routine snapshots", () => {
  it("rejects inconsistent summaries, out-of-bounds and empty target arrays", () => {
    expect(workoutItemSchema.safeParse(item).success).toBe(true);
    for (const invalid of [
      { ...item, sets: 3 },
      { ...item, weight: 20 },
      { ...item, plannedSets: [] },
      { ...item, plannedSets: [{ reps: -1, weight: 0 }] },
    ]) {
      expect(workoutItemSchema.safeParse(invalid).success).toBe(false);
    }
  });
  it("starts with the exact ordered targets and independent live set identities", () => {
    const live = createLiveWorkout(workout, [], Date.now());
    const sets = live.exercises[0]?.sets ?? [];
    expect(sets.map(({ reps, weight }) => ({ reps, weight }))).toEqual(item.plannedSets);
    expect(new Set(sets.map((set) => set.id)).size).toBe(2);
    expect(sets.every((set) => !set.isCompleted)).toBe(true);
    sets[0]!.weight = 99;
    expect(item.plannedSets[0]?.weight).toBe(20);
  });
  it("preserves every planned set through CSV and detects changed import identities", () => {
    const content = createTrainingCsv({ kind: "workouts", records: [workout], exercises: [exercise] });
    expect(readTrainingCsv(content, "workouts").input.records).toEqual([workout]);
    const altered = { ...workout, items: [{ ...item, plannedSets: [{ reps: 10, weight: 20 }, item.plannedSets[1]!] }] };
    expect(serializeImportedRecord(altered)).not.toBe(serializeImportedRecord(workout));
    expect(() => readTrainingCsv(content.replace('"planned_set"', '"performed"'), "workouts")).toThrow();
  });
  it("composes combined routines without canonical duplicates or shared nested references", () => {
    const duplicate = { ...item, exerciseId: "old-bench" };
    const result = composeWorkout([duplicate], [item, { ...item, exerciseId: "squat" }], [exercise]);
    expect(result.skipped).toBe(1);
    expect(result.items.map((entry) => entry.exerciseId)).toEqual(["old-bench", "squat"]);
    result.items[1]!.plannedSets![0]!.weight = 99;
    expect(item.plannedSets[0]?.weight).toBe(20);
    expect(composeWorkout([], result.items, [exercise]).items).toEqual(result.items);
  });
  it("enforces composition bounds without mutating the draft", () => {
    const current = Array.from({ length: 100 }, (_, index) => ({ ...item, exerciseId: String(index) }));
    expect(() => composeWorkout(current, [item], [])).toThrow(/100/);
    expect(current).toHaveLength(100);
  });
  it("retains exact targets for manually reviewed logs and maintains summaries when removing a set", () => {
    const completed = prescriptionToSession(item);
    expect(completed.performedSets?.map(({ reps, weight }) => ({ reps, weight }))).toEqual(item.plannedSets);
    const shortened = withPlannedSets(item, getPlannedSets(item).slice(0, 1));
    expect(shortened).toMatchObject({ sets: 1, reps: 12, weight: 20 });
    expect(workoutItemSchema.safeParse(shortened).success).toBe(true);
  });
});

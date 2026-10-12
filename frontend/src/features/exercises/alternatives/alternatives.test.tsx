import { describe, expect, it } from "vitest";
import type { Exercise } from "../../../../../shared/contracts";
import { findAlternatives, substituteDraftExercise } from "./alternatives.utils";
import { prepareCustomExerciseInput } from "../custom/customExerciseForm";
const exercise: Exercise = {
  id: "press",
  name: "Barbell press",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps"],
  equipment: "barbell",
  category: "strength",
  level: "beginner",
  instructions: [],
  images: [],
};
const sameEquipment = { ...exercise, id: "incline", name: "Incline press" };
const differentEquipment = { ...exercise, id: "pushup", name: "Pushup", equipment: "body only" };
describe("Related movement and substitution behavior", () => {
  it("requires listed primary muscle overlap and excludes the selected movement", () => {
    const secondaryOnly = { ...exercise, id: "squat", primaryMuscles: ["quadriceps"], secondaryMuscles: ["chest"] };
    expect(
      findAlternatives(exercise, [exercise, secondaryOnly, differentEquipment], []).map((entry) => entry.id),
    ).toEqual([differentEquipment.id]);
  });
  it("prefers matching equipment but respects equipment, name and already-selected filters", () => {
    expect(findAlternatives(exercise, [differentEquipment, sameEquipment], []).map((entry) => entry.id)).toEqual([
      sameEquipment.id,
      differentEquipment.id,
    ]);
    expect(findAlternatives(exercise, [differentEquipment, sameEquipment], [], "body only", "push")).toEqual([
      differentEquipment,
    ]);
    expect(
      findAlternatives(exercise, [differentEquipment, sameEquipment], [differentEquipment.id], "body only"),
    ).toEqual([]);
  });
  it("does not treat unspecified anatomy as a match", () => {
    const unknown = { ...exercise, primaryMuscles: ["unspecified"] };
    expect(findAlternatives(unknown, [{ ...unknown, id: "other" }], [])).toEqual([]);
  });
  it("keeps prescription counts and order, resets load, and does not mutate the original", () => {
    const original = [
      { exerciseId: "press", sets: 4, reps: 8, weight: 55 },
      { exerciseId: "row", sets: 3, reps: 10, weight: 40 },
    ];
    const result = substituteDraftExercise(original, "press", "pushup");
    expect(result).toEqual([{ exerciseId: "pushup", sets: 4, reps: 8, weight: 0 }, original[1]]);
    expect(original[0]?.weight).toBe(55);
    expect(original[0]?.exerciseId).toBe("press");
  });
  it("does not introduce a duplicate exercise or replace a missing draft identity", () => {
    const items = [
      { exerciseId: "press", sets: 3, reps: 10, weight: 40 },
      { exerciseId: "row", sets: 3, reps: 10, weight: 40 },
    ];
    expect(substituteDraftExercise(items, "press", "row")).toEqual(items);
    expect(substituteDraftExercise(items, "missing", "pushup")).toEqual(items);
  });
  it("normalizes owner-entered muscle groups and preserves separate instruction steps", () => {
    const input = prepareCustomExerciseInput({
      name: "My movement",
      level: "unspecified",
      equipment: "  Dumbbell ",
      category: "Strength",
      primaryMuscles: "Chest, chest, Triceps",
      secondaryMuscles: " ",
      instructions: " First step\n\n Second step ",
      imageUrl: "",
    });
    expect(input.primaryMuscles).toEqual(["chest", "triceps"]);
    expect(input.instructions).toEqual(["First step", "Second step"]);
    expect(input.equipment).toBe("dumbbell");
  });
});

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts";
import { matchesExerciseSearch, matchesExerciseFilters, EMPTY_EXERCISE_FILTERS } from "./exerciseSearch.utils";

describe("Requested names in the library and workout picker", () => {
  it.each([
    ["Standing Cable Pec fly", "Cable_Crossover"],
    ["Seated Single-Arm High Pulley Row", "wger:1637"],
    ["Cable rope face pulls", "Face_Pull"],
    ["Dumbbell Reverse lunge", "Dumbbell_Rear_Lunge"],
    ["Kettlebell single arm calf raise", "glow:kettlebell_calf_raise"],
    ["kettlebell lateral lunge", "guide:kettlebell-lateral-lunge"],
    ["Dumbbell Standing Single Arm Twisting Curl", "guide:dumbbell-standing-single-arm-twisting-curl"],
  ])("finds %s through its canonical record", async (query, id) => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const entry = catalog.find((exercise) => exercise.id === id)!;
    expect(matchesExerciseSearch(entry, query)).toBe(true);
    expect(matchesExerciseSearch(entry, query.split(" ").reverse().join(" "))).toBe(true);
    expect(entry.images.length).toBeGreaterThan(0);
    expect(entry.isArchived).toBeUndefined();
  });
  it("uses Biceps as a muscle filter rather than a placeholder exercise", async () => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const curl = catalog.find((exercise) => exercise.id === "guide:dumbbell-standing-single-arm-twisting-curl")!;
    expect(matchesExerciseFilters(curl, { ...EMPTY_EXERCISE_FILTERS, muscle: "biceps" })).toBe(true);
    expect(matchesExerciseSearch(curl, "Biceps")).toBe(true);
  });
});

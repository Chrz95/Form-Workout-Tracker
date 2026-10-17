import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { formatExerciseName } from "../../../../shared/exerciseNames.js";
import { getExerciseNameKey } from "../../../../shared/exerciseIdentity.js";
describe("Exercise name presentation", () => {
  it("capitalizes names and preserves equipment abbreviations, accents and punctuation", () => {
    expect(formatExerciseName("  dumbbell single leg calf raise ")).toBe("Dumbbell Single Leg Calf Raise");
    expect(formatExerciseName("bosu trx ez-bar rdl smr pvc")).toBe("BOSU TRX EZ-Bar RDL SMR PVC");
    expect(formatExerciseName("mcgill curl-up (45-degree)")).toBe("McGill Curl-Up (45-Degree)");
    expect(formatExerciseName("seated plié squat")).toBe("Seated Plié Squat");
  });
  it("preserves every public movement's canonical name identity while correcting display casing", async () => {
    for (const path of ["shared/exercises.json", "shared/archivedExercises.json", "shared/retiredExercises.json"]) {
      const catalog = JSON.parse(await readFile(path, "utf8"));
      for (const exercise of catalog) {
        expect(getExerciseNameKey(formatExerciseName(exercise.name))).toBe(getExerciseNameKey(exercise.name));
      }
    }
  });
});

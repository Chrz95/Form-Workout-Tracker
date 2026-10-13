import { describe, expect, it } from "vitest";
import { monthDays, shiftMonth, localDateKey } from "./calendar.utils";
import { getExerciseNameKey, matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { buildProgressPoints } from "../training/progress/progress.utils";
import { findPreviousPerformance } from "../training/live/live.utils";
describe("Calendar dates and canonical exercise identity", () => {
  it("shows Monday-start leap-year February without month-end overflow", () => {
    const days = monthDays(new Date(2024, 1, 29, 12));
    expect(days).toHaveLength(42);
    expect(days[0]?.date).toBe("2024-01-29");
    expect(days.filter((day) => day.isCurrentMonth)).toHaveLength(29);
    expect(localDateKey(shiftMonth(new Date(2024, 0, 31, 12), 1))).toBe("2024-02-01");
  });
  it("moves across year boundaries with local calendar dates", () => {
    expect(localDateKey(shiftMonth(new Date(2026, 11, 31, 12), 1))).toBe("2027-01-01");
    expect(localDateKey(shiftMonth(new Date(2026, 0, 1, 12), -1))).toBe("2025-12-01");
  });
  it.each([
    ["Dumbbell Bicep Curl", "Biceps Curls With Dumbbells"],
    ["Pullups", "Pull-Up"],
    ["One-Arm Cable Row", "Cable Single Arm Rows"],
    ["Barbell Shoulder Press", "Shoulder Press, Barbell"],
  ])("recognizes equivalent named movement %s / %s", (first, second) => {
    expect(getExerciseNameKey(first)).toBe(getExerciseNameKey(second));
  });
  it.each([
    ["Incline Dumbbell Press", "Flat Dumbbell Press"],
    ["Wide Grip Pull Up", "Close Grip Pull Up"],
    ["Squat to Lunge", "Lunge to Squat"],
    ["Single Leg Calf Raise on a Dumbbell", "Dumbbell Single Leg Calf Raise"],
  ])("preserves distinct positioning or sequence %s / %s", (first, second) => {
    expect(getExerciseNameKey(first)).not.toBe(getExerciseNameKey(second));
  });
  it("keeps retired identities usable without mutating actual history", () => {
    const exercise = {
      id: "canonical",
      name: "Press",
      legacyIds: ["retired"],
      level: "beginner",
      equipment: "barbell",
      category: "strength",
      images: [],
      primaryMuscles: ["chest"],
      secondaryMuscles: [],
      instructions: [],
    };
    const session = {
      id: "saved",
      name: "Workout",
      date: "2026-10-12",
      createdAt: "2026-10-12T12:00:00Z",
      duration: 30,
      notes: "",
      items: [{ exerciseId: "retired", sets: 3, reps: 10, weight: 40 }],
    };
    expect(matchesExerciseId(exercise, "retired")).toBe(true);
    expect(buildProgressPoints([session], "canonical", exercise.legacyIds)[0]?.volume).toBe(1200);
    expect(findPreviousPerformance([session], "canonical", exercise.legacyIds)?.item.exerciseId).toBe("retired");
    expect(session.items[0]?.exerciseId).toBe("retired");
  });
});

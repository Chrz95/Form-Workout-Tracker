import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { Exercise } from "../../../../shared/contracts";
import { matchesExerciseSearch } from "./exerciseSearch.utils";
import { useCatalog } from "./useCatalog";
const exercise: Exercise = {
  id: "press",
  name: "Incline Dumbbell Bench Press",
  level: "beginner",
  equipment: "dumbbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  category: "strength",
  instructions: [],
  images: [],
  aliases: ["Élevated DB-Press"],
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Exercise search words", () => {
  it("matches reordered words, aliases, case, accents and punctuation while requiring every term", () => {
    for (const query of [
      "press incline dumbbell",
      "  PRESS   bench ",
      "DB elevated",
      "db-press",
      "chest incline",
      "",
    ]) {
      expect(matchesExerciseSearch(exercise, query)).toBe(true);
    }
    expect(matchesExerciseSearch(exercise, "incline squat")).toBe(false);
    expect(matchesExerciseSearch(exercise, "unrelated")).toBe(false);
  });
  it("uses unordered matching in the main library as well as its independent equipment filter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([exercise]))),
    );
    const { result } = renderHook(() => useCatalog([]));
    await waitFor(() => expect(result.current.exercises).toHaveLength(1));
    act(() => result.current.setSearch("press incline dumbbell"));
    expect(result.current.filteredExercises).toHaveLength(1);
    act(() => result.current.setEquipment("barbell"));
    expect(result.current.filteredExercises).toHaveLength(0);
  });
});

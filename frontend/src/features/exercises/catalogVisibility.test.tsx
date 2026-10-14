import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import type { Exercise } from "../../../../shared/contracts";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { useCatalog } from "./useCatalog";
const visible: Exercise = {
  id: "press",
  name: "Press",
  level: "beginner",
  equipment: "barbell",
  category: "strength",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: ["Press under control."],
  images: ["/press.webp"],
  legacyIds: ["old-press"],
};
const archived: Exercise = {
  ...visible,
  id: "archived-row",
  name: "Historical Row",
  equipment: "historic handle",
  images: [],
  legacyIds: ["old-row"],
  isArchived: true,
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Illustrated discovery and historical exercise references", () => {
  it("loads historical metadata without exposing its cards, filters or count", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string) => new Response(JSON.stringify(path === "/exercises.json" ? [visible] : [archived]))),
    );
    const { result } = renderHook(() => useCatalog([]));
    await waitFor(() => expect(result.current.exercises).toHaveLength(2));
    expect(result.current.discoverableExercises).toEqual([visible]);
    expect(result.current.filteredExercises).toEqual([visible]);
    expect(result.current.equipmentOptions).not.toContain("historic handle");
    expect(result.current.exercises.find((record) => matchesExerciseId(record, "old-row"))).toEqual(archived);
  });
  it("reports a compatibility-fetch failure instead of silently losing saved exercise metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (path: string) =>
          new Response(JSON.stringify([visible]), { status: path === "/exercises.json" ? 200 : 503 }),
      ),
    );
    const { result } = renderHook(() => useCatalog([]));
    await waitFor(() => expect(result.current.catalogError).toContain("could not be loaded"));
    expect(result.current.exercises).toEqual([]);
  });
});

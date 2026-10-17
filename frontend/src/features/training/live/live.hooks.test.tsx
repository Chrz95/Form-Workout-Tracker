import type { LiveDependencies } from "./live.types";
import { afterEach, describe, it, expect, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useRestTimer } from "./useRestTimer";
import { useLiveWorkout } from "./useLiveWorkout";
import { LIVE_PHASE } from "./live.constants";
const prescription = {
  name: "Current workout",
  notes: "",
  items: [{ exerciseId: "Pushups", sets: 3, reps: 10, weight: 0 }],
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("Live workout timing and recovery", () => {
  it("replicates only the first set's reps/load to unfinished sets and allows later overrides", () => {
    const { result } = renderHook(() =>
      useLiveWorkout({ sessions: [], isPending: false, apiError: "", persistSession: async () => true }),
    );
    act(() => result.current.startWorkout(prescription));
    const sets = result.current.workout!.exercises[0]!.sets;
    act(() => result.current.updateSet("Pushups", sets[0]!.localId, "weight", 25));
    expect(result.current.workout!.exercises[0]!.sets.map((set) => set.weight)).toEqual([25, 25, 25]);
    act(() => result.current.updateSet("Pushups", sets[1]!.localId, "weight", 30));
    act(() => result.current.toggleSet("Pushups", sets[1]!.localId));
    act(() => result.current.updateSet("Pushups", sets[0]!.localId, "weight", 35));
    expect(result.current.workout!.exercises[0]!.sets.map((set) => set.weight)).toEqual([35, 30, 35]);
    act(() => result.current.updateSet("Pushups", sets[0]!.localId, "reps", 8));
    expect(result.current.workout!.exercises[0]!.sets.map((set) => set.reps)).toEqual([8, 10, 8]);
    act(() => result.current.updateSet("Pushups", sets[0]!.localId, "rpe", 7));
    expect(result.current.workout!.exercises[0]!.sets.map((set) => set.rpe)).toEqual([7, null, null]);
    expect(prescription.items[0]!.weight).toBe(0);
  });
  it("starts accurately after a long idle period and preserves paused time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-12T12:00:00Z"));
    const { result } = renderHook(() => useRestTimer());
    act(() => {
      vi.advanceTimersByTime(3600000);
      result.current.startRest();
    });
    expect(result.current.remaining).toBe(90);
    act(() => vi.advanceTimersByTime(30000));
    expect(result.current.remaining).toBe(60);
    act(() => result.current.pauseRest());
    act(() => vi.advanceTimersByTime(120000));
    expect(result.current.remaining).toBe(60);
    act(() => result.current.resumeRest());
    act(() => vi.advanceTimersByTime(60000));
    expect(result.current.isFinished).toBe(true);
  });
  it("catches up after the clock advances without interval callbacks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-12T12:00:00Z"));
    const { result } = renderHook(() => useRestTimer());
    act(() => result.current.startRest());
    act(() => {
      vi.setSystemTime(new Date("2026-10-12T12:03:00Z"));
      vi.advanceTimersByTime(500);
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isFinished).toBe(true);
  });
  it("copies a routine note, saves session edits, and keeps the source routine unchanged", async () => {
    const source = { ...prescription, items: [{ ...prescription.items[0]!, notes: "Rest 90 seconds" }] };
    const persistSession = vi.fn(async (_completion: Parameters<LiveDependencies["persistSession"]>[0]) => true);
    const { result } = renderHook(() =>
      useLiveWorkout({ sessions: [], isPending: false, apiError: "", persistSession }),
    );
    act(() => result.current.startWorkout(source));
    expect(result.current.workout?.exercises[0]?.notes).toBe("Rest 90 seconds");
    act(() => result.current.updateExerciseNote("Pushups", "Felt easier today\nTry more reps next time"));
    const row = result.current.workout!.exercises[0]!.sets[0]!;
    act(() => result.current.toggleSet("Pushups", row.localId));
    act(() => result.current.finishWorkout());
    await act(() => result.current.saveCompletion());
    expect(persistSession.mock.calls[0]?.[0].items[0]?.notes).toBe("Felt easier today\nTry more reps next time");
    expect(source.items[0]?.notes).toBe("Rest 90 seconds");
  });
  it("keeps completed sets and review state after a failed save", async () => {
    const persistSession = vi.fn(async (_completion: Parameters<LiveDependencies["persistSession"]>[0]) => false);
    const { result } = renderHook(() =>
      useLiveWorkout({ sessions: [], isPending: false, apiError: "", persistSession }),
    );
    act(() => result.current.startWorkout(prescription));
    const row = result.current.workout?.exercises[0]?.sets[0];
    if (!row) {
      throw new Error("Missing live set");
    }
    act(() => result.current.toggleSet("Pushups", row.localId));
    act(() => result.current.finishWorkout());
    await act(() => result.current.saveCompletion());
    expect(result.current.workout?.phase).toBe(LIVE_PHASE.review);
    expect(result.current.workout?.exercises[0]?.sets[0]?.isCompleted).toBe(true);
    expect(persistSession.mock.calls[0]?.[0]?.items[0]?.sets).toBe(1);
  });
  it("does not complete invalid set values or finish an empty session", () => {
    const { result } = renderHook(() =>
      useLiveWorkout({ sessions: [], isPending: false, apiError: "", persistSession: async () => true }),
    );
    act(() => result.current.startWorkout(prescription));
    act(() => result.current.finishWorkout());
    expect(result.current.error).toContain("Complete at least one set");
    const row = result.current.workout?.exercises[0]?.sets[0];
    if (!row) {
      throw new Error("Missing set");
    }
    act(() => result.current.updateSet("Pushups", row.localId, "reps", 0));
    act(() => result.current.toggleSet("Pushups", row.localId));
    expect(result.current.workout?.exercises[0]?.sets[0]?.isCompleted).toBe(false);
    expect(result.current.error).toContain("Check reps");
  });
  it("shows success only after persistence confirms the completion", async () => {
    const { result } = renderHook(() =>
      useLiveWorkout({ sessions: [], isPending: false, apiError: "", persistSession: async () => true }),
    );
    act(() => result.current.startWorkout(prescription));
    const row = result.current.workout?.exercises[0]?.sets[0];
    if (!row) {
      throw new Error("Missing set");
    }
    act(() => result.current.toggleSet("Pushups", row.localId));
    act(() => result.current.finishWorkout());
    await act(() => result.current.saveCompletion());
    expect(result.current.workout?.phase).toBe(LIVE_PHASE.saved);
  });
});

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

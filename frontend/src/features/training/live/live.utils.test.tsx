import { describe, it, expect } from "vitest";
import { sessionInputSchema, type Session } from "../../../../../shared/contracts";
import { SET_KIND } from "../../../../../shared/setContracts";
import { createLiveWorkout, prepareSession, findPreviousPerformance, getPreviousSet } from "./live.utils";
import { buildProgressPoints } from "../progress/progress.utils";
import { buildChartGeometry } from "../progress/chart.utils";
const firstSetId = "b6f6e7a2-4216-4d03-b3dc-9bcd2a1e582c";
const secondSetId = "c3a415ca-3093-4885-95fb-e756c78c3f9b";
const warmupSetId = "021ce4d0-11a7-4f4e-bf75-9038b8142897";
const prescription = { name: "Push day", notes: "", items: [{ exerciseId: "Pushups", sets: 3, reps: 10, weight: 0 }] };
const session: Session = {
  id: "7c4f72b7-0114-4e9d-9b44-f45d9e23ff0b",
  createdAt: "2026-10-10T12:00:00.000Z",
  date: "2026-10-10",
  name: "Strength",
  notes: "",
  duration: 35,
  items: [
    {
      exerciseId: "Pushups",
      sets: 3,
      reps: 8,
      weight: 45,
      performedSets: [
        { id: warmupSetId, kind: SET_KIND.warmup, reps: 12, weight: 100, rpe: null },
        { id: firstSetId, kind: SET_KIND.working, reps: 10, weight: 40, rpe: 7 },
        { id: secondSetId, kind: SET_KIND.working, reps: 8, weight: 45, rpe: 8 },
      ],
    },
  ],
};
describe("Actual set contracts and historical calculations", () => {
  it("submits checked sets only with a stable retry identifier", () => {
    const workout = createLiveWorkout(prescription, [], Date.parse("2026-10-12T12:00:00Z"));
    const [exercise] = workout.exercises;
    if (!exercise) {
      throw new Error("Missing movement");
    }
    const [first, second] = exercise.sets;
    if (!first || !second) {
      throw new Error("Missing set");
    }
    first.isCompleted = true;
    first.weight = 40;
    first.reps = 10;
    second.isCompleted = true;
    second.weight = 45;
    second.reps = 8;
    const input = prepareSession(workout);
    expect(input.items).toHaveLength(1);
    expect(input.items[0]?.sets).toBe(2);
    expect(input.items[0]?.performedSets?.map((set) => set.weight)).toEqual([40, 45]);
    expect(prepareSession(workout).submissionId).toBe(input.submissionId);
    expect(sessionInputSchema.safeParse(input).success).toBe(true);
  });
  it("rejects inconsistent aggregates and invalid effort values", () => {
    const [item] = session.items;
    expect(sessionInputSchema.safeParse({ ...session, items: [{ ...item, sets: 8 }] }).success).toBe(false);
    expect(
      sessionInputSchema.safeParse({
        ...session,
        items: [{ ...item, performedSets: [{ id: firstSetId, reps: 8, weight: 45, rpe: 11, kind: SET_KIND.working }] }],
      }).success,
    ).toBe(false);
  });
  it("uses the training date before creation time for previous performance", () => {
    const backdated: Session = { ...session, date: "2026-10-09", createdAt: "2026-10-12T15:00:00.000Z" };
    expect(findPreviousPerformance([backdated, session], "Pushups")?.date).toBe("2026-10-10");
  });
  it("matches previous sets by type without a warm-up shifting working values", () => {
    const workout = createLiveWorkout(prescription, [session], Date.parse("2026-10-12T12:00:00Z"));
    const [exercise] = workout.exercises;
    const [first] = exercise?.sets ?? [];
    if (!exercise || !first) {
      throw new Error("Missing set");
    }
    expect(getPreviousSet(exercise.sets, first.localId, exercise.previous?.item)?.weight).toBe(40);
  });
  it("excludes warm-ups from working records and volume", () => {
    const [point] = buildProgressPoints([session], "Pushups");
    expect(point).toMatchObject({ weight: 45, reps: 10, volume: 760, workingSets: 2, isLegacy: false });
  });
  it("keeps legacy uniform records comparable without mutating them", () => {
    const legacy: Session = { ...session, items: [{ exerciseId: "Pushups", sets: 3, reps: 8, weight: 20 }] };
    expect(buildProgressPoints([legacy], "Pushups")[0]).toMatchObject({ volume: 480, workingSets: 3, isLegacy: true });
    expect(legacy.items[0]?.performedSets).toBeUndefined();
  });
  it("handles a single zero-load chart without invalid geometry", () => {
    const zeroLoad: Session = { ...session, items: [{ exerciseId: "Pushups", sets: 3, reps: 10, weight: 0 }] };
    const chart = buildChartGeometry(buildProgressPoints([zeroLoad], "Pushups"), "weight");
    expect(Number.isFinite(chart.plotted[0]?.horizontal)).toBe(true);
    expect(Number.isFinite(chart.plotted[0]?.vertical)).toBe(true);
  });
});

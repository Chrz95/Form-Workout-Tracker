import { describe, expect, it } from "vitest";
import type { Exercise, Session, Workout } from "../../../../../shared/contracts";
import { createTrainingCsv, escapeCsvCell } from "./exportCsv";
const exercise: Exercise = {
  id: "bench",
  name: "Bench, press",
  level: "beginner",
  equipment: "barbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  category: "strength",
  images: [],
};
const workout: Workout = {
  id: "6bb6f3f5-6c48-47da-a2f0-d6427be73828",
  name: "Upper body",
  notes: 'Control the "descent"\nRest, then repeat.',
  createdAt: "2026-10-12T12:00:00Z",
  items: [{ exerciseId: "bench", sets: 3, reps: 10, weight: 40 }],
};
const session: Session = {
  ...workout,
  date: "2026-10-12",
  duration: 35,
  items: [
    {
      exerciseId: "bench",
      sets: 2,
      reps: 8,
      weight: 45,
      performedSets: [
        { id: "6bb6f3f5-6c48-47da-a2f0-d6427be73829", reps: 10, weight: 40, rpe: null, kind: "warmup" },
        { id: "6bb6f3f5-6c48-47da-a2f0-d6427be73830", reps: 8, weight: 45, rpe: 8, kind: "working" },
      ],
    },
  ],
};
describe("Saved training CSV exports", () => {
  it("keeps quoted notes, commas, newlines and Unicode readable in a CSV cell", () => {
    expect(escapeCsvCell('Élan, "steady"\ncontrol')).toBe('"Élan, ""steady""\ncontrol"');
  });
  it.each(['=HYPERLINK("https://example.com")', "+formula", "-formula", "@SUM(A1)", "  =formula", "\t=1", "\n=1"])(
    "neutralizes untrusted spreadsheet formula text %s",
    (value) => {
      expect(escapeCsvCell(value)).toBe(`"'${value.replaceAll('"', '""')}"`);
    },
  );
  it("keeps numeric training values numeric in spreadsheet exports", () => {
    expect(escapeCsvCell(42.5)).toBe('"42.5"');
    expect(escapeCsvCell(0)).toBe('"0"');
  });
  it("exports prescriptions with readable exercise names and no fabricated set identities", () => {
    const csv = createTrainingCsv({ kind: "workouts", records: [workout], exercises: [exercise] });
    expect(csv.startsWith('\uFEFF"record_type","record_id"')).toBe(true);
    expect(csv).toContain('"Bench, press","1","","","","3","10","40","","prescribed"');
    expect(csv).toContain('"Control the ""descent""\nRest, then repeat."');
    expect(csv.endsWith("\r\n")).toBe(true);
  });
  it("retains actual set order, identities, warmup classification, weights and nullable effort", () => {
    const csv = createTrainingCsv({ kind: "sessions", records: [{ ...session, notes: "" }], exercises: [exercise] });
    const rows = csv.trimEnd().split("\r\n");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain('"1","6bb6f3f5-6c48-47da-a2f0-d6427be73829","warmup","1","10","40","","performed"');
    expect(rows[2]).toContain('"2","6bb6f3f5-6c48-47da-a2f0-d6427be73830","working","1","8","45","8","performed"');
    expect(rows[1]).toContain('"2026-10-12","35"');
  });
  it("labels old uniform entries instead of representing them as individually recorded sets", () => {
    const csv = createTrainingCsv({
      kind: "sessions",
      records: [{ ...session, items: workout.items }],
      exercises: [],
    });
    expect(csv).toContain('"bench","bench","1","","","","3","10","40","","legacy_uniform"');
    expect(csv).not.toContain('"performed"');
  });
  it("exports only the provided selection and creates only headers for no saved records", () => {
    const csv = createTrainingCsv({ kind: "sessions", records: [], exercises: [exercise] });
    expect(csv.trimEnd().split("\r\n")).toHaveLength(1);
    expect(csv).not.toContain(session.id);
  });
  it("protects record names and notes when exporting full records", () => {
    const csv = createTrainingCsv({
      kind: "workouts",
      records: [{ ...workout, name: "=1+1", notes: " @SUM(A1)" }],
      exercises: [],
    });
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"\' @SUM(A1)"');
  });
});

import { describe, expect, it } from "vitest";
import type { Workout, Session, Exercise } from "../../../../../shared/contracts";
import { importInputSchema, IMPORT_LIMITS } from "../../../../../shared/importContracts";
import { LEGACY_CSV_COLUMNS, ENCODED_CSV_COLUMNS } from "../export/export.constants";
import { createTrainingCsv } from "../export/exportCsv";
import { parseCsv } from "./parseCsv";
import { readTrainingCsv } from "./importCsv";
import { reviewImport } from "./reviewImportRecords";
const workout: Workout = {
  id: "6bb6f3f5-6c48-47da-a2f0-d6427be73828",
  name: "Upper, body",
  notes: 'Control the "descent"\nRest, then repeat.',
  createdAt: "2026-10-12T12:00:00Z",
  items: [{ exerciseId: "bench", sets: 3, reps: 10, weight: 40.5 }],
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
const exercise: Exercise = {
  id: "bench",
  name: "Bench press",
  level: "beginner",
  category: "strength",
  equipment: "barbell",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: [],
  images: [],
  legacyIds: ["old-bench"],
};
/** Generates a transfer with no dependence on live browser downloads.
 * @param {Workout[]} [records] - Fixture routines.
 * @returns {string} Current Form export.
 */
function csv(records = [workout]): string {
  return createTrainingCsv({ kind: "workouts", records, exercises: [exercise] });
}
describe("Reviewed training CSV import", () => {
  it("round trips commas, quoted newlines, decimal weights, IDs and timestamps", () => {
    expect(readTrainingCsv(csv(), "workouts").input).toEqual({ kind: "workouts", records: [workout] });
  });
  it.each(["=1+1", "'literal", "'=literal", "''two", " @SUM(A1)", "\tstart", "Élan"])(
    "round trips spreadsheet guards and literal apostrophes in %s",
    (text) => {
      const record = { ...workout, name: text.startsWith("\t") ? "Name" : text.trim(), notes: text };
      expect(readTrainingCsv(csv([record]), "workouts").input.records[0]).toEqual(record);
    },
  );
  it("retains actual set identities, warmups, effort and aggregate summaries", () => {
    const content = createTrainingCsv({ kind: "sessions", records: [session], exercises: [exercise] });
    expect(readTrainingCsv(content, "sessions").input).toEqual({ kind: "sessions", records: [session] });
  });
  it("preserves legacy uniform sessions without inventing sets", () => {
    const record = { ...session, items: workout.items };
    const content = createTrainingCsv({ kind: "sessions", records: [record], exercises: [] });
    expect(readTrainingCsv(content, "sessions").input.records[0]).toEqual(record);
  });
  it("accepts old headers while retaining ambiguous spreadsheet apostrophes literally", () => {
    const legacy = parseCsv(csv([{ ...workout, name: "=1" }]))
      .map((row) =>
        row
          .slice(0, LEGACY_CSV_COLUMNS.length)
          .map((cell) => `"${cell.replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    const result = readTrainingCsv(legacy, "workouts");
    expect(result.legacyText).toBe(true);
    expect(result.input.records[0]?.name).toBe("'=1");
  });
  it("accepts earlier encoded exports without exercise notes", () => {
    const previous = parseCsv(csv())
      .map((row) =>
        row
          .slice(0, ENCODED_CSV_COLUMNS.length)
          .map((cell) => `"${cell.replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    expect(readTrainingCsv(previous, "workouts").input.records).toEqual([workout]);
  });
  it.each(["", 'a,"unfinished', '"closed"junk,b', 'a"quote,b'])("rejects malformed CSV %s", (text) => {
    expect(() => readTrainingCsv(text, "workouts")).toThrow();
  });
  it("rejects headers, wrong collection, empty files and extra columns", () => {
    expect(() => readTrainingCsv(csv().replace("record_type", "type"), "workouts")).toThrow();
    expect(() => readTrainingCsv(csv(), "sessions")).toThrow();
    expect(() => readTrainingCsv(csv([]), "workouts")).toThrow();
    expect(() => readTrainingCsv(csv().replace('"prescribed",', '"prescribed","extra",'), "workouts")).toThrow();
  });
  it("rejects repeated rows, invalid numeric cells, metadata disagreement and gaps", () => {
    expect(() => readTrainingCsv(csv([workout, workout]), "workouts")).toThrow();
    expect(() => readTrainingCsv(csv().replace('"40.5"', '""'), "workouts")).toThrow();
    expect(() => readTrainingCsv(csv().replace('"1","","",""', '"2","","",""'), "workouts")).toThrow();
    const content = createTrainingCsv({ kind: "sessions", records: [session], exercises: [] });
    expect(() => readTrainingCsv(content.replace('"2","6bb6f3', '"1","6bb6f3'), "sessions")).toThrow();
    expect(() => readTrainingCsv(content.replace('"Upper, body"', '"Different"'), "sessions")).toThrow();
  });
  it("bounds file size, records and set identities across sessions", () => {
    expect(() => parseCsv("a".repeat(IMPORT_LIMITS.fileBytes + 1))).toThrow();
    expect(importInputSchema.safeParse({ kind: "workouts", records: Array(51).fill(workout) }).success).toBe(false);
    expect(
      importInputSchema.safeParse({
        kind: "sessions",
        records: [session, { ...session, id: "6bb6f3f5-6c48-47da-a2f0-d6427be73831" }],
      }).success,
    ).toBe(false);
  });
  it("reviews unchanged IDs, changed values, unknown IDs and duplicate aliases", () => {
    const input = { kind: "workouts" as const, records: [workout] };
    expect(reviewImport(input, [workout], [exercise])[0]?.detail).toContain("skipped");
    expect(reviewImport(input, [{ ...workout, notes: "Changed" }], [exercise])[0]?.blocked).toBe(true);
    expect(reviewImport(input, [], [])[0]?.blocked).toBe(true);
    expect(
      reviewImport(
        {
          ...input,
          records: [{ ...workout, items: [...workout.items, { ...workout.items[0]!, exerciseId: "old-bench" }] }],
        },
        [],
        [exercise],
      )[0]?.blocked,
    ).toBe(true);
  });
  it("rejects unknown JSON fields and imported completion retry tokens", () => {
    expect(importInputSchema.safeParse({ kind: "workouts", records: [workout], overwrite: true }).success).toBe(false);
    expect(
      importInputSchema.safeParse({ kind: "sessions", records: [{ ...session, submissionId: workout.id }] }).success,
    ).toBe(false);
  });
});

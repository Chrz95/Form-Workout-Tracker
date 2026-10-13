import { z } from "zod";
import { performedSetSchema } from "../../../../../shared/setContracts";
import { workoutItemSchema, type WorkoutItem, type SessionItem } from "../../../../../shared/contracts";
import { CSV_RECORD, type LEGACY_CSV_COLUMNS } from "../export/export.constants";
/** Named cells prevent positional assumptions spreading through validation code. */
export type ImportColumn = (typeof LEGACY_CSV_COLUMNS)[number];
/** Every validated data row has all fixed columns. */
export type ImportRow = Record<ImportColumn, string> & { text_encoding?: string };
const numberSchema = z
  .string()
  .regex(/^\d+(?:\.\d+)?$/, "Use plain nonnegative numeric values.")
  .transform(Number);
/** Requires explicit numeric input rather than coercing an empty field into zero.
 * @param {string} value - CSV numeric cell.
 * @returns {number} Parsed finite number.
 */
export function csvNumber(value: string): number {
  return numberSchema.parse(value);
}
/** Requires irrelevant cells to be empty so conflicting data is never discarded.
 * @param {ImportRow} row - Data row.
 * @param {string[]} fields - Inapplicable fields.
 * @returns {void} Throws on any nonempty inapplicable field.
 */
export function requireEmpty(row: ImportRow, fields: ImportColumn[]): void {
  if (fields.some((field) => row[field] !== "")) {
    throw new Error("The CSV contains conflicting set or session fields.");
  }
}
/** Builds one prescription or ordered real-set sequence from matching exercise rows.
 * @param {ImportRow[]} rows - Rows for a single exercise position.
 * @param {"workouts" | "sessions"} kind - Selected collection.
 * @returns {SessionItem} An exercise retaining the original set representation.
 */
export function itemFromRows(rows: ImportRow[], kind: "workouts" | "sessions"): SessionItem | WorkoutItem {
  const [first] = rows;
  if (!first || rows.some((row) => row.exercise_id !== first.exercise_id || row.source !== first.source)) {
    throw new Error("Each exercise position must contain one identity and one source type.");
  }
  if (first.source === CSV_RECORD.planned && kind === "workouts") {
    const ordered = [...rows].sort((a, b) => csvNumber(a.set_position) - csvNumber(b.set_position));
    const plannedSets = ordered.map((row, index) => {
      requireEmpty(row, ["set_id", "set_kind", "rpe"]);
      if (csvNumber(row.set_position) !== index + 1 || csvNumber(row.set_count) !== 1) {
        throw new Error("Planned set positions must be consecutive and unique, with set_count 1.");
      }
      return { reps: csvNumber(row.reps), weight: csvNumber(row.weight_kg) };
    });
    const last = plannedSets.at(-1);
    return workoutItemSchema.parse({ exerciseId: first.exercise_id, sets: plannedSets.length, ...last, plannedSets });
  }
  if (first.source === CSV_RECORD.performed && kind === "sessions") {
    const ordered = [...rows].sort(
      (firstRow, secondRow) => csvNumber(firstRow.set_position) - csvNumber(secondRow.set_position),
    );
    const performedSets = ordered.map((row, index) => {
      if (csvNumber(row.set_position) !== index + 1 || csvNumber(row.set_count) !== 1) {
        throw new Error("Actual set positions must be consecutive and unique, with set_count 1.");
      }
      return performedSetSchema.parse({
        id: row.set_id,
        kind: row.set_kind,
        reps: csvNumber(row.reps),
        weight: csvNumber(row.weight_kg),
        rpe: row.rpe === "" ? null : csvNumber(row.rpe),
      });
    });
    const last = performedSets.at(-1);
    if (!last) {
      throw new Error("An actual exercise needs at least one set.");
    }
    return {
      exerciseId: first.exercise_id,
      sets: performedSets.length,
      reps: last.reps,
      weight: last.weight,
      performedSets,
    };
  }
  if (rows.length !== 1 || first.source !== (kind === "workouts" ? CSV_RECORD.prescribed : CSV_RECORD.uniform)) {
    throw new Error("Prescription and legacy uniform exercises must each occupy exactly one row.");
  }
  requireEmpty(first, ["set_position", "set_id", "set_kind", "rpe"]);
  return {
    exerciseId: first.exercise_id,
    sets: csvNumber(first.set_count),
    reps: csvNumber(first.reps),
    weight: csvNumber(first.weight_kg),
  };
}

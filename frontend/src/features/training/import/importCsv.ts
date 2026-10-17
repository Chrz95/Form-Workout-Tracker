import { importInputSchema } from "../../../../../shared/importContracts";
import {
  CSV_COLUMNS,
  ENCODED_CSV_COLUMNS,
  LEGACY_CSV_COLUMNS,
  CSV_RECORD,
  CSV_TEXT_ENCODING,
} from "../export/export.constants";
import { parseCsv } from "./parseCsv";
import { itemFromRows, csvNumber, requireEmpty, type ImportRow } from "./importRows";
const RECORD_METADATA = ["name", "date", "duration_minutes", "notes", "created_at"] as const;
/** Produces a record only when every repeated metadata cell agrees.
 * @param {ImportRow[]} rows - Rows sharing a record ID.
 * @param {"workouts" | "sessions"} kind - Selected collection.
 * @returns {object} Record ready for shared contract validation.
 */
function recordFromRows(rows: ImportRow[], kind: "workouts" | "sessions") {
  const [first] = rows;
  if (!first || rows.some((row) => RECORD_METADATA.some((field) => row[field] !== first[field]))) {
    throw new Error("Repeated record metadata must agree on every row.");
  }
  const referenceRows = rows.filter((row) => row.source === CSV_RECORD.reference);
  if (kind === "sessions" && referenceRows.length) {
    throw new Error("Sessions cannot contain workout references.");
  }
  const includedWorkoutIds = referenceRows
    .sort((a, b) => csvNumber(a.exercise_position) - csvNumber(b.exercise_position))
    .map((row, index) => {
      if (row.exercise_notes) {
        throw new Error("Workout references cannot contain exercise notes.");
      }
      requireEmpty(row, ["set_position", "set_id", "set_kind", "set_count", "reps", "weight_kg", "rpe"]);
      if (csvNumber(row.exercise_position) !== index + 1) {
        throw new Error("Component positions must be consecutive.");
      }
      return row.exercise_id;
    });
  const positions = new Map<number, ImportRow[]>();
  for (const row of rows.filter((entry) => entry.source !== CSV_RECORD.reference)) {
    const position = csvNumber(row.exercise_position);
    positions.set(position, [...(positions.get(position) ?? []), row]);
  }
  const items = [...positions.entries()]
    .sort(([firstPosition], [secondPosition]) => firstPosition - secondPosition)
    .map(([position, group], index) => {
      if (position !== index + 1) {
        throw new Error("Exercise positions must start at 1 and be consecutive.");
      }
      return itemFromRows(group, kind);
    });
  if (kind === "workouts") {
    requireEmpty(first, ["date", "duration_minutes"]);
  }
  return {
    id: first.record_id,
    name: first.name,
    notes: first.notes,
    createdAt: first.created_at,
    items,
    ...(includedWorkoutIds.length ? { includedWorkoutIds } : {}),
    ...(kind === "sessions" ? { date: first.date, duration: csvNumber(first.duration_minutes) } : {}),
  };
}
/** Validates the Form export format before a review is offered; legacy formula guards stay literal.
 * @param {string} content - File content.
 * @param {"workouts" | "sessions"} kind - Destination collection.
 * @returns {{input: ImportInput, legacyText: boolean}} Validated batch and text compatibility notice.
 */
export function readTrainingCsv(content: string, kind: "workouts" | "sessions") {
  const [header, ...rows] = parseCsv(content);
  if (!header) {
    throw new Error("This CSV file is empty.");
  }
  const legacyText = JSON.stringify(header) === JSON.stringify(LEGACY_CSV_COLUMNS);
  if (
    !legacyText &&
    JSON.stringify(header) !== JSON.stringify(ENCODED_CSV_COLUMNS) &&
    JSON.stringify(header) !== JSON.stringify(CSV_COLUMNS)
  ) {
    throw new Error("Choose a Form workout or journal CSV export with its original column headers.");
  }
  if (!rows.length) {
    throw new Error("This CSV contains no training records.");
  }
  const groups = new Map<string, ImportRow[]>();
  for (const cells of rows) {
    if (cells.length !== header.length) {
      throw new Error("Every CSV row must have the same number of columns.");
    }
    const row = Object.fromEntries(header.map((column, index) => [column, cells[index] ?? ""])) as ImportRow;
    row.exercise_notes ??= "";
    if (row.record_type !== CSV_RECORD[kind]) {
      throw new Error("This file contains the wrong type of training record.");
    }
    if (!legacyText) {
      if (row.text_encoding !== CSV_TEXT_ENCODING) {
        throw new Error("The text encoding marker is unsupported.");
      }
      for (const field of ["name", "notes", "exercise_id", "exercise_name", "exercise_notes"] as const) {
        const value = row[field] ?? "";
        if (value.startsWith("'")) {
          row[field] = value.slice(1);
        }
      }
    }
    row.record_id = row.record_id.toLowerCase();
    groups.set(row.record_id, [...(groups.get(row.record_id) ?? []), row]);
  }
  const input = importInputSchema.parse({
    kind,
    records: [...groups.values()].map((group) => recordFromRows(group, kind)),
  });
  return { input, legacyText };
}

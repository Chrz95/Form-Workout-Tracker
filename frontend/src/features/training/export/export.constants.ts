/** Stable CSV columns for routines, actual sets and legacy uniform session entries. */
export const LEGACY_CSV_COLUMNS = [
  "record_type",
  "record_id",
  "name",
  "date",
  "duration_minutes",
  "notes",
  "created_at",
  "exercise_id",
  "exercise_name",
  "exercise_position",
  "set_position",
  "set_id",
  "set_kind",
  "set_count",
  "reps",
  "weight_kg",
  "rpe",
  "source",
] as const;
/** Explicit text encoding removes ambiguity between a formula guard and a literal apostrophe. */
export const CSV_TEXT_ENCODING = "apostrophe-v1";
/** Current exports carry their reversible text encoding marker. */
export const ENCODED_CSV_COLUMNS = [...LEGACY_CSV_COLUMNS, "text_encoding"] as const;
/** Per-exercise notes are repeated for every set in the current export. */
export const CSV_COLUMNS = [...ENCODED_CSV_COLUMNS, "exercise_notes"] as const;
/** CSV syntax and browser download conventions. */
export const CSV_FORMAT = {
  separator: ",",
  lineEnding: "\r\n",
  byteOrderMark: "\uFEFF",
  mimeType: "text/csv;charset=utf-8",
  revokeDelayInMilliseconds: 1000,
  formulaPrefix: "'",
} as const;
/** Export kinds and compatibility labels. */
export const CSV_RECORD = {
  workouts: "routine",
  sessions: "session",
  reference: "workout_reference",
  planned: "planned_set",
  prescribed: "prescribed",
  performed: "performed",
  uniform: "legacy_uniform",
} as const;
/** Stable, public filenames contain no user-entered content. */
export const CSV_FILENAMES = { workouts: "form-workouts.csv", sessions: "form-workout-history.csv" } as const;

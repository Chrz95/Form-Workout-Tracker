/** Stable CSV columns for routines, actual sets and legacy uniform session entries. */
export const CSV_COLUMNS = [
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
  prescribed: "prescribed",
  performed: "performed",
  uniform: "legacy_uniform",
} as const;
/** Stable, public filenames contain no user-entered content. */
export const CSV_FILENAMES = { workouts: "form-workouts.csv", sessions: "form-workout-history.csv" } as const;

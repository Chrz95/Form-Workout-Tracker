import { resolveWorkout, workoutIdentities } from "../../../../../shared/workoutGraph";
import type { Exercise, Workout, Session } from "../../../../../shared/contracts";
import type { ImportInput } from "../../../../../shared/importContracts";
import { serializeImportedRecord } from "../../../../../shared/importIdentity";
import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
/** Reviews known IDs and canonical exercise aliases without changing transfer values.
 * @param {ImportInput} input - Validated file.
 * @param {Array<Workout | Session>} saved - Loaded records of the destination collection.
 * @param {Exercise[]} exercises - Public and connected custom catalog.
 * @returns {Array<{id: string, name: string, detail: string, blocked: boolean}>} Review rows.
 */
export function reviewImport(input: ImportInput, saved: Array<Workout | Session>, exercises: Exercise[]) {
  return input.records.map((record) => {
    const canonicalIds = record.items.map(
      (item) => exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.id,
    );
    const existing = saved.find((entry) => entry.id === record.id);
    let compositionError = "";
    if (input.kind === "workouts") {
      const graph = [
        ...saved.filter(
          (entry): entry is Workout =>
            !("date" in entry) && !input.records.some((incoming) => incoming.id === entry.id),
        ),
        ...input.records,
      ];
      try {
        resolveWorkout(record, graph, workoutIdentities(exercises));
      } catch (error) {
        compositionError = error instanceof Error ? error.message : "Invalid composition";
      }
    }
    const unknown = canonicalIds.includes(undefined);
    const duplicate = new Set(canonicalIds).size !== canonicalIds.length;
    const conflict = existing && serializeImportedRecord(existing) !== serializeImportedRecord(record);
    return {
      id: record.id,
      name: record.name,
      blocked: Boolean(unknown || duplicate || conflict || compositionError),
      detail:
        compositionError ||
        (unknown
          ? "Missing exercise ID — add its custom exercise first"
          : duplicate
            ? "Duplicate movement under alternate names"
            : conflict
              ? "Saved ID has different values — import blocked"
              : existing
                ? "Unchanged ID — will be skipped"
                : "New record"),
    };
  });
}

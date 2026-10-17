import type { Exercise, Workout, WorkoutItem } from "../../../../shared/contracts";
import { CUSTOM_EXERCISE_PREFIX } from "../../../../shared/exerciseConstants";
/** Resolves personal membership from custom entries and workout references without copying catalog records.
 * @param {Exercise[]} exercises - Public and private catalog entries, including historical metadata.
 * @param {Workout[]} workouts - Saved routines; included routines are present in this collection too.
 * @param {WorkoutItem[]} draftItems - Current direct draft selections, including copied or replaced movements.
 * @returns {Set<string>} Unique discoverable canonical exercise IDs.
 */
export function getMyExerciseIds(exercises: Exercise[], workouts: Workout[], draftItems: WorkoutItem[]): Set<string> {
  const references = new Set(
    [...workouts.flatMap((workout) => workout.items), ...draftItems].map((item) => item.exerciseId),
  );
  return new Set(
    exercises
      .filter(
        (exercise) =>
          !exercise.isArchived &&
          (exercise.id.startsWith(CUSTOM_EXERCISE_PREFIX) ||
            references.has(exercise.id) ||
            exercise.legacyIds?.some((id) => references.has(id))),
      )
      .map((exercise) => exercise.id),
  );
}

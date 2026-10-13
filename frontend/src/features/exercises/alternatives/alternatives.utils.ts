import type { Exercise, WorkoutItem } from "../../../../../shared/contracts";
import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
import { WORKOUT_DEFAULTS } from "../../../../../shared/constants";
import { ALTERNATIVE_RANK, ANY_EQUIPMENT } from "./alternatives.constants";
/** Finds catalog candidates sharing an explicitly listed primary muscle, without claiming equivalence.
 * @param {Exercise} exercise - Selected movement.
 * @param {Exercise[]} catalog - Available exercises.
 * @param {string[]} excludedIds - Already-selected draft identities.
 * @param {string} equipment - Selected equipment or the any-equipment sentinel.
 * @param {string} search - Optional name query.
 * @returns {Exercise[]} Ranked candidates with a stable alphabetic tie-break.
 */
export function findAlternatives(
  exercise: Exercise,
  catalog: Exercise[],
  excludedIds: string[],
  equipment = ANY_EQUIPMENT,
  search = "",
): Exercise[] {
  const primaryMuscles = new Set(exercise.primaryMuscles.filter((group) => group !== "unspecified"));
  return catalog
    .map((candidate) => ({
      candidate,
      overlap: candidate.primaryMuscles.filter((group) => primaryMuscles.has(group)).length,
    }))
    .filter(
      ({ candidate, overlap }) =>
        overlap > 0 &&
        candidate.id !== exercise.id &&
        !excludedIds.some((id) => matchesExerciseId(candidate, id)) &&
        (equipment === ANY_EQUIPMENT || candidate.equipment === equipment) &&
        candidate.name.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .map(({ candidate, overlap }) => ({
      candidate,
      score:
        overlap * ALTERNATIVE_RANK.primaryMuscle +
        (candidate.equipment === exercise.equipment ? ALTERNATIVE_RANK.equipment : 0) +
        (candidate.mechanic && candidate.mechanic === exercise.mechanic ? ALTERNATIVE_RANK.mechanic : 0) +
        (candidate.category === exercise.category ? ALTERNATIVE_RANK.category : 0),
    }))
    .sort((first, second) => second.score - first.score || first.candidate.name.localeCompare(second.candidate.name))
    .map(({ candidate }) => candidate)
    .slice(0, ALTERNATIVE_RANK.limit);
}
/** Substitutes only a current draft entry and resets load rather than transferring strength assumptions.
 * @param {WorkoutItem[]} items - Unsaved prescriptions.
 * @param {string} exerciseId - Existing draft identity.
 * @param {string} replacementId - Chosen alternative.
 * @returns {WorkoutItem[]} Reversible draft replacement; saved and active workouts are untouched.
 */
export function substituteDraftExercise(
  items: WorkoutItem[],
  exerciseId: string,
  replacementId: string,
): WorkoutItem[] {
  if (items.some((item) => item.exerciseId === replacementId)) {
    return items;
  }
  return items.map((item) =>
    item.exerciseId === exerciseId
      ? {
          ...item,
          exerciseId: replacementId,
          weight: WORKOUT_DEFAULTS.weight,
          ...(item.plannedSets
            ? { plannedSets: item.plannedSets.map((set) => ({ ...set, weight: WORKOUT_DEFAULTS.weight })) }
            : {}),
        }
      : item,
  );
}

import { createUuid } from "./createUuid.js";
import type { Exercise, SessionItem, WorkoutItem } from "./contracts.js";
import { INPUT_LIMITS } from "./constants.js";
import { matchesExerciseId } from "./exerciseIdentity.js";
/** Expands a legacy uniform target without mutating the source routine.
 * @param {WorkoutItem} item - Saved or draft prescription.
 * @returns {{reps: number; weight: number}[]} Independent ordered targets.
 */
export function getPlannedSets(item: WorkoutItem) {
  return (item.plannedSets ?? Array.from({ length: item.sets }, () => item)).map(({ reps, weight }) => ({
    reps,
    weight,
  }));
}
/** Keeps aggregate metadata consistent with its individual set targets.
 * @param {WorkoutItem} item - Current exercise.
 * @param {NonNullable<WorkoutItem["plannedSets"]>} plannedSets - New ordered targets.
 * @returns {WorkoutItem} Updated immutable prescription.
 */
export function withPlannedSets(item: WorkoutItem, plannedSets: NonNullable<WorkoutItem["plannedSets"]>): WorkoutItem {
  const last = plannedSets.at(-1);
  return { ...item, ...last, sets: plannedSets.length, plannedSets };
}
/** Updates legacy controls, preserving existing individual targets when resizing.
 * @param {WorkoutItem} item - Current exercise.
 * @param {"sets" | "reps" | "weight"} field - Aggregate control.
 * @param {number} value - Entered number.
 * @returns {WorkoutItem} Immutable draft.
 */
export function updatePrescription(item: WorkoutItem, field: "sets" | "reps" | "weight", value: number): WorkoutItem {
  if (!item.plannedSets) {
    return { ...item, [field]: value };
  }
  if (field === "sets") {
    if (!Number.isInteger(value) || value < 1 || value > INPUT_LIMITS.sets) {
      return item;
    }
    return withPlannedSets(
      item,
      Array.from({ length: value }, (_, index) => ({
        ...(item.plannedSets?.[index] ?? item.plannedSets?.at(-1) ?? item),
      })),
    );
  }
  return withPlannedSets(
    item,
    getPlannedSets(item).map((set) => ({ ...set, [field]: value })),
  );
}
/** Converts a manually logged prescription to explicit completed sets when targets differ.
 * @param {WorkoutItem} item - User-reviewed manual entry.
 * @returns {SessionItem} Actual log payload, with fresh identities.
 */
export function prescriptionToSession(item: WorkoutItem): SessionItem {
  const { plannedSets, ...summary } = item;
  return {
    ...summary,
    ...(plannedSets
      ? {
          performedSets: plannedSets.map((set) => ({
            ...set,
            id: createUuid(),
            rpe: null,
            kind: "working" as const,
          })),
        }
      : {}),
  };
}
/** Composes routine snapshots while skipping both exact and historical alias duplicates.
 * @param {WorkoutItem[]} current - Existing draft.
 * @param {WorkoutItem[]} incoming - Component workout snapshot.
 * @param {Exercise[]} catalog - Canonical and retired identities.
 * @returns {{items: WorkoutItem[]; skipped: number}} Independent combined targets.
 */
export function composeWorkout(current: WorkoutItem[], incoming: WorkoutItem[], catalog: Exercise[]) {
  const keys = new Set(
    current.map(
      (item) => catalog.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.id ?? item.exerciseId,
    ),
  );
  const items = [...current];
  let skipped = 0;
  for (const item of incoming) {
    const key = catalog.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.id ?? item.exerciseId;
    if (keys.has(key)) {
      skipped += 1;
      continue;
    }
    keys.add(key);
    items.push({ ...item, ...(item.plannedSets ? { plannedSets: getPlannedSets(item) } : {}) });
  }
  if (items.length > INPUT_LIMITS.exercises) {
    throw new Error("A combined workout can contain at most 100 exercises.");
  }
  return { items, skipped };
}

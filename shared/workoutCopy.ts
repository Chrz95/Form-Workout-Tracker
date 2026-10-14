import type { Workout } from "./contracts.js";
import { INPUT_LIMITS } from "./constants.js";
/** Copies a routine into a new unsaved input, preserving references and independent set arrays.
 * @param {Workout} workout - Source record.
 * @returns {Omit<Workout, "id" | "createdAt">} Reviewable draft with no persisted identity.
 */
export function createWorkoutCopy(workout: Workout): Omit<Workout, "id" | "createdAt"> {
  let name = "";
  for (const character of `Copy of ${workout.name}`) {
    if (name.length + character.length > INPUT_LIMITS.name) {
      break;
    }
    name += character;
  }
  return {
    name: name.trim(),
    notes: workout.notes,
    items: workout.items.map((item) => ({
      ...item,
      ...(item.plannedSets ? { plannedSets: item.plannedSets.map((set) => ({ ...set })) } : {}),
    })),
    ...(workout.includedWorkoutIds?.length ? { includedWorkoutIds: [...workout.includedWorkoutIds] } : {}),
  };
}

import type { SessionInput } from "./training.types.js";
/** Serializes a canonical completion for safe retry comparison without logging private data.
 * @param {SessionInput} input - Original or repeated completion.
 * @returns {string} Comparable content; not written to logs or sent to clients.
 */
export function serializeSessionInput(input: SessionInput): string {
  return JSON.stringify({
    name: input.name,
    notes: input.notes,
    date: input.date,
    duration: input.duration,
    items: input.items.map(({ exerciseId, sets, reps, weight, performedSets }) => ({
      exerciseId,
      sets,
      reps,
      weight,
      ...(performedSets
        ? {
            performedSets: performedSets.map(({ id, reps: setReps, weight: setWeight, kind, rpe }) => ({
              id,
              reps: setReps,
              weight: setWeight,
              kind,
              rpe,
            })),
          }
        : {}),
    })),
  });
}

import type { WorkoutItem } from "../../../../shared/contracts";
import { getPlannedSets } from "../../../../shared/prescriptions";
/** Summarizes uniform or varying targets without implying every set has identical values.
 * @param {WorkoutItem} item - Ordered prescription.
 * @returns {string} Compact count, repetition range and weight range.
 */
export function targetSummary(item: WorkoutItem): string {
  const sets = getPlannedSets(item);
  /** Formats the minimum and maximum when targets differ.
   * @param {number[]} values - Values from all planned sets.
   * @returns {string} One value or a bounded range.
   */
  function range(values: number[]): string {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? String(min) : `${min}–${max}`;
  }
  return `${sets.length} ${sets.length === 1 ? "set" : "sets"} · ${range(sets.map((set) => set.reps))} reps · ${range(
    sets.map((set) => set.weight),
  )} kg`;
}

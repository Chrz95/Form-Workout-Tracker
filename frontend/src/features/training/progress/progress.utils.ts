import type { Session } from "../../../../../shared/contracts";
import { SET_KIND } from "../../../../../shared/setContracts";
import { getRecordedSets } from "../live/live.utils";
import { PROGRESS_METRIC } from "./progress.constants";
/** Metric names are constrained by their display catalog. */
export type ProgressMetric = keyof typeof PROGRESS_METRIC;
/** One chronological session point retaining its label for keyboard/table inspection. */
export interface ProgressPoint {
  sessionId: string;
  date: string;
  sessionName: string;
  weight: number;
  reps: number;
  volume: number;
  workingSets: number;
  isLegacy: boolean;
}
/** Builds honest measurements from working sets, accepting uniform legacy entries.
 * @param {Session[]} sessions - Saved training history.
 * @param {string} exerciseId - Selected movement.
 * @returns {ProgressPoint[]} Chronological measurements.
 */
export function buildProgressPoints(sessions: Session[], exerciseId: string): ProgressPoint[] {
  return [...sessions]
    .sort((first, second) => first.date.localeCompare(second.date) || first.createdAt.localeCompare(second.createdAt))
    .flatMap((session) => {
      const item = session.items.find((entry) => entry.exerciseId === exerciseId);
      if (!item) {
        return [];
      }
      const working = getRecordedSets(item).filter((set) => set.kind === SET_KIND.working);
      if (!working.length) {
        return [];
      }
      return [
        {
          sessionId: session.id,
          date: session.date,
          sessionName: session.name,
          weight: Math.max(...working.map((set) => set.weight)),
          reps: Math.max(...working.map((set) => set.reps)),
          volume: working.reduce((total, set) => total + set.weight * set.reps, 0),
          workingSets: working.length,
          isLegacy: !item.performedSets,
        },
      ];
    });
}
/** Formats recorded values without inflating their precision.
 * @param {number} value - Recorded or calculated metric.
 * @returns {string} Human-readable number.
 */
export function formatProgressValue(value: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);
}

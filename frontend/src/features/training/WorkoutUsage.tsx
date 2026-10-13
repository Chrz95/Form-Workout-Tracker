import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface WorkoutUsageProps {
  /** Parents directly referencing this routine. */
  parents: Workout[];
  /** Preview navigation state. */
  studio: Studio;
  /** Accessible description for a disabled delete action. */
  id?: string;
  /** Card summaries abbreviate the parent list. */
  compact?: boolean;
}
const SUMMARY_PARENT_LIMIT = 3;
/** Makes reference ownership visible before editing or deleting a component.
 * @param {WorkoutUsageProps} props - Parent relations.
 * @param {Workout[]} props.parents - Referencing routines.
 * @param {Studio} props.studio - Preview navigation.
 * @param {string} [props.id] - Description identity.
 * @param {boolean} [props.compact] - Whether to abbreviate.
 * @returns {JSX.Element | null} Parent references.
 */
export function WorkoutUsage({ parents, studio, id, compact = false }: WorkoutUsageProps) {
  if (!parents.length) {
    return null;
  }
  return (
    <div
      className="workout-usage"
      id={id}
    >
      <p>
        Used by {parents.length} parent workout{parents.length === 1 ? "" : "s"}. Remove their references before
        deleting.
      </p>
      {compact ? (
        <p>
          {parents
            .slice(0, SUMMARY_PARENT_LIMIT)
            .map((parent) => parent.name)
            .join(" + ")}
          {parents.length > SUMMARY_PARENT_LIMIT ? ` + ${parents.length - SUMMARY_PARENT_LIMIT} more` : ""}
        </p>
      ) : (
        <div className="parent-workout-links">
          {parents.map((parent) => (
            <button
              key={parent.id}
              type="button"
              className="text-button"
              aria-label={`Review parent ${parent.name}`}
              onClick={() => studio.setWorkoutPreviewId(parent.id)}
            >
              {parent.name} ↗
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

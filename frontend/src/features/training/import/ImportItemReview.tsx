import type { WorkoutItem, SessionItem } from "../../../../../shared/contracts";
import type { Studio } from "../../../app/useStudio";
import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
interface ImportItemReviewProps {
  /** Full target or completed exercise being imported. */
  item: WorkoutItem | SessionItem;
  /** Catalog for readable names. */
  studio: Studio;
}
/** Shows individual values so review never hides varying prescribed targets.
 * @param {ImportItemReviewProps} props - Imported item.
 * @param {WorkoutItem | SessionItem} props.item - Full exercise values.
 * @param {Studio} props.studio - Catalog context.
 * @returns {JSX.Element} Exact set review.
 */
export function ImportItemReview({ item, studio }: ImportItemReviewProps) {
  const performed = "performedSets" in item ? item.performedSets : undefined;
  const planned = "plannedSets" in item ? item.plannedSets : undefined;
  return (
    <li>
      {studio.exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.name ?? item.exerciseId}
      {performed ? (
        <ul>
          {performed.map((set, index) => (
            <li key={set.id}>
              Set {index + 1}: {set.kind} · {set.reps} reps × {set.weight} kg · RPE {set.rpe ?? "—"}
            </li>
          ))}
        </ul>
      ) : planned ? (
        <p>
          Planned: {planned.map((set, index) => `Set ${index + 1}: ${set.reps} reps × ${set.weight} kg`).join("; ")}
        </p>
      ) : (
        ` · ${item.sets} × ${item.reps} reps · ${item.weight} kg`
      )}
      {item.notes && <p className="exercise-note">{item.notes}</p>}
    </li>
  );
}

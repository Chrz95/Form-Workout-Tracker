import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
import type { Exercise, SessionItem } from "../../../../../shared/contracts";
import { SET_KIND } from "../../../../../shared/setContracts";
interface CompletedSetListProps {
  items: SessionItem[];
  exercises: Exercise[];
}
/** Shows individual completed values and preserves aggregate displays for legacy entries.
 * @param {CompletedSetListProps} props - Completion details.
 * @param {SessionItem[]} props.items - Saved or reviewed exercise records.
 * @param {Exercise[]} props.exercises - Catalog labels.
 * @returns {JSX.Element} Readable set summary.
 */
export function CompletedSetList({ items, exercises }: CompletedSetListProps) {
  return (
    <div className="completed-set-list">
      {items.map((item) => (
        <section key={item.exerciseId}>
          <h4>{exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.name ?? item.exerciseId}</h4>
          {item.notes && <p className="exercise-note">{item.notes}</p>}
          {item.performedSets ? (
            <ul>
              {item.performedSets.map((set, position) => (
                <li key={set.id}>
                  <span>
                    Set {position + 1} · {set.kind === SET_KIND.warmup ? "warm-up" : "working"}
                  </span>
                  <strong>
                    {set.weight} kg × {set.reps}
                  </strong>
                  {set.rpe !== null && <small>Effort {set.rpe}/10</small>}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {item.sets} × {item.reps} · {item.weight} kg <small>Uniform set entry</small>
            </p>
          )}
        </section>
      ))}
    </div>
  );
}

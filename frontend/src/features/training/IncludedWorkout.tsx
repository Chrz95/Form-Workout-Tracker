import type { StudioProps } from "../../app/useStudio";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
interface IncludedWorkoutProps extends StudioProps {
  /** Saved component identity. */
  id: string;
  /** Current component order. */
  index: number;
}
/** Offers component ordering and source movement review.
 * @param {IncludedWorkoutProps} props - Component row.
 * @param {Studio} props.studio - Builder state.
 * @param {string} props.id - Saved component.
 * @param {number} props.index - Current order.
 * @returns {JSX.Element} Component preview and controls.
 */
export function IncludedWorkout({ studio, id, index }: IncludedWorkoutProps) {
  const workout = studio.workouts.find((entry) => entry.id === id);
  let items = workout?.items ?? [];
  let error = "";
  try {
    if (workout) {
      items = resolveWorkout(workout, studio.workouts, workoutIdentities(studio.exercises));
    }
  } catch (failure) {
    error = failure instanceof Error ? failure.message : "Unavailable component.";
  }
  /** Reorders references without changing their contents.
   * @param {number} offset - Adjacent destination.
   */
  function move(offset: number) {
    const next = [...studio.draftWorkoutIds];
    const other = next[index + offset];
    if (other) {
      next[index] = other;
      next[index + offset] = id;
      studio.setDraftWorkoutIds(next);
    }
  }
  return (
    <article className="included-workout">
      <details>
        <summary>
          {index + 1}. {workout?.name ?? "Missing workout"} · {items.length} movements
        </summary>
        {error && <p className="form-error">{error}</p>}
        <p>Edit targets in the source workout. Click a movement to review its instructions.</p>
        {items.map((item) => {
          const exercise = studio.exercises.find((entry) => matchesExerciseId(entry, item.exerciseId));
          return (
            <p key={item.exerciseId}>
              <button
                type="button"
                className="text-button"
                disabled={!exercise}
                onClick={() => exercise && studio.setSelectedExercise(exercise)}
              >
                {exercise?.name ?? item.exerciseId}
              </button>
              {" · "}
              {item.sets} sets
            </p>
          );
        })}
      </details>
      <div className="catalog-actions">
        <button
          type="button"
          className="text-button"
          disabled={index === 0}
          onClick={() => move(-1)}
          aria-label={`Move ${workout?.name ?? "component"} earlier`}
        >
          ↑ Earlier
        </button>
        <button
          type="button"
          className="text-button"
          disabled={index === studio.draftWorkoutIds.length - 1}
          onClick={() => move(1)}
          aria-label={`Move ${workout?.name ?? "component"} later`}
        >
          ↓ Later
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => studio.setDraftWorkoutIds(studio.draftWorkoutIds.filter((entry) => entry !== id))}
        >
          Remove component
        </button>
      </div>
    </article>
  );
}

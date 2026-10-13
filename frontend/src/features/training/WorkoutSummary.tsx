import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph";
interface WorkoutSummaryProps {
  /** Routine shown on its library card. */
  workout: Workout;
  /** Connected component records and catalog. */
  studio: Studio;
}
/** Displays resolved counts for routines with component references.
 * @param {WorkoutSummaryProps} props - Card metadata.
 * @param {Workout} props.workout - Saved parent.
 * @param {Studio} props.studio - Complete routine collection.
 * @returns {JSX.Element} Counts or actionable error.
 */
export function WorkoutSummary({ workout, studio }: WorkoutSummaryProps) {
  let { items } = workout;
  let error = "";
  try {
    items = resolveWorkout(workout, studio.workouts, workoutIdentities(studio.exercises));
  } catch (failure) {
    error = failure instanceof Error ? failure.message : "Review this composition.";
  }
  if (error) {
    return <p className="form-error">{error}</p>;
  }
  const movementLabel = items.length === 1 ? "movement" : "movements";
  return (
    <div className="workout-meta">
      {items.length} {movementLabel} · {items.reduce((total, item) => total + item.sets, 0)} sets
      {workout.includedWorkoutIds?.length ? (
        <p>
          Includes{" "}
          {workout.includedWorkoutIds
            .map((id) => studio.workouts.find((entry) => entry.id === id)?.name ?? "Missing workout")
            .join(" + ")}
        </p>
      ) : null}
    </div>
  );
}

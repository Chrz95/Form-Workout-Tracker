import { useId } from "react";
import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { WorkoutSummary } from "./WorkoutSummary";
import { WorkoutUsage } from "./WorkoutUsage";
import { WorkoutCardActions } from "./WorkoutCardActions";
interface WorkoutCardProps {
  /** Persisted routine. */
  workout: Workout;
  /** Connected records and catalog. */
  studio: Studio;
}
/** Presents a saved routine with readable component dependencies.
 * @param {WorkoutCardProps} props - Card model.
 * @param {Workout} props.workout - Routine.
 * @param {Studio} props.studio - Application actions.
 * @returns {JSX.Element} Routine card.
 */
export function WorkoutCard({ workout, studio }: WorkoutCardProps) {
  const usageId = useId();
  const parents = studio.workouts.filter((parent) => parent.includedWorkoutIds?.includes(workout.id));
  return (
    <article className="workout-card">
      <span className="eyebrow">YOUR CUSTOM ROUTINE</span>
      <h2>{workout.name}</h2>
      <p>{workout.notes || "Your movements. Your intention."}</p>
      <div className="workout-exercises">
        {workout.items.map((item) => (
          <span key={item.exerciseId}>
            {studio.exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.name ?? item.exerciseId}
          </span>
        ))}
      </div>
      <WorkoutSummary
        workout={workout}
        studio={studio}
      />
      <WorkoutUsage
        parents={parents}
        studio={studio}
        id={usageId}
        compact
      />
      <WorkoutCardActions
        workout={workout}
        studio={studio}
        parents={parents}
        usageId={usageId}
      />
    </article>
  );
}

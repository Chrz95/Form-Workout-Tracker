import { Layers } from "lucide-react";
import type { Workout } from "../../../../shared/contracts";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import type { Studio } from "../../app/useStudio";
import { getExerciseThumbnail } from "../exercises/exerciseImage.utils";
import { ExerciseImage } from "../exercises/ExerciseImage";
interface WorkoutArtworkProps {
  workout: Workout;
  studio: Studio;
}
/** Provides a routine's visual identity using its own exercise images.
 * @param {WorkoutArtworkProps} props - Routine and exercise catalog.
 * @param {Workout} props.workout - Saved prescription.
 * @param {Studio} props.studio - Current catalog.
 * @returns {JSX.Element} Decorative exercise strip.
 */
export function WorkoutArtwork({ workout, studio }: WorkoutArtworkProps) {
  const exercises = workout.items
    .slice(0, 3)
    .map((item) => studio.exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId)));
  return (
    <div
      className="workout-artwork"
      aria-hidden="true"
    >
      {exercises.length ? (
        exercises.map((exercise, index) => (
          <span key={exercise?.id ?? index}>
            {exercise ? (
              <ExerciseImage
                src={getExerciseThumbnail(exercise)}
                alt=""
                isLazy
              />
            ) : (
              <Layers size={24} />
            )}
          </span>
        ))
      ) : (
        <span className="combined-artwork">
          <Layers
            size={30}
            strokeWidth={1.3}
          />
        </span>
      )}
      <span className="routine-label">
        {workout.includedWorkoutIds?.length ? "COMBINED ROUTINE" : "CUSTOM ROUTINE"}
      </span>
    </div>
  );
}

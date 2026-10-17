import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { getExerciseThumbnail } from "../exercises";
import { targetSummary } from "./targetSummary";
import type { ResolvedWorkoutEntry } from "../../../../shared/workoutGraph";
import type { Studio } from "../../app/useStudio";
import { getPlannedSets } from "../../../../shared/prescriptions";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
interface WorkoutPreviewItemProps {
  /** Independent targets and source path. */
  entry: ResolvedWorkoutEntry;
  /** One-based movement order. */
  position: number;
  /** Catalog and detail selection. */
  studio: Studio;
}
/** Shows every target exactly as it will be copied into a new live session.
 * @param {WorkoutPreviewItemProps} props - Resolved movement.
 * @param {ResolvedWorkoutEntry} props.entry - Targets and provenance.
 * @param {number} props.position - Visible order.
 * @param {Studio} props.studio - Detail action.
 * @returns {JSX.Element} Read-only target table.
 */
export function WorkoutPreviewItem({ entry, position, studio }: WorkoutPreviewItemProps) {
  const { item, workoutPath } = entry;
  const exercise = studio.exercises.find((candidate) => matchesExerciseId(candidate, item.exerciseId));
  return (
    <li className="workout-preview-item">
      <div className="preview-exercise-heading">
        <img
          src={getExerciseThumbnail(exercise) ?? "/icon.svg"}
          alt=""
          loading="lazy"
        />
        <h3>
          {position}.{" "}
          <button
            type="button"
            className="text-button"
            disabled={!exercise}
            onClick={() => exercise && studio.setSelectedExercise(exercise)}
          >
            {exercise?.name ?? item.exerciseId}
          </button>
        </h3>
      </div>
      <ResponsiveDisclosure
        className="preview-targets"
        summary={`${targetSummary(item)}${item.notes ? " · Note" : ""}`}
      >
        <p className="preview-source">
          {workoutPath.length === 1 ? "Direct exercise" : workoutPath.slice(1).join(" → ")}
        </p>
        {item.notes && <p className="exercise-note">{item.notes}</p>}
        <table>
          <caption className="sr-only">{exercise?.name ?? item.exerciseId} planned set targets</caption>
          <thead>
            <tr>
              <th scope="col">Set</th>
              <th scope="col">Reps</th>
              <th scope="col">Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {getPlannedSets(item).map((set, index) => (
              <tr key={`${item.exerciseId}-target-${String(index + 1)}`}>
                <th scope="row">{index + 1}</th>
                <td>{set.reps}</td>
                <td>{set.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveDisclosure>
    </li>
  );
}

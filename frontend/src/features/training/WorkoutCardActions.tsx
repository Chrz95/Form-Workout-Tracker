import { ArrowUpRight, Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface WorkoutCardActionsProps {
  /** Saved routine to review, start or edit. */
  workout: Workout;
  /** Connected application actions. */
  studio: Studio;
  /** Parent relation list. */
  parents: Workout[];
  /** Description explaining blocked deletion. */
  usageId: string;
}
/** Offers read-only review and prevents attempting to delete a referenced component.
 * @param {WorkoutCardActionsProps} props - Card actions.
 * @param {Workout} props.workout - Saved routine.
 * @param {Studio} props.studio - Screen actions.
 * @param {Workout[]} props.parents - Referencing parents.
 * @param {string} props.usageId - Accessible usage description.
 * @returns {JSX.Element} Routine actions.
 */
export function WorkoutCardActions({ workout, studio, parents, usageId }: WorkoutCardActionsProps) {
  return (
    <div className="card-actions">
      <button
        type="button"
        className="button primary"
        onClick={() => studio.startWorkout(workout)}
      >
        Start workout <ArrowUpRight size={ICON_SIZE.standard} />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Review ${workout.name}`}
        onClick={() => studio.setWorkoutPreviewId(workout.id)}
      >
        <Eye size={ICON_SIZE.standard} />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Edit ${workout.name}`}
        onClick={() => studio.openWorkout(workout, false)}
      >
        <Pencil size={ICON_SIZE.standard} />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Duplicate ${workout.name}`}
        onClick={() => studio.duplicateWorkout(workout)}
      >
        <Copy size={ICON_SIZE.standard} />
      </button>
      <button
        type="button"
        className="icon-button"
        disabled={studio.isPending || parents.length > 0}
        aria-describedby={parents.length ? usageId : undefined}
        aria-label={`Delete ${workout.name}`}
        onClick={() => {
          if (window.confirm(`Delete “${workout.name}”?`)) {
            void studio.removeRecord("workouts", workout.id);
          }
        }}
      >
        <Trash2 size={ICON_SIZE.standard} />
      </button>
    </div>
  );
}

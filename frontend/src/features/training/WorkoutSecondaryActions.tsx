import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface WorkoutSecondaryActionsProps {
  /** Saved routine to review, start or edit. */
  workout: Workout;
  /** Connected application actions. */
  studio: Studio;
  /** Parent relation list. */
  parents: Workout[];
  /** Description explaining blocked deletion. */
  usageId: string;
}
/** Retains review and management actions behind the phone's More control.
 * @param {WorkoutSecondaryActionsProps} props - Saved routine actions.
 * @param {Workout} props.workout - Routine.
 * @param {Studio} props.studio - Application state.
 * @param {Workout[]} props.parents - Referencing parents.
 * @param {string} props.usageId - Blocked-deletion explanation.
 * @returns {JSX.Element} Secondary buttons.
 */
export function WorkoutSecondaryActions({ workout, studio, parents, usageId }: WorkoutSecondaryActionsProps) {
  return (
    <>
      <button
        type="button"
        className="icon-button"
        aria-label={`Review ${workout.name}`}
        onClick={() => studio.setWorkoutPreviewId(workout.id)}
      >
        <Eye size={ICON_SIZE.standard} />
        <span>Review</span>
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Edit ${workout.name}`}
        onClick={() => studio.openWorkout(workout, false)}
      >
        <Pencil size={ICON_SIZE.standard} />
        <span>Edit</span>
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Duplicate ${workout.name}`}
        onClick={() => studio.duplicateWorkout(workout)}
      >
        <Copy size={ICON_SIZE.standard} />
        <span>Duplicate</span>
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
        <span>Delete</span>
      </button>
    </>
  );
}

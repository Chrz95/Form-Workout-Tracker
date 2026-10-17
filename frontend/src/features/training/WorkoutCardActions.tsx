import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { WorkoutSecondaryActions } from "./WorkoutSecondaryActions";
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
      <ResponsiveDisclosure
        className="workout-more-actions"
        summary={
          <>
            <MoreHorizontal size={20} />
            More
          </>
        }
      >
        <WorkoutSecondaryActions
          workout={workout}
          studio={studio}
          parents={parents}
          usageId={usageId}
        />
      </ResponsiveDisclosure>
    </div>
  );
}

import { ChevronUp, ChevronDown, ArrowLeftRight } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { Studio } from "../../app/useStudio";
/** Ordering and alternative selection props. */
interface PrescriptionOrderProps {
  /** Existing draft identity. */
  exerciseId: string;
  /** Ordinal index. */
  position: number;
  /** Adjacent reorder operation. */
  onMove: (offset: number) => void;
  /** Draft and substitution controls. */
  studio: Studio;
}
/** Keeps row ordering and substitution controls separate from numeric fields.
 * @param {PrescriptionOrderProps} props - Prescription actions.
 * @param {string} props.exerciseId - Existing identity.
 * @param {number} props.position - Current order.
 * @param {(offset: number) => void} props.onMove - Adjacent reorder callback.
 * @param {Studio} props.studio - Draft and substitution state.
 * @returns {JSX.Element} Order and replace buttons.
 */
export function PrescriptionOrder({ exerciseId, position, onMove, studio }: PrescriptionOrderProps) {
  return (
    <div className="row-order">
      <button
        type="button"
        className="text-button"
        disabled={position === 0}
        onClick={() => onMove(-1)}
        aria-label="Move exercise up"
      >
        <ChevronUp size={ICON_SIZE.miniature} />
      </button>
      <button
        type="button"
        className="text-button"
        disabled={position === studio.draftItems.length - 1}
        onClick={() => onMove(1)}
        aria-label="Move exercise down"
      >
        <ChevronDown size={ICON_SIZE.miniature} />
      </button>
      <button
        type="button"
        className="text-button"
        onClick={() => studio.setSubstitutionExerciseId(exerciseId)}
        aria-label="Find an alternative exercise"
      >
        <ArrowLeftRight size={ICON_SIZE.miniature} />
      </button>
    </div>
  );
}

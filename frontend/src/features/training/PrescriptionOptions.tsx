import type { WorkoutItem } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { ExerciseNoteField } from "./ExerciseNoteField";
import { PrescriptionOrder } from "./PrescriptionOrder";
interface PrescriptionOptionsProps {
  item: WorkoutItem;
  name: string;
  position: number;
  onMove: (offset: number) => void;
  studio: Studio;
}
/** Groups secondary exercise controls while retaining all draft notes and ordering actions.
 * @param {PrescriptionOptionsProps} props - Draft exercise options.
 * @param {WorkoutItem} props.item - Prescription.
 * @param {string} props.name - Exercise label.
 * @param {number} props.position - Draft order.
 * @param {(offset: number) => void} props.onMove - Reorder action.
 * @param {Studio} props.studio - Draft owner.
 * @returns {JSX.Element} Collapsible note, reorder and replacement controls.
 */
export function PrescriptionOptions({ item, name, position, onMove, studio }: PrescriptionOptionsProps) {
  return (
    <ResponsiveDisclosure
      className="prescription-options mobile-secondary-section"
      summary={`Options & note${item.notes ? " · Note added" : ""}`}
    >
      <PrescriptionOrder
        exerciseId={item.exerciseId}
        position={position}
        onMove={onMove}
        studio={studio}
      />
      <ExerciseNoteField
        exerciseName={name}
        value={item.notes}
        onChange={(notes) =>
          studio.setDraftItems((items) =>
            items.map((entry) => (entry.exerciseId === item.exerciseId ? { ...entry, notes } : entry)),
          )
        }
      />
    </ResponsiveDisclosure>
  );
}

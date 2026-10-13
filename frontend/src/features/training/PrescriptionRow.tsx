import { PlannedSetsEditor } from "./PlannedSetsEditor";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { ICON_SIZE } from "../../../../shared/constants";
import { Trash2 } from "lucide-react";
import { PrescriptionOrder } from "./PrescriptionOrder";
import { getExerciseThumbnail } from "../exercises";
import { type WorkoutItem } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface PrescriptionRowProps {
  item: WorkoutItem;
  studio: Studio;
}
/** Edits a single exercise prescription and stable list order.
 * @param {PrescriptionRowProps} props - Row properties.
 * @param {WorkoutItem} props.item - Sets, reps and load.
 * @param {Studio} props.studio - Draft updater.
 * @returns {JSX.Element} Prescription controls.
 */
export function PrescriptionRow({ item, studio }: PrescriptionRowProps) {
  const exercise = studio.exercises.find((entry) => matchesExerciseId(entry, item.exerciseId));
  const position = studio.draftItems.findIndex((entry) => entry.exerciseId === item.exerciseId);
  /** Moves an item without mutating the previous draft.
   * @param {number} offset - Adjacent destination offset.
   */
  function moveItem(offset: number) {
    const next = [...studio.draftItems];
    const destination = position + offset;
    const target = next[destination];
    if (target) {
      next[position] = target;
      next[destination] = item;
      studio.setDraftItems(next);
    }
  }
  return (
    <div className="prescription-block">
      <div className="prescription-row">
        <img
          src={getExerciseThumbnail(exercise) ?? "/icon.svg"}
          alt=""
        />
        <div className="prescription-name">
          <button
            type="button"
            className="exercise-review-button"
            disabled={!exercise}
            onClick={() => exercise && studio.setSelectedExercise(exercise)}
          >
            <strong>{exercise?.name ?? item.exerciseId}</strong>
            <small>Review exercise ↗</small>
          </button>
          <small>{exercise?.primaryMuscles.join(", ")}</small>
          <PrescriptionOrder
            exerciseId={item.exerciseId}
            position={position}
            onMove={moveItem}
            studio={studio}
          />
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label={`Remove ${exercise?.name ?? "exercise"}`}
          onClick={() =>
            studio.setDraftItems(studio.draftItems.filter((entry) => entry.exerciseId !== item.exerciseId))
          }
        >
          <Trash2 size={ICON_SIZE.standard} />
        </button>
      </div>
      <PlannedSetsEditor
        item={item}
        studio={studio}
      />
    </div>
  );
}

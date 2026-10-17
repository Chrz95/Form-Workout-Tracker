import { Plus } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { Exercise } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { ExerciseImage } from "../exercises/ExerciseImage";
import { getExerciseThumbnail } from "../exercises/exerciseImage.utils";
interface ExercisePickerItemProps {
  exercise: Exercise;
  studio: Studio;
}
/** Separates exercise review from adding a movement to the current draft.
 * @param {ExercisePickerItemProps} props - Entry and editor actions.
 * @returns {JSX.Element} Thumbnail, review action and accessible add button.
 */
export function ExercisePickerItem({ exercise, studio }: ExercisePickerItemProps) {
  return (
    <li className="picker-item">
      <button
        type="button"
        className="picker-review"
        aria-label={`View ${exercise.name}`}
        onClick={() => studio.setSelectedExercise(exercise)}
      >
        <span className="picker-thumbnail">
          <ExerciseImage
            src={getExerciseThumbnail(exercise)}
            alt={`${exercise.name} instructional image`}
            isLazy
          />
        </span>
        <span className="picker-item-text">
          <strong>{exercise.name}</strong>
          <small>{exercise.primaryMuscles.join(", ")}</small>
          <small>
            {exercise.equipment ?? "No equipment"} · {exercise.level}
          </small>
        </span>
      </button>
      <button
        type="button"
        className="picker-add"
        aria-label={`Add ${exercise.name} to workout`}
        onClick={() => studio.addExercise(exercise.id)}
      >
        <Plus size={ICON_SIZE.standard} />
      </button>
    </li>
  );
}

import { Plus } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { ICON_SIZE } from "../../../../shared/constants";
/** Offers private creation alongside a personal workout collection.
 * @param {StudioProps} props - Catalog controls.
 * @param {Studio} props.studio - Owner content and editor actions.
 * @returns {JSX.Element} Personal exercise controls.
 */
export function LibraryActions({ studio }: StudioProps) {
  return (
    <div className="catalog-actions">
      <button
        className={`text-button ${studio.mineOnly ? "selected" : ""}`}
        aria-pressed={studio.mineOnly}
        onClick={() => studio.setMineOnly(!studio.mineOnly)}
      >
        My exercises ({studio.myExerciseIds.size})
      </button>
      <button
        className="button secondary"
        onClick={() => {
          studio.setApiError("");
          studio.setCustomExerciseEditor("new");
        }}
      >
        <Plus size={ICON_SIZE.standard} /> Create an exercise
      </button>
    </div>
  );
}

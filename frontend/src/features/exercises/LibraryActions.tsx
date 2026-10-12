import { Plus } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { ICON_SIZE } from "../../../../shared/constants";
/** Offers private catalog extensions alongside an authored-only filter.
 * @param {StudioProps} props - Catalog controls.
 * @param {Studio} props.studio - Owner content and editor actions.
 * @returns {JSX.Element} Authored exercise controls.
 */
export function LibraryActions({ studio }: StudioProps) {
  return (
    <div className="catalog-actions">
      <button
        className={`text-button ${studio.customOnly ? "selected" : ""}`}
        aria-pressed={studio.customOnly}
        onClick={() => studio.setCustomOnly(!studio.customOnly)}
      >
        My exercises ({studio.customExercises.length})
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

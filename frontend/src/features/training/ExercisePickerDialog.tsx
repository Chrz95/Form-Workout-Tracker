import { useEffect } from "react";
import type { Studio } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { useExercisePicker } from "./useExercisePicker";
import { ExercisePickerFilters } from "./ExercisePickerFilters";
import { ExercisePickerItem } from "./ExercisePickerItem";
interface ExercisePickerDialogProps {
  studio: Studio;
  onClose: () => void;
}
/** Browses the library while retaining the underlying draft and nested exercise reviews.
 * @param {ExercisePickerDialogProps} props - Draft and dismiss action.
 * @param {Studio} props.studio - Available exercises and selected identities.
 * @param {() => void} props.onClose - Returns to the editor.
 * @returns {JSX.Element} Independently scrollable exercise selection dialog.
 */
export function ExercisePickerDialog({ studio, onClose }: ExercisePickerDialogProps) {
  const picker = useExercisePicker(studio);
  useEffect(() => {
    picker.setIsOpen(true);
  }, [picker.setIsOpen]);
  return (
    <Modal
      title="Add exercises"
      onClose={onClose}
      isWide
    >
      <div className="exercise-library-popup">
        <p className="modal-description">Add movements to your workout. Tap an exercise to review its technique.</p>
        <ExercisePickerFilters
          studio={studio}
          filters={picker.filters}
          onChange={picker.updateFilters}
        />
        <p
          className="picker-count"
          aria-live="polite"
        >
          Showing {picker.matches.length} of {picker.total} available exercises
        </p>
        <div
          className="picker-results"
          ref={picker.resultsRef}
          role="region"
          aria-label="Available exercises"
          tabIndex={0}
          onScroll={(event) => {
            const target = event.currentTarget;
            if (picker.isOpen && picker.hasMore && target.scrollHeight - target.scrollTop - target.clientHeight < 120) {
              picker.loadMore();
            }
          }}
        >
          <ul className="picker-list">
            {picker.matches.map((exercise) => (
              <ExercisePickerItem
                key={exercise.id}
                exercise={exercise}
                studio={studio}
              />
            ))}
          </ul>
          {picker.total === 0 && (
            <p className="picker-empty">
              {studio.catalogError ||
                (studio.exercises.length === 0
                  ? "Loading your exercise library…"
                  : "No more matching exercises. Try clearing the filters.")}
            </p>
          )}
          {picker.hasMore && (
            <div
              className="picker-more"
              ref={picker.sentinelRef}
            >
              <button
                className="button secondary"
                type="button"
                onClick={picker.loadMore}
              >
                Load more exercises
              </button>
            </div>
          )}
        </div>
        <div className="modal-actions picker-dialog-footer">
          <span>{studio.draftSelectedItems.length} exercises in your workout</span>
          <button
            className="button primary"
            type="button"
            onClick={onClose}
          >
            Done adding exercises
          </button>
        </div>
      </div>
    </Modal>
  );
}

import type { Workout } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface WorkoutPreviewActionsProps {
  /** Saved source, if still available. */
  saved?: Workout;
  /** Draft navigation and editor actions. */
  studio: Studio;
  /** Whether the preview was opened above the builder. */
  isDraft: boolean;
  /** Invalid targets disable starting. */
  hasError: boolean;
  /** Closes only the preview. */
  onClose: () => void;
  /** Creates an independent live session. */
  onStart: () => void;
}
/** Provides explicit close and start controls outside any draft form.
 * @param {WorkoutPreviewActionsProps} props - Preview actions.
 * @param {Workout} [props.saved] - Existing source for editing.
 * @param {Studio} props.studio - Editor navigation.
 * @param {boolean} props.isDraft - Builder origin.
 * @param {boolean} props.hasError - Target validation state.
 * @param {() => void} props.onClose - Dismiss action.
 * @param {() => void} props.onStart - Start action.
 * @returns {JSX.Element} Preview footer.
 */
export function WorkoutPreviewActions({
  saved,
  studio,
  isDraft,
  hasError,
  onClose,
  onStart,
}: WorkoutPreviewActionsProps) {
  /** Opens the saved source after explicit replacement of any currently open draft. */
  function edit() {
    if (
      !saved ||
      ((studio.isBuilderOpen || studio.isLoggerOpen) &&
        !window.confirm(
          "Replace your current draft to edit this saved workout? Unsaved changes in the current draft will be lost.",
        ))
    ) {
      return;
    }
    studio.openWorkout(saved, false);
    onClose();
  }
  return (
    <div className="modal-actions">
      <button
        type="button"
        className="button secondary"
        onClick={onClose}
      >
        {isDraft ? "Back to builder" : "Close preview"}
      </button>
      {!isDraft && saved && (
        <button
          type="button"
          className="button secondary review-edit-button"
          onClick={edit}
        >
          Edit workout
        </button>
      )}
      <button
        type="button"
        className="button primary"
        disabled={hasError}
        onClick={onStart}
      >
        Start workout
      </button>
    </div>
  );
}

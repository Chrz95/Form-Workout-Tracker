interface WorkoutPreviewActionsProps {
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
 * @param {boolean} props.isDraft - Builder origin.
 * @param {boolean} props.hasError - Target validation state.
 * @param {() => void} props.onClose - Dismiss action.
 * @param {() => void} props.onStart - Start action.
 * @returns {JSX.Element} Preview footer.
 */
export function WorkoutPreviewActions({ isDraft, hasError, onClose, onStart }: WorkoutPreviewActionsProps) {
  return (
    <div className="modal-actions">
      <button
        type="button"
        className="button secondary"
        onClick={onClose}
      >
        {isDraft ? "Back to builder" : "Close preview"}
      </button>
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

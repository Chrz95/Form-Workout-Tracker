import { Play, Save } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { StudioProps } from "../../app/useStudio";
/** Exposes both durable routine saving and immediate in-memory training.
 * @param {StudioProps} props - Builder model.
 * @param {Studio} props.studio - Current prescription and live actions.
 * @returns {JSX.Element} Builder footer.
 */
export function WorkoutEditorActions({ studio }: StudioProps) {
  /** Begins training without implying the routine was saved. */
  function startDraft() {
    studio.setApiError("");
    studio.live.startWorkout({ name: studio.draftName, notes: studio.draftNotes, items: studio.draftItems });
    studio.setIsBuilderOpen(false);
  }
  return (
    <div className="modal-actions builder-actions">
      <span>{studio.draftItems.length} exercises · current draft</span>
      <div>
        <button
          className="button secondary"
          type="button"
          disabled={studio.draftItems.length === 0}
          onClick={startDraft}
        >
          <Play size={ICON_SIZE.miniature} />
          Start workout
        </button>
        <button
          className="button primary"
          disabled={studio.isPending}
          type="submit"
        >
          <Save size={ICON_SIZE.standard} />
          {studio.isPending ? "Saving…" : "Save workout"}
        </button>
      </div>
    </div>
  );
}

import { Save, Check, ArrowLeft } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { StudioProps } from "../../../app/useStudio";
import { LIVE_PHASE } from "./live.constants";
/** Keeps review actions separate from the completed-set summary.
 * @param {StudioProps} props - Review actions.
 * @param {Studio} props.studio - Live state and pending submission.
 * @returns {JSX.Element} Completion footer.
 */
export function ReviewActions({ studio }: StudioProps) {
  const isSaved = studio.live.workout?.phase === LIVE_PHASE.saved;
  return (
    <div className="modal-actions">
      {isSaved ? (
        <button
          className="button primary"
          onClick={studio.live.discardWorkout}
        >
          <Check size={ICON_SIZE.standard} />
          Done
        </button>
      ) : (
        <div className="review-buttons">
          <button
            className="button secondary"
            disabled={studio.isPending}
            onClick={studio.live.continueWorkout}
          >
            <ArrowLeft size={ICON_SIZE.miniature} />
            Keep training
          </button>
          <button
            className="button primary"
            disabled={studio.isPending}
            onClick={() => void studio.live.saveCompletion()}
          >
            <Save size={ICON_SIZE.standard} />
            {studio.isPending ? "Saving…" : "Save completed workout"}
          </button>
        </div>
      )}
    </div>
  );
}

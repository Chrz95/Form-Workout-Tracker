import { ReviewActions } from "./ReviewActions";
import { INPUT_LIMITS } from "../../../../../shared/constants";
import type { StudioProps } from "../../../app/useStudio";
import { Modal } from "../../../components/ui/Modal";
import { ReviewIdentityFields } from "./ReviewIdentityFields";
import { CompletedSetList } from "./CompletedSetList";
import { LIVE_PHASE } from "./live.constants";
import { prepareSession } from "./live.utils";
/** Reviews actual completed sets and waits for API confirmation before showing success.
 * @param {StudioProps} props - Completion model.
 * @param {Studio} props.studio - Current review and persistence operations.
 * @returns {JSX.Element | null} Review dialog.
 */
export function WorkoutReview({ studio }: StudioProps) {
  const { workout } = studio.live;
  if (!workout) {
    return null;
  }
  const submission = prepareSession(workout);
  const isSaved = workout.phase === LIVE_PHASE.saved;
  return (
    <Modal
      title={isSaved ? "Your effort, recorded." : "Finish with intention."}
      onClose={() => studio.live.setIsOpen(false)}
      isWide
    >
      <p className="modal-description">
        {isSaved
          ? "This session has been saved to your PostgreSQL training journal."
          : "Review the sets you completed. Unchecked sets are left out."}
      </p>
      <div className="review-summary">
        <span>
          <strong>{submission.items.length}</strong>movements
        </span>
        <span>
          <strong>{submission.items.reduce((total, item) => total + item.sets, 0)}</strong>completed sets
        </span>
        <span>
          <strong>{workout.duration}</strong>minutes
        </span>
      </div>
      {!isSaved && <ReviewIdentityFields studio={studio} />}
      <CompletedSetList
        items={submission.items}
        exercises={studio.exercises}
      />
      {!isSaved && (
        <label className="field-label">
          Session notes
          <textarea
            maxLength={INPUT_LIMITS.notes}
            placeholder="What felt good? What will you try next time?"
            value={workout.notes}
            onChange={(event) => studio.live.updateWorkout("notes", event.target.value)}
          />
        </label>
      )}
      {!studio.isConnected && !isSaved && (
        <p className="connection-notice">
          Your completed sets are still an unsaved draft.{" "}
          <button
            className="text-button"
            onClick={() => studio.setIsConnectionOpen(true)}
          >
            Connect your workout API
          </button>{" "}
          to save this session.
        </p>
      )}
      {studio.live.error && !isSaved && (
        <p
          className="form-error"
          role="alert"
        >
          {studio.live.error}
        </p>
      )}
      <ReviewActions studio={studio} />
    </Modal>
  );
}

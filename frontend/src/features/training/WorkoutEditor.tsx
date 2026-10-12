import { WorkoutEditorActions } from "./WorkoutEditorActions";
import { useTrainingSubmission } from "./useTrainingSubmission";
import { INPUT_LIMITS } from "../../../../shared/contracts";
import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { PrescriptionRow } from "./PrescriptionRow";
import { ExercisePicker } from "./ExercisePicker";
/** Builds or edits an ordered routine and validates before API persistence.
 * @param {StudioProps} props - Editor model.
 * @param {Studio} props.studio - Draft and persistence operations.
 * @returns {JSX.Element} Workout editor dialog.
 */
export function WorkoutEditor({ studio }: StudioProps) {
  const { error, handleSubmit } = useTrainingSubmission(studio, "workout");
  return (
    <Modal
      title={studio.editingWorkoutId ? "Make this workout yours" : "Build your workout"}
      onClose={() => studio.setIsBuilderOpen(false)}
      isWide
    >
      <p className="modal-description">Pick your movements. Set your pace. Create a routine that fits.</p>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Workout name
          <input
            required
            maxLength={INPUT_LIMITS.name}
            placeholder="e.g. Monday · Upper body"
            value={studio.draftName}
            onChange={(event) => studio.setDraftName(event.target.value)}
          />
        </label>
        <div className="prescription-list">
          {studio.draftItems.map((item) => (
            <PrescriptionRow
              key={item.exerciseId}
              item={item}
              studio={studio}
            />
          ))}
        </div>
        <ExercisePicker studio={studio} />
        <label className="field-label">
          Notes <span>optional</span>
          <textarea
            maxLength={INPUT_LIMITS.notes}
            placeholder="Rest times, focus, or a reminder to yourself…"
            value={studio.draftNotes}
            onChange={(event) => studio.setDraftNotes(event.target.value)}
          />
        </label>
        {(error || studio.apiError) && (
          <p
            className="form-error"
            role="alert"
          >
            {error || studio.apiError}
          </p>
        )}
        {!studio.isConnected && (
          <p className="connection-notice">
            This is an unsaved draft.{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => studio.setIsConnectionOpen(true)}
            >
              Connect your API
            </button>{" "}
            to save it to PostgreSQL.
          </p>
        )}
        <WorkoutEditorActions studio={studio} />
      </form>
    </Modal>
  );
}

import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { TrainingConnectionNotice } from "./TrainingConnectionNotice";
import { WorkoutComposer } from "./WorkoutComposer";
import { WorkoutEditorActions } from "./WorkoutEditorActions";
import { useTrainingSubmission } from "./useTrainingSubmission";
import { INPUT_LIMITS } from "../../../../shared/contracts";
import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { PrescriptionRow } from "./PrescriptionRow";
/** Builds or edits an ordered routine and validates before API persistence.
 * @param {StudioProps} props - Editor model.
 * @param {Studio} props.studio - Draft and persistence operations.
 * @returns {JSX.Element} Workout editor dialog.
 */
export function WorkoutEditor({ studio }: StudioProps) {
  const { error, handleSubmit } = useTrainingSubmission(studio, "workout");
  const extraSummary = [
    "Combine workouts & notes",
    studio.draftWorkoutIds.length ? `${studio.draftWorkoutIds.length} included` : "",
    studio.draftNotes ? "Note added" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Modal
      className="workout-editor"
      title={studio.editingWorkoutId ? "Edit workout" : "Build your workout"}
      onClose={() => studio.setIsBuilderOpen(false)}
      isWide
    >
      <p className="modal-description">Choose your exercises, set individual targets, and arrange your session.</p>
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
        <ResponsiveDisclosure
          className="editor-extras mobile-secondary-section"
          summary={extraSummary}
        >
          <WorkoutComposer studio={studio} />
          <label className="field-label">
            Notes <span>optional</span>
            <textarea
              maxLength={INPUT_LIMITS.notes}
              placeholder="Rest times, focus, or a reminder to yourself…"
              value={studio.draftNotes}
              onChange={(event) => studio.setDraftNotes(event.target.value)}
            />
          </label>
        </ResponsiveDisclosure>
        {(error || studio.apiError) && (
          <p
            className="form-error"
            role="alert"
          >
            {error || studio.apiError}
          </p>
        )}
        {!studio.isConnected && (
          <TrainingConnectionNotice studio={studio}>
            This is an unsaved draft.{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => studio.setIsConnectionOpen(true)}
            >
              Connect your API
            </button>{" "}
            to save it to PostgreSQL.
          </TrainingConnectionNotice>
        )}
        <WorkoutEditorActions studio={studio} />
      </form>
    </Modal>
  );
}

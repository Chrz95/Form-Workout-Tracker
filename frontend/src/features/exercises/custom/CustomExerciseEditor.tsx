import { TrainingConnectionNotice } from "../../training/TrainingConnectionNotice";
import type { Exercise } from "../../../../../shared/contracts";
import type { StudioProps } from "../../../app/useStudio";
import { Modal } from "../../../components/ui/Modal";
import { CustomExerciseIdentityFields } from "./CustomExerciseIdentityFields";
import { CustomExerciseGuideFields } from "./CustomExerciseGuideFields";
import { useCustomExerciseForm } from "./useCustomExerciseForm";
/** Authored editor properties. */
interface CustomExerciseEditorProps extends StudioProps {
  /** Existing custom exercise, or null for creation. */
  exercise: Exercise | null;
}
/** Authors private content that joins the normal exercise and workout flows after saving.
 * @param {CustomExerciseEditorProps} props - Owner editor model.
 * @param {Studio} props.studio - Persistence and close actions.
 * @param {Exercise | null} props.exercise - Existing private exercise.
 * @returns {JSX.Element} Custom exercise dialog.
 */
export function CustomExerciseEditor({ studio, exercise }: CustomExerciseEditorProps) {
  const form = useCustomExerciseForm(studio, exercise);
  const canSave = studio.isConnected && studio.hasCustomExerciseSupport && !studio.isPending;
  return (
    <Modal
      title={exercise ? "Edit your exercise" : "Create your own movement"}
      onClose={() => studio.setCustomExerciseEditor(null)}
      isWide
    >
      <p className="modal-description">
        Give your movement a name and clear steps. Saved exercises appear in your library.
      </p>
      <form onSubmit={form.handleSubmit}>
        <CustomExerciseIdentityFields
          draft={form.draft}
          onFieldChange={form.changeField}
        />
        <CustomExerciseGuideFields
          draft={form.draft}
          onFieldChange={form.changeField}
        />
        {(form.errorMessage || studio.apiError) && <p role="alert">{form.errorMessage || studio.apiError}</p>}
        {!canSave && !studio.isPending && (
          <TrainingConnectionNotice studio={studio}>
            Connect an API with the custom exercise update to save this draft.
            <button
              type="button"
              className="text-button"
              onClick={() => studio.setIsConnectionOpen(true)}
            >
              Connect API
            </button>
          </TrainingConnectionNotice>
        )}
        <div className="modal-actions">
          <small>Private to your training API · unsaved until confirmed</small>
          <button
            type="submit"
            className="button primary"
            disabled={!canSave}
          >
            {studio.isPending ? "Saving…" : "Save exercise"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

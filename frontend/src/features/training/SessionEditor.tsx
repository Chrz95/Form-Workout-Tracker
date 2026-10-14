import { SessionTimingFields } from "./SessionTimingFields";
import { useTrainingSubmission } from "./useTrainingSubmission";
import { ICON_SIZE } from "../../../../shared/constants";
import { Check } from "lucide-react";
import { INPUT_LIMITS } from "../../../../shared/contracts";
import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { PrescriptionRow } from "./PrescriptionRow";
import { ExercisePicker } from "./ExercisePicker";
/** Records an actual training date, duration and exercise prescription.
 * @param {StudioProps} props - Session editor model.
 * @param {Studio} props.studio - Draft and save operation.
 * @returns {JSX.Element} Journal form.
 */
export function SessionEditor({ studio }: StudioProps) {
  const { date, setDate, duration, setDuration, error, handleSubmit } = useTrainingSubmission(studio, "session");
  return (
    <Modal
      title="Make today count"
      onClose={() => studio.setIsLoggerOpen(false)}
      isWide
    >
      <p className="modal-description">Record the work you did. Future you will thank you.</p>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Session name
          <input
            required
            maxLength={INPUT_LIMITS.name}
            placeholder="e.g. Evening strength session"
            value={studio.draftName}
            onChange={(event) => studio.setDraftName(event.target.value)}
          />
        </label>
        <SessionTimingFields
          date={date}
          duration={duration}
          onDateChange={setDate}
          onDurationChange={setDuration}
        />
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
          How did it feel?
          <textarea
            maxLength={INPUT_LIMITS.notes}
            placeholder="Energy, effort, wins, or what to try next time…"
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
            Connect your workout API to save this session. Your draft stays in this tab.
          </p>
        )}
        <div className="modal-actions">
          <span>{studio.draftItems.length} exercises completed</span>
          <button
            className="button primary"
            disabled={studio.isPending}
            type="submit"
          >
            <Check size={ICON_SIZE.standard} />
            {studio.isPending ? "Saving…" : "Save session"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, type FormEvent } from "react";
import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { planInputSchema } from "../../../../shared/calendarContracts";
/** Plans a saved routine and keeps the draft on failed validation or transport.
 * @param {StudioProps} props - Plan editor model.
 * @param {Studio} props.studio - Editor selection and server operations.
 * @returns {JSX.Element} Schedule form.
 */
export function PlanEditor({ studio }: StudioProps) {
  const editor = studio.planEditor;
  const [date, setDate] = useState(editor?.date ?? "");
  const [workoutId, setWorkoutId] = useState(editor?.plan?.workoutId ?? studio.workouts[0]?.id ?? "");
  const [error, setError] = useState("");
  /** Saves intentional scheduling; never creates a completed session.
   * @param {FormEvent<HTMLFormElement>} event - Form event.
   * @returns {Promise<void>} Save attempt.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsed = planInputSchema.safeParse({ date, workoutId });
    if (!parsed.success) {
      setError("Choose a valid date and a saved routine.");
      return;
    }
    setError("");
    if (await studio.persistPlan(parsed.data, editor?.plan?.id)) {
      studio.setPlanEditor(null);
    }
  }
  return (
    <Modal
      title={editor?.plan ? "Reschedule your workout" : "Make time to move"}
      onClose={() => studio.setPlanEditor(null)}
    >
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Planned date
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="field-label">
          Saved routine
          <select
            required
            value={workoutId}
            onChange={(event) => setWorkoutId(event.target.value)}
          >
            <option value="">Choose a routine</option>
            {studio.workouts.map((workout) => (
              <option
                key={workout.id}
                value={workout.id}
              >
                {workout.name}
              </option>
            ))}
          </select>
        </label>
        {!studio.workouts.length && <p>Create and save a routine before planning it.</p>}
        <p>Plans show your intention. Only logging a completed workout adds to your training history.</p>
        {(error || studio.apiError) && <p role="alert">{error || studio.apiError}</p>}
        <button
          type="submit"
          className="button primary"
          disabled={studio.isPending || !studio.hasCalendarSupport || !studio.workouts.length}
        >
          {studio.isPending ? "Saving…" : "Save plan"}
        </button>
      </form>
    </Modal>
  );
}

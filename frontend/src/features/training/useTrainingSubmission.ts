import { createUuid } from "../../../../shared/createUuid";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph";
import { prescriptionToSession } from "../../../../shared/prescriptions";
import { useMemo, useState, type FormEvent } from "react";
import { workoutInputSchema, sessionInputSchema } from "../../../../shared/contracts";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
import type { Studio } from "../../app/useStudio";
/** Owns validation and asynchronous submission while keeping editors presentational.
 * @param {Studio} studio - Current unsaved prescription and persistence actions.
 * @param {"workout" | "session"} mode - Form purpose.
 * @returns {object} Form values, errors, and a validated submission handler.
 */
export function useTrainingSubmission(studio: Studio, mode: "workout" | "session") {
  const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [duration, setDuration] = useState<number>(WORKOUT_DEFAULTS.duration);
  const [error, setError] = useState("");
  const completedItems = useMemo(() => studio.draftItems.map(prescriptionToSession), [studio.draftItems]);
  const [submissionId] = useState(() => createUuid());
  /** Validates the appropriate contract and preserves drafts on transport failure.
   * @param {FormEvent<HTMLFormElement>} event - Submit event.
   * @returns {Promise<void>} Completed save attempt.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      name: studio.draftName,
      notes: studio.draftNotes,
      items: studio.draftItems,
      ...(mode === "workout" && studio.draftWorkoutIds.length ? { includedWorkoutIds: studio.draftWorkoutIds } : {}),
    };
    if (mode === "session") {
      const result = sessionInputSchema.safeParse({ ...draft, items: completedItems, date, duration, submissionId });
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? "Check your session.");
        return;
      }
      setError("");
      if (await studio.persistSession(result.data)) {
        studio.setIsLoggerOpen(false);
        studio.setDraftItems([]);
      }
      return;
    }
    const result = workoutInputSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your workout details.");
      return;
    }
    try {
      resolveWorkout(
        { ...result.data, id: studio.editingWorkoutId },
        studio.workouts,
        workoutIdentities(studio.exercises),
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Invalid composition.");
      return;
    }
    setError("");
    if (await studio.persistWorkout(result.data, studio.editingWorkoutId)) {
      studio.setDraftWorkoutIds([]);
      studio.setIsBuilderOpen(false);
      studio.setDraftItems([]);
    }
  }
  return { date, setDate, duration, setDuration, error, handleSubmit };
}

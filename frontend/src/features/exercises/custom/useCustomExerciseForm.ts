import { useState, type FormEvent } from "react";
import type { Exercise } from "../../../../../shared/contracts";
import { customExerciseInputSchema } from "../../../../../shared/customExerciseContracts";
import type { Studio } from "../../../app/useStudio";
import { createCustomExerciseDraft, prepareCustomExerciseInput, type CustomExerciseDraft } from "./customExerciseForm";
/** Preserves authored fields on validation or transport failure.
 * @param {Studio} studio - Private catalog operations.
 * @param {Exercise | null} exercise - Existing owner content.
 * @returns {object} Editable draft, local error and submit action.
 */
export function useCustomExerciseForm(studio: Studio, exercise: Exercise | null) {
  const [draft, setDraft] = useState(() => createCustomExerciseDraft(exercise));
  const [errorMessage, setErrorMessage] = useState("");
  /** Changes one draft field without touching persisted content.
   * @param {keyof CustomExerciseDraft} field - Text field.
   * @param {string} value - Editable value.
   * @returns {void} Draft update.
   */
  function changeField(field: keyof CustomExerciseDraft, value: string): void {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }
  /** Parses content, saves through the private API and closes only on confirmation.
   * @param {FormEvent<HTMLFormElement>} event - Submit event.
   * @returns {Promise<void>} Save attempt.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage("");
    const parsed = customExerciseInputSchema.safeParse(prepareCustomExerciseInput(draft));
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Check the exercise fields before saving.");
      return;
    }
    if (await studio.persistCustomExercise(parsed.data, exercise?.id)) {
      studio.setSelectedExercise(null);
      studio.setCustomExerciseEditor(null);
    }
  }
  return { draft, errorMessage, changeField, handleSubmit };
}

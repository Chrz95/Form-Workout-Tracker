import { EXERCISE_LIMITS } from "../../../../../shared/exerciseConstants";
import type { CustomFieldsProps } from "./CustomExerciseIdentityFields";
/** Collects readable movement steps, muscle groups and an optional private image reference.
 * @param {CustomFieldsProps} props - Guide fields.
 * @param {CustomExerciseDraft} props.draft - Editable values.
 * @param {(field: keyof CustomExerciseDraft, value: string) => void} props.onFieldChange - Field callback.
 * @returns {JSX.Element} Guide fields.
 */
export function CustomExerciseGuideFields({ draft, onFieldChange }: CustomFieldsProps) {
  return (
    <div>
      <label className="field-label">
        Primary muscles · comma-separated
        <input
          required
          placeholder="e.g. chest, triceps"
          value={draft.primaryMuscles}
          onChange={(event) => onFieldChange("primaryMuscles", event.target.value)}
        />
      </label>
      <label className="field-label">
        Supporting muscles · optional
        <input
          value={draft.secondaryMuscles}
          onChange={(event) => onFieldChange("secondaryMuscles", event.target.value)}
        />
      </label>
      <label className="field-label">
        Instructions · one step per line
        <textarea
          required
          rows={EXERCISE_LIMITS.editorRows}
          value={draft.instructions}
          onChange={(event) => onFieldChange("instructions", event.target.value)}
        />
      </label>
      <label className="field-label">
        Image URL · optional HTTPS link
        <input
          type="url"
          maxLength={EXERCISE_LIMITS.imageUrl}
          placeholder="https://…"
          value={draft.imageUrl}
          onChange={(event) => onFieldChange("imageUrl", event.target.value)}
        />
      </label>
      <small>Linked images load from their original host when viewed. Use an image you are permitted to use.</small>
    </div>
  );
}

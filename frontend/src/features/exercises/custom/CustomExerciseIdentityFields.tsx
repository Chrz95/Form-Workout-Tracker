import { EXERCISE_LEVELS, EXERCISE_LIMITS } from "../../../../../shared/exerciseConstants";
import type { CustomExerciseDraft } from "./customExerciseForm";
/** Draft fields and their single update boundary. */
export interface CustomFieldsProps {
  /** Authored form values. */
  draft: CustomExerciseDraft;
  /** Changes one field; input validation remains centralized. */
  onFieldChange: (field: keyof CustomExerciseDraft, value: string) => void;
}
/** Collects identity and classification without guessing a difficulty.
 * @param {CustomFieldsProps} props - Draft fields.
 * @param {CustomExerciseDraft} props.draft - Editable values.
 * @param {(field: keyof CustomExerciseDraft, value: string) => void} props.onFieldChange - Field callback.
 * @returns {JSX.Element} Identity fields.
 */
export function CustomExerciseIdentityFields({ draft, onFieldChange }: CustomFieldsProps) {
  return (
    <div className="custom-field-grid">
      <label className="field-label">
        Exercise name
        <input
          required
          maxLength={EXERCISE_LIMITS.name}
          value={draft.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
        />
      </label>
      <label className="field-label">
        Difficulty
        <select
          value={draft.level}
          onChange={(event) => onFieldChange("level", event.target.value)}
        >
          {EXERCISE_LEVELS.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Equipment
        <input
          required
          maxLength={EXERCISE_LIMITS.name}
          placeholder="e.g. dumbbell"
          value={draft.equipment}
          onChange={(event) => onFieldChange("equipment", event.target.value)}
        />
      </label>
      <label className="field-label">
        Category
        <input
          required
          maxLength={EXERCISE_LIMITS.name}
          value={draft.category}
          onChange={(event) => onFieldChange("category", event.target.value)}
        />
      </label>
    </div>
  );
}

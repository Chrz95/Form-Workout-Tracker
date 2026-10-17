import { INPUT_LIMITS } from "../../../../shared/constants";
interface ExerciseNoteFieldProps {
  exerciseName: string;
  value?: string;
  onChange: (notes: string) => void;
}
/** Edits a reminder belonging to this exercise within one workout or session.
 * @param {ExerciseNoteFieldProps} props - Note field values and updater.
 * @param {string} props.exerciseName - Accessible exercise label.
 * @param {string} props.value - Existing note, if any.
 * @param {(notes: string) => void} props.onChange - Draft update operation.
 * @returns {JSX.Element} Bounded multiline note input.
 */
export function ExerciseNoteField({ exerciseName, value, onChange }: ExerciseNoteFieldProps) {
  return (
    <label className="field-label exercise-note-field">
      Exercise note <span>optional</span>
      <textarea
        aria-label={`Note for ${exerciseName}`}
        maxLength={INPUT_LIMITS.notes}
        rows={2}
        placeholder="Technique, rest time, or a reminder for this exercise…"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

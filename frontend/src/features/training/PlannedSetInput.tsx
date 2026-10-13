import { INPUT_LIMITS } from "../../../../shared/contracts";
const WEIGHT_STEP = 0.5;
interface PlannedSetInputProps {
  /** Numeric target being edited. */
  field: "reps" | "weight";
  /** Zero-based set position. */
  index: number;
  /** Current entered value. */
  value: number;
  /** Immutable parent updater. */
  onChange: (value: number) => void;
}
/** Accessible bounded field for a single planned target.
 * @param {PlannedSetInputProps} props - Field properties.
 * @param {"reps" | "weight"} props.field - Target kind.
 * @param {number} props.index - Set position.
 * @param {number} props.value - Current value.
 * @param {(value: number) => void} props.onChange - Input callback.
 * @returns {JSX.Element} Numeric target input.
 */
export function PlannedSetInput({ field, index, value, onChange }: PlannedSetInputProps) {
  return (
    <label>
      {field === "reps" ? "Reps" : "kg"}
      <input
        type="number"
        min={field === "reps" ? 1 : 0}
        max={INPUT_LIMITS[field]}
        step={field === "reps" ? 1 : WEIGHT_STEP}
        required
        value={value}
        aria-label={`Set ${index + 1} ${field === "reps" ? "repetitions" : "weight"}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

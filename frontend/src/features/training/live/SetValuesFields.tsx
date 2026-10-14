import { INPUT_LIMITS } from "../../../../../shared/contracts";
import { SET_KIND } from "../../../../../shared/setContracts";
import type { LiveSet, SetField } from "./live.types";
import { LIVE_DEFAULTS } from "./live.constants";
interface SetValuesFieldsProps {
  row: LiveSet;
  onSetChange: <Field extends SetField>(field: Field, value: LiveSet[Field]) => void;
}
/** Uses native labelled controls for actual load, reps, optional effort and set type.
 * @param {SetValuesFieldsProps} props - Editable values.
 * @param {LiveSet} props.row - Current set state.
 * @param {function} props.onSetChange - Typed field updater.
 * @returns {JSX.Element} Set inputs.
 */
export function SetValuesFields({ row, onSetChange }: SetValuesFieldsProps) {
  return (
    <div className="set-values-fields">
      <label>
        Type
        <select
          aria-label="Set type"
          disabled={row.isCompleted}
          value={row.kind}
          onChange={(event) =>
            onSetChange("kind", event.target.value === SET_KIND.warmup ? SET_KIND.warmup : SET_KIND.working)
          }
        >
          <option value={SET_KIND.working}>Working</option>
          <option value={SET_KIND.warmup}>Warm-up</option>
        </select>
      </label>
      <label>
        kg
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={INPUT_LIMITS.weight}
          step={LIVE_DEFAULTS.weightStep}
          disabled={row.isCompleted}
          value={row.weight}
          onChange={(event) => onSetChange("weight", Number(event.target.value))}
        />
      </label>
      <label>
        Reps
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={INPUT_LIMITS.reps}
          disabled={row.isCompleted}
          value={row.reps}
          onChange={(event) => onSetChange("reps", Number(event.target.value))}
        />
      </label>
      <label>
        Effort
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={INPUT_LIMITS.rpe}
          step={LIVE_DEFAULTS.rpeStep}
          placeholder="—"
          title="Optional effort rating from 1 to 10"
          disabled={row.isCompleted}
          value={row.rpe ?? ""}
          onChange={(event) => onSetChange("rpe", event.target.value === "" ? null : Number(event.target.value))}
        />
      </label>
    </div>
  );
}

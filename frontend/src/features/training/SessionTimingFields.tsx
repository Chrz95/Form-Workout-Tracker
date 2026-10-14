import { INPUT_LIMITS } from "../../../../shared/contracts";
interface SessionTimingFieldsProps {
  date: string;
  duration: number;
  onDateChange: (value: string) => void;
  onDurationChange: (value: number) => void;
}
/** Renders calendar date and elapsed minutes as independent labelled controls.
 * @param {SessionTimingFieldsProps} props - Timing properties.
 * @param {string} props.date - Visitor's calendar date.
 * @param {number} props.duration - Completed minutes.
 * @param {(value: string) => void} props.onDateChange - Date updater.
 * @param {(value: number) => void} props.onDurationChange - Duration updater.
 * @returns {JSX.Element} Timing inputs.
 */
export function SessionTimingFields({ date, duration, onDateChange, onDurationChange }: SessionTimingFieldsProps) {
  return (
    <div className="form-columns">
      <label className="field-label">
        Training date
        <input
          type="date"
          required
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </label>
      <label className="field-label">
        Duration · minutes
        <input
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={INPUT_LIMITS.duration}
          value={duration}
          onChange={(event) => onDurationChange(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

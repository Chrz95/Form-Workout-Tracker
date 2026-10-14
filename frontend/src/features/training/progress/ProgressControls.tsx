import { PROGRESS_METRIC } from "./progress.constants";
import type { ProgressMetric } from "./progress.utils";
interface ProgressControlsProps {
  options: { id: string; name: string }[];
  exerciseId: string;
  metric: ProgressMetric;
  onExerciseChange: (value: string) => void;
  onMetricChange: (value: ProgressMetric) => void;
}
/** Chooses a saved exercise and its supported performance metric.
 * @param {ProgressControlsProps} props - Selector properties.
 * @param {object[]} props.options - Saved exercise labels.
 * @param {string} props.exerciseId - Selected exercise.
 * @param {ProgressMetric} props.metric - Selected measurement.
 * @param {(value: string) => void} props.onExerciseChange - Exercise updater.
 * @param {(value: ProgressMetric) => void} props.onMetricChange - Metric updater.
 * @returns {JSX.Element} Labelled selectors.
 */
export function ProgressControls({
  options,
  exerciseId,
  metric,
  onExerciseChange,
  onMetricChange,
}: ProgressControlsProps) {
  return (
    <div className="progress-controls">
      <label>
        Exercise
        <select
          value={exerciseId}
          onChange={(event) => onExerciseChange(event.target.value)}
        >
          {options.map((option) => (
            <option
              key={option.id}
              value={option.id}
            >
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Measure
        <select
          value={metric}
          onChange={(event) => {
            const { value } = event.target;
            if (value === "weight" || value === "reps" || value === "volume") {
              onMetricChange(value);
            }
          }}
        >
          {Object.entries(PROGRESS_METRIC).map(([value, details]) => (
            <option
              key={value}
              value={value}
            >
              {details.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

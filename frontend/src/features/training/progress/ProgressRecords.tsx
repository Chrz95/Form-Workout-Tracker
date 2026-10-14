import type { ProgressPoint } from "./progress.utils";
import { formatProgressValue } from "./progress.utils";
interface ProgressRecordsProps {
  history: ProgressPoint[];
}
/** Presents all-time working-set records without mixing them with warm-up values.
 * @param {ProgressRecordsProps} props - Saved performance data.
 * @param {ProgressPoint[]} props.history - Complete selected exercise history.
 * @returns {JSX.Element} Personal record cards.
 */
export function ProgressRecords({ history }: ProgressRecordsProps) {
  const records = [
    { label: "Heaviest working set", value: Math.max(0, ...history.map((point) => point.weight)), unit: "kg" },
    { label: "Most reps", value: Math.max(0, ...history.map((point) => point.reps)), unit: "reps" },
    { label: "Best working volume", value: Math.max(0, ...history.map((point) => point.volume)), unit: "kg" },
  ];
  return (
    <div className="exercise-records">
      {records.map((record) => (
        <div key={record.label}>
          <span>{record.label}</span>
          <strong>
            {formatProgressValue(record.value)}
            <small>{record.unit}</small>
          </strong>
        </div>
      ))}
    </div>
  );
}

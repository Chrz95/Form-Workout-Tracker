import type { ProgressPoint, ProgressMetric } from "./progress.utils";
import { formatProgressValue } from "./progress.utils";
import { PROGRESS_METRIC } from "./progress.constants";
interface ProgressHistoryProps {
  points: ProgressPoint[];
  metric: ProgressMetric;
}
/** Provides the chart's exact values in an accessible table rather than relying on visual inspection.
 * @param {ProgressHistoryProps} props - History values.
 * @param {ProgressPoint[]} props.points - Displayed chronological observations.
 * @param {ProgressMetric} props.metric - Selected measure.
 * @returns {JSX.Element} Expandable history table.
 */
export function ProgressHistory({ points, metric }: ProgressHistoryProps) {
  return (
    <details className="progress-history">
      <summary>View recorded values</summary>
      <div className="table-scroll">
        <table>
          <caption>Values shown in the exercise progress chart</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Session</th>
              <th scope="col">{PROGRESS_METRIC[metric].label}</th>
              <th scope="col">Working sets</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((point) => (
              <tr key={point.sessionId}>
                <td>{point.date}</td>
                <td>
                  {point.sessionName}
                  {point.isLegacy && <small>Uniform set entry</small>}
                </td>
                <td>
                  {formatProgressValue(point[metric])} {PROGRESS_METRIC[metric].unit}
                </td>
                <td>{point.workingSets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

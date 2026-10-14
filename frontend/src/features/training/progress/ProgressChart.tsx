import { useId } from "react";
import type { ProgressMetric, ProgressPoint } from "./progress.utils";
import { formatProgressValue } from "./progress.utils";
import { CHART_LAYOUT, PROGRESS_METRIC } from "./progress.constants";
import { buildChartGeometry } from "./chart.utils";
interface ProgressChartProps {
  points: ProgressPoint[];
  metric: ProgressMetric;
}
/** Renders a precise SVG trend with an accessible title and native point tooltips.
 * @param {ProgressChartProps} props - Plot data.
 * @param {ProgressPoint[]} props.points - Chronological saved observations.
 * @param {ProgressMetric} props.metric - Selected measure.
 * @returns {JSX.Element} Responsive chart.
 */
export function ProgressChart({ points, metric }: ProgressChartProps) {
  const titleId = useId();
  const geometry = buildChartGeometry(points, metric);
  const label = PROGRESS_METRIC[metric];
  return (
    <div className="progress-chart">
      <svg
        viewBox={`0 0 ${CHART_LAYOUT.width} ${CHART_LAYOUT.height}`}
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          {label.label} across {points.length} saved sessions. Values are listed below.
        </title>
        {CHART_LAYOUT.ticks.map((fraction) => {
          const vertical = geometry.baseline - fraction * geometry.plotHeight;
          return (
            <g key={fraction}>
              <line
                x1={CHART_LAYOUT.left}
                x2={CHART_LAYOUT.width - CHART_LAYOUT.right}
                y1={vertical}
                y2={vertical}
                className="chart-gridline"
              />
              <text
                x={CHART_LAYOUT.left - CHART_LAYOUT.right}
                y={vertical}
                dominantBaseline="middle"
                className="chart-label"
              >
                {formatProgressValue(geometry.maximum * fraction)}
              </text>
            </g>
          );
        })}
        <polyline
          points={geometry.line}
          className="chart-trend"
        />
        {geometry.plotted.map((point, index) => (
          <g key={point.sessionId}>
            <circle
              cx={point.horizontal}
              cy={point.vertical}
              r={CHART_LAYOUT.markerRadius}
              className="chart-point"
            >
              <title>
                {point.date}: {formatProgressValue(point[metric])} {label.unit} · {point.sessionName}
              </title>
            </circle>
            {(index % geometry.labelStride === 0 || index === points.length - 1) && (
              <text
                x={point.horizontal}
                y={CHART_LAYOUT.height - CHART_LAYOUT.top}
                textAnchor="middle"
                className="chart-label"
              >
                {point.date.slice(CHART_LAYOUT.dateLabelOffset)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="chart-caption">
        Sessions in chronological order · {label.unit}
        {points.length === 1 && " · log another session to see a trend"}
      </p>
    </div>
  );
}

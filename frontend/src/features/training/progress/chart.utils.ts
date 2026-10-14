import type { ProgressMetric, ProgressPoint } from "./progress.utils";
import { CHART_LAYOUT } from "./progress.constants";
/** Positions and labels retain the original session identifier. */
export interface ChartPoint extends ProgressPoint {
  horizontal: number;
  vertical: number;
}
/** Maps session observations to a linear value scale and explicit per-session spacing.
 * @param {ProgressPoint[]} points - Visible observations.
 * @param {ProgressMetric} metric - Selected measurement.
 * @returns {object} Accessible SVG geometry.
 */
export function buildChartGeometry(points: ProgressPoint[], metric: ProgressMetric) {
  const maximum = Math.max(CHART_LAYOUT.minimumScale, ...points.map((point) => point[metric]));
  const plotWidth = CHART_LAYOUT.width - CHART_LAYOUT.left - CHART_LAYOUT.right;
  const plotHeight = CHART_LAYOUT.height - CHART_LAYOUT.top - CHART_LAYOUT.bottom;
  const baseline = CHART_LAYOUT.height - CHART_LAYOUT.bottom;
  const plotted = points.map((point, index) => ({
    ...point,
    horizontal:
      CHART_LAYOUT.left +
      (points.length === 1 ? plotWidth / CHART_LAYOUT.middleDivisor : (index * plotWidth) / (points.length - 1)),
    vertical: baseline - (point[metric] / maximum) * plotHeight,
  }));
  const line = plotted.map((point) => `${point.horizontal},${point.vertical}`).join(" ");
  return {
    maximum,
    baseline,
    plotHeight,
    plotted,
    line,
    labelStride: Math.max(1, Math.ceil(points.length / CHART_LAYOUT.maximumDateLabels)),
  };
}

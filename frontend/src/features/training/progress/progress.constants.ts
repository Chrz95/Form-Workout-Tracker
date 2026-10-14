/** Honest per-exercise metrics exclude warm-up volume. */
export const PROGRESS_METRIC = {
  weight: { label: "Heaviest working set", unit: "kg" },
  reps: { label: "Most reps in a working set", unit: "reps" },
  volume: { label: "Working volume", unit: "kg" },
} as const;
/** Accessible SVG chart bounds and tick fractions. */
export const CHART_LAYOUT = {
  width: 720,
  height: 240,
  left: 58,
  right: 24,
  top: 24,
  bottom: 40,
  minimumScale: 1,
  markerRadius: 4,
  ticks: [0, 0.25, 0.5, 0.75, 1],
  middleDivisor: 2,
  maximumPoints: 20,
  maximumDateLabels: 5,
  dateLabelOffset: 5,
} as const;

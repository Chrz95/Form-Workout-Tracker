from pathlib import Path
root=Path('/workspace/scratch/77aed1cbae76/form')
def write(path,content):
 target=root/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(content.strip()+'\n')
files={
'frontend/src/features/training/progress/progress.constants.ts':'''/** Honest per-exercise metrics exclude warm-up volume. */
export const PROGRESS_METRIC = { weight: { label: "Heaviest working set", unit: "kg" }, reps: { label: "Most reps in a working set", unit: "reps" }, volume: { label: "Working volume", unit: "kg" } } as const;
/** Accessible SVG chart bounds and tick fractions. */
export const CHART_LAYOUT = { width: 720, height: 240, left: 58, right: 24, top: 24, bottom: 40, minimumScale: 1, markerRadius: 4, ticks: [0, 0.25, 0.5, 0.75, 1], middleDivisor: 2, maximumPoints: 20, maximumDateLabels: 5 } as const;
''',
'frontend/src/features/training/progress/progress.utils.ts':'''import type { Session } from "../../../../../shared/contracts";
import { SET_KIND } from "../../../../../shared/setContracts";
import { getRecordedSets } from "../live/live.utils";
import { PROGRESS_METRIC } from "./progress.constants";
/** Metric names are constrained by their display catalog. */
export type ProgressMetric = keyof typeof PROGRESS_METRIC;
/** One chronological session point retaining its label for keyboard/table inspection. */
export interface ProgressPoint { sessionId: string; date: string; sessionName: string; weight: number; reps: number; volume: number; workingSets: number; isLegacy: boolean; }
/** Builds honest measurements from working sets, accepting uniform legacy entries.
 * @param {Session[]} sessions - Saved training history.
 * @param {string} exerciseId - Selected movement.
 * @returns {ProgressPoint[]} Chronological measurements.
 */
export function buildProgressPoints(sessions: Session[], exerciseId: string): ProgressPoint[] { return [...sessions].sort((first, second) => first.date.localeCompare(second.date) || first.createdAt.localeCompare(second.createdAt)).flatMap((session) => { const item = session.items.find((entry) => entry.exerciseId === exerciseId); if (!item) { return []; } const working = getRecordedSets(item).filter((set) => set.kind === SET_KIND.working); if (!working.length) { return []; } return [{ sessionId: session.id, date: session.date, sessionName: session.name, weight: Math.max(...working.map((set) => set.weight)), reps: Math.max(...working.map((set) => set.reps)), volume: working.reduce((total, set) => total + set.weight * set.reps, 0), workingSets: working.length, isLegacy: !item.performedSets }]; }); }
/** Formats recorded values without inflating their precision.
 * @param {number} value - Recorded or calculated metric.
 * @returns {string} Human-readable number.
 */
export function formatProgressValue(value: number) { return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value); }
''',
'frontend/src/features/training/progress/chart.utils.ts':'''import type { ProgressMetric, ProgressPoint } from "./progress.utils";
import { CHART_LAYOUT } from "./progress.constants";
/** Positions and labels retain the original session identifier. */
export interface ChartPoint extends ProgressPoint { horizontal: number; vertical: number; }
/** Maps session observations to a linear value scale and explicit per-session spacing.
 * @param {ProgressPoint[]} points - Visible observations.
 * @param {ProgressMetric} metric - Selected measurement.
 * @returns {object} Accessible SVG geometry.
 */
export function buildChartGeometry(points: ProgressPoint[], metric: ProgressMetric) { const maximum = Math.max(CHART_LAYOUT.minimumScale, ...points.map((point) => point[metric])); const plotWidth = CHART_LAYOUT.width - CHART_LAYOUT.left - CHART_LAYOUT.right; const plotHeight = CHART_LAYOUT.height - CHART_LAYOUT.top - CHART_LAYOUT.bottom; const baseline = CHART_LAYOUT.height - CHART_LAYOUT.bottom; const plotted = points.map((point, index) => ({ ...point, horizontal: CHART_LAYOUT.left + (points.length === 1 ? plotWidth / CHART_LAYOUT.middleDivisor : index * plotWidth / (points.length - 1)), vertical: baseline - point[metric] / maximum * plotHeight })); const line = plotted.map((point) => `${point.horizontal},${point.vertical}`).join(" "); return { maximum, baseline, plotHeight, plotted, line, labelStride: Math.max(1, Math.ceil(points.length / CHART_LAYOUT.maximumDateLabels)) }; }
''',
'frontend/src/features/training/progress/ProgressChart.tsx':'''import { useId } from "react";
import type { ProgressMetric, ProgressPoint } from "./progress.utils";
import { formatProgressValue } from "./progress.utils";
import { CHART_LAYOUT, PROGRESS_METRIC } from "./progress.constants";
import { buildChartGeometry } from "./chart.utils";
interface ProgressChartProps { points: ProgressPoint[]; metric: ProgressMetric; }
/** Renders a precise SVG trend with an accessible title and native point tooltips.
 * @param {ProgressChartProps} props - Plot data.
 * @param {ProgressPoint[]} props.points - Chronological saved observations.
 * @param {ProgressMetric} props.metric - Selected measure.
 * @returns {JSX.Element} Responsive chart.
 */
export function ProgressChart({ points, metric }: ProgressChartProps) {
 const titleId = useId(); const geometry = buildChartGeometry(points, metric); const label = PROGRESS_METRIC[metric];
 return <div className="progress-chart"><svg viewBox={`0 0 ${CHART_LAYOUT.width} ${CHART_LAYOUT.height}`} role="img" aria-labelledby={titleId}><title id={titleId}>{label.label} across {points.length} saved sessions. Values are listed below.</title>{CHART_LAYOUT.ticks.map((fraction) => { const vertical = geometry.baseline - fraction * geometry.plotHeight; return <g key={fraction}><line x1={CHART_LAYOUT.left} x2={CHART_LAYOUT.width - CHART_LAYOUT.right} y1={vertical} y2={vertical} className="chart-gridline"/><text x={CHART_LAYOUT.left - CHART_LAYOUT.right} y={vertical} dominantBaseline="middle" className="chart-label">{formatProgressValue(geometry.maximum * fraction)}</text></g>; })}<polyline points={geometry.line} className="chart-trend"/>{geometry.plotted.map((point, index) => <g key={point.sessionId}><circle cx={point.horizontal} cy={point.vertical} r={CHART_LAYOUT.markerRadius} className="chart-point"><title>{point.date}: {formatProgressValue(point[metric])} {label.unit} · {point.sessionName}</title></circle>{(index % geometry.labelStride === 0 || index === points.length - 1) && <text x={point.horizontal} y={CHART_LAYOUT.height - CHART_LAYOUT.top} textAnchor="middle" className="chart-label">{point.date.slice("2026-".length)}</text>}</g>)}</svg><p className="chart-caption">Sessions in chronological order · {label.unit}{points.length === 1 && " · log another session to see a trend"}</p></div>;
}''',
'frontend/src/features/training/progress/ProgressHistory.tsx':'''import type { ProgressPoint, ProgressMetric } from "./progress.utils";
import { formatProgressValue } from "./progress.utils";
import { PROGRESS_METRIC } from "./progress.constants";
interface ProgressHistoryProps { points: ProgressPoint[]; metric: ProgressMetric; }
/** Provides the chart's exact values in an accessible table rather than relying on visual inspection.
 * @param {ProgressHistoryProps} props - History values.
 * @param {ProgressPoint[]} props.points - Displayed chronological observations.
 * @param {ProgressMetric} props.metric - Selected measure.
 * @returns {JSX.Element} Expandable history table.
 */
export function ProgressHistory({ points, metric }: ProgressHistoryProps) {
 return <details className="progress-history"><summary>View recorded values</summary><div className="table-scroll"><table><caption>Values shown in the exercise progress chart</caption><thead><tr><th scope="col">Date</th><th scope="col">Session</th><th scope="col">{PROGRESS_METRIC[metric].label}</th><th scope="col">Working sets</th></tr></thead><tbody>{[...points].reverse().map((point) => <tr key={point.sessionId}><td>{point.date}</td><td>{point.sessionName}{point.isLegacy && <small>Uniform set entry</small>}</td><td>{formatProgressValue(point[metric])} {PROGRESS_METRIC[metric].unit}</td><td>{point.workingSets}</td></tr>)}</tbody></table></div></details>;
}''',
'frontend/src/features/training/progress/ExerciseProgress.tsx':'''import { useState } from "react";
import type { StudioProps } from "../../../app/useStudio";
import { buildProgressPoints, formatProgressValue, type ProgressMetric } from "./progress.utils";
import { CHART_LAYOUT, PROGRESS_METRIC } from "./progress.constants";
import { ProgressChart } from "./ProgressChart";
import { ProgressHistory } from "./ProgressHistory";
/** Adds exercise-specific records and trends derived exclusively from saved sessions.
 * @param {StudioProps} props - Progress source.
 * @param {Studio} props.studio - Saved history and catalog labels.
 * @returns {JSX.Element} Exercise analysis panel.
 */
export function ExerciseProgress({ studio }: StudioProps) {
 const [selectedId, setSelectedId] = useState(""); const [metric, setMetric] = useState<ProgressMetric>("weight");
 const ids = [...new Set(studio.sessions.flatMap((session) => session.items.map((item) => item.exerciseId)))];
 const options = ids.map((id) => ({ id, name: studio.exercises.find((exercise) => exercise.id === id)?.name ?? id })).sort((first, second) => first.name.localeCompare(second.name));
 const exerciseId = ids.includes(selectedId) ? selectedId : options[0]?.id ?? "";
 const history = buildProgressPoints(studio.sessions, exerciseId); const points = history.slice(-CHART_LAYOUT.maximumPoints);
 const records = [{ label: "Heaviest working set", value: Math.max(0, ...history.map((point) => point.weight)), unit: "kg" }, { label: "Most reps", value: Math.max(0, ...history.map((point) => point.reps)), unit: "reps" }, { label: "Best working volume", value: Math.max(0, ...history.map((point) => point.volume)), unit: "kg" }];
 return <section className="exercise-progress-panel"><div className="exercise-progress-heading"><div><span className="eyebrow">YOUR MOVEMENT, OVER TIME</span><h3>Exercise progress</h3></div>{options.length > 0 && <div className="progress-controls"><label>Exercise<select value={exerciseId} onChange={(event) => setSelectedId(event.target.value)}>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label>Measure<select value={metric} onChange={(event) => { const value = event.target.value; if (value === "weight" || value === "reps" || value === "volume") { setMetric(value); } }}>{Object.entries(PROGRESS_METRIC).map(([value, details]) => <option key={value} value={value}>{details.label}</option>)}</select></label></div>}</div>{points.length > 0 ? <div><div className="exercise-records">{records.map((record) => <div key={record.label}><span>{record.label}</span><strong>{formatProgressValue(record.value)}<small>{record.unit}</small></strong></div>)}</div><ProgressChart points={points} metric={metric}/><ProgressHistory points={points} metric={metric}/><p className="progress-data-note">Warm-ups are excluded. {history.length > CHART_LAYOUT.maximumPoints ? `Showing the latest ${CHART_LAYOUT.maximumPoints} of ${history.length} sessions.` : "Only saved working sets are included."}</p></div> : <div className="progress-empty"><p>{options.length ? "This movement has no saved working sets yet." : "Your first saved workout will start your exercise history."}</p><button className="button secondary" onClick={studio.openLogger}>Record a session</button></div>}</section>;
}''',
}
for path,content in files.items():write(path,content)
# Connect the new domain hook to the existing app without importing feature state into transport modules.
p=root/'frontend/src/app/useStudio.ts';text=p.read_text();text='import { useLiveWorkout } from "../features/training/live/useLiveWorkout";\n'+text;text=text.replace('  const records = useRecords();','  const records = useRecords();\n  const live = useLiveWorkout({ sessions: records.sessions, isPending: records.isPending, apiError: records.apiError, persistSession: records.persistSession });');text=text.replace('    ...records,','    ...records,\n    live,');p.write_text(text)
p=root/'frontend/src/app/App.tsx';text=p.read_text();text='import { LiveWorkoutDialog } from "../features/training/live/LiveWorkoutDialog";\nimport { ActiveWorkoutBanner } from "../features/training/live/ActiveWorkoutBanner";\n'+text;text=text.replace('        {studio.page === PAGE.library', '        <ActiveWorkoutBanner studio={studio} />\n        {studio.page === PAGE.library',1);text=text.replace('      {studio.isBuilderOpen', '      {studio.live.isOpen && <LiveWorkoutDialog studio={studio} />}\n      {studio.isBuilderOpen',1);p.write_text(text)
p=root/'frontend/src/features/training/WorkoutsPage.tsx';text=p.read_text().replace('onClick={() => studio.openWorkout(workout, true)}','onClick={() => { studio.setApiError(""); studio.live.startWorkout(workout); }}').replace('Log this workout <','Start workout <');p.write_text(text)
p=root/'frontend/src/features/training/ProgressPage.tsx';text=p.read_text();text='import { ExerciseProgress } from "./progress/ExerciseProgress";\n'+text;text=text.replace('      <section className="activity-panel">','      <ExerciseProgress studio={studio} />\n      <section className="activity-panel">');p.write_text(text)
p=root/'frontend/src/features/training/JournalPage.tsx';text=p.read_text();text='import { CompletedSetList } from "./live/CompletedSetList";\n'+text;start=text.index('                <div className="journal-items">');end=text.index('                {session.notes',start);text=text[:start]+'                <CompletedSetList items={session.items} exercises={studio.exercises} />\n'+text[end:];p.write_text(text)
# Introduce a separate editor footer so the existing component stays below its hard size limit.
write('frontend/src/features/training/WorkoutEditorActions.tsx','''import { Play, Save } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { StudioProps } from "../../app/useStudio";
/** Exposes both durable routine saving and immediate in-memory training.
 * @param {StudioProps} props - Builder model.
 * @param {Studio} props.studio - Current prescription and live actions.
 * @returns {JSX.Element} Builder footer.
 */
export function WorkoutEditorActions({ studio }: StudioProps) {
 /** Begins training without implying the routine was saved. */
 function startDraft() { studio.setApiError(""); studio.live.startWorkout({ name: studio.draftName, notes: studio.draftNotes, items: studio.draftItems }); studio.setIsBuilderOpen(false); }
 return <div className="modal-actions builder-actions"><span>{studio.draftItems.length} exercises · current draft</span><div><button className="button secondary" type="button" disabled={studio.draftItems.length === 0} onClick={startDraft}><Play size={ICON_SIZE.miniature}/>Start workout</button><button className="button primary" disabled={studio.isPending} type="submit"><Save size={ICON_SIZE.standard}/>{studio.isPending ? "Saving…" : "Save workout"}</button></div></div>;
}''')
p=root/'frontend/src/features/training/WorkoutEditor.tsx';text=p.read_text();text='import { WorkoutEditorActions } from "./WorkoutEditorActions";\n'+text;text=text.replace('import { ICON_SIZE } from "../../../../shared/constants";\n','').replace('import { Save } from "lucide-react";\n','');start=text.index('        <div className="modal-actions">');end=text.index('      </form>',start);text=text[:start]+'        <WorkoutEditorActions studio={studio} />\n'+text[end:];p.write_text(text)
print('Progress charts and app integration written')

import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
import { ProgressControls } from "./ProgressControls";
import { ProgressRecords } from "./ProgressRecords";
import { useState } from "react";
import type { StudioProps } from "../../../app/useStudio";
import { buildProgressPoints, type ProgressMetric } from "./progress.utils";
import { CHART_LAYOUT } from "./progress.constants";
import { ProgressChart } from "./ProgressChart";
import { ProgressHistory } from "./ProgressHistory";
/** Adds exercise-specific records and trends derived exclusively from saved sessions.
 * @param {StudioProps} props - Progress source.
 * @param {Studio} props.studio - Saved history and catalog labels.
 * @returns {JSX.Element} Exercise analysis panel.
 */
export function ExerciseProgress({ studio }: StudioProps) {
  const [selectedId, setSelectedId] = useState("");
  const [metric, setMetric] = useState<ProgressMetric>("weight");
  const ids = [
    ...new Set(
      studio.sessions.flatMap((session) =>
        session.items.map(
          (item) =>
            studio.exercises.find((exercise) => matchesExerciseId(exercise, item.exerciseId))?.id ?? item.exerciseId,
        ),
      ),
    ),
  ];
  const options = ids
    .map((id) => ({ id, name: studio.exercises.find((exercise) => matchesExerciseId(exercise, id))?.name ?? id }))
    .sort((first, second) => first.name.localeCompare(second.name));
  const exerciseId = ids.includes(selectedId) ? selectedId : (options[0]?.id ?? "");
  const history = buildProgressPoints(
    studio.sessions,
    exerciseId,
    studio.exercises.find((exercise) => exercise.id === exerciseId)?.legacyIds ?? [],
  );
  const points = history.slice(-CHART_LAYOUT.maximumPoints);
  return (
    <section className="exercise-progress-panel">
      <div className="exercise-progress-heading">
        <div>
          <span className="eyebrow">YOUR MOVEMENT, OVER TIME</span>
          <h3>Exercise progress</h3>
        </div>
        {options.length > 0 && (
          <ProgressControls
            options={options}
            exerciseId={exerciseId}
            metric={metric}
            onExerciseChange={setSelectedId}
            onMetricChange={setMetric}
          />
        )}
      </div>
      {points.length > 0 ? (
        <div>
          <ProgressRecords history={history} />
          <ProgressChart
            points={points}
            metric={metric}
          />
          <ProgressHistory
            points={points}
            metric={metric}
          />
          <p className="progress-data-note">
            Warm-ups are excluded.{" "}
            {history.length > CHART_LAYOUT.maximumPoints
              ? `Showing the latest ${CHART_LAYOUT.maximumPoints} of ${history.length} sessions.`
              : "Only saved working sets are included."}
          </p>
        </div>
      ) : (
        <div className="progress-empty">
          <p>
            {options.length
              ? "This movement has no saved working sets yet."
              : "Your first saved workout will start your exercise history."}
          </p>
          <button
            className="button secondary"
            onClick={studio.openLogger}
          >
            Record a session
          </button>
        </div>
      )}
    </section>
  );
}

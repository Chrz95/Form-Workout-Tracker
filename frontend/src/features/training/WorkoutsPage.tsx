import { ICON_SIZE } from "../../../../shared/constants";
import { Layers, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { WorkoutsToolbar } from "./WorkoutsToolbar";
import type { StudioProps } from "../../app/useStudio";
/** Shows durable custom routines with edit, delete and logging actions.
 * @param {StudioProps} props - Saved workout model.
 * @param {Studio} props.studio - Routines and actions.
 * @returns {JSX.Element} Routine library.
 */
export function WorkoutsPage({ studio }: StudioProps) {
  return (
    <section>
      <WorkoutsToolbar studio={studio} />
      {studio.workouts.length === 0 ? (
        <div className="onboarding-empty">
          <span className="empty-icon">
            <Layers size={ICON_SIZE.emptyState} />
          </span>
          <span className="eyebrow">YOUR ROUTINE STARTS HERE</span>
          <h2>A workout that feels like you.</h2>
          <p>
            Combine your favorite movements into custom lists.
            <br />
            Set your reps, choose your load, and come back stronger.
          </p>
          <button
            className="button primary"
            onClick={studio.createWorkout}
          >
            Build your first workout <ArrowUpRight size={ICON_SIZE.standard} />
          </button>
          {!studio.isConnected && <small>Connect your Express API to save and sync lists.</small>}
        </div>
      ) : (
        <div className="workouts-grid">
          {studio.workouts.map((workout) => (
            <article
              className="workout-card"
              key={workout.id}
            >
              <span className="eyebrow">YOUR CUSTOM ROUTINE</span>
              <h2>{workout.name}</h2>
              <p>{workout.notes || "Your movements. Your intention."}</p>
              <div className="workout-exercises">
                {workout.items.map((item) => (
                  <span key={item.exerciseId}>
                    {studio.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? item.exerciseId}
                  </span>
                ))}
              </div>
              <div className="workout-meta">
                {workout.items.length} movements · {workout.items.reduce((total, item) => total + item.sets, 0)} sets
              </div>
              <div className="card-actions">
                <button
                  className="button primary"
                  onClick={() => {
                    studio.setApiError("");
                    studio.live.startWorkout(workout);
                  }}
                >
                  Start workout <ArrowUpRight size={ICON_SIZE.standard} />
                </button>
                <button
                  className="icon-button"
                  onClick={() => studio.openWorkout(workout, false)}
                  aria-label={`Edit ${workout.name}`}
                >
                  <Pencil size={ICON_SIZE.standard} />
                </button>
                <button
                  className="icon-button"
                  disabled={studio.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete “${workout.name}”?`)) {
                      void studio.removeRecord("workouts", workout.id);
                    }
                  }}
                  aria-label={`Delete ${workout.name}`}
                >
                  <Trash2 size={ICON_SIZE.standard} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

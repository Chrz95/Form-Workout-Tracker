import { useMemo, useState } from "react";
import { WorkoutLibraryControls } from "./WorkoutLibraryControls";
import {
  createWorkoutLibrary,
  selectWorkoutLibrary,
  type WorkoutSort,
  type WorkoutFilter,
} from "./workoutLibrary.utils";
import { WorkoutCard } from "./WorkoutCard";
import { ICON_SIZE } from "../../../../shared/constants";
import { Layers, ArrowUpRight } from "lucide-react";
import { WorkoutsToolbar } from "./WorkoutsToolbar";
import type { StudioProps } from "../../app/useStudio";
/** Shows durable custom routines with edit, delete and logging actions.
 * @param {StudioProps} props - Saved workout model.
 * @param {Studio} props.studio - Routines and actions.
 * @returns {JSX.Element} Routine library.
 */
export function WorkoutsPage({ studio }: StudioProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<WorkoutSort>("newest");
  const [filter, setFilter] = useState<WorkoutFilter>("all");
  const library = useMemo(
    () => createWorkoutLibrary(studio.workouts, studio.exercises),
    [studio.workouts, studio.exercises],
  );
  const visible = selectWorkoutLibrary(library, { query, sort, filter });
  return (
    <section>
      <WorkoutsToolbar studio={studio} />
      {studio.workouts.length === 0 ? (
        <div className="onboarding-empty">
          <span className="empty-icon">
            <Layers size={ICON_SIZE.emptyState} />
          </span>
          <span className="eyebrow">YOUR WORKOUT COLLECTION</span>
          <h2>Your training. Your structure.</h2>
          <p>
            Create a routine with your favorite exercises.
            <br />
            Set your targets once. Make it part of your week.
          </p>
          <button
            className="button primary"
            onClick={studio.createWorkout}
          >
            Build your first workout <ArrowUpRight size={ICON_SIZE.standard} />
          </button>
          {!studio.isConnected && (
            <small>
              {studio.isAutomaticConnection
                ? "Your saved training loads automatically when the server is ready."
                : "Connect training to save and sync your routines."}
            </small>
          )}
        </div>
      ) : (
        <div>
          <WorkoutLibraryControls
            query={query}
            sort={sort}
            filter={filter}
            count={visible.length}
            total={studio.workouts.length}
            onQuery={setQuery}
            onSort={setSort}
            onFilter={setFilter}
          />
          {!visible.length && (
            <p className="onboarding-empty">No workouts match this view. Try another search or reset it.</p>
          )}
          <div className="workouts-grid">
            {visible.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                studio={studio}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

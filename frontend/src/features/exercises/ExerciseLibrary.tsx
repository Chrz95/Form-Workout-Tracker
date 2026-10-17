import { ICON_SIZE } from "../../../../shared/constants";
import { ArrowDown, ArrowUpRight, Layers } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
import { Hero } from "./Hero";
import { LibrarySkeleton } from "./LibrarySkeleton";
import { LibraryFilters } from "./LibraryFilters";
import { ExerciseCard } from "./ExerciseCard";
/** Composes searchable catalog cards and an unsaved selection tray.
 * @param {StudioProps} props - Library state.
 * @param {Studio} props.studio - Catalog model.
 * @returns {JSX.Element} Exercise discovery screen.
 */
export function ExerciseLibrary({ studio }: StudioProps) {
  return (
    <div>
      <Hero studio={studio} />
      <LibraryFilters studio={studio} />
      {studio.catalogError ? (
        <div
          className="empty-state"
          role="alert"
        >
          {studio.catalogError}
          <button
            className="button secondary"
            onClick={() => location.reload()}
          >
            Retry library
          </button>
        </div>
      ) : studio.exercises.length === 0 ? (
        <LibrarySkeleton />
      ) : studio.filteredExercises.length === 0 ? (
        <div className="empty-state">
          <h3>No movements found</h3>
          <p>Try another search or reset your filters.</p>
          <button
            className="button secondary"
            onClick={studio.resetFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="exercise-grid">
          {studio.filteredExercises.slice(0, studio.visibleCount).map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              studio={studio}
            />
          ))}
        </div>
      )}
      {studio.filteredExercises.length > studio.visibleCount && (
        <div className="load-more">
          <button
            className="button secondary"
            onClick={() => studio.setVisibleCount(studio.visibleCount + WORKOUT_DEFAULTS.pageSize)}
          >
            Explore more movements <ArrowDown size={ICON_SIZE.standard} />
          </button>
        </div>
      )}
      {studio.draftItems.length > 0 && (
        <div className="selection-tray">
          <Layers size={ICON_SIZE.standard} />
          <div>
            <strong>{studio.draftItems.length} exercises in your workout</strong>
            <small>Draft workout · not yet saved</small>
          </div>
          <button
            className="button lime"
            onClick={() => studio.setIsBuilderOpen(true)}
          >
            Review workout <ArrowUpRight size={ICON_SIZE.standard} />
          </button>
        </div>
      )}
    </div>
  );
}

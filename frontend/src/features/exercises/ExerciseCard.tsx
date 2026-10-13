import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { ICON_SIZE } from "../../../../shared/constants";
import { Plus, Bookmark, ArrowUpRight, Images, Dumbbell } from "lucide-react";
import type { Exercise } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { ExerciseImage } from "./ExerciseImage";
import { getExerciseThumbnail } from "./exerciseImage.utils";
interface ExerciseCardProps {
  exercise: Exercise;
  studio: Studio;
}
/** Presents an exercise with its actual demonstration image.
 * @param {ExerciseCardProps} props - Card properties.
 * @param {Exercise} props.exercise - Catalog entry.
 * @param {Studio} props.studio - Detail, bookmark and draft actions.
 * @returns {JSX.Element} Exercise card.
 */
export function ExerciseCard({ exercise, studio }: ExerciseCardProps) {
  const isAdded = studio.draftSelectedItems.some((item) => matchesExerciseId(exercise, item.exerciseId));
  const isBookmarked = studio.favorites.includes(exercise.id);
  return (
    <article className="exercise-card">
      <div className="exercise-image">
        <button
          className="image-link"
          onClick={() => studio.setSelectedExercise(exercise)}
          aria-label={`View ${exercise.name}`}
        >
          {exercise.images.length > 0 ? (
            <ExerciseImage
              src={getExerciseThumbnail(exercise)}
              alt={`${exercise.name} instructional image`}
              isLazy
            />
          ) : (
            <Dumbbell size={ICON_SIZE.emptyState} />
          )}
          <span className="image-open">
            <ArrowUpRight size={ICON_SIZE.standard} />
          </span>
        </button>
        <span className="muscle-badge">{exercise.primaryMuscles[0] ?? "General movement"}</span>
        <button
          className={`bookmark-button ${isBookmarked ? "bookmarked" : ""}`}
          aria-label={`${isBookmarked ? "Unbookmark" : "Bookmark"} ${exercise.name}`}
          aria-pressed={isBookmarked}
          onClick={() => studio.toggleFavorite(exercise.id)}
        >
          <Bookmark
            size={ICON_SIZE.standard}
            fill={isBookmarked ? "currentColor" : "none"}
          />
        </button>
        <span className="motion-badge">
          <Images size={ICON_SIZE.miniature} /> {exercise.images.length ? "Image guide" : "Text guide"}
        </span>
      </div>
      <div className="exercise-card-body">
        <div className="exercise-meta">
          <span className={`level-dot ${exercise.level}`} />
          {exercise.level}
          <span>·</span>
          {exercise.equipment ?? "No equipment"}
        </div>
        <button
          className="exercise-name"
          onClick={() => studio.setSelectedExercise(exercise)}
        >
          {exercise.name}
        </button>
        <div className="card-bottom">
          <span>{exercise.mechanic ?? exercise.category}</span>
          <button
            className={`add-exercise ${isAdded ? "is-added" : ""}`}
            disabled={isAdded}
            onClick={() => studio.addExercise(exercise.id)}
            aria-label={`Add ${exercise.name} to workout`}
          >
            <Plus size={ICON_SIZE.standard} />
            {isAdded ? "Added" : "Add to workout"}
          </button>
        </div>
      </div>
    </article>
  );
}

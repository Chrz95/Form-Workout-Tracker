import type { StudioProps } from "../../../app/useStudio";
import { CUSTOM_EXERCISE_PREFIX } from "../../../../../shared/exerciseConstants";
/** Edits private entries or requests deletion while retaining referenced history.
 * @param {StudioProps} props - Selected exercise model.
 * @param {Studio} props.studio - Owner actions and current selection.
 * @returns {JSX.Element | null} Owner controls for private entries.
 */
export function CustomExerciseActions({ studio }: StudioProps) {
  const exercise = studio.selectedExercise;
  if (!exercise?.id.startsWith(CUSTOM_EXERCISE_PREFIX)) {
    return null;
  }
  return (
    <div className="catalog-actions">
      <button
        className="button secondary"
        onClick={() => {
          studio.setApiError("");
          studio.setSelectedExercise(null);
          studio.setCustomExerciseEditor(exercise);
        }}
      >
        Edit exercise
      </button>
      <button
        className="text-button"
        disabled={
          studio.isPending ||
          studio.draftItems.some((item) => item.exerciseId === exercise.id) ||
          studio.live.workout?.exercises.some((item) => item.exerciseId === exercise.id)
        }
        onClick={async () => {
          if (
            window.confirm(`Delete “${exercise.name}”? Exercises used in saved records cannot be deleted.`) &&
            (await studio.removeCustomExercise(exercise.id))
          ) {
            studio.setSelectedExercise(null);
          }
        }}
      >
        Delete unused exercise
      </button>
      {studio.apiError && <p role="alert">{studio.apiError}</p>}
    </div>
  );
}

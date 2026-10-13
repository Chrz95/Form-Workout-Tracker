import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { ICON_SIZE } from "../../../../shared/constants";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
/** Searches the library inside the workout editor.
 * @param {StudioProps} props - Picker model.
 * @param {Studio} props.studio - Available exercises and selection action.
 * @returns {JSX.Element} Inline exercise picker.
 */
export function ExercisePicker({ studio }: StudioProps) {
  const [search, setSearch] = useState("");
  const matches = studio.exercises
    .filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(search.toLowerCase()) &&
        !studio.draftSelectedItems.some((item) => matchesExerciseId(exercise, item.exerciseId)),
    )
    .slice(0, WORKOUT_DEFAULTS.pageSize);
  return (
    <details className="exercise-picker">
      <summary>
        <Plus size={ICON_SIZE.standard} />
        Add exercises from the library
      </summary>
      <label className="search-field">
        <Search size={ICON_SIZE.standard} />
        <input
          placeholder="Find a movement…"
          aria-label="Search exercises to add"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="picker-results">
        {matches.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => studio.addExercise(exercise.id)}
            type="button"
          >
            <span>
              {exercise.name}
              <small>{exercise.primaryMuscles.join(", ")}</small>
            </span>
            <Plus size={ICON_SIZE.miniature} />
          </button>
        ))}
        {matches.length === 0 && <p>No more matching exercises.</p>}
      </div>
    </details>
  );
}

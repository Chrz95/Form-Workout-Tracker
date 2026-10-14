import type { Exercise } from "../../../../../shared/contracts";
import type { Studio } from "../../../app/useStudio";
import { findAlternatives } from "./alternatives.utils";
/** Discovery candidate properties. */
interface ExerciseAlternativesProps {
  /** Current exercise, excluded from its own matches. */
  exercise: Exercise;
  /** Full catalog and draft selection. */
  studio: Studio;
}
/** Opens candidate instructions before any exercise is added or replaced.
 * @param {ExerciseAlternativesProps} props - Discovery state.
 * @param {Exercise} props.exercise - Selected exercise.
 * @param {Studio} props.studio - Catalog and detail action.
 * @returns {JSX.Element} Related exercise discovery.
 */
export function ExerciseAlternatives({ exercise, studio }: ExerciseAlternativesProps) {
  const matches = findAlternatives(exercise, studio.exercises, []);
  return (
    <details className="exercise-alternatives">
      <summary>Explore related movements ({matches.length})</summary>
      <p>Matches share listed primary muscles. Equipment, technique and load can differ.</p>
      <div className="alternative-list">
        {matches.map((candidate) => (
          <button
            key={candidate.id}
            className="alternative-button"
            onClick={() => studio.setSelectedExercise(candidate)}
          >
            <strong>{candidate.name}</strong>
            <small>
              {candidate.equipment ?? "No equipment"} · {candidate.primaryMuscles.join(", ")}
            </small>
          </button>
        ))}
        {!matches.length && <p>No matches for the primary muscles supplied by this source.</p>}
      </div>
    </details>
  );
}

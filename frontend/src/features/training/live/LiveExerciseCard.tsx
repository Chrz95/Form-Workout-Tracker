import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
import { Plus, ArrowUpRight } from "lucide-react";
import { ICON_SIZE, INPUT_LIMITS } from "../../../../../shared/constants";
import { SET_KIND } from "../../../../../shared/setContracts";
import type { Studio } from "../../../app/useStudio";
import type { LiveExercise } from "./live.types";
import { getPreviousSet } from "./live.utils";
import { LiveSetRow } from "./LiveSetRow";
import { getExerciseThumbnail } from "../../exercises";
interface LiveExerciseCardProps {
  exercise: LiveExercise;
  studio: Studio;
}
/** Groups per-set values, references and movement guidance in the active workout.
 * @param {LiveExerciseCardProps} props - Movement properties.
 * @param {LiveExercise} props.exercise - Active movement.
 * @param {Studio} props.studio - Catalog and live model.
 * @returns {JSX.Element} Live movement card.
 */
export function LiveExerciseCard({ exercise, studio }: LiveExerciseCardProps) {
  const catalogEntry = studio.exercises.find((entry) => matchesExerciseId(entry, exercise.exerciseId));
  return (
    <section className="live-exercise-card">
      <header>
        <img
          src={getExerciseThumbnail(catalogEntry) ?? "/icon.svg"}
          alt=""
        />
        <div>
          <h3>{catalogEntry?.name ?? exercise.exerciseId}</h3>
          <p>
            {exercise.previous
              ? `Last session: ${exercise.previous.date}`
              : "Your first recorded session for this movement"}
          </p>
        </div>
        {catalogEntry && (
          <button
            className="text-button"
            onClick={() => studio.setSelectedExercise(catalogEntry)}
            aria-label={`View ${catalogEntry.name} technique`}
          >
            Guide <ArrowUpRight size={ICON_SIZE.miniature} />
          </button>
        )}
      </header>
      {exercise.previous && (
        <div className="previous-session-note">
          <span>
            {exercise.previous.item.performedSets ? "Previous actual sets" : "Previous entry used uniform set values"}
          </span>
          <button
            className="text-button"
            onClick={() => studio.live.copyPrevious(exercise.exerciseId)}
          >
            Use last session
          </button>
        </div>
      )}
      <div className="live-set-list">
        {exercise.sets.map((row, position) => (
          <LiveSetRow
            key={row.localId}
            row={row}
            position={position}
            previous={getPreviousSet(exercise.sets, row.localId, exercise.previous?.item)}
            exerciseId={exercise.exerciseId}
            live={studio.live}
          />
        ))}
      </div>
      <div className="add-set-actions">
        <button
          className="text-button"
          disabled={exercise.sets.length >= INPUT_LIMITS.sets}
          onClick={() => studio.live.addSet(exercise.exerciseId, SET_KIND.working)}
        >
          <Plus size={ICON_SIZE.miniature} />
          Add working set
        </button>
        <button
          className="text-button"
          disabled={exercise.sets.length >= INPUT_LIMITS.sets}
          onClick={() => studio.live.addSet(exercise.exerciseId, SET_KIND.warmup)}
        >
          Add warm-up set
        </button>
      </div>
    </section>
  );
}

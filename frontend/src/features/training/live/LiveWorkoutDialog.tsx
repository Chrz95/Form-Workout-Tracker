import { Check, Clock, ChevronDown } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { StudioProps } from "../../../app/useStudio";
import { Modal } from "../../../components/ui/Modal";
import { LiveExerciseCard } from "./LiveExerciseCard";
import { RestTimer } from "./RestTimer";
import { WorkoutReview } from "./WorkoutReview";
import { useClock } from "./useClock";
import { LIVE_DEFAULTS, LIVE_PHASE } from "./live.constants";
import { formatTimer } from "./live.utils";
/** Keeps training and completion review in a resumable native modal.
 * @param {StudioProps} props - Studio state.
 * @param {Studio} props.studio - Current training session.
 * @returns {JSX.Element | null} Active workout dialog.
 */
export function LiveWorkoutDialog({ studio }: StudioProps) {
  const { workout } = studio.live;
  const now = useClock(workout?.phase === LIVE_PHASE.training);
  if (!workout) {
    return null;
  }
  if (workout.phase !== LIVE_PHASE.training) {
    return <WorkoutReview studio={studio} />;
  }
  const completed = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.isCompleted).length,
    0,
  );
  const total = workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0);
  return (
    <Modal
      title={workout.name}
      onClose={() => studio.live.setIsOpen(false)}
      isWide
    >
      <div className="live-session-meta">
        <span>
          <Clock size={ICON_SIZE.miniature} />
          {formatTimer(Math.max(0, (now - workout.startedAt) / LIVE_DEFAULTS.millisecondsPerSecond))} elapsed
        </span>
        <span>
          {completed} / {total} sets completed
        </span>
        <button
          className="text-button"
          onClick={() => studio.live.setIsOpen(false)}
        >
          <ChevronDown size={ICON_SIZE.miniature} />
          Minimize
        </button>
      </div>
      <p className="live-draft-notice">
        Current workout stays in this tab until you save. Only checked sets go into your journal.
      </p>
      <RestTimer rest={studio.live.rest} />
      <div className="live-exercises">
        {workout.exercises.map((exercise) => (
          <LiveExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            studio={studio}
          />
        ))}
      </div>
      {studio.live.error && (
        <p
          className="form-error"
          role="alert"
        >
          {studio.live.error}
        </p>
      )}
      <div className="modal-actions">
        <button
          className="text-button danger"
          onClick={() => {
            if (window.confirm("Discard this unfinished workout and all its sets?")) {
              studio.live.discardWorkout();
            }
          }}
        >
          Discard workout
        </button>
        <button
          className="button primary"
          disabled={completed === 0}
          onClick={studio.live.finishWorkout}
        >
          <Check size={ICON_SIZE.standard} />
          Finish workout
        </button>
      </div>
    </Modal>
  );
}

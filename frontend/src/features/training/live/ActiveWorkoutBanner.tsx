import { Play } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { StudioProps } from "../../../app/useStudio";
import { LIVE_PHASE } from "./live.constants";
/** Keeps an unfinished session discoverable while browsing other screens.
 * @param {StudioProps} props - Studio model.
 * @param {Studio} props.studio - Current active training.
 * @returns {JSX.Element | null} Resume banner.
 */
export function ActiveWorkoutBanner({ studio }: StudioProps) {
  const { workout } = studio.live;
  if (!workout || workout.phase === LIVE_PHASE.saved) {
    return null;
  }
  const completed = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.isCompleted).length,
    0,
  );
  return (
    <div className="active-workout-banner">
      <span className="status-dot online" />
      <div>
        <strong>{workout.name}</strong>
        <small>{completed} completed sets · unsaved in this tab</small>
      </div>
      <button
        className="button primary"
        onClick={() => studio.live.setIsOpen(true)}
      >
        <Play size={ICON_SIZE.miniature} />
        {workout.phase === LIVE_PHASE.review ? "Review & save" : "Resume workout"}
      </button>
    </div>
  );
}

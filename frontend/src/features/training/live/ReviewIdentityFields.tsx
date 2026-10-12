import { INPUT_LIMITS } from "../../../../../shared/constants";
import type { StudioProps } from "../../../app/useStudio";
import { SessionTimingFields } from "../SessionTimingFields";
/** Edits session identity and timing separately from the completion review.
 * @param {StudioProps} props - Review controls.
 * @param {Studio} props.studio - Live review model.
 * @returns {JSX.Element | null} Metadata controls.
 */
export function ReviewIdentityFields({ studio }: StudioProps) {
  const { workout } = studio.live;
  if (!workout) {
    return null;
  }
  return (
    <div>
      <label className="field-label">
        Session name
        <input
          required
          maxLength={INPUT_LIMITS.name}
          value={workout.name}
          onChange={(event) => studio.live.updateWorkout("name", event.target.value)}
        />
      </label>
      <SessionTimingFields
        date={workout.date}
        duration={workout.duration}
        onDateChange={(value) => studio.live.updateWorkout("date", value)}
        onDurationChange={(value) => studio.live.updateWorkout("duration", value)}
      />
    </div>
  );
}

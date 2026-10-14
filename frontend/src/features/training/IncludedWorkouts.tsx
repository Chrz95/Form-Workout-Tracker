import type { StudioProps } from "../../app/useStudio";
import { IncludedWorkout } from "./IncludedWorkout";
/** Lists references separately from the parent's editable direct targets.
 * @param {StudioProps} props - Current composition.
 * @param {Studio} props.studio - Draft and source records.
 * @returns {JSX.Element} Component list.
 */
export function IncludedWorkouts({ studio }: StudioProps) {
  return (
    <div className="included-workouts">
      {studio.draftWorkoutIds.map((id, index) => (
        <IncludedWorkout
          key={id}
          id={id}
          index={index}
          studio={studio}
        />
      ))}
    </div>
  );
}

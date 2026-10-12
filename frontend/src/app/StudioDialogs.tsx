import type { StudioProps } from "./useStudio";
import { ExerciseDetail } from "../features/exercises/ExerciseDetail";
import { CustomExerciseEditor } from "../features/exercises/custom/CustomExerciseEditor";
import { SubstitutionDialog } from "../features/exercises/alternatives/SubstitutionDialog";
import { LiveWorkoutDialog } from "../features/training/live/LiveWorkoutDialog";
import { WorkoutEditor } from "../features/training/WorkoutEditor";
import { SessionEditor } from "../features/training/SessionEditor";
import { ConnectionDialog } from "../features/training/ConnectionDialog";
/** Composes active dialogs while each feature owns its form behavior.
 * @param {StudioProps} props - Dialog state.
 * @param {Studio} props.studio - Selection and visibility model.
 * @returns {JSX.Element} Dialog layer.
 */
export function StudioDialogs({ studio }: StudioProps) {
  return (
    <div>
      {studio.selectedExercise && (
        <ExerciseDetail
          key={studio.selectedExercise.id}
          exercise={studio.selectedExercise}
          studio={studio}
        />
      )}
      {studio.live.isOpen && <LiveWorkoutDialog studio={studio} />}
      {studio.isBuilderOpen && <WorkoutEditor studio={studio} />}
      {studio.isLoggerOpen && <SessionEditor studio={studio} />}
      {studio.customExerciseEditor && (
        <CustomExerciseEditor
          key={studio.customExerciseEditor === "new" ? "new" : studio.customExerciseEditor.id}
          studio={studio}
          exercise={studio.customExerciseEditor === "new" ? null : studio.customExerciseEditor}
        />
      )}
      {studio.substitutionExerciseId && <SubstitutionDialog studio={studio} />}
      {studio.isConnectionOpen && <ConnectionDialog studio={studio} />}
    </div>
  );
}

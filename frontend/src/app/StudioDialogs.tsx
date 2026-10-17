import { WorkoutPreview } from "../features/training/WorkoutPreview";
import type { StudioProps } from "./useStudio";
import { ExerciseDetail } from "../features/exercises/ExerciseDetail";
import { CustomExerciseEditor } from "../features/exercises/custom/CustomExerciseEditor";
import { SubstitutionDialog } from "../features/exercises/alternatives/SubstitutionDialog";
import { LiveWorkoutDialog } from "../features/training/live/LiveWorkoutDialog";
import { WorkoutEditor } from "../features/training/WorkoutEditor";
import { SessionEditor } from "../features/training/SessionEditor";
import { ConnectionDialog } from "../features/training/ConnectionDialog";
import { PlanEditor } from "../features/calendar/PlanEditor";
/** Composes active dialogs while each feature owns its form behavior.
 * @param {StudioProps} props - Dialog state.
 * @param {Studio} props.studio - Selection and visibility model.
 * @returns {JSX.Element} Dialog layer.
 */
export function StudioDialogs({ studio }: StudioProps) {
  return (
    <div>
      {studio.live.isOpen && <LiveWorkoutDialog studio={studio} />}
      {studio.isBuilderOpen && (
        <WorkoutEditor
          key={`workout-editor-${studio.editingWorkoutId ?? "draft"}`}
          studio={studio}
        />
      )}
      {studio.isLoggerOpen && <SessionEditor studio={studio} />}
      {studio.customExerciseEditor && (
        <CustomExerciseEditor
          key={studio.customExerciseEditor === "new" ? "new" : studio.customExerciseEditor.id}
          studio={studio}
          exercise={studio.customExerciseEditor === "new" ? null : studio.customExerciseEditor}
        />
      )}
      {studio.substitutionExerciseId && <SubstitutionDialog studio={studio} />}
      {studio.isConnectionOpen && !studio.isAutomaticConnection && <ConnectionDialog studio={studio} />}
      {studio.planEditor && (
        <PlanEditor
          key={studio.planEditor.plan?.id ?? studio.planEditor.date}
          studio={studio}
        />
      )}
      {studio.workoutPreviewId && (
        <WorkoutPreview
          key={studio.workoutPreviewId}
          studio={studio}
        />
      )}
      {studio.selectedExercise && (
        <ExerciseDetail
          key={studio.selectedExercise.id}
          exercise={studio.selectedExercise}
          studio={studio}
        />
      )}
    </div>
  );
}

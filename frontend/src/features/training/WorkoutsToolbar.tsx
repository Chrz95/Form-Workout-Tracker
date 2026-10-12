import { Plus } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { StudioProps } from "../../app/useStudio";
import { ExportCsvButton } from "./export/ExportCsvButton";
/** Combines routine creation and export of saved prescriptions.
 * @param {StudioProps} props - Saved routine model.
 * @param {Studio} props.studio - Routines, catalog and create action.
 * @returns {JSX.Element} Routine toolbar.
 */
export function WorkoutsToolbar({ studio }: StudioProps) {
  return (
    <div className="section-toolbar">
      <p>{studio.workouts.length} saved workouts · built by you</p>
      <ExportCsvButton input={{ kind: "workouts", records: studio.workouts, exercises: studio.exercises }} />
      <button
        className="button primary"
        onClick={studio.createWorkout}
      >
        <Plus size={ICON_SIZE.standard} />
        Create workout
      </button>
    </div>
  );
}

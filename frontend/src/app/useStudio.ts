import { useLiveWorkout } from "../features/training/live/useLiveWorkout";
import { useState } from "react";
import type { Exercise, WorkoutItem, Workout } from "../../../shared/contracts";
import { WORKOUT_DEFAULTS } from "../../../shared/constants";
import { PAGE } from "./app.constants";
import { useCatalog } from "../features/exercises/useCatalog";
import { useRecords } from "../features/training/useRecords";
/** Coordinates navigation and reversible, unsaved workout drafts.
 * @returns {object} Screen state and actions.
 */
export function useStudio() {
  const records = useRecords();
  const catalog = useCatalog(records.customExercises);
  const live = useLiveWorkout({
    sessions: records.sessions,
    isPending: records.isPending,
    apiError: records.apiError,
    persistSession: records.persistSession,
  });
  const [page, setPage] = useState<keyof typeof PAGE>(PAGE.library);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [customExerciseEditor, setCustomExerciseEditor] = useState<Exercise | "new" | null>(null);
  const [substitutionExerciseId, setSubstitutionExerciseId] = useState<string | null>(null);
  const [isConnectionOpen, setIsConnectionOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<WorkoutItem[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | undefined>();
  /** Adds an exercise exactly once to the unsaved prescription.
   * @param {string} exerciseId - Catalog identifier.
   */
  function addExercise(exerciseId: string) {
    setDraftItems((previous) =>
      previous.some((item) => item.exerciseId === exerciseId)
        ? previous
        : [
            ...previous,
            { exerciseId, sets: WORKOUT_DEFAULTS.sets, reps: WORKOUT_DEFAULTS.reps, weight: WORKOUT_DEFAULTS.weight },
          ],
    );
    records.setMessage("Exercise added to your current workout draft.");
  }
  /** Updates a prescription value.
   * @param {string} exerciseId - Selected item.
   * @param {keyof Omit<WorkoutItem, "exerciseId">} field - Numeric prescription field.
   * @param {number} value - User input.
   */
  function updateItem(exerciseId: string, field: keyof Omit<WorkoutItem, "exerciseId">, value: number) {
    setDraftItems((previous) =>
      previous.map((item) => (item.exerciseId === exerciseId ? { ...item, [field]: value } : item)),
    );
  }
  /** Opens a clean workout draft. */
  function createWorkout() {
    setDraftName("");
    setDraftNotes("");
    setDraftItems([]);
    setEditingWorkoutId(undefined);
    setIsBuilderOpen(true);
  }
  /** Opens an existing routine for editing or logging.
   * @param {Workout} workout - Saved list.
   * @param {boolean} isLogging - Whether to open the journal entry.
   */
  function openWorkout(workout: Workout, isLogging: boolean) {
    setDraftName(workout.name);
    setDraftNotes(workout.notes);
    setDraftItems(workout.items.map((item) => ({ ...item })));
    setEditingWorkoutId(isLogging ? undefined : workout.id);
    setIsBuilderOpen(!isLogging);
    setIsLoggerOpen(isLogging);
  }
  /** Creates an empty daily entry, preserving an existing exercise draft. */
  function openLogger() {
    setEditingWorkoutId(undefined);
    setIsLoggerOpen(true);
  }
  return {
    customExerciseEditor,
    setCustomExerciseEditor,
    substitutionExerciseId,
    setSubstitutionExerciseId,
    ...catalog,
    ...records,
    live,
    page,
    setPage,
    selectedExercise,
    setSelectedExercise,
    isConnectionOpen,
    setIsConnectionOpen,
    isBuilderOpen,
    setIsBuilderOpen,
    isLoggerOpen,
    setIsLoggerOpen,
    draftItems,
    setDraftItems,
    draftName,
    setDraftName,
    draftNotes,
    setDraftNotes,
    editingWorkoutId,
    addExercise,
    updateItem,
    createWorkout,
    openWorkout,
    openLogger,
  };
}
/** Entire studio view model for screen-level composition. */
export type Studio = ReturnType<typeof useStudio>;
/** Props for studio screens; control state stays in hooks. */
export interface StudioProps {
  studio: Studio;
}

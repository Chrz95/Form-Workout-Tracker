import { createWorkoutCopy } from "../../../shared/workoutCopy";
import { resolveWorkout, workoutIdentities, type WorkoutNode } from "../../../shared/workoutGraph";
import { updatePrescription } from "../../../shared/prescriptions";
import { matchesExerciseId } from "../../../shared/exerciseIdentity";
import { useLiveWorkout } from "../features/training/live/useLiveWorkout";
import { useMemo, useState } from "react";
import type { Exercise, WorkoutItem, Workout } from "../../../shared/contracts";
import { WORKOUT_DEFAULTS } from "../../../shared/constants";
import { PAGE } from "./app.constants";
import { useCatalog } from "../features/exercises/useCatalog";
import { useRecords } from "../features/training/useRecords";
import type { Plan } from "../../../shared/calendarContracts";
/** Coordinates navigation and reversible, unsaved workout drafts.
 * @returns {object} Screen state and actions.
 */
export function useStudio() {
  const records = useRecords();
  const [draftItems, setDraftItems] = useState<WorkoutItem[]>([]);
  const catalog = useCatalog(records.customExercises, records.workouts, draftItems);
  const exerciseIdentities = useMemo(() => workoutIdentities(catalog.exercises), [catalog.exercises]);
  const live = useLiveWorkout({
    exercises: catalog.exercises,
    sessions: records.sessions,
    isPending: records.isPending,
    apiError: records.apiError,
    persistSession: records.persistSession,
  });
  const [page, setPage] = useState<keyof typeof PAGE>(PAGE.library);
  const [workoutPreviewId, setWorkoutPreviewId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [customExerciseEditor, setCustomExerciseEditor] = useState<Exercise | "new" | null>(null);
  const [substitutionExerciseId, setSubstitutionExerciseId] = useState<string | null>(null);
  const [planEditor, setPlanEditor] = useState<{ date: string; plan?: Plan } | null>(null);
  const [isConnectionOpen, setIsConnectionOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [draftWorkoutIds, setDraftWorkoutIds] = useState<string[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | undefined>();
  const draftSelectedItems = useMemo(() => {
    if (!draftWorkoutIds.length) {
      return draftItems;
    }
    try {
      return resolveWorkout(
        {
          name: draftName || "Current draft",
          id: editingWorkoutId,
          items: draftItems,
          includedWorkoutIds: draftWorkoutIds,
        },
        records.workouts,
        exerciseIdentities,
      );
    } catch {
      return draftItems;
    }
  }, [draftItems, draftName, editingWorkoutId, draftWorkoutIds, records.workouts, exerciseIdentities]);
  /** Adds an exercise exactly once to the unsaved prescription.
   * @param {string} exerciseId - Catalog identifier.
   */
  function addExercise(exerciseId: string) {
    const exercise = catalog.exercises.find((entry) => matchesExerciseId(entry, exerciseId));
    if (
      draftSelectedItems.some((item) =>
        exercise ? matchesExerciseId(exercise, item.exerciseId) : item.exerciseId === exerciseId,
      )
    ) {
      records.setMessage("This exercise is already part of your draft or an included workout.");
      return;
    }
    setDraftItems((previous) =>
      previous.some(
        (item) =>
          catalog.exercises
            .find((exercise) => matchesExerciseId(exercise, exerciseId))
            ?.legacyIds?.includes(item.exerciseId) || item.exerciseId === exerciseId,
      )
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
   * @param {"sets" | "reps" | "weight"} field - Numeric prescription field.
   * @param {number} value - User input.
   */
  function updateItem(exerciseId: string, field: "sets" | "reps" | "weight", value: number) {
    setDraftItems((previous) =>
      previous.map((item) => (item.exerciseId === exerciseId ? updatePrescription(item, field, value) : item)),
    );
  }
  /** Opens a clean workout draft. */
  function createWorkout() {
    setDraftName("");
    setDraftNotes("");
    setDraftItems([]);
    setDraftWorkoutIds([]);
    setEditingWorkoutId(undefined);
    setIsBuilderOpen(true);
  }
  /** Creates a new unsaved routine without sharing mutable targets with its source.
   * @param {Workout} workout - Source routine.
   */
  function duplicateWorkout(workout: Workout) {
    const copy = createWorkoutCopy(workout);
    try {
      resolveWorkout(copy, records.workouts, exerciseIdentities);
    } catch (error) {
      records.setApiError(error instanceof Error ? error.message : "This routine cannot be duplicated.");
      return;
    }
    setDraftName(copy.name);
    setDraftNotes(copy.notes);
    setDraftItems(copy.items);
    setDraftWorkoutIds(copy.includedWorkoutIds ?? []);
    setEditingWorkoutId(undefined);
    setIsLoggerOpen(false);
    setIsBuilderOpen(true);
    records.setApiError("");
    records.setMessage(
      copy.includedWorkoutIds?.length
        ? "New unsaved draft created. Component workouts stay linked. Review and save your copy."
        : "New unsaved draft created. Review and save to create a separate workout.",
    );
  }
  /** Opens an existing routine for editing or logging.
   * @param {Workout} workout - Saved list.
   * @param {boolean} isLogging - Whether to open the journal entry.
   */
  function openWorkout(workout: Workout, isLogging: boolean) {
    setDraftName(workout.name);
    setDraftNotes(workout.notes);
    try {
      setDraftItems(
        isLogging
          ? resolveWorkout(workout, records.workouts, exerciseIdentities)
          : workout.items.map((item) => ({ ...item })),
      );
    } catch (error) {
      records.setApiError(error instanceof Error ? error.message : "Could not open this workout.");
      return;
    }
    setDraftWorkoutIds(isLogging ? [] : [...(workout.includedWorkoutIds ?? [])]);
    setEditingWorkoutId(isLogging ? undefined : workout.id);
    setIsBuilderOpen(!isLogging);
    setIsLoggerOpen(isLogging);
  }
  /** Creates an empty daily entry, preserving an existing exercise draft. */
  function openLogger() {
    if (draftWorkoutIds.length) {
      try {
        setDraftItems(
          resolveWorkout(
            { name: draftName, items: draftItems, includedWorkoutIds: draftWorkoutIds },
            records.workouts,
            exerciseIdentities,
          ),
        );
      } catch (error) {
        records.setApiError(error instanceof Error ? error.message : "Invalid composition.");
        return;
      }
      setDraftWorkoutIds([]);
    }
    setEditingWorkoutId(undefined);
    setIsLoggerOpen(true);
  }
  /** Starts a resolved snapshot without retaining mutable links in an active session.
   * @param {WorkoutNode & { notes: string }} workout - Saved routine or draft.
   * @returns {boolean} Whether resolution succeeded.
   */
  function startWorkout(workout: WorkoutNode & { notes: string }): boolean {
    try {
      const items = resolveWorkout(workout, records.workouts, exerciseIdentities);
      records.setApiError("");
      live.startWorkout({ name: workout.name, notes: workout.notes, items });
      return true;
    } catch (error) {
      records.setApiError(error instanceof Error ? error.message : "Could not start this workout.");
      return false;
    }
  }
  return {
    workoutPreviewId,
    setWorkoutPreviewId,
    draftSelectedItems,
    draftWorkoutIds,
    setDraftWorkoutIds,
    startWorkout,
    planEditor,
    setPlanEditor,
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
    duplicateWorkout,
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

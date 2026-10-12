import { useState } from "react";
import { INPUT_LIMITS, sessionInputSchema, type WorkoutItem } from "../../../../../shared/contracts";
import { performedSetSchema, SET_KIND, type PerformedSet } from "../../../../../shared/setContracts";
import type { LiveDependencies, LiveSet, LiveWorkout, SetField } from "./live.types";
import { createLiveSet, createLiveWorkout, getPreviousSet, prepareSession } from "./live.utils";
import { LIVE_DEFAULTS, LIVE_PHASE } from "./live.constants";
import { useRestTimer } from "./useRestTimer";
/** Manages live training without creating an alternate persistent datastore.
 * @param {LiveDependencies} dependencies - Saved history and persistence boundary.
 * @returns {object} Current workout, reversible actions and validated completion.
 */
export function useLiveWorkout(dependencies: LiveDependencies) {
  const [workout, setWorkout] = useState<LiveWorkout | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const rest = useRestTimer();
  /** Opens a routine or resumes an existing unfinished session.
   * @param {{name: string; notes: string; items: WorkoutItem[]}} input - Planned session.
   */
  function startWorkout(input: { name: string; notes: string; items: WorkoutItem[] }) {
    if (workout && workout.phase !== LIVE_PHASE.saved) {
      setIsOpen(true);
      return;
    }
    if (!input.items.length) {
      setError("Add at least one exercise before starting a workout.");
      return;
    }
    setWorkout(createLiveWorkout(input, dependencies.sessions, Date.now()));
    setError("");
    setIsOpen(true);
    rest.skipRest();
  }
  /** Updates an unfinished set with the field's exact value type.
   * @param {string} exerciseId - Catalog identifier.
   * @param {string} localId - Stable set key.
   * @param {Field} field - Edited set field.
   * @param {LiveSet[Field]} value - Typed input.
   */
  function updateSet<Field extends SetField>(exerciseId: string, localId: string, field: Field, value: LiveSet[Field]) {
    setError("");
    setWorkout((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map((set) =>
                      set.localId === localId && !set.isCompleted ? { ...set, [field]: value } : set,
                    ),
                  }
                : exercise,
            ),
          }
        : null,
    );
  }
  /** Validates an actual set before marking it complete; completion starts rest.
   * @param {string} exerciseId - Selected movement.
   * @param {string} localId - Set key.
   */
  function toggleSet(exerciseId: string, localId: string) {
    const row = workout?.exercises
      .find((exercise) => exercise.exerciseId === exerciseId)
      ?.sets.find((set) => set.localId === localId);
    if (!row || workout?.phase !== LIVE_PHASE.training) {
      return;
    }
    const validated = performedSetSchema.safeParse(row);
    if (!row.isCompleted && !validated.success) {
      setError("Check reps, weight and effort before completing this set.");
      return;
    }
    setWorkout((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map((set) =>
                      set.localId === localId ? { ...set, isCompleted: !set.isCompleted } : set,
                    ),
                  }
                : exercise,
            ),
          }
        : null,
    );
    setError("");
    if (row.isCompleted) {
      rest.skipRest();
    } else {
      rest.startRest();
    }
  }
  /** Adds an editable row within the shared API limit.
   * @param {string} exerciseId - Movement identifier.
   * @param {PerformedSet["kind"]} kind - Working or preparation set.
   */
  function addSet(exerciseId: string, kind: PerformedSet["kind"]) {
    setWorkout((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) => {
              if (exercise.exerciseId !== exerciseId || exercise.sets.length >= INPUT_LIMITS.sets) {
                return exercise;
              }
              const last = exercise.sets.at(-1);
              return last ? { ...exercise, sets: [...exercise.sets, createLiveSet(last, kind)] } : exercise;
            }),
          }
        : null,
    );
  }
  /** Removes only unfinished rows while keeping a movement's final row.
   * @param {string} exerciseId - Movement identifier.
   * @param {string} localId - Row key.
   */
  function removeSet(exerciseId: string, localId: string) {
    setWorkout((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId && exercise.sets.length > 1
                ? { ...exercise, sets: exercise.sets.filter((set) => set.localId !== localId || set.isCompleted) }
                : exercise,
            ),
          }
        : null,
    );
  }
  /** Copies matching historical values while leaving today's effort/completion untouched.
   * @param {string} exerciseId - Movement identifier.
   * @param {string} [localId] - Optional individual row.
   */
  function copyPrevious(exerciseId: string, localId?: string) {
    setWorkout((previous) =>
      previous
        ? {
            ...previous,
            exercises: previous.exercises.map((exercise) =>
              exercise.exerciseId === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map((set) => {
                      const recorded = getPreviousSet(exercise.sets, set.localId, exercise.previous?.item);
                      return recorded && !set.isCompleted && (!localId || set.localId === localId)
                        ? { ...set, reps: recorded.reps, weight: recorded.weight }
                        : set;
                    }),
                  }
                : exercise,
            ),
          }
        : null,
    );
  }
  /** Prepares a review containing completed sets only. */
  function finishWorkout() {
    if (!workout || !workout.exercises.some((exercise) => exercise.sets.some((set) => set.isCompleted))) {
      setError("Complete at least one set before finishing.");
      return;
    }
    const finishedAt = Date.now();
    setWorkout({
      ...workout,
      finishedAt,
      duration: Math.max(
        LIVE_DEFAULTS.minimumDuration,
        Math.ceil((finishedAt - workout.startedAt) / LIVE_DEFAULTS.millisecondsPerMinute),
      ),
      phase: LIVE_PHASE.review,
    });
    rest.skipRest();
    setError("");
  }
  /** Updates review metadata without altering its completed exercise values.
   * @param {Field} field - Editable review field.
   * @param {LiveWorkout[Field]} value - Exact field value.
   */
  function updateWorkout<Field extends "name" | "notes" | "date" | "duration">(
    field: Field,
    value: LiveWorkout[Field],
  ) {
    setWorkout((previous) => (previous ? { ...previous, [field]: value } : null));
  }
  /** Returns to the same session without losing completed rows. */
  function continueWorkout() {
    setWorkout((previous) => (previous ? { ...previous, phase: LIVE_PHASE.training, finishedAt: null } : null));
    setError("");
  }
  /** Saves only a validated review; failure retains every completed row for retry.
   * @returns {Promise<void>} Save attempt.
   */
  async function saveCompletion() {
    if (!workout || workout.phase !== LIVE_PHASE.review || dependencies.isPending) {
      return;
    }
    const validated = sessionInputSchema.safeParse(prepareSession(workout));
    if (!validated.success) {
      setError(validated.error.issues[0]?.message ?? "Check your session details.");
      return;
    }
    setError("");
    if (await dependencies.persistSession(validated.data)) {
      setWorkout((previous) => (previous ? { ...previous, phase: LIVE_PHASE.saved } : null));
    }
  }
  /** Clears a draft only after an explicit discard or a completed saved session. */
  function discardWorkout() {
    setWorkout(null);
    setIsOpen(false);
    setError("");
    rest.skipRest();
  }
  return {
    workout,
    isOpen,
    setIsOpen,
    error: error || dependencies.apiError,
    rest,
    startWorkout,
    updateSet,
    toggleSet,
    addSet,
    removeSet,
    copyPrevious,
    finishWorkout,
    updateWorkout,
    continueWorkout,
    saveCompletion,
    discardWorkout,
  };
}
/** Live UI contract is derived from the hook instead of duplicated. */
export type LiveModel = ReturnType<typeof useLiveWorkout>;
/** Working-set discriminant re-exported for feature callers. */
export { SET_KIND };

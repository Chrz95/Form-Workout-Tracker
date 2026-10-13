import { useState } from "react";
import type { StudioProps } from "../../app/useStudio";
import { composeWorkout } from "../../../../shared/prescriptions";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph";
import { IncludedWorkouts } from "./IncludedWorkouts";
/** Includes component references or makes independent copies.
 * @param {StudioProps} props - Builder state.
 * @param {Studio} props.studio - Saved routines and draft.
 * @returns {JSX.Element} Composition controls.
 */
export function WorkoutComposer({ studio }: StudioProps) {
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const choices = studio.workouts.filter((workout) => workout.id !== studio.editingWorkoutId);
  /** Validates an entire composition before changing the draft.
   * @param {boolean} copy - Copies targets instead of retaining a reference.
   */
  function addWorkout(copy: boolean) {
    const workout = choices.find((entry) => entry.id === selectedId);
    if (!workout) {
      return;
    }
    try {
      const identities = workoutIdentities(studio.exercises);
      const copied = copy
        ? composeWorkout(studio.draftItems, resolveWorkout(workout, studio.workouts, identities), studio.exercises)
        : null;
      const includedWorkoutIds = copy ? studio.draftWorkoutIds : [...studio.draftWorkoutIds, workout.id];
      const items = copied?.items ?? studio.draftItems;
      resolveWorkout(
        { id: studio.editingWorkoutId, name: studio.draftName || "Current draft", items, includedWorkoutIds },
        studio.workouts,
        identities,
      );
      studio.setDraftItems(items);
      studio.setDraftWorkoutIds(includedWorkoutIds);
      setNotice(
        copy
          ? `Copied ${workout.name}. ${copied?.skipped ?? 0} duplicate movements skipped.`
          : `${workout.name} included. Its latest saved targets will be used when you start.`,
      );
      setSelectedId("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not combine these workouts.");
    }
  }
  return (
    <section
      className="workout-composer"
      aria-label="Combine saved workouts"
    >
      <IncludedWorkouts studio={studio} />
      <label className="field-label">
        Add another workout
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">{choices.length ? "Choose a saved workout…" : "Save a workout to reuse it here"}</option>
          {choices.map((workout) => (
            <option
              key={workout.id}
              value={workout.id}
            >
              {workout.name}
            </option>
          ))}
        </select>
      </label>
      <div className="catalog-actions">
        <button
          type="button"
          className="button secondary"
          disabled={!selectedId}
          onClick={() => addWorkout(false)}
        >
          Include workout
        </button>
        <button
          type="button"
          className="text-button"
          disabled={!selectedId}
          onClick={() => addWorkout(true)}
        >
          Copy exercises instead
        </button>
      </div>
      <p className="modal-description">
        Included workouts follow their saved targets. Copies stay independent. Direct exercises run first, followed by
        component workouts in the order shown.
      </p>
      {notice && <output>{notice}</output>}
    </section>
  );
}

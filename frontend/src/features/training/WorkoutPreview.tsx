import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { resolveWorkoutEntries, workoutIdentities, type ResolvedWorkoutEntry } from "../../../../shared/workoutGraph";
import { workoutInputSchema } from "../../../../shared/contracts";
import { WorkoutPreviewActions } from "./WorkoutPreviewActions";
import { WorkoutPreviewItem } from "./WorkoutPreviewItem";
import { WorkoutUsage } from "./WorkoutUsage";
/** Reviews complete draft or saved routine targets without editing the source.
 * @param {StudioProps} props - Preview selection.
 * @param {Studio} props.studio - Current records and reversible draft.
 * @returns {JSX.Element} Read-only resolved workout dialog.
 */
export function WorkoutPreview({ studio }: StudioProps) {
  const isDraft = studio.workoutPreviewId === "draft";
  const saved = studio.workouts.find(
    (workout) => workout.id === (isDraft ? studio.editingWorkoutId : studio.workoutPreviewId),
  );
  const input = isDraft
    ? {
        id: studio.editingWorkoutId,
        name: studio.draftName || "Current draft",
        notes: studio.draftNotes,
        items: studio.draftItems,
        ...(studio.draftWorkoutIds.length ? { includedWorkoutIds: studio.draftWorkoutIds } : {}),
      }
    : saved;
  let entries: ResolvedWorkoutEntry[] = [];
  let error = "";
  try {
    if (!input) {
      throw new Error("This saved workout is no longer available. Reconnect to reload your library.");
    }
    const validation = workoutInputSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message ?? "Check your planned targets.");
    }
    entries = resolveWorkoutEntries(input, studio.workouts, workoutIdentities(studio.exercises));
  } catch (failure) {
    error = failure instanceof Error ? failure.message : "Review your workout targets.";
  }
  const parents = saved ? studio.workouts.filter((parent) => parent.includedWorkoutIds?.includes(saved.id)) : [];
  /** Starts an independent resolved session while preserving unsaved targets on failure. */
  function start() {
    if (!error && input && studio.startWorkout(input)) {
      studio.setWorkoutPreviewId(null);
      if (isDraft) {
        studio.setIsBuilderOpen(false);
      }
    }
  }
  return (
    <Modal
      className="workout-preview"
      title={`Review: ${input?.name ?? "Workout"}`}
      onClose={() => studio.setWorkoutPreviewId(null)}
      isWide
    >
      <p className="modal-description">Tap a movement for its guide or expand its targets. Start when you’re ready.</p>
      {input?.notes && <p>{input.notes}</p>}
      {error ? (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      ) : (
        <div className="workout-preview-summary">
          {entries.length} movements · {entries.reduce((sum, entry) => sum + entry.item.sets, 0)} planned sets
        </div>
      )}
      <WorkoutUsage
        parents={parents}
        studio={studio}
      />
      <ol className="workout-preview-list">
        {entries.map((entry, index) => (
          <WorkoutPreviewItem
            key={entry.item.exerciseId}
            entry={entry}
            position={index + 1}
            studio={studio}
          />
        ))}
      </ol>
      <WorkoutPreviewActions
        studio={studio}
        saved={saved}
        isDraft={isDraft}
        hasError={Boolean(error)}
        onClose={() => studio.setWorkoutPreviewId(null)}
        onStart={start}
      />
    </Modal>
  );
}

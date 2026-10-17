import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
import { ExerciseMuscles } from "./ExerciseMuscles";
import { ExerciseGuides } from "./ExerciseGuides";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { ICON_SIZE } from "../../../../shared/constants";
import { Plus } from "lucide-react";
import type { Exercise } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { Demonstration } from "./Demonstration";
import { ExerciseVideos } from "./ExerciseVideos";
import { ExerciseSource } from "./ExerciseSource";
import { CustomExerciseActions } from "./custom/CustomExerciseActions";
import { ExerciseAlternatives } from "./alternatives/ExerciseAlternatives";
interface ExerciseDetailProps {
  exercise: Exercise;
  studio: Studio;
}
/** Displays exact catalog instructions alongside photographic motion frames.
 * @param {ExerciseDetailProps} props - Detail properties.
 * @param {Exercise} props.exercise - Selected catalog exercise.
 * @param {Studio} props.studio - Selection actions.
 * @returns {JSX.Element} Exercise detail dialog.
 */
export function ExerciseDetail({ exercise, studio }: ExerciseDetailProps) {
  const isAdded = studio.draftSelectedItems.some((item) => matchesExerciseId(exercise, item.exerciseId));
  return (
    <Modal
      className="exercise-detail"
      title={exercise.name}
      onClose={() => studio.setSelectedExercise(null)}
      isWide
    >
      <div className="detail-tags">
        <span>{exercise.level}</span>
        <span>{exercise.equipment ?? "No equipment"}</span>
        <span>{exercise.category}</span>
      </div>
      <p className="detail-primary-muscles">{exercise.primaryMuscles.join(" · ")}</p>
      {exercise.isArchived && <p>This entry is retained for saved workouts; its image guide is unavailable.</p>}
      <Demonstration exercise={exercise} />
      {!exercise.videos?.some((video) => video.codec === "h264") && <ExerciseVideos exercise={exercise} />}
      <div className="detail-columns">
        <ResponsiveDisclosure
          className="technique-section"
          summary={`How to move${exercise.instructions.length ? ` · ${exercise.instructions.length} steps` : ""}`}
        >
          {!exercise.instructions.length && (
            <p>Detailed steps were not supplied by this source. Open the technique-video search.</p>
          )}
          <ol className="instruction-list">
            {exercise.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </ResponsiveDisclosure>
        <ExerciseMuscles exercise={exercise} />
      </div>
      <ExerciseAlternatives
        exercise={exercise}
        studio={studio}
      />
      <CustomExerciseActions studio={studio} />
      <ExerciseGuides exercise={exercise} />
      <ExerciseSource exercise={exercise} />
      <div className="modal-actions">
        <button
          className="button primary"
          disabled={isAdded || exercise.isArchived}
          onClick={() => studio.addExercise(exercise.id)}
        >
          <Plus size={ICON_SIZE.standard} />
          {exercise.isArchived ? "Historical exercise" : isAdded ? "Added to workout" : "Add to workout"}
        </button>
      </div>
    </Modal>
  );
}

import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import { ICON_SIZE } from "../../../../shared/constants";
import { Plus, ArrowUpRight } from "lucide-react";
import type { Exercise } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
import { Demonstration } from "./Demonstration";
import { ExerciseVideos } from "./ExerciseVideos";
import { ExerciseSource } from "./ExerciseSource";
import { CustomExerciseActions } from "./custom/CustomExerciseActions";
import { ExerciseAlternatives } from "./alternatives/ExerciseAlternatives";
const VIDEO_SEARCH_URL = "https://www.youtube.com/results?search_query=";
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
      title={exercise.name}
      onClose={() => studio.setSelectedExercise(null)}
      isWide
    >
      <div className="detail-tags">
        <span>{exercise.level}</span>
        <span>{exercise.equipment ?? "No equipment"}</span>
        <span>{exercise.category}</span>
      </div>
      <Demonstration exercise={exercise} />
      {!exercise.videos?.some((video) => video.codec === "h264") && <ExerciseVideos exercise={exercise} />}
      <div className="detail-columns">
        <section>
          <h3>How to move</h3>
          {!exercise.instructions.length && (
            <p>Detailed steps were not supplied by this source. Open the technique-video search.</p>
          )}
          <ol className="instruction-list">
            {exercise.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </section>
        <section className="muscle-panel">
          <h3>Muscles at work</h3>
          <small>PRIMARY</small>
          <p>{exercise.primaryMuscles.join(", ") || "Not supplied by source"}</p>
          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <small>SUPPORTING</small>
              <p>{exercise.secondaryMuscles.join(", ")}</p>
            </div>
          )}
          <p className="movement-note">
            Move with control. Choose a load and range of motion you can manage comfortably.
          </p>
          <a
            href={`${VIDEO_SEARCH_URL}${encodeURIComponent(`${exercise.name} exercise technique`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Find technique videos <ArrowUpRight size={ICON_SIZE.miniature} />
          </a>
        </section>
      </div>
      <ExerciseAlternatives
        exercise={exercise}
        studio={studio}
      />
      <CustomExerciseActions studio={studio} />
      <ExerciseSource exercise={exercise} />
      <div className="modal-actions">
        <button
          className="button primary"
          disabled={isAdded}
          onClick={() => studio.addExercise(exercise.id)}
        >
          <Plus size={ICON_SIZE.standard} />
          {isAdded ? "Added to workout" : "Add to workout"}
        </button>
      </div>
    </Modal>
  );
}

import { ArrowUpRight } from "lucide-react";
import type { Exercise } from "../../../../shared/contracts";
import { ICON_SIZE } from "../../../../shared/constants";
import { ResponsiveDisclosure } from "../../components/ui/ResponsiveDisclosure";
const VIDEO_SEARCH_URL = "https://www.youtube.com/results?search_query=";
/** Keeps supporting muscles and technique links available without a tall phone sidebar.
 * @param {{ exercise: Exercise }} props - Catalog entry.
 * @param {Exercise} props.exercise - Listed muscle targets.
 * @returns {JSX.Element} Responsive muscle section.
 */
export function ExerciseMuscles({ exercise }: { exercise: Exercise }) {
  return (
    <ResponsiveDisclosure
      className="muscle-panel"
      summary="Muscles & technique"
    >
      <small>PRIMARY</small>
      <p>{exercise.primaryMuscles.join(", ") || "Not supplied by source"}</p>
      {exercise.secondaryMuscles.length > 0 && (
        <div>
          <small>SUPPORTING</small>
          <p>{exercise.secondaryMuscles.join(", ")}</p>
        </div>
      )}
      <p className="movement-note">Move with control. Choose a load and range of motion you can manage comfortably.</p>
      <a
        href={`${VIDEO_SEARCH_URL}${encodeURIComponent(`${exercise.name} exercise technique`)}`}
        target="_blank"
        rel="noreferrer"
      >
        Find technique videos <ArrowUpRight size={ICON_SIZE.miniature} />
      </a>
    </ResponsiveDisclosure>
  );
}

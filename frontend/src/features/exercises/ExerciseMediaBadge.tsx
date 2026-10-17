import { Images, Play, Sparkles } from "lucide-react";
import type { Exercise } from "../../../../shared/contracts";
interface ExerciseMediaBadgeProps {
  exercise: Exercise;
}
/** Names actual available guidance instead of implying every image is a video.
 * @param {ExerciseMediaBadgeProps} props - Available exercise media.
 * @param {Exercise} props.exercise - Catalog entry.
 * @returns {JSX.Element} Media type label.
 */
export function ExerciseMediaBadge({ exercise }: ExerciseMediaBadgeProps) {
  const hasVideo = Boolean(exercise.videos?.length || exercise.guides?.some((guide) => guide.videoUrl));
  const isAi = exercise.media?.some((asset) => asset.author.includes("AI-generated"));
  const Icon = hasVideo ? Play : isAi ? Sparkles : Images;
  return (
    <span className="motion-badge">
      <Icon
        size={12}
        aria-hidden="true"
      />
      {hasVideo ? "Video guide" : isAi ? "AI illustration" : exercise.images.length ? "Image guide" : "Text guide"}
    </span>
  );
}

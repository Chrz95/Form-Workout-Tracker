import { useEffect, useState } from "react";
import { ExerciseImage } from "./ExerciseImage";
import { ImageGuideControls } from "./ImageGuideControls";
import { ExerciseVideos } from "./ExerciseVideos";
import { AnimationGuide } from "./AnimationGuide";
import type { Exercise } from "../../../../shared/contracts";
import { DEMONSTRATION_INTERVAL } from "./exercises.constants";
interface DemonstrationProps {
  exercise: Exercise;
}
/** Alternates real start/end photographs; this is explicitly a two-frame demonstration.
 * @param {DemonstrationProps} props - Demonstration properties.
 * @param {Exercise} props.exercise - Exercise with instructional frames.
 * @returns {JSX.Element} Controllable motion preview.
 */
export function Demonstration({ exercise }: DemonstrationProps) {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const isSequence = exercise.images.length > 1 && !exercise.source && !exercise.media?.length;
  const animatedAsset = exercise.media?.find((asset) => (asset.frameCount ?? 0) > 1 && asset.stillUrl);
  useEffect(() => {
    if (!isPlaying || !isSequence) {
      return;
    }
    const timer = window.setInterval(
      () => setFrame((previous) => (previous + 1) % exercise.images.length),
      DEMONSTRATION_INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [isPlaying, isSequence, exercise.images.length]);
  if (animatedAsset) {
    return (
      <div className="demonstration">
        <AnimationGuide
          asset={animatedAsset}
          name={exercise.name}
        />
      </div>
    );
  }
  if (exercise.videos?.some((video) => video.codec === "h264")) {
    return <ExerciseVideos exercise={exercise} />;
  }
  if (exercise.images.length === 0) {
    return (
      <div className="empty-state demonstration">
        Photographs are unavailable for this exercise. Use the instructions below or the technique-video search.
      </div>
    );
  }
  return (
    <div className="demonstration">
      <ExerciseImage
        src={exercise.images[frame]}
        alt={
          isSequence
            ? `${exercise.name}, demonstration position ${frame + 1}`
            : `${exercise.name}, instructional image ${frame + 1}`
        }
      />
      <ImageGuideControls
        count={exercise.images.length}
        frame={frame}
        isSequence={isSequence}
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(!isPlaying)}
        onNext={() => {
          setIsPlaying(false);
          setFrame((previous) => (previous + 1) % exercise.images.length);
        }}
      />
    </div>
  );
}

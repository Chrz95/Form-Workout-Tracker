import { useState } from "react";
import type { Exercise } from "../../../../shared/contracts";
import { ExerciseImage } from "./ExerciseImage";
/** Real source animation with a static poster for stopped motion. */
interface AnimationGuideProps {
  /** Independently licensed animated asset with a generated first-frame still. */
  asset: NonNullable<Exercise["media"]>[number];
  /** Exercise name for descriptive alternatives. */
  name: string;
}
/** Keeps real animated WebP motion stopped until a deliberate play action.
 * @param {AnimationGuideProps} props - Source animation.
 * @param {NonNullable<Exercise["media"]>[number]} props.asset - Animated image and still.
 * @param {string} props.name - Exercise name.
 * @returns {JSX.Element} Opt-in motion guide.
 */
export function AnimationGuide({ asset, name }: AnimationGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div>
      <ExerciseImage
        src={isPlaying ? asset.url : asset.stillUrl}
        alt={`${name} ${isPlaying ? "animated guide" : "animation still frame"}`}
      />
      <button
        type="button"
        className="button secondary"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-pressed={isPlaying}
      >
        {isPlaying ? "Stop motion" : "Play animation"}
      </button>
    </div>
  );
}

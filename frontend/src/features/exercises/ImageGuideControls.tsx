import { Play, Pause } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
/** Frame/guidance controls use the same image index with truthful source-specific labels. */
interface ImageGuideControlsProps {
  /** Available image count. */
  count: number;
  /** Visible index. */
  frame: number;
  /** Only known start/end frame sources animate automatically. */
  isSequence: boolean;
  /** Current sequence playback state. */
  isPlaying: boolean;
  /** Toggles known photographic sequence playback. */
  onToggle: () => void;
  /** Advances an instructional image or frame. */
  onNext: () => void;
}
/** Describes frame sequences separately from independently sourced image guides.
 * @param {ImageGuideControlsProps} props - Image controls.
 * @param {number} props.count - Image count.
 * @param {number} props.frame - Visible image index.
 * @param {boolean} props.isSequence - Whether this is a start/end demonstration.
 * @param {boolean} props.isPlaying - Current playback state.
 * @param {() => void} props.onToggle - Playback callback.
 * @param {() => void} props.onNext - Advance callback.
 * @returns {JSX.Element} Truthful image controls.
 */
export function ImageGuideControls({ count, frame, isSequence, isPlaying, onToggle, onNext }: ImageGuideControlsProps) {
  return (
    <div className="demonstration-controls">
      {isSequence && (
        <button
          className="button secondary"
          onClick={onToggle}
        >
          {isPlaying ? <Pause size={ICON_SIZE.miniature} /> : <Play size={ICON_SIZE.miniature} />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      )}
      <span>
        {isSequence
          ? `${count}-frame demonstration · position ${frame + 1}`
          : `${count}-image guide · image ${frame + 1}`}
      </span>
      {count > 1 && (
        <button
          className="text-button"
          onClick={onNext}
        >
          {isSequence ? "Next frame →" : "Next image →"}
        </button>
      )}
    </div>
  );
}

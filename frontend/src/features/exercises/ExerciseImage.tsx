import { useState } from "react";
/** Native image options with a readable failure state. */
interface ExerciseImageProps {
  /** Source image; an absent source uses the text fallback. */
  src: string | undefined;
  /** Actual visible content description. */
  alt: string;
  /** Defers offscreen card images. */
  isLazy?: boolean;
}
/** Keeps broken remote links and missing assets visible as an image-unavailable state.
 * @param {ExerciseImageProps} props - Image configuration.
 * @param {string | undefined} props.src - Image URL.
 * @param {string} props.alt - Image alternative text.
 * @param {boolean | undefined} props.isLazy - Lazy card loading.
 * @returns {JSX.Element} Image or readable fallback.
 */
export function ExerciseImage({ src, alt, isLazy }: ExerciseImageProps) {
  const [failedSource, setFailedSource] = useState<string | undefined>();
  return src && src !== failedSource ? (
    <img
      src={src}
      alt={alt}
      loading={isLazy ? "lazy" : "eager"}
      onError={() => setFailedSource(src)}
    />
  ) : (
    <span className="image-unavailable">Image unavailable · follow the text guide</span>
  );
}

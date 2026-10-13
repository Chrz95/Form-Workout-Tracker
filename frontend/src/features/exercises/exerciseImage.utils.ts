import type { Exercise } from "../../../../shared/contracts";
/** Keeps thumbnails still, including when the source offers a real animation.
 * @param {Exercise | undefined} exercise - Optional catalog entry.
 * @returns {string | undefined} First-frame poster or ordinary image.
 */
export function getExerciseThumbnail(exercise?: Exercise): string | undefined {
  const source = exercise?.images[0];
  return (
    exercise?.media?.find((asset) => asset.url === source)?.stillUrl ??
    source ??
    exercise?.videos?.find((video) => video.posterUrl)?.posterUrl
  );
}

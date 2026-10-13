import { useState } from "react";
import type { Exercise } from "../../../../shared/contracts";
/** Licensed streaming guides supplied by the source catalog. */
interface ExerciseVideosProps {
  /** Original licensed video links; no user records or tokens are forwarded. */
  exercise: Exercise;
}
/** Streams supported source videos only on demand and provides original links for codec failures.
 * @param {ExerciseVideosProps} props - Video provenance.
 * @param {Exercise} props.exercise - Available attributed guides.
 * @returns {JSX.Element | null} Licensed video controls or no guide.
 */
export function ExerciseVideos({ exercise }: ExerciseVideosProps) {
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const videos = exercise.videos ?? [];
  if (!videos.length) {
    return null;
  }
  const supported = videos.find((video) => video.localUrl) ?? videos.find((video) => video.codec === "h264");
  return (
    <section
      className="exercise-videos"
      aria-label="Exercise video"
    >
      <h3>Watch the movement</h3>
      <p>
        {supported
          ? "Press play to watch. Starts muted; follow the instructions below."
          : "Open an original source video below; this format is not available in the inline player."}
      </p>
      {supported && !hasPlaybackError && (
        <video
          controls
          muted
          playsInline
          preload="none"
          src={supported.localUrl ?? supported.url}
          poster={supported.posterUrl}
          aria-label={`${exercise.name} technique video`}
          onError={() => setHasPlaybackError(true)}
        />
      )}
      {hasPlaybackError && <p role="alert">This browser could not play the video. Open its original link below.</p>}
      <details>
        <summary>Video credits and original sources ({videos.length})</summary>
        {videos.map((video, index) => (
          <p key={video.url}>
            <a
              href={video.url}
              target="_blank"
              rel="noreferrer"
            >
              Original video {index + 1}
            </a>
            {" · "}
            {video.author}
            {" · "}
            <a
              href={video.licenseUrl}
              target="_blank"
              rel="noreferrer"
            >
              {video.license}
            </a>
            {" · "}
            {video.codec.toUpperCase()}
            {video.changes && <small>{video.changes}</small>}
          </p>
        ))}
      </details>
    </section>
  );
}

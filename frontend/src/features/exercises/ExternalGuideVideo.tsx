import { useState } from "react";
import type { ExerciseGuide } from "../../../../shared/exerciseGuideContracts";
interface ExternalGuideVideoProps {
  guide: ExerciseGuide;
}
/** Contacts the external video host only after an explicit request to load its player.
 * @param {ExternalGuideVideoProps} props - Checked publisher video link.
 * @returns {JSX.Element | null} On-demand external player and direct fallback link.
 */
export function ExternalGuideVideo({ guide }: ExternalGuideVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  if (!guide.videoUrl) return null;
  const url = new URL(guide.videoUrl);
  const isYouTube = url.hostname === "www.youtube.com";
  const embed = isYouTube
    ? `https://www.youtube-nocookie.com/embed/${url.searchParams.get("v")}`
    : `https://player.vimeo.com/video${url.pathname}?dnt=1`;
  return (
    <div className="external-guide-video">
      {isLoaded ? (
        <>
          <iframe
            src={embed}
            title={`${guide.title} — ${guide.provider} video`}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <button
            type="button"
            className="text-button"
            onClick={() => setIsLoaded(false)}
          >
            Close video
          </button>
        </>
      ) : (
        <button
          type="button"
          className="button secondary"
          onClick={() => setIsLoaded(true)}
        >
          Load {guide.provider} video
        </button>
      )}
      <a
        href={guide.videoUrl}
        target="_blank"
        rel="noreferrer"
      >
        Watch on {isYouTube ? "YouTube" : "Vimeo"}
      </a>
    </div>
  );
}

import type { Exercise } from "../../../../shared/contracts";
import { ExternalGuideVideo } from "./ExternalGuideVideo";
interface ExerciseGuidesProps {
  exercise: Exercise;
}
/** Adds independently checked publisher references without changing existing image or text licensing.
 * @param {ExerciseGuidesProps} props - Exercise with optional public reference links.
 * @returns {JSX.Element | null} External how-to guides and explicitly loaded videos.
 */
export function ExerciseGuides({ exercise }: ExerciseGuidesProps) {
  if (!exercise.guides?.length) return null;
  return (
    <section
      className="exercise-guides"
      aria-label="External exercise guides"
    >
      <h3>More technique guides</h3>
      <p>Guides and videos from the original publishers. Video players load only when you choose to open them.</p>
      <ul className="exercise-guide-list">
        {exercise.guides.map((guide) => (
          <li key={guide.url}>
            <a
              href={guide.url}
              target="_blank"
              rel="noreferrer"
            >
              {guide.title} · {guide.provider}
            </a>
            <small>Link checked {guide.checkedAt}</small>
            <ExternalGuideVideo
              key={guide.url}
              guide={guide}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

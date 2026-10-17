import { ArrowUpRight, Dumbbell } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
/** Offers a focused entry into workout creation with a live catalog count.
 * @param {StudioProps} props - Library model.
 * @param {Studio} props.studio - Visible catalog and builder action.
 * @returns {JSX.Element} Movement collection panel.
 */
export function Hero({ studio }: StudioProps) {
  return (
    <section
      className="collection-panel"
      aria-label="Movement collection"
    >
      <div className="collection-copy">
        <span className="eyebrow">
          <span className="collection-dot" /> THE MOVEMENT COLLECTION
        </span>
        <h2>
          Good training.
          <br />
          <span>Starts with a plan.</span>
        </h2>
        <p>Find your movements. Build your next session.</p>
        <button
          className="button lime"
          onClick={studio.createWorkout}
        >
          Build your workout <ArrowUpRight size={18} />
        </button>
      </div>
      <div
        className="collection-art"
        aria-hidden="true"
      >
        <span className="collection-orbit orbit-one" />
        <span className="collection-orbit orbit-two" />
        <Dumbbell
          size={128}
          strokeWidth={0.8}
        />
      </div>
      <div className="collection-total">
        <strong>{studio.exercises.length ? studio.discoverableExercises.length.toLocaleString("en-GB") : "—"}</strong>
        <span>movements to explore</span>
        <small>STRENGTH · MOBILITY · CONDITIONING</small>
      </div>
    </section>
  );
}

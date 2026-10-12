import { ICON_SIZE } from "../../../../shared/constants";
import { ArrowUpRight, Play } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
/** Introduces discovery through an editorial training banner.
 * @param {StudioProps} props - Library model.
 * @param {Studio} props.studio - Catalog and builder actions.
 * @returns {JSX.Element} Feature banner.
 */
export function Hero({ studio }: StudioProps) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-label">
          <span /> YOUR WORKOUT. YOUR WAY.
        </span>
        <h2>
          Build strength.
          <br />
          Find your <em>form.</em>
        </h2>
        <p>
          Discover movements that work for you.
          <br />
          Turn them into a routine you’ll want to return to.
        </p>
        <button
          className="button lime"
          onClick={studio.createWorkout}
        >
          Build your workout <ArrowUpRight size={ICON_SIZE.standard} />
        </button>
      </div>
      <div className="hero-caption">
        <span className="play-round">
          <Play
            size={ICON_SIZE.miniature}
            fill="currentColor"
          />
        </span>
        <div>
          Better movement starts here<small>{studio.exercises.length || "876"} exercises. Endless possibilities.</small>
        </div>
      </div>
      <span className="hero-index">01 / THE FOUNDATION</span>
    </section>
  );
}

import { Bookmark } from "lucide-react";
import { LibraryActions } from "./LibraryActions";
import { LibraryFilterFields } from "./LibraryFilterFields";
import type { StudioProps } from "../../app/useStudio";
/** Groups discovery, personal collections and exercise creation.
 * @param {StudioProps} props - Catalog controls.
 * @param {Studio} props.studio - Filter state and setters.
 * @returns {JSX.Element} Library toolbar.
 */
export function LibraryFilters({ studio }: StudioProps) {
  return (
    <div className="library-tools">
      <div className="library-title">
        <h2>
          Explore exercises <span>{studio.discoverableExercises.length.toLocaleString("en-GB")}</span>
        </h2>
        <div className="library-collections">
          <button
            className={`text-button ${studio.favoritesOnly ? "selected" : ""}`}
            onClick={() => studio.setFavoritesOnly(!studio.favoritesOnly)}
            aria-pressed={studio.favoritesOnly}
          >
            <Bookmark size={16} /> Bookmarked {studio.favorites.length > 0 && `(${studio.favorites.length})`}
          </button>
          <LibraryActions studio={studio} />
        </div>
      </div>
      <LibraryFilterFields studio={studio} />
      <div
        className="results-label"
        aria-live="polite"
      >
        <span>{studio.filteredExercises.length.toLocaleString("en-GB")} results</span>
        <span>Find your focus. Make it your session.</span>
      </div>
    </div>
  );
}

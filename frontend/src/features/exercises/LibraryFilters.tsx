import { ICON_SIZE } from "../../../../shared/constants";
import { Search, SlidersHorizontal, Bookmark } from "lucide-react";
import { LEVEL_FILTERS } from "./exercises.constants";
import { LibraryActions } from "./LibraryActions";
import type { StudioProps } from "../../app/useStudio";
/** Exposes independent search, muscle, equipment and difficulty filters.
 * @param {StudioProps} props - Discovery controls.
 * @param {Studio} props.studio - Filter state and setters.
 * @returns {JSX.Element} Accessible filters.
 */
export function LibraryFilters({ studio }: StudioProps) {
  return (
    <div className="library-tools">
      <div className="library-title">
        <h2>
          Explore exercises <span>{studio.exercises.length}</span>
        </h2>
        <button
          className={`text-button ${studio.favoritesOnly ? "selected" : ""}`}
          onClick={() => studio.setFavoritesOnly(!studio.favoritesOnly)}
          aria-pressed={studio.favoritesOnly}
        >
          <Bookmark size={ICON_SIZE.standard} /> Bookmarked{" "}
          {studio.favorites.length > 0 && `(${studio.favorites.length})`}
        </button>
      </div>
      <LibraryActions studio={studio} />
      <div className="filter-row">
        <label className="search-field">
          <Search size={ICON_SIZE.standard} />
          <input
            aria-label="Search exercises"
            placeholder="Search exercises, muscles…"
            value={studio.search}
            onChange={(event) => studio.setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filter muscle"
          value={studio.muscle}
          onChange={(event) => studio.setMuscle(event.target.value)}
        >
          {studio.muscleOptions.map((muscle) => (
            <option key={muscle}>{muscle}</option>
          ))}
        </select>
        <select
          aria-label="Filter equipment"
          value={studio.equipment}
          onChange={(event) => studio.setEquipment(event.target.value)}
        >
          {studio.equipmentOptions.map((equipment) => (
            <option key={equipment}>{equipment}</option>
          ))}
        </select>
        <select
          aria-label="Filter difficulty"
          value={studio.level}
          onChange={(event) => studio.setLevel(event.target.value)}
        >
          {LEVEL_FILTERS.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
        <button
          className="filter-reset"
          onClick={studio.resetFilters}
          aria-label="Reset filters"
          title="Reset filters"
        >
          <SlidersHorizontal size={ICON_SIZE.standard} />
        </button>
      </div>
      <div className="results-label">
        {studio.filteredExercises.length} movements to make your own <span>IMAGE & TEXT GUIDES</span>
      </div>
    </div>
  );
}

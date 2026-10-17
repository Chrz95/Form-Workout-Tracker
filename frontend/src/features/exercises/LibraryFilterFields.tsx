import { Search, RotateCcw } from "lucide-react";
import { LEVEL_FILTERS } from "./exercises.constants";
import type { StudioProps } from "../../app/useStudio";
/** Provides labelled, independent catalog discovery controls.
 * @param {StudioProps} props - Search and filter state.
 * @param {Studio} props.studio - Current values and actions.
 * @returns {JSX.Element} Responsive filter toolbar.
 */
export function LibraryFilterFields({ studio }: StudioProps) {
  return (
    <div className="filter-row">
      <label className="search-field">
        <Search
          size={19}
          aria-hidden="true"
        />
        <input
          aria-label="Search exercises"
          placeholder="Search exercises, muscles, equipment…"
          value={studio.search}
          onChange={(event) => studio.setSearch(event.target.value)}
        />
      </label>
      <label className="filter-field">
        <span>Muscle group</span>
        <select
          aria-label="Filter muscle"
          value={studio.muscle}
          onChange={(event) => studio.setMuscle(event.target.value)}
        >
          {studio.muscleOptions.map((muscle) => (
            <option key={muscle}>{muscle}</option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>Equipment</span>
        <select
          aria-label="Filter equipment"
          value={studio.equipment}
          onChange={(event) => studio.setEquipment(event.target.value)}
        >
          {studio.equipmentOptions.map((equipment) => (
            <option key={equipment}>{equipment}</option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>Experience</span>
        <select
          aria-label="Filter difficulty"
          value={studio.level}
          onChange={(event) => studio.setLevel(event.target.value)}
        >
          {LEVEL_FILTERS.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      </label>
      <button
        className="filter-reset"
        onClick={studio.resetFilters}
        aria-label="Reset filters"
        title="Reset filters"
      >
        <RotateCcw size={17} />
      </button>
    </div>
  );
}

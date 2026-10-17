import { Search } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { Studio } from "../../app/useStudio";
import type { ExerciseFilters } from "../exercises/exerciseSearch.utils";
import { EMPTY_EXERCISE_FILTERS } from "../exercises/exerciseSearch.utils";
import { LEVEL_FILTERS } from "../exercises/exercises.constants";
interface ExercisePickerFiltersProps {
  studio: Studio;
  filters: ExerciseFilters;
  onChange: (change: Partial<ExerciseFilters>) => void;
}
/** Renders independent, labelled picker controls that also fit narrow dialogs.
 * @param {ExercisePickerFiltersProps} props - Catalog options and local filter controls.
 * @returns {JSX.Element} Search and three exercise filters.
 */
export function ExercisePickerFilters({ studio, filters, onChange }: ExercisePickerFiltersProps) {
  return (
    <div className="picker-controls">
      <label className="search-field">
        <Search size={ICON_SIZE.standard} />
        <input
          placeholder="Find a movement…"
          aria-label="Search exercises to add"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </label>
      <div className="picker-filters">
        <label>
          Muscle
          <select
            value={filters.muscle}
            onChange={(event) => onChange({ muscle: event.target.value })}
          >
            {studio.muscleOptions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Equipment
          <select
            value={filters.equipment}
            onChange={(event) => onChange({ equipment: event.target.value })}
          >
            {studio.equipmentOptions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Level
          <select
            value={filters.level}
            onChange={(event) => onChange({ level: event.target.value })}
          >
            {LEVEL_FILTERS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        className="text-button"
        type="button"
        onClick={() => onChange(EMPTY_EXERCISE_FILTERS)}
      >
        Clear exercise filters
      </button>
    </div>
  );
}

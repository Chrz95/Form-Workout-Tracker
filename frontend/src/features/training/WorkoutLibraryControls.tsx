import type { WorkoutFilter, WorkoutSort } from "./workoutLibrary.utils";
interface WorkoutLibraryControlsProps {
  /** Text matched against routines, components and movements. */
  query: string;
  /** Current ordering. */
  sort: WorkoutSort;
  /** Component relationship selection. */
  filter: WorkoutFilter;
  /** Matching card count. */
  count: number;
  /** Complete saved record count. */
  total: number;
  /** Search updater. */
  onQuery: (value: string) => void;
  /** Sort updater. */
  onSort: (value: WorkoutSort) => void;
  /** Relationship updater. */
  onFilter: (value: WorkoutFilter) => void;
}
/** Makes large routine libraries searchable without hiding required dependencies from previews or exports.
 * @param {WorkoutLibraryControlsProps} props - Library view state.
 * @param {string} props.query - Search.
 * @param {WorkoutSort} props.sort - Ordering.
 * @param {WorkoutFilter} props.filter - Relationship filter.
 * @param {number} props.count - Matching routines.
 * @param {number} props.total - Complete library size.
 * @param {(value: string) => void} props.onQuery - Search updater.
 * @param {(value: WorkoutSort) => void} props.onSort - Sort updater.
 * @param {(value: WorkoutFilter) => void} props.onFilter - Relationship updater.
 * @returns {JSX.Element} Accessible query controls.
 */
export function WorkoutLibraryControls({
  query,
  sort,
  filter,
  count,
  total,
  onQuery,
  onSort,
  onFilter,
}: WorkoutLibraryControlsProps) {
  return (
    <div className="workout-library-controls">
      <label className="field-label">
        Search workouts
        <input
          type="search"
          value={query}
          placeholder="Name, notes, movement or component…"
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <label className="field-label">
        Sort workouts
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as WorkoutSort)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="exercises">Most exercises</option>
          <option value="sets">Most sets</option>
        </select>
      </label>
      <label className="field-label">
        Workout type
        <select
          value={filter}
          onChange={(event) => onFilter(event.target.value as WorkoutFilter)}
        >
          <option value="all">All workouts</option>
          <option value="standalone">Without components</option>
          <option value="composed">With components</option>
          <option value="used">Used by other workouts</option>
        </select>
      </label>
      <div className="workout-library-results">
        <output>
          {count} of {total} workouts shown
        </output>
        <button
          type="button"
          className="text-button"
          disabled={!query && filter === "all" && sort === "newest"}
          onClick={() => {
            onQuery("");
            onFilter("all");
            onSort("newest");
          }}
        >
          Reset view
        </button>
        <small>CSV export includes all saved workouts and their component references.</small>
      </div>
    </div>
  );
}

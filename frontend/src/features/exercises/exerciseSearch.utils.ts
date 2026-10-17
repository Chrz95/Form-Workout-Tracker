import type { Exercise } from "../../../../shared/contracts";
import { EQUIPMENT_FILTERS, LEVEL_FILTERS, MUSCLE_FILTERS } from "./exercises.constants";
/** Independent exercise discovery controls. */
export interface ExerciseFilters {
  search: string;
  muscle: string;
  equipment: string;
  level: string;
}
/** Empty controls match every discoverable exercise. */
export const EMPTY_EXERCISE_FILTERS: ExerciseFilters = {
  search: "",
  muscle: MUSCLE_FILTERS[0],
  equipment: EQUIPMENT_FILTERS[0],
  level: LEVEL_FILTERS[0]!,
};
/** Normalizes accents, case and punctuation without changing word order.
 * @param {string} value - Query or indexed content.
 * @returns {string} Space-separated searchable text.
 */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
/** Requires all query words, in any order, including known exercise aliases.
 * @param {Exercise} exercise - Catalog entry.
 * @param {string} query - Optional user search.
 * @returns {boolean} Whether every search term occurs in the entry.
 */
export function matchesExerciseSearch(exercise: Exercise, query: string): boolean {
  const text = normalizeSearch(
    [exercise.name, ...(exercise.aliases ?? []), ...exercise.primaryMuscles, exercise.equipment ?? ""].join(" "),
  );
  return normalizeSearch(query)
    .split(" ")
    .filter(Boolean)
    .every((term) => text.includes(term));
}
/** Applies the same primary-muscle, equipment and level rules in library and picker.
 * @param {Exercise} exercise - Catalog entry.
 * @param {ExerciseFilters} filters - Independent discovery controls.
 * @returns {boolean} Whether the entry matches all active controls.
 */
export function matchesExerciseFilters(exercise: Exercise, filters: ExerciseFilters): boolean {
  const muscleMatch =
    filters.muscle === MUSCLE_FILTERS[0] ||
    (filters.muscle === "back"
      ? exercise.primaryMuscles.some((group) => ["lats", "middle back", "lower back", "traps"].includes(group))
      : exercise.primaryMuscles.includes(filters.muscle));
  return (
    matchesExerciseSearch(exercise, filters.search) &&
    muscleMatch &&
    (filters.equipment === EQUIPMENT_FILTERS[0] || (exercise.equipment ?? "No equipment") === filters.equipment) &&
    (filters.level === LEVEL_FILTERS[0] || exercise.level === filters.level)
  );
}

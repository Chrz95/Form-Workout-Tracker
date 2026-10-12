import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "../../../../shared/contracts";
import { fetchCatalog } from "../../lib/api/client";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
import { FEATURED_EXERCISES, MUSCLE_FILTERS, EQUIPMENT_FILTERS, LEVEL_FILTERS } from "./exercises.constants";
import { CUSTOM_EXERCISE_PREFIX } from "../../../../shared/exerciseConstants";
/** Loads and filters the read-only catalog with cancellation.
 * @param {Exercise[]} customExercises - Authenticated owner additions.
 * @returns {object} Catalog controls and matching exercises.
 */
export function useCatalog(customExercises: Exercise[]) {
  const [publicExercises, setPublicExercises] = useState<Exercise[]>([]);
  const exercises = useMemo(() => [...publicExercises, ...customExercises], [publicExercises, customExercises]);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string>(MUSCLE_FILTERS[0]);
  const [equipment, setEquipment] = useState<string>(EQUIPMENT_FILTERS[0]);
  const [level, setLevel] = useState<string>(LEVEL_FILTERS[0] ?? "");
  const [visibleCount, setVisibleCount] = useState<number>(WORKOUT_DEFAULTS.pageSize);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then(setPublicExercises)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setCatalogError(error.message);
        }
      });
    return () => controller.abort();
  }, []);
  const filteredExercises = useMemo(
    () =>
      exercises
        .filter((exercise) => {
          const text = [exercise.name, ...(exercise.aliases ?? []), ...exercise.primaryMuscles, exercise.equipment]
            .join(" ")
            .toLowerCase();
          const matchesMuscle =
            muscle === MUSCLE_FILTERS[0] ||
            (muscle === "back"
              ? exercise.primaryMuscles.some((group) => ["lats", "middle back", "lower back", "traps"].includes(group))
              : exercise.primaryMuscles.includes(muscle));
          return (
            text.includes(search.toLowerCase()) &&
            matchesMuscle &&
            (equipment === EQUIPMENT_FILTERS[0] || (exercise.equipment ?? "No equipment") === equipment) &&
            (level === LEVEL_FILTERS[0] || exercise.level === level) &&
            (!favoritesOnly || favorites.includes(exercise.id)) &&
            (!customOnly || exercise.id.startsWith(CUSTOM_EXERCISE_PREFIX))
          );
        })
        .sort((first, second) => {
          const firstRank = FEATURED_EXERCISES.indexOf(first.id);
          const secondRank = FEATURED_EXERCISES.indexOf(second.id);
          return (
            (firstRank < 0 ? FEATURED_EXERCISES.length : firstRank) -
            (secondRank < 0 ? FEATURED_EXERCISES.length : secondRank)
          );
        }),
    [exercises, search, muscle, equipment, level, favoritesOnly, favorites, customOnly],
  );

  /** Toggles an in-memory bookmark.
   * @param {string} exerciseId - Exercise identifier.
   */
  function toggleFavorite(exerciseId: string) {
    setFavorites((previous) =>
      previous.includes(exerciseId) ? previous.filter((id) => id !== exerciseId) : [...previous, exerciseId],
    );
  }
  /** Resets discovery filters. */
  function resetFilters() {
    setSearch("");
    setMuscle(MUSCLE_FILTERS[0]);
    setEquipment(EQUIPMENT_FILTERS[0]);
    setLevel(LEVEL_FILTERS[0] ?? "");
    setFavoritesOnly(false);
    setCustomOnly(false);
  }
  return {
    customOnly,
    setCustomOnly,
    muscleOptions: [
      MUSCLE_FILTERS[0],
      ...new Set([...MUSCLE_FILTERS.slice(1), ...exercises.flatMap((exercise) => exercise.primaryMuscles)]),
    ],
    equipmentOptions: [
      EQUIPMENT_FILTERS[0],
      ...new Set([...EQUIPMENT_FILTERS.slice(1), ...exercises.map((exercise) => exercise.equipment ?? "No equipment")]),
    ],
    exercises,
    catalogError,
    search,
    setSearch,
    muscle,
    setMuscle,
    equipment,
    setEquipment,
    level,
    setLevel,
    filteredExercises,
    visibleCount,
    setVisibleCount,
    favorites,
    favoritesOnly,
    setFavoritesOnly,
    toggleFavorite,
    resetFilters,
  };
}

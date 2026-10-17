import { matchesExerciseFilters } from "./exerciseSearch.utils";
import { useEffect, useMemo, useState } from "react";
import type { Exercise, Workout, WorkoutItem } from "../../../../shared/contracts";
import { fetchCatalog } from "../../lib/api/client";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
import { FEATURED_EXERCISES, MUSCLE_FILTERS, EQUIPMENT_FILTERS, LEVEL_FILTERS } from "./exercises.constants";
import { getMyExerciseIds } from "./myExercises.utils";
/** Loads and filters the read-only catalog with cancellation.
 * @param {Exercise[]} customExercises - Authenticated owner additions.
 * @param {Workout[]} workouts - Persisted routines used for personal membership.
 * @param {WorkoutItem[]} draftItems - Current unsaved selections.
 * @returns {object} Catalog controls and matching exercises.
 */
export function useCatalog(customExercises: Exercise[], workouts: Workout[] = [], draftItems: WorkoutItem[] = []) {
  const [publicExercises, setPublicExercises] = useState<Exercise[]>([]);
  const exercises = useMemo(() => [...publicExercises, ...customExercises], [publicExercises, customExercises]);
  const discoverableExercises = useMemo(() => exercises.filter((exercise) => !exercise.isArchived), [exercises]);
  const myExerciseIds = useMemo(
    () => getMyExerciseIds(exercises, workouts, draftItems),
    [exercises, workouts, draftItems],
  );
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string>(MUSCLE_FILTERS[0]);
  const [equipment, setEquipment] = useState<string>(EQUIPMENT_FILTERS[0]);
  const [level, setLevel] = useState<string>(LEVEL_FILTERS[0] ?? "");
  const [visibleCount, setVisibleCount] = useState<number>(WORKOUT_DEFAULTS.pageSize);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
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
      discoverableExercises
        .filter((exercise) => {
          return (
            matchesExerciseFilters(exercise, { search, muscle, equipment, level }) &&
            (!favoritesOnly || favorites.includes(exercise.id)) &&
            (!mineOnly || myExerciseIds.has(exercise.id))
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
    [discoverableExercises, search, muscle, equipment, level, favoritesOnly, favorites, mineOnly, myExerciseIds],
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
    setMineOnly(false);
  }
  return {
    myExerciseIds,
    mineOnly,
    setMineOnly,
    muscleOptions: [
      MUSCLE_FILTERS[0],
      ...new Set([...MUSCLE_FILTERS.slice(1), ...discoverableExercises.flatMap((exercise) => exercise.primaryMuscles)]),
    ],
    equipmentOptions: [
      EQUIPMENT_FILTERS[0],
      ...new Set([
        ...EQUIPMENT_FILTERS.slice(1),
        ...discoverableExercises.map((exercise) => exercise.equipment ?? "No equipment"),
      ]),
    ],
    exercises,
    discoverableExercises,
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

import { useEffect, useMemo, useRef, useState } from "react";
import type { Studio } from "../../app/useStudio";
import { WORKOUT_DEFAULTS } from "../../../../shared/constants";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity";
import {
  EMPTY_EXERCISE_FILTERS,
  matchesExerciseFilters,
  type ExerciseFilters,
} from "../exercises/exerciseSearch.utils";
/** Keeps picker filters independent and progressively renders results inside its own scroll viewport.
 * @param {Studio} studio - Complete catalog and resolved draft selections.
 * @returns {object} Local filters, pagination and scroll-observer references.
 */
export function useExercisePicker(studio: Studio) {
  const [filters, setFilters] = useState<ExerciseFilters>(EMPTY_EXERCISE_FILTERS);
  const [visibleCount, setVisibleCount] = useState<number>(WORKOUT_DEFAULTS.pageSize);
  const [isOpen, setIsOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const matches = useMemo(
    () =>
      studio.exercises.filter(
        (exercise) =>
          !exercise.isArchived &&
          matchesExerciseFilters(exercise, filters) &&
          !studio.draftSelectedItems.some((item) => matchesExerciseId(exercise, item.exerciseId)),
      ),
    [studio.exercises, studio.draftSelectedItems, filters],
  );
  const hasMore = visibleCount < matches.length;
  /** Reveals the next page without requesting or mutating workout records. */
  function loadMore() {
    setVisibleCount((count) => Math.min(count + WORKOUT_DEFAULTS.pageSize, matches.length));
  }
  /** Restarts paging and scroll position when the search or a filter changes.
   * @param {Partial<ExerciseFilters>} change - Changed discovery controls.
   */
  function updateFilters(change: Partial<ExerciseFilters>) {
    setFilters((current) => ({ ...current, ...change }));
    setVisibleCount(WORKOUT_DEFAULTS.pageSize);
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }
  useEffect(() => {
    if (!isOpen || !hasMore || !sentinelRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root: resultsRef.current, rootMargin: "120px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isOpen, hasMore, visibleCount, matches]);
  return {
    filters,
    updateFilters,
    isOpen,
    setIsOpen,
    resultsRef,
    sentinelRef,
    loadMore,
    hasMore,
    matches: matches.slice(0, visibleCount),
    total: matches.length,
  };
}

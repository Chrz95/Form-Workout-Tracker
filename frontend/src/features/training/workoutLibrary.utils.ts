import type { Exercise, Workout } from "../../../../shared/contracts";
import { resolveWorkoutEntries, workoutIdentities } from "../../../../shared/workoutGraph";
/** Sort uses creation time, never an invented modification date. */
export type WorkoutSort = "newest" | "oldest" | "name" | "exercises" | "sets";
/** Relationship filters operate on the complete connected library. */
export type WorkoutFilter = "all" | "standalone" | "composed" | "used";
/** Derived indexes are transient and do not alter persisted routine values. */
export interface WorkoutLibraryEntry {
  workout: Workout;
  searchText: string;
  createdAt: number;
  exerciseCount: number | null;
  setCount: number | null;
  isUsed: boolean;
}
const nameOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
/** Makes searches insensitive to case, accents and punctuation.
 * @param {string} value - User query or searchable content.
 * @returns {string} Normalized space-separated text.
 */
export function normalizeWorkoutSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
/** Indexes complete routines including nested component names and canonical exercise aliases.
 * @param {Workout[]} workouts - Complete connected records.
 * @param {Exercise[]} exercises - Public and private exercise catalog.
 * @returns {WorkoutLibraryEntry[]} Derived searchable records with optional resolved counts.
 */
export function createWorkoutLibrary(workouts: Workout[], exercises: Exercise[]): WorkoutLibraryEntry[] {
  const identities = workoutIdentities(exercises);
  const catalog = new Map(
    exercises.flatMap((exercise) => [exercise.id, ...(exercise.legacyIds ?? [])].map((id) => [id, exercise])),
  );
  const byId = new Map(workouts.map((workout) => [workout.id, workout]));
  const usedIds = new Set(workouts.flatMap((workout) => workout.includedWorkoutIds ?? []));
  return workouts.map((workout) => {
    const text = [
      workout.name,
      workout.notes,
      ...(workout.includedWorkoutIds ?? []).map((id) => byId.get(id)?.name ?? id),
    ];
    let { items } = workout;
    let exerciseCount: number | null = null;
    let setCount: number | null = null;
    try {
      const entries = resolveWorkoutEntries(workout, workouts, identities);
      items = entries.map((entry) => entry.item);
      text.push(...entries.flatMap((entry) => entry.workoutPath));
      exerciseCount = items.length;
      setCount = items.reduce((total, item) => total + item.sets, 0);
    } catch {
      /* Invalid routines remain discoverable by their own metadata and direct targets. */
    }
    for (const item of items) {
      const exercise = catalog.get(item.exerciseId);
      text.push(
        item.exerciseId,
        exercise?.name ?? "",
        ...(exercise?.aliases ?? []),
        ...(exercise?.primaryMuscles ?? []),
        ...(exercise?.secondaryMuscles ?? []),
      );
    }
    const createdAt = Date.parse(workout.createdAt);
    return {
      workout,
      searchText: normalizeWorkoutSearch(text.join(" ")),
      createdAt: Number.isFinite(createdAt) ? createdAt : 0,
      exerciseCount,
      setCount,
      isUsed: usedIds.has(workout.id),
    };
  });
}
/** Selects and sorts derived records without mutating the complete dependency graph.
 * @param {WorkoutLibraryEntry[]} library - Cached index.
 * @param {{query: string; sort: WorkoutSort; filter: WorkoutFilter}} options - Visible controls.
 * @returns {Workout[]} Matching records with deterministic tie order.
 */
export function selectWorkoutLibrary(
  library: WorkoutLibraryEntry[],
  options: { query: string; sort: WorkoutSort; filter: WorkoutFilter },
): Workout[] {
  const terms = normalizeWorkoutSearch(options.query).split(" ").filter(Boolean);
  return library
    .filter((entry) => {
      const composed = Boolean(entry.workout.includedWorkoutIds?.length);
      const matchesFilter =
        options.filter === "all" ||
        (options.filter === "used" ? entry.isUsed : options.filter === "composed" ? composed : !composed);
      return matchesFilter && terms.every((term) => entry.searchText.includes(term));
    })
    .sort((a, b) => {
      const fallback = b.createdAt - a.createdAt || a.workout.id.localeCompare(b.workout.id);
      if (options.sort === "name") {
        return nameOrder.compare(a.workout.name, b.workout.name) || fallback;
      }
      if (options.sort === "oldest") {
        return a.createdAt - b.createdAt || a.workout.id.localeCompare(b.workout.id);
      }
      if (options.sort === "exercises" || options.sort === "sets") {
        const first = options.sort === "exercises" ? a.exerciseCount : a.setCount;
        const second = options.sort === "exercises" ? b.exerciseCount : b.setCount;
        if (first === null || second === null) {
          return first === second ? fallback : first === null ? 1 : -1;
        }
        return second - first || fallback;
      }
      return fallback;
    })
    .map((entry) => entry.workout);
}

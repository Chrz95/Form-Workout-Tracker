import type { Exercise, Workout, WorkoutItem } from "./contracts.js";
import { INPUT_LIMITS } from "./constants.js";
/** Bounds keep routine expansion predictable for clients and the API. */
export const WORKOUT_GRAPH_LIMITS = { depth: 8, children: 20, records: 1000 };
/** A root can be a saved routine or a builder draft. */
export type WorkoutNode = Pick<Workout, "name" | "items" | "includedWorkoutIds"> & { id?: string };
/** Resolved target and its source component path, without live mutable references. */
export interface ResolvedWorkoutEntry {
  item: WorkoutItem;
  workoutPath: string[];
}
/** Resolves current and retired exercise identities without changing saved values.
 * @param {Exercise[]} catalog - Visible exercises with legacy aliases.
 * @returns {Map<string, string>} Reference to canonical identity.
 */
export function workoutIdentities(catalog: Exercise[]): Map<string, string> {
  return new Map(
    catalog.flatMap((exercise) =>
      [exercise.id, ...(exercise.legacyIds ?? [])].map((id) => [id, exercise.canonicalId ?? exercise.id]),
    ),
  );
}
/** Expands references in order, rejecting cycles, missing sources and duplicate movements.
 * @param {WorkoutNode} root - Draft or saved root.
 * @param {Workout[]} workouts - Complete connected routine collection.
 * @param {Map<string, string>} identities - Canonical exercise IDs when available.
 * @returns {ResolvedWorkoutEntry[]} Independent ordered targets with source paths.
 */
export function resolveWorkoutEntries(
  root: WorkoutNode,
  workouts: Workout[],
  identities: Map<string, string> = new Map(),
): ResolvedWorkoutEntry[] {
  const byId = new Map(workouts.map((workout) => [workout.id, workout]));
  const items: ResolvedWorkoutEntry[] = [];
  const movements = new Set<string>();
  /** Expands one branch while tracking its ancestors.
   * @param {WorkoutNode} node - Current component.
   * @param {Set<string>} ancestors - Current recursion path.
   * @param {number} depth - Root starts at one.
   * @param {string[]} labels - Component names along the current path.
   */
  function visit(node: WorkoutNode, ancestors: Set<string>, depth: number, labels: string[]): void {
    if (depth > WORKOUT_GRAPH_LIMITS.depth) {
      throw new Error("Workouts can nest at most eight levels deep.");
    }
    if (node.id && ancestors.has(node.id)) {
      throw new Error(`Circular workout reference in “${node.name}”.`);
    }
    const children = node.includedWorkoutIds ?? [];
    if (children.length > WORKOUT_GRAPH_LIMITS.children || new Set(children).size !== children.length) {
      throw new Error("Include each component once, with at most 20 components per workout.");
    }
    const path = new Set(ancestors);
    if (node.id) {
      path.add(node.id);
    }
    for (const item of node.items) {
      const key = identities.get(item.exerciseId) ?? item.exerciseId;
      if (movements.has(key)) {
        throw new Error(`Duplicate movement in “${root.name}”: ${item.exerciseId}.`);
      }
      movements.add(key);
      items.push({
        item: {
          ...item,
          ...(item.plannedSets ? { plannedSets: item.plannedSets.map((set) => ({ ...set })) } : {}),
        },
        workoutPath: [...labels],
      });
      if (items.length > INPUT_LIMITS.exercises) {
        throw new Error("A resolved workout can contain at most 100 exercises.");
      }
    }
    for (const id of children) {
      const child = byId.get(id);
      if (!child) {
        throw new Error(`A component of “${node.name}” is missing. Include or restore its saved workout.`);
      }
      visit(child, path, depth + 1, [...labels, child.name]);
    }
  }
  visit(root, new Set(), 1, [root.name]);
  if (!items.length) {
    throw new Error("A workout must resolve to at least one exercise.");
  }
  return items;
}

/** Expands the same validated graph into an independent session prescription.
 * @param {WorkoutNode} root - Draft or saved routine.
 * @param {Workout[]} workouts - Complete connected collection.
 * @param {Map<string, string>} identities - Optional canonical exercise mapping.
 * @returns {WorkoutItem[]} Ordered targets without source presentation metadata.
 */
export function resolveWorkout(
  root: WorkoutNode,
  workouts: Workout[],
  identities: Map<string, string> = new Map(),
): WorkoutItem[] {
  return resolveWorkoutEntries(root, workouts, identities).map((entry) => entry.item);
}

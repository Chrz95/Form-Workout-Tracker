import { asc, desc, eq, sql } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { workouts, workoutItems, exercises } from "../../db/schema/tables.js";
import { workoutLinks } from "../../db/schema/workoutLinks.js";
import type { Workout } from "../../../../shared/contracts.js";
import { resolveWorkout, WORKOUT_GRAPH_LIMITS } from "../../../../shared/workoutGraph.js";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Transaction shape shared by routine writes and imports. */
export type WorkoutTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
/** The existing import lock also serializes graph edits and deletes. */
const WORKOUT_LOCK_KEY = 241024;
/** Serializes operations that can change the routine graph.
 * @param {WorkoutTransaction} transaction - Active transaction.
 * @returns {Promise<void>} Lock held until transaction completion.
 */
export async function lockWorkoutGraph(transaction: WorkoutTransaction): Promise<void> {
  await transaction.execute(sql`SELECT pg_advisory_xact_lock(${WORKOUT_LOCK_KEY})`);
}
/** Loads a complete bounded graph without silently truncating dependencies.
 * @param {WorkoutTransaction} transaction - Locked transaction.
 * @returns {Promise<Workout[]>} Direct targets and ordered references.
 */
export async function readWorkoutGraph(transaction: WorkoutTransaction): Promise<Workout[]> {
  const records = await transaction
    .select()
    .from(workouts)
    .orderBy(desc(workouts.createdAt))
    .limit(WORKOUT_GRAPH_LIMITS.records + 1);
  if (records.length > WORKOUT_GRAPH_LIMITS.records) {
    throw new AppError("WORKOUT_LIMIT", "The library exceeds the supported 1,000 saved workouts.");
  }
  const items = await transaction.select().from(workoutItems).orderBy(asc(workoutItems.position));
  const links = await transaction.select().from(workoutLinks).orderBy(asc(workoutLinks.position));
  const itemsByWorkout = new Map<string, Workout["items"]>();
  for (const { workoutId, exerciseId, sets, reps, weight, plannedSets } of items) {
    const group = itemsByWorkout.get(workoutId) ?? [];
    group.push({ exerciseId, sets, reps, weight, ...(plannedSets ? { plannedSets } : {}) });
    itemsByWorkout.set(workoutId, group);
  }
  const childrenByWorkout = new Map<string, string[]>();
  for (const { parentId, childId } of links) {
    const group = childrenByWorkout.get(parentId) ?? [];
    group.push(childId);
    childrenByWorkout.set(parentId, group);
  }
  return records.map((record) => {
    const includedWorkoutIds = childrenByWorkout.get(record.id) ?? [];
    return {
      ...record,
      createdAt: record.createdAt.toISOString(),
      ...(includedWorkoutIds.length ? { includedWorkoutIds } : {}),
      items: itemsByWorkout.get(record.id) ?? [],
    };
  });
}
/** Replaces component order after referenced metadata exists.
 * @param {WorkoutTransaction} transaction - Graph-locked transaction.
 * @param {string} parentId - Parent routine.
 * @param {string[]} childIds - Ordered children.
 * @returns {Promise<void>} Atomic link replacement.
 */
export async function replaceWorkoutLinks(
  transaction: WorkoutTransaction,
  parentId: string,
  childIds: string[] = [],
): Promise<void> {
  await transaction.delete(workoutLinks).where(eq(workoutLinks.parentId, parentId));
  if (childIds.length) {
    await transaction
      .insert(workoutLinks)
      .values(childIds.map((childId, position) => ({ parentId, childId, position })));
  }
}
/** Checks all parents after an edit so children cannot invalidate saved compositions.
 * @param {WorkoutTransaction} transaction - Active graph lock.
 * @returns {Promise<void>} Valid graph or domain error causing rollback.
 */
export async function validateWorkoutGraph(transaction: WorkoutTransaction): Promise<void> {
  const graph = await readWorkoutGraph(transaction);
  const catalog = await transaction
    .select({ id: exercises.id, canonical: sql<string>`coalesce(${exercises.data}->>'canonicalId', ${exercises.id})` })
    .from(exercises);
  const identities = new Map(catalog.map((row) => [row.id, row.canonical]));
  try {
    for (const workout of graph) {
      resolveWorkout(workout, graph, identities);
    }
  } catch (error) {
    throw new AppError(
      "INVALID_COMPOSITION",
      error instanceof Error ? error.message : "Invalid workout graph.",
      HTTP_STATUS.conflict,
    );
  }
}

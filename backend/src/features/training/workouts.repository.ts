import { asc, desc, eq } from "drizzle-orm";
import { workouts, workoutItems } from "../../db/schema/tables.js";
import type { Database } from "../../db/client.js";
import type { WorkoutInput } from "./training.types.js";
import { HTTP_DEFAULTS } from "../../constants/http.constants.js";
/** Encapsulates routine queries and atomic list replacement.
 * @param {Database} database - Pooled Drizzle connection.
 * @returns {object} Routine repository methods.
 */
export function createWorkoutsRepository(database: Database) {
  /** Loads bounded routines with stable item order.
   * @returns {Promise<Workout[]>} Saved routines.
   */
  async function listWorkouts() {
    const records = await database
      .select()
      .from(workouts)
      .orderBy(desc(workouts.createdAt))
      .limit(HTTP_DEFAULTS.maxRecords);
    return Promise.all(
      records.map(async (record) => ({
        ...record,
        createdAt: record.createdAt.toISOString(),
        items: (
          await database
            .select()
            .from(workoutItems)
            .where(eq(workoutItems.workoutId, record.id))
            .orderBy(asc(workoutItems.position))
        ).map(({ exerciseId, sets, reps, weight }) => ({ exerciseId, sets, reps, weight })),
      })),
    );
  }
  /** Atomically creates or replaces a complete prescription.
   * @param {WorkoutInput} input - Validated routine.
   * @param {string} [id] - Existing routine identifier.
   * @returns {Promise<Workout | null>} Saved record or missing routine.
   */
  async function saveWorkout(input: WorkoutInput, id?: string) {
    return database.transaction(async (transaction) => {
      const [record] = id
        ? await transaction
            .update(workouts)
            .set({ name: input.name, notes: input.notes })
            .where(eq(workouts.id, id))
            .returning()
        : await transaction.insert(workouts).values({ name: input.name, notes: input.notes }).returning();
      if (!record) {
        return null;
      }
      await transaction.delete(workoutItems).where(eq(workoutItems.workoutId, record.id));
      await transaction
        .insert(workoutItems)
        .values(input.items.map((item, position) => ({ ...item, workoutId: record.id, position })));
      return { ...record, createdAt: record.createdAt.toISOString(), items: input.items };
    });
  }
  /** Deletes a list with cascade cleanup.
   * @param {string} id - Routine identifier.
   * @returns {Promise<boolean>} Whether a row existed.
   */
  async function deleteWorkout(id: string) {
    return (await database.delete(workouts).where(eq(workouts.id, id)).returning({ id: workouts.id })).length > 0;
  }
  return { listWorkouts, saveWorkout, deleteWorkout };
}

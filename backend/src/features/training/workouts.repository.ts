import { eq } from "drizzle-orm";
import { workouts, workoutItems } from "../../db/schema/tables.js";
import { workoutLinks } from "../../db/schema/workoutLinks.js";
import type { Database } from "../../db/client.js";
import type { WorkoutInput } from "./training.types.js";
import {
  lockWorkoutGraph,
  readWorkoutGraph,
  replaceWorkoutLinks,
  validateWorkoutGraph,
} from "./workoutGraph.repository.js";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Encapsulates routine queries and atomic composition replacement.
 * @param {Database} database - Pooled Drizzle connection.
 * @returns {object} Routine repository methods.
 */
export function createWorkoutsRepository(database: Database) {
  /** Loads a consistent complete graph with every component dependency.
   * @returns {Promise<Workout[]>} Saved routines.
   */
  async function listWorkouts() {
    return database.transaction(async (transaction) => {
      await lockWorkoutGraph(transaction);
      return readWorkoutGraph(transaction);
    });
  }
  /** Atomically replaces a prescription and validates all affected parents.
   * @param {WorkoutInput} input - Validated routine.
   * @param {string} [id] - Existing identity.
   * @returns {Promise<Workout | null>} Saved record or missing routine.
   */
  async function saveWorkout(input: WorkoutInput, id?: string) {
    return database.transaction(async (transaction) => {
      await lockWorkoutGraph(transaction);
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
      if (input.items.length) {
        await transaction
          .insert(workoutItems)
          .values(input.items.map((item, position) => ({ ...item, workoutId: record.id, position })));
      }
      await replaceWorkoutLinks(transaction, record.id, input.includedWorkoutIds);
      await validateWorkoutGraph(transaction);
      return { ...record, ...input, createdAt: record.createdAt.toISOString() };
    });
  }
  /** Prevents deleting a referenced component, preserving every parent.
   * @param {string} id - Routine identity.
   * @returns {Promise<boolean>} Whether a record existed.
   */
  async function deleteWorkout(id: string) {
    return database.transaction(async (transaction) => {
      await lockWorkoutGraph(transaction);
      const users = await transaction.select().from(workoutLinks).where(eq(workoutLinks.childId, id)).limit(1);
      if (users.length) {
        throw new AppError(
          "WORKOUT_IN_USE",
          "Remove this workout from its parent routines first.",
          HTTP_STATUS.conflict,
        );
      }
      return (await transaction.delete(workouts).where(eq(workouts.id, id)).returning({ id: workouts.id })).length > 0;
    });
  }
  return { listWorkouts, saveWorkout, deleteWorkout };
}

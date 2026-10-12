import { asc, eq, like } from "drizzle-orm";
import { exercises } from "../../db/schema/tables.js";
import type { Database } from "../../db/client.js";
import type { Exercise } from "../../../../shared/contracts.js";
import type { ExerciseRepository } from "./exercises.types.js";
import { CUSTOM_EXERCISE_PREFIX } from "../../../../shared/exerciseConstants.js";
/** Creates catalog reads and private exercise writes over the existing PostgreSQL table.
 * @param {Database} database - Database connection.
 * @returns {ExerciseRepository} Typed persistence operations.
 */
export function createExerciseRepository(database: Database): ExerciseRepository {
  /** Lists all stored exercise references.
   * @returns {Promise<Exercise[]>} Public and private exercises.
   */
  async function list(): Promise<Exercise[]> {
    return (await database.select().from(exercises).orderBy(asc(exercises.id))).map((record) => record.data);
  }
  /** Retrieves owner entries only; LIKE uses an escaped underscore for the reserved prefix.
   * @returns {Promise<Exercise[]>} Custom exercises.
   */
  async function listCustom(): Promise<Exercise[]> {
    const prefixPattern = CUSTOM_EXERCISE_PREFIX.replaceAll("_", "\\_") + "%";
    return (await database.select().from(exercises).where(like(exercises.id, prefixPattern))).map(
      (record) => record.data,
    );
  }
  /** Inserts a server-assigned exercise reference.
   * @param {Exercise} exercise - Validated private content.
   * @returns {Promise<Exercise>} Created reference.
   */
  async function create(exercise: Exercise): Promise<Exercise> {
    await database.insert(exercises).values({ id: exercise.id, data: exercise });
    return exercise;
  }
  /** Replaces only the data of an existing custom identity.
   * @param {Exercise} exercise - Validated replacement.
   * @returns {Promise<Exercise | null>} Updated reference or missing result.
   */
  async function update(exercise: Exercise): Promise<Exercise | null> {
    const [record] = await database
      .update(exercises)
      .set({ data: exercise })
      .where(eq(exercises.id, exercise.id))
      .returning();
    return record?.data ?? null;
  }
  /** Deletes an unused custom exercise; foreign keys retain routine and history references.
   * @param {string} id - Custom exercise identity.
   * @returns {Promise<boolean>} Whether a reference was removed.
   */
  async function remove(id: string): Promise<boolean> {
    return (await database.delete(exercises).where(eq(exercises.id, id)).returning({ id: exercises.id })).length > 0;
  }
  return { list, listCustom, create, update, remove };
}

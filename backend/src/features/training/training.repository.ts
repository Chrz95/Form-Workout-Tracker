import { inArray } from "drizzle-orm";
import type { WorkoutItem } from "../../../../shared/contracts.js";
import type { Database } from "../../db/client.js";
import { exercises } from "../../db/schema/tables.js";
import { createWorkoutsRepository } from "./workouts.repository.js";
import { createSessionsRepository } from "./sessions.repository.js";
import type { TrainingRepository } from "./training.types.js";
/** Combines cohesive repositories behind the service dependency boundary.
 * @param {Database} database - Typed connection.
 * @returns {TrainingRepository} Persistence methods.
 */
export function createTrainingRepository(database: Database): TrainingRepository {
  /** Checks all exercise references before starting a write.
   * @param {WorkoutItem[]} items - Requested exercises.
   * @returns {Promise<boolean>} Whether all references exist.
   */
  async function validateExercises(items: WorkoutItem[]) {
    const ids = [...new Set(items.map((item) => item.exerciseId))];
    const records = await database.select({ id: exercises.id }).from(exercises).where(inArray(exercises.id, ids));
    return records.length === ids.length;
  }
  return { ...createWorkoutsRepository(database), ...createSessionsRepository(database), validateExercises };
}

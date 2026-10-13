import { asc, eq } from "drizzle-orm";
import { plans } from "../../db/schema/plans.js";
import { workouts } from "../../db/schema/tables.js";
import type { Database } from "../../db/client.js";
import type { PlanInput, Plan } from "../../../../shared/calendarContracts.js";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import { HTTP_DEFAULTS } from "../../constants/http.constants.js";
import type { PlanRepository } from "./calendar.types.js";
/** Implements scheduled intent separately from completed sessions.
 * @param {Database} database - Typed PostgreSQL connection.
 * @returns {PlanRepository} Calendar operations.
 */
export function createPlanRepository(database: Database): PlanRepository {
  /** Retrieves bounded saved plans in chronological order.
   * @returns {Promise<Plan[]>} Planned dates.
   */
  async function list(): Promise<Plan[]> {
    const rows = await database.select().from(plans).orderBy(asc(plans.date)).limit(HTTP_DEFAULTS.maxRecords);
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  }
  /** Snapshots the label and binds the current routine in one transaction.
   * @param {PlanInput} input - Date and routine.
   * @param {string | undefined} id - Existing plan for rescheduling.
   * @returns {Promise<Plan | null>} Confirmed plan or missing result.
   */
  async function save(input: PlanInput, id?: string): Promise<Plan | null> {
    return database.transaction(async (transaction) => {
      const [workout] = await transaction.select().from(workouts).where(eq(workouts.id, input.workoutId));
      if (!workout) {
        throw new AppError("NOT_FOUND", "Choose a saved routine before planning it.", HTTP_STATUS.notFound);
      }
      const values = { ...input, name: workout.name };
      const [saved] = id
        ? await transaction.update(plans).set(values).where(eq(plans.id, id)).returning()
        : await transaction.insert(plans).values(values).returning();
      return saved ? { ...saved, createdAt: saved.createdAt.toISOString() } : null;
    });
  }
  /** Cancels intent without deleting any workout or journal history.
   * @param {string} id - Plan identity.
   * @returns {Promise<boolean>} Whether the plan existed.
   */
  async function remove(id: string): Promise<boolean> {
    return (await database.delete(plans).where(eq(plans.id, id)).returning({ id: plans.id })).length > 0;
  }
  return { list, save, remove };
}

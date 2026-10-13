import type { PlanInput } from "../../../../shared/calendarContracts.js";
import type { PlanRepository } from "./calendar.types.js";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Keeps schedule operations distinct from completed training logs. */
export class CalendarService {
  /** Injects schedule persistence.
   * @param {PlanRepository} repository - Calendar persistence.
   */
  constructor(private readonly repository: PlanRepository) {}
  /** Lists confirmed intent.
   * @returns {Promise<Plan[]>} Saved plans.
   */
  list() {
    return this.repository.list();
  }
  /** Saves a plan, translating routine/date uniqueness conflicts safely.
   * @param {PlanInput} input - Validated schedule.
   * @param {string | undefined} id - Existing schedule identity.
   * @returns {Promise<Plan>} Confirmed plan.
   */
  async save(input: PlanInput, id?: string) {
    try {
      const saved = await this.repository.save(input, id);
      if (!saved) {
        throw new AppError("NOT_FOUND", "This plan no longer exists.", HTTP_STATUS.notFound);
      }
      return saved;
    } catch (error) {
      const cause = error instanceof Error && "cause" in error ? error.cause : error;
      if (cause && typeof cause === "object" && "code" in cause && cause.code === "23505") {
        throw new AppError("DUPLICATE_PLAN", "This routine is already planned for that date.", HTTP_STATUS.conflict);
      }
      throw error;
    }
  }
  /** Cancels only planned intent.
   * @param {string} id - Saved plan.
   * @returns {Promise<null>} Cancellation confirmation.
   */
  async remove(id: string) {
    if (!(await this.repository.remove(id))) {
      throw new AppError("NOT_FOUND", "This plan no longer exists.", HTTP_STATUS.notFound);
    }
    return null;
  }
}

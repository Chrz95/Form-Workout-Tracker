import type { RequestHandler } from "express";
import { z } from "zod";
import { planInputSchema } from "../../../../shared/calendarContracts.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import type { CalendarService } from "./calendar.service.js";
const identifierSchema = z.object({ id: z.uuid() });
/** Parses HTTP boundaries before schedule persistence.
 * @param {CalendarService} service - Schedule domain.
 * @returns {Record<string, RequestHandler>} Calendar controllers.
 */
export function createCalendarControllers(service: CalendarService) {
  /** Lists confirmed plans without accepting undocumented parameters.
   * @param {Request} request - HTTP input.
   * @param {Response} response - HTTP output.
   * @returns {Promise<void>} Envelope completion.
   */
  const list: RequestHandler = async (request, response) => {
    z.object({}).strict().parse(request.query);
    response.json({ data: await service.list() });
  };
  /** Creates date-specific intent from a saved routine.
   * @param {Request} request - HTTP input.
   * @param {Response} response - HTTP output.
   * @returns {Promise<void>} Envelope completion.
   */
  const create: RequestHandler = async (request, response) => {
    response.status(HTTP_STATUS.created).json({ data: await service.save(planInputSchema.parse(request.body)) });
  };
  /** Reschedules a confirmed plan.
   * @param {Request} request - HTTP input.
   * @param {Response} response - HTTP output.
   * @returns {Promise<void>} Envelope completion.
   */
  const update: RequestHandler = async (request, response) => {
    const { id } = identifierSchema.parse(request.params);
    response.json({ data: await service.save(planInputSchema.parse(request.body), id) });
  };
  /** Cancels intent without changing the journal.
   * @param {Request} request - HTTP input.
   * @param {Response} response - HTTP output.
   * @returns {Promise<void>} Envelope completion.
   */
  const remove: RequestHandler = async (request, response) => {
    const { id } = identifierSchema.parse(request.params);
    response.json({ data: await service.remove(id) });
  };
  return { list, create, update, remove };
}

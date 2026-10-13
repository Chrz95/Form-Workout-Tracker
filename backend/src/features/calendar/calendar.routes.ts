import { Router } from "express";
import { PLAN_PATH } from "../../../../shared/calendarContracts.js";
import { createCalendarControllers } from "./calendar.controller.js";
import type { CalendarService } from "./calendar.service.js";
/** Mounts calendar intent behind normal application authentication.
 * @param {CalendarService} service - Schedule domain.
 * @returns {Router} Protected schedule methods.
 */
export function createCalendarRoutes(service: CalendarService) {
  const router = Router();
  const controllers = createCalendarControllers(service);
  router.get(PLAN_PATH, controllers.list);
  router.post(PLAN_PATH, controllers.create);
  router.put(`${PLAN_PATH}/:id`, controllers.update);
  router.delete(`${PLAN_PATH}/:id`, controllers.remove);
  return router;
}

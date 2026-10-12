import { Router } from "express";
import { API_PATH } from "../../../../shared/contracts.js";
import { EXERCISE_PATH } from "../../../../shared/exerciseConstants.js";
import type { ExerciseService } from "./exercises.service.js";
import { createExerciseControllers } from "./exercises.controller.js";
/** Composes exercise routes behind the application's authentication middleware.
 * @param {ExerciseService} service - Domain service.
 * @returns {Router} Exercise routes.
 */
export function createExerciseRoutes(service: ExerciseService) {
  const router = Router();
  const controllers = createExerciseControllers(service);
  router.get(API_PATH.exercises, controllers.list);
  router.get(EXERCISE_PATH.custom, controllers.listCustom);
  router.post(EXERCISE_PATH.custom, controllers.create);
  router.put(EXERCISE_PATH.custom + EXERCISE_PATH.identifier, controllers.update);
  router.delete(EXERCISE_PATH.custom + EXERCISE_PATH.identifier, controllers.remove);
  return router;
}

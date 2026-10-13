import { Router } from "express";
import { API_PATH } from "../../../../shared/contracts.js";
import type { TrainingService } from "./training.service.js";
import { createTrainingControllers } from "./training.controller.js";
import { IMPORT_PATH } from "../../../../shared/importContracts.js";
/** Composes resource methods under the versioned API mount.
 * @param {TrainingService} service - Workout domain.
 * @returns {Router} Feature router.
 */
export function createTrainingRoutes(service: TrainingService) {
  const router = Router();
  const controllers = createTrainingControllers(service);
  router.post(IMPORT_PATH, controllers.importRecords);
  router.get(API_PATH.workouts, controllers.listWorkouts);
  router.post(API_PATH.workouts, controllers.createWorkout);
  router.put(`${API_PATH.workouts}/:id`, controllers.updateWorkout);
  router.delete(`${API_PATH.workouts}/:id`, controllers.deleteWorkout);
  router.get(API_PATH.sessions, controllers.listSessions);
  router.post(API_PATH.sessions, controllers.createSession);
  router.delete(`${API_PATH.sessions}/:id`, controllers.deleteSession);
  return router;
}

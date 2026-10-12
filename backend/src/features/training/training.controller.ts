import type { RequestHandler } from "express";
import { z } from "zod";
import { workoutInputSchema, sessionInputSchema } from "../../../../shared/contracts.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import type { TrainingService } from "./training.service.js";
const identifierSchema = z.object({ id: z.uuid() });
const emptyQuerySchema = z.object({}).strict();
/** Translates HTTP input into validated service calls; contains no database queries.
 * @param {TrainingService} service - Domain service.
 * @returns {Record<string, RequestHandler>} Typed controllers.
 */
export function createTrainingControllers(service: TrainingService) {
  /** Returns the saved routine collection.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const listWorkouts: RequestHandler = async (request, response) => {
    emptyQuerySchema.parse(request.query);
    response.json({ data: await service.listWorkouts() });
  };
  /** Validates and creates a routine.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const createWorkout: RequestHandler = async (request, response) => {
    response
      .status(HTTP_STATUS.created)
      .json({ data: await service.saveWorkout(workoutInputSchema.parse(request.body)) });
  };
  /** Validates and replaces a routine.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const updateWorkout: RequestHandler = async (request, response) => {
    const { id } = identifierSchema.parse(request.params);
    response.json({ data: await service.saveWorkout(workoutInputSchema.parse(request.body), id) });
  };
  /** Validates and removes a routine.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const deleteWorkout: RequestHandler = async (request, response) => {
    const { id } = identifierSchema.parse(request.params);
    response.json({ data: await service.deleteWorkout(id) });
  };
  /** Returns completed session history.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const listSessions: RequestHandler = async (request, response) => {
    emptyQuerySchema.parse(request.query);
    response.json({ data: await service.listSessions() });
  };
  /** Validates and records a completed session.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const createSession: RequestHandler = async (request, response) => {
    response
      .status(HTTP_STATUS.created)
      .json({ data: await service.saveSession(sessionInputSchema.parse(request.body)) });
  };
  /** Validates and removes a completed session.
   * @param {Request} request - Untrusted HTTP request.
   * @param {Response} response - Typed HTTP response.
   * @returns {Promise<void>} Response completion.
   */
  const deleteSession: RequestHandler = async (request, response) => {
    const { id } = identifierSchema.parse(request.params);
    response.json({ data: await service.deleteSession(id) });
  };
  return { listWorkouts, createWorkout, updateWorkout, deleteWorkout, listSessions, createSession, deleteSession };
}

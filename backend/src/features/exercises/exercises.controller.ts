import type { RequestHandler } from "express";
import { z } from "zod";
import {
  customExerciseInputSchema,
  customExerciseIdentifierSchema,
} from "../../../../shared/customExerciseContracts.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import type { ExerciseService } from "./exercises.service.js";
const emptyQuerySchema = z.object({}).strict();
/** Parses HTTP boundaries for public references and protected custom entries.
 * @param {ExerciseService} service - Exercise domain.
 * @returns {Record<string, RequestHandler>} Feature controllers.
 */
export function createExerciseControllers(service: ExerciseService) {
  /** Lists the stored catalog without accepting undocumented query parameters.
   * @param {Request} request - HTTP request.
   * @param {Response} response - HTTP response.
   * @returns {Promise<void>} Envelope completion.
   */
  const list: RequestHandler = async (request, response) => {
    emptyQuerySchema.parse(request.query);
    response.json({ data: await service.list() });
  };
  /** Lists owner entries only.
   * @param {Request} request - HTTP request.
   * @param {Response} response - HTTP response.
   * @returns {Promise<void>} Envelope completion.
   */
  const listCustom: RequestHandler = async (request, response) => {
    emptyQuerySchema.parse(request.query);
    response.json({ data: await service.listCustom() });
  };
  /** Validates custom exercise creation without accepting source or identity overrides.
   * @param {Request} request - HTTP request.
   * @param {Response} response - HTTP response.
   * @returns {Promise<void>} Creation response.
   */
  const create: RequestHandler = async (request, response) => {
    response
      .status(HTTP_STATUS.created)
      .json({ data: await service.save(customExerciseInputSchema.parse(request.body)) });
  };
  /** Parses a reserved identity and updates private content.
   * @param {Request} request - HTTP request.
   * @param {Response} response - HTTP response.
   * @returns {Promise<void>} Update response.
   */
  const update: RequestHandler = async (request, response) => {
    const { id } = customExerciseIdentifierSchema.parse(request.params);
    response.json({ data: await service.save(customExerciseInputSchema.parse(request.body), id) });
  };
  /** Removes an unused owner entry.
   * @param {Request} request - HTTP request.
   * @param {Response} response - HTTP response.
   * @returns {Promise<void>} Deletion response.
   */
  const remove: RequestHandler = async (request, response) => {
    const { id } = customExerciseIdentifierSchema.parse(request.params);
    response.json({ data: await service.remove(id) });
  };
  return { list, listCustom, create, update, remove };
}

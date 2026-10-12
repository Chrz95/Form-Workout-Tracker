import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";
import { ZodError } from "zod";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Converts failures into safe envelopes; database and stack details never reach clients.
 * @param {Logger} logger - Structured application logger.
 * @returns {ErrorRequestHandler} Final Express middleware.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, request, response, _next) => {
    const requestId = response.getHeader("X-Request-Id");
    if (error instanceof ZodError) {
      response.status(HTTP_STATUS.badRequest).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the submitted fields.",
          details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        requestId,
      });
      return;
    }
    if (error instanceof AppError) {
      response
        .status(error.status)
        .json({ error: { code: error.code, message: error.message, details: error.details }, requestId });
      return;
    }
    if (error instanceof Error && "status" in error && error.status === HTTP_STATUS.payloadTooLarge) {
      response.status(HTTP_STATUS.payloadTooLarge).json({
        error: { code: "PAYLOAD_TOO_LARGE", message: "Workout data exceeds the request size limit." },
        requestId,
      });
      return;
    }
    if (error instanceof SyntaxError && "body" in error) {
      response
        .status(HTTP_STATUS.badRequest)
        .json({ error: { code: "INVALID_JSON", message: "The request body is not valid JSON." }, requestId });
      return;
    }
    logger.error(
      { errorType: error instanceof Error ? error.name : "UnknownFailure", requestId, path: request.path },
      "Request failed",
    );
    response
      .status(HTTP_STATUS.internal)
      .json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." }, requestId });
  };
}

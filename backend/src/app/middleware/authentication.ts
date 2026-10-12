import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Protects all personal records with a single-owner, deployment-provided bearer token.
 * @param {string} accessToken - Secret configured outside source control.
 * @returns {RequestHandler} Authentication middleware.
 */
export function createAuthentication(accessToken: string): RequestHandler {
  return (request, _response, next) => {
    const authorization = request.header("authorization");
    const supplied = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
    const expectedBuffer = Buffer.from(accessToken);
    const suppliedBuffer = Buffer.from(supplied);
    if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
      next(new AppError("UNAUTHORIZED", "Provide a valid private API access token.", HTTP_STATUS.unauthorized));
      return;
    }
    next();
  };
}

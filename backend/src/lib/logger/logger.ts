import pino from "pino";
import type { Environment } from "../../app/config/environment.js";
/** Creates structured logs with credential and body redaction.
 * @param {Environment} environment - Validated settings.
 * @returns {pino.Logger} Structured logger.
 */
export function createLogger(environment: Environment) {
  return pino({
    level: environment.LOG_LEVEL,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
        "token",
        "password",
        "body",
        "req.body",
        "connectionString",
      ],
      censor: "[REDACTED]",
    },
  });
}

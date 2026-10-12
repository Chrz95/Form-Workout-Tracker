import { HTTP_STATUS } from "../../../../shared/constants.js";
/** Safe application failure with a stable API code. */
export class AppError extends Error {
  /** Constructs an intentional HTTP failure.
   * @param {string} code - Machine-readable code.
   * @param {string} message - Safe user message.
   * @param {number} status - HTTP response status.
   * @param {unknown} [details] - Safe structured validation information.
   */
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = HTTP_STATUS.badRequest,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

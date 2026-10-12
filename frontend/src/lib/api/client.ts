import { API_REQUEST_DEFAULTS } from "./api.constants";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts";
/** Connection values remain in memory for the current tab. */
export interface ApiConnection {
  baseUrl: string;
  token: string;
}
/** Represents a safe, user-visible transport failure. */
export class ApiError extends Error {
  /** Creates a transport failure without retaining response payloads.
   * @param {string} message - Safe message.
   * @param {number} [status] - HTTP status when a response exists.
   */
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
/** Loads the bundled public catalog through the centralized client.
 * @param {AbortSignal} signal - Cancels obsolete requests.
 * @returns {Promise<Exercise[]>} Validated catalog.
 */
export async function fetchCatalog(signal: AbortSignal) {
  const response = await fetch("/exercises.json", { signal });
  if (!response.ok) {
    throw new ApiError("The exercise library could not be loaded. Please try again.");
  }
  return z.array(exerciseSchema).parse(await response.json());
}
/** Sends authenticated requests to the separately deployed Express server.
 * @param {ApiConnection} connection - URL and private access token.
 * @param {string} path - Named API path.
 * @param {z.ZodType<T>} schema - Runtime response contract.
 * @param {RequestInit} options - Request method, body and cancellation.
 * @returns {Promise<T>} Validated response data.
 */
export async function requestApi<T>(
  connection: ApiConnection,
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  if (!connection.baseUrl || !connection.token) {
    throw new ApiError("Connect your workout API to save and sync your training.");
  }
  let response: Response;
  try {
    response = await fetch(`${connection.baseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(API_REQUEST_DEFAULTS.timeoutMilliseconds),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${connection.token}` },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("The API did not respond in time. Your draft is preserved; try again.");
    }
    throw new ApiError("Your workout API is unreachable. Check the URL and your connection.");
  }
  const envelope = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = z.object({ error: z.object({ message: z.string() }) }).safeParse(envelope);
    throw new ApiError(
      failure.success ? failure.data.error.message : "The API request could not be completed.",
      response.status,
    );
  }
  const parsed = z.object({ data: schema }).safeParse(envelope);
  if (!parsed.success) {
    throw new ApiError("The server returned an unexpected response.");
  }
  return parsed.data.data;
}

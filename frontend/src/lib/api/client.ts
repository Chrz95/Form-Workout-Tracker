import { formatExerciseName } from "../../../../shared/exerciseNames";
import { API_REQUEST_DEFAULTS } from "./api.constants";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts";
/** Connection values remain in memory for the current tab. */
export interface ApiConnection {
  baseUrl: string;
  token: string;
  authentication?: "bearer" | "proxy";
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
  const responses = await Promise.all(
    ["/exercises.json", "/exercise-references.json"].map((path) => fetch(path, { signal })),
  );
  if (responses.some((response) => !response.ok)) {
    throw new ApiError("The exercise library could not be loaded. Please try again.");
  }
  const groups = await Promise.all(
    responses.map(async (response) => z.array(exerciseSchema).parse(await response.json())),
  );
  return [...new Map(groups.flat().map((exercise) => [exercise.id, exercise])).values()].map((exercise) => ({
    ...exercise,
    name: formatExerciseName(exercise.name),
  }));
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
  if (!connection.baseUrl || (!connection.token && connection.authentication !== "proxy")) {
    throw new ApiError("Connect your workout API to save and sync your training.");
  }
  if (connection.authentication === "proxy" && new URL(connection.baseUrl).origin !== window.location.origin) {
    throw new ApiError("Automatic connection requires the configured same-origin server proxy.");
  }
  let response: Response;
  try {
    response = await fetch(`${connection.baseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(API_REQUEST_DEFAULTS.timeoutMilliseconds),
      headers: {
        "Content-Type": "application/json",
        ...(connection.token ? { Authorization: `Bearer ${connection.token}` } : {}),
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("The API did not respond in time. Your draft is preserved; try again.");
    }
    throw new ApiError(
      connection.authentication === "proxy"
        ? "Your workout server is unavailable. Reconnecting automatically; your draft is preserved."
        : "Your workout API is unreachable. Check the URL and your connection.",
    );
  }
  const envelope = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = z.object({ error: z.object({ message: z.string() }) }).safeParse(envelope);
    const proxyFailure =
      connection.authentication === "proxy"
        ? response.status === 403
          ? "The server rejected this site address. Check the configured app address."
          : response.status === 401
            ? "The server connection credentials do not match. Restart the app services together."
            : response.status >= 500
              ? "The workout server is not ready. Reconnecting automatically; your draft is preserved."
              : "The API request could not be completed."
        : "The API request could not be completed.";
    const message =
      connection.authentication === "proxy" && [401, 403].includes(response.status)
        ? proxyFailure
        : failure.success
          ? failure.data.error.message
          : proxyFailure;
    throw new ApiError(message, response.status);
  }
  const parsed = z.object({ data: schema }).safeParse(envelope);
  if (!parsed.success) {
    throw new ApiError("The server returned an unexpected response.");
  }
  return parsed.data.data;
}

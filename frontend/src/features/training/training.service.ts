import { HTTP_STATUS } from "../../../../shared/constants";
import { capabilitiesSchema, capabilitiesResponseSchema } from "../../../../shared/capabilities";
import { z } from "zod";
import { API_PATH, workoutSchema, sessionSchema, type Workout, type Session } from "../../../../shared/contracts";
import { requestApi, ApiError, type ApiConnection } from "../../lib/api/client";
import { IMPORT_PATH, importResultSchema, type ImportInput } from "../../../../shared/importContracts";
/** Commits a reviewed transfer batch through the protected atomic import endpoint.
 * @param {ApiConnection} connection - Verified server credentials.
 * @param {ImportInput} input - Validated reviewed file.
 * @returns {Promise<ImportResult>} Confirmed committed counts.
 */
export function importTrainingRecords(connection: ApiConnection, input: ImportInput) {
  return requestApi(connection, IMPORT_PATH, importResultSchema, { method: "POST", body: JSON.stringify(input) });
}
/** Loads persisted routines.
 * @param {ApiConnection} connection - Server connection.
 * @returns {Promise<Workout[]>} Saved routines.
 */
export function fetchWorkouts(connection: ApiConnection) {
  return requestApi(connection, API_PATH.workouts, z.array(workoutSchema));
}
/** Loads persisted training history.
 * @param {ApiConnection} connection - Server connection.
 * @returns {Promise<Session[]>} Completed sessions.
 */
export function fetchSessions(connection: ApiConnection) {
  return requestApi(connection, API_PATH.sessions, z.array(sessionSchema));
}
/** Creates or updates a routine atomically.
 * @param {ApiConnection} connection - Server connection.
 * @param {Omit<Workout, "id" | "createdAt">} workout - Prescription.
 * @param {string} [workoutId] - Existing routine identifier.
 * @returns {Promise<Workout>} Persisted routine.
 */
export function saveWorkout(connection: ApiConnection, workout: Omit<Workout, "id" | "createdAt">, workoutId?: string) {
  return requestApi(connection, `${API_PATH.workouts}${workoutId ? `/${workoutId}` : ""}`, workoutSchema, {
    method: workoutId ? "PUT" : "POST",
    body: JSON.stringify(workout),
  });
}
/** Saves a completed session.
 * @param {ApiConnection} connection - Server connection.
 * @param {Omit<Session, "id" | "createdAt">} session - Completion data.
 * @returns {Promise<Session>} Saved session.
 */
export function saveSession(connection: ApiConnection, session: Omit<Session, "id" | "createdAt">) {
  return requestApi(connection, API_PATH.sessions, sessionSchema, { method: "POST", body: JSON.stringify(session) });
}
/** Deletes a saved resource.
 * @param {ApiConnection} connection - Server connection.
 * @param {string} path - Resource path.
 * @returns {Promise<null>} Successful deletion.
 */
export function deleteRecord(connection: ApiConnection, path: string) {
  return requestApi(connection, path, z.null(), { method: "DELETE" });
}

/** Prevents set-level clients connecting to a server that would discard their data.
 * @param {ApiConnection} connection - Remote API connection.
 * @returns {Promise<{release: string, features: string[]}>} Compatible API metadata.
 */
export async function verifyApiCapabilities(connection: ApiConnection) {
  try {
    const metadata = await requestApi(connection, API_PATH.capabilities, capabilitiesResponseSchema);
    if (!capabilitiesSchema.safeParse(metadata).success) {
      throw new ApiError("Update your workout API to release 2.0 before saving individual sets.");
    }
    return metadata;
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_STATUS.notFound) {
      throw new ApiError("This API needs the release 2.0 update to save individual sets.");
    }
    throw error;
  }
}

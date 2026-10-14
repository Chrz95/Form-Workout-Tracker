import { z } from "zod";
import { exerciseSchema, type Exercise } from "../../../../shared/contracts";
import type { CustomExerciseInput } from "../../../../shared/customExerciseContracts";
import { EXERCISE_PATH } from "../../../../shared/exerciseConstants";
import { requestApi, type ApiConnection } from "../../lib/api/client";
/** Fetches only authenticated owner exercises; public references are bundled separately.
 * @param {ApiConnection} connection - Private server connection.
 * @returns {Promise<Exercise[]>} Custom records.
 */
export function fetchCustomExercises(connection: ApiConnection): Promise<Exercise[]> {
  return requestApi(connection, EXERCISE_PATH.custom, z.array(exerciseSchema));
}
/** Creates or updates authored content through the central client.
 * @param {ApiConnection} connection - Private server connection.
 * @param {CustomExerciseInput} input - Validated authored content.
 * @param {string | undefined} id - Existing custom identity.
 * @returns {Promise<Exercise>} Confirmed record.
 */
export function saveCustomExercise(
  connection: ApiConnection,
  input: CustomExerciseInput,
  id?: string,
): Promise<Exercise> {
  return requestApi(connection, EXERCISE_PATH.custom + (id ? `/${encodeURIComponent(id)}` : ""), exerciseSchema, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
}
/** Removes a server-confirmed unused exercise.
 * @param {ApiConnection} connection - Private server connection.
 * @param {string} id - Existing custom identity.
 * @returns {Promise<null>} Confirmed deletion.
 */
export function deleteCustomExercise(connection: ApiConnection, id: string): Promise<null> {
  return requestApi(connection, `${EXERCISE_PATH.custom}/${encodeURIComponent(id)}`, z.null(), { method: "DELETE" });
}

import { z } from "zod";
import { planSchema, PLAN_PATH, type PlanInput } from "../../../../shared/calendarContracts";
import { requestApi, type ApiConnection } from "../../lib/api/client";
/** Loads protected planned dates.
 * @param {ApiConnection} connection - Owner API connection.
 * @returns {Promise<Plan[]>} Saved intent.
 */
export function fetchPlans(connection: ApiConnection) {
  return requestApi(connection, PLAN_PATH, z.array(planSchema));
}
/** Persists a date/routine pair or reschedules it.
 * @param {ApiConnection} connection - Owner connection.
 * @param {PlanInput} input - Validated plan.
 * @param {string | undefined} id - Existing plan identity.
 * @returns {Promise<Plan>} Confirmed intent.
 */
export function savePlan(connection: ApiConnection, input: PlanInput, id?: string) {
  return requestApi(connection, PLAN_PATH + (id ? `/${id}` : ""), planSchema, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
}
/** Cancels only the plan.
 * @param {ApiConnection} connection - Owner connection.
 * @param {string} id - Plan identity.
 * @returns {Promise<null>} Confirmed cancellation.
 */
export function deletePlan(connection: ApiConnection, id: string) {
  return requestApi(connection, `${PLAN_PATH}/${id}`, z.null(), { method: "DELETE" });
}

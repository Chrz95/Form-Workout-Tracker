import { useState } from "react";
import { useAutomaticConnection } from "./useAutomaticConnection";
import type { Workout, Session, Exercise } from "../../../../shared/contracts";
import type { CustomExerciseInput } from "../../../../shared/customExerciseContracts";
import { API_FEATURE } from "../../../../shared/capabilities";
import { fetchCustomExercises, saveCustomExercise, deleteCustomExercise } from "../exercises";
import { frontendEnvironment } from "../../app/config/environment";
import {
  fetchWorkouts,
  fetchSessions,
  saveWorkout,
  saveSession,
  deleteRecord,
  verifyApiCapabilities,
  importTrainingRecords,
} from "./training.service";
import { API_PATH } from "../../../../shared/contracts";
import { ApiError, type ApiConnection } from "../../lib/api/client";
import { fetchPlans, savePlan, deletePlan } from "../calendar";
import type { Plan, PlanInput } from "../../../../shared/calendarContracts";
import type { ImportInput } from "../../../../shared/importContracts";
/** Owns server records, pending states and transport errors.
 * @returns {object} Authenticated record operations.
 */
export function useRecords() {
  const [connection, setConnection] = useState<ApiConnection>({
    authentication: frontendEnvironment.authentication,
    baseUrl: frontendEnvironment.apiBaseUrl,
    token: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [hasCustomExerciseSupport, setHasCustomExerciseSupport] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [hasCalendarSupport, setHasCalendarSupport] = useState(false);
  const [hasNestedSupport, setHasNestedSupport] = useState(false);
  const [hasPlannedSetsSupport, setHasPlannedSetsSupport] = useState(false);
  const [hasImportSupport, setHasImportSupport] = useState(false);
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  /** Runs an operation and surfaces failures.
   * @param {() => Promise<void>} operation - Asynchronous work.
   * @param {boolean} [background] - Whether connection probing should avoid notification toasts.
   * @returns {Promise<boolean>} Whether the operation succeeded.
   */
  async function runOperation(operation: () => Promise<void>, background = false) {
    setIsPending(true);
    setApiError("");
    if (!background) {
      setMessage("");
    }
    try {
      await operation();
      return true;
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "The request could not be completed.";
      if (!background) {
        setMessage(failureMessage);
      }
      setApiError(failureMessage);
      if (
        connection.authentication === "proxy" &&
        error instanceof ApiError &&
        (!error.status || error.status >= 500 || error.status === 401 || error.status === 403)
      ) {
        setIsConnected(false);
      }
      return false;
    } finally {
      setIsPending(false);
    }
  }
  /** Verifies the connection before replacing current records.
   * @param {ApiConnection} nextConnection - Server credentials.
   * @returns {Promise<boolean>} Connection result.
   */
  function connectApi(nextConnection: ApiConnection) {
    return runOperation(async () => {
      const capabilities = await verifyApiCapabilities(nextConnection);
      const supportsCustom = capabilities.features.includes(API_FEATURE.customExercises);
      const supportsCalendar = capabilities.features.includes(API_FEATURE.calendar);
      const [loadedWorkouts, loadedSessions, loadedCustomExercises, loadedPlans] = await Promise.all([
        fetchWorkouts(nextConnection),
        fetchSessions(nextConnection),
        supportsCustom ? fetchCustomExercises(nextConnection) : Promise.resolve([]),
        supportsCalendar ? fetchPlans(nextConnection) : Promise.resolve([]),
      ]);
      setConnection(nextConnection);
      setWorkouts(loadedWorkouts);
      setSessions(loadedSessions);
      setCustomExercises(loadedCustomExercises);
      setHasCustomExerciseSupport(supportsCustom);
      setPlans(loadedPlans);
      setHasCalendarSupport(supportsCalendar);
      setHasImportSupport(capabilities.features.includes(API_FEATURE.csvImport));
      setHasNestedSupport(capabilities.features.includes(API_FEATURE.nestedWorkouts));
      setHasPlannedSetsSupport(capabilities.features.includes(API_FEATURE.plannedSets));
      setIsConnected(true);
      setMessage(nextConnection.authentication === "proxy" ? "" : "Your training API is connected.");
    }, nextConnection.authentication === "proxy");
  }
  const automaticConnection = useAutomaticConnection(connection, isConnected, connectApi);
  /** Persists a routine and updates the current collection.
   * @param {Omit<Workout, "id" | "createdAt">} workout - Draft list.
   * @param {string} [id] - Existing routine.
   * @returns {Promise<boolean>} Save result.
   */
  function persistWorkout(workout: Omit<Workout, "id" | "createdAt">, id?: string) {
    return runOperation(async () => {
      if (!hasPlannedSetsSupport && workout.items.some((item) => item.plannedSets)) {
        throw new Error("Update your API to release 2.6 before saving individual set targets.");
      }
      if (workout.includedWorkoutIds?.length && !hasNestedSupport) {
        throw new Error("Update your API to release 2.7 before saving nested workouts.");
      }
      const saved = await saveWorkout(connection, workout, id);
      setWorkouts((previous) => [saved, ...previous.filter((entry) => entry.id !== saved.id)]);
      setMessage("Workout saved to your library.");
    });
  }
  /** Saves a reviewed file and reloads confirmed database records.
   * @param {ImportInput} input - Validated transfer file.
   * @returns {Promise<boolean>} Whether the server confirmed the import.
   */
  function persistImport(input: ImportInput): Promise<boolean> {
    return runOperation(async () => {
      if (!hasImportSupport) {
        throw new Error("Connect an API with CSV import support before saving.");
      }
      if (
        !hasPlannedSetsSupport &&
        input.kind === "workouts" &&
        input.records.some((record) => record.items.some((item) => item.plannedSets))
      ) {
        throw new Error("Update your API to release 2.6 before importing individual set targets.");
      }
      if (
        !hasNestedSupport &&
        input.kind === "workouts" &&
        input.records.some((record) => record.includedWorkoutIds?.length)
      ) {
        throw new Error("Update your API to release 2.7 before importing nested workouts.");
      }
      const result = await importTrainingRecords(connection, input);
      const confirmation = `${result.inserted} records imported; ${result.skipped} unchanged records skipped.`;
      try {
        if (input.kind === "workouts") {
          setWorkouts(await fetchWorkouts(connection));
        } else {
          setSessions(await fetchSessions(connection));
        }
        setMessage(confirmation);
      } catch {
        setMessage(`${confirmation} Reconnect to reload your saved records.`);
      }
    });
  }
  /** Records a completed workout.
   * @param {Omit<Session, "id" | "createdAt">} session - Session details.
   * @returns {Promise<boolean>} Save result.
   */
  function persistSession(session: Omit<Session, "id" | "createdAt">) {
    return runOperation(async () => {
      const saved = await saveSession(connection, session);
      setSessions((previous) => [saved, ...previous]);
      setMessage("Session saved. Nice work showing up.");
    });
  }
  /** Removes a saved record only after the API succeeds.
   * @param {"workouts" | "sessions"} kind - Resource collection.
   * @param {string} id - Record identifier.
   * @returns {Promise<boolean>} Delete result.
   */
  function removeRecord(kind: "workouts" | "sessions", id: string) {
    return runOperation(async () => {
      await deleteRecord(connection, `${API_PATH[kind]}/${id}`);
      if (kind === "workouts") {
        setWorkouts((previous) => previous.filter((record) => record.id !== id));
        setPlans((previous) => previous.map((plan) => (plan.workoutId === id ? { ...plan, workoutId: null } : plan)));
      } else {
        setSessions((previous) => previous.filter((record) => record.id !== id));
      }
      setMessage("Record deleted.");
    });
  }
  /** Saves private authored content only after feature verification and API confirmation.
   * @param {CustomExerciseInput} input - Custom content.
   * @param {string | undefined} id - Existing identity.
   * @returns {Promise<boolean>} Whether the save was confirmed.
   */
  function persistCustomExercise(input: CustomExerciseInput, id?: string): Promise<boolean> {
    return runOperation(async () => {
      if (!hasCustomExerciseSupport) {
        throw new Error("Connect an API with the release 2.2 custom exercise update before saving.");
      }
      const saved = await saveCustomExercise(connection, input, id);
      setCustomExercises((previous) => [saved, ...previous.filter((entry) => entry.id !== saved.id)]);
      setMessage("Your custom exercise is saved and ready to use.");
    });
  }
  /** Keeps referenced history intact and changes the catalog only after confirmed deletion.
   * @param {string} id - Custom identity.
   * @returns {Promise<boolean>} Whether deletion was confirmed.
   */
  function removeCustomExercise(id: string): Promise<boolean> {
    return runOperation(async () => {
      await deleteCustomExercise(connection, id);
      setCustomExercises((previous) => previous.filter((entry) => entry.id !== id));
      setMessage("Custom exercise deleted.");
    });
  }
  /** Saves planned intent only after server confirmation.
   * @param {PlanInput} input - Date and saved routine.
   * @param {string | undefined} id - Existing plan.
   * @returns {Promise<boolean>} Confirmed save.
   */
  function persistPlan(input: PlanInput, id?: string): Promise<boolean> {
    return runOperation(async () => {
      if (!hasCalendarSupport) {
        throw new Error("Connect an API with the calendar update before saving plans.");
      }
      const saved = await savePlan(connection, input, id);
      setPlans((previous) => [saved, ...previous.filter((plan) => plan.id !== saved.id)]);
      setMessage("Your workout plan is saved. Completed training is logged separately.");
    });
  }
  /** Cancels a plan without changing completed history.
   * @param {string} id - Plan identity.
   * @returns {Promise<boolean>} Confirmed cancellation.
   */
  function removePlan(id: string): Promise<boolean> {
    return runOperation(async () => {
      await deletePlan(connection, id);
      setPlans((previous) => previous.filter((plan) => plan.id !== id));
      setMessage("Plan cancelled. Your training journal is unchanged.");
    });
  }
  return {
    ...automaticConnection,
    hasImportSupport,
    persistImport,
    plans,
    hasCalendarSupport,
    persistPlan,
    removePlan,
    customExercises,
    hasCustomExerciseSupport,
    persistCustomExercise,
    removeCustomExercise,
    apiError,
    setApiError,
    connection,
    isConnected,
    isPending,
    workouts,
    sessions,
    message,
    setMessage,
    connectApi,
    persistWorkout,
    persistSession,
    removeRecord,
  };
}

import { useState } from "react";
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
} from "./training.service";
import { API_PATH } from "../../../../shared/contracts";
import type { ApiConnection } from "../../lib/api/client";
/** Owns server records, pending states and transport errors.
 * @returns {object} Authenticated record operations.
 */
export function useRecords() {
  const [connection, setConnection] = useState<ApiConnection>({ baseUrl: frontendEnvironment.apiBaseUrl, token: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [hasCustomExerciseSupport, setHasCustomExerciseSupport] = useState(false);
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  /** Runs an operation and surfaces failures.
   * @param {() => Promise<void>} operation - Asynchronous work.
   * @returns {Promise<boolean>} Whether the operation succeeded.
   */
  async function runOperation(operation: () => Promise<void>) {
    setIsPending(true);
    setApiError("");
    setMessage("");
    try {
      await operation();
      return true;
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "The request could not be completed.";
      setMessage(failureMessage);
      setApiError(failureMessage);
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
      const [loadedWorkouts, loadedSessions, loadedCustomExercises] = await Promise.all([
        fetchWorkouts(nextConnection),
        fetchSessions(nextConnection),
        supportsCustom ? fetchCustomExercises(nextConnection) : Promise.resolve([]),
      ]);
      setConnection(nextConnection);
      setWorkouts(loadedWorkouts);
      setSessions(loadedSessions);
      setCustomExercises(loadedCustomExercises);
      setHasCustomExerciseSupport(supportsCustom);
      setIsConnected(true);
      setMessage("Your training API is connected.");
    });
  }
  /** Persists a routine and updates the current collection.
   * @param {Omit<Workout, "id" | "createdAt">} workout - Draft list.
   * @param {string} [id] - Existing routine.
   * @returns {Promise<boolean>} Save result.
   */
  function persistWorkout(workout: Omit<Workout, "id" | "createdAt">, id?: string) {
    return runOperation(async () => {
      const saved = await saveWorkout(connection, workout, id);
      setWorkouts((previous) => [saved, ...previous.filter((entry) => entry.id !== saved.id)]);
      setMessage("Workout saved to your library.");
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
  return {
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

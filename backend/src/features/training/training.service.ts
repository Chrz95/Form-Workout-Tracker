import type { WorkoutItem } from "../../../../shared/contracts.js";
import type { ImportInput } from "../../../../shared/importContracts.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import { AppError } from "../../lib/errors/AppError.js";
import type { TrainingRepository, WorkoutInput, SessionInput } from "./training.types.js";
/** Enforces domain references and translates known persistence failures. */
export class TrainingService {
  /** Injects persistence for independent business-rule testing.
   * @param {TrainingRepository} repository - Data access boundary.
   */
  constructor(private readonly repository: TrainingRepository) {}
  /** Verifies catalog references and prevents duplicate prescriptions.
   * @param {WorkoutItem[]} items - Requested exercise prescriptions.
   * @returns {Promise<void>} Validation completion.
   */
  private async validateItems(items: WorkoutItem[]) {
    if (this.repository.resolveExerciseIds) {
      const canonicalIds = await this.repository.resolveExerciseIds(items);
      if (new Set(canonicalIds).size !== canonicalIds.length) {
        throw new AppError(
          "DUPLICATE_EXERCISE",
          "Choose one entry per movement; alternate names refer to the same exercise.",
        );
      }
    }
    if (new Set(items.map((item) => item.exerciseId)).size !== items.length) {
      throw new AppError("DUPLICATE_EXERCISE", "Each exercise may appear once in a workout.");
    }
    if (!(await this.repository.validateExercises(items))) {
      throw new AppError("UNKNOWN_EXERCISE", "One or more exercises no longer exist in the library.");
    }
  }
  /** Runs a write while mapping database constraints to safe messages.
   * @param {() => Promise<T>} operation - Persistence operation.
   * @returns {Promise<T>} Persisted value.
   */
  private async persist<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Error &&
        "cause" in error &&
        error.cause instanceof Error &&
        "code" in error.cause &&
        ["23503", "23505", "23514"].includes(String(error.cause.code))
      ) {
        throw new AppError(
          "RECORD_CONFLICT",
          "The record conflicts with saved data. Refresh and try again.",
          HTTP_STATUS.conflict,
        );
      }
      throw error;
    }
  }
  /** Lists saved routines.
   * @returns {Promise<Workout[]>} Persisted lists.
   */
  listWorkouts() {
    return this.repository.listWorkouts();
  }
  /** Imports a whole validated file without replacing saved identities.
   * @param {ImportInput} input - Bounded transfer batch.
   * @returns {Promise<ImportResult>} Committed counts.
   */
  async importRecords(input: ImportInput) {
    const operation = this.repository.importRecords;
    if (!operation) {
      throw new AppError("IMPORT_UNAVAILABLE", "Update this API before importing.", HTTP_STATUS.unavailable);
    }
    return this.persist(() => operation(input));
  }
  /** Saves a validated routine atomically.
   * @param {WorkoutInput} input - Routine prescription.
   * @param {string} [id] - Existing identifier.
   * @returns {Promise<Workout>} Saved routine.
   */
  async saveWorkout(input: WorkoutInput, id?: string) {
    await this.validateItems(input.items);
    const result = await this.persist(() => this.repository.saveWorkout(input, id));
    if (!result) {
      throw new AppError("NOT_FOUND", "This workout could not be found.", HTTP_STATUS.notFound);
    }
    return result;
  }
  /** Removes a routine or reports a missing record.
   * @param {string} id - Routine identifier.
   * @returns {Promise<null>} Successful deletion envelope.
   */
  async deleteWorkout(id: string) {
    if (!(await this.persist(() => this.repository.deleteWorkout(id)))) {
      throw new AppError("NOT_FOUND", "This workout could not be found.", HTTP_STATUS.notFound);
    }
    return null;
  }
  /** Lists completed sessions.
   * @returns {Promise<Session[]>} Training history.
   */
  listSessions() {
    return this.repository.listSessions();
  }
  /** Records an actual completed workout.
   * @param {SessionInput} input - Completed session.
   * @returns {Promise<Session>} Saved session.
   */
  async saveSession(input: SessionInput) {
    await this.validateItems(input.items);
    return this.persist(() => this.repository.saveSession(input));
  }
  /** Deletes a session without impacting its source routine.
   * @param {string} id - Completion identifier.
   * @returns {Promise<null>} Successful deletion.
   */
  async deleteSession(id: string) {
    if (!(await this.repository.deleteSession(id))) {
      throw new AppError("NOT_FOUND", "This session could not be found.", HTTP_STATUS.notFound);
    }
    return null;
  }
}

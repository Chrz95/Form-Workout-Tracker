import { AppError } from "../../lib/errors/AppError.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import { serializeSessionInput } from "./sessionIdempotency.js";
import { desc, eq } from "drizzle-orm";
import { sessions, sessionItems } from "../../db/schema/tables.js";
import { sessionSets } from "../../db/schema/sessionSets.js";
import type { Database } from "../../db/client.js";
import type { SessionInput } from "./training.types.js";
import { HTTP_DEFAULTS } from "../../constants/http.constants.js";
import { readSession } from "./sessions.mapper.js";
/** Owns session creation, actual set values and idempotent finish retries.
 * @param {Database} database - Pooled connection.
 * @returns {object} Completion repository methods.
 */
export function createSessionsRepository(database: Database) {
  /** Loads history with real set values where available.
   * @returns {Promise<Session[]>} Completed history.
   */
  async function listSessions() {
    const records = await database
      .select()
      .from(sessions)
      .orderBy(desc(sessions.date), desc(sessions.createdAt))
      .limit(HTTP_DEFAULTS.maxRecords);
    return Promise.all(records.map((record) => readSession(database, record)));
  }
  /** Atomically saves every set; repeated submission identifiers return the first saved session.
   * @param {SessionInput} input - Validated completion.
   * @returns {Promise<Session>} Saved session.
   */
  async function saveSession(input: SessionInput) {
    return database.transaction(async (transaction) => {
      const [record] = await transaction
        .insert(sessions)
        .values({
          name: input.name,
          notes: input.notes,
          date: input.date,
          duration: input.duration,
          submissionId: input.submissionId,
        })
        .onConflictDoNothing({ target: sessions.submissionId })
        .returning();
      if (!record) {
        if (input.submissionId) {
          const [existing] = await transaction
            .select()
            .from(sessions)
            .where(eq(sessions.submissionId, input.submissionId));
          if (existing) {
            const saved = await readSession(transaction, existing);
            if (serializeSessionInput(saved) !== serializeSessionInput(input)) {
              throw new AppError(
                "SUBMISSION_CONFLICT",
                "This session was already saved with different values. Reconnect to refresh your journal.",
                HTTP_STATUS.conflict,
              );
            }
            return saved;
          }
        }
        throw new Error("Session insert returned no record");
      }
      await transaction.insert(sessionItems).values(
        input.items.map(({ exerciseId, sets, reps, weight }, position) => ({
          exerciseId,
          sets,
          reps,
          weight,
          sessionId: record.id,
          position,
        })),
      );
      const completedSets = input.items.flatMap((item) =>
        (item.performedSets ?? []).map((set, position) => ({
          ...set,
          exerciseId: item.exerciseId,
          sessionId: record.id,
          position,
        })),
      );
      if (completedSets.length > 0) {
        await transaction.insert(sessionSets).values(completedSets);
      }
      return readSession(transaction, record);
    });
  }
  /** Removes completion metadata and cascades item/set cleanup.
   * @param {string} id - Session identifier.
   * @returns {Promise<boolean>} Whether a record existed.
   */
  async function deleteSession(id: string) {
    return (await database.delete(sessions).where(eq(sessions.id, id)).returning({ id: sessions.id })).length > 0;
  }
  return { listSessions, saveSession, deleteSession };
}

import { asc, eq } from "drizzle-orm";
import type { Session } from "../../../../shared/contracts.js";
import type { Database } from "../../db/client.js";
import { sessions, sessionItems } from "../../db/schema/tables.js";
import { sessionSets } from "../../db/schema/sessionSets.js";
/** The read capability shared by a pooled database and its transaction. */
export type SessionReader = Pick<Database, "select">;
/** Maps one session without fabricating individual values for legacy aggregate records.
 * @param {SessionReader} database - Read-capable database or transaction.
 * @param {typeof sessions.$inferSelect} record - Persisted metadata.
 * @returns {Promise<Session>} Complete API response.
 */
export async function readSession(database: SessionReader, record: typeof sessions.$inferSelect): Promise<Session> {
  const items = await database
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, record.id))
    .orderBy(asc(sessionItems.position));
  const sets = await database
    .select()
    .from(sessionSets)
    .where(eq(sessionSets.sessionId, record.id))
    .orderBy(asc(sessionSets.position));
  return {
    ...record,
    submissionId: record.submissionId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    items: items.map(({ exerciseId, reps, weight, sets: setCount, notes }) => {
      const performedSets = sets
        .filter((set) => set.exerciseId === exerciseId)
        .map(({ id, reps: completedReps, weight: completedWeight, rpe, kind }) => ({
          id,
          reps: completedReps,
          weight: completedWeight,
          rpe,
          kind,
        }));
      return {
        exerciseId,
        reps,
        weight,
        sets: setCount,
        ...(notes ? { notes } : {}),
        ...(performedSets.length > 0 ? { performedSets } : {}),
      };
    }),
  };
}

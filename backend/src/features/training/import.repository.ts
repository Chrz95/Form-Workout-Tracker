import { asc, eq, inArray } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { exercises, workouts, workoutItems, sessions, sessionItems } from "../../db/schema/tables.js";
import { sessionSets } from "../../db/schema/sessionSets.js";
import type { ImportInput, ImportResult } from "../../../../shared/importContracts.js";
import type { Workout, Session } from "../../../../shared/contracts.js";
import { serializeImportedRecord } from "../../../../shared/importIdentity.js";
import { HTTP_STATUS } from "../../../../shared/constants.js";
import { readSession } from "./sessions.mapper.js";
import { AppError } from "../../lib/errors/AppError.js";
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
import { workoutLinks } from "../../db/schema/workoutLinks.js";
import { lockWorkoutGraph, replaceWorkoutLinks, validateWorkoutGraph } from "./workoutGraph.repository.js";
/** Rejects changed IDs so imports never overwrite existing prescriptions or history.
 * @param {Workout | Session} saved - Current database record.
 * @param {Workout | Session} incoming - Imported record with the same ID.
 * @returns {void} Throws on any changed transfer value.
 */
function assertUnchanged(saved: Workout | Session, incoming: Workout | Session): void {
  if (serializeImportedRecord(saved) !== serializeImportedRecord(incoming)) {
    throw new AppError(
      "IMPORT_CONFLICT",
      `“${incoming.name}” has a saved ID with different values. Nothing was imported.`,
      HTTP_STATUS.conflict,
    );
  }
}
/** Inserts a routine or verifies its locked existing identity.
 * @param {Transaction} transaction - Atomic batch transaction.
 * @param {Workout} record - Validated imported routine.
 * @returns {Promise<boolean>} Whether a new routine was inserted.
 */
async function importWorkout(transaction: Transaction, record: Workout): Promise<boolean> {
  const [inserted] = await transaction
    .insert(workouts)
    .values({
      id: record.id,
      name: record.name,
      notes: record.notes,
      createdAt: new Date(record.createdAt),
    })
    .onConflictDoNothing({ target: workouts.id })
    .returning();
  if (inserted) {
    if (record.items.length) {
      await transaction.insert(workoutItems).values(
        record.items.map((item, position) => ({
          ...item,
          workoutId: record.id,
          position,
        })),
      );
    }
    return true;
  }
  const [existing] = await transaction.select().from(workouts).where(eq(workouts.id, record.id)).for("update");
  if (!existing) {
    throw new Error("Import identity disappeared");
  }
  const items = await transaction
    .select()
    .from(workoutItems)
    .where(eq(workoutItems.workoutId, record.id))
    .orderBy(asc(workoutItems.position));
  const links = await transaction
    .select()
    .from(workoutLinks)
    .where(eq(workoutLinks.parentId, record.id))
    .orderBy(asc(workoutLinks.position));
  assertUnchanged(
    {
      ...existing,
      ...(links.length ? { includedWorkoutIds: links.map((link) => link.childId) } : {}),
      createdAt: existing.createdAt.toISOString(),
      items: items.map(({ exerciseId, sets, reps, weight, plannedSets }) => ({
        exerciseId,
        sets,
        reps,
        weight,
        ...(plannedSets ? { plannedSets } : {}),
      })),
    },
    record,
  );
  return false;
}
/** Inserts a session while preserving actual sets or legacy aggregates exactly.
 * @param {Transaction} transaction - Atomic batch transaction.
 * @param {Session} record - Validated imported session.
 * @returns {Promise<boolean>} Whether a session was inserted.
 */
async function importSession(transaction: Transaction, record: Session): Promise<boolean> {
  const [inserted] = await transaction
    .insert(sessions)
    .values({
      id: record.id,
      name: record.name,
      notes: record.notes,
      date: record.date,
      duration: record.duration,
      createdAt: new Date(record.createdAt),
    })
    .onConflictDoNothing({ target: sessions.id })
    .returning();
  if (!inserted) {
    const [existing] = await transaction.select().from(sessions).where(eq(sessions.id, record.id)).for("update");
    if (!existing) {
      throw new Error("Import identity disappeared");
    }
    assertUnchanged(await readSession(transaction, existing), record);
    return false;
  }
  await transaction.insert(sessionItems).values(
    record.items.map(({ exerciseId, sets, reps, weight }, position) => ({
      exerciseId,
      sets,
      reps,
      weight,
      position,
      sessionId: record.id,
    })),
  );
  const values = record.items.flatMap((item) =>
    (item.performedSets ?? []).map((set, position) => ({
      ...set,
      position,
      sessionId: record.id,
      exerciseId: item.exerciseId,
    })),
  );
  if (values.length) {
    await transaction.insert(sessionSets).values(values);
  }
  return true;
}
/** Creates the PostgreSQL-only transfer boundary with no partial batch writes.
 * @param {Database} database - Pooled database.
 * @returns {(input: ImportInput) => Promise<ImportResult>} Import operation.
 */
export function createImportRepository(database: Database) {
  /** Serializes competing imports and rechecks canonical exercise references inside the transaction.
   * @param {ImportInput} input - Bounded validated batch.
   * @returns {Promise<ImportResult>} Committed counts.
   */
  async function importRecords(input: ImportInput): Promise<ImportResult> {
    return database.transaction(async (transaction) => {
      await lockWorkoutGraph(transaction);
      const ids = [...new Set(input.records.flatMap((record) => record.items.map((item) => item.exerciseId)))];
      const catalog = await transaction.select().from(exercises).where(inArray(exercises.id, ids)).for("share");
      if (catalog.length !== ids.length) {
        throw new AppError(
          "UNKNOWN_EXERCISE",
          "Some exercise IDs are missing. Add their custom exercises before importing.",
        );
      }
      const identities = new Map(catalog.map((row) => [row.id, row.data.canonicalId ?? row.id]));
      for (const record of input.records) {
        const keys = record.items.map((item) => identities.get(item.exerciseId));
        if (new Set(keys).size !== keys.length) {
          throw new AppError("DUPLICATE_EXERCISE", "Alternate names refer to the same movement in an imported record.");
        }
      }
      let inserted = 0;
      if (input.kind === "workouts") {
        const newRecords: Workout[] = [];
        for (const record of input.records) {
          if (await importWorkout(transaction, record)) {
            newRecords.push(record);
            inserted += 1;
          }
        }
        for (const record of newRecords) {
          await replaceWorkoutLinks(transaction, record.id, record.includedWorkoutIds);
        }
        await validateWorkoutGraph(transaction);
      } else {
        for (const record of input.records) {
          inserted += Number(await importSession(transaction, record));
        }
      }
      return { inserted, skipped: input.records.length - inserted };
    });
  }
  return importRecords;
}

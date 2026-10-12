import { pgTable, uuid, text, integer, numeric, primaryKey, foreignKey, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { sessionItems } from "./tables.js";
import { SET_KIND, type PerformedSet } from "../../../../shared/setContracts.js";
/** Real set values belong to their session exercise, with cascading cleanup. */
export const sessionSets = pgTable(
  "session_sets",
  {
    id: uuid("id").defaultRandom().notNull().unique(),
    sessionId: uuid("session_id").notNull(),
    exerciseId: text("exercise_id").notNull(),
    position: integer("position").notNull(),
    reps: integer("reps").notNull(),
    weight: numeric("weight", { mode: "number" }).notNull(),
    rpe: numeric("rpe", { mode: "number" }),
    kind: text("kind").$type<PerformedSet["kind"]>().notNull().default(SET_KIND.working),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.exerciseId, table.position] }),
    foreignKey({
      columns: [table.sessionId, table.exerciseId],
      foreignColumns: [sessionItems.sessionId, sessionItems.exerciseId],
    }).onDelete("cascade"),
    check("session_set_valid", sql`${table.reps} > 0 AND ${table.weight} >= 0 AND ${table.position} >= 0`),
    check("session_set_rpe_valid", sql`${table.rpe} IS NULL OR (${table.rpe} >= 1 AND ${table.rpe} <= 10)`),
    check("session_set_kind_valid", sql`${table.kind} IN ('working', 'warmup')`),
  ],
);

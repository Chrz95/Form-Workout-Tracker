import { pgTable, text, integer, uuid, timestamp, date, numeric, jsonb, primaryKey, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { Exercise } from "../../../../shared/contracts.js";
/** Read-only catalog references keep workout items constrained to known exercises. */
export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  data: jsonb("data").$type<Exercise>().notNull(),
});
/** Saved routine metadata. */
export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
/** Planned exercises with stable ordinal positions and cascade cleanup. */
export const workoutItems = pgTable(
  "workout_items",
  {
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    position: integer("position").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    weight: numeric("weight", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workoutId, table.exerciseId] }),
    check("workout_item_positive", sql`${table.sets} > 0 AND ${table.reps} > 0 AND ${table.weight} >= 0`),
  ],
);
/** Completed session metadata; date preserves the visitor's calendar day. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id").unique(),
    name: text("name").notNull(),
    notes: text("notes").notNull().default(""),
    date: date("date").notNull(),
    duration: integer("duration").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("session_duration_positive", sql`${table.duration} > 0`)],
);
/** Completed prescriptions; one row per exercise within a session. */
export const sessionItems = pgTable(
  "session_items",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    position: integer("position").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    weight: numeric("weight", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.exerciseId] }),
    check("session_item_positive", sql`${table.sets} > 0 AND ${table.reps} > 0 AND ${table.weight} >= 0`),
  ],
);

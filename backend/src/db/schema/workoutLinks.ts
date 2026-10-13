import { pgTable, uuid, integer, primaryKey, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { workouts } from "./tables.js";
/** Ordered live references; components cannot be deleted while in use. */
export const workoutLinks = pgTable(
  "workout_links",
  {
    parentId: uuid("parent_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    childId: uuid("child_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.parentId, table.childId] }),
    unique("workout_link_position").on(table.parentId, table.position),
    check("workout_link_not_self", sql`${table.parentId} <> ${table.childId}`),
    check("workout_link_position_positive", sql`${table.position} >= 0`),
  ],
);

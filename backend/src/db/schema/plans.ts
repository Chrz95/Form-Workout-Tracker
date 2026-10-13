import { pgTable, uuid, date, text, timestamp, unique } from "drizzle-orm/pg-core";
import { workouts } from "./tables.js";
/** Planned dates remain visible if a source routine is removed; one routine/date pair is unique. */
export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull(),
    workoutId: uuid("workout_id").references(() => workouts.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("plan_workout_date_unique").on(table.workoutId, table.date)],
);

import { WORKOUT_GRAPH_LIMITS } from "./workoutGraph.js";
import { INPUT_LIMITS } from "./constants.js";
import { performedSetSchema } from "./setContracts.js";
export { INPUT_LIMITS } from "./constants.js";
import { z } from "zod";
/** The read-only exercise dataset contract. */
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
  equipment: z.string().nullable(),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string()),
  category: z.string(),
  mechanic: z.string().nullable().optional(),
  images: z.array(z.string()),
  legacyIds: z.array(z.string()).optional(),
  canonicalId: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  source: z
    .object({
      name: z.string(),
      url: z.url().optional(),
      license: z.string(),
      licenseUrl: z.url().optional(),
      attribution: z.string().optional(),
      changes: z.string().optional(),
    })
    .optional(),
  media: z
    .array(
      z.object({
        url: z.string(),
        sourceUrl: z.url(),
        author: z.string(),
        license: z.string(),
        licenseUrl: z.url(),
        stillUrl: z.string().optional(),
        frameCount: z.number().int().min(1).optional(),
        changes: z.string().optional(),
      }),
    )
    .optional(),
  videos: z
    .array(
      z.object({
        url: z.url(),
        author: z.string(),
        sourceUrl: z.url(),
        license: z.string(),
        licenseUrl: z.url(),
        codec: z.string(),
        localUrl: z
          .string()
          .regex(/^\/exercise-motion\/[a-zA-Z0-9-]+\.mp4$/)
          .optional(),
        posterUrl: z
          .string()
          .regex(/^\/exercise-motion\/[a-zA-Z0-9-]+\.webp$/)
          .optional(),
        changes: z.string().optional(),
      }),
    )
    .optional(),
});
/** An exercise with instructional frames. */
export type Exercise = z.infer<typeof exerciseSchema>;
/** A planned or completed exercise prescription. */
const prescriptionSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(INPUT_LIMITS.sets),
  reps: z.number().int().min(1).max(INPUT_LIMITS.reps),
  weight: z.number().min(0).max(INPUT_LIMITS.weight),
});
/** Individual targets are separate from completed sets and their identities. */
export const plannedSetSchema = prescriptionSchema.pick({ reps: true, weight: true });
/** A routine may retain different targets for each ordered set. */
export const workoutItemSchema = prescriptionSchema
  .extend({ plannedSets: z.array(plannedSetSchema).min(1).max(INPUT_LIMITS.sets).optional() })
  .refine(
    (item) => {
      const last = item.plannedSets?.at(-1);
      return (
        !last || (item.sets === item.plannedSets?.length && item.reps === last.reps && item.weight === last.weight)
      );
    },
    { message: "Summary must agree with the planned sets", path: ["plannedSets"] },
  );
/** A workout item shared over HTTP. */
export type WorkoutItem = z.infer<typeof workoutItemSchema>;
/** A list submission with nonempty, unique exercise entries. */
export const workoutInputSchema = z
  .object({
    name: z.string().trim().min(1).max(INPUT_LIMITS.name),
    notes: z.string().max(INPUT_LIMITS.notes),
    items: z.array(workoutItemSchema).max(INPUT_LIMITS.exercises),
    includedWorkoutIds: z
      .array(z.uuid().transform((id) => id.toLowerCase()))
      .min(1)
      .max(WORKOUT_GRAPH_LIMITS.children)
      .optional(),
  })
  .refine((workout) => workout.items.length > 0 || Boolean(workout.includedWorkoutIds?.length), {
    message: "Add an exercise or a saved workout",
    path: ["items"],
  })
  .refine((workout) => new Set(workout.includedWorkoutIds).size === (workout.includedWorkoutIds?.length ?? 0), {
    message: "Include each component workout once",
    path: ["includedWorkoutIds"],
  })
  .refine((workout) => new Set(workout.items.map((item) => item.exerciseId)).size === workout.items.length, {
    message: "Exercises must be unique within a workout",
    path: ["items"],
  });
/** A session exercise retains real set values while accepting legacy aggregate logs. */
export const sessionItemSchema = prescriptionSchema
  .extend({
    performedSets: z.array(performedSetSchema).min(1).max(INPUT_LIMITS.sets).optional(),
  })
  .refine(
    (item) => {
      const lastSet = item.performedSets?.at(-1);
      return (
        !lastSet ||
        (item.sets === item.performedSets?.length && item.reps === lastSet.reps && item.weight === lastSet.weight)
      );
    },
    { message: "Set totals must agree with the completed set values", path: ["performedSets"] },
  );
/** Completed exercise metadata and optional individual sets. */
export type SessionItem = z.infer<typeof sessionItemSchema>;
/** A completed session; date is validated as a real calendar date. */
export const sessionInputSchema = z
  .object({
    name: z.string().trim().min(1, "Give your session a name.").max(INPUT_LIMITS.name),
    notes: z.string().max(INPUT_LIMITS.notes),
    items: z.array(sessionItemSchema).min(1).max(INPUT_LIMITS.exercises),
    date: z.iso.date({ error: "Choose a valid training date." }),
    duration: z.number().int().min(1).max(INPUT_LIMITS.duration),
    submissionId: z.uuid().optional(),
  })
  .refine(
    (session) => {
      const identifiers = session.items.flatMap((item) => (item.performedSets ?? []).map((set) => set.id));
      return new Set(identifiers).size === identifiers.length;
    },
    { message: "Each completed set needs a unique identifier", path: ["items"] },
  );
/** Persisted list returned by the API. */
export const workoutSchema = workoutInputSchema.safeExtend({ id: z.uuid(), createdAt: z.string() });
/** Persisted training session returned by the API. */
export const sessionSchema = sessionInputSchema.safeExtend({ id: z.uuid(), createdAt: z.string() });
/** A saved routine. */
export type Workout = z.infer<typeof workoutSchema>;
/** A completed training day. */
export type Session = z.infer<typeof sessionSchema>;
/** Named API routes shared across transport boundaries. */
export const API_PATH = {
  health: "/health",
  capabilities: "/capabilities",
  ready: "/ready",
  exercises: "/exercises",
  workouts: "/workouts",
  sessions: "/sessions",
} as const;

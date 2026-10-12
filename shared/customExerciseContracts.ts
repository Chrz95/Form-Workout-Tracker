import { z } from "zod";
import { CUSTOM_EXERCISE_PREFIX, EXERCISE_LEVELS, EXERCISE_LIMITS } from "./exerciseConstants.js";
/** Only plain HTTPS image references are accepted; the API never fetches their content. */
const optionalImageUrlSchema = z.union([
  z.literal(""),
  z
    .url()
    .max(EXERCISE_LIMITS.imageUrl)
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    }, "Use an HTTPS image URL without embedded credentials."),
]);
/** A private custom exercise cannot supply its identity or spoof imported source attribution. */
export const customExerciseInputSchema = z
  .object({
    name: z.string().trim().min(1).max(EXERCISE_LIMITS.name),
    level: z.enum(EXERCISE_LEVELS),
    equipment: z.string().trim().min(1).max(EXERCISE_LIMITS.name),
    primaryMuscles: z.array(z.string().trim().min(1).max(EXERCISE_LIMITS.name)).min(1).max(EXERCISE_LIMITS.muscles),
    secondaryMuscles: z.array(z.string().trim().min(1).max(EXERCISE_LIMITS.name)).max(EXERCISE_LIMITS.muscles),
    instructions: z
      .array(z.string().trim().min(1).max(EXERCISE_LIMITS.instruction))
      .min(1)
      .max(EXERCISE_LIMITS.instructions),
    category: z.string().trim().min(1).max(EXERCISE_LIMITS.name),
    imageUrl: optionalImageUrlSchema,
  })
  .strict();
/** Validated private exercise form fields. */
export type CustomExerciseInput = z.infer<typeof customExerciseInputSchema>;
/** Imported exercises can never be targeted by custom mutation routes. */
export const customExerciseIdentifierSchema = z.object({
  id: z
    .string()
    .refine(
      (id) =>
        id.startsWith(CUSTOM_EXERCISE_PREFIX) && z.uuid().safeParse(id.slice(CUSTOM_EXERCISE_PREFIX.length)).success,
      "Custom exercise identifier required.",
    ),
});

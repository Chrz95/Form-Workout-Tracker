import { z } from "zod";
import { INPUT_LIMITS } from "./constants.js";
/** Set classifications distinguish preparation from working volume. */
export const SET_KIND = { working: "working", warmup: "warmup" } as const;
/** One actual completed set with optional perceived effort. */
export const performedSetSchema = z.object({
  id: z.uuid().transform((identifier) => identifier.toLowerCase()),
  reps: z.number().int().min(1).max(INPUT_LIMITS.reps),
  weight: z.number().min(0).max(INPUT_LIMITS.weight),
  rpe: z.number().min(1).max(INPUT_LIMITS.rpe).nullable().default(null),
  kind: z.enum([SET_KIND.working, SET_KIND.warmup]).default(SET_KIND.working),
});
/** A completed set transmitted over HTTP. */
export type PerformedSet = z.infer<typeof performedSetSchema>;

import { z } from "zod";
/** Calendar plans express intent; they never create a completed journal entry. */
export const planInputSchema = z.object({ date: z.iso.date(), workoutId: z.uuid() }).strict();
/** Saved plans retain their label if the routine is removed; no history is fabricated. */
export const planSchema = z.object({
  id: z.uuid(),
  date: z.iso.date(),
  workoutId: z.uuid().nullable(),
  name: z.string(),
  createdAt: z.string(),
});
/** Authored schedule change. */
export type PlanInput = z.infer<typeof planInputSchema>;
/** Persisted calendar intent. */
export type Plan = z.infer<typeof planSchema>;
/** Versioned mount is supplied by the app; feature paths stay shared. */
export const PLAN_PATH = "/plans";

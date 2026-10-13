import { z } from "zod";
/** The live client verifies capabilities before sending non-legacy set data. */
export const API_FEATURE = {
  nestedWorkouts: "nested-workouts",
  plannedSets: "per-set-prescriptions",
  perSetLogging: "per-set-logging",
  safeFinishRetry: "idempotent-session-finish",
  customExercises: "custom-exercises",
  calendar: "calendar-plans",
  csvImport: "atomic-csv-import",
} as const;
/** API release metadata is public implementation information, never a credential. */
export const API_CAPABILITIES = { release: "2.7", features: Object.values(API_FEATURE) };
/** Required features prevent silently losing set variations on an older API. */
export const capabilitiesResponseSchema = z.object({ release: z.string(), features: z.array(z.string()) });
/** Validates the minimum server features required by live workout clients. */
export const capabilitiesSchema = capabilitiesResponseSchema.refine(
  (capabilities) =>
    capabilities.features.includes(API_FEATURE.perSetLogging) &&
    capabilities.features.includes(API_FEATURE.safeFinishRetry),
  { message: "Update the workout API to support per-set logging and safe completion retries." },
);

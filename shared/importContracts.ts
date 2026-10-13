import { z } from "zod";
import { workoutSchema, sessionSchema, workoutItemSchema, sessionItemSchema } from "./contracts.js";
import { INPUT_LIMITS } from "./constants.js";
/** Bounded imports fit below the authenticated API's JSON body limit. */
export const IMPORT_LIMITS = { fileBytes: 1048576, payloadBytes: 900000, records: 50, rows: 2000, cell: 10000 };
/** Stable identities make repeated imports safe without overwriting saved records. */
const identityFields = {
  id: z.uuid().transform((id) => id.toLowerCase()),
  createdAt: z.iso.datetime({ offset: true }),
};
/** Imported records preserve timestamps but do not accept completion retry tokens. */
export const importedWorkoutSchema = workoutSchema
  .safeExtend({ ...identityFields, items: z.array(workoutItemSchema.strict()).max(INPUT_LIMITS.exercises) })
  .strict();
/** Actual and legacy sessions retain their original representation. */
export const importedSessionSchema = sessionSchema
  .safeExtend({ ...identityFields, items: z.array(sessionItemSchema.strict()).min(1).max(INPUT_LIMITS.exercises) })
  .strict()
  .refine((record) => record.submissionId === undefined, { message: "Import does not accept completion retry tokens" });
/** A batch contains one collection, never a mixed or partial restore. */
export const importInputSchema = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("workouts"),
        records: z.array(importedWorkoutSchema).min(1).max(IMPORT_LIMITS.records),
      })
      .strict(),
    z
      .object({
        kind: z.literal("sessions"),
        records: z.array(importedSessionSchema).min(1).max(IMPORT_LIMITS.records),
      })
      .strict(),
  ])
  .refine((batch) => new Set(batch.records.map((record) => record.id)).size === batch.records.length, {
    message: "Record identities must be unique",
  })
  .refine((batch) => new TextEncoder().encode(JSON.stringify(batch)).byteLength <= IMPORT_LIMITS.payloadBytes, {
    message: "Split this import into smaller files",
  })
  .refine(
    (batch) => {
      const ids =
        batch.kind === "sessions"
          ? batch.records.flatMap((record) =>
              record.items.flatMap((item) => (item.performedSets ?? []).map((set) => set.id)),
            )
          : [];
      return new Set(ids).size === ids.length;
    },
    { message: "Set identities must be unique across imported sessions" },
  );
/** Validated transfer payload. */
export type ImportInput = z.infer<typeof importInputSchema>;
/** The server confirms inserted and unchanged records after its transaction commits. */
export const importResultSchema = z.object({ inserted: z.number().int().min(0), skipped: z.number().int().min(0) });
/** Import outcome. */
export type ImportResult = z.infer<typeof importResultSchema>;
/** Protected transfer route. */
export const IMPORT_PATH = "/training-import";

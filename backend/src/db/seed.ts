import { formatExerciseName } from "../../../shared/exerciseNames.js";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { exerciseSchema } from "../../../shared/contracts.js";
import { loadEnvironment } from "../app/config/environment.js";
import { createDatabase } from "./client.js";
import { createLogger } from "../lib/logger/logger.js";
import { exercises } from "./schema/tables.js";
import { inArray } from "drizzle-orm";
import { getExerciseNameKey } from "../../../shared/exerciseIdentity.js";
/** Idempotently imports only public exercise reference data; no user/demo records are seeded.
 * @returns {Promise<void>} Seed completion.
 */
async function seedCatalog() {
  const environment = loadEnvironment();
  const logger = createLogger(environment);
  const { pool, database } = createDatabase(environment);
  try {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const retired = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/retiredExercises.json", "utf8")));
    const archived = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/archivedExercises.json", "utf8")));
    const references = [...catalog, ...archived, ...retired].map((exercise) => ({
      ...exercise,
      name: formatExerciseName(exercise.name),
    }));
    await database.transaction(async (transaction) => {
      await transaction
        .update(exercises)
        .set({ nameKey: null })
        .where(
          inArray(
            exercises.id,
            references.map((exercise) => exercise.id),
          ),
        );
      for (const exercise of references) {
        await transaction
          .insert(exercises)
          .values({
            id: exercise.id,
            data: exercise,
            nameKey: exercise.canonicalId || exercise.isArchived ? null : getExerciseNameKey(exercise.name),
          })
          .onConflictDoUpdate({
            target: exercises.id,
            set: {
              data: exercise,
              nameKey: exercise.canonicalId || exercise.isArchived ? null : getExerciseNameKey(exercise.name),
            },
          });
      }
    });
    logger.info({ exercises: catalog.length }, "Public exercise reference data seeded");
  } finally {
    await pool.end();
  }
}
await seedCatalog();

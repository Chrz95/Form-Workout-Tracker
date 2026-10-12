import { readFile } from "node:fs/promises";
import { z } from "zod";
import { exerciseSchema } from "../../../shared/contracts.js";
import { loadEnvironment } from "../app/config/environment.js";
import { createDatabase } from "./client.js";
import { createLogger } from "../lib/logger/logger.js";
import { exercises } from "./schema/tables.js";
/** Idempotently imports only public exercise reference data; no user/demo records are seeded.
 * @returns {Promise<void>} Seed completion.
 */
async function seedCatalog() {
  const environment = loadEnvironment();
  const logger = createLogger(environment);
  const { pool, database } = createDatabase(environment);
  try {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    await database.transaction(async (transaction) => {
      for (const exercise of catalog) {
        await transaction
          .insert(exercises)
          .values({ id: exercise.id, data: exercise })
          .onConflictDoUpdate({ target: exercises.id, set: { data: exercise } });
      }
    });
    logger.info({ exercises: catalog.length }, "Public exercise reference data seeded");
  } finally {
    await pool.end();
  }
}
await seedCatalog();

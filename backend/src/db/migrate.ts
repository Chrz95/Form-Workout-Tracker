import { migrate } from "drizzle-orm/node-postgres/migrator";
import { loadEnvironment } from "../app/config/environment.js";
import { createLogger } from "../lib/logger/logger.js";
import { createDatabase } from "./client.js";
/** Applies committed migrations as a separate release step.
 * @returns {Promise<void>} Migration completion.
 */
async function migrateDatabase() {
  const environment = loadEnvironment();
  const logger = createLogger(environment);
  const { pool, database } = createDatabase(environment);
  try {
    await migrate(database, { migrationsFolder: "backend/src/db/migrations" });
    logger.info("Database migrations applied");
  } finally {
    await pool.end();
  }
}
await migrateDatabase();

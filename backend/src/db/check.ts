import { loadEnvironment } from "../app/config/environment.js";
import { createDatabase } from "./client.js";
import { createLogger } from "../lib/logger/logger.js";
/** Performs a real PostgreSQL connectivity query.
 * @returns {Promise<void>} Database readiness verification.
 */
async function checkDatabase() {
  const environment = loadEnvironment();
  const logger = createLogger(environment);
  const { pool } = createDatabase(environment);
  try {
    await pool.query("SELECT 1");
    logger.info("PostgreSQL is reachable");
  } finally {
    await pool.end();
  }
}
await checkDatabase();

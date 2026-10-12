import { Pool } from "pg";
import { loadEnvironment, readTestDatabaseUrl } from "../app/config/environment.js";
import { createLogger } from "../lib/logger/logger.js";
/** Creates the explicit disposable database without replacing any database or running tests.
 * @returns {Promise<void>} Database creation completion.
 */
async function prepareTestDatabase(): Promise<void> {
  const environment = loadEnvironment();
  const testDatabaseUrl = readTestDatabaseUrl();
  if (!testDatabaseUrl) {
    throw new Error("Set TEST_DATABASE_URL to a separate disposable PostgreSQL database before preparation.");
  }
  const logger = createLogger(environment);
  const url = new URL(testDatabaseUrl);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  url.pathname = "/postgres";
  const pool = new Pool({
    connectionString: url.toString(),
    max: 1,
    connectionTimeoutMillis: environment.DATABASE_CONNECTION_TIMEOUT_IN_MILLISECONDS,
  });
  try {
    const existing = await pool.query<{ ownedByCurrentUser: boolean }>(
      'SELECT datdba = (SELECT oid FROM pg_roles WHERE rolname = current_user) AS "ownedByCurrentUser" ' +
        "FROM pg_database WHERE datname = $1",
      [databaseName],
    );
    if (existing.rows.length) {
      if (!existing.rows[0]?.ownedByCurrentUser) {
        throw new Error("The test database already exists with another owner; no changes were made.");
      }
      logger.info("Dedicated test database already exists; no data was changed");
    } else {
      // The central validator permits only lowercase ASCII letters, digits and underscores.
      // PostgreSQL does not allow a bound parameter for a CREATE DATABASE identifier.
      await pool.query(`CREATE DATABASE "${databaseName}"`);
      logger.info("Dedicated test database created; run pnpm test:db to migrate and test it");
    }
  } finally {
    await pool.end();
  }
}
await prepareTestDatabase();

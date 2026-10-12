import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Environment } from "../app/config/environment.js";
import * as tables from "./schema/tables.js";
/** Creates exactly one bounded pool per process.
 * @param {Environment} environment - Validated database settings.
 * @returns {object} Pool and typed database.
 */
export function createDatabase(environment: Environment) {
  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
    max: environment.DATABASE_POOL_MAX_CONNECTIONS,
    connectionTimeoutMillis: environment.DATABASE_CONNECTION_TIMEOUT_IN_MILLISECONDS,
  });
  return { pool, database: drizzle(pool, { schema: tables }) };
}
/** Typed Drizzle connection used by repositories. */
export type Database = ReturnType<typeof createDatabase>["database"];

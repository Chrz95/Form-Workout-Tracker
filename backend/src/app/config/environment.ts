import { SERVER_DEFAULTS } from "../../constants/http.constants.js";
import { config } from "dotenv";
import { z } from "zod";
import { validateTestDatabaseUrl } from "./testDatabase.js";
/** Validated configuration owns all server environment access. */
export const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(SERVER_DEFAULTS.maximumPort).default(SERVER_DEFAULTS.port),
  CORS_ALLOWED_ORIGINS: z.string().transform((value) => value.split(",").map((origin) => z.url().parse(origin.trim()))),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
  API_PREFIX: z
    .string()
    .regex(/^\/api\/v[1-9]\d*$/)
    .default("/api/v1"),
  DATABASE_URL: z
    .url()
    .refine((value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol), "PostgreSQL URL required"),
  DATABASE_POOL_MAX_CONNECTIONS: z.coerce
    .number()
    .int()
    .min(1)
    .max(SERVER_DEFAULTS.maximumPoolSize)
    .default(SERVER_DEFAULTS.poolSize),
  DATABASE_CONNECTION_TIMEOUT_IN_MILLISECONDS: z.coerce
    .number()
    .int()
    .min(1)
    .default(SERVER_DEFAULTS.connectionTimeout),
  API_ACCESS_TOKEN: z.string().min(SERVER_DEFAULTS.tokenLength),
  TEST_DATABASE_URL: z.string().optional(),
});
/** Validated server configuration. */
export type Environment = z.infer<typeof environmentSchema>;
/** Loads dotenv once at process startup and fails on invalid configuration.
 * @returns {Environment} Typed server settings.
 */
export function loadEnvironment(): Environment {
  config({ quiet: true });
  return environmentSchema.parse(process.env);
}
/** Reads only the explicit, disposable database URL for integration tests.
 * @returns {string | undefined} Dedicated test URL.
 */
export function readTestDatabaseUrl() {
  config({ quiet: true });
  const value = process.env.TEST_DATABASE_URL;
  if (!value) {
    return undefined;
  }
  validateTestDatabaseUrl(value, process.env.DATABASE_URL);
  return value;
}

/** Security and operational boundaries. */
export const HTTP_DEFAULTS = {
  bodyLimit: "1mb",
  shutdownTimeout: 10000,
  rateWindow: 60000,
  rateLimit: 120,
  maxRecords: 1000,
  minimumTokenLength: 32,
  requestIdLimit: 128,
} as const;
/** Named process signals. */
export const PROCESS_SIGNALS = ["SIGTERM", "SIGINT"] as const;

/** Safe environment defaults and configuration bounds. */
export const SERVER_DEFAULTS = {
  maximumPort: 65535,
  port: 3001,
  maximumPoolSize: 100,
  poolSize: 10,
  connectionTimeout: 5000,
  tokenLength: 32,
} as const;

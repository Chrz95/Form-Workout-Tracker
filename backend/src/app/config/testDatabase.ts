/** Only plainly named disposable databases can be targeted by destructive tests. */
const TEST_DATABASE_NAME_PATTERN = /^[a-z][a-z0-9_]*_test$/;
/** PostgreSQL identifier length in bytes; the accepted names contain ASCII only. */
const MAXIMUM_DATABASE_NAME_LENGTH = 63;
/** Validates the test target without exposing credentials in an error.
 * @param {string} value - Explicit test database URL.
 * @param {string | undefined} primaryDatabaseUrl - Application database URL, if configured.
 * @returns {URL} Validated disposable database location.
 */
export function validateTestDatabaseUrl(value: string, primaryDatabaseUrl?: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL URL.");
  }
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !TEST_DATABASE_NAME_PATTERN.test(databaseName) ||
    databaseName.length > MAXIMUM_DATABASE_NAME_LENGTH
  ) {
    throw new Error("TEST_DATABASE_URL must target a lowercase PostgreSQL database ending in _test.");
  }
  if (primaryDatabaseUrl && databaseName === decodeURIComponent(new URL(primaryDatabaseUrl).pathname.slice(1))) {
    throw new Error("The test database name must differ from the application's DATABASE_URL database.");
  }
  return url;
}

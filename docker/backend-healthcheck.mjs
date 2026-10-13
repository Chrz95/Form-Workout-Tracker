const READY_URL = "http://127.0.0.1:3001/api/v1/ready";
const TIMEOUT_IN_MILLISECONDS = 4000;
/** Probes PostgreSQL-backed readiness without a token or sensitive diagnostics.
 * @returns {Promise<void>} Sets the container healthcheck exit status.
 */
async function checkReadiness() {
  try {
    const response = await fetch(READY_URL, { signal: AbortSignal.timeout(TIMEOUT_IN_MILLISECONDS) });
    process.exitCode = response.ok ? 0 : 1;
  } catch {
    process.exitCode = 1;
  }
}
await checkReadiness();

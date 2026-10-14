import { randomBytes } from "node:crypto";
import { readFile, writeFile, appendFile, open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "dotenv";
const TOKEN_BYTES = 32;
const MINIMUM_TOKEN_LENGTH = 32;
const PRIVATE_FILE_MODE = 0o600;
const EXAMPLE_TOKEN = "replace_with_a_private_random_token_of_at_least_32_characters";
/** Rejects invalid credentials with a clear message that contains no secret values.
 * @param {string} token - Configured private credential.
 */
function validateLocalToken(token) {
  if (token.length < MINIMUM_TOKEN_LENGTH || /[\r\n]/.test(token)) {
    throw new Error(
      "API_ACCESS_TOKEN must contain at least 32 characters and no line breaks. Check your local settings.",
    );
  }
}
/** Initializes private local credentials while preserving the configured PostgreSQL connection.
 * @param {string} projectRoot - Project containing the root environment file.
 * @param {string | undefined} [configuredToken] - Explicit process-level credential, when supplied.
 * @returns {Promise<void>} Private runtime configuration is ready.
 */
export async function initializeLocalEnvironment(projectRoot, configuredToken) {
  if (configuredToken !== undefined) {
    validateLocalToken(configuredToken);
    return;
  }
  const environmentPath = join(projectRoot, ".env");
  const lockPath = join(projectRoot, ".env.local-init.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx", PRIVATE_FILE_MODE);
  } catch {
    throw new Error("Cannot initialize local settings. Check project permissions or an existing .env.local-init.lock.");
  }
  try {
    let content;
    try {
      content = await readFile(environmentPath, "utf8");
    } catch (error) {
      if (!error || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") {
        throw error;
      }
      const example = await readFile(join(projectRoot, ".env.example"), "utf8");
      content = example.replace(
        /^API_ACCESS_TOKEN=.*$/m,
        `API_ACCESS_TOKEN=${randomBytes(TOKEN_BYTES).toString("hex")}`,
      );
      await writeFile(environmentPath, content, { flag: "wx", mode: PRIVATE_FILE_MODE });
      return;
    }
    const token = parse(content).API_ACCESS_TOKEN;
    if (token && token !== EXAMPLE_TOKEN) {
      validateLocalToken(token);
      return;
    }
    const credential = randomBytes(TOKEN_BYTES).toString("hex");
    await appendFile(environmentPath, `\n# Generated private local API credential.\nAPI_ACCESS_TOKEN=${credential}\n`);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}

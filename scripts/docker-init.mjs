import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
const TOKEN_BYTES = 32;
const ENV_FILE = new URL("../.env.docker", import.meta.url);
const FILE_MODE = 0o600;
/** Creates local Docker credentials once, preserving any existing operator configuration.
 * @returns {Promise<void>} Initialization completion without printing secrets.
 */
async function initializeDocker() {
  const content = [
    `DOCKER_API_ACCESS_TOKEN=${randomBytes(TOKEN_BYTES).toString("hex")}`,
    "FORM_HTTP_PORT=2324",
    "FORM_BIND_ADDRESS=127.0.0.1",
    "FORM_FRONTEND_ORIGIN=auto",
    "FORM_LOG_LEVEL=info",
    "",
  ].join("\n");
  try {
    await writeFile(ENV_FILE, content, { flag: "wx", mode: FILE_MODE });
    process.stdout.write("Created .env.docker. The local app will connect automatically.\n");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      process.stdout.write(".env.docker already exists; its settings and token were preserved.\n");
      return;
    }
    throw error;
  }
}
await initializeDocker();

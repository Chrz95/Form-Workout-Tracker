import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const TOKEN_BYTES = 32;
const directory = process.env.FORM_CREDENTIALS_DIRECTORY || "/run/form-credentials";
const filename = join(directory, "api-token");
/** Creates the private proxy credential once, retaining it across container replacements.
 * @returns {Promise<void>} Initialization completion without printing the credential.
 */
async function initializeCredentials() {
  await mkdir(directory, { recursive: true, mode: 0o755 });
  try {
    // The mounted volume is shared only with the backend and the unprivileged web proxy.
    await writeFile(filename, randomBytes(TOKEN_BYTES).toString("hex"), { flag: "wx", mode: 0o444 });
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
      throw error;
    }
  }
  const token = (await readFile(filename, "utf8")).trim();
  if (!/^[a-zA-Z0-9_.-]{32,512}$/.test(token)) {
    throw new Error("The saved Form credential is invalid; restore a valid credential before starting.");
  }
  process.stdout.write("Form credentials are ready. Existing credentials were preserved.\n");
}
await initializeCredentials();

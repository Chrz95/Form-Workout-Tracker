import { fileURLToPath } from "node:url";
import { initializeLocalEnvironment } from "./local-environment.mjs";
try {
  await initializeLocalEnvironment(fileURLToPath(new URL("../", import.meta.url)), process.env.API_ACCESS_TOKEN);
  process.stdout.write("Local runtime settings are ready. Your configured PostgreSQL connection is preserved.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Could not initialize local settings."}\n`);
  process.exitCode = 1;
}

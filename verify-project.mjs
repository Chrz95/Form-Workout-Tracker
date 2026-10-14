import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
const root = fileURLToPath(new URL("./", import.meta.url));
const inventory = JSON.parse(await readFile(join(root, "PROJECT-FILE-INVENTORY.json"), "utf8"));
const errors = [];
for (const entry of inventory.files) {
  try {
    const filename = join(root, entry.path);
    const data = await readFile(filename);
    if (data.length !== entry.bytes || createHash("sha256").update(data).digest("hex") !== entry.sha256) {
      errors.push(`Changed or incomplete: ${entry.path}`);
    }
  } catch {
    errors.push(`Missing: ${entry.path}`);
  }
}
if (errors.length) {
  process.stderr.write(errors.join("\n") + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write(`Verified all ${inventory.sourceFileCount} source files, including scripts, configuration and media.\n`);
}

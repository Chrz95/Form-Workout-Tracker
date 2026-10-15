import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const inventory = JSON.parse(await readFile(new URL("./PROJECT-FILE-INVENTORY.json", import.meta.url), "utf8"));
let errors = 0;
for (const file of inventory.files) {
  try {
    const bytes = await readFile(new URL(file.path, import.meta.url));
    if (bytes.length !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) {
      process.stderr.write(`Changed: ${file.path}\n`); errors++;
    }
  } catch { process.stderr.write(`Missing: ${file.path}\n`); errors++; }
}
process.stdout.write(`${inventory.files.length} source files checked; ${errors} missing or changed.\n`);
process.exitCode = errors ? 1 : 0;

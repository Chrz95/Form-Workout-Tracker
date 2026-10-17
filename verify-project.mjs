import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(await readFile(resolve(root, "PROJECT-FILE-INVENTORY.json"), "utf8"));
let verified = 0;
const errors = [];
for (const file of inventory.files) {
  try {
    const bytes = await readFile(resolve(root, file.path));
    if (bytes.length !== file.bytes || createHash("sha256").update(bytes).digest("hex") !== file.sha256)
      errors.push(`Changed or incomplete: ${file.path}`);
    else verified++;
  } catch { errors.push(`Missing: ${file.path}`); }
}
console.log(JSON.stringify({ sourceCommit: inventory.sourceCommit, verified, errors: errors.length }, null, 2));
if (errors.length) { console.error(errors.slice(0, 30).join("\n")); process.exitCode = 1; }

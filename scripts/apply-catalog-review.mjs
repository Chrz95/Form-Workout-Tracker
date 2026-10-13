import { readFile, writeFile, copyFile } from "node:fs/promises";
const [, , reviewPath] = process.argv;
const decisions = JSON.parse(await readFile(reviewPath, "utf8"));
const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8"));
const audit = JSON.parse(await readFile("docs/catalog-deduplication.json", "utf8"));
const removals = new Set();
for (const decision of decisions) {
  const record = catalog.find((exercise) => exercise.id === decision.retiredId);
  const leader = catalog.find((exercise) => exercise.id === decision.canonicalId);
  if (!record) {
    continue;
  }
  if (!leader || record.id === leader.id) {
    throw new Error("Invalid reviewed canonical reference");
  }
  leader.legacyIds = [...new Set([...(leader.legacyIds ?? []), record.id, ...(record.legacyIds ?? [])])];
  leader.aliases = [...new Set([...(leader.aliases ?? []), record.name, ...(record.aliases ?? [])])];
  retired.push({ ...record, canonicalId: leader.id });
  audit.push({ ...decision, retiredName: record.name, canonicalName: leader.name });
  removals.add(record.id);
}
await writeFile("shared/exercises.json", JSON.stringify(catalog.filter((exercise) => !removals.has(exercise.id))));
await copyFile("shared/exercises.json", "frontend/public/exercises.json");
await writeFile("shared/retiredExercises.json", JSON.stringify(retired));
await writeFile("docs/catalog-deduplication.json", JSON.stringify(audit, null, "  "));
process.stdout.write(JSON.stringify({ reviewedDuplicatesRetired: removals.size }) + "\n");

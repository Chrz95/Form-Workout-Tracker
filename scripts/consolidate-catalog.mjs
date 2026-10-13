import { readFile, writeFile, copyFile } from "node:fs/promises";
import { getExerciseNameKey } from "../shared/exerciseIdentity.ts";
const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8").catch(() => "[]"));
const canonical = new Map();
const consolidated = [];
const decisions = [];
for (const exercise of catalog) {
  const key = getExerciseNameKey(exercise.name);
  const existing = canonical.get(key);
  if (!existing) {
    canonical.set(key, exercise);
    consolidated.push(exercise);
    continue;
  }
  existing.legacyIds = [...new Set([...(existing.legacyIds ?? []), exercise.id, ...(exercise.legacyIds ?? [])])];
  existing.aliases = [...new Set([...(existing.aliases ?? []), exercise.name, ...(exercise.aliases ?? [])])];
  retired.push({ ...exercise, canonicalId: existing.id });
  decisions.push({
    retiredId: exercise.id,
    retiredName: exercise.name,
    canonicalId: existing.id,
    canonicalName: existing.name,
    reason: "Reviewed equivalent name: spelling/plural/token order; qualifiers retained",
  });
}
for (const exercise of retired) {
  let target = exercise.canonicalId;
  const visited = new Set();
  while (!consolidated.some((candidate) => candidate.id === target)) {
    if (visited.has(target)) {
      throw new Error("Cyclic retired reference");
    }
    visited.add(target);
    const parent = retired.find((candidate) => candidate.id === target);
    if (!parent) {
      throw new Error("Missing canonical reference");
    }
    target = parent.canonicalId;
  }
  exercise.canonicalId = target;
  const parent = consolidated.find((candidate) => candidate.id === target);
  parent.legacyIds = [...new Set([...(parent.legacyIds ?? []), exercise.id])];
}
if (new Set(consolidated.map((exercise) => getExerciseNameKey(exercise.name))).size !== consolidated.length) {
  throw new Error("Duplicate movement name remains");
}
await writeFile("shared/exercises.json", JSON.stringify(consolidated));
await copyFile("shared/exercises.json", "frontend/public/exercises.json");
await writeFile("shared/retiredExercises.json", JSON.stringify(retired));
const previous = JSON.parse(await readFile("docs/catalog-deduplication.json", "utf8").catch(() => "[]"));
await writeFile("docs/catalog-deduplication.json", JSON.stringify([...previous, ...decisions], null, "  "));
process.stdout.write(
  JSON.stringify({
    visible: consolidated.length,
    newlyConsolidated: decisions.length,
    historicalReferences: retired.length,
    duplicateNameKeys: 0,
  }) + "\n",
);

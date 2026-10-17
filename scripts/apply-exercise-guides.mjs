import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { exerciseSchema } from "../shared/contracts.ts";
import { exerciseGuideSchema } from "../shared/exerciseGuideContracts.ts";
const reportPath = process.argv[2];
if (!reportPath) throw new Error("Pass a reviewed enrichment report; crawler output is not imported automatically");
const report = z
  .object({
    accepted: z.array(z.object({ exerciseId: z.string(), guide: exerciseGuideSchema, sha256: z.string().length(64) })),
  })
  .parse(JSON.parse(await readFile(reportPath, "utf8")));
const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
const byId = new Map(catalog.map((exercise) => [exercise.id, exercise]));
const unique = new Set();
for (const { exerciseId, guide } of report.accepted) {
  const exercise = byId.get(exerciseId);
  if (!exercise || exercise.isArchived || !exercise.images.length) throw new Error(`Unknown visible ID: ${exerciseId}`);
  const key = `${exerciseId}:${guide.provider}`;
  if (unique.has(key)) throw new Error(`Duplicate publisher for exercise: ${key}`);
  unique.add(key);
  exercise.guides = [...(exercise.guides ?? []).filter((entry) => entry.provider !== guide.provider), guide];
}
z.array(exerciseSchema).parse(catalog);
// Keep unknown legacy metadata and every existing image/text field intact.
const original = JSON.parse(await readFile("shared/exercises.json", "utf8"));
for (const exercise of original) {
  const enriched = byId.get(exercise.id);
  if (enriched.guides) exercise.guides = enriched.guides;
}
const bytes = JSON.stringify(original);
await writeFile("shared/exercises.json", bytes);
await writeFile("frontend/public/exercises.json", bytes);
process.stdout.write(`Attached ${unique.size} guides without adding or removing any exercise identities.\n`);

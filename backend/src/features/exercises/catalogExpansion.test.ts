import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";
/** Loads both discovery records and metadata used by previously saved workouts.
 * @returns {Promise<Exercise[]>} Validated canonical references.
 */
async function loadReferences() {
  const groups = await Promise.all(
    ["shared/exercises.json", "shared/archivedExercises.json"].map(async (path) =>
      z.array(exerciseSchema).parse(JSON.parse(await readFile(path, "utf8"))),
    ),
  );
  return groups.flat();
}
describe("Further illustrated catalog additions", () => {
  it("preserves independent standing and seated curl identities in workout graph validation", async () => {
    const records = await loadReferences();
    const standing = records.find((exercise) => exercise.id === "everkinetic:0263");
    const seated = records.find((exercise) => exercise.id === "hasan:1652");
    expect(standing?.isArchived).toBeUndefined();
    expect(standing?.images.length).toBe(2);
    expect(standing?.name).toContain("Standing");
    expect(seated?.isArchived).toBeUndefined();
    expect(seated?.images.length).toBeGreaterThan(0);
    expect(seated && matchesExerciseId(seated, "everkinetic:0263")).toBe(false);
    const items = [
      { exerciseId: "everkinetic:0263", sets: 2, reps: 8, weight: 5 },
      { exerciseId: "hasan:1652", sets: 3, reps: 12, weight: 4 },
    ];
    expect(resolveWorkout({ name: "Different curl positions", items }, [], workoutIdentities(records))).toEqual(items);
    const retired = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/retiredExercises.json", "utf8")));
    expect(retired.some((record) => record.id === "everkinetic:0263")).toBe(false);
  });
  it("bundles credited image files matching the reviewed source hashes", async () => {
    const report = JSON.parse(await readFile("docs/catalog-expansion-2.13.json", "utf8"));
    const records = await loadReferences();
    expect(report.photographs).toHaveLength(24);
    expect(report.assets).toHaveLength(36);
    expect(new Set(report.photographs.map((photo: { sha256: string }) => photo.sha256)).size).toBe(24);
    for (const asset of report.assets) {
      const record = records.find((exercise) => exercise.id === asset.exerciseId);
      expect(record?.isArchived).toBeUndefined();
      expect(record?.images).toContain(asset.localUrl);
      const data = await readFile(`frontend/public${asset.localUrl}`);
      expect(createHash("sha256").update(data).digest("hex")).toBe(asset.sha256);
      expect(record?.media?.find((media) => media.url === asset.localUrl)).toMatchObject({
        author: expect.any(String),
        sourceUrl: asset.sourceUrl,
        licenseUrl: expect.stringContaining("https://creativecommons.org/"),
      });
    }
  });
  it("makes the pose additions searchable by yoga and their Sanskrit aliases", async () => {
    const report = JSON.parse(await readFile("docs/catalog-expansion-2.13.json", "utf8"));
    const records = await loadReferences();
    for (const photo of report.photographs) {
      const record = records.find((exercise) => exercise.id === photo.exerciseId);
      expect(record?.aliases?.some((alias) => alias.startsWith("Yoga "))).toBe(true);
      expect(record?.aliases?.length).toBeGreaterThanOrEqual(2);
    }
  });
  it("keeps original Commons credit notices with the public app", async () => {
    expect(await readFile("frontend/public/licenses/commons-MEDIA-notices.txt", "utf8")).toBe(
      await readFile("licenses/commons-MEDIA-notices.txt", "utf8"),
    );
    const report = JSON.parse(await readFile("docs/catalog-expansion-2.13.json", "utf8"));
    const notices = await readFile("licenses/commons-MEDIA-notices.txt", "utf8");
    for (const photo of report.photographs) {
      expect(photo.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(notices).toContain(photo.author);
      expect(notices).toContain(photo.licenseUrl);
    }
  });
});

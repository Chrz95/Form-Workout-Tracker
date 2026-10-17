import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { exerciseGuideSchema } from "../../../../shared/exerciseGuideContracts.js";
import { getExerciseNameKey, matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";

describe("Standing Cable Pec Fly reviewed enrichment", () => {
  it("enriches one existing movement without adding a visible duplicate or breaking saved references", async () => {
    const report = JSON.parse(await readFile("docs/standing-cable-pec-fly-review.json", "utf8"));
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    const laterReview = JSON.parse(await readFile("docs/catalog-restoration-2.19.json", "utf8"));
    const currentReview = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    expect(catalog).toHaveLength(currentReview.visible);
    const entry = exerciseSchema.parse(catalog.find((item: { id: string }) => item.id === report.canonicalId));
    expect(entry.name).toBe("Standing Cable Pec Fly");
    expect(entry.aliases).toEqual(
      expect.arrayContaining(["Cable Crossover", "Standing Cable Chest Fly", "Standing Cable Fly"]),
    );
    expect(
      catalog.filter((item: { name: string; aliases?: string[] }) =>
        [item.name, ...(item.aliases ?? [])].includes("Standing Cable Pec Fly"),
      ),
    ).toHaveLength(1);
    expect(new Set(catalog.map((item: { name: string }) => getExerciseNameKey(item.name))).size).toBe(catalog.length);
    expect(entry.instructions).toEqual(report.before.instructions);
    expect(entry.images.slice(0, 2)).toEqual(report.before.images);
    expect(entry.legacyIds).toEqual(expect.arrayContaining(report.before.legacyIds));
    const {
      name: _name,
      aliases: _aliases,
      images: _images,
      media: _media,
      guides: _guides,
      ...unchanged
    } = laterReview.before.find((item: { id: string }) => item.id === report.canonicalId);
    const { name: _oldName, aliases: _oldAliases, images: _oldImages, ...original } = report.before;
    expect(unchanged).toEqual(original);
    for (const id of ["Cable_Crossover", "rthepen:cable_crossover"]) {
      expect(matchesExerciseId(entry, id)).toBe(true);
      const items = [{ exerciseId: id, sets: 3, reps: 10, weight: 5, notes: "Rest 90 seconds" }];
      expect(resolveWorkout({ name: "Existing routine", items }, [], workoutIdentities([entry]))).toEqual(items);
    }
  });
  it("bundles the exact credited Commons photo and a validated publisher video link", async () => {
    const report = JSON.parse(await readFile("docs/standing-cable-pec-fly-review.json", "utf8"));
    const bytes = await readFile(`frontend/public${report.asset.localUrl}`);
    expect(bytes.subarray(0, 3).toString("hex")).toBe("ffd8ff");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(report.asset.sha256);
    expect(bytes.length).toBe(report.asset.bytes);
    const credits = JSON.parse(await readFile("frontend/public/catalog-attribution.json", "utf8"));
    const media = credits.find((entry: { id: string }) => entry.id === report.canonicalId).media[0];
    expect(media.author).toBe("Nenad Stojkovic");
    expect(media.license).toBe("CC BY 2.0");
    expect(media.sourceUrl).toBe(report.asset.sourceUrl);
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    const guide = catalog.find((entry: { id: string }) => entry.id === report.canonicalId).guides[0];
    expect(exerciseGuideSchema.safeParse(guide).success).toBe(true);
    expect(guide.videoUrl).toBe("https://www.youtube.com/watch?v=OPYrUGZL8nU");
    expect(exerciseGuideSchema.safeParse({ ...guide, url: guide.url + "?redirect=evil" }).success).toBe(false);
    expect(await readFile("licenses/commons-MEDIA-notices.txt", "utf8")).toBe(
      await readFile("frontend/public/licenses/commons-MEDIA-notices.txt", "utf8"),
    );
  });
});

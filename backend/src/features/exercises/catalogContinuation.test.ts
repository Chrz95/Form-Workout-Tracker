import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { getExerciseNameKey } from "../../../../shared/exerciseIdentity.js";
describe("Reviewed image-backed catalog continuation", () => {
  it("adds five distinct identities and restores seven existing IDs with checked illustrations", async () => {
    const report = JSON.parse(await readFile("docs/catalog-expansion-2.15.json", "utf8"));
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const archived = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/archivedExercises.json", "utf8")));
    expect(report.newCanonicalIds).toHaveLength(5);
    expect(report.restoredCanonicalIds).toHaveLength(7);
    expect(report.assets).toHaveLength(12);
    expect(catalog).toHaveLength(1482);
    expect(archived).toHaveLength(2021);
    for (const id of [...report.newCanonicalIds, ...report.restoredCanonicalIds]) {
      const exercise = catalog.find((entry) => entry.id === id);
      expect(exercise?.images.length).toBeGreaterThanOrEqual(1);
      expect(exercise?.isArchived).toBeUndefined();
      expect(exercise?.instructions.length).toBeGreaterThan(0);
      expect(archived.some((entry) => entry.id === id)).toBe(false);
    }
    const records = [...catalog, ...archived];
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(new Set(records.map((record) => getExerciseNameKey(record.name))).size).toBe(records.length);
    expect(report.baselineVisibleIds.every((id: string) => catalog.some((entry) => entry.id === id))).toBe(true);
  });
  it("retains exact illustration hashes, pinned sources and passive SVG content", async () => {
    const report = JSON.parse(await readFile("docs/catalog-expansion-2.15.json", "utf8"));
    const credits = JSON.parse(await readFile("frontend/public/catalog-attribution.json", "utf8"));
    for (const asset of report.assets) {
      const bytes = await readFile(`frontend/public${asset.localUrl}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
      expect(bytes.length).toBe(asset.bytes);
      expect(bytes.toString()).toContain("<path");
      const activeContentPattern = /<script|<foreignObject|\bon\w+\s*=|(?:xlink:)?href\s*=/i;
      expect(bytes.toString()).not.toMatch(activeContentPattern);
      expect(asset.sourceUrl).toContain(report.source.commit);
      const credit = credits.find((entry: { id: string }) => entry.id === asset.exerciseId);
      expect(credit.media[0].license).toBe("CC BY-SA 4.0");
      expect(credit.media[0].author).toBe("Bryl Lim");
      await access(`frontend/public${credit.media[0].url}`);
    }
  });
  it("keeps seated/standing band targets distinct and matches the Shotgun Row guide", async () => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const seated = catalog.find((exercise) => exercise.id === "hasan:3006")!;
    const standing = catalog.find((exercise) => exercise.id === "zenith:3006")!;
    expect(seated.name).toBe("Seated Band Hip Abduction");
    expect(standing.name).toBe("Standing Band Hip Abduction");
    expect(standing.aliases).not.toContain("resistance band seated hip abduction");
    expect(seated.instructions.join(" ")).toMatch(/sit on a chair/i);
    expect(standing.instructions.join(" ")).toMatch(/stand tall/i);
    const shotgun = catalog.find((exercise) => exercise.id === "Shotgun_Row")!;
    expect(shotgun.guides?.some((guide) => guide.title === "Shotgun Row")).toBe(true);
    expect(catalog.some((exercise) => exercise.id === "guide:standing-single-arm-cable-row")).toBe(false);
    expect(catalog.flatMap((exercise) => exercise.guides ?? [])).toHaveLength(451);
    expect(catalog.flatMap((exercise) => exercise.guides ?? []).filter((guide) => guide.videoUrl)).toHaveLength(195);
  });
});

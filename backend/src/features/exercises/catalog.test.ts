import { readFile, access } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { CUSTOM_EXERCISE_PREFIX } from "../../../../shared/exerciseConstants.js";
describe("Bundled public exercise catalog integrity", () => {
  it("parses every imported record, preserves unique IDs and keeps private content out of static assets", async () => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    expect(catalog).toHaveLength(3201);
    expect(new Set(catalog.map((exercise) => exercise.id)).size).toBe(catalog.length);
    expect(catalog.some((exercise) => exercise.id.startsWith(CUSTOM_EXERCISE_PREFIX))).toBe(false);
    expect(catalog.find((exercise) => exercise.id === "Barbell_Squat")).toBeDefined();
    expect(catalog.filter((exercise) => exercise.source).every((exercise) => exercise.instructions.length > 0)).toBe(
      true,
    );
    expect(await readFile("frontend/public/exercises.json", "utf8")).toBe(
      await readFile("shared/exercises.json", "utf8"),
    );
  });
  it("bundles every referenced image and animation poster with independent attribution", async () => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    await Promise.all(
      catalog
        .flatMap((exercise) => [
          ...exercise.images,
          ...(exercise.media ?? []).flatMap((asset) => (asset.stillUrl ? [asset.stillUrl] : [])),
        ])
        .map((url) => access(`frontend/public${url}`)),
    );
    const media = catalog.flatMap((exercise) => exercise.media ?? []);
    expect(media).toHaveLength(214);
    expect(media.every((asset) => asset.author && asset.license && asset.licenseUrl && asset.sourceUrl)).toBe(true);
    expect(media.filter((asset) => asset.stillUrl)).toHaveLength(3);
  });
  it("uses translation-specific text licenses and keeps real video codec/credit metadata", async () => {
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const videos = catalog.flatMap((exercise) => exercise.videos ?? []);
    expect(videos).toHaveLength(49);
    expect(videos.every((video) => video.author && video.licenseUrl && video.codec)).toBe(true);
    expect(
      catalog
        .filter((exercise) => exercise.source?.name.startsWith("wger"))
        .every((exercise) => exercise.source?.license && exercise.source.url && exercise.source.licenseUrl),
    ).toBe(true);
  });
});

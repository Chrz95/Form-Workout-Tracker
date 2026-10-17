import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { exerciseGuideSchema } from "../../../../shared/exerciseGuideContracts.js";
import { getExerciseNameKey } from "../../../../shared/exerciseIdentity.js";

describe("Requested exercise batch and source motion", () => {
  it("keeps existing references and restores only the matching archived calf raise", async () => {
    const report = JSON.parse(await readFile("docs/catalog-request-review-2.18.json", "utf8"));
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const archived = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/archivedExercises.json", "utf8")));
    expect(catalog).toHaveLength(1482);
    expect(archived).toHaveLength(2021);
    expect(new Set(catalog.map((entry) => getExerciseNameKey(entry.name))).size).toBe(catalog.length);
    for (const previous of report.before) {
      const current = catalog.find((entry) => entry.id === previous.id)!;
      expect(current.images).toEqual(previous.images);
      expect(current.legacyIds).toEqual(expect.arrayContaining(previous.legacyIds ?? []));
      for (const alias of [previous.name, ...(previous.aliases ?? [])]) expect(current.aliases).toContain(alias);
    }
    expect(archived.some((entry) => entry.id === "glow:kettlebell_calf_raise")).toBe(false);
    const calf = catalog.find((entry) => entry.id === "glow:kettlebell_calf_raise")!;
    expect(calf.equipment).toBe("kettlebells");
    expect(calf.primaryMuscles).toEqual(["calves"]);
    expect(calf.instructions.join(" ")).toContain("two-foot");
    expect(archived.some((entry) => entry.id === "rthepen:kettlebell_lateral_lunge")).toBe(true);
    expect(archived.some((entry) => entry.id === "hasan:1670")).toBe(false);
    const fixedCurl = catalog.find((entry) => entry.id === "hasan:1670")!;
    expect(fixedCurl.instructions.join(" ")).toMatch(/palm facing forward/i);
    expect(fixedCurl.videos?.[0]?.sourceUrl).toContain("dumbbell-standing-single-arm-curl");
    expect(catalog.some((entry) => entry.name === "Biceps")).toBe(false);
    expect(
      catalog.find((entry) => entry.id === "guide:dumbbell-standing-single-arm-twisting-curl")?.primaryMuscles,
    ).toContain("biceps");
  });
  it("bundles original MP4 bytes and authentic branded GIF frames with independent sharing terms", async () => {
    const report = JSON.parse(await readFile("docs/catalog-request-review-2.18.json", "utf8"));
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    expect(report.clips).toHaveLength(3);
    for (const clip of report.clips) {
      const entry = catalog.find((exercise) => exercise.id === clip.exerciseId)!;
      expect(entry.media?.[0]?.frameCount).toBe(clip.frameCount);
      expect(clip.frameCount).toBeGreaterThan(30);
      expect(entry.media?.[0]?.license).toContain("non-profit");
      expect(entry.media?.[0]?.licenseUrl).toBe("https://musclewiki.com/terms");
      for (const asset of clip.assets) {
        const bytes = await readFile(`frontend/public${asset.localUrl}`);
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        if (asset.localUrl.endsWith(".mp4")) expect(asset.sha256).toBe(clip.sha256);
        if (asset.localUrl.endsWith(".gif")) expect(bytes.subarray(0, 6).toString()).toBe("GIF89a");
      }
      expect(entry.images).toContain(entry.media?.[0]?.url);
      expect(entry.guides?.[0]?.url).toBe(`https://musclewiki.com/exercise/${clip.slug}`);
    }
    expect(await readFile("licenses/musclewiki-MOTION-notices.txt", "utf8")).toBe(
      await readFile("frontend/public/licenses/musclewiki-MOTION-notices.txt", "utf8"),
    );
    expect(await readFile("frontend/public/exercise-references.json", "utf8")).toBe(
      await readFile("shared/archivedExercises.json", "utf8"),
    );
  });
  it("validates the checked FITTR guide without accepting an unrelated host or publisher mismatch", () => {
    const guide = {
      provider: "FITTR",
      title: "Seated single arm high row",
      url: "https://www.fittr.com/exercise-video/seated-single-arm-high-row-33096/",
      videoUrl: "https://www.youtube.com/watch?v=0xdDxbKu5Is",
      checkedAt: "2026-10-15",
    };
    expect(exerciseGuideSchema.safeParse(guide).success).toBe(true);
    expect(
      exerciseGuideSchema.safeParse({ ...guide, url: guide.url.replace("www.fittr.com", "www.fittr.com.evil.test") })
        .success,
    ).toBe(false);
    expect(exerciseGuideSchema.safeParse({ ...guide, provider: "MuscleWiki" }).success).toBe(false);
  });
});

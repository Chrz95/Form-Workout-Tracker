import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";

describe("Restoration continuation with reviewed movement variants", () => {
  it("accounts for every baseline ID and supplies media for all newly visible movements", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.20.json", "utf8"));
    const alternatives = JSON.parse(await readFile("docs/catalog-restoration-2.21.json", "utf8"));
    const latest = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const visible = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const archived = JSON.parse(await readFile("shared/archivedExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const all = [...visible, ...archived, ...retired];
    expect(report.status).toHaveLength(2162);
    expect(report.restoredIds).toHaveLength(22);
    expect(Object.keys(report.duplicateMappings)).toHaveLength(16);
    expect(visible).toHaveLength(1482);
    expect(archived).toHaveLength(2021);
    expect(retired).toHaveLength(586);
    expect(new Set(all.map((entry) => entry.id)).size).toBe(4089);
    expect(
      createHash("sha256")
        .update(JSON.stringify(all.map((entry) => entry.id).sort()))
        .digest("hex"),
    ).toBe(report.baselineHistoricalIdsSha256);
    expect(report.baselineVisibleIds.every((id: string) => visible.some((entry) => entry.id === id))).toBe(true);
    for (const row of report.status) {
      expect(all.some((entry) => entry.id === row.id)).toBe(true);
      if (row.status === "restored") {
        const entry = visible.find((entry) => entry.id === row.id)!;
        expect(entry.images.length).toBeGreaterThan(0);
        expect(entry.instructions.length).toBeGreaterThan(1);
        expect(entry.videos.some((video) => video.localUrl && video.posterUrl)).toBe(true);
        expect(entry.media.every((image) => !/opengym|gymvisual/i.test(image.sourceUrl))).toBe(true);
      } else if (row.status === "duplicate_alias") {
        const parent = visible.find((entry) => entry.id === row.canonicalId)!;
        expect(matchesExerciseId(parent, row.id)).toBe(true);
        expect(retired.find((entry) => entry.id === row.id)?.canonicalId).toBe(parent.id);
      } else {
        const later = [...latest.status, ...alternatives.status].find((status: { id: string }) => status.id === row.id);
        if (later.status === "restored") {
          expect(visible.some((entry) => entry.id === row.id && entry.images.length > 0)).toBe(true);
        } else if (later.status === "duplicate_alias") {
          const parent = visible.find((entry) => entry.id === later.canonicalId)!;
          expect(matchesExerciseId(parent, row.id)).toBe(true);
        } else {
          expect(archived.some((entry) => entry.id === row.id)).toBe(true);
        }
      }
    }
    for (const rejected of report.rejectedExamples) {
      expect(archived.some((entry) => entry.id === rejected.id)).toBe(true);
    }
  });

  it("keeps new source videos unmodified and verifies every bundled clip and poster", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-assets-2.20.json", "utf8"));
    expect(report.muscleWiki).toHaveLength(31);
    expect(report.wger).toEqual([]);
    for (const clip of report.muscleWiki) {
      expect(clip.codec).toBe("h264");
      expect(clip.duration).toBeGreaterThan(0);
      expect(clip.posterTimeSeconds).toBeCloseTo(clip.duration * 0.4);
      expect(clip.assets).toHaveLength(2);
      for (const asset of clip.assets) {
        const bytes = await readFile(`frontend/public${asset.localUrl}`);
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        if (asset.localUrl.endsWith(".mp4")) {
          expect(asset.sha256).toBe(clip.sourceSha256);
        }
      }
    }
  });

  it("preserves variants with different grips, equipment positions and support", async () => {
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    /** Looks up a reviewed variant in the bundled public catalog.
     * @param {string} id - Stable exercise identity.
     * @returns {object} The corresponding public exercise.
     */
    const find = (id: string) => catalog.find((entry: { id: string }) => entry.id === id);
    const pairs = [
      ["hasan:0710", "wger:1202"],
      ["zenith:0350", "Lying_Supine_Dumbbell_Curl"],
      ["rthepen:kettlebell_bicep_curl", "glow:kettlebell_curl"],
      ["rthepen:bosu_ball_bosu_platform_pushup", "hasan:1307"],
      ["rthepen:kettlebell_single_leg_rdl", "Kettlebell_One-Legged_Deadlift"],
      ["hasan:0041", "Standing_Front_Barbell_Raise_Over_Head"],
      ["hasan:0375", "Straight-Arm_Dumbbell_Pullover"],
    ];
    for (const [left, right] of pairs) {
      expect(find(left)).toBeDefined();
      expect(find(right)).toBeDefined();
      expect(find(left).id).not.toBe(find(right).id);
      expect(find(left).instructions).not.toEqual(find(right).instructions);
    }
    expect(find("zenith:0350").instructions.join(" ")).toMatch(/supinated/);
    expect(find("Lying_Supine_Dumbbell_Curl").instructions.join(" ")).toMatch(/rotate/);
    expect(find("rthepen:bosu_ball_bosu_platform_pushup").instructions.join(" ")).toMatch(/dome-down/);
    expect(find("hasan:1307").instructions.join(" ")).toMatch(/flat side down/);
    expect(find("rthepen:kettlebell_single_leg_rdl").instructions.join(" ")).toMatch(/opposite hand/);
    expect(find("Kettlebell_One-Legged_Deadlift").instructions.join(" ")).toMatch(/same side/);
  });

  it("resolves newly restored and duplicate IDs without rewriting saved prescriptions", async () => {
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const items = ["wger:1027", "zenith:1511", "hasan:0710", "rthepen:kettlebell_bicep_curl"].map((exerciseId) => ({
      exerciseId,
      sets: 2,
      reps: 8,
      weight: 10,
      notes: "Keep the position steady; use the heavier second set",
      setTargets: [
        { reps: 8, weight: 10 },
        { reps: 6, weight: 12 },
      ],
    }));
    expect(resolveWorkout({ name: "Retained workout", items }, [], workoutIdentities(catalog))).toEqual(items);
  });
});

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { getExerciseNameKey, matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";

describe("Further reviewed image restoration", () => {
  it("retains every historical identity and previously visible movement with complete dispositions", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const visible = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const archive = JSON.parse(await readFile("shared/archivedExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const all = [...visible, ...archive, ...retired];
    expect(report.restoredIds).toHaveLength(28);
    expect(Object.keys(report.duplicateMappings)).toHaveLength(14);
    expect(report.status).toHaveLength(2063);
    expect(visible).toHaveLength(1482);
    expect(archive).toHaveLength(2021);
    expect(retired).toHaveLength(586);
    expect(new Set(all.map((entry) => entry.id)).size).toBe(4089);
    expect(
      createHash("sha256")
        .update(JSON.stringify(all.map((entry) => entry.id).sort()))
        .digest("hex"),
    ).toBe(report.baselineHistoricalIdsSha256);
    expect(report.baselineVisibleIds.every((id: string) => visible.some((entry) => entry.id === id))).toBe(true);
    expect(new Set([...visible, ...archive].map((entry) => getExerciseNameKey(entry.name))).size).toBe(
      visible.length + archive.length,
    );
    for (const row of report.status) {
      if (row.status === "restored") {
        const entry = visible.find((entry) => entry.id === row.id)!;
        expect(entry.images).toHaveLength(3);
        expect(entry.instructions.length).toBeGreaterThan(1);
        expect(entry.images.every((url) => entry.media?.some((media) => media.url === url))).toBe(true);
      } else if (row.status === "duplicate_alias") {
        expect(retired.find((entry) => entry.id === row.id)?.canonicalId).toBe(row.canonicalId);
        expect(
          matchesExerciseId(
            visible.find((entry) => entry.id === row.canonicalId)!,
            row.id,
          ),
        ).toBe(true);
      } else {
        expect(archive.some((entry) => entry.id === row.id && entry.isArchived)).toBe(true);
      }
    }
  });

  it("bundles only reviewed passive static positions with original publisher provenance and local hashes", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-assets-2.22.json", "utf8"));
    const visible = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    expect(report.flow).toHaveLength(28);
    expect(report.flow.flatMap((entry: { assets: unknown[] }) => entry.assets)).toHaveLength(84);
    for (const entry of report.flow) {
      const exercise = visible.find((exercise) => exercise.id === entry.exerciseId)!;
      expect(entry.isAiGenerated).toBe(true);
      expect(exercise.media!.every((media) => media.author.includes("AI-generated") && !media.frameCount)).toBe(true);
      for (const asset of entry.assets) {
        expect(asset.sourceSha256).toBe(
          entry.provenance.frames.find((frame: { path: string }) => frame.path === asset.sourcePath).sha256,
        );
        const bytes = await readFile(`frontend/public${asset.localUrl}`);
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        expect(bytes.toString()).toContain('fill="#1d2a25"');
        expect(bytes.toString()).not.toMatch(/<!DOCTYPE|<script|<foreignObject|<image|\son\w+\s*=|href\s*=/i);
      }
    }
  });

  it("excludes swapped illustrations and retains posture, equipment and alternating-action distinctions", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const visible = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const archive = JSON.parse(await readFile("shared/archivedExercises.json", "utf8"));
    for (const row of report.rejectedExamples)
      expect(archive.some((entry: { id: string }) => entry.id === row.id)).toBe(true);
    expect(archive.some((entry: { id: string }) => entry.id === "hasan:0065")).toBe(true);
    const alternate = visible.find((entry) => entry.id === "hasan:1730")!;
    const simultaneous = visible.find((entry) => entry.id === "hasan:0394")!;
    expect(alternate.legacyIds ?? []).not.toContain(simultaneous.id);
    expect(alternate.instructions.join(" ")).toMatch(/alternating/i);
    expect(simultaneous.instructions.join(" ")).toMatch(/arms straight back/);
    const seatedTwist = visible.find((entry) => entry.id === "hasan:0211")!;
    const lyingTwist = visible.find((entry) => entry.id === "Cable_Russian_Twists")!;
    expect(seatedTwist.instructions.join(" ")).toMatch(/sit on a stability ball/i);
    expect(lyingTwist.instructions.join(" ")).toMatch(/lie on a stability ball/i);
    expect(seatedTwist.legacyIds ?? []).not.toContain(lyingTwist.id);
    expect(visible.find((entry) => entry.id === "hasan:0661")!.primaryMuscles).toEqual(["chest"]);
    expect(report.resources.muscleAndStrength.accepted).toHaveLength(3);
    const directVideos = report.resources.muscleAndStrength.accepted.filter(
      (entry: { guide: { videoUrl?: string } }) => entry.guide.videoUrl,
    );
    expect(directVideos).toHaveLength(2);
  });

  it("resolves every newly consolidated alias without changing saved notes or set targets", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const visible = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    for (const exerciseId of [...report.restoredIds, ...Object.keys(report.duplicateMappings)]) {
      const items = [
        {
          exerciseId,
          sets: 2,
          reps: 8,
          weight: 10,
          notes: "Keep my original reminder",
          setTargets: [
            { reps: 8, weight: 10 },
            { reps: 6, weight: 12 },
          ],
        },
      ];
      expect(resolveWorkout({ name: "Retained routine", items }, [], workoutIdentities(visible))).toEqual(items);
    }
  });
});

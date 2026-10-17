import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";

describe("Alternative-source restoration", () => {
  it("preserves all original IDs and restores only entries with credited local images", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.21.json", "utf8"));
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
    expect(report.restoredIds).toHaveLength(50);
    expect(Object.keys(report.duplicateMappings)).toHaveLength(11);
    expect(report.status).toHaveLength(2124);
    expect(visible).toHaveLength(1482);
    expect(archived).toHaveLength(2021);
    expect(new Set(all.map((entry) => entry.id)).size).toBe(4089);
    expect(
      createHash("sha256")
        .update(JSON.stringify(all.map((entry) => entry.id).sort()))
        .digest("hex"),
    ).toBe(report.baselineHistoricalIdsSha256);
    expect(report.baselineVisibleIds.every((id: string) => visible.some((entry) => entry.id === id))).toBe(true);
    for (const row of report.status) {
      if (row.status === "restored") {
        const entry = visible.find((entry) => entry.id === row.id)!;
        expect(entry.images.length).toBeGreaterThan(0);
        expect(entry.instructions.length).toBeGreaterThan(1);
        expect(entry.images.every((image) => entry.media?.some((media) => media.url === image))).toBe(true);
      } else if (row.status === "duplicate_alias") {
        expect(
          matchesExerciseId(
            visible.find((entry) => entry.id === row.canonicalId)!,
            row.id,
          ),
        ).toBe(true);
      } else {
        const later = latest.status.find((entry: { id: string }) => entry.id === row.id);
        if (later?.status === "restored") {
          expect(visible.some((entry) => entry.id === row.id && entry.images.length > 0)).toBe(true);
        } else if (later?.status === "duplicate_alias") {
          expect(retired.find((entry) => entry.id === row.id)?.canonicalId).toBe(later.canonicalId);
        } else {
          expect(archived.some((entry) => entry.id === row.id)).toBe(true);
        }
      }
    }
    for (const rejected of report.rejectedExamples) {
      expect(archived.some((entry) => entry.id === rejected.id)).toBe(true);
    }
  });

  it("verifies publisher frame hashes, passive SVG content and independent licenses", async () => {
    const assets = JSON.parse(await readFile("docs/catalog-restoration-assets-2.21.json", "utf8"));
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    expect(assets.flow).toHaveLength(48);
    for (const entry of assets.flow) {
      expect(entry.isAiGenerated).toBe(true);
      const exercise = catalog.find((exercise: { id: string }) => exercise.id === entry.exerciseId);
      for (const frame of entry.assets) {
        expect(frame.sourceSha256).toBe(
          entry.provenance.frames.find((source: { path: string }) => source.path === frame.sourcePath).sha256,
        );
        const bytes = await readFile(`frontend/public${frame.localUrl}`);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(frame.sha256);
        expect(bytes.length).toBe(frame.bytes);
        expect(bytes.toString()).toContain('fill="#1d2a25"');
        expect(bytes.toString()).not.toMatch(/<!DOCTYPE|<script|<foreignObject|<image|\son\w+\s*=/i);
      }
      expect(exercise.media.every((media: { author: string }) => media.author.includes("AI-generated"))).toBe(true);
      expect(exercise.media.every((media: { frameCount?: number }) => !media.frameCount)).toBe(true);
    }
    for (const entry of assets.commons) {
      for (const asset of entry.assets) {
        const bytes = await readFile(`frontend/public${asset.localUrl}`);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        expect(bytes.length).toBe(asset.bytes);
      }
    }
    expect(await readFile("licenses/alternative-sources-MEDIA-notices.txt", "utf8")).toBe(
      await readFile("frontend/public/licenses/alternative-sources-MEDIA-notices.txt", "utf8"),
    );
  });

  it("uses the double-bell finish photograph without claiming a full-cycle video", async () => {
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    const double = catalog.find((entry: { id: string }) => entry.id === "wger:1360");
    const single = catalog.find((entry: { id: string }) => entry.id === "rthepen:kettlebell_clean_and_press");
    expect(double.id).not.toBe(single.id);
    expect(double.instructions.join(" ")).toMatch(/two kettlebells/i);
    expect(double.media[0].changes).toMatch(/only this shared finish position/i);
    expect(double.videos ?? []).toEqual([]);
    const march = catalog.find((entry: { id: string }) => entry.id === "hasan:0624");
    expect(march.images).toEqual(["/exercises/flow/0624/1.svg"]);
    const burpee = catalog.find((entry: { id: string }) => entry.id === "hasan:1201");
    expect(burpee.media[0].changes).toMatch(/push-up phase/i);
  });

  it("keeps restored and retired exercise IDs valid without rewriting notes or set targets", async () => {
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const items = ["hasan:0521", "hasan:3204", "wger:1360"].map((exerciseId) => ({
      exerciseId,
      sets: 2,
      reps: 8,
      weight: 12,
      notes: "Keep this reminder and use a heavier second set",
      setTargets: [
        { reps: 8, weight: 12 },
        { reps: 6, weight: 14 },
      ],
    }));
    expect(resolveWorkout({ name: "Original saved workout", items }, [], workoutIdentities(catalog))).toEqual(items);
    const alternateAlias = [{ ...items[0], exerciseId: "rthepen:kettlebell_renegade_row" }, ...items.slice(1)];
    expect(
      resolveWorkout({ name: "Another saved workout", items: alternateAlias }, [], workoutIdentities(catalog)),
    ).toEqual(alternateAlias);
  });
});

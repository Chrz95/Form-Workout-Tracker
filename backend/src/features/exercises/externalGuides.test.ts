import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { getExerciseNameKey } from "../../../../shared/exerciseIdentity.js";
describe("Reviewed publisher guide enrichment", () => {
  it("attaches only checked unique publisher links to existing visible identities", async () => {
    const report = JSON.parse(await readFile("docs/catalog-enrichment-2.14.json", "utf8"));
    const catalog = z.array(exerciseSchema).parse(JSON.parse(await readFile("shared/exercises.json", "utf8")));
    const accepted = report.accepted;
    expect(report.checkedPages).toBe(report.discoveredCounts.visible);
    expect(new Set(accepted.map((entry: { exerciseId: string }) => entry.exerciseId)).size).toBe(
      report.enrichedExercises,
    );
    expect(accepted).toHaveLength(report.guideCount);
    for (const entry of accepted) {
      const exercise = catalog.find((record) => record.id === entry.exerciseId);
      expect(exercise?.images.length).toBeGreaterThan(0);
      expect(exercise?.guides).toContainEqual(entry.guide);
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.guide.checkedAt).toBe(report.checkedAt);
    }
    for (const exercise of catalog) {
      expect(new Set(exercise.guides?.map((guide) => guide.provider)).size).toBe(exercise.guides?.length ?? 0);
    }
    expect(catalog.flatMap((exercise) => exercise.guides ?? []).length).toBeGreaterThanOrEqual(report.guideCount);
    expect(
      catalog.flatMap((exercise) => exercise.guides ?? []).filter((guide) => guide.videoUrl).length,
    ).toBeGreaterThanOrEqual(report.linkedVideos);
    expect(new Set(catalog.map((exercise) => getExerciseNameKey(exercise.name))).size).toBe(catalog.length);
  });
  it("preserves every original record field including IDs, image licenses and instructions", async () => {
    const report = JSON.parse(await readFile("docs/catalog-enrichment-2.14.json", "utf8"));
    const original = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    const expansion = JSON.parse(await readFile("docs/catalog-expansion-2.15.json", "utf8"));
    const baselineIds = new Set(expansion.baselineVisibleIds);
    const baseline = original.filter((exercise: { id: string }) => baselineIds.has(exercise.id));
    // Restore this documented later enrichment when checking the earlier immutable release digest.
    const pecReview = JSON.parse(await readFile("docs/standing-cable-pec-fly-review.json", "utf8"));
    const batchReview = JSON.parse(await readFile("docs/catalog-request-review-2.18.json", "utf8"));
    const restoration = JSON.parse(await readFile("docs/catalog-restoration-2.19.json", "utf8"));
    const continuation = JSON.parse(await readFile("docs/catalog-restoration-2.20.json", "utf8"));
    const alternatives = JSON.parse(await readFile("docs/catalog-restoration-2.21.json", "utf8"));
    const latest = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const beforeLatest = baseline.map(
      (entry: { id: string }) => latest.before.find((previous: { id: string }) => previous.id === entry.id) ?? entry,
    );
    const beforeAlternatives = beforeLatest.map(
      (entry: { id: string }) =>
        alternatives.before.find((previous: { id: string }) => previous.id === entry.id) ?? entry,
    );
    const beforeContinuation = beforeAlternatives.map(
      (entry: { id: string }) =>
        continuation.before.find((previous: { id: string }) => previous.id === entry.id) ?? entry,
    );
    const beforeRestoration = beforeContinuation.map(
      (entry: { id: string }) =>
        restoration.before.find((previous: { id: string }) => previous.id === entry.id) ?? entry,
    );
    const beforeBatch = beforeRestoration.map(
      (entry: { id: string }) =>
        batchReview.before.find((original: { id: string }) => original.id === entry.id) ?? entry,
    );
    const originalBaseline = beforeBatch.map((entry: { id: string }) =>
      entry.id === pecReview.canonicalId ? pecReview.before : entry,
    );
    const withoutGuides = originalBaseline.map(({ guides: _guides, ...exercise }: Record<string, unknown>) => exercise);
    expect(createHash("sha256").update(JSON.stringify(withoutGuides)).digest("hex")).toBe(report.existingFieldsSha256);
    expect(baseline).toHaveLength(report.comparedVisible);
    expect(await readFile("frontend/public/exercises.json", "utf8")).toBe(
      await readFile("shared/exercises.json", "utf8"),
    );
    expect(
      report.rejected.some((record: { reason: string }) => record.reason === "actual_title_variant_mismatch"),
    ).toBe(true);
  });
});

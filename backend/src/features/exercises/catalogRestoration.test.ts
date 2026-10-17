import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { exerciseSchema } from "../../../../shared/contracts.js";
import { getExerciseNameKey, matchesExerciseId } from "../../../../shared/exerciseIdentity.js";
import { resolveWorkout, workoutIdentities } from "../../../../shared/workoutGraph.js";

describe("Verified restoration with complete historical accounting", () => {
  it("retains every archived ID and exposes only verified entries", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.19.json", "utf8"));
    const continuation = JSON.parse(await readFile("docs/catalog-restoration-2.20.json", "utf8"));
    const alternatives = JSON.parse(await readFile("docs/catalog-restoration-2.21.json", "utf8"));
    const latest = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const currentStatuses = [...latest.status, ...alternatives.status, ...continuation.status];
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const archive = JSON.parse(await readFile("shared/archivedExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const all = [...catalog, ...archive, ...retired];
    expect(report.status).toHaveLength(2384);
    expect(report.restoredIds).toHaveLength(95);
    expect(Object.keys(report.duplicateMappings)).toHaveLength(127);
    expect(all).toHaveLength(4089);
    expect(new Set(all.map((entry) => entry.id)).size).toBe(all.length);
    expect(new Set([...catalog, ...archive].map((entry) => getExerciseNameKey(entry.name))).size).toBe(3503);
    for (const row of report.status) {
      expect(all.some((entry) => entry.id === row.id)).toBe(true);
      if (row.status === "restored") {
        const exercise = catalog.find((entry) => entry.id === row.id)!;
        expect(exercise.images.length).toBeGreaterThan(0);
        expect(exercise.instructions.length).toBeGreaterThan(0);
        expect(exercise.videos.some((video: { localUrl?: string }) => video.localUrl)).toBe(true);
      } else if (row.status === "duplicate_alias") {
        const canonical = catalog.find((entry) => entry.id === row.canonicalId)!;
        expect(matchesExerciseId(canonical, row.id)).toBe(true);
      } else {
        const later = currentStatuses.find((status: { id: string }) => status.id === row.id);
        if (later.status === "restored") {
          expect(catalog.some((entry) => entry.id === row.id)).toBe(true);
        } else if (later.status === "duplicate_alias") {
          expect(retired.find((entry) => entry.id === row.id)?.canonicalId).toBe(later.canonicalId);
          expect(
            matchesExerciseId(
              catalog.find((entry) => entry.id === later.canonicalId)!,
              row.id,
            ),
          ).toBe(true);
        } else {
          expect(archive.some((entry) => entry.id === row.id)).toBe(true);
        }
      }
    }
  });
  it("retains every authentic clip and thumbnail byte with independent media credits", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-assets-2.19.json", "utf8"));
    expect(report.muscleWiki).toHaveLength(120);
    expect(report.wger).toHaveLength(4);
    for (const clip of [...report.muscleWiki, ...report.wger]) {
      expect(clip.codec).toBe("h264");
      expect(clip.duration).toBeGreaterThan(0);
      expect(clip.assets).toHaveLength(2);
      for (const asset of clip.assets) {
        const bytes = await readFile(`frontend/public${asset.localUrl}`);
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        if (clip.sourceSha256 && asset.localUrl.endsWith(".mp4") && clip.slug) {
          expect(asset.sha256).toBe(clip.sourceSha256);
        }
      }
    }
  });
  it("retains rejected matches unless later independently verified and imports no OpenGym media", async () => {
    const report = JSON.parse(await readFile("docs/catalog-restoration-2.19.json", "utf8"));
    const continuation = JSON.parse(await readFile("docs/catalog-restoration-2.20.json", "utf8"));
    const alternatives = JSON.parse(await readFile("docs/catalog-restoration-2.21.json", "utf8"));
    const latest = JSON.parse(await readFile("docs/catalog-restoration-2.22.json", "utf8"));
    const currentStatuses = [...latest.status, ...alternatives.status, ...continuation.status];
    const archive = JSON.parse(await readFile("shared/archivedExercises.json", "utf8"));
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
    expect(report.resources.openGym.catalogCount).toBe(5632);
    expect(report.resources.openGym.lookupCandidates).toBe(1115);
    for (const rejected of report.rejectedExamples) {
      const later = currentStatuses.find((status: { id: string }) => status.id === rejected.id);
      if (later.status === "awaiting_verified_media") {
        expect(archive.some((entry: { id: string }) => entry.id === rejected.id)).toBe(true);
      } else if (later.status === "restored") {
        expect(catalog.some((entry: { id: string }) => entry.id === rejected.id)).toBe(true);
      } else {
        expect(catalog.some((entry: { id: string }) => entry.id === later.canonicalId)).toBe(true);
      }
    }
    for (const previous of report.restoredBefore) {
      const current = catalog.find((entry: { id: string }) => entry.id === previous.id);
      expect(current.media.every((media: { sourceUrl: string }) => !/opengym|gymvisual/i.test(media.sourceUrl))).toBe(
        true,
      );
    }
    const fixed = catalog.find((entry: { id: string }) => entry.id === "hasan:1670");
    const twisting = catalog.find(
      (entry: { id: string }) => entry.id === "guide:dumbbell-standing-single-arm-twisting-curl",
    );
    expect(fixed.id).not.toBe(twisting.id);
    expect(fixed.instructions.join(" ")).toMatch(/palm facing forward/i);
    expect(twisting.instructions.join(" ")).toMatch(/rotate/i);
    const dome = catalog.find((entry: { id: string }) => entry.id === "rthepen:bosu_ball_bosu_squat");
    expect(dome.name).toBe("BOSU Dome-Up Squat");
    expect(dome.instructions.join(" ")).toContain("dome up");
    const flat = archive.find((entry: { id: string }) => entry.id === "hasan:1705");
    expect(flat.instructions.join(" ")).toContain("flat side up");
    expect(report.duplicateMappings["wger:615"]).toBe("Barbell_Squat");
    expect(report.duplicateMappings["hasan:0533"]).toBe("Goblet_Squat");
  });
  it("accepts saved duplicate references while preserving per-exercise notes and per-set prescriptions", async () => {
    const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8")).map((entry: unknown) =>
      exerciseSchema.parse(entry),
    );
    const items = ["wger:51", "hasan:0227", "hasan:1670", "zenith:0740"].map((exerciseId) => ({
      exerciseId,
      sets: 2,
      reps: 8,
      weight: 12,
      notes: "Pause, then increase the second set",
      setTargets: [
        { reps: 8, weight: 12 },
        { reps: 6, weight: 14 },
      ],
    }));
    expect(resolveWorkout({ name: "Saved routine", items }, [], workoutIdentities(catalog))).toEqual(items);
  });
});

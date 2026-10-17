import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
/** Reads a checked-in UTF-8 restoration snapshot.
 * @param {string} path - Snapshot path relative to the project root.
 * @returns {Promise<object>} Parsed snapshot.
 */
async function readSnapshot(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
const report = await readSnapshot("docs/catalog-restoration-2.22.json");
const continuation = await readSnapshot("docs/catalog-restoration-assets-2.22.json");
const alternatives = await readSnapshot("docs/catalog-restoration-assets-2.21.json");
const previousAssets = await readSnapshot("docs/catalog-restoration-assets-2.19.json");
const assets = await readSnapshot("docs/catalog-restoration-assets-2.20.json");
const visible = await readSnapshot("shared/exercises.json");
const archived = await readSnapshot("shared/archivedExercises.json");
const retired = await readSnapshot("shared/retiredExercises.json");
const all = [...visible, ...archived, ...retired];
assert.equal(new Set(all.map((entry) => entry.id)).size, all.length, "IDs must remain unique");
assert.equal(all.length, report.baselineVisible + report.baselineArchived + report.baselineRetired);
assert.equal(report.status.length, report.baselineArchived);
for (const status of report.status) {
  const entry = all.find((record) => record.id === status.id);
  assert.ok(entry, `Missing historical ID: ${status.id}`);
  if (status.status === "restored") {
    assert.ok(visible.includes(entry) && entry.images.length && entry.instructions.length);
    assert.ok(entry.media?.length && entry.images.every((url) => entry.media.some((media) => media.url === url)));
  } else if (status.status === "duplicate_alias") {
    const canonical = visible.find((record) => record.id === status.canonicalId);
    assert.equal(entry.canonicalId, canonical?.id);
    assert.ok(canonical?.legacyIds.includes(status.id));
  } else {
    assert.ok(archived.includes(entry) && entry.isArchived);
  }
}
let verifiedAssets = 0;
for (const clip of [...previousAssets.muscleWiki, ...previousAssets.wger, ...assets.muscleWiki, ...assets.wger]) {
  assert.ok(clip.duration > 0 && clip.width > 0 && clip.height > 0 && clip.codec === "h264");
  for (const asset of clip.assets) {
    assert.match(asset.localUrl, /^\/exercise-motion\/[a-zA-Z0-9-]+\.(mp4|webp)$/);
    const bytes = await readFile(`frontend/public${asset.localUrl}`);
    assert.equal(bytes.length, asset.bytes, asset.localUrl);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, asset.localUrl);
    assert.ok(
      visible.some(
        (entry) =>
          entry.images.includes(asset.localUrl) || entry.videos?.some((video) => video.localUrl === asset.localUrl),
      ),
      `Unreferenced asset: ${asset.localUrl}`,
    );
    verifiedAssets += 1;
  }
}
for (const entry of [...alternatives.flow, ...alternatives.commons, ...continuation.flow, ...continuation.commons]) {
  for (const asset of entry.assets) {
    const bytes = await readFile(`frontend/public${asset.localUrl}`);
    assert.equal(bytes.length, asset.bytes, asset.localUrl);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, asset.localUrl);
    assert.ok(
      visible.some(
        (exercise) =>
          exercise.images.includes(asset.localUrl) ||
          exercise.videos?.some((video) => video.localUrl === asset.localUrl),
      ),
    );
    verifiedAssets += 1;
  }
}
process.stdout.write(
  JSON.stringify({
    restored: report.restoredIds.length,
    aliases: Object.keys(report.duplicateMappings).length,
    pending: archived.length,
    verifiedAssets,
    historicalIds: all.length,
  }) + "\n",
);

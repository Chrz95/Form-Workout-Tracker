import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const outputDirectory = "dist";
/** Finds build assets without including the entire photographic dataset.
 * @param {string} directory - Asset directory relative to build output.
 * @returns {Promise<string[]>} Static resources to precache.
 */
async function listAssets(directory) {
  const files = await readdir(`${outputDirectory}/${directory}`, { withFileTypes: true });
  return files.filter((file) => file.isFile()).map((file) => `/${directory}/${file.name}`);
}
const assets = [
  ...(await listAssets("assets")),
  ...(await listAssets("fonts")),
  "/studio.webp",
  "/icon-192.png",
  "/icon-512.png",
  "/setup.html",
  "/exercise-references.json",
  "/catalog-licenses.html",
  ...(await listAssets("licenses")),
];
await writeFile(`${outputDirectory}/precache.json`, JSON.stringify(assets));
const contentHash = createHash("sha256").update(assets.join("|"));
for (const asset of ["/index.html", "/exercises.json", "/icon.svg", "/manifest.webmanifest", ...assets]) {
  contentHash.update(await readFile(`${outputDirectory}${asset}`));
}
const version = contentHash.digest("hex");
const workerPath = `${outputDirectory}/sw.js`;
const workerSource = await readFile(workerPath, "utf8");
await writeFile(workerPath, workerSource.replace('"form-static-v1"', JSON.stringify(`form-${version}`)));

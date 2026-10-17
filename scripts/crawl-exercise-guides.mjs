import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { getExerciseNameKey } from "../shared/exerciseIdentity.ts";
const output = process.argv[2];
if (!output) throw new Error("Usage: node --import tsx scripts/crawl-exercise-guides.mjs ../catalog-crawl");
const directory = resolve(output);
await mkdir(`${directory}/pages`, { recursive: true });
const publishers = [
  { key: "musclewiki", origin: "https://musclewiki.com", prefix: "/exercise/" },
  { key: "muscleandstrength", origin: "https://www.muscleandstrength.com", prefix: "/exercises/" },
];
const visible = JSON.parse(await readFile("shared/exercises.json", "utf8"));
const archived = JSON.parse(await readFile("shared/archivedExercises.json", "utf8"));
const retired = JSON.parse(await readFile("shared/retiredExercises.json", "utf8"));
const visibleIds = new Set(visible.map((exercise) => exercise.id));
const names = new Map();
for (const exercise of [...visible, ...archived, ...retired]) {
  for (const name of [exercise.name, ...(exercise.aliases ?? [])]) {
    const key = getExerciseNameKey(name);
    if (!names.has(key)) names.set(key, new Set());
    names.get(key).add(exercise.canonicalId ?? exercise.id);
  }
}
/** Reads only public, explicitly allowed guide hosts; caches responses outside runtime assets.
 * @param {string} url - Fixed publisher sitemap, robots or guide URL.
 * @returns {Promise<string>} Cached or fetched UTF-8 page content.
 */
async function snapshot(url) {
  if (!publishers.some((publisher) => new URL(url).origin === publisher.origin)) {
    throw new Error("Only the two selected publisher hosts may be crawled");
  }
  const path = `${directory}/pages/${createHash("sha256").update(url).digest("hex")}.html`;
  try {
    return await readFile(path, "utf8");
  } catch {
    /* Fetch an uncached public page. */
  }
  const response = await fetch(url, {
    headers: { "User-Agent": "FormCatalogResearch/1.0" },
    signal: AbortSignal.timeout(35000),
    redirect: "follow",
  });
  if (!response.ok || !publishers.some((publisher) => new URL(response.url).origin === publisher.origin)) {
    throw new Error(`Publisher response ${response.status}`);
  }
  const text = await response.text();
  if (Buffer.byteLength(text) > 8_000_000) throw new Error("Publisher response exceeds crawl limit");
  await writeFile(path, text);
  return text;
}
/** Extracts sitemap locations without following unrelated site navigation.
 * @param {string} xml - Public sitemap XML.
 * @returns {string[]} Declared locations.
 */
function locations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}
/** Checks wildcard-agent robots exclusions against these fixed public exercise paths.
 * @param {string} robots - Publisher robots content.
 * @param {string} path - Exercise path to check.
 * @returns {boolean} Whether a wildcard-agent disallow rule applies.
 */
function blocked(robots, path) {
  let applies = false;
  for (const raw of robots.split("\n")) {
    const line = raw.split("#")[0].trim();
    if (/^user-agent:/i.test(line)) applies = line.split(":").slice(1).join(":").trim() === "*";
    if (applies && /^disallow:/i.test(line)) {
      const rule = line.slice(line.indexOf(":") + 1).trim();
      if (rule && new RegExp(`^${rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*")}`).test(path)) {
        return true;
      }
    }
  }
  return false;
}
const candidates = [];
for (const publisher of publishers) {
  const robots = await snapshot(`${publisher.origin}/robots.txt`);
  let urls = locations(await snapshot(`${publisher.origin}/sitemap.xml`));
  if (publisher.key === "muscleandstrength") {
    urls = (
      await Promise.all(
        urls
          .filter((url) => /^https:\/\/www\.muscleandstrength\.com\/sitemap\.xml\?page=\d+$/.test(url))
          .map(async (url) => locations(await snapshot(url))),
      )
    ).flat();
  }
  for (const url of new Set(urls)) {
    const parsed = new URL(url);
    if (parsed.origin !== publisher.origin || parsed.search || !parsed.pathname.startsWith(publisher.prefix)) continue;
    const slug = parsed.pathname.slice(publisher.prefix.length);
    if (!/^[a-z0-9-]+(?:\.html)?$/.test(slug) || blocked(robots, parsed.pathname)) continue;
    const nameFromSlug = slug.replace(/\.html$/, "").replaceAll("-", " ");
    const matches = [...(names.get(getExerciseNameKey(nameFromSlug)) ?? [])];
    const status =
      matches.length > 1
        ? "ambiguous"
        : matches.length === 0
          ? "unmatched"
          : visibleIds.has(matches[0])
            ? "visible"
            : "archived";
    candidates.push({ provider: publisher.key, url, nameFromSlug, matches, status });
  }
}
await writeFile(`${directory}/comparison.json`, JSON.stringify(candidates, null, 2));
const targets = candidates.filter((candidate) => candidate.status === "visible");
const verified = [];
let cursor = 0;
/** Visits uniquely matched public guides with bounded concurrency; errors never become accepted imports.
 * @returns {Promise<void>} Completion of this crawl worker.
 */
async function worker() {
  while (cursor < targets.length) {
    const candidate = targets[cursor++];
    try {
      const html = await snapshot(candidate.url);
      verified.push({
        ...candidate,
        sha256: createHash("sha256").update(html).digest("hex"),
        checkedAt: new Date().toISOString(),
        cacheKey: createHash("sha256").update(candidate.url).digest("hex"),
      });
    } catch (error) {
      verified.push({ ...candidate, error: error.message });
    }
    process.stdout.write(`Checked ${verified.length}/${targets.length} matched guides\n`);
  }
}
await Promise.all(Array.from({ length: 4 }, () => worker()));
await writeFile(`${directory}/checked-pages.json`, JSON.stringify(verified, null, 2));
process.stdout.write(
  "Discovery only: inspect actual titles, variants and video frames before accepting any enrichment.\n",
);

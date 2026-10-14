import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
const [, , INPUT_DIRECTORY] = process.argv;
const ENGLISH_LANGUAGE_ID = 2;
const PUBLIC_DOMAIN_LICENSE_ID = 3;
const SHARE_ALIKE_FOUR_LICENSE_ID = 2;
const LICENSE_IDS = new Set([1, SHARE_ALIKE_FOUR_LICENSE_ID, PUBLIC_DOMAIN_LICENSE_ID]);
const NORMALIZED_MUSCLES = {
  abs: "abdominals",
  core: "abdominals",
  "abs / core": "abdominals",
  waist: "abdominals",
  "rectus abdominis": "abdominals",
  "rectus abdominis (lower)": "abdominals",
  obliques: "abdominals",
  "lower rectus abdominis": "abdominals",
  quads: "quadriceps",
  "legs – quads": "quadriceps",
  "legs – hamstrings": "hamstrings",
  pectorals: "chest",
  "pectoralis major": "chest",
  "upper pectorals": "chest",
  delts: "shoulders",
  deltoids: "shoulders",
  "anterior deltoid": "shoulders",
  "posterior deltoid": "shoulders",
  "rear deltoids": "shoulders",
  "latissimus dorsi": "lats",
  "biceps brachii": "biceps",
  "gluteus medius": "glutes",
  "gluteus maximus": "glutes",
  "gastrocnemius (calves)": "calves",
  "erector spinae": "lower back",
  "spinal erectors": "lower back",
  erectors: "lower back",
  spine: "lower back",
  "upper back": "middle back",
  rhomboids: "middle back",
  "back (full)": "back",
  "forearms (front)": "forearms",
};
const NORMALIZED_EQUIPMENT = {
  "body weight": "body only",
  bodyweight: "body only",
  "none (bodyweight exercise)": "body only",
  kettlebell: "kettlebells",
  band: "bands",
  "resistance band": "bands",
  "leverage machine": "machine",
  "stability ball": "exercise ball",
  "bench (flat)": "bench",
  "incline bench": "incline bench",
};
const SOURCE_DEFINITIONS = {
  hasan: {
    name: "Hasan Yıldırım Exercise Dataset",
    url: "https://github.com/hasaneyldrm/exercises-dataset",
    attribution: "Copyright (c) 2026 Hasan Emir Yıldırım",
    license: "MIT",
    licenseUrl: "https://github.com/hasaneyldrm/exercises-dataset/blob/main/LICENSE",
  },
  glow: {
    name: "Glowupp Open ExerciseDB",
    url: "https://github.com/Glowupp-app/open-exercisedb",
    attribution: "Copyright (c) 2026 Glowupp-app",
    license: "MIT",
    licenseUrl: "https://github.com/Glowupp-app/open-exercisedb/blob/main/LICENSE",
  },
  kinetic: {
    name: "Kinetic Place Exercise Database",
    url: "https://github.com/kinetic-place/exercises-db",
    attribution: "Copyright (c) 2026 Kinetic.place",
    license: "MIT",
    licenseUrl: "https://github.com/kinetic-place/exercises-db/blob/main/LICENSE",
  },
  zenith: {
    name: "Arham Wani Exercise Metadata",
    url: "https://github.com/luisaraujoc/free-exercise-db-api",
    attribution: "Copyright (c) 2026 Arham Wani · source metadata is generated and curated",
    license: "MIT",
    licenseUrl: "https://github.com/luisaraujoc/free-exercise-db-api/blob/main/LICENSE",
  },
};
/** Reads an explicitly supplied source snapshot; nothing is fetched by application runtime.
 * @param {string} name - Snapshot basename.
 * @returns {Promise<object>} Parsed source.
 */
async function readSnapshot(name) {
  return JSON.parse(await readFile(join(INPUT_DIRECTORY, `${name}.json`), "utf8"));
}
/** Normalizes case, accents and punctuation for conservative name-based duplicate suppression.
 * @param {string} value - Exercise name.
 * @returns {string} Comparable name.
 */
function normalizeName(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
/** Cleans plain guidance text after trusted source HTML tags are removed; React renders text only.
 * @param {string} value - Description text.
 * @returns {string} Readable text.
 */
function cleanText(value = "") {
  return String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(?:p|li|div)>|<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]+/g, " ")
    .trim();
}
/** Maps supplied anatomical labels into existing broad filter groups, without inferring missing anatomy.
 * @param {string[]} groups - Explicit source labels.
 * @returns {string[]} Filterable muscle names.
 */
function normalizeMuscles(groups = []) {
  return [
    ...new Set(
      groups
        .map((group) => String(group).toLowerCase().replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .map((group) => NORMALIZED_MUSCLES[group] ?? group),
    ),
  ];
}
/** Normalizes familiar equipment labels while retaining uncommon supplied equipment.
 * @param {string} value - Supplied equipment.
 * @returns {string} Canonical filter label.
 */
function normalizeEquipment(value = "unspecified") {
  const equipment = value.toLowerCase().trim();
  return NORMALIZED_EQUIPMENT[equipment] ?? equipment;
}
/** Converts one metadata snapshot entry into the shared catalog contract; restricted media are excluded.
 * @param {string} sourceName - Source key.
 * @param {object} entry - Source record.
 * @returns {object} Normalized exercise.
 */
function convertMetadata(sourceName, entry) {
  const groups = entry.muscleGroups ?? [];
  const instructions =
    sourceName === "hasan"
      ? (entry.instruction_steps?.en ?? [entry.instructions?.en ?? ""])
      : sourceName === "glow"
        ? [entry.description, ...(entry.execution_tips ?? [])]
        : sourceName === "zenith"
          ? (entry.steps ?? [entry.instructions])
          : entry.instructions;
  const equipment = Array.isArray(entry.equipment)
    ? entry.equipment.map((item) => normalizeEquipment(typeof item === "string" ? item : item.name)).join(" + ")
    : normalizeEquipment(entry.equipment);
  return {
    id: `${sourceName}:${entry.id}`,
    name: entry.name.replaceAll("_", " "),
    level: entry.difficultyLevel ?? (typeof entry.difficulty === "string" ? entry.difficulty : "unspecified"),
    equipment,
    category: entry.category ?? "unspecified",
    primaryMuscles: normalizeMuscles(
      groups.length
        ? groups.filter((group) => group.type === "primary").map((group) => group.name)
        : [entry.target ?? entry.primary_muscle ?? "unspecified"],
    ),
    secondaryMuscles: normalizeMuscles(
      groups.length
        ? groups.filter((group) => group.type === "secondary").map((group) => group.name)
        : (entry.secondaryMuscles ?? entry.secondary_muscles ?? []),
    ),
    instructions: (instructions ?? []).map(cleanText).filter(Boolean),
    images: [],
    ...(entry.mechanics ? { mechanic: entry.mechanics } : {}),
    aliases: entry.aliases ?? [],
    source: {
      ...SOURCE_DEFINITIONS[sourceName],
      changes:
        "Display names, muscle/equipment labels and text formatting normalized. " +
        "Source instructions retained. No source media copied.",
    },
  };
}
if (!INPUT_DIRECTORY) {
  throw new Error("Supply the directory containing verified licensed source snapshots.");
}
const original = JSON.parse(await readFile("shared/exercises.json", "utf8")).filter(
  (exercise) => !exercise.source || exercise.source.name === "Free Exercise DB",
);
const merged = [...original];
const names = new Set(merged.map((exercise) => normalizeName(exercise.name)));
const report = {
  originalCount: original.length,
  importedCounts: {},
  skipped: {},
  snapshots: {},
  wgerAttribution: {},
  assets: [],
};
const wger = await readSnapshot("wger");
const licenses = new Map((await readSnapshot("wger-licenses")).results.map((license) => [license.id, license]));
const imageManifest = await readSnapshot("wger-images-manifest");
const videoManifest = await readSnapshot("wger-attributed-videos");
await mkdir("frontend/public/exercises/wger", { recursive: true });
/** Adds only named, described, unique records and keeps source-level accounting.
 * @param {string} sourceName - Import source.
 * @param {object} exercise - Candidate content.
 * @returns {boolean} Whether the candidate was appended.
 */
function appendExercise(sourceName, exercise) {
  report.importedCounts[sourceName] ??= 0;
  const key = normalizeName(exercise.name);
  if (!key || !exercise.instructions.some((step) => /\p{L}{2}/u.test(step)) || names.has(key)) {
    report.skipped[sourceName] = (report.skipped[sourceName] ?? 0) + 1;
    return false;
  }
  names.add(key);
  merged.push(exercise);
  report.importedCounts[sourceName] += 1;
  return true;
}
for (const entry of wger.results) {
  const text = entry.translations.find((translation) => translation.language === ENGLISH_LANGUAGE_ID);
  if (!text || !LICENSE_IDS.has(text.license)) {
    continue;
  }
  const license = licenses.get(text.license);
  const authors = [...new Set([text.license_author, ...(text.author_history ?? [])].filter(Boolean))];
  if (!authors.length && text.license !== PUBLIC_DOMAIN_LICENSE_ID) {
    report.skipped.wgerMissingAttribution = (report.skipped.wgerMissingAttribution ?? 0) + 1;
    continue;
  }
  const exercise = {
    id: `wger:${entry.id}`,
    name: cleanText(text.name),
    level: "unspecified",
    equipment: entry.equipment.length
      ? entry.equipment.map((item) => normalizeEquipment(item.name)).join(" + ")
      : "unspecified",
    primaryMuscles: normalizeMuscles(entry.muscles.map((muscle) => muscle.name_en || muscle.name)),
    secondaryMuscles: normalizeMuscles(entry.muscles_secondary.map((muscle) => muscle.name_en || muscle.name)),
    category: entry.category.name.toLowerCase(),
    aliases: text.aliases.filter((alias) => typeof alias === "string"),
    instructions: cleanText(text.description)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    images: [],
    source: {
      name: "wger Community Exercise Catalog",
      url: `https://wger.de/api/v2/exerciseinfo/${entry.id}/`,
      license: license.short_name,
      licenseUrl: license.url.replace(/^http:/, "https:"),
      attribution: [
        authors.join(", "),
        text.license_title,
        text.license_author_url,
        text.license_object_url,
        text.license_derivative_source_url,
      ]
        .filter(Boolean)
        .join(" · "),
      changes:
        "English translation retained; HTML removed and muscle/equipment labels normalized. " +
        "ShareAlike license preserved.",
    },
  };
  if (!appendExercise("wger", exercise)) {
    continue;
  }
  report.wgerAttribution[exercise.id] = text;
  const hashes = new Set();
  const assets = Object.values(imageManifest)
    .filter((asset) => asset.exerciseId === entry.id && !asset.isAiGenerated)
    .sort((first, second) => Number(second.isMain) - Number(first.isMain) || first.assetId - second.assetId);
  for (const asset of assets) {
    if (hashes.has(asset.sha256)) {
      continue;
    }
    hashes.add(asset.sha256);
    const filename = basename(asset.localPath);
    const localUrl = `/exercises/wger/${filename}`;
    await copyFile(asset.localPath, `frontend/public${localUrl}`);
    exercise.images.push(localUrl);
    exercise.media ??= [];
    exercise.media.push({
      url: localUrl,
      sourceUrl: asset.originalUrl,
      author: asset.author,
      license: asset.license,
      licenseUrl: asset.licenseUrl,
      ...(asset.frameCount > 1
        ? { frameCount: asset.frameCount, stillUrl: localUrl.replace(".webp", "-still.webp") }
        : {}),
    });
    if (asset.frameCount > 1) {
      const posterFilename = filename.replace(".webp", "-still.webp");
      await copyFile(
        join(INPUT_DIRECTORY, "wger-images", posterFilename),
        `frontend/public/exercises/wger/${posterFilename}`,
      );
    }
    report.assets.push({ ...asset, localPath: localUrl });
  }
  const videos = videoManifest.filter((video) => video.exercise === entry.id);
  if (videos.length) {
    exercise.videos = videos.map(({ asset, license: videoLicense }) => ({
      url: asset.video,
      author: asset.license_author || asset.author_history.join(", "),
      sourceUrl: `https://wger.de/api/v2/video/${asset.id}/`,
      license: videoLicense.short_name,
      licenseUrl: videoLicense.url,
      codec: asset.codec,
    }));
  }
}
for (const sourceName of Object.keys(SOURCE_DEFINITIONS)) {
  for (const entry of await readSnapshot(sourceName)) {
    appendExercise(sourceName, convertMetadata(sourceName, entry));
  }
}
for (const name of ["wger", "wger-licenses", ...Object.keys(SOURCE_DEFINITIONS)]) {
  report.snapshots[name] = createHash("sha256")
    .update(await readFile(join(INPUT_DIRECTORY, `${name}.json`)))
    .digest("hex");
}
report.total = merged.length;
report.withImages = merged.filter((exercise) => exercise.images.length).length;
report.imageCount = merged.reduce((count, exercise) => count + exercise.images.length, 0);
report.videoCount = merged.reduce((count, exercise) => count + (exercise.videos?.length ?? 0), 0);
await writeFile("shared/exercises.json", JSON.stringify(merged));
await copyFile("shared/exercises.json", "frontend/public/exercises.json");
await writeFile("docs/catalog-provenance.json", JSON.stringify(report, null, "  "));
process.stdout.write(
  JSON.stringify({
    total: report.total,
    imported: report.importedCounts,
    withImages: report.withImages,
    images: report.imageCount,
    videos: report.videoCount,
    skipped: report.skipped,
  }) + "\n",
);

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { getExerciseNameKey } from "../shared/exerciseIdentity.ts";
const [, , inputDirectory] = process.argv;
const MINIMUM_GUIDANCE_CHARACTERS = 60;
const catalog = JSON.parse(await readFile("shared/exercises.json", "utf8"));
const knownIds = new Set(
  [...catalog, ...JSON.parse(await readFile("shared/retiredExercises.json", "utf8"))].map((exercise) => exercise.id),
);
const nameKeys = new Set(catalog.map((exercise) => getExerciseNameKey(exercise.name)));
const equipmentNames = {
  barbell: "barbell",
  dumbbells: "dumbbell",
  cable: "cable",
  kettlebell: "kettlebells",
  bodyweight: "body only",
  resistance_band: "bands",
  exercise_ball: "exercise ball",
  core_sliders: "core sliders",
  ab_wheel: "ab wheel",
};
const muscles = {
  rectus_abdominis: "abdominals",
  transverse_abdominis: "abdominals",
  obliques: "abdominals",
  latissimus_dorsi: "lats",
  rhomboids: "middle back",
  biceps_brachii: "biceps",
  posterior_deltoid: "shoulders",
  anterior_deltoid: "shoulders",
  lateral_deltoid: "shoulders",
  pectoralis_major: "chest",
  trapezius: "traps",
  quadriceps: "quadriceps",
  gluteus_maximus: "glutes",
  gluteus_medius: "glutes",
  gastrocnemius: "calves",
};
const report = {
  sources: JSON.parse(await readFile(`${inputDirectory}/verified-candidates.json`, "utf8")),
  added: {},
  skipped: {},
  previousVisible: catalog.length,
};
/** Appends a described exercise only when its conservative movement key is new.
 * @param {string} source - Dataset name.
 * @param {object} exercise - Normalized catalog content.
 * @returns {void} Appends a unique reference or counts an exclusion.
 */
function append(source, exercise) {
  const key = getExerciseNameKey(exercise.name);
  if (
    !key ||
    nameKeys.has(key) ||
    knownIds.has(exercise.id) ||
    exercise.instructions.join(" ").length < MINIMUM_GUIDANCE_CHARACTERS ||
    exercise.instructions.some((step) => /^(?:see|same as)\b/i.test(step))
  ) {
    report.skipped[source] = (report.skipped[source] ?? 0) + 1;
    return;
  }
  nameKeys.add(key);
  catalog.push(exercise);
  report.added[source] = (report.added[source] ?? 0) + 1;
}
/** Normalizes only supplied anatomy labels.
 * @param {string[]} values - Original muscle names.
 * @returns {string[]} Filter labels without inferred anatomy.
 */
function muscleLabels(values) {
  return [...new Set(values.map((value) => muscles[value] ?? value.replaceAll("_", " ").toLowerCase()))];
}
const rthepen = JSON.parse(await readFile(`${inputDirectory}/rthepen.json`, "utf8"));
for (const record of rthepen) {
  const equipment = equipmentNames[record.material.id] ?? record.material.name.en.toLowerCase();
  let name = record.exercise_name.en;
  const qualifier = record.material.name.en.replace(/s$/i, "");
  const contextualEquipment = !["bodyweight", "partner", "monkey_bars", "cardio_equipment", "other"].includes(
    record.material.id,
  );
  const containsEquipment =
    name.toLowerCase().includes(qualifier.toLowerCase()) ||
    (record.material.id === "resistance_band" && /band/i.test(name));
  if (contextualEquipment && !containsEquipment) {
    name = `${qualifier} ${name}`;
  }
  append("rthepen", {
    id: `rthepen:${record.id}`,
    name,
    level: record.attributes.difficulty ?? "unspecified",
    equipment,
    category: record.category.en.toLowerCase(),
    mechanic: record.attributes.mechanics,
    primaryMuscles: muscleLabels(record.target_muscles.primary),
    secondaryMuscles: muscleLabels(record.target_muscles.secondary),
    instructions: record.instructions.en,
    images: [],
    aliases: record.aliases ?? [],
    source: {
      name: "rthepen Workout Database",
      license: "MIT",
      attribution: "Copyright (c) 2026 rthepen & Contributors",
      url: "https://github.com/rthepen/workout-database",
      licenseUrl: "https://github.com/rthepen/workout-database/blob/ee61c50da94b60fd94b4a8fd5aefcc0fcaae28f7/LICENSE",
      changes:
        "English guidance retained; explicit source equipment added to ambiguous names; " +
        "supplied anatomy labels normalized.",
    },
  });
}
const everkinetic = JSON.parse(await readFile(`${inputDirectory}/everkinetic.json`, "utf8"));
for (const record of everkinetic) {
  append("everkinetic", {
    id: `everkinetic:${record.id}`,
    name: record.title,
    level: "unspecified",
    equipment: record.equipment.map((value) => (value === "body" ? "body only" : value)).join(" + "),
    category: "strength",
    mechanic: record.type,
    primaryMuscles: muscleLabels(record.primary),
    secondaryMuscles: muscleLabels(record.secondary),
    instructions: record.steps,
    images: [],
    source: {
      name: "Everkinetic Open Exercise Data",
      license: "CC-BY-SA 4.0",
      attribution: "Greg Priday · Everkinetic",
      url: "https://github.com/everkinetic/data",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Source dist guidance retained; labels normalized. Adapted content remains CC-BY-SA 4.0.",
    },
  });
}
report.total = catalog.length;
await writeFile("shared/exercises.json", JSON.stringify(catalog));
await copyFile("shared/exercises.json", "frontend/public/exercises.json");
await writeFile("docs/catalog-expansion-2.3.json", JSON.stringify(report, null, "  "));
process.stdout.write(JSON.stringify({ added: report.added, total: report.total, skipped: report.skipped }) + "\n");

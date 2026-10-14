import type { Exercise } from "./contracts.js";
/** Familiar spelling and plural changes do not create additional movements. */
const WORD_EQUIVALENTS: Record<string, string> = {
  bicep: "biceps",
  tricep: "triceps",
  dumbbells: "dumbbell",
  kettlebells: "kettlebell",
  barbells: "barbell",
  presses: "press",
  rows: "row",
  curls: "curl",
  raises: "raise",
  squats: "squat",
  lunges: "lunge",
  extensions: "extension",
  flyes: "fly",
  flies: "fly",
  dips: "dip",
  deadlifts: "deadlift",
  crunches: "crunch",
  twists: "twist",
  swings: "swing",
  shrugs: "shrug",
  alternating: "alternate",
  calves: "calf",
  hamstrings: "hamstring",
  adductors: "adductor",
  abductors: "abductor",
};
/** These grammatical joiners do not change a named movement's grip, posture or equipment. */
const NAME_JOINERS = new Set(["with", "using", "the", "a", "an", "exercise", "on"]);
/** Computes a conservative movement-name key; positional qualifiers are deliberately retained.
 * @param {string} name - Display name or source alias.
 * @returns {string} Stable canonical name key.
 */
export function getExerciseNameKey(name: string): string {
  const normalized = name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\b(push|pull|sit)[ -]?ups?\b/g, "$1 up")
    .replace(/\b(?:one|single|1)[ -]+(arm|leg)\b/g, "single $1")
    .replace(/\b(dumbbell|barbell|cable) curls?\b/g, "$1 biceps curl")
    .replaceAll("+", " and ");
  const comparable = normalized
    .replace(/\b(?:stability|swiss) ball\b/g, "exercise ball")
    .replace(/\bcable machine\b/g, "cable")
    .replace(/\bsmr\b/g, "foam roll")
    .replace(/\bfoam roller\b/g, "foam roll");
  // Standing ON a dumbbell differs from holding it during a calf raise.
  const hasUnderfootDumbbell = /\bon (?:a |the )?dumbbell\b/.test(normalized);
  const words = (comparable.match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => !NAME_JOINERS.has(word))
    .map((word) => WORD_EQUIVALENTS[word] ?? word);
  if (hasUnderfootDumbbell) {
    words.push("underfoot");
  }
  return (words.includes("to") || words.includes("and") ? words : words.sort()).join(" ");
}
/** Resolves a historical reference without rewriting stored prescriptions or actual sets.
 * @param {Exercise} exercise - Visible canonical record.
 * @param {string} id - Current or retired reference ID.
 * @returns {boolean} Whether the reference belongs to this visible movement.
 */
export function matchesExerciseId(exercise: Exercise, id: string): boolean {
  return exercise.id === id || Boolean(exercise.legacyIds?.includes(id));
}

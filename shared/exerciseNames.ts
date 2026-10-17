const EXERCISE_WORDS: Record<string, string> = {
  bosu: "BOSU",
  trx: "TRX",
  ez: "EZ",
  db: "DB",
  bb: "BB",
  rdl: "RDL",
  smr: "SMR",
  pvc: "PVC",
  hiit: "HIIT",
  emom: "EMOM",
  amrap: "AMRAP",
  yt: "YT",
  ytwl: "YTWL",
  vmo: "VMO",
  tke: "TKE",
  mcgill: "McGill",
  ii: "II",
  iii: "III",
  iv: "IV",
};
/** Capitalizes exercise words while preserving known apparatus and training abbreviations.
 * @param {string} name - Original public reference name.
 * @returns {string} Trimmed readable display name; identifiers and punctuation are unaffected.
 */
export function formatExerciseName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu, (word) => {
      const normalized = word.toLocaleLowerCase("en-GB");
      return EXERCISE_WORDS[normalized] ?? normalized.charAt(0).toLocaleUpperCase("en-GB") + normalized.slice(1);
    });
}

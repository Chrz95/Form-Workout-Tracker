/** Matching weights prefer primary muscle overlap, then equipment and movement metadata. */
export const ALTERNATIVE_RANK = { primaryMuscle: 10, equipment: 3, mechanic: 1, category: 1, limit: 8 } as const;
/** No equipment selection means alternatives may require different equipment. */
export const ANY_EQUIPMENT = "Any equipment";

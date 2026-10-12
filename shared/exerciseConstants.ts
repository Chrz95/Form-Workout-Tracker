/** Reserved owner exercise IDs cannot collide with imported catalog IDs. */
export const CUSTOM_EXERCISE_PREFIX = "custom_";
/** Supported owner-entered classification choices. */
export const EXERCISE_LEVELS = ["beginner", "intermediate", "expert", "unspecified"] as const;
/** Limits apply at both the owner editor and HTTP boundary. */
export const EXERCISE_LIMITS = {
  name: 160,
  instruction: 2000,
  instructions: 30,
  muscles: 10,
  imageUrl: 2000,
  editorRows: 6,
} as const;
/** Private authored content is never seeded into the public catalog. */
export const CUSTOM_EXERCISE_SOURCE = { name: "Your custom exercise", license: "Private user content" } as const;
/** Narrow source collections keep catalog reads and owner records distinct. */
export const EXERCISE_PATH = { custom: "/exercises/custom", identifier: "/:id" } as const;

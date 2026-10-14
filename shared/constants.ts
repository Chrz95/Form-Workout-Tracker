/** Standard defaults for editable workout prescriptions. */
export const WORKOUT_DEFAULTS = { sets: 3, reps: 10, weight: 0, duration: 45, pageSize: 12 } as const;
/** HTTP status codes used in the API. */
export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  payloadTooLarge: 413,
  unauthorized: 401,
  notFound: 404,
  conflict: 409,
  tooManyRequests: 429,
  internal: 500,
  unavailable: 503,
} as const;

/** Consistent icon sizes used across the responsive interface. */
export const ICON_SIZE = { miniature: 14, standard: 18, feature: 22, brand: 25, emptyState: 34 } as const;

/** Limits used at both API boundaries. */
export const INPUT_LIMITS = {
  name: 100,
  notes: 2000,
  exercises: 100,
  sets: 30,
  reps: 1000,
  weight: 1000,
  duration: 600,
  rpe: 10,
} as const;

/** Bounds requests so a live session can be retried instead of staying pending forever. */
export const API_REQUEST_DEFAULTS = { timeoutMilliseconds: 30000 } as const;

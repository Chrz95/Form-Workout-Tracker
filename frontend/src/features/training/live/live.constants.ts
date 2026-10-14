/** Operational bounds for the live workout and wall-clock timers. */
export const LIVE_DEFAULTS = {
  restSeconds: 90,
  restOptions: [30, 60, 90, 120, 180],
  maximumRestSeconds: 600,
  tickMilliseconds: 500,
  millisecondsPerSecond: 1000,
  millisecondsPerMinute: 60000,
  secondsPerMinute: 60,
  rpeStep: 0.5,
  weightStep: 0.5,
  minimumDuration: 1,
  timerDigits: 2,
} as const;
/** Explicit phases keep training, review and durable completion separate. */
export const LIVE_PHASE = { training: "training", review: "review", saved: "saved" } as const;
/** Sound shape is intentionally short and optional. */
export const SOUND_DEFAULTS = { frequency: 660, gain: 0.12, durationSeconds: 0.25 } as const;

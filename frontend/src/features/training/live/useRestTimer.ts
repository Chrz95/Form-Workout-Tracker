import { useState } from "react";
import { LIVE_DEFAULTS } from "./live.constants";
import { useClock } from "./useClock";
/** Keeps rest timing correct after a background tab resumes.
 * @returns {object} Adjustable rest timer and its actions.
 */
export function useRestTimer() {
  const [duration, setDuration] = useState<number>(LIVE_DEFAULTS.restSeconds);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [pausedSeconds, setPausedSeconds] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [referenceNow, setReferenceNow] = useState(() => Date.now());
  const now = useClock(deadline !== null);
  const remaining =
    pausedSeconds ??
    (deadline === null
      ? 0
      : Math.max(0, Math.ceil((deadline - Math.max(now, referenceNow)) / LIVE_DEFAULTS.millisecondsPerSecond)));
  /** Starts or resets the configured timer from the actual current time. */
  function startRest() {
    const startedAt = Date.now();
    setReferenceNow(startedAt);
    setDeadline(startedAt + duration * LIVE_DEFAULTS.millisecondsPerSecond);
    setPausedSeconds(null);
    setHasStarted(true);
  }
  /** Freezes the remaining seconds rather than resetting them. */
  function pauseRest() {
    if (deadline !== null) {
      setPausedSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / LIVE_DEFAULTS.millisecondsPerSecond)));
      setDeadline(null);
    }
  }
  /** Continues from the paused remainder. */
  function resumeRest() {
    if (pausedSeconds !== null) {
      const resumedAt = Date.now();
      setReferenceNow(resumedAt);
      setDeadline(resumedAt + pausedSeconds * LIVE_DEFAULTS.millisecondsPerSecond);
      setPausedSeconds(null);
    }
  }
  /** Dismisses the current rest interval. */
  function skipRest() {
    setDeadline(null);
    setPausedSeconds(null);
    setHasStarted(false);
  }
  /** Applies a user-selected duration to the next rest interval.
   * @param {number} seconds - Duration in seconds.
   */
  function changeDuration(seconds: number) {
    if (Number.isFinite(seconds) && seconds > 0 && seconds <= LIVE_DEFAULTS.maximumRestSeconds) {
      setDuration(seconds);
    }
  }
  return {
    duration,
    remaining,
    hasStarted,
    isPaused: pausedSeconds !== null,
    isFinished: hasStarted && remaining === 0,
    startRest,
    pauseRest,
    resumeRest,
    skipRest,
    changeDuration,
  };
}

import { useEffect, useState } from "react";
import { LIVE_DEFAULTS } from "./live.constants";
/** Updates display time while deriving all timer values from wall-clock deadlines.
 * @param {boolean} isRunning - Whether a live display needs updates.
 * @returns {number} Current timestamp in milliseconds.
 */
export function useClock(isRunning: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), LIVE_DEFAULTS.tickMilliseconds);
    return () => window.clearInterval(timer);
  }, [isRunning]);
  return now;
}

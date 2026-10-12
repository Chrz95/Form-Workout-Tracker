import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { useRestTimer } from "./useRestTimer";
import { useTimerSound } from "./useTimerSound";
import { LIVE_DEFAULTS } from "./live.constants";
import { formatTimer } from "./live.utils";
interface RestTimerProps {
  rest: ReturnType<typeof useRestTimer>;
}
/** Renders a deadline-based timer with an optional foreground alert.
 * @param {RestTimerProps} props - Timer controls.
 * @param {object} props.rest - Rest state and actions.
 * @returns {JSX.Element} Rest timer panel.
 */
export function RestTimer({ rest }: RestTimerProps) {
  const sound = useTimerSound(rest.isFinished);
  return (
    <section
      className={`rest-timer ${rest.isFinished ? "finished" : ""}`}
      aria-label="Rest timer"
    >
      <div>
        <span className="eyebrow">{rest.isFinished ? "READY FOR YOUR NEXT SET" : "MAKE SPACE TO RECOVER"}</span>
        <strong aria-label="Rest time remaining">
          {formatTimer(rest.hasStarted ? rest.remaining : rest.duration)}
        </strong>
        <span>
          {rest.isPaused
            ? "Rest paused"
            : rest.isFinished
              ? "Rest finished"
              : rest.hasStarted
                ? "Resting between sets"
                : "Starts when you complete a set"}
        </span>
      </div>
      <div className="rest-settings">
        <label>
          Next rest
          <select
            value={rest.duration}
            onChange={(event) => rest.changeDuration(Number(event.target.value))}
          >
            {LIVE_DEFAULTS.restOptions.map((seconds) => (
              <option
                key={seconds}
                value={seconds}
              >
                {formatTimer(seconds)}
              </option>
            ))}
          </select>
        </label>
        <div className="rest-buttons">
          <button
            className="icon-button"
            aria-label="Restart rest timer"
            onClick={rest.startRest}
          >
            <RotateCcw size={ICON_SIZE.standard} />
          </button>
          <button
            className="icon-button"
            aria-label={rest.isPaused ? "Resume rest timer" : "Pause rest timer"}
            disabled={!rest.hasStarted || rest.isFinished}
            onClick={rest.isPaused ? rest.resumeRest : rest.pauseRest}
          >
            {rest.isPaused ? <Play size={ICON_SIZE.standard} /> : <Pause size={ICON_SIZE.standard} />}
          </button>
          <button
            className="text-button"
            onClick={rest.skipRest}
          >
            Skip
          </button>
          <button
            className="icon-button"
            aria-label="Toggle rest alert sound"
            aria-pressed={sound.isSoundEnabled}
            onClick={() => void sound.toggleSound()}
          >
            {sound.isSoundEnabled ? <Volume2 size={ICON_SIZE.standard} /> : <VolumeX size={ICON_SIZE.standard} />}
          </button>
        </div>
        {sound.soundError && <small>{sound.soundError}</small>}
      </div>
      {rest.isFinished && (
        <output className="rest-finished-message">Rest complete. Your next set is ready when you are.</output>
      )}
    </section>
  );
}

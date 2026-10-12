import { useEffect, useRef, useState } from "react";
import { SOUND_DEFAULTS } from "./live.constants";
/** Provides an optional foreground sound initialized by a user gesture.
 * @param {boolean} isFinished - Whether the rest deadline has elapsed.
 * @returns {object} Sound preference and toggle action.
 */
export function useTimerSound(isFinished: boolean) {
  const context = useRef<AudioContext | null>(null);
  const hasAlerted = useRef(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [soundError, setSoundError] = useState("");
  /** Enables a browser audio context without requesting system notification permissions.
   * @returns {Promise<void>} User audio interaction.
   */
  async function toggleSound() {
    if (isSoundEnabled) {
      setIsSoundEnabled(false);
      return;
    }
    try {
      if (!context.current) {
        context.current = new AudioContext();
      }
      await context.current.resume();
      setSoundError("");
      setIsSoundEnabled(true);
    } catch {
      setSoundError("Sound is unavailable in this browser.");
    }
  }
  useEffect(() => {
    if (!isFinished) {
      hasAlerted.current = false;
      return;
    }
    if (hasAlerted.current || !isSoundEnabled || !context.current) {
      return;
    }
    hasAlerted.current = true;
    const audio = context.current;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = SOUND_DEFAULTS.frequency;
    gain.gain.value = SOUND_DEFAULTS.gain;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + SOUND_DEFAULTS.durationSeconds);
  }, [isFinished, isSoundEnabled]);
  useEffect(
    () => () => {
      void context.current?.close();
    },
    [],
  );
  return { isSoundEnabled, soundError, toggleSound };
}

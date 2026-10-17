import type { StudioProps } from "../../app/useStudio";
/** Reports automatic recovery while retaining manual setup for separately hosted APIs.
 * @param {StudioProps} props - Connection model.
 * @param {Studio} props.studio - Connection state and retry action.
 * @returns {JSX.Element | null} Startup or unavailable-server notice.
 */
export function ConnectionBanner({ studio }: StudioProps) {
  if (studio.isConnected) {
    return null;
  }
  return (
    <div
      className="preview-notice"
      aria-live="polite"
    >
      <span className="status-dot" />
      {studio.isAutomaticConnection ? (
        <>
          {studio.isAutomaticallyConnecting
            ? "Connecting to your workout server…"
            : studio.apiError ||
              "Your workout server is unavailable. Reconnecting automatically. Your draft stays here."}
          <button
            onClick={studio.retryAutomaticConnection}
            disabled={studio.isAutomaticallyConnecting}
          >
            Retry now
          </button>
        </>
      ) : (
        <>
          Connect your training server to save routines and history.
          <button onClick={() => studio.setIsConnectionOpen(true)}>
            Connect <span>↗</span>
          </button>
        </>
      )}
    </div>
  );
}

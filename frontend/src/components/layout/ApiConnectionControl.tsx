import { Cloud } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import type { StudioProps } from "../../app/useStudio";
/** Shows managed server status or connection settings for an explicitly remote API.
 * @param {StudioProps} props - Connection model.
 * @param {Studio} props.studio - Server status and manual settings action.
 * @returns {JSX.Element} Sidebar connection status.
 */
export function ApiConnectionControl({ studio }: StudioProps) {
  if (studio.isAutomaticConnection) {
    return (
      <div
        className="connection-button"
        role="status"
      >
        <Cloud size={ICON_SIZE.standard} />
        <span>
          {studio.isConnected
            ? "Training connected"
            : studio.isAutomaticallyConnecting
              ? "Connecting…"
              : "Sync unavailable"}
          <small>{studio.isConnected ? "Ready to save your training" : "Reconnecting automatically"}</small>
        </span>
        <span className={`status-dot ${studio.isConnected ? "online" : ""}`} />
      </div>
    );
  }
  return (
    <button
      className="connection-button"
      onClick={() => studio.setIsConnectionOpen(true)}
    >
      <Cloud size={ICON_SIZE.standard} />
      <span>
        {studio.isConnected ? "Training connected" : "Connect training"}
        <small>{studio.isConnected ? "Ready to save your training" : "Save workouts and history"}</small>
      </span>
      <span className={`status-dot ${studio.isConnected ? "online" : ""}`} />
    </button>
  );
}

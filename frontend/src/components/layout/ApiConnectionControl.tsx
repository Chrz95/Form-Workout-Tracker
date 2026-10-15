import { PlugZap } from "lucide-react";
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
        <PlugZap size={ICON_SIZE.standard} />
        <span>
          {studio.isConnected
            ? "Backend connected"
            : studio.isAutomaticallyConnecting
              ? "Connecting…"
              : "Waiting for backend"}
          <small>{studio.isConnected ? "PostgreSQL sync enabled" : "Connection is automatic"}</small>
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
      <PlugZap size={ICON_SIZE.standard} />
      <span>
        {studio.isConnected ? "API connected" : "Connect workout API"}
        <small>{studio.isConnected ? "PostgreSQL sync enabled" : "Enable saving & sync"}</small>
      </span>
      <span className={`status-dot ${studio.isConnected ? "online" : ""}`} />
    </button>
  );
}

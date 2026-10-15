import type { ReactNode } from "react";
import type { StudioProps } from "../../app/useStudio";
/** Connection notice properties. */
interface TrainingConnectionNoticeProps extends StudioProps {
  /** Existing instructions for a separately hosted API. */
  children: ReactNode;
}
/** Preserves drafts while managed servers connect without requesting credentials.
 * @param {TrainingConnectionNoticeProps} props - Status and remote-mode instructions.
 * @param {Studio} props.studio - Connection state.
 * @param {ReactNode} props.children - Manual connection instructions.
 * @returns {JSX.Element} Feature connection notice.
 */
export function TrainingConnectionNotice({ studio, children }: TrainingConnectionNoticeProps) {
  return (
    <p className="connection-notice">
      {studio.isAutomaticConnection
        ? studio.isConnected
          ? "Update your workout server to enable this feature."
          : "Your draft stays here while the app connects to your workout server automatically."
        : children}
    </p>
  );
}

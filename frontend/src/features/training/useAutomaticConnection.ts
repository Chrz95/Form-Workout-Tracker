import { useEffect, useRef, useState } from "react";
import type { ApiConnection } from "../../lib/api/client";
/** Delay between failed read-only connection attempts; writes are never replayed. */
export const AUTOMATIC_CONNECTION_RETRY_MILLISECONDS = 5000;
/** Connects to the private same-origin proxy on startup and after temporary failures.
 * @param {ApiConnection} connection - Current server configuration.
 * @param {boolean} isConnected - Whether records were successfully loaded.
 * @param {(connection: ApiConnection) => Promise<boolean>} connect - Verifies and loads server records.
 * @returns {object} Connection status and an optional immediate retry action.
 */
export function useAutomaticConnection(
  connection: ApiConnection,
  isConnected: boolean,
  connect: (connection: ApiConnection) => Promise<boolean>,
) {
  const connectRef = useRef(connect);
  connectRef.current = connect;
  const inFlight = useRef<Promise<boolean> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [revision, setRevision] = useState(0);
  const isAutomaticConnection = connection.authentication === "proxy" && Boolean(connection.baseUrl);
  useEffect(() => {
    if (!isAutomaticConnection || isConnected) {
      return;
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** Reuses an active startup probe and schedules recovery only while mounted.
     * @returns {Promise<void>} One connection attempt, without retrying any write.
     */
    async function attemptConnection() {
      setIsConnecting(true);
      const attempt = inFlight.current ?? connectRef.current(connection);
      inFlight.current = attempt;
      const connected = await attempt.catch(() => false);
      if (inFlight.current === attempt) {
        inFlight.current = null;
      }
      if (stopped) {
        return;
      }
      setIsConnecting(false);
      if (!connected) {
        timer = setTimeout(() => void attemptConnection(), AUTOMATIC_CONNECTION_RETRY_MILLISECONDS);
      }
    }
    void attemptConnection();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [connection, isAutomaticConnection, isConnected, revision]);
  /** Requests an immediate connection check after a network restoration or user retry. */
  function retryAutomaticConnection() {
    setRevision((previous) => previous + 1);
  }
  useEffect(() => {
    window.addEventListener("online", retryAutomaticConnection);
    return () => window.removeEventListener("online", retryAutomaticConnection);
  }, []);
  return {
    isAutomaticConnection,
    isAutomaticallyConnecting: isAutomaticConnection && !isConnected && isConnecting,
    retryAutomaticConnection,
  };
}

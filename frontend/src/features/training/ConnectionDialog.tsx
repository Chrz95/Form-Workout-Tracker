import { ICON_SIZE } from "../../../../shared/constants";
import { useState, type FormEvent } from "react";
import { PlugZap, ArrowUpRight } from "lucide-react";
import { z } from "zod";
import type { StudioProps } from "../../app/useStudio";
import { Modal } from "../../components/ui/Modal";
/** Connects the PWA to the supplied single-user Express/PostgreSQL server.
 * @param {StudioProps} props - Connection model.
 * @param {Studio} props.studio - Server state and connect action.
 * @returns {JSX.Element} Connection settings.
 */
export function ConnectionDialog({ studio }: StudioProps) {
  const [baseUrl, setBaseUrl] = useState(studio.connection.baseUrl);
  const [token, setToken] = useState(studio.connection.token);
  const [error, setError] = useState("");
  /** Validates credentials and verifies the API before closing.
   * @param {FormEvent<HTMLFormElement>} event - Submit event.
   * @returns {Promise<void>} Connection completion.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = z.url().safeParse(baseUrl);
    if (!validated.success) {
      setError("Enter a full API URL, such as https://your-server.example/api/v1.");
      return;
    }
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      setError("Use an HTTPS API URL for a remote server.");
      return;
    }
    setError("");
    if (await studio.connectApi({ baseUrl, token })) {
      studio.setIsConnectionOpen(false);
    }
  }
  return (
    <Modal
      title="Keep your training connected"
      onClose={() => studio.setIsConnectionOpen(false)}
    >
      <p className="modal-description">
        This preview includes the complete exercise library. Saving routines and journal entries requires the supplied
        Express API with PostgreSQL.
      </p>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Workout API URL
          <input
            type="url"
            required
            placeholder="https://your-server.example/api/v1"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
          />
        </label>
        <label className="field-label">
          Private API access token
          <input
            type="password"
            required
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        <p className="connection-notice">
          Credentials stay in memory for this tab. No workout data is stored in browser storage. The API owns your saved
          records.
        </p>
        {(error || studio.apiError) && (
          <p
            className="form-error"
            role="alert"
          >
            {error || studio.apiError}
          </p>
        )}
        <div className="modal-actions">
          <a
            className="text-button"
            href="/setup.html"
            target="_blank"
            rel="noreferrer"
          >
            Server setup <ArrowUpRight size={ICON_SIZE.miniature} />
          </a>
          <button
            className="button primary"
            type="submit"
            disabled={studio.isPending}
          >
            <PlugZap size={ICON_SIZE.standard} />
            {studio.isPending ? "Connecting…" : "Connect API"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import type { Studio } from "../../../app/useStudio";
import type { ImportInput } from "../../../../../shared/importContracts";
interface ImportActionsProps {
  studio: Studio;
  input: ImportInput | undefined;
  blocked: boolean;
  onClose: () => void;
}
/** Confirms only a reviewed, unblocked batch on a compatible connected server.
 * @param {ImportActionsProps} props - Review readiness and persistence.
 * @param {Studio} props.studio - Server actions and pending state.
 * @param {ImportInput | undefined} props.input - Reviewed file.
 * @param {boolean} props.blocked - Reading or validation failure.
 * @param {() => void} props.onClose - Dismiss callback.
 * @returns {JSX.Element} Commit and cancel actions.
 */
export function ImportActions({ studio, input, blocked, onClose }: ImportActionsProps) {
  return (
    <div className="modal-actions">
      <button
        className="text-button"
        onClick={onClose}
        disabled={studio.isPending}
      >
        Cancel
      </button>
      <button
        className="button primary"
        disabled={!input || blocked || studio.isPending || !studio.isConnected || !studio.hasImportSupport}
        onClick={async () => {
          if (input && (await studio.persistImport(input))) {
            onClose();
          }
        }}
      >
        {studio.isPending ? "Importing…" : "Confirm import"}
      </button>
    </div>
  );
}

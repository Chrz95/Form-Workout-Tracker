import type { Studio } from "../../../app/useStudio";
import React from "react";
import { Modal } from "../../../components/ui/Modal";
import { TrainingImportReview } from "./TrainingImportReview";
import { reviewImport } from "./reviewImportRecords";
import { useCsvImport } from "./useCsvImport";
import { ImportActions } from "./ImportActions";
interface ImportCsvDialogProps {
  studio: Studio;
  kind: "workouts" | "sessions";
  onClose: () => void;
}
/** Requires a complete review before sending an authenticated atomic transfer.
 * @param {ImportCsvDialogProps} props - Transfer destination and actions.
 * @param {Studio} props.studio - Connected record model.
 * @param {"workouts" | "sessions"} props.kind - Destination collection.
 * @param {() => void} props.onClose - Dismiss action.
 * @returns {JSX.Element} File selection and reviewed confirmation.
 */
export function ImportCsvDialog({ studio, kind, onClose }: ImportCsvDialogProps) {
  const { preview, error, isReading, selectFile } = useCsvImport(kind);
  const saved = kind === "workouts" ? studio.workouts : studio.sessions;
  const blocked = preview && reviewImport(preview.input, saved, studio.exercises).some((row) => row.blocked);
  return (
    <Modal
      title={kind === "workouts" ? "Import your workouts" : "Import your training journal"}
      onClose={onClose}
    >
      <p className="modal-description">
        Choose a Form CSV export. Review every record before saving. Files can contain up to 50 records, 2,000 data rows
        and 1 MiB.
      </p>
      <label className="field-label">
        CSV file
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={studio.isPending}
          onChange={(event) => {
            studio.setApiError("");
            void selectFile(event.target.files?.[0]);
          }}
        />
      </label>
      {isReading && <output>Reading your file…</output>}
      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {preview && (
        <React.Fragment>
          <p>{preview.input.records.length} records ready for review. Expand each record to check its values.</p>
          {preview.legacyText && (
            <p className="connection-notice">
              This older export keeps spreadsheet safety apostrophes as literal text. Check names and notes in the
              review before saving.
            </p>
          )}
          <TrainingImportReview
            input={preview.input}
            studio={studio}
          />
          <p className="connection-notice">
            Unchanged saved IDs are skipped. Conflicting IDs reject the whole file. The server rechecks your review
            against its latest data.
          </p>
        </React.Fragment>
      )}
      {!studio.isConnected || !studio.hasImportSupport ? (
        <p className="connection-notice">Connect your API with CSV import support to save this file.</p>
      ) : null}
      {studio.apiError && (
        <p
          className="form-error"
          role="alert"
        >
          {studio.apiError}
        </p>
      )}
      <ImportActions
        studio={studio}
        input={preview?.input}
        blocked={Boolean(blocked || isReading)}
        onClose={onClose}
      />
    </Modal>
  );
}

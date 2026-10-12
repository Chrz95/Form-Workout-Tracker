import { useState } from "react";
import { Download } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import { createTrainingCsv, downloadCsv, type ExportInput } from "./exportCsv";
import { CSV_FILENAMES } from "./export.constants";
/** Saved records selected for download. */
interface ExportCsvButtonProps {
  /** Discriminated routine or session input; drafts are never passed here. */
  input: ExportInput;
}
/** Downloads the saved records currently shown by the parent screen.
 * @param {ExportCsvButtonProps} props - CSV export model.
 * @param {ExportInput} props.input - Saved records and exercise names.
 * @returns {JSX.Element} Download control with visible failure feedback.
 */
export function ExportCsvButton({ input }: ExportCsvButtonProps) {
  const [errorMessage, setErrorMessage] = useState("");
  /** Starts the download and keeps failures visible to the user.
   * @returns {void} Browser export attempt.
   */
  function handleExport(): void {
    setErrorMessage("");
    try {
      downloadCsv(createTrainingCsv(input), CSV_FILENAMES[input.kind]);
    } catch {
      setErrorMessage("Your browser could not start the download. Try exporting again.");
    }
  }
  return (
    <div>
      <button
        className="button secondary"
        type="button"
        disabled={!input.records.length}
        onClick={handleExport}
      >
        <Download size={ICON_SIZE.standard} />
        Export CSV
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </div>
  );
}

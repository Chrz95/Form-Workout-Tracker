import type { Exercise, Session } from "../../../../shared/contracts";
import { ExportCsvButton } from "./export/ExportCsvButton";
import { ImportCsvButton } from "./import/ImportCsvButton";
import type { Studio } from "../../app/useStudio";
/** Journal filter and export state. */
interface JournalToolbarProps {
  studio: Studio;
  /** Selected ISO calendar date or empty string for all dates. */
  dateFilter: string;
  /** Changes the date selection. */
  onDateFilterChange: (date: string) => void;
  /** Saved sessions remaining after the date filter. */
  sessions: Session[];
  /** Exercise names for export. */
  exercises: Exercise[];
}
/** Filters the journal and exports exactly the visible saved session selection.
 * @param {JournalToolbarProps} props - Filter and saved records.
 * @param {string} props.dateFilter - Current date selection.
 * @param {(date: string) => void} props.onDateFilterChange - Filter callback.
 * @param {Session[]} props.sessions - Visible saved sessions.
 * @param {Exercise[]} props.exercises - Readable catalog names.
 * @param {Studio} props.studio - Transfer actions and all saved records.
 * @returns {JSX.Element} Journal toolbar.
 */
export function JournalToolbar({ dateFilter, onDateFilterChange, sessions, exercises, studio }: JournalToolbarProps) {
  return (
    <div className="section-toolbar">
      <label className="inline-label">
        Filter by date{" "}
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => onDateFilterChange(event.target.value)}
        />
      </label>
      <button
        className="text-button"
        onClick={() => onDateFilterChange("")}
      >
        Show all sessions
      </button>
      <ExportCsvButton input={{ kind: "sessions", records: sessions, exercises }} />
      <ImportCsvButton
        studio={studio}
        kind="sessions"
      />
    </div>
  );
}

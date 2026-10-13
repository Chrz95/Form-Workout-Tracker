import React, { useState } from "react";
import { Upload } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { Studio } from "../../../app/useStudio";
import { ImportCsvDialog } from "./ImportCsvDialog";
interface ImportCsvButtonProps {
  studio: Studio;
  kind: "workouts" | "sessions";
}
/** Opens a reversible local file review independently of API connectivity.
 * @param {ImportCsvButtonProps} props - Destination and saved model.
 * @param {Studio} props.studio - Record actions.
 * @param {"workouts" | "sessions"} props.kind - Transfer collection.
 * @returns {JSX.Element} CSV import action and dialog.
 */
export function ImportCsvButton({ studio, kind }: ImportCsvButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <React.Fragment>
      <button
        className="button secondary"
        disabled={studio.isPending}
        onClick={() => {
          studio.setApiError("");
          setIsOpen(true);
        }}
      >
        <Upload size={ICON_SIZE.standard} />
        Import CSV
      </button>
      {isOpen && (
        <ImportCsvDialog
          studio={studio}
          kind={kind}
          onClose={() => setIsOpen(false)}
        />
      )}
    </React.Fragment>
  );
}

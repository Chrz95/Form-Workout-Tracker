import { useRef, useState } from "react";
import { ZodError } from "zod";
import { IMPORT_LIMITS } from "../../../../../shared/importContracts";
import { readTrainingCsv } from "./importCsv";
/** Keeps file drafts in memory and prevents a late read from replacing a newer selection.
 * @param {"workouts" | "sessions"} kind - Destination collection.
 * @returns {object} Read state and selection action.
 */
export function useCsvImport(kind: "workouts" | "sessions") {
  const [preview, setPreview] = useState<ReturnType<typeof readTrainingCsv> | null>(null);
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const selection = useRef(0);
  /** Reads a bounded local file; no contents are sent during the review stage.
   * @param {File | undefined} file - Selected CSV.
   * @returns {Promise<void>} File reading completion.
   */
  async function selectFile(file: File | undefined): Promise<void> {
    const version = ++selection.current;
    setPreview(null);
    setError("");
    if (!file) {
      setIsReading(false);
      return;
    }
    setIsReading(true);
    try {
      if (file.size > IMPORT_LIMITS.fileBytes) {
        throw new Error("CSV files must be at most 1 MiB.");
      }
      const result = readTrainingCsv(await file.text(), kind);
      if (version === selection.current) {
        setPreview(result);
      }
    } catch (failure) {
      if (version === selection.current) {
        setError(
          failure instanceof ZodError
            ? `Invalid training data: ${failure.issues[0]?.message ?? "Check the CSV values."}`
            : failure instanceof Error
              ? failure.message
              : "The CSV could not be read.",
        );
      }
    } finally {
      if (version === selection.current) {
        setIsReading(false);
      }
    }
  }
  return { preview, error, isReading, selectFile };
}

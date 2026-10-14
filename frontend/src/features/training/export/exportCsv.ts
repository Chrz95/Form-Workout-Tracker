import type { Exercise, Session, Workout } from "../../../../../shared/contracts";
import { CSV_COLUMNS, CSV_FORMAT, CSV_RECORD, CSV_TEXT_ENCODING } from "./export.constants";
/** Allowed CSV value types keep numeric values separate from untrusted text. */
type CsvValue = string | number;
/** Export inputs couple the selected kind with the correct persisted record type. */
export type ExportInput =
  | { kind: "workouts"; records: Workout[]; exercises: Exercise[] }
  | { kind: "sessions"; records: Session[]; exercises: Exercise[] };
/** Quotes CSV cells and prevents untrusted text from becoming spreadsheet formulas.
 * @param {CsvValue} value - Text or a numeric training value.
 * @returns {string} Escaped, quoted CSV cell.
 */
export function escapeCsvCell(value: CsvValue): string {
  const text = String(value);
  const needsProtection =
    typeof value === "string" && (text.startsWith("'") || /^(?:[\s\p{Cc}]*[=+\-@]|[\t\r\n])/u.test(text));
  const safeText = needsProtection ? CSV_FORMAT.formulaPrefix + text : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}
/** Exports only supplied saved records, preserving actual sets and labelling legacy aggregates.
 * @param {ExportInput} input - Saved records, their type and the catalog for readable exercise names.
 * @returns {string} UTF-8 CSV with BOM, stable headers and CRLF rows.
 */
export function createTrainingCsv(input: ExportInput): string {
  const exerciseNames = new Map(
    input.exercises.flatMap((exercise) =>
      [exercise.id, ...(exercise.legacyIds ?? [])].map((id) => [id, exercise.name] as const),
    ),
  );
  const rows: CsvValue[][] = [];
  for (const record of input.records) {
    const session = input.kind === "sessions" ? (record as Session) : undefined;
    const metadata = [
      CSV_RECORD[input.kind],
      record.id,
      record.name,
      session?.date ?? "",
      session?.duration ?? "",
      record.notes,
      record.createdAt,
    ];
    if (!session && "includedWorkoutIds" in record) {
      record.includedWorkoutIds?.forEach((childId, index) =>
        rows.push([
          ...metadata,
          childId,
          input.records.find((entry) => entry.id === childId)?.name ?? "Component workout",
          index + 1,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          CSV_RECORD.reference,
        ]),
      );
    }
    record.items.forEach((item, exerciseIndex) => {
      const exerciseValues = [
        item.exerciseId,
        exerciseNames.get(item.exerciseId) ?? item.exerciseId,
        exerciseIndex + 1,
      ];
      const performedSets = session?.items[exerciseIndex]?.performedSets;
      const plannedSets = !session && "plannedSets" in item ? item.plannedSets : undefined;
      if (plannedSets?.length) {
        plannedSets.forEach((set, index) =>
          rows.push([
            ...metadata,
            ...exerciseValues,
            index + 1,
            "",
            "",
            1,
            set.reps,
            set.weight,
            "",
            CSV_RECORD.planned,
          ]),
        );
      } else if (performedSets?.length) {
        performedSets.forEach((set, setIndex) => {
          rows.push([
            ...metadata,
            ...exerciseValues,
            setIndex + 1,
            set.id,
            set.kind,
            1,
            set.reps,
            set.weight,
            set.rpe ?? "",
            CSV_RECORD.performed,
          ]);
        });
      } else {
        rows.push([
          ...metadata,
          ...exerciseValues,
          "",
          "",
          "",
          item.sets,
          item.reps,
          item.weight,
          "",
          session ? CSV_RECORD.uniform : CSV_RECORD.prescribed,
        ]);
      }
    });
  }
  return (
    CSV_FORMAT.byteOrderMark +
    [CSV_COLUMNS, ...rows.map((row) => [...row, CSV_TEXT_ENCODING])]
      .map((row) => row.map(escapeCsvCell).join(CSV_FORMAT.separator))
      .join(CSV_FORMAT.lineEnding) +
    CSV_FORMAT.lineEnding
  );
}
/** Offers a CSV download and releases the temporary URL after the browser has received it.
 * @param {string} content - Generated CSV content.
 * @param {string} filename - Fixed export filename.
 * @returns {void} Starts the browser's download flow.
 */
export function downloadCsv(content: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: CSV_FORMAT.mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), CSV_FORMAT.revokeDelayInMilliseconds);
  }
}

import { IMPORT_LIMITS } from "../../../../../shared/importContracts";
import { CSV_COLUMNS } from "../export/export.constants";
/** Parses bounded RFC 4180 cells, including quoted newlines and escaped quotes.
 * @param {string} input - UTF-8 decoded file content.
 * @returns {string[][]} Parsed rows, excluding an optional final line ending.
 */
export function parseCsv(input: string): string[][] {
  if (new TextEncoder().encode(input).byteLength > IMPORT_LIMITS.fileBytes) {
    throw new Error("CSV files must be at most 1 MiB.");
  }
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let closed = false;
  /** Appends a bounded row without accepting extra empty records.
   * @returns {void} Row completion.
   */
  function finishRow() {
    row.push(cell);
    rows.push(row);
    if (rows.length > IMPORT_LIMITS.rows + 1) {
      throw new Error("Split the CSV into files with at most 2,000 data rows.");
    }
    row = [];
    cell = "";
    closed = false;
  }
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
        closed = true;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      if (cell || closed) {
        throw new Error("A CSV quote appears inside an unquoted cell.");
      }
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
      closed = false;
      if (row.length >= CSV_COLUMNS.length) {
        throw new Error("The CSV has too many columns.");
      }
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      finishRow();
    } else {
      if (closed) {
        throw new Error("Unexpected text follows a closed CSV quote.");
      }
      cell += character;
    }
    if (cell.length > IMPORT_LIMITS.cell) {
      throw new Error("A CSV cell exceeds the text limit.");
    }
  }
  if (quoted) {
    throw new Error("A CSV quoted cell is unfinished.");
  }
  if (cell || row.length || closed) {
    finishRow();
  }
  return rows;
}

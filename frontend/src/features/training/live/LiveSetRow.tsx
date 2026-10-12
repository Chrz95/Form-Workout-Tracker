import { Check, Trash2 } from "lucide-react";
import { ICON_SIZE } from "../../../../../shared/constants";
import type { PerformedSet } from "../../../../../shared/setContracts";
import type { LiveSet } from "./live.types";
import type { LiveModel } from "./useLiveWorkout";
import { SetValuesFields } from "./SetValuesFields";
interface LiveSetRowProps {
  row: LiveSet;
  position: number;
  previous?: Omit<PerformedSet, "id">;
  exerciseId: string;
  live: LiveModel;
}
/** Presents one actual set with a historical copy action and explicit completion toggle.
 * @param {LiveSetRowProps} props - Row properties.
 * @param {LiveSet} props.row - Current editable set.
 * @param {number} props.position - Zero-based display position.
 * @param {PerformedSet} [props.previous] - Corresponding previous set.
 * @param {string} props.exerciseId - Movement identifier.
 * @param {LiveModel} props.live - Live actions.
 * @returns {JSX.Element} Training row.
 */
export function LiveSetRow({ row, position, previous, exerciseId, live }: LiveSetRowProps) {
  return (
    <fieldset className={`live-set-row ${row.isCompleted ? "completed" : ""}`}>
      <legend className="sr-only">Set {position + 1}</legend>
      <span className="set-number">{position + 1}</span>
      <div className="set-values-wrap">
        <SetValuesFields
          row={row}
          onSetChange={(field, value) => live.updateSet(exerciseId, row.localId, field, value)}
        />
        <button
          className="previous-set"
          type="button"
          disabled={!previous || row.isCompleted}
          onClick={() => live.copyPrevious(exerciseId, row.localId)}
        >
          {previous ? `Last: ${previous.weight} kg × ${previous.reps} · tap to copy` : "No previous values"}
        </button>
      </div>
      <button
        className="set-complete"
        type="button"
        aria-label={`${row.isCompleted ? "Undo" : "Complete"} set ${position + 1}`}
        aria-pressed={row.isCompleted}
        onClick={() => live.toggleSet(exerciseId, row.localId)}
      >
        <Check size={ICON_SIZE.standard} />
      </button>
      <button
        className="icon-button"
        type="button"
        aria-label={`Remove set ${position + 1}`}
        disabled={row.isCompleted}
        onClick={() => live.removeSet(exerciseId, row.localId)}
      >
        <Trash2 size={ICON_SIZE.miniature} />
      </button>
    </fieldset>
  );
}

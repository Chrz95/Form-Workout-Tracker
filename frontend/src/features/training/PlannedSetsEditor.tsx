import { useState } from "react";
import { PlannedSetInput } from "./PlannedSetInput";
import { getPlannedSets, withPlannedSets } from "../../../../shared/prescriptions";
import { INPUT_LIMITS, type WorkoutItem } from "../../../../shared/contracts";
import type { Studio } from "../../app/useStudio";
interface PlannedSetsEditorProps {
  /** Current exercise targets. */
  item: WorkoutItem;
  /** Draft state owner. */
  studio: Studio;
}
/** Edits each ordered target without touching completed history.
 * @param {PlannedSetsEditorProps} props - Prescription and updater.
 * @param {WorkoutItem} props.item - Draft exercise.
 * @param {Studio} props.studio - State owner.
 * @returns {JSX.Element} Per-set fields.
 */
export function PlannedSetsEditor({ item, studio }: PlannedSetsEditorProps) {
  const sets = getPlannedSets(item);
  const [keys, setKeys] = useState(() => sets.map(() => crypto.randomUUID()));
  /** Replaces only this exercise's set targets.
   * @param {typeof sets} next - Updated ordered targets.
   * @param {number} [removedIndex] - Removed row identity.
   */
  function update(next: typeof sets, removedIndex?: number) {
    setKeys((previous) =>
      removedIndex === undefined
        ? [
            ...previous,
            ...Array.from({ length: Math.max(0, next.length - previous.length) }, () => crypto.randomUUID()),
          ]
        : previous.filter((_, position) => position !== removedIndex),
    );
    studio.setDraftItems((previous) =>
      previous.map((entry) => (entry.exerciseId === item.exerciseId ? withPlannedSets(entry, next) : entry)),
    );
  }
  return (
    <details
      className="planned-sets"
      open={Boolean(item.plannedSets)}
    >
      <summary>Individual set targets · {item.sets} sets</summary>
      <div className="planned-set-list">
        {sets.map((set, index) => (
          <div
            className="planned-set-row"
            key={keys[index]}
          >
            <span>Set {index + 1}</span>
            {(["reps", "weight"] as const).map((field) => (
              <PlannedSetInput
                key={field}
                field={field}
                index={index}
                value={set[field]}
                onChange={(value) =>
                  update(sets.map((entry, position) => (position === index ? { ...entry, [field]: value } : entry)))
                }
              />
            ))}
            <button
              type="button"
              className="text-button"
              disabled={sets.length === 1}
              aria-label={`Remove set ${index + 1}`}
              onClick={() =>
                update(
                  sets.filter((_, i) => i !== index),
                  index,
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="text-button"
        disabled={sets.length >= INPUT_LIMITS.sets}
        onClick={() => update([...sets, { ...(sets.at(-1) ?? item) }])}
      >
        + Add set
      </button>
    </details>
  );
}

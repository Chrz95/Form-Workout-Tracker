import type { ImportInput } from "../../../../../shared/importContracts";
import type { Studio } from "../../../app/useStudio";
import { reviewImport } from "./reviewImportRecords";
import { ImportItemReview } from "./ImportItemReview";
interface TrainingImportReviewProps {
  input: ImportInput;
  studio: Studio;
}
/** Shows every transfer value before the user commits the file.
 * @param {TrainingImportReviewProps} props - Validated file and current saved data.
 * @param {ImportInput} props.input - Transfer batch.
 * @param {Studio} props.studio - Connected collections and catalog.
 * @returns {JSX.Element} Expandable record review.
 */
export function TrainingImportReview({ input, studio }: TrainingImportReviewProps) {
  const review = reviewImport(input, input.kind === "workouts" ? studio.workouts : studio.sessions, studio.exercises);
  return (
    <div className="import-records">
      {input.records.map((record, index) => (
        <details key={record.id}>
          <summary>
            <strong>{record.name}</strong> · {review[index]?.detail}
          </summary>
          <p>
            {"date" in record ? `${record.date} · ${record.duration} minutes · ` : ""}
            {record.items.length} direct exercises
          </p>
          <p className="import-notes">{record.notes || "No notes"}</p>
          <small>
            Created: {record.createdAt} · ID: {record.id}
          </small>
          {"includedWorkoutIds" in record && record.includedWorkoutIds?.length ? (
            <p>
              Components in order:{" "}
              {record.includedWorkoutIds
                .map(
                  (id) =>
                    `${
                      input.records.find((entry) => entry.id === id)?.name ??
                      studio.workouts.find((entry) => entry.id === id)?.name ??
                      "Missing workout"
                    } (${id})`,
                )
                .join(" → ")}
            </p>
          ) : null}
          <ul>
            {record.items.map((item) => (
              <ImportItemReview
                key={item.exerciseId}
                item={item}
                studio={studio}
              />
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

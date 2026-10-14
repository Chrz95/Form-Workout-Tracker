import { matchesExerciseId } from "../../../../../shared/exerciseIdentity";
import { useState } from "react";
import type { StudioProps } from "../../../app/useStudio";
import { Modal } from "../../../components/ui/Modal";
import { findAlternatives, substituteDraftExercise } from "./alternatives.utils";
import { ANY_EQUIPMENT } from "./alternatives.constants";
/** Chooses an alternative for an unsaved prescription without changing history or an active workout.
 * @param {StudioProps} props - Draft model.
 * @param {Studio} props.studio - Catalog, selection and close actions.
 * @returns {JSX.Element | null} Replacement dialog.
 */
export function SubstitutionDialog({ studio }: StudioProps) {
  const [equipment, setEquipment] = useState<string>(ANY_EQUIPMENT);
  const [search, setSearch] = useState("");
  const selected = studio.exercises.find((exercise) =>
    matchesExerciseId(exercise, studio.substitutionExerciseId ?? ""),
  );
  if (!selected) {
    return null;
  }
  const matches = findAlternatives(
    selected,
    studio.exercises,
    studio.draftItems.map((item) => item.exerciseId),
    equipment,
    search,
  );
  return (
    <Modal
      title={`Replace ${selected.name}`}
      onClose={() => studio.setSubstitutionExerciseId(null)}
    >
      <p className="modal-description">Keep the prescribed sets and reps. Load resets to 0 kg for your new movement.</p>
      <label className="field-label">
        Equipment available
        <select
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
        >
          <option>{ANY_EQUIPMENT}</option>
          {studio.equipmentOptions.slice(1).map((choice) => (
            <option key={choice}>{choice}</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Find an alternative
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="alternative-list">
        {matches.map((candidate) => (
          <button
            key={candidate.id}
            className="alternative-button"
            onClick={() => {
              studio.setDraftItems((previous) => substituteDraftExercise(previous, selected.id, candidate.id));
              studio.setSubstitutionExerciseId(null);
              studio.setMessage("Draft exercise replaced. Review the new movement and choose its load.");
            }}
          >
            <strong>{candidate.name}</strong>
            <small>
              {candidate.equipment ?? "No equipment"} · {candidate.primaryMuscles.join(", ")}
            </small>
          </button>
        ))}
        {!matches.length && <p>No unused matching movements for these filters.</p>}
      </div>
    </Modal>
  );
}

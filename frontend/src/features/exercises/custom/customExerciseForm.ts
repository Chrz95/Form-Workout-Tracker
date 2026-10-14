import type { Exercise } from "../../../../../shared/contracts";
import type { CustomExerciseInput } from "../../../../../shared/customExerciseContracts";
/** Form text remains editable until shared validation accepts the complete content. */
export interface CustomExerciseDraft {
  name: string;
  level: CustomExerciseInput["level"];
  equipment: string;
  category: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  instructions: string;
  imageUrl: string;
}
/** Copies existing content or creates an empty authored draft.
 * @param {Exercise | null} exercise - Existing custom exercise, if editing.
 * @returns {CustomExerciseDraft} Editable fields.
 */
export function createCustomExerciseDraft(exercise: Exercise | null): CustomExerciseDraft {
  return {
    name: exercise?.name ?? "",
    level: (exercise?.level as CustomExerciseInput["level"]) ?? "unspecified",
    equipment: exercise?.equipment ?? "body only",
    category: exercise?.category ?? "strength",
    primaryMuscles: exercise?.primaryMuscles.join(", ") ?? "",
    secondaryMuscles: exercise?.secondaryMuscles.join(", ") ?? "",
    instructions: exercise?.instructions.join("\n") ?? "",
    imageUrl: exercise?.images[0] ?? "",
  };
}
/** Turns comma-separated groups and newline-separated steps into the HTTP input.
 * @param {CustomExerciseDraft} draft - Editable text fields.
 * @returns {CustomExerciseInput} Candidate content for shared validation.
 */
export function prepareCustomExerciseInput(draft: CustomExerciseDraft): CustomExerciseInput {
  return {
    ...draft,
    equipment: draft.equipment.trim().toLowerCase(),
    category: draft.category.trim().toLowerCase(),
    primaryMuscles: [
      ...new Set(
        draft.primaryMuscles
          .split(",")
          .map((group) => group.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
    secondaryMuscles: [
      ...new Set(
        draft.secondaryMuscles
          .split(",")
          .map((group) => group.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
    instructions: draft.instructions
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean),
    imageUrl: draft.imageUrl.trim(),
  };
}

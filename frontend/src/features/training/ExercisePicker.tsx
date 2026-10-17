import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { ExercisePickerDialog } from "./ExercisePickerDialog";
/** Opens the library above the editor without nesting inputs inside its save form.
 * @param {StudioProps} props - Current workout draft.
 * @param {Studio} props.studio - Catalog and selection actions.
 * @returns {JSX.Element} Floating-dock action and independent modal.
 */
export function ExercisePicker({ studio }: StudioProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="button secondary add-exercises-button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <Plus size={18} /> Add exercises
      </button>
      {isOpen &&
        createPortal(
          <ExercisePickerDialog
            studio={studio}
            onClose={() => setIsOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

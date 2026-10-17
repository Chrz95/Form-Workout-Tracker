import { ICON_SIZE } from "../../../../shared/constants";
import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "lucide-react";
interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isWide?: boolean;
  className?: string;
}
/** Uses a native modal dialog for focus trapping, Escape and background inertness.
 * @param {ModalProps} props - Modal properties.
 * @param {string} props.title - Accessible dialog title.
 * @param {ReactNode} props.children - Dialog content.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {boolean} [props.isWide] - Whether to use the large layout.
 * @param {string} [props.className] - Screen-specific styling.
 * @returns {JSX.Element} Modal dialog.
 */
export function Modal({ title, children, onClose, isWide = false, className = "" }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`modal ${isWide ? "wide" : ""} ${className}`}
      onCancel={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div className="modal-header">
        <span className="eyebrow">FORM · TRAINING STUDIO</span>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={ICON_SIZE.feature} />
        </button>
        <h2
          id={titleId}
          className="modal-title"
        >
          {title}
        </h2>
      </div>
      {children}
    </dialog>
  );
}

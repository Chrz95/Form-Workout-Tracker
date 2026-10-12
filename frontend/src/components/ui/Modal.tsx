import { ICON_SIZE } from "../../../../shared/constants";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isWide?: boolean;
}
/** Uses a native modal dialog for focus trapping, Escape and background inertness.
 * @param {ModalProps} props - Modal properties.
 * @param {string} props.title - Accessible dialog title.
 * @param {ReactNode} props.children - Dialog content.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {boolean} [props.isWide] - Whether to use the large layout.
 * @returns {JSX.Element} Modal dialog.
 */
export function Modal({ title, children, onClose, isWide = false }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`modal ${isWide ? "wide" : ""}`}
      onCancel={onClose}
    >
      <div className="modal-header">
        <span className="eyebrow">FORM / YOUR PERSONAL STUDIO</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={ICON_SIZE.feature} />
        </button>
      </div>
      <h2 className="modal-title">{title}</h2>
      {children}
    </dialog>
  );
}

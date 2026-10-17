import { useEffect, useRef, useState, type ReactNode } from "react";
interface ResponsiveDisclosureProps {
  /** Accessible heading and compact summary. */
  summary: ReactNode;
  /** Content stays mounted so draft values survive closing. */
  children: ReactNode;
  /** Feature styling hook. */
  className?: string;
  /** Desktop expansion policy; phones begin collapsed. */
  desktopOpen?: boolean;
}
const MOBILE_QUERY = "(max-width: 680px)";
/** Keeps secondary content concise on phones and restores desktop expansion when crossing the breakpoint.
 * @param {ResponsiveDisclosureProps} props - Disclosure content and expansion policy.
 * @param {ReactNode} props.summary - Toggle label.
 * @param {ReactNode} props.children - Mounted content.
 * @param {string} [props.className] - Feature class.
 * @param {boolean} [props.desktopOpen] - Initial desktop expansion.
 * @returns {JSX.Element} Keyboard-accessible native disclosure.
 */
export function ResponsiveDisclosure({
  summary,
  children,
  className = "",
  desktopOpen = true,
}: ResponsiveDisclosureProps) {
  const initialDesktopOpen = useRef(desktopOpen);
  const [isOpen, setIsOpen] = useState(() => !window.matchMedia(MOBILE_QUERY).matches && desktopOpen);
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    /** Applies the new viewport's default without resetting state during ordinary draft edits. */
    function resize() {
      setIsOpen(!media.matches && initialDesktopOpen.current);
    }
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  return (
    <details
      className={`responsive-disclosure ${className}`}
      open={isOpen}
      onToggle={(event) => {
        if (event.target === event.currentTarget) setIsOpen(event.currentTarget.open);
      }}
    >
      <summary>{summary}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

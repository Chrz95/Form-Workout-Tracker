import { ICON_SIZE } from "../../../../shared/constants";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
/** Presents installation when supported and a clear Safari fallback.
 * @returns {JSX.Element} Install affordance.
 */
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  useEffect(() => {
    /** Retains the browser's native installation event.
     * @param {Event} event - Browser installation event.
     */
    function handleInstall(event: Event) {
      event.preventDefault();
      if ("prompt" in event && "userChoice" in event) {
        setInstallEvent(event as InstallEvent);
      }
    }
    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);
  /** Opens native installation or platform instructions.
   * @returns {Promise<void>} Installation interaction.
   */
  async function handleInstallClick() {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    } else {
      setIsHelpVisible(!isHelpVisible);
    }
  }
  return (
    <div className="install-area">
      <button
        className="text-button"
        onClick={() => void handleInstallClick()}
      >
        <Download size={ICON_SIZE.miniature} />
        Install Form on your device
      </button>
      {isHelpVisible && (
        <p>
          On iPhone or iPad: tap Share → Add to Home Screen. On Chrome or Edge: use the install icon in the address bar.
          Offline browsing includes the catalog and previously viewed images.
        </p>
      )}
    </div>
  );
}

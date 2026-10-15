import { ThemeControl } from "./ThemeControl";
import { ICON_SIZE } from "../../../../shared/constants";
import { ApiConnectionControl } from "./ApiConnectionControl";
import { Dumbbell, ArrowUpRight } from "lucide-react";
import { StudioNavigation } from "./StudioNavigation";
import type { StudioProps } from "../../app/useStudio";
/** Renders responsive primary navigation and server connection status.
 * @param {StudioProps} props - Navigation model.
 * @param {Studio} props.studio - Studio state and actions.
 * @returns {JSX.Element} Navigation sidebar.
 */
export function Sidebar({ studio }: StudioProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="/"
        aria-label="Form home"
      >
        <span className="brand-symbol">
          <Dumbbell size={ICON_SIZE.brand} />
        </span>
        form<span className="brand-period">.</span>
      </a>
      <div className="workspace-label">YOUR PERSONAL STUDIO</div>
      <StudioNavigation studio={studio} />
      <div className="sidebar-tip">
        <span className="tip-spark">✳</span>
        <h3>A stronger you starts here.</h3>
        <p>
          Small steps. Consistent effort.
          <br />
          Your own kind of progress.
        </p>
        <button onClick={studio.openLogger}>
          Make today count <ArrowUpRight size={ICON_SIZE.standard} />
        </button>
      </div>
      <ApiConnectionControl studio={studio} />
      <ThemeControl />
      <div className="sidebar-footer">
        BUILT AROUND YOU <span>↗</span>
      </div>
    </aside>
  );
}

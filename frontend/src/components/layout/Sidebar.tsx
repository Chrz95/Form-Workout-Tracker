import { ThemeControl } from "./ThemeControl";
import { ICON_SIZE } from "../../../../shared/constants";
import { Dumbbell, LayoutGrid, Layers, CalendarDays, ChartNoAxesCombined, ArrowUpRight, PlugZap } from "lucide-react";
import { PAGE, PAGE_TITLES } from "../../app/app.constants";
import type { StudioProps } from "../../app/useStudio";
const navigation = [
  { page: PAGE.library, icon: LayoutGrid },
  { page: PAGE.workouts, icon: Layers },
  { page: PAGE.journal, icon: CalendarDays },
  { page: PAGE.calendar, icon: CalendarDays },
  { page: PAGE.progress, icon: ChartNoAxesCombined },
];
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
      <nav aria-label="Main navigation">
        {navigation.map(({ page, icon: Icon }) => (
          <button
            key={page}
            className={`nav-item ${studio.page === page ? "active" : ""}`}
            onClick={() => studio.setPage(page)}
            aria-current={studio.page === page ? "page" : undefined}
          >
            <Icon size={ICON_SIZE.standard} />
            <span>{PAGE_TITLES[page]}</span>
            {page === PAGE.workouts && studio.workouts.length > 0 && (
              <span className="nav-count">{studio.workouts.length}</span>
            )}
          </button>
        ))}
      </nav>
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
      <button
        className="connection-button"
        onClick={() => studio.setIsConnectionOpen(true)}
      >
        <PlugZap size={ICON_SIZE.standard} />
        <span>
          {studio.isConnected ? "API connected" : "Connect workout API"}
          <small>{studio.isConnected ? "PostgreSQL sync enabled" : "Enable saving & sync"}</small>
        </span>
        <span className={`status-dot ${studio.isConnected ? "online" : ""}`} />
      </button>
      <ThemeControl />
      <div className="sidebar-footer">
        BUILT AROUND YOU <span>↗</span>
      </div>
    </aside>
  );
}

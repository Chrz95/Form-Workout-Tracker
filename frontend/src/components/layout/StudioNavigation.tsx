import { LayoutGrid, Layers, CalendarDays, ChartNoAxesCombined } from "lucide-react";
import { ICON_SIZE } from "../../../../shared/constants";
import { PAGE, PAGE_TITLES } from "../../app/app.constants";
import type { StudioProps } from "../../app/useStudio";
const navigation = [
  { page: PAGE.library, label: "Library", icon: LayoutGrid },
  { page: PAGE.workouts, label: "Workouts", icon: Layers },
  { page: PAGE.journal, label: "Journal", icon: CalendarDays },
  { page: PAGE.calendar, label: "Calendar", icon: CalendarDays },
  { page: PAGE.progress, label: "Progress", icon: ChartNoAxesCombined },
];
/** Shares the desktop sidebar and reachable mobile bottom navigation.
 * @param {StudioProps} props - Navigation model.
 * @param {Studio} props.studio - Current page and collections.
 * @returns {JSX.Element} Labelled navigation with page focus management.
 */
export function StudioNavigation({ studio }: StudioProps) {
  /** Focuses the new page and returns its heading into view without moving draft state.
   * @param {Studio["page"]} page - Destination screen.
   */
  function navigate(page: typeof studio.page) {
    studio.setPage(page);
    const content = document.getElementById("main-content");
    content?.focus({ preventScroll: true });
    content?.scrollIntoView?.({ block: "start", behavior: "auto" });
  }
  return (
    <nav aria-label="Main navigation">
      {navigation.map(({ page, label, icon: Icon }) => (
        <button
          key={page}
          className={`nav-item ${studio.page === page ? "active" : ""}`}
          onClick={() => navigate(page)}
          aria-label={PAGE_TITLES[page]}
          aria-current={studio.page === page ? "page" : undefined}
        >
          <Icon
            size={ICON_SIZE.standard}
            aria-hidden="true"
          />
          <span className="desktop-nav-label">{PAGE_TITLES[page]}</span>
          <span
            className="mobile-nav-label"
            aria-hidden="true"
          >
            {label}
          </span>
          {page === PAGE.workouts && studio.workouts.length > 0 && (
            <span className="nav-count">{studio.workouts.length}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

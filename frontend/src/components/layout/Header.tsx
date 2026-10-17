import { useState } from "react";
import { ICON_SIZE } from "../../../../shared/constants";
import { Plus, CalendarDays } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { DATE_OPTIONS, PAGE_TITLES, PAGE_DESCRIPTIONS } from "../../app/app.constants";
/** Names the current section and exposes daily logging.
 * @param {StudioProps} props - Header model.
 * @param {Studio} props.studio - Current screen and actions.
 * @returns {JSX.Element} Page header.
 */
export function Header({ studio }: StudioProps) {
  const [today] = useState(() => new Date().toLocaleDateString("en-GB", DATE_OPTIONS));
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">
          TRAINING STUDIO <span className="breadcrumb-divider">/</span> {studio.page}
        </div>
        <h1>{PAGE_TITLES[studio.page]}</h1>
        <p>{PAGE_DESCRIPTIONS[studio.page]}</p>
      </div>
      <div className="header-actions">
        <span className="today-label">
          <CalendarDays size={ICON_SIZE.miniature} />
          {today}
        </span>
        <button
          className="button primary"
          onClick={studio.openLogger}
        >
          <Plus size={ICON_SIZE.standard} />
          Log a workout
        </button>
      </div>
    </header>
  );
}

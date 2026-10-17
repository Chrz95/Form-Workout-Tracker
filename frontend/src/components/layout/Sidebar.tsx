import { ThemeControl } from "./ThemeControl";
import { ApiConnectionControl } from "./ApiConnectionControl";
import { FormBrand } from "./FormBrand";
import { TrainingWeek } from "./TrainingWeek";
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
      <FormBrand />
      <div className="workspace-label">WORKSPACE</div>
      <StudioNavigation studio={studio} />
      <TrainingWeek studio={studio} />
      <div className="sidebar-utilities">
        <ThemeControl />
        <ApiConnectionControl studio={studio} />
      </div>
    </aside>
  );
}

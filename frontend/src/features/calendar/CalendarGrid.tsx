import type { Studio } from "../../app/useStudio";
import { monthDays } from "./calendar.utils";
import { WEEKDAYS } from "./calendar.constants";
/** Calendar selection and saved counts. */
interface CalendarGridProps {
  /** Visible month. */
  month: Date;
  /** Selected ISO day. */
  selectedDate: string;
  /** Date selection. */
  onDateSelect: (date: string) => void;
  /** Saved plans and actual session counts. */
  studio: Studio;
}
/** Shows planned intent and actual journal entries as independently labelled day counts.
 * @param {CalendarGridProps} props - Month state.
 * @param {Date} props.month - Visible month.
 * @param {string} props.selectedDate - Selected date.
 * @param {(date: string) => void} props.onDateSelect - Selection callback.
 * @param {Studio} props.studio - Confirmed data.
 * @returns {JSX.Element} Accessible day buttons.
 */
export function CalendarGrid({ month, selectedDate, onDateSelect, studio }: CalendarGridProps) {
  return (
    <div className="calendar-grid">
      {WEEKDAYS.map((day) => (
        <span
          className="calendar-weekday"
          key={day}
        >
          {day}
        </span>
      ))}
      {monthDays(month).map((day) => {
        const plans = studio.plans.filter((plan) => plan.date === day.date).length;
        const sessions = studio.sessions.filter((session) => session.date === day.date).length;
        return (
          <button
            key={day.date}
            className={[
              "calendar-day",
              day.isCurrentMonth ? "" : "outside",
              selectedDate === day.date ? "selected" : "",
            ].join(" ")}
            aria-label={`${day.date}: ${plans} planned, ${sessions} logged`}
            aria-pressed={selectedDate === day.date}
            onClick={() => onDateSelect(day.date)}
          >
            <strong>{day.number}</strong>
            {plans > 0 && <small>{plans} planned</small>}
            {sessions > 0 && <small className="logged">{sessions} logged</small>}
          </button>
        );
      })}
    </div>
  );
}

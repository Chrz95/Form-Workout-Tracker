import { useState } from "react";
import type { StudioProps } from "../../app/useStudio";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarDay } from "./CalendarDay";
import { localDateKey, shiftMonth } from "./calendar.utils";
/** Composes month navigation and a truthful planned/actual agenda.
 * @param {StudioProps} props - Saved schedule model.
 * @param {Studio} props.studio - Plans and recorded sessions.
 * @returns {JSX.Element} Workout calendar.
 */
export function CalendarPage({ studio }: StudioProps) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  return (
    <section>
      <div className="section-toolbar">
        <button
          className="button secondary"
          aria-label="Previous month"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ←
        </button>
        <h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
        <button
          className="button secondary"
          aria-label="Next month"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          →
        </button>
        <button
          className="text-button"
          onClick={() => {
            setMonth(new Date());
            setSelectedDate(localDateKey(new Date()));
          }}
        >
          Today
        </button>
      </div>
      {!studio.hasCalendarSupport && (
        <p className="connection-notice">Connect an API with calendar support to save plans.</p>
      )}
      <CalendarGrid
        month={month}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        studio={studio}
      />
      <CalendarDay
        studio={studio}
        date={selectedDate}
      />
    </section>
  );
}

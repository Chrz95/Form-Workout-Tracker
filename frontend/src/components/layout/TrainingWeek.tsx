import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { PAGE } from "../../app/app.constants";
import type { StudioProps } from "../../app/useStudio";
import { localDateKey } from "../../features/calendar/calendar.utils";

/** Shows the current local week using confirmed training records only.
 * @param {StudioProps} props - Training history and navigation.
 * @param {Studio} props.studio - Saved sessions and page actions.
 * @returns {JSX.Element} Weekly training summary.
 */
export function TrainingWeek({ studio }: StudioProps) {
  const [today] = useState(() => new Date());
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = localDateKey(date);
    return { date, key, trained: studio.sessions.some((session) => session.date === key) };
  });
  const count = studio.sessions.filter((session) => days.some((day) => day.key === session.date)).length;
  const isKnown = studio.isConnected || studio.sessions.length > 0;
  return (
    <section
      className="training-week"
      aria-label="This week's training"
    >
      <div className="training-week-heading">
        <span>This week</span>
        <span>TRAINING</span>
      </div>
      <p>
        <strong>{isKnown ? count : "—"}</strong> {count === 1 ? "session recorded" : "sessions recorded"}
      </p>
      <div
        className="week-days"
        role="list"
        aria-label="Training days"
      >
        {days.map(({ date, key, trained }) => (
          <span
            key={key}
            role="listitem"
            className={key === localDateKey(today) ? "is-today" : ""}
            aria-label={`${date.toLocaleDateString("en-GB", { weekday: "long" })}: ${
              trained ? "workout recorded" : isKnown ? "no workout recorded" : "awaiting training history"
            }`}
          >
            <small>{date.toLocaleDateString("en-GB", { weekday: "narrow" })}</small>
            <span className={trained ? "trained" : ""}>{trained ? <Check size={12} /> : date.getDate()}</span>
          </span>
        ))}
      </div>
      <button
        className="week-link"
        onClick={() => {
          studio.setPage(PAGE.calendar);
          document.getElementById("main-content")?.focus({ preventScroll: true });
        }}
      >
        View calendar{" "}
        <ArrowUpRight
          size={15}
          aria-hidden="true"
        />
      </button>
    </section>
  );
}

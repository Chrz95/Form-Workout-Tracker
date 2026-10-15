import { CompletedSetList } from "./live/CompletedSetList";
import { JournalToolbar } from "./JournalToolbar";
import { ICON_SIZE } from "../../../../shared/constants";
import { useState } from "react";
import { CalendarDays, Trash2, Plus, Clock } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
/** Groups completed sessions by date and exposes their actual prescriptions.
 * @param {StudioProps} props - Journal model.
 * @param {Studio} props.studio - Saved sessions and actions.
 * @returns {JSX.Element} Training history.
 */
export function JournalPage({ studio }: StudioProps) {
  const [dateFilter, setDateFilter] = useState("");
  const sessions = studio.sessions
    .filter((session) => !dateFilter || session.date === dateFilter)
    .sort((first, second) => second.date.localeCompare(first.date));
  return (
    <section>
      <JournalToolbar
        studio={studio}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        sessions={sessions}
        exercises={studio.exercises}
      />
      {sessions.length === 0 ? (
        <div className="onboarding-empty">
          <span className="empty-icon">
            <CalendarDays size={ICON_SIZE.emptyState} />
          </span>
          <span className="eyebrow">ONE DAY AT A TIME</span>
          <h2>{dateFilter ? "No sessions on this date." : "Your story is still unfolding."}</h2>
          <p>Keep a record of every rep, every session, every small win.</p>
          <button
            className="button primary"
            onClick={studio.openLogger}
          >
            <Plus size={ICON_SIZE.standard} />
            Log a workout
          </button>
          {!studio.isConnected && (
            <small>
              {studio.isAutomaticConnection
                ? "Your saved training loads automatically when the server is ready."
                : "Connect your API to view and save your training history."}
            </small>
          )}
        </div>
      ) : (
        <div className="journal-list">
          {sessions.map((session) => (
            <article
              className="journal-entry"
              key={session.id}
            >
              <div className="journal-date">
                <span>{new Date(`${session.date}T12:00:00`).toLocaleDateString("en-GB", { month: "short" })}</span>
                <strong>{new Date(`${session.date}T12:00:00`).getDate()}</strong>
              </div>
              <div className="journal-content">
                <h2>{session.name}</h2>
                <div className="exercise-meta">
                  <Clock size={ICON_SIZE.miniature} />
                  {session.duration} minutes<span>·</span>
                  {session.items.length} exercises
                </div>
                <CompletedSetList
                  items={session.items}
                  exercises={studio.exercises}
                />
                {session.notes && <p>{session.notes}</p>}
              </div>
              <button
                className="icon-button"
                disabled={studio.isPending}
                aria-label={`Delete session ${session.name}`}
                onClick={() => {
                  if (window.confirm(`Delete “${session.name}” from your journal?`)) {
                    void studio.removeRecord("sessions", session.id);
                  }
                }}
              >
                <Trash2 size={ICON_SIZE.standard} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

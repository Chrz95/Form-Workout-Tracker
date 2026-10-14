import { ExerciseProgress } from "./progress/ExerciseProgress";
import { ICON_SIZE } from "../../../../shared/constants";
import { Activity, Clock, Layers, TrendingUp } from "lucide-react";
import type { StudioProps } from "../../app/useStudio";
import { MINUTES_PER_HOUR } from "../../app/app.constants";
/** Computes honest metrics exclusively from saved sessions.
 * @param {StudioProps} props - Progress model.
 * @param {Studio} props.studio - Persisted training history.
 * @returns {JSX.Element} Progress summary.
 */
export function ProgressPage({ studio }: StudioProps) {
  const minutes = studio.sessions.reduce((total, session) => total + session.duration, 0);
  const sets = studio.sessions.reduce(
    (total, session) => total + session.items.reduce((subtotal, item) => subtotal + item.sets, 0),
    0,
  );
  const days = new Set(studio.sessions.map((session) => session.date)).size;
  const metrics = [
    { title: "Sessions completed", value: studio.sessions.length, unit: "sessions", icon: Activity },
    { title: "Time invested", value: (minutes / MINUTES_PER_HOUR).toFixed(1), unit: "hours", icon: Clock },
    { title: "Sets put in", value: sets, unit: "sets", icon: Layers },
    { title: "Days you showed up", value: days, unit: "training days", icon: TrendingUp },
  ];
  const dates = [...new Set(studio.sessions.map((session) => session.date))].sort().reverse();
  return (
    <section>
      <div className="progress-intro">
        <span className="eyebrow">CONSISTENCY IS YOUR SUPERPOWER</span>
        <h2>
          Progress you can see.
          <br />
          Effort you can feel.
        </h2>
        <p>Your numbers tell a story. This one is yours.</p>
      </div>
      <div className="metrics-grid">
        {metrics.map(({ title, value, unit, icon: Icon }) => (
          <article
            className="metric-card"
            key={title}
          >
            <Icon size={ICON_SIZE.feature} />
            <span>{title}</span>
            <strong>
              {value}
              <small>{unit}</small>
            </strong>
          </article>
        ))}
      </div>
      <ExerciseProgress studio={studio} />
      <section className="activity-panel">
        <h3>Your training days</h3>
        {dates.length ? (
          <div className="activity-days">
            {dates.map((date) => (
              <div key={date}>
                <span>
                  {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <strong>{studio.sessions.filter((session) => session.date === date).length} sessions</strong>
                <small>
                  {studio.sessions
                    .filter((session) => session.date === date)
                    .reduce((total, session) => total + session.duration, 0)}{" "}
                  min
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p>Log your first session to start building your story.</p>
        )}
      </section>
    </section>
  );
}

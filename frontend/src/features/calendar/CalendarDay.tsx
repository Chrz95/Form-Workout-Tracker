import type { StudioProps } from "../../app/useStudio";
import { PAGE } from "../../app/app.constants";
/** Selected day plus server model. */
interface CalendarDayProps extends StudioProps {
  /** Selected ISO day. */
  date: string;
}
/** Displays intentional plans separately from actually saved completions.
 * @param {CalendarDayProps} props - Day model.
 * @param {Studio} props.studio - Plans and routines.
 * @param {string} props.date - Selected calendar date.
 * @returns {JSX.Element} Day agenda.
 */
export function CalendarDay({ studio, date }: CalendarDayProps) {
  const plans = studio.plans.filter((plan) => plan.date === date);
  const sessions = studio.sessions.filter((session) => session.date === date);
  return (
    <section className="calendar-agenda">
      <div className="section-toolbar">
        <h2>{date}</h2>
        <button
          className="button primary"
          onClick={() => studio.setPlanEditor({ date })}
        >
          Plan a workout
        </button>
      </div>
      <h3>Planned workouts</h3>
      {!plans.length && <p>No saved plans for this day.</p>}
      {plans.map((plan) => {
        const workout = studio.workouts.find((entry) => entry.id === plan.workoutId);
        return (
          <article
            className="calendar-plan"
            key={plan.id}
          >
            <strong>{workout?.name ?? plan.name}</strong>
            {!workout && <small>Routine removed · choose another routine to start this plan.</small>}
            <div className="catalog-actions">
              <button
                className="button secondary"
                disabled={!workout}
                onClick={() => {
                  if (workout) {
                    studio.startWorkout(workout);
                  }
                }}
              >
                Start workout
              </button>
              <button
                className="text-button"
                onClick={() => studio.setPlanEditor({ date, plan })}
              >
                Reschedule
              </button>
              <button
                className="text-button"
                disabled={studio.isPending}
                onClick={() => {
                  if (window.confirm(`Cancel the plan for “${plan.name}”? Your journal stays unchanged.`)) {
                    void studio.removePlan(plan.id);
                  }
                }}
              >
                Cancel plan
              </button>
            </div>
          </article>
        );
      })}
      <h3>Logged sessions</h3>
      {sessions.map((session) => (
        <p key={session.id}>
          {session.name} · {session.duration} minutes
        </p>
      ))}
      {!sessions.length && <p>No completed sessions saved for this day.</p>}
      <button
        className="text-button"
        onClick={() => studio.setPage(PAGE.journal)}
      >
        Open training journal
      </button>
    </section>
  );
}

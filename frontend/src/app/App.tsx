import { ActiveWorkoutBanner } from "../features/training/live/ActiveWorkoutBanner";
import { useStudio } from "./useStudio";
import { PAGE } from "./app.constants";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { ExerciseLibrary } from "../features/exercises/ExerciseLibrary";
import { WorkoutsPage } from "../features/training/WorkoutsPage";
import { JournalPage } from "../features/training/JournalPage";
import { ProgressPage } from "../features/training/ProgressPage";
import { InstallPrompt } from "../components/layout/InstallPrompt";
import { StudioDialogs } from "./StudioDialogs";
import { CalendarPage } from "../features/calendar/CalendarPage";
/** Composes the studio screens while hooks own domain state.
 * @returns {JSX.Element} Workout PWA.
 */
export function App() {
  const studio = useStudio();
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to content
      </a>
      <Sidebar studio={studio} />
      <main
        id="main-content"
        className="main-content"
      >
        <Header studio={studio} />
        {!studio.isConnected && (
          <div className="preview-notice">
            <span className="status-dot" />
            Training preview · connect your API to save workouts, history and custom exercises.
            <button onClick={() => studio.setIsConnectionOpen(true)}>
              Connect <span>↗</span>
            </button>
          </div>
        )}
        <ActiveWorkoutBanner studio={studio} />
        {studio.page === PAGE.library && <ExerciseLibrary studio={studio} />}{" "}
        {studio.page === PAGE.workouts && <WorkoutsPage studio={studio} />}{" "}
        {studio.page === PAGE.journal && <JournalPage studio={studio} />}{" "}
        {studio.page === PAGE.progress && <ProgressPage studio={studio} />}
        {studio.page === PAGE.calendar && <CalendarPage studio={studio} />}
        <footer className="page-footer">
          <span>Made for the way you move.</span>
          <span>
            FORM WORKOUT STUDIO <span>✳</span>
          </span>
        </footer>
        <InstallPrompt />
      </main>
      <StudioDialogs studio={studio} />
      {studio.message && (
        <output className="toast">
          <span>{studio.message}</span>
          <button
            onClick={() => studio.setMessage("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </output>
      )}
    </div>
  );
}

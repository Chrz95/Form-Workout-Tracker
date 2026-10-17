import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import "./styles/globals.css";
import "./styles/theme.css";
import "./styles/workoutEditor.css";
import "./styles/mobile.css";
import "./styles/studio.css";
/** Starts the PWA with an explicit mount guard. */
function mountApplication() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("The application mount element is missing.");
  }
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      document.documentElement.dataset.offline = "unavailable";
    });
  }
}
mountApplication();

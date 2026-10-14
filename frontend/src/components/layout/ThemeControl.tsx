import { useEffect, useState } from "react";
/** Provides accessible appearance controls and follows system changes in automatic mode.
 * @returns {JSX.Element} Appearance selector.
 */
export function ThemeControl() {
  const [theme, setTheme] = useState("system");
  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    /** Applies the current preference without storing application data in the browser. */
    function applyTheme() {
      document.documentElement.dataset.theme = theme === "system" ? (system.matches ? "dark" : "light") : theme;
    }
    applyTheme();
    system.addEventListener("change", applyTheme);
    return () => system.removeEventListener("change", applyTheme);
  }, [theme]);
  return (
    <label className="theme-control">
      Appearance
      <select
        aria-label="Appearance"
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

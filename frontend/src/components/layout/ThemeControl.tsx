import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
const PREFERENCE_KEY = "form.appearance";
/** Reads only a presentation preference, independently of saved training data.
 * @returns {string} Valid appearance preference or the system default.
 */
function readAppearance() {
  try {
    const saved = window.localStorage.getItem(PREFERENCE_KEY);
    return saved && ["system", "light", "dark"].includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}
/** Persists appearance and follows operating-system changes in automatic mode.
 * @returns {JSX.Element} Accessible appearance selector.
 */
export function ThemeControl() {
  const [theme, setTheme] = useState(readAppearance);
  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    /** Applies the selected color scheme without altering workout data. */
    function applyTheme() {
      const resolved = theme === "system" ? (system.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", resolved === "dark" ? "#111510" : "#f5f6f3");
    }
    applyTheme();
    try {
      window.localStorage.setItem(PREFERENCE_KEY, theme);
    } catch {
      // The selected theme still works when preference storage is unavailable.
    }
    system.addEventListener("change", applyTheme);
    return () => system.removeEventListener("change", applyTheme);
  }, [theme]);
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <label className="theme-control">
      <span>
        <Icon
          size={16}
          aria-hidden="true"
        />{" "}
        Appearance
      </span>
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

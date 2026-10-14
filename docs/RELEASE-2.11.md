# Release 2.11 — Mobile navigation and workout editing

Phones and tablets up to 900px use five persistent bottom tabs with icons and short visible labels.
Accessible page names and the current-page indicator remain available. Navigation focuses the main region and
returns the heading into view while preserving the unsaved routine and active session in memory.
The compact header keeps appearance and API connection settings available, including in dark mode.

Page padding and the sticky selection tray account for the navigation height and device safe areas.
Notifications sit above the page so they do not obscure the bottom tabs or selection actions.
Most action controls have at least 44px touch targets. The seven-column calendar fits narrow screens;
day cells retain tall targets while their widths follow the available space.

Phone widths up to 600px use full-screen native dialogs with dynamic viewport height, safe-area padding,
sticky close controls and sticky action footers. Keyboard viewport resizing is requested where supported.
Native focus trapping, Escape handling and layered exercise-review dialogs remain in place.
The page does not disable pinch zoom. Text fields use 16px type to reduce automatic focus zoom.

Exercise cards and form fields stack on small phones. Filtering, saved-routine controls and action groups wrap
instead of crowding the page. Instructions and key training text are larger. Set targets use two value columns,
and live sets place completion/removal below the fields with a visible Complete set label.
Repetition and duration inputs request numeric keyboards; weight and effort inputs request decimal keyboards.
Names wrap and progress-history tables scroll within their own containers.

The desktop sidebar and two-column exercise detail layout remain above their responsive breakpoints.
Catalog records, database schema, per-set data, nested routines and automatic local connection are unchanged.
There is no new migration. Keep `.env`, `.env.docker` and your PostgreSQL storage during upgrade, then restart
`pnpm dev` / `pnpm start:local`, or rebuild the Docker images using the existing launcher.

## Validation and device checks

178 tests pass; 23 PostgreSQL integration cases remain skipped without a dedicated test database.
TypeScript, warning-free lint, formatting, source structure and both production builds pass.
Interaction coverage verifies a single accessible navigation, page focus, the current indicator,
draft preservation across screens and the numeric/decimal input hints.

This environment cannot run browser/device QA. DOM tests do not validate layout, native dialog stacking,
touch interaction, safe-area insets or on-screen keyboard behavior. Check the following on a browser-enabled host:

- 320, 375, 390 and 430px portrait widths: all five tabs fit, settings are reachable, and the page has no global overflow.
- 600, 768 and 900px widths plus landscape: navigation, wrapping actions and the two-column catalog remain usable.
- Desktop above 900px: sidebar and wider layouts still work.
- Open the builder, review a component/exercise above it, then close the upper dialog: draft values and focus remain.
- Enter different reps/weights per set using the on-screen keyboard; the field, close control and save actions remain reachable.
- Complete/undo/remove sets, review completion and minimize/resume a session.
- Light/dark/system appearance, increased text size, pinch zoom, reduced motion and keyboard navigation.
- iOS/Android browser chrome, notches/home indicators and installed-PWA mode, including offline catalog browsing.

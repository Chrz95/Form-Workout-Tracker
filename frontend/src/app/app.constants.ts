/** Main app sections use stable discriminants. */
export const PAGE = {
  library: "library",
  workouts: "workouts",
  journal: "journal",
  progress: "progress",
  calendar: "calendar",
} as const;
/** Titles for section navigation. */
export const PAGE_TITLES = {
  calendar: "Workout calendar",
  library: "Exercise library",
  workouts: "My workouts",
  journal: "Training journal",
  progress: "Your progress",
} as const;
/** Page labels and descriptions. */
export const PAGE_DESCRIPTIONS = {
  calendar: "Make room for movement. See your plans and your progress.",
  library: "Find your next movement. Make it your own.",
  workouts: "A little structure. A lot of possibility.",
  journal: "Show up. Put in the work. Keep the record.",
  progress: "Every session is a step forward.",
} as const;
/** Session time conversion. */
export const MINUTES_PER_HOUR = 60;
/** Calendar display settings. */
export const DATE_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };

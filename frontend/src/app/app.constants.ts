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
  calendar: "Plan your week. Keep your training in view.",
  library: "Discover the movements behind your next great session.",
  workouts: "Your routines, organized and ready to train.",
  journal: "Every session, every set. Your complete training record.",
  progress: "A clear view of the work you put in.",
} as const;
/** Session time conversion. */
export const MINUTES_PER_HOUR = 60;
/** Calendar display settings. */
export const DATE_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };

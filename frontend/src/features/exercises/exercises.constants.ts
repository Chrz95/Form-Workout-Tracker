/** Muscle filters map directly to public dataset groups. */
export const MUSCLE_FILTERS = [
  "All muscles",
  "chest",
  "quadriceps",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "abdominals",
  "glutes",
  "hamstrings",
  "calves",
] as const;
/** Equipment choices in the dataset. */
export const EQUIPMENT_FILTERS = [
  "All equipment",
  "body only",
  "dumbbell",
  "barbell",
  "cable",
  "machine",
  "kettlebells",
  "bands",
  "exercise ball",
  "other",
] as const;
/** Frequently used exercises appear first without inventing popularity statistics. */
export const FEATURED_EXERCISES = [
  "Barbell_Squat",
  "Dumbbell_Bench_Press",
  "Pullups",
  "Dumbbell_Bicep_Curl",
  "Pushups",
  "Plank",
  "Goblet_Squat",
  "Romanian_Deadlift",
  "Side_Lateral_Raise",
  "Seated_Cable_Rows",
  "Walking_Lunges",
  "Face_Pull",
];
/** Number of milliseconds between demonstration frames. */
export const DEMONSTRATION_INTERVAL = 1200;
/** Displayed difficulty choices. */
export const LEVEL_FILTERS = ["All levels", "beginner", "intermediate", "expert", "advanced", "unspecified"];

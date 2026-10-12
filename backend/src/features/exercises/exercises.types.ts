import type { Exercise } from "../../../../shared/contracts.js";
/** Exercise persistence is injectable for HTTP tests; production is always PostgreSQL. */
export interface ExerciseRepository {
  list: () => Promise<Exercise[]>;
  listCustom: () => Promise<Exercise[]>;
  create: (exercise: Exercise) => Promise<Exercise>;
  update: (exercise: Exercise) => Promise<Exercise | null>;
  remove: (id: string) => Promise<boolean>;
}

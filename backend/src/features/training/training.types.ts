import type { Workout, Session, WorkoutItem } from "../../../../shared/contracts.js";
/** Input routine contract before PostgreSQL assigns identifiers. */
export type WorkoutInput = Omit<Workout, "id" | "createdAt">;
/** Input completion contract. */
export type SessionInput = Omit<Session, "id" | "createdAt">;
/** Repository interface supports HTTP tests without listening or database access. */
export interface TrainingRepository {
  listWorkouts: () => Promise<Workout[]>;
  saveWorkout: (input: WorkoutInput, id?: string) => Promise<Workout | null>;
  deleteWorkout: (id: string) => Promise<boolean>;
  listSessions: () => Promise<Session[]>;
  saveSession: (input: SessionInput) => Promise<Session>;
  deleteSession: (id: string) => Promise<boolean>;
  validateExercises: (items: WorkoutItem[]) => Promise<boolean>;
}

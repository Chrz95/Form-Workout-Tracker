import type { PerformedSet } from "../../../../../shared/setContracts";
import type { Session, SessionItem } from "../../../../../shared/contracts";
import type { LIVE_PHASE } from "./live.constants";
/** Editable set with a stable local key and explicit completion state. */
export interface LiveSet extends PerformedSet {
  localId: string;
  isCompleted: boolean;
}
/** One selected movement and the latest saved reference. */
export interface LiveExercise {
  exerciseId: string;
  sets: LiveSet[];
  previous: { date: string; item: SessionItem } | null;
}
/** In-memory training draft; submissionId makes eventual completion retry-safe. */
export interface LiveWorkout {
  submissionId: string;
  name: string;
  notes: string;
  date: string;
  startedAt: number;
  finishedAt: number | null;
  duration: number;
  phase: (typeof LIVE_PHASE)[keyof typeof LIVE_PHASE];
  exercises: LiveExercise[];
}
/** Narrow persistence boundary prevents a hook depending on the entire app. */
export interface LiveDependencies {
  sessions: Session[];
  isPending: boolean;
  apiError: string;
  persistSession: (session: Omit<Session, "id" | "createdAt">) => Promise<boolean>;
}

/** Stable identifiers are never editable set fields. */
export type SetField = keyof Omit<PerformedSet, "id">;

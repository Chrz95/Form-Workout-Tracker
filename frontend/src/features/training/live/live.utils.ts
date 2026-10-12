import type { Session, SessionItem, WorkoutItem } from "../../../../../shared/contracts";
import { SET_KIND, type PerformedSet } from "../../../../../shared/setContracts";
import type { LiveWorkout, LiveSet } from "./live.types";
import { LIVE_DEFAULTS, LIVE_PHASE } from "./live.constants";
/** Expands older aggregate records for comparisons without changing stored history.
 * @param {SessionItem} item - Saved exercise entry.
 * @returns {Omit<PerformedSet, "id">[]} Actual sets or the explicitly uniform legacy prescription.
 */
export function getRecordedSets(item: SessionItem): Omit<PerformedSet, "id">[] {
  return (
    item.performedSets ??
    Array.from({ length: item.sets }, () => ({
      reps: item.reps,
      weight: item.weight,
      rpe: null,
      kind: SET_KIND.working,
    }))
  );
}
/** Finds the most recent training date, using creation time only to break ties.
 * @param {Session[]} sessions - Saved history.
 * @param {string} exerciseId - Catalog identifier.
 * @returns {{date: string; item: SessionItem} | null} Latest performance.
 */
export function findPreviousPerformance(sessions: Session[], exerciseId: string) {
  const ordered = [...sessions].sort(
    (first, second) => second.date.localeCompare(first.date) || second.createdAt.localeCompare(first.createdAt),
  );
  for (const session of ordered) {
    const item = session.items.find((entry) => entry.exerciseId === exerciseId);
    if (item) {
      return { date: session.date, item };
    }
  }
  return null;
}
/** Creates a reversible set draft with a fresh local key.
 * @param {Pick<WorkoutItem, "reps" | "weight">} prescription - Initial values.
 * @param {PerformedSet["kind"]} [kind] - Warm-up or working classification.
 * @returns {LiveSet} Editable row.
 */
export function createLiveSet(
  prescription: Pick<WorkoutItem, "reps" | "weight">,
  kind: PerformedSet["kind"] = SET_KIND.working,
): LiveSet {
  const id = crypto.randomUUID();
  return {
    id,
    localId: id,
    reps: prescription.reps,
    weight: prescription.weight,
    rpe: null,
    kind,
    isCompleted: false,
  };
}
/** Starts a workout from a routine without overwriting its prescription with history.
 * @param {{name: string; notes: string; items: WorkoutItem[]}} input - Routine or current draft.
 * @param {Session[]} sessions - Saved reference history.
 * @param {number} now - Start timestamp in milliseconds.
 * @returns {LiveWorkout} New in-memory training session.
 */
export function createLiveWorkout(
  input: { name: string; notes: string; items: WorkoutItem[] },
  sessions: Session[],
  now: number,
): LiveWorkout {
  return {
    submissionId: crypto.randomUUID(),
    name: input.name || "My training session",
    notes: input.notes,
    date: new Date(now).toLocaleDateString("en-CA"),
    startedAt: now,
    finishedAt: null,
    duration: LIVE_DEFAULTS.minimumDuration,
    phase: LIVE_PHASE.training,
    exercises: input.items.map((item) => ({
      exerciseId: item.exerciseId,
      previous: findPreviousPerformance(sessions, item.exerciseId),
      sets: Array.from({ length: item.sets }, () => createLiveSet(item)),
    })),
  };
}
/** Selects the corresponding previous warm-up or working set.
 * @param {LiveSet[]} rows - Current editable rows.
 * @param {string} localId - Current row key.
 * @param {SessionItem | undefined} previous - Previous recorded exercise.
 * @returns {Omit<PerformedSet, "id"> | undefined} Matching historical set.
 */
export function getPreviousSet(rows: LiveSet[], localId: string, previous?: SessionItem) {
  const row = rows.find((entry) => entry.localId === localId);
  if (!row || !previous) {
    return undefined;
  }
  const sameKind = rows.filter((entry) => entry.kind === row.kind);
  const index = sameKind.findIndex((entry) => entry.localId === localId);
  return getRecordedSets(previous).filter((entry) => entry.kind === row.kind)[index];
}
/** Converts only completed rows into an internally consistent session submission.
 * @param {LiveWorkout} workout - Live draft.
 * @returns {Omit<Session, "id" | "createdAt">} API completion payload.
 */
export function prepareSession(workout: LiveWorkout): Omit<Session, "id" | "createdAt"> {
  const items = workout.exercises.flatMap((exercise) => {
    const performedSets = exercise.sets
      .filter((set) => set.isCompleted)
      .map(({ id, reps, weight, rpe, kind }) => ({ id, reps, weight, rpe, kind }));
    const last = performedSets.at(-1);
    return last
      ? [
          {
            exerciseId: exercise.exerciseId,
            sets: performedSets.length,
            reps: last.reps,
            weight: last.weight,
            performedSets,
          },
        ]
      : [];
  });
  return {
    submissionId: workout.submissionId,
    name: workout.name,
    notes: workout.notes,
    date: workout.date,
    duration: workout.duration,
    items,
  };
}
/** Formats wall-clock durations consistently.
 * @param {number} seconds - Remaining or elapsed seconds.
 * @returns {string} Minute/second representation.
 */
export function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / LIVE_DEFAULTS.secondsPerMinute);
  const remainder = String(safeSeconds % LIVE_DEFAULTS.secondsPerMinute).padStart(LIVE_DEFAULTS.timerDigits, "0");
  return `${minutes}:${remainder}`;
}

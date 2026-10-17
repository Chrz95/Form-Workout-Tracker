import type { Workout, Session } from "./contracts.js";
/** Compares exported data without treating API retry tokens as training values.
 * @param {Workout | Session} record - Complete persisted or imported record.
 * @returns {string} Stable representation of all transfer values.
 */
export function serializeImportedRecord(record: Workout | Session): string {
  const session = "date" in record ? record : undefined;
  return JSON.stringify({
    name: record.name,
    notes: record.notes,
    createdAt: new Date(record.createdAt).toISOString(),
    date: session?.date,
    duration: session?.duration,
    includedWorkoutIds: "includedWorkoutIds" in record ? record.includedWorkoutIds : undefined,
    items: record.items.map((item, index) => ({
      exerciseId: item.exerciseId,
      sets: item.sets,
      reps: item.reps,
      weight: item.weight,
      notes: item.notes ?? "",
      plannedSets: "plannedSets" in item ? item.plannedSets : undefined,
      performedSets: session?.items[index]?.performedSets?.map((set) => ({
        id: set.id,
        kind: set.kind,
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe ?? null,
      })),
    })),
  });
}

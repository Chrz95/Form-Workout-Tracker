import { workoutLinks } from "./schema/workoutLinks.js";
import { resolveWorkout } from "../../../shared/workoutGraph.js";
import { sessionSets } from "./schema/sessionSets.js";
import { createExerciseRepository } from "../features/exercises/exercises.repository.js";
import { createPlanRepository } from "../features/calendar/calendar.repository.js";
import { plans } from "./schema/plans.js";
import { ExerciseService } from "../features/exercises/exercises.service.js";
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { eq } from "drizzle-orm";
import { readTestDatabaseUrl } from "../app/config/environment.js";
import { createTrainingRepository } from "../features/training/training.repository.js";
import { workouts, workoutItems, exercises, sessions } from "./schema/tables.js";
import { WORKOUT_DEFAULTS } from "../../../shared/constants.js";
import { createImportRepository } from "../features/training/import.repository.js";
import { randomUUID } from "node:crypto";
import { createApp } from "../app/createApp.js";
import { environmentSchema } from "../app/config/environment.js";
import pino from "pino";
import request from "supertest";
const testDatabaseUrl = readTestDatabaseUrl();
const pool = new Pool({ connectionString: testDatabaseUrl });
const database = drizzle(pool);
const repository = createTrainingRepository(database);
const fixture = {
  name: "Transactional workout",
  notes: "",
  items: [
    {
      exerciseId: "fixture-exercise",
      sets: WORKOUT_DEFAULTS.sets,
      reps: WORKOUT_DEFAULTS.reps,
      weight: WORKOUT_DEFAULTS.weight,
    },
  ],
};
const exerciseFixture = {
  id: "fixture-exercise",
  name: "Push-up",
  level: "beginner",
  equipment: "body only",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  instructions: ["Move with control"],
  category: "strength",
  images: [],
};
describe.skipIf(!testDatabaseUrl)("Real PostgreSQL constraints and transactions", () => {
  it("retains reference-only routines, follows edited targets and protects used components", async () => {
    const child = (await repository.saveWorkout(fixture))!;
    const parent = (await repository.saveWorkout({
      name: "Combined",
      notes: "",
      items: [],
      includedWorkoutIds: [child.id],
    }))!;
    const updated = {
      ...fixture,
      items: [
        {
          exerciseId: "fixture-exercise",
          sets: 2,
          reps: 8,
          weight: 45,
          plannedSets: [
            { reps: 12, weight: 20 },
            { reps: 8, weight: 45 },
          ],
        },
      ],
    };
    await repository.saveWorkout(updated, child.id);
    const graph = await repository.listWorkouts();
    const savedParent = graph.find((row) => row.id === parent.id)!;
    expect(savedParent.items).toEqual([]);
    expect(savedParent.includedWorkoutIds).toEqual([child.id]);
    expect(resolveWorkout(savedParent, graph)).toEqual(updated.items);
    await expect(repository.deleteWorkout(child.id)).rejects.toMatchObject({ code: "WORKOUT_IN_USE" });
    await repository.deleteWorkout(parent.id);
    expect(await repository.deleteWorkout(child.id)).toBe(true);
  });
  it("imports parent-before-child batches and rolls back missing component references", async () => {
    const operation = createImportRepository(database);
    const child = { ...fixture, id: randomUUID(), createdAt: "2026-10-13T12:00:00Z" };
    const parent = { ...child, id: randomUUID(), name: "Parent", items: [], includedWorkoutIds: [child.id] };
    expect(await operation({ kind: "workouts", records: [parent, child] })).toEqual({ inserted: 2, skipped: 0 });
    expect(await operation({ kind: "workouts", records: [parent, child] })).toEqual({ inserted: 0, skipped: 2 });
    const invalid = { ...parent, id: randomUUID(), includedWorkoutIds: [randomUUID()] };
    await expect(operation({ kind: "workouts", records: [{ ...child, id: randomUUID() }, invalid] })).rejects.toThrow();
    expect(await repository.listWorkouts()).toHaveLength(2);
  });
  it("rejects a child edit that would duplicate a movement in its parent", async () => {
    const otherId = "fixture-nested-other";
    await database
      .insert(exercises)
      .values({ id: otherId, data: { ...exerciseFixture, id: otherId, name: "Other exercise" } });
    try {
      const childInput = { ...fixture, items: [{ ...fixture.items[0]!, exerciseId: otherId }] };
      const child = (await repository.saveWorkout(childInput))!;
      await repository.saveWorkout({ ...fixture, includedWorkoutIds: [child.id] });
      await expect(repository.saveWorkout(fixture, child.id)).rejects.toMatchObject({ code: "INVALID_COMPOSITION" });
      expect((await repository.listWorkouts()).find((row) => row.id === child.id)?.items).toEqual(childInput.items);
    } finally {
      await database.delete(workoutLinks);
      await database.delete(workouts);
      await database.delete(exercises).where(eq(exercises.id, otherId));
    }
  });
  it("serializes competing graph edits so only one side of a prospective cycle commits", async () => {
    const child = (await repository.saveWorkout(fixture))!;
    const a = (await repository.saveWorkout({ name: "A", notes: "", items: [], includedWorkoutIds: [child.id] }))!;
    const b = (await repository.saveWorkout({ name: "B", notes: "", items: [], includedWorkoutIds: [child.id] }))!;
    const results = await Promise.allSettled([
      repository.saveWorkout({ name: "A", notes: "", items: [], includedWorkoutIds: [b.id] }, a.id),
      repository.saveWorkout({ name: "B", notes: "", items: [], includedWorkoutIds: [a.id] }, b.id),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const graph = await repository.listWorkouts();
    expect(graph.every((record) => resolveWorkout(record, graph).length === 1)).toBe(true);
  });

  it("persists individual targets on save, replacement and atomic import retries", async () => {
    const targets = [
      { reps: 12, weight: 20 },
      { reps: 8, weight: 45 },
    ];
    const input = {
      ...fixture,
      items: [{ exerciseId: "fixture-exercise", sets: 2, reps: 8, weight: 45, plannedSets: targets }],
    };
    const saved = await repository.saveWorkout(input);
    expect((await repository.listWorkouts())[0]?.items).toEqual(input.items);
    const imported = { ...input, id: randomUUID(), createdAt: "2026-10-13T12:00:00Z" };
    const operation = createImportRepository(database);
    expect(await operation({ kind: "workouts", records: [imported] })).toEqual({ inserted: 1, skipped: 0 });
    expect(await operation({ kind: "workouts", records: [imported] })).toEqual({ inserted: 0, skipped: 1 });
    await repository.saveWorkout(fixture, saved!.id);
    expect((await repository.listWorkouts()).find((row) => row.id === saved!.id)?.items).toEqual(fixture.items);
  });
  it("imports stable routine IDs and skips an identical retry", async () => {
    const operation = createImportRepository(database);
    const record = { ...fixture, id: randomUUID(), createdAt: "2026-10-12T12:00:00.000Z" };
    expect(await operation({ kind: "workouts", records: [record] })).toEqual({ inserted: 1, skipped: 0 });
    expect(await operation({ kind: "workouts", records: [record] })).toEqual({ inserted: 0, skipped: 1 });
    expect(await repository.listWorkouts()).toEqual([record]);
  });
  it("rolls back earlier imported routines when a later identity conflicts", async () => {
    const operation = createImportRepository(database);
    const existing = { ...fixture, id: randomUUID(), createdAt: "2026-10-12T12:00:00.000Z" };
    await operation({ kind: "workouts", records: [existing] });
    const next = { ...existing, id: randomUUID(), name: "New" };
    await expect(
      operation({ kind: "workouts", records: [next, { ...existing, name: "Changed" }] }),
    ).rejects.toMatchObject({ code: "IMPORT_CONFLICT" });
    expect(await repository.listWorkouts()).toEqual([existing]);
  });
  it("preserves imported actual sets and prevents duplicate session retries", async () => {
    const operation = createImportRepository(database);
    const record = {
      ...fixture,
      id: randomUUID(),
      createdAt: "2026-10-12T12:00:00.000Z",
      date: "2026-10-12",
      duration: 35,
      items: [
        {
          exerciseId: "fixture-exercise",
          sets: 2,
          reps: 8,
          weight: 45,
          performedSets: [
            { id: randomUUID(), reps: 10, weight: 20, kind: "warmup" as const, rpe: null },
            { id: randomUUID(), reps: 8, weight: 45, kind: "working" as const, rpe: 8 },
          ],
        },
      ],
    };
    expect(await operation({ kind: "sessions", records: [record] })).toEqual({ inserted: 1, skipped: 0 });
    expect(await operation({ kind: "sessions", records: [record] })).toEqual({ inserted: 0, skipped: 1 });
    expect((await repository.listSessions())[0]).toMatchObject(record);
    await expect(operation({ kind: "sessions", records: [{ ...record, id: randomUUID() }] })).rejects.toThrow();
    expect(await repository.listSessions()).toHaveLength(1);
  });
  it("rejects duplicate canonical exercise aliases before importing any record", async () => {
    const alias = "fixture-alias";
    await database
      .insert(exercises)
      .values({ id: alias, data: { ...exerciseFixture, id: alias, canonicalId: exerciseFixture.id } });
    try {
      const record = {
        ...fixture,
        id: randomUUID(),
        createdAt: "2026-10-12T12:00:00.000Z",
        items: [...fixture.items, { ...fixture.items[0]!, exerciseId: alias }],
      };
      await expect(createImportRepository(database)({ kind: "workouts", records: [record] })).rejects.toMatchObject({
        code: "DUPLICATE_EXERCISE",
      });
      expect(await repository.listWorkouts()).toHaveLength(0);
    } finally {
      await database.delete(exercises).where(eq(exercises.id, alias));
    }
  });
  beforeAll(async () => {
    await migrate(database, { migrationsFolder: "backend/src/db/migrations" });
    await database.insert(exercises).values({ id: exerciseFixture.id, data: exerciseFixture }).onConflictDoNothing();
  });
  beforeEach(async () => {
    await database.delete(workoutLinks);
    await database.delete(workouts);
    await database.delete(sessions);
  });
  afterAll(async () => {
    await database.delete(workoutLinks);
    await database.delete(workouts);
    await database.delete(sessions);
    await database.delete(exercises).where(eq(exercises.id, exerciseFixture.id));
    await pool.end();
  });
  it("creates, reads, edits and deletes complete routines", async () => {
    const saved = await repository.saveWorkout(fixture);
    expect(saved).not.toBeNull();
    if (!saved) {
      return;
    }
    expect((await repository.listWorkouts())[0]?.items).toEqual(fixture.items);
    await repository.saveWorkout({ ...fixture, name: "Edited" }, saved.id);
    expect((await repository.listWorkouts())[0]?.name).toBe("Edited");
    expect(await repository.deleteWorkout(saved.id)).toBe(true);
    expect(await database.select().from(workoutItems)).toHaveLength(0);
  });
  it("rolls back metadata when exercise foreign keys fail", async () => {
    await expect(
      repository.saveWorkout({
        ...fixture,
        items: [
          {
            ...{
              exerciseId: "fixture-exercise",
              sets: WORKOUT_DEFAULTS.sets,
              reps: WORKOUT_DEFAULTS.reps,
              weight: WORKOUT_DEFAULTS.weight,
            },
            exerciseId: "missing",
          },
        ],
      }),
    ).rejects.toThrow();
    expect(await repository.listWorkouts()).toHaveLength(0);
  });
  it("preserves an existing list when replacement fails", async () => {
    const saved = await repository.saveWorkout(fixture);
    if (!saved) {
      throw new Error("Missing fixture");
    }
    await expect(
      repository.saveWorkout(
        {
          ...fixture,
          name: "Must roll back",
          items: [
            {
              ...{
                exerciseId: "fixture-exercise",
                sets: WORKOUT_DEFAULTS.sets,
                reps: WORKOUT_DEFAULTS.reps,
                weight: WORKOUT_DEFAULTS.weight,
              },
              exerciseId: "missing",
            },
          ],
        },
        saved.id,
      ),
    ).rejects.toThrow();
    const [record] = await repository.listWorkouts();
    expect(record?.name).toBe(fixture.name);
    expect(record?.items).toEqual(fixture.items);
  });
  it("enforces uniqueness and positive numeric constraints", async () => {
    await expect(repository.saveWorkout({ ...fixture, items: [...fixture.items, ...fixture.items] })).rejects.toThrow();
    await expect(
      repository.saveWorkout({
        ...fixture,
        items: [
          {
            ...{
              exerciseId: "fixture-exercise",
              sets: WORKOUT_DEFAULTS.sets,
              reps: WORKOUT_DEFAULTS.reps,
              weight: WORKOUT_DEFAULTS.weight,
            },
            sets: 0,
          },
        ],
      }),
    ).rejects.toThrow();
    expect(await repository.listWorkouts()).toHaveLength(0);
  });
  it("commits concurrent independent writes with distinct identifiers", async () => {
    const records = await Promise.all([
      repository.saveWorkout(fixture),
      repository.saveWorkout({ ...fixture, name: "Second routine" }),
    ]);
    expect(new Set(records.map((record) => record?.id)).size).toBe(records.length);
    expect(await repository.listWorkouts()).toHaveLength(records.length);
  });
  it("records sessions and cascades exercise cleanup", async () => {
    const saved = await repository.saveSession({ ...fixture, date: "2026-10-12", duration: WORKOUT_DEFAULTS.duration });
    expect((await repository.listSessions())[0]?.date).toBe("2026-10-12");
    expect(await repository.deleteSession(saved.id)).toBe(true);
    expect(await repository.listSessions()).toHaveLength(0);
  });
  it("persists individual set values and cascades their deletion", async () => {
    const performedSets = [
      { id: "b6f6e7a2-4216-4d03-b3dc-9bcd2a1e582c", reps: 10, weight: 40, rpe: 7, kind: "working" as const },
      { id: "c3a415ca-3093-4885-95fb-e756c78c3f9b", reps: 8, weight: 45, rpe: 8, kind: "working" as const },
    ];
    const saved = await repository.saveSession({
      ...fixture,
      date: "2026-10-12",
      duration: 35,
      items: [{ exerciseId: "fixture-exercise", sets: 2, reps: 8, weight: 45, performedSets }],
    });
    expect((await repository.listSessions())[0]?.items[0]?.performedSets).toEqual(performedSets);
    await repository.deleteSession(saved.id);
    expect(await database.select().from(sessionSets)).toHaveLength(0);
  });
  it("makes concurrent completion retries create one session", async () => {
    const input = {
      ...fixture,
      date: "2026-10-12",
      duration: 35,
      submissionId: "66029d09-aa0c-41c7-a45b-7ee879b0305a",
    };
    const [first, second] = await Promise.all([repository.saveSession(input), repository.saveSession(input)]);
    expect(first?.id).toBe(second?.id);
    expect(await repository.listSessions()).toHaveLength(1);
    await expect(repository.saveSession({ ...input, notes: "Changed completion" })).rejects.toMatchObject({
      code: "SUBMISSION_CONFLICT",
    });
  });
  it("rolls back the entire session when an actual set violates database bounds", async () => {
    await expect(
      repository.saveSession({
        ...fixture,
        date: "2026-10-12",
        duration: 35,
        items: [
          {
            exerciseId: "fixture-exercise",
            sets: 1,
            reps: 8,
            weight: 45,
            performedSets: [
              { id: "b6f6e7a2-4216-4d03-b3dc-9bcd2a1e582c", reps: 8, weight: 45, rpe: 11, kind: "working" },
            ],
          },
        ],
      }),
    ).rejects.toThrow();
    expect(await repository.listSessions()).toHaveLength(0);
  });
  it("reports real readiness from an actual PostgreSQL query", async () => {
    const app = createApp({
      environment: environmentSchema.parse({
        NODE_ENV: "test",
        DATABASE_URL: testDatabaseUrl,
        CORS_ALLOWED_ORIGINS: "http://localhost:5173",
        API_ACCESS_TOKEN: "test-only-private-token-more-than-32-characters",
      }),
      logger: pino({ level: "silent" }),
      repository,
      checkReady: async () => {
        await pool.query("SELECT 1");
      },
      exerciseRepository: createExerciseRepository(database),
      planRepository: createPlanRepository(database),
    });
    await request(app).get("/api/v1/ready").expect(200);
  });
  it("stores, reloads and updates custom exercises through the existing reference table", async () => {
    const exerciseRepository = createExerciseRepository(database);
    const service = new ExerciseService(exerciseRepository);
    const saved = await service.save({
      name: "Private test row",
      level: "unspecified",
      equipment: "bands",
      category: "strength",
      primaryMuscles: ["middle back"],
      secondaryMuscles: [],
      instructions: ["Pull with control."],
      imageUrl: "",
    });
    try {
      expect((await exerciseRepository.listCustom()).some((exercise) => exercise.id === saved.id)).toBe(true);
      const updated = await service.save(
        {
          name: "Edited private row",
          level: "beginner",
          equipment: "bands",
          category: "strength",
          primaryMuscles: ["middle back"],
          secondaryMuscles: [],
          instructions: ["Move slowly."],
          imageUrl: "",
        },
        saved.id,
      );
      expect(updated.id).toBe(saved.id);
      expect((await exerciseRepository.listCustom()).find((exercise) => exercise.id === saved.id)?.name).toBe(
        "Edited private row",
      );
    } finally {
      await service.remove(saved.id);
    }
  });
  it("enforces unique movement-name keys for concurrent private insertions", async () => {
    const exerciseRepository = createExerciseRepository(database);
    const input = {
      ...exerciseFixture,
      name: "Unique test movement",
      id: "custom_68436bcc-4b29-4442-acdf-117d36c01a47",
    };
    try {
      await exerciseRepository.create(input);
      await expect(
        exerciseRepository.create({
          ...input,
          id: "custom_d2a8b98f-fb0d-4fb8-b793-6829c86ee97b",
          name: "Movement Unique Test",
        }),
      ).rejects.toThrow();
    } finally {
      await database.delete(exercises).where(eq(exercises.id, input.id));
    }
  });
  it("stores/reschedules unique plans and preserves their label after routine removal", async () => {
    const calendar = createPlanRepository(database);
    const workout = await repository.saveWorkout(fixture);
    if (!workout) {
      throw new Error("Missing routine fixture");
    }
    try {
      const saved = await calendar.save({ date: "2026-10-15", workoutId: workout.id });
      if (!saved) {
        throw new Error("Missing plan fixture");
      }
      await expect(calendar.save({ date: "2026-10-15", workoutId: workout.id })).rejects.toThrow();
      await calendar.save({ date: "2026-10-16", workoutId: workout.id }, saved.id);
      await repository.deleteWorkout(workout.id);
      const kept = (await calendar.list()).find((plan) => plan.id === saved.id);
      expect(kept).toMatchObject({ date: "2026-10-16", workoutId: null, name: fixture.name });
      expect(await repository.listSessions()).toHaveLength(0);
      await calendar.remove(saved.id);
    } finally {
      await database.delete(plans);
      await repository.deleteWorkout(workout.id);
    }
  });
  it("prevents custom exercise deletion from erasing a referencing routine or session", async () => {
    const service = new ExerciseService(createExerciseRepository(database));
    const saved = await service.save({
      name: "Referenced test movement",
      level: "unspecified",
      equipment: "bands",
      category: "strength",
      primaryMuscles: ["chest"],
      secondaryMuscles: [],
      instructions: ["Move with control."],
      imageUrl: "",
    });
    const items = [{ exerciseId: saved.id, sets: 3, reps: 10, weight: 0 }];
    try {
      const workout = await repository.saveWorkout({ name: "Reference fixture", notes: "", items });
      const session = await repository.saveSession({
        name: "Reference fixture",
        notes: "",
        items,
        date: "2026-10-12",
        duration: 35,
      });
      await expect(service.remove(saved.id)).rejects.toMatchObject({ code: "EXERCISE_IN_USE" });
      expect((await repository.listWorkouts()).some((record) => record.id === workout?.id)).toBe(true);
      expect((await repository.listSessions()).some((record) => record.id === session.id)).toBe(true);
    } finally {
      await database.delete(workouts);
      await database.delete(sessions);
      await service.remove(saved.id);
    }
  });
});

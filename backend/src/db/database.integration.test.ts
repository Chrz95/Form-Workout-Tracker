import { sessionSets } from "./schema/sessionSets.js";
import { createExerciseRepository } from "../features/exercises/exercises.repository.js";
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
  beforeAll(async () => {
    await migrate(database, { migrationsFolder: "backend/src/db/migrations" });
    await database.insert(exercises).values({ id: exerciseFixture.id, data: exerciseFixture }).onConflictDoNothing();
  });
  beforeEach(async () => {
    await database.delete(workouts);
    await database.delete(sessions);
  });
  afterAll(async () => {
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

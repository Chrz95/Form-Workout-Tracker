import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import pino from "pino";
import { createApp } from "../../app/createApp.js";
import { environmentSchema } from "../../app/config/environment.js";
import { ExerciseService } from "./exercises.service.js";
import type { ExerciseRepository } from "./exercises.types.js";
import type { TrainingRepository } from "../training/training.types.js";
import { CUSTOM_EXERCISE_PREFIX, EXERCISE_PATH } from "../../../../shared/exerciseConstants.js";
import { customExerciseInputSchema } from "../../../../shared/customExerciseContracts.js";
const token = "test-private-token-with-at-least-32-characters";
const prefix = "/api/v1";
const customId = `${CUSTOM_EXERCISE_PREFIX}7c4f72b7-0114-4e9d-9b44-f45d9e23ff0b`;
const input = {
  name: "My band row",
  level: "unspecified" as const,
  equipment: "bands",
  category: "strength",
  primaryMuscles: ["middle back"],
  secondaryMuscles: ["biceps"],
  instructions: ["Set up the band.", "Pull with control."],
  imageUrl: "",
};
/** Creates an observable test double; production and persistence tests use PostgreSQL.
 * @returns {ExerciseRepository} Exercise boundary double.
 */
function createExerciseDouble(): ExerciseRepository {
  return {
    list: vi.fn(async () => []),
    listCustom: vi.fn(async () => []),
    create: vi.fn(async (exercise) => exercise),
    update: vi.fn(async (exercise) => exercise),
    remove: vi.fn(async () => true),
  };
}
/** Builds the real middleware/routes over observable persistence boundaries.
 * @param {ExerciseRepository} exerciseRepository - Exercise boundary double.
 * @returns {Express} Test application without a listening process.
 */
function buildApp(exerciseRepository: ExerciseRepository) {
  const repository: TrainingRepository = {
    listWorkouts: async () => [],
    listSessions: async () => [],
    deleteWorkout: async () => false,
    deleteSession: async () => false,
    validateExercises: async () => false,
    saveWorkout: async () => null,
    saveSession: async () => {
      throw new Error("Unused training write boundary");
    },
  };
  return createApp({
    environment: environmentSchema.parse({
      NODE_ENV: "test",
      CORS_ALLOWED_ORIGINS: "http://localhost:5173",
      DATABASE_URL: "postgresql://unused:unused@localhost:5433/unused",
      API_ACCESS_TOKEN: token,
    }),
    logger: pino({ level: "silent" }),
    repository,
    exerciseRepository,
    planRepository: { list: async () => [], save: async () => null, remove: async () => false },
    checkReady: async () => {},
  });
}
describe("Authenticated custom exercise contracts", () => {
  it("requires authentication for authored catalog reads and writes", async () => {
    const repository = createExerciseDouble();
    const app = buildApp(repository);
    await request(app)
      .get(prefix + EXERCISE_PATH.custom)
      .expect(401);
    await request(app)
      .post(prefix + EXERCISE_PATH.custom)
      .send(input)
      .expect(401);
    expect(repository.create).not.toHaveBeenCalled();
  });
  it("assigns an immutable custom identity and marks the content private", async () => {
    const repository = createExerciseDouble();
    const response = await request(buildApp(repository))
      .post(prefix + EXERCISE_PATH.custom)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(201);
    expect(response.body.data.id).toMatch(/^custom_[0-9a-f-]+$/);
    expect(response.body.data.instructions).toEqual(input.instructions);
    expect(response.body.data.images).toEqual([]);
    expect(response.body.data.source.license).toBe("Private user content");
  });
  it("rejects supplied identities, source spoofing and executable image schemes", async () => {
    const repository = createExerciseDouble();
    const app = buildApp(repository);
    for (const unsafe of [
      { ...input, id: "Pushups" },
      { ...input, source: { license: "Unlicense" } },
      { ...input, imageUrl: "javascript:alert(1)" },
      { ...input, imageUrl: "https://user:secret@example.com/photo.png" },
    ]) {
      await request(app)
        .post(prefix + EXERCISE_PATH.custom)
        .set("Authorization", `Bearer ${token}`)
        .send(unsafe)
        .expect(400);
    }
    expect(repository.create).not.toHaveBeenCalled();
  });
  it("rejects imported identities for edit and delete before persistence", async () => {
    const repository = createExerciseDouble();
    const app = buildApp(repository);
    await request(app)
      .put(`${prefix}${EXERCISE_PATH.custom}/Pushups`)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(400);
    await request(app)
      .delete(`${prefix}${EXERCISE_PATH.custom}/wger%3A12`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });
  it("updates custom content without changing the identity used by saved history", async () => {
    const repository = createExerciseDouble();
    const response = await request(buildApp(repository))
      .put(`${prefix}${EXERCISE_PATH.custom}/${customId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...input, name: "Revised row" })
      .expect(200);
    expect(response.body.data.id).toBe(customId);
    expect(response.body.data.name).toBe("Revised row");
  });
  it("reports missing custom records and returns only safe foreign-key conflict messages", async () => {
    const repository = createExerciseDouble();
    repository.update = async () => null;
    await request(buildApp(repository))
      .put(`${prefix}${EXERCISE_PATH.custom}/${customId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(404);
    repository.remove = async () => {
      throw new Error("private database details", {
        cause: Object.assign(new Error("internal constraint"), { code: "23503" }),
      });
    };
    const response = await request(buildApp(repository))
      .delete(`${prefix}${EXERCISE_PATH.custom}/${customId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);
    expect(response.body.error.code).toBe("EXERCISE_IN_USE");
    expect(JSON.stringify(response.body)).not.toContain("private database details");
  });
  it("validates nonempty descriptions and muscle groups at the shared input boundary", () => {
    expect(customExerciseInputSchema.safeParse({ ...input, instructions: [] }).success).toBe(false);
    expect(customExerciseInputSchema.safeParse({ ...input, primaryMuscles: [] }).success).toBe(false);
    expect(customExerciseInputSchema.safeParse({ ...input, imageUrl: "https://example.com/photo.webp" }).success).toBe(
      true,
    );
  });
  it("checks reserved IDs in the service even outside HTTP route composition", async () => {
    const repository = createExerciseDouble();
    const service = new ExerciseService(repository);
    await expect(service.save(input, "Pushups")).rejects.toThrow();
    await expect(service.remove("Pushups")).rejects.toThrow();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });
});

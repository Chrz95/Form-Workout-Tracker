import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import pino from "pino";
import { createApp } from "../../app/createApp.js";
import { environmentSchema } from "../../app/config/environment.js";
import { TrainingService } from "./training.service.js";
import type { TrainingRepository } from "./training.types.js";
import { WORKOUT_DEFAULTS, HTTP_STATUS } from "../../../../shared/constants.js";
import { API_PATH, sessionInputSchema } from "../../../../shared/contracts.js";
const token = "test_private_access_token_more_than_32_chars";
const prefix = "/api/v1";
const id = "7c4f72b7-0114-4e9d-9b44-f45d9e23ff0b";
const draft = {
  name: "Upper body",
  notes: "Rest with control",
  items: [
    {
      exerciseId: "Pushups",
      sets: WORKOUT_DEFAULTS.sets,
      reps: WORKOUT_DEFAULTS.reps,
      weight: WORKOUT_DEFAULTS.weight,
    },
  ],
};
const persisted = { ...draft, id, createdAt: "2026-10-12T12:00:00.000Z" };
/** Creates a deterministic service double; actual repository tests use PostgreSQL.
 * @returns {TrainingRepository} Observable persistence boundary.
 */
function createRepository(): TrainingRepository {
  return {
    listWorkouts: vi.fn(async () => [persisted]),
    saveWorkout: vi.fn(async () => persisted),
    deleteWorkout: vi.fn(async () => true),
    listSessions: vi.fn(async () => []),
    saveSession: vi.fn(async (input) => ({ ...input, id, createdAt: persisted.createdAt })),
    deleteSession: vi.fn(async () => true),
    validateExercises: vi.fn(async () => true),
  };
}
/** Builds a HTTP-test application without starting its process entry point.
 * @param {TrainingRepository} [repository] - Service double.
 * @param {() => Promise<void>} [checkReady] - Database probe behavior.
 * @returns {Express} Configured test application.
 */
function buildTestApp(repository = createRepository(), checkReady: () => Promise<void> = async () => {}) {
  return createApp({
    environment: environmentSchema.parse({
      NODE_ENV: "test",
      CORS_ALLOWED_ORIGINS: "http://localhost:5173",
      DATABASE_URL: "postgresql://unused:unused@localhost/test",
      API_ACCESS_TOKEN: token,
    }),
    logger: pino({ level: "silent" }),
    repository,
    checkReady,
    exerciseRepository: {
      list: async () => [],
      listCustom: async () => [],
      create: async (exercise) => exercise,
      update: async () => null,
      remove: async () => false,
    },
  });
}
describe("Workout API contracts", () => {
  it("keeps liveness independent from unavailable PostgreSQL", async () => {
    const app = buildTestApp(undefined, async () => {
      throw new Error("private database details");
    });
    await request(app).get(`${prefix}${API_PATH.health}`).expect(HTTP_STATUS.ok);
    const readiness = await request(app).get(`${prefix}${API_PATH.ready}`).expect(HTTP_STATUS.unavailable);
    expect(JSON.stringify(readiness.body)).not.toContain("private database details");
  });
  it("protects personal records and requires the exact bearer token", async () => {
    const app = buildTestApp();
    await request(app).get(`${prefix}${API_PATH.workouts}`).expect(HTTP_STATUS.unauthorized);
    await request(app)
      .get(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}x`)
      .expect(HTTP_STATUS.unauthorized);
  });
  it("creates a validated routine with a stable envelope", async () => {
    const repository = createRepository();
    const response = await request(buildTestApp(repository))
      .post(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}`)
      .send(draft)
      .expect(HTTP_STATUS.created);
    expect(response.body.data).toEqual(persisted);
    expect(repository.saveWorkout).toHaveBeenCalledWith(draft, undefined);
  });
  it("rejects duplicate or invalid prescriptions before persistence", async () => {
    const repository = createRepository();
    const app = buildTestApp(repository);
    await request(app)
      .post(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...draft, items: [...draft.items, ...draft.items] })
      .expect(HTTP_STATUS.badRequest);
    await request(app)
      .post(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...draft, items: [{ ...draft.items[0], sets: 0 }] })
      .expect(HTTP_STATUS.badRequest);
    expect(repository.saveWorkout).not.toHaveBeenCalled();
  });
  it("rejects malformed route identifiers and query parameters", async () => {
    const app = buildTestApp();
    await request(app)
      .delete(`${prefix}${API_PATH.workouts}/invalid`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HTTP_STATUS.badRequest);
    await request(app)
      .get(`${prefix}${API_PATH.workouts}?unexpected=true`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HTTP_STATUS.badRequest);
  });
  it("normalizes invalid JSON and unknown endpoint failures", async () => {
    const app = buildTestApp();
    const response = await request(app)
      .post(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send("{broken")
      .expect(HTTP_STATUS.badRequest);
    expect(response.body.error.code).toBe("INVALID_JSON");
    await request(app).get("/missing").expect(HTTP_STATUS.notFound);
  });
  it("applies security headers and explicit allowed origins", async () => {
    const app = buildTestApp();
    const allowed = await request(app).get(`${prefix}${API_PATH.health}`).set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(allowed.headers["x-content-type-options"]).toBe("nosniff");
    const denied = await request(app).get(`${prefix}${API_PATH.health}`).set("Origin", "https://untrusted.example");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
  it("hides unexpected persistence details", async () => {
    const repository = createRepository();
    repository.listWorkouts = async () => {
      throw new Error("password=do-not-expose");
    };
    const response = await request(buildTestApp(repository))
      .get(`${prefix}${API_PATH.workouts}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HTTP_STATUS.internal);
    expect(JSON.stringify(response.body)).not.toContain("do-not-expose");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });
});
describe("Per-set API release", () => {
  it("advertises capabilities only behind authentication", async () => {
    const app = buildTestApp();
    await request(app).get(`${prefix}${API_PATH.capabilities}`).expect(HTTP_STATUS.unauthorized);
    const response = await request(app)
      .get(`${prefix}${API_PATH.capabilities}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HTTP_STATUS.ok);
    expect(response.body.data.features).toContain("per-set-logging");
  });
  it("records differing actual set values without flattening them", async () => {
    const repository = createRepository();
    const performedSets = [
      { id: "b6f6e7a2-4216-4d03-b3dc-9bcd2a1e582c", reps: 10, weight: 40, rpe: 7, kind: "working" },
      { id: "c3a415ca-3093-4885-95fb-e756c78c3f9b", reps: 8, weight: 45, rpe: 8, kind: "working" },
    ];
    const input = {
      ...draft,
      date: "2026-10-12",
      duration: 35,
      items: [{ exerciseId: "Pushups", sets: 2, reps: 8, weight: 45, performedSets }],
    };
    const response = await request(buildTestApp(repository))
      .post(`${prefix}${API_PATH.sessions}`)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(HTTP_STATUS.created);
    expect(response.body.data.items[0].performedSets).toEqual(performedSets);
  });
  it("rejects set totals inconsistent with actual values before saving", async () => {
    const repository = createRepository();
    const input = {
      ...draft,
      date: "2026-10-12",
      duration: 35,
      items: [
        {
          exerciseId: "Pushups",
          sets: 3,
          reps: 8,
          weight: 45,
          performedSets: [{ id, reps: 8, weight: 45, rpe: null, kind: "working" }],
        },
      ],
    };
    await request(buildTestApp(repository))
      .post(`${prefix}${API_PATH.sessions}`)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(HTTP_STATUS.badRequest);
    expect(repository.saveSession).not.toHaveBeenCalled();
  });
});
describe("Per-set input safety", () => {
  it("rejects duplicate completed-set identifiers before persistence", async () => {
    const repository = createRepository();
    const set = { id, reps: 8, weight: 45, rpe: null, kind: "working" };
    const input = {
      ...draft,
      date: "2026-10-12",
      duration: 35,
      items: [{ exerciseId: "Pushups", sets: 2, reps: 8, weight: 45, performedSets: [set, set] }],
    };
    await request(buildTestApp(repository))
      .post(`${prefix}${API_PATH.sessions}`)
      .set("Authorization", `Bearer ${token}`)
      .send(input)
      .expect(HTTP_STATUS.badRequest);
    expect(repository.saveSession).not.toHaveBeenCalled();
  });
  it("returns a safe size-limit error for an oversized submission", async () => {
    const oversizedPaddingLength = 1100000;
    const response = await request(buildTestApp())
      .post(`${prefix}${API_PATH.sessions}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "x".repeat(oversizedPaddingLength) })
      .expect(HTTP_STATUS.payloadTooLarge);
    expect(response.body.error.code).toBe("PAYLOAD_TOO_LARGE");
    expect(JSON.stringify(response.body)).not.toContain("stack");
  });
});
describe("Training business rules", () => {
  it("refuses nonexistent exercises", async () => {
    const repository = createRepository();
    repository.validateExercises = async () => false;
    await expect(new TrainingService(repository).saveWorkout(draft)).rejects.toMatchObject({
      code: "UNKNOWN_EXERCISE",
    });
    expect(repository.saveWorkout).not.toHaveBeenCalled();
  });
  it("reports missing records rather than successful deletion", async () => {
    const repository = createRepository();
    repository.deleteWorkout = async () => false;
    await expect(new TrainingService(repository).deleteWorkout(id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("validates real calendar dates", () => {
    expect(
      sessionInputSchema.safeParse({ ...draft, date: "2026-02-30", duration: WORKOUT_DEFAULTS.duration }).success,
    ).toBe(false);
  });
  it("saves sessions with actual completion metadata", async () => {
    const repository = createRepository();
    const session = { ...draft, date: "2026-10-12", duration: WORKOUT_DEFAULTS.duration };
    expect(await new TrainingService(repository).saveSession(session)).toMatchObject(session);
  });
});

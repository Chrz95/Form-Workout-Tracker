import { API_CAPABILITIES } from "../../../shared/capabilities.js";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import type { Logger } from "pino";
import type { Environment } from "./config/environment.js";
import type { TrainingRepository } from "../features/training/training.types.js";
import type { ExerciseRepository } from "../features/exercises/exercises.types.js";
import { ExerciseService } from "../features/exercises/exercises.service.js";
import { createExerciseRoutes } from "../features/exercises/exercises.routes.js";
import { createCalendarRoutes } from "../features/calendar/calendar.routes.js";
import { CalendarService } from "../features/calendar/calendar.service.js";
import type { PlanRepository } from "../features/calendar/calendar.types.js";
import { TrainingService } from "../features/training/training.service.js";
import { createTrainingRoutes } from "../features/training/training.routes.js";
import { createErrorHandler } from "./middleware/errorHandler.js";
import { createAuthentication } from "./middleware/authentication.js";
import { HTTP_DEFAULTS } from "../constants/http.constants.js";
import { HTTP_STATUS } from "../../../shared/constants.js";
import { API_PATH } from "../../../shared/contracts.js";
interface ApplicationDependencies {
  environment: Environment;
  logger: Logger;
  repository: TrainingRepository;
  checkReady: () => Promise<void>;
  exerciseRepository: ExerciseRepository;
  planRepository: PlanRepository;
}
/** Builds an independently testable Express application without opening a port.
 * @param {ApplicationDependencies} dependencies - Typed runtime dependencies.
 * @param {Environment} dependencies.environment - Configuration.
 * @param {Logger} dependencies.logger - Redacted structured logger.
 * @param {TrainingRepository} dependencies.repository - Persistence boundary.
 * @param {() => Promise<void>} dependencies.checkReady - PostgreSQL probe.
 * @param {ExerciseRepository} dependencies.exerciseRepository - Catalog persistence.
 * @param {PlanRepository} dependencies.planRepository - Schedule persistence.
 * @returns {Express} Configured application.
 */
export function createApp({
  environment,
  logger,
  repository,
  checkReady,
  exerciseRepository,
  planRepository,
}: ApplicationDependencies): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use((_request, response, next) => {
    response.setHeader("X-Request-Id", randomUUID());
    next();
  });
  app.use(
    pinoHttp({
      logger,
      genReqId: (_request, response) => String(response.getHeader("X-Request-Id")),
      autoLogging: environment.NODE_ENV !== "test",
    }),
  );
  app.use(express.json({ limit: HTTP_DEFAULTS.bodyLimit }));
  app.use(
    cors({
      origin: environment.CORS_ALLOWED_ORIGINS,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );
  app.get(`${environment.API_PREFIX}${API_PATH.health}`, (_request, response) =>
    response.json({ data: { status: "alive" } }),
  );
  app.get(`${environment.API_PREFIX}${API_PATH.ready}`, async (_request, response) => {
    try {
      await checkReady();
      response.json({ data: { status: "ready" } });
    } catch {
      response
        .status(HTTP_STATUS.unavailable)
        .json({ error: { code: "DATABASE_UNAVAILABLE", message: "The database is temporarily unavailable." } });
    }
  });
  app.use(
    environment.API_PREFIX,
    rateLimit({
      windowMs: HTTP_DEFAULTS.rateWindow,
      limit: HTTP_DEFAULTS.rateLimit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please wait a minute." } },
    }),
    createAuthentication(environment.API_ACCESS_TOKEN),
  );
  app.get(`${environment.API_PREFIX}${API_PATH.capabilities}`, (_request, response) =>
    response.json({ data: API_CAPABILITIES }),
  );
  app.use(environment.API_PREFIX, createExerciseRoutes(new ExerciseService(exerciseRepository)));
  app.use(environment.API_PREFIX, createCalendarRoutes(new CalendarService(planRepository)));
  app.use(environment.API_PREFIX, createTrainingRoutes(new TrainingService(repository)));
  app.use((_request, response) =>
    response
      .status(HTTP_STATUS.notFound)
      .json({ error: { code: "NOT_FOUND", message: "This endpoint does not exist." } }),
  );
  app.use(createErrorHandler(logger));
  return app;
}

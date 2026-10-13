import { createApp } from "./app/createApp.js";
import { loadEnvironment } from "./app/config/environment.js";
import { createDatabase } from "./db/client.js";
import { createLogger } from "./lib/logger/logger.js";
import { createTrainingRepository } from "./features/training/training.repository.js";
import { createExerciseRepository } from "./features/exercises/exercises.repository.js";
import { createPlanRepository } from "./features/calendar/calendar.repository.js";
import { HTTP_DEFAULTS, PROCESS_SIGNALS } from "./constants/http.constants.js";
/** Verifies PostgreSQL before accepting traffic and installs bounded shutdown handlers.
 * @returns {Promise<void>} Server startup.
 */
async function startServer() {
  const environment = loadEnvironment();
  const logger = createLogger(environment);
  const { pool, database } = createDatabase(environment);
  pool.on("error", () => {
    logger.error("Unexpected PostgreSQL pool error");
  });
  try {
    await pool.query("SELECT 1");
  } catch {
    logger.fatal("PostgreSQL is unavailable; server will not accept traffic");
    await pool.end();
    process.exitCode = 1;
    return;
  }
  const app = createApp({
    environment,
    logger,
    repository: createTrainingRepository(database),
    checkReady: async () => {
      await pool.query("SELECT 1");
    },
    exerciseRepository: createExerciseRepository(database),
    planRepository: createPlanRepository(database),
  });
  const server = app.listen(environment.PORT, environment.HOST, () =>
    logger.info({ port: environment.PORT }, "Workout API ready"),
  );
  let isShuttingDown = false;
  /** Stops traffic, drains active requests, then closes PostgreSQL.
   * @param {number} exitCode - Appropriate process outcome.
   */
  function shutdown(exitCode: number) {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    logger.info("Shutting down workout API");
    const deadline = setTimeout(() => {
      server.closeAllConnections();
      void pool.end().finally(() => process.exit(exitCode || 1));
    }, HTTP_DEFAULTS.shutdownTimeout);
    deadline.unref();
    server.close(() => {
      void pool
        .end()
        .then(() => {
          clearTimeout(deadline);
          process.exitCode = exitCode;
        })
        .catch(() => {
          process.exitCode = 1;
        });
    });
  }
  for (const signal of PROCESS_SIGNALS) {
    process.on(signal, () => shutdown(0));
  }
  server.on("error", () => {
    logger.fatal("HTTP server failed");
    shutdown(1);
  });
  process.on("uncaughtException", () => {
    logger.fatal("Uncaught process failure");
    shutdown(1);
  });
  process.on("unhandledRejection", () => {
    logger.fatal("Unhandled asynchronous failure");
    shutdown(1);
  });
}
await startServer();

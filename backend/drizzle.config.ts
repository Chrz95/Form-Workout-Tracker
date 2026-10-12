import { defineConfig } from "drizzle-kit";
import { loadEnvironment } from "./src/app/config/environment.js";
/** Migration generation targets the same schema as the runtime repositories. */
export default defineConfig({
  schema: "./backend/src/db/schema/*.ts",
  out: "./backend/src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: loadEnvironment().DATABASE_URL },
});

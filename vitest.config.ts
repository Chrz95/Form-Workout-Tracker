import { defineConfig } from "vitest/config";
/** Separates DOM interaction tests from Node API and database tests. */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "frontend",
          environment: "jsdom",
          include: ["frontend/**/*.test.tsx"],
          setupFiles: ["frontend/src/testSetup.ts"],
        },
      },
      { test: { name: "backend", environment: "node", include: ["backend/**/*.test.ts"] } },
    ],
  },
});

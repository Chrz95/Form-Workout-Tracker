import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
/** Builds the isolated frontend into the static hosting directory. */
export default defineConfig({
  root: "frontend",
  plugins: [react()],
  build: { outDir: "../dist", emptyOutDir: true },
  server: { host: "0.0.0.0" },
});

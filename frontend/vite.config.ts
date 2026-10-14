import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { localApiProxy } from "./server/localApiProxy.ts";
import { localApiSettings, usesLocalApi } from "./server/localApiSettings.ts";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
/** Builds the isolated frontend into the static hosting directory. */
export default defineConfig(({ command, mode }) => {
  // Private root environment is read only by the Vite server, never injected into browser code.
  const environment = { ...loadEnv(mode, PROJECT_ROOT, ""), ...process.env };
  const automatic = (command === "serve" || mode === "standalone") && usesLocalApi(environment.VITE_API_BASE_URL);
  // Builds emit only public proxy configuration. Credentials are required exclusively by a running proxy.
  const local = automatic && command === "serve" ? localApiSettings(environment) : undefined;
  const proxy = local
    ? {
        "/api/": {
          target: local.target,
          headers: { Authorization: `Bearer ${local.token}` },
          /** Maps the browser API path to the configured backend version.
           * @param {string} path - Incoming proxy path.
           * @returns {string} Backend API path.
           */
          rewrite: (path: string) => path.replace(/^\/api\/v1(?=\/|$)/, local.prefix),
        },
      }
    : undefined;
  return {
    root: join(PROJECT_ROOT, "frontend"),
    plugins: [react(), ...(automatic ? [localApiProxy()] : [])],
    define: automatic
      ? {
          "import.meta.env.VITE_API_BASE_URL": JSON.stringify("/api/v1"),
          "import.meta.env.VITE_API_AUTH_MODE": JSON.stringify("proxy"),
        }
      : {},
    build: { outDir: join(PROJECT_ROOT, "dist"), emptyOutDir: true },
    server: {
      host: "127.0.0.1",
      proxy,
    },
    preview: { host: "127.0.0.1", port: 8080, strictPort: true, proxy },
  };
});

import type { Connect, Plugin } from "vite";
/** Guards development owner access against cross-site and unexpected-origin requests.
 * @param {string | undefined} origin - Browser Origin header.
 * @param {string | undefined} host - Browser Host header.
 * @param {string | string[] | undefined} fetchSite - Fetch metadata header.
 * @returns {boolean} Whether the proxy may supply its private credential.
 */
export function isLocalApiRequest(
  origin: string | undefined,
  host: string | undefined,
  fetchSite: string | string[] | undefined,
): boolean {
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) || fetchSite === "cross-site") {
    return false;
  }
  return !origin || origin === `http://${host}`;
}
/** Registers the same owner-access guard for development and built local applications.
 * @param {Connect.Server} middlewares - Vite's pre-proxy middleware stack.
 */
export function registerLocalApiGuard(middlewares: Connect.Server): void {
  middlewares.use((request, response, next) => {
    if (
      request.url?.startsWith("/api/") &&
      !isLocalApiRequest(request.headers.origin, request.headers.host, request.headers["sec-fetch-site"])
    ) {
      response.statusCode = 403;
      response.end("Forbidden");
      return;
    }
    next();
  });
}
/** Installs a guard ahead of Vite's credential-bearing development proxy.
 * @returns {Plugin} Development-only access guard.
 */
export function localApiProxy(): Plugin {
  return {
    name: "form-local-api",
    /** Registers the pre-proxy middleware.
     * @param {import("vite").ViteDevServer} server - Local development server.
     */
    configureServer(server) {
      registerLocalApiGuard(server.middlewares);
    },
    /** Registers the identical guard before the built application's proxy.
     * @param {import("vite").PreviewServer} server - Loopback local web server.
     */
    configurePreviewServer(server) {
      registerLocalApiGuard(server.middlewares);
    },
  };
}

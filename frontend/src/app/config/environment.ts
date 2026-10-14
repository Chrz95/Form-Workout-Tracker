import { z } from "zod";
/** The Docker web image proxies this public path through the current browser origin. */
export const SAME_ORIGIN_API_PATH = "/api/v1";
/** Resolves a public path while retaining explicit remote URLs and disconnected previews.
 * @param {string} configuredUrl - Browser-visible build configuration.
 * @param {string} origin - Current page origin.
 * @returns {string} Absolute connection URL or empty preview configuration.
 */
export function resolveApiBaseUrl(configuredUrl: string, origin: string): string {
  const validated = z.union([z.url(), z.literal(""), z.literal(SAME_ORIGIN_API_PATH)]).parse(configuredUrl);
  return validated === SAME_ORIGIN_API_PATH ? new URL(validated, origin).href : validated;
}
/** Browser-visible configuration; no backend credentials are exposed. */
export const frontendEnvironment = z
  .object({
    apiBaseUrl: z.union([z.url(), z.literal("")]),
    authentication: z.enum(["bearer", "proxy"]),
  })
  .parse({
    apiBaseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "", window.location.origin),
    authentication: import.meta.env.VITE_API_AUTH_MODE ?? "bearer",
  });

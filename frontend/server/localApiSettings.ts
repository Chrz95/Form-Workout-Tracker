import { z } from "zod";
const LOCAL_API_LIMITS = { maximumPort: 65535, minimumTokenLength: 32 };
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
/** Detects local configuration, including URLs retained from earlier releases.
 * @param {string | undefined} configuredUrl - Public API configuration.
 * @returns {boolean} Whether a private loopback proxy should own the connection.
 */
export function usesLocalApi(configuredUrl: string | undefined): boolean {
  if (!configuredUrl || /^\/api\/v[1-9]\d*\/?$/.test(configuredUrl)) {
    return true;
  }
  try {
    const url = new URL(configuredUrl);
    return (
      url.protocol === "http:" &&
      LOOPBACK_HOSTS.includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/api\/v[1-9]\d*\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
/** Validates server-only proxy settings without exposing database or bearer credentials.
 * @param {Record<string, string | undefined>} environment - Private root environment.
 * @returns {object} Loopback target, configured API prefix and private credential.
 */
export function localApiSettings(environment: Record<string, string | undefined>) {
  const host = z.enum(["localhost", "127.0.0.1", "::1", "0.0.0.0"]).parse(environment.HOST ?? "127.0.0.1");
  const port = z.coerce
    .number()
    .int()
    .min(1)
    .max(LOCAL_API_LIMITS.maximumPort)
    .parse(environment.PORT ?? "3001");
  const prefix = z
    .string()
    .regex(/^\/api\/v[1-9]\d*$/)
    .parse(environment.API_PREFIX ?? "/api/v1");
  const validatedToken = z
    .string()
    .min(LOCAL_API_LIMITS.minimumTokenLength)
    .regex(/^[^\r\n]+$/)
    .safeParse(environment.API_ACCESS_TOKEN);
  if (!validatedToken.success) {
    throw new Error("Local API credentials are missing or invalid. Run pnpm local:init from the Form project root.");
  }
  const token = validatedToken.data;
  const targetHost = host === "::1" ? "[::1]" : host === "0.0.0.0" ? "127.0.0.1" : host;
  return { target: `http://${targetHost}:${port}`, prefix, token };
}

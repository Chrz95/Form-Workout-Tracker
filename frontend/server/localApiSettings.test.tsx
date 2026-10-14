// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConfigEnv, UserConfig, Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import viteConfiguration from "../vite.config";
import { usesLocalApi, localApiSettings } from "./localApiSettings";
import { registerLocalApiGuard } from "./localApiProxy";
const TEST_TOKEN = "test-private-credential-with-32-characters";
afterEach(() => vi.unstubAllEnvs());
/** Resolves real Vite configuration with private fixture settings and no server launch.
 * @param {ConfigEnv} configuration - Build or serve mode.
 * @param {string} configuredUrl - Public legacy configuration.
 * @returns {Promise<UserConfig>} Evaluated development or build configuration.
 */
async function resolveConfiguration(configuration: ConfigEnv, configuredUrl = ""): Promise<UserConfig> {
  vi.stubEnv("API_ACCESS_TOKEN", TEST_TOKEN);
  vi.stubEnv("HOST", "127.0.0.1");
  vi.stubEnv("PORT", "3015");
  vi.stubEnv("API_PREFIX", "/api/v2");
  vi.stubEnv("VITE_API_BASE_URL", configuredUrl);
  if (typeof viteConfiguration !== "function") {
    throw new Error("Expected the Vite configuration factory.");
  }
  return viteConfiguration(configuration);
}
describe("Docker-free local connection settings", () => {
  it("automatically recognizes blank, relative and legacy loopback API URLs", () => {
    for (const value of [undefined, "", "/api/v1", "http://localhost:3001/api/v1", "http://127.0.0.1:3015/api/v2/"]) {
      expect(usesLocalApi(value)).toBe(true);
    }
    for (const value of [
      "https://api.example/api/v1",
      "http://localhost.evil/api/v1",
      "http://localhost/wrong",
      "http://owner:secret@localhost:3001/api/v1",
      "http://localhost:3001/api/v1?token=secret",
    ]) {
      expect(usesLocalApi(value)).toBe(false);
    }
  });
  it("honors the configured backend port, host and API prefix while validating credentials", () => {
    expect(
      localApiSettings({ HOST: "0.0.0.0", PORT: "3015", API_PREFIX: "/api/v2", API_ACCESS_TOKEN: TEST_TOKEN }),
    ).toEqual({ target: "http://127.0.0.1:3015", prefix: "/api/v2", token: TEST_TOKEN });
    expect(() => localApiSettings({ API_ACCESS_TOKEN: "short" })).toThrow();
    expect(() => localApiSettings({ HOST: "untrusted.example", API_ACCESS_TOKEN: TEST_TOKEN })).toThrow();
    expect(() => localApiSettings({ PORT: "70000", API_ACCESS_TOKEN: TEST_TOKEN })).toThrow();
    expect(() => localApiSettings({ API_ACCESS_TOKEN: `${TEST_TOKEN}\r\ninjected` })).toThrow();
  });
  it("configures dev and built-app proxies without exposing private settings", async () => {
    const configuration = await resolveConfiguration(
      { command: "serve", mode: "development" },
      "http://localhost:3001/api/v1",
    );
    const proxy = configuration.server?.proxy?.["/api/"];
    expect(proxy).toMatchObject({
      target: "http://127.0.0.1:3015",
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    });
    expect(configuration.preview?.proxy).toEqual(configuration.server?.proxy);
    expect(configuration.preview?.host).toBe("127.0.0.1");
    expect(JSON.stringify(configuration.define)).not.toContain(TEST_TOKEN);
    expect(configuration.define).toMatchObject({ "import.meta.env.VITE_API_AUTH_MODE": '"proxy"' });
    if (!proxy || typeof proxy === "string") {
      throw new Error("Expected local proxy settings.");
    }
    expect(proxy.rewrite?.("/api/v1/workouts")).toBe("/api/v2/workouts");
    expect(proxy.rewrite?.("/api/v10/workouts")).toBe("/api/v10/workouts");
    const build = await resolveConfiguration({ command: "build", mode: "standalone" });
    expect(build.define?.["import.meta.env.VITE_API_BASE_URL"]).toBe('"/api/v1"');
    const remote = await resolveConfiguration({ command: "serve", mode: "development" }, "https://api.example/api/v1");
    expect(remote.server?.proxy).toBeUndefined();
    expect(remote.preview?.proxy).toBeUndefined();
  });
  it("builds the local PWA without private credentials, even when invoked outside the project root", async () => {
    vi.spyOn(process, "cwd").mockReturnValue("D:\\unrelated\\folder");
    try {
      await resolveConfiguration({ command: "build", mode: "standalone" });
      vi.stubEnv("API_ACCESS_TOKEN", "");
      if (typeof viteConfiguration !== "function") {
        throw new Error("Expected the config factory.");
      }
      const build = await viteConfiguration({ command: "build", mode: "standalone" });
      expect(build.define?.["import.meta.env.VITE_API_AUTH_MODE"]).toBe('"proxy"');
      expect(build.server?.proxy).toBeUndefined();
      expect(build.preview?.proxy).toBeUndefined();
      expect(build.root?.replaceAll("\\", "/")).toMatch(/\/frontend$/);
      expect(() => localApiSettings({})).toThrow("pnpm local:init");
    } finally {
      vi.restoreAllMocks();
    }
  });
  it("blocks unsafe API calls before either local proxy and permits same-origin requests", () => {
    const handlers: Connect.NextHandleFunction[] = [];
    const middlewares = { use: (handler: Connect.NextHandleFunction) => handlers.push(handler) };
    registerLocalApiGuard(middlewares as unknown as Connect.Server);
    const [guard] = handlers;
    if (!guard) {
      throw new Error("Expected an installed guard.");
    }
    const response = { statusCode: 200, end: vi.fn() };
    const next = vi.fn();
    guard(
      {
        url: "/api/v1/workouts",
        headers: { host: "localhost:8080", origin: "https://untrusted.example" },
      } as IncomingMessage,
      response as unknown as ServerResponse,
      next,
    );
    expect(response.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
    guard(
      {
        url: "/api/v1/workouts",
        headers: { host: "localhost:8080", origin: "http://localhost:8080" },
      } as IncomingMessage,
      response as unknown as ServerResponse,
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });
});

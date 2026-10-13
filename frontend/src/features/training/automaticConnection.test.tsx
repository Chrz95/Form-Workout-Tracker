import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { frontendEnvironment } from "../../app/config/environment";
import { useRecords } from "./useRecords";
import { API_CAPABILITIES } from "../../../../shared/capabilities";
import { requestApi } from "../../lib/api/client";
import { isLocalApiRequest } from "../../../server/localApiProxy";
import { z } from "zod";
const original = { ...frontendEnvironment };
const saved = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Saved routine",
  notes: "",
  items: [{ exerciseId: "bench", sets: 1, reps: 8, weight: 0 }],
  createdAt: "2026-10-13T12:00:00Z",
};
beforeEach(() => {
  Object.assign(frontendEnvironment, {
    apiBaseUrl: `${window.location.origin}/api/v1`,
    authentication: "proxy",
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      const data = url.endsWith("/capabilities")
        ? API_CAPABILITIES
        : url.endsWith("/workouts")
          ? options?.method === "POST"
            ? saved
            : [saved]
          : [];
      return new Response(JSON.stringify({ data }));
    }),
  );
});
afterEach(() => {
  cleanup();
  Object.assign(frontendEnvironment, original);
  vi.unstubAllGlobals();
});
describe("Automatic PostgreSQL API connection", () => {
  it("verifies capabilities, loads saved records and saves through the proxy without a browser token", async () => {
    const { result } = renderHook(() => useRecords());
    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(result.current.workouts).toEqual([saved]);
    expect(result.current.hasImportSupport).toBe(true);
    await act(async () => {
      expect(await result.current.persistWorkout({ name: "Saved routine", notes: "", items: saved.items })).toBe(true);
    });
    expect(result.current.connection.token).toBe("");
    for (const [, options] of vi.mocked(fetch).mock.calls) {
      expect(options?.headers).not.toHaveProperty("Authorization");
    }
    expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === "POST")).toBe(true);
  });
  it("keeps a failed startup disconnected and supports retrying after the server becomes ready", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useRecords());
    await waitFor(() => expect(result.current.apiError).toContain("unreachable"));
    expect(result.current.isConnected).toBe(false);
    expect(result.current.workouts).toEqual([]);
    await act(async () => {
      await result.current.connectApi(result.current.connection);
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.apiError).toBe("");
  });
  it("retains explicit bearer authentication for remote APIs and disconnected previews", async () => {
    Object.assign(frontendEnvironment, { apiBaseUrl: "https://remote.example/api/v1", authentication: "bearer" });
    const { result } = renderHook(() => useRecords());
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    await expect(
      requestApi({ baseUrl: frontendEnvironment.apiBaseUrl, token: "" }, "/workouts", z.array(z.unknown())),
    ).rejects.toThrow("Connect your workout API");
    await expect(
      requestApi(
        { baseUrl: frontendEnvironment.apiBaseUrl, token: "", authentication: "proxy" },
        "/workouts",
        z.array(z.unknown()),
      ),
    ).rejects.toThrow("same-origin");
    expect(fetch).not.toHaveBeenCalled();
    await requestApi(
      { baseUrl: frontendEnvironment.apiBaseUrl, token: "test-private-token" },
      "/workouts",
      z.array(z.unknown()),
    );
    expect(fetch).toHaveBeenCalledWith(
      `${frontendEnvironment.apiBaseUrl}/workouts`,
      expect.objectContaining({
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-private-token" },
      }),
    );
  });
  it("blocks cross-site and DNS-rebinding requests before the development proxy supplies owner access", () => {
    expect(isLocalApiRequest("http://localhost:5173", "localhost:5173", "same-origin")).toBe(true);
    expect(isLocalApiRequest(undefined, "127.0.0.1:5173", undefined)).toBe(true);
    expect(isLocalApiRequest("https://untrusted.example", "localhost:5173", "cross-site")).toBe(false);
    expect(isLocalApiRequest(undefined, "attacker.example:5173", undefined)).toBe(false);
    expect(isLocalApiRequest("http://localhost:9999", "localhost:5173", "same-site")).toBe(false);
  });
});

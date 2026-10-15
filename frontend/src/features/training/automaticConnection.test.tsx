import { StrictMode } from "react";
import { App } from "../../app/App";
import { AUTOMATIC_CONNECTION_RETRY_MILLISECONDS } from "./useAutomaticConnection";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
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
  vi.useRealTimers();
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
  it("retries failed startup automatically and loads records when the backend becomes ready", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useRecords());
    await act(async () => {});
    expect(result.current.apiError).toContain("unavailable");
    expect(result.current.isConnected).toBe(false);
    expect(result.current.workouts).toEqual([]);
    expect(result.current.message).toBe("");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOMATIC_CONNECTION_RETRY_MILLISECONDS);
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.workouts).toEqual([saved]);
    expect(result.current.apiError).toBe("");
  });
  it("does not duplicate startup requests under React StrictMode", async () => {
    const { result } = renderHook(() => useRecords(), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith("/capabilities"))).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith("/workouts"))).toHaveLength(1);
  });
  it("cancels scheduled retries when the application unmounts", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { unmount } = renderHook(() => useRecords());
    await act(async () => {});
    const attempts = vi.mocked(fetch).mock.calls.length;
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOMATIC_CONNECTION_RETRY_MILLISECONDS * 3);
    });
    expect(fetch).toHaveBeenCalledTimes(attempts);
  });
  it("recovers after a failed save without replaying the write or losing confirmed records", async () => {
    vi.useFakeTimers();
    const normal = vi.mocked(fetch).getMockImplementation()!;
    let available = true;
    vi.mocked(fetch).mockImplementation(async (input, options) => {
      if (!available) {
        throw new Error("offline");
      }
      return normal(input, options);
    });
    const { result } = renderHook(() => useRecords());
    await act(async () => {});
    expect(result.current.isConnected).toBe(true);
    available = false;
    await act(async () => {
      expect(await result.current.persistWorkout({ name: "Saved routine", notes: "", items: saved.items })).toBe(false);
    });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.workouts).toEqual([saved]);
    available = true;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOMATIC_CONNECTION_RETRY_MILLISECONDS);
    });
    expect(result.current.isConnected).toBe(true);
    expect(vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  });
  it("rechecks immediately when the browser comes back online", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useRecords());
    await waitFor(() => expect(result.current.apiError).toContain("unavailable"));
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    await waitFor(() => expect(result.current.isConnected).toBe(true));
  });
  it("shows address rejections and automatic recovery without API setup or token controls", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const normal = vi.mocked(fetch).getMockImplementation()!;
    /** Releases the held startup response when the test backend becomes ready. */
    let release: () => void = () => {};
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    let denied = true;
    vi.mocked(fetch).mockImplementation(async (input, options) => {
      if (String(input).endsWith("/capabilities")) {
        await ready;
        if (denied) {
          return new Response("<h1>403 Forbidden</h1>", { status: 403 });
        }
      }
      if (String(input).endsWith(".json")) {
        return new Response("[]");
      }
      return normal(input, options);
    });
    render(<App />);
    expect(screen.queryByRole("button", { name: /Connect workout API/ })).not.toBeInTheDocument();
    expect(screen.getByText("Connecting to your workout server…")).toBeInTheDocument();
    expect(screen.queryByLabelText("Private API access token")).not.toBeInTheDocument();
    await act(async () => {
      release();
    });
    await waitFor(() => expect(screen.getByText(/The server rejected this site address/)).toBeInTheDocument());
    denied = false;
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    await waitFor(() => expect(screen.getByText("Backend connected")).toBeInTheDocument());
    expect(screen.queryByText(/Training preview/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Connect workout API/ })).not.toBeInTheDocument();
  });
  it.each([
    [401, "server connection credentials do not match"],
    [502, "workout server is not ready"],
  ])("explains managed server failure %s without requesting browser credentials", async (status, message) => {
    vi.mocked(fetch).mockResolvedValue(new Response("<html>upstream error</html>", { status: Number(status) }));
    await expect(
      requestApi(
        { baseUrl: frontendEnvironment.apiBaseUrl, token: "", authentication: "proxy" },
        "/workouts",
        z.array(z.unknown()),
      ),
    ).rejects.toMatchObject({ status, message: expect.stringContaining(String(message)) });
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

import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "./environment";
describe("Docker same-origin API configuration", () => {
  it("uses the current origin and custom port for the proxy URL", () => {
    expect(resolveApiBaseUrl("/api/v1", "http://localhost:8181")).toBe("http://localhost:8181/api/v1");
    expect(resolveApiBaseUrl("/api/v1", "https://fitness.example")).toBe("https://fitness.example/api/v1");
  });
  it("preserves remote API URLs and disconnected static previews", () => {
    expect(resolveApiBaseUrl("https://api.example/api/v1", "https://fitness.example")).toBe(
      "https://api.example/api/v1",
    );
    expect(resolveApiBaseUrl("", "https://fitness.example")).toBe("");
  });
  it("rejects unrecognized relative paths and invalid configuration", () => {
    expect(() => resolveApiBaseUrl("/another-path", "http://localhost:8080")).toThrow();
    expect(() => resolveApiBaseUrl("not a URL", "http://localhost:8080")).toThrow();
  });
});

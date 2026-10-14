import { afterEach, describe, it, expect, vi } from "vitest";
import { verifyApiCapabilities } from "./training.service";
const connection = { baseUrl: "https://workout-api.example/api/v1", token: "test-only-private-token" };
afterEach(() => vi.unstubAllGlobals());
describe("API feature compatibility", () => {
  it("refuses a server that would discard individual set values", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ data: { release: "1.0", features: [] } }))),
    );
    await expect(verifyApiCapabilities(connection)).rejects.toThrow("Update your workout API");
  });
  it("explains an older server's missing capabilities endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Missing endpoint" } }), { status: 404 }),
      ),
    );
    await expect(verifyApiCapabilities(connection)).rejects.toThrow("release 2.0 update");
  });
});

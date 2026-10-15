import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createUuid } from "../../../../shared/createUuid";
const browserCrypto = globalThis.crypto;
afterEach(() => vi.unstubAllGlobals());
describe("UUIDs on plain HTTP Raspberry Pi origins", () => {
  it("sets the UUID version and variant using getRandomValues when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: vi.fn((bytes: Uint8Array) => {
        bytes.forEach((_, index) => {
          bytes[index] = index;
        });
        return bytes;
      }),
    });
    expect(createUuid()).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
  });
  it("creates distinct server-valid identifiers using the available browser cryptographic generator", () => {
    vi.stubGlobal("crypto", { getRandomValues: browserCrypto.getRandomValues.bind(browserCrypto) });
    const ids = Array.from({ length: 100 }, () => createUuid());
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(z.uuid().safeParse(id).success).toBe(true);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });
  it("uses the native generator when the browser provides it", () => {
    const expected = "00010203-0405-4607-8809-0a0b0c0d0e0f";
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => expected) });
    expect(createUuid()).toBe(expected);
  });
});

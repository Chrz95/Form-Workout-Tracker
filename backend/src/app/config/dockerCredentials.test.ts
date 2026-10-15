import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
/** Runs the real container credential initializer against an isolated temporary volume.
 * @param {string} directory - Disposable credential directory.
 * @returns {string} Non-secret startup output.
 */
function initialize(directory: string): string {
  return execFileSync(process.execPath, ["docker/initialize-credentials.mjs"], {
    env: { PATH: process.env.PATH, FORM_CREDENTIALS_DIRECTORY: directory },
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}
describe("Docker credential volume initialization", () => {
  it("generates a readable proxy credential once and preserves it on subsequent starts", () => {
    const directory = mkdtempSync(join(tmpdir(), "form-credentials-"));
    const filename = join(directory, "api-token");
    try {
      const output = initialize(directory);
      const token = readFileSync(filename, "utf8");
      expect(token).toMatch(/^[a-f0-9]{64}$/);
      expect(output).not.toContain(token);
      expect(statSync(filename).mode & 0o777).toBe(0o444);
      initialize(directory);
      expect(readFileSync(filename, "utf8")).toBe(token);
      const credential = execFileSync(
        "sh",
        ["docker/backend-entrypoint.sh", process.execPath, "-e", "process.stdout.write(process.env.API_ACCESS_TOKEN)"],
        {
          env: { PATH: process.env.PATH, API_ACCESS_TOKEN_FILE: filename },
          encoding: "utf8",
        },
      );
      expect(credential).toBe(token);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it("fails without overwriting a damaged saved credential", () => {
    const directory = mkdtempSync(join(tmpdir(), "form-credentials-"));
    const filename = join(directory, "api-token");
    try {
      writeFileSync(filename, "invalid");
      expect(() => initialize(directory)).toThrow();
      expect(readFileSync(filename, "utf8")).toBe("invalid");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it("preserves an explicitly configured operator credential", () => {
    const token = "configured-owner-token-".repeat(3);
    const credential = execFileSync(
      "sh",
      ["docker/backend-entrypoint.sh", process.execPath, "-e", "process.stdout.write(process.env.API_ACCESS_TOKEN)"],
      {
        env: { PATH: process.env.PATH, API_ACCESS_TOKEN: token, API_ACCESS_TOKEN_FILE: "/missing-file" },
        encoding: "utf8",
      },
    );
    expect(credential).toBe(token);
  });
});

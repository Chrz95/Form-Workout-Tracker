import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "dotenv";
import { initializeLocalEnvironment } from "../../../../scripts/local-environment.mjs";
const temporaryDirectories: string[] = [];
const TEST_TOKEN = "existing-private-local-credential-with-32-characters";
/** Creates an isolated configuration directory without changing the real project environment.
 * @returns {Promise<string>} Temporary root with a public template.
 */
async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "form-local-init-"));
  temporaryDirectories.push(root);
  await writeFile(
    join(root, ".env.example"),
    "DATABASE_URL=postgresql://fixture:fixture@localhost:5433/form\nAPI_ACCESS_TOKEN=example-placeholder\n",
  );
  return root;
}
afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
describe("Private local runtime initialization", () => {
  it("generates a missing credential and preserves configured PostgreSQL settings exactly", async () => {
    const root = await fixtureRoot();
    const original = "# Keep my configuration\r\nDATABASE_URL=postgresql://owner:fixture@localhost:5440/personal\r\n";
    await writeFile(join(root, ".env"), original);
    await initializeLocalEnvironment(root);
    const content = await readFile(join(root, ".env"), "utf8");
    expect(content.startsWith(original)).toBe(true);
    expect(parse(content).API_ACCESS_TOKEN).toMatch(/^[a-f0-9]{64}$/);
    await initializeLocalEnvironment(root);
    expect(await readFile(join(root, ".env"), "utf8")).toBe(content);
    await expect(readFile(join(root, ".env.local-init.lock"))).rejects.toThrow();
  });
  it("creates a private environment template only when missing and preserves existing tokens", async () => {
    const root = await fixtureRoot();
    await initializeLocalEnvironment(root);
    expect(parse(await readFile(join(root, ".env"), "utf8")).API_ACCESS_TOKEN).toMatch(/^[a-f0-9]{64}$/);
    const original = `API_ACCESS_TOKEN=${TEST_TOKEN}\nDATABASE_URL=postgresql://owner:fixture@localhost:5433/form\n`;
    await writeFile(join(root, ".env"), original);
    await initializeLocalEnvironment(root);
    expect(await readFile(join(root, ".env"), "utf8")).toBe(original);
  });
  it("respects process credentials and rejects invalid values without revealing them or modifying files", async () => {
    const root = await fixtureRoot();
    await initializeLocalEnvironment(root, TEST_TOKEN);
    await expect(readFile(join(root, ".env"))).rejects.toThrow();
    await expect(initializeLocalEnvironment(root, "short-secret")).rejects.toThrow("at least 32 characters");
    const original = "API_ACCESS_TOKEN=short-secret\nDATABASE_URL=postgresql://owner:fixture@localhost:5433/form\n";
    await writeFile(join(root, ".env"), original);
    await expect(initializeLocalEnvironment(root)).rejects.toThrow("at least 32 characters");
    expect(await readFile(join(root, ".env"), "utf8")).toBe(original);
  });
});

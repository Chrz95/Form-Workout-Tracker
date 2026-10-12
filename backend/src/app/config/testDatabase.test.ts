import { describe, expect, it } from "vitest";
import { validateTestDatabaseUrl } from "./testDatabase.js";
describe("Disposable PostgreSQL target safeguards", () => {
  it("accepts the dedicated form_test database on port 5433", () => {
    const target = validateTestDatabaseUrl("postgresql://localhost:5433/form_test", "postgresql://localhost:5433/form");
    expect(target.port).toBe("5433");
    expect(target.pathname).toBe("/form_test");
  });
  it.each([
    "postgresql://localhost:5433/form",
    "postgresql://localhost:5433/_test",
    "postgresql://localhost:5433/form_test/other_test",
    "postgresql://localhost:5433/form%22_test",
    "postgresql://localhost:5433/Form_test",
    "sqlite://localhost/form_test",
    "not a URL",
  ])("rejects unsafe test target %s", (target) => {
    expect(() => validateTestDatabaseUrl(target)).toThrow();
  });
  it("rejects the primary database even if it ends in _test or uses a different hostname alias", () => {
    expect(() =>
      validateTestDatabaseUrl("postgresql://127.0.0.1:5433/form_test", "postgresql://localhost:5433/form_test"),
    ).toThrow("must differ");
  });
  it("rejects names beyond PostgreSQL's identifier limit", () => {
    expect(() => validateTestDatabaseUrl(`postgresql://localhost:5433/${"a".repeat(64)}_test`)).toThrow();
  });
  it("never includes credentials in malformed URL errors", () => {
    expect(() => validateTestDatabaseUrl("private-password")).toThrow("must be a valid PostgreSQL URL");
  });
});

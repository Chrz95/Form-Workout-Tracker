import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
/** Executes the real shell renderer while substituting only filesystem paths and Nginx launch.
 * @param {Record<string, string>} settings - Non-secret test environment.
 * @returns {string} Rendered private configuration and secret cleanup result.
 */
function renderProxy(settings: Record<string, string>): string {
  const temporary = mkdtempSync(join(tmpdir(), "form-proxy-test-"));
  const target = join(temporary, "nginx.conf");
  const script = readFileSync("docker/web-entrypoint.sh", "utf8")
    .replaceAll("/tmp/form-nginx.conf", target)
    .replace("/etc/nginx/nginx.conf", join(process.cwd(), "docker/nginx.conf"))
    .replace(`exec nginx -c ${target} "$@"`, `cat ${target}; test -z "\${API_ACCESS_TOKEN:-}"`);
  try {
    return execFileSync("sh", ["-c", script], {
      env: { PATH: process.env.PATH, ...settings },
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
describe("Docker private proxy runtime configuration", () => {
  it("injects the configured credential server-side with strict host and cross-site guards", () => {
    const token = "a".repeat(64);
    const configuration = renderProxy({ API_ACCESS_TOKEN: token });
    expect(configuration).toContain(`proxy_set_header Authorization "Bearer ${token}";`);
    expect(configuration).toContain("$http_host != 'localhost:8080'");
    expect(configuration).toContain("$http_origin = 'http://localhost:8080'");
    expect(configuration).toContain("$http_sec_fetch_site = 'cross-site'");
    expect(configuration).not.toContain("__LOCAL_GUARD__");
    expect(configuration).toContain("proxy_pass $api_upstream");
    expect(configuration).toContain("try_files $uri $uri/ /index.html");
  });
  it("keeps browser bearer authentication when automatic local access is disabled", () => {
    const configuration = renderProxy({ FORM_AUTO_CONNECT: "false", API_ACCESS_TOKEN: "a".repeat(64) });
    expect(configuration).toContain("proxy_set_header Authorization $http_authorization;");
    expect(configuration).not.toContain("Bearer");
    expect(configuration).not.toContain("$http_host !=");
  });
  it("reads the shared runtime token and resolves the namespaced API service", () => {
    const temporary = mkdtempSync(join(tmpdir(), "form-token-test-"));
    const filename = join(temporary, "api-token");
    const token = "b".repeat(64);
    writeFileSync(filename, token);
    try {
      const configuration = renderProxy({ API_ACCESS_TOKEN_FILE: filename, FORM_API_UPSTREAM: "form-backend:3001" });
      expect(configuration).toContain(`proxy_set_header Authorization "Bearer ${token}";`);
      expect(configuration).toContain("set $api_upstream http://form-backend:3001;");
      expect(configuration).not.toContain("__API_UPSTREAM__");
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
  it("rejects an upstream that could inject proxy configuration", () => {
    expect(() => renderProxy({ FORM_AUTO_CONNECT: "false", FORM_API_UPSTREAM: "host:3001; return 200" })).toThrow();
  });
  it("refuses missing or unsafe credentials and configuration injection", () => {
    expect(() => renderProxy({})).toThrow();
    expect(() => renderProxy({ API_ACCESS_TOKEN: `${"a".repeat(32)}"; injected` })).toThrow();
    expect(() => renderProxy({ API_ACCESS_TOKEN: "a".repeat(64), FORM_FRONTEND_ORIGIN: "http://host/;" })).toThrow();
  });
});

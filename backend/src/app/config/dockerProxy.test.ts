import { environmentSchema } from "./environment.js";
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
    const configuration = renderProxy({ API_ACCESS_TOKEN: token, FORM_FRONTEND_ORIGIN: "http://localhost:2324" });
    expect(configuration).toContain(`proxy_set_header Authorization "Bearer ${token}";`);
    expect(configuration).toContain("$form_site_pair = 'localhost:2324 '");
    expect(configuration).toContain("$form_site_pair = 'localhost:2324 http://localhost:2324'");
    expect(configuration).toContain("set $allowed_origin 0;");
    expect(configuration).toContain("if ($allowed_origin = 0) { return 403; }");
    expect(configuration).toContain("$http_sec_fetch_site = 'cross-site'");
    expect(configuration).not.toContain("__LOCAL_GUARD__");
    expect(configuration).toContain("proxy_pass $api_upstream");
    expect(configuration).toContain("try_files $uri $uri/ /index.html");
  });
  it("uses private LAN host and same-origin guards by default without pinning localhost", () => {
    const configuration = renderProxy({ API_ACCESS_TOKEN: "a".repeat(64) });
    expect(configuration).toContain("if ($form_private_host = 0) { return 403; }");
    expect(configuration).toContain('$http_origin = "$scheme://$http_host"');
    expect(configuration).toContain('map "$form_valid_ipv4:$host" $form_private_host');
    expect(configuration).not.toContain("$http_host != 'localhost:2324'");
    expect(configuration).toContain("The server rejected this site address.");
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
      const configuration = renderProxy({
        API_ACCESS_TOKEN_FILE: filename,
        FORM_API_UPSTREAM: "form-backend:3001",
        FORM_FRONTEND_ORIGIN: "http://192.168.1.50:2324",
      });
      expect(configuration).toContain(`proxy_set_header Authorization "Bearer ${token}";`);
      expect(configuration).toContain("set $api_upstream http://form-backend:3001;");
      expect(configuration).toContain("$form_site_pair = '192.168.1.50:2324 '");
      expect(configuration).toContain("$form_site_pair = '192.168.1.50:2324 http://192.168.1.50:2324'");
      expect(configuration).not.toContain("__API_UPSTREAM__");
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
  it("allows only each listed Host with its own Origin or an absent Origin", () => {
    const configuration = renderProxy({
      API_ACCESS_TOKEN: "a".repeat(64),
      FORM_FRONTEND_ORIGINS: "http://rpi5:2324, http://rpi5.nord:4983",
      FORM_FRONTEND_ORIGIN: "http://old-address:2324",
    });
    const pairs = [...configuration.matchAll(/if \(\$form_site_pair = '([^']*)'\) \{ set \$allowed_origin 1; \}/g)].map(
      (match) => match[1],
    );
    expect(pairs).toEqual([
      "rpi5:2324 ",
      "rpi5:2324 http://rpi5:2324",
      "rpi5.nord:4983 ",
      "rpi5.nord:4983 http://rpi5.nord:4983",
    ]);
    expect(configuration).toContain('set $form_site_pair "$http_host $http_origin"; set $allowed_origin 0;');
    expect(configuration).toContain("if ($allowed_origin = 0) { return 403; }");
    expect(configuration).toContain("if ($http_sec_fetch_site = 'cross-site') { return 403; }");
    expect(configuration).not.toContain("old-address");
    expect(configuration).not.toContain("$http_origin = 'http://rpi5");
  });
  it("retains explicit auto mode and supports literal IPv6 in an address list", () => {
    const automatic = renderProxy({ API_ACCESS_TOKEN: "a".repeat(64), FORM_FRONTEND_ORIGINS: "auto" });
    expect(automatic).toContain("if ($form_private_host = 0) { return 403; }");
    const explicit = renderProxy({
      API_ACCESS_TOKEN: "a".repeat(64),
      FORM_FRONTEND_ORIGINS: "http://[fd00::5]:2324,http://rpi5.nord:4983",
    });
    expect(explicit).toContain("$form_site_pair = '[fd00::5]:2324 http://[fd00::5]:2324'");
    expect(explicit).toContain("$form_site_pair = 'rpi5.nord:4983 http://rpi5.nord:4983'");
  });
  it("accepts both addresses in the existing backend CORS configuration", () => {
    const environment = environmentSchema.parse({
      DATABASE_URL: "postgresql://form_local:development_only@form-db:5433/form",
      API_ACCESS_TOKEN: "a".repeat(64),
      CORS_ALLOWED_ORIGINS: "http://rpi5:2324,http://rpi5.nord:4983",
    });
    expect(environment.CORS_ALLOWED_ORIGINS).toEqual(["http://rpi5:2324", "http://rpi5.nord:4983"]);
  });
  it.each([
    ",http://rpi5:2324",
    "http://rpi5:2324,",
    "http://rpi5:2324,,http://rpi5.nord:4983",
    "http://rpi5:2324,   ",
    "http://rpi5:2324,http://rpi5.nord:4983/",
    "http://rpi5:2324,http://*.nord:4983",
    "http://rpi5:2324,auto",
    "http://rpi5:2324\nhttp://evil:4983",
    "http://rpi5:2324,http://rpi5.nord:4983\r\nreturn 200;",
    "http://rpi5:2324,http://rpi5.nord:4983'; return 200; #",
  ])("rejects an unsafe or malformed address list: %j", (origins) => {
    expect(() => renderProxy({ API_ACCESS_TOKEN: "a".repeat(64), FORM_FRONTEND_ORIGINS: origins })).toThrow();
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

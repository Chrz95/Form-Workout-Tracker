# Release 2.10 — Automatic local PostgreSQL connection

The complete Docker app automatically connects to `/api/v1`, verifies backend capabilities, and loads saved
workouts, sessions, private exercises and plans on startup. The backend continues to own all PostgreSQL reads/writes.
The Nginx proxy supplies its private credential at runtime; the browser receives neither database credentials nor
the API token. A failed startup remains disconnected and exposes a retry in connection settings.

The default host-development setup does the same through Vite's loopback proxy. Leave `VITE_API_BASE_URL` blank
in `.env`; Vite reads the private root configuration server-side and forwards to localhost `PORT` (default 3001).
Restart both processes after configuration changes. An explicit remote URL retains manual bearer authentication.

## Upgrade

Keep `.env.docker` and the existing `workout_data` volume. Rebuild using:

```sh
sh scripts/docker-up.sh
```

Open `http://localhost:8080`. No local token-entry step is required, including after a page reload.
PostgreSQL remains on port 5433. There is no new migration; the existing migration/seed readiness service remains
in place. `FORM_DATABASE_URL` optionally overrides the Docker backend/migration database connection privately.
Host development continues to use `DATABASE_URL` in `.env`.

Automatic local access trusts whoever can reach the web port. Keep the default `127.0.0.1` bind. Both proxies reject
cross-site requests and unexpected hosts/origins. For public ingress, set `FORM_AUTO_CONNECT=false` and use bearer
credentials in connection settings, or authenticate the entire application at the ingress first.
See [Docker setup](DOCKER.md) for configuration and operational details.

The private hosted Site is a static frontend preview. It cannot reach a local PostgreSQL server directly;
remote persistent training still requires a separately hosted HTTPS Express API.

## Validation

169 tests pass; 23 PostgreSQL integration tests are skipped without a dedicated test database.
TypeScript, warning-free lint, formatting, source structure checks, and frontend/backend production builds pass.
New tests cover startup loading, credential-free browser saves, failed startup/retry, remote bearer compatibility,
development origin guards, real Docker shell rendering, and invalid runtime configuration rejection.

Docker/Nginx executables, a Docker daemon and PostgreSQL are unavailable in this environment. Actual image builds,
Nginx parsing, Compose startup and stop/start database persistence require verification on a Docker-enabled host.
Browser/device PWA behavior is also unverified here.

# Release 2.5 — Docker frontend, backend and database

The full application can now start with `sh scripts/docker-up.sh` on Linux/macOS/WSL. The launcher uses Docker alone
to create a private token without overwriting existing settings, then builds and starts the stack. Existing Node/pnpm
users can run `pnpm docker:init` and `pnpm docker:up`. Direct Compose/Windows instructions are in [DOCKER.md](DOCKER.md).

## Implementation

- A multi-stage Dockerfile exposes separate `frontend` and `backend` production image targets.
- Dependency installation uses the single root manifest/lockfile and pinned Node 24.19.0/pnpm 11.25.0.
- The API runtime contains compiled JavaScript, production dependencies, committed migrations and public seed JSON.
- Nginx serves the static PWA and proxies `/api/` to Express through the Compose network.
- Both application processes run without root, with read-only container filesystems and temporary storage under `/tmp`.
- No backend token or `.env` file is copied into a build image. Credentials are injected into the API at runtime.
- The frontend's public `/api/v1` build setting resolves against its current browser origin, including a changed port.
- Compose orders healthy PostgreSQL, completed migration/seed job, healthy backend, then frontend.
- Frontend/backend healthchecks and a graceful API stop interval are supplied.
- PostgreSQL retains its internal/host port 5433, existing local identity and exact persistent `workout_data` volume.
- `compose.yaml` remains database-only; `compose.app.yaml` adds the application without breaking existing development.

The default web URL is `http://localhost:8080`. Its private API token is entered in the connection dialog and stays in
tab memory. The database and API are not exposed as public services; only the local frontend port is published for the
application. PostgreSQL's existing loopback-only host port remains available to local development tools.

The supplied Compose stack retains local development database credentials for compatibility with existing data.
Remote hosting requires HTTPS ingress, exact public CORS origin and deployment-managed database credentials/privileges.
There is no new migration or catalog change in this release; API feature compatibility remains release 2.4.

## Checks and limits

127 unit/API/DOM tests pass across 16 executed files; 18 real PostgreSQL cases remain skipped. TypeScript, lint,
formatting, authored-source structure and both production builds pass. The Docker frontend build's same-origin
configuration is built separately and checked without changing the hosted preview's disconnected configuration.
The initializer generated a 64-character private token with mode 0600; a second run preserved its exact contents.
The shell launcher parses; Compose YAML parses, with dependency conditions, image targets, port/volume and container
restrictions reviewed. The build context excludes environment files and generated runtime/dependency output.

This runtime lacks a Docker executable/daemon. Actual Docker builds, Compose's own interpolation/config validation,
Nginx execution, startup ordering, applied migrations and restart persistence remain unverified. The launcher reports
the missing Docker prerequisite clearly. [DOCKER.md](DOCKER.md) supplies health and persistence checks for a Docker host.
The private published Site remains a static frontend preview; the complete stack runs on the user's Docker host.

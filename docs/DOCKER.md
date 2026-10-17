# Run Form in Docker or an existing Raspberry Pi stack

Use a 64-bit Raspberry Pi OS and Docker Engine with Compose 2.20.3 or newer (`docker compose version`).
The first run builds ARM64 images on the Pi and requires internet access. No host Node/pnpm, environment-file
initialization, token-generation command or manual database setup is required.

## Plain Compose startup

From the complete project root (the folder containing `Dockerfile`):

```sh
sudo docker compose up
```

Use `sudo docker compose up -d` to run in the background. The root `compose.yaml` includes the complete,
standalone `compose.app.yaml`. Compose builds missing images automatically. After changing source, use
`sudo docker compose up --build -d` to rebuild existing images.

The default browser address is **`http://rpi5:2324`**, already included in `compose.app.yaml`:

```yaml
x-form-origin: &form-origin http://rpi5:2324
```

Open that address after startup. The frontend listens on all Pi interfaces on port 2324 by default.
The proxy accepts the configured host/port and checks browser Origin/Host consistency before supplying
its private API credential. Bare hostname `rpi5` requires this explicit setting.

For another hostname or an HTTPS reverse proxy, change this anchor to the exact browser origin, for example
`https://fitness.example`. To access through private LAN IPs or `.local` names instead, set the anchor to
`auto`. Automatic mode accepts private IPv4 addresses, loopback, local IPv6 addresses and `.local` names;
it rejects other DNS names and cross-site requests.

The anchor is deliberately literal, so old `FORM_FRONTEND_ORIGIN` values in a parent Compose environment
cannot override your Raspberry Pi address. Configure the origin in `compose.app.yaml`, or in your main
Compose file if you copied the service definitions there. The backend's separate `FORM_CORS_ALLOWED_ORIGINS`
only configures direct cross-origin API clients; normal frontend requests use the same-origin web proxy
and require no CORS origin entry.
The browser connects and saves automatically through `/api/v1`; credentials stay private to the proxy.
Docker always enables the managed proxy.
The UI shows connection status instead of a Connect workout API button or credential form. If the API is
not ready or a request detects an outage, it retries the read-only connection handshake every five seconds,
and immediately when the browser reports that it is online. Drafts and confirmed records stay in memory;
failed save requests are never replayed automatically. Saving still requires a confirmed API response.

This is a single-owner app. Devices that can reach this web port can use the owner's workouts. Keep it on a
trusted LAN or behind an authenticated reverse proxy. Host/origin checks prevent cross-site browser access;
they do not replace a login. HTTPS is needed for PWA installation and service workers away from localhost.
The stack does not configure TLS certificates itself.

## Add to your generic Raspberry Pi Compose file

Keep the full project in a `form/` folder beside your existing generic `compose.yaml`:

```text
rpi-stack/
  compose.yaml       # your existing generic file
  form/             # the complete extracted Form source
    compose.yaml
    compose.app.yaml
    Dockerfile
    ...
```

Add this top-level section to your generic file, retaining its existing services, networks and volumes:

```yaml
include:
  - ./form/compose.yaml
```

If it already has an `include` list, append the path there. Keep the included `x-form-origin` value
`http://rpi5:2324` for your Raspberry Pi.
From `rpi-stack/`, start all applications with:

```sh
sudo docker compose up
```

Compose `include` resolves build contexts relative to the included file, so no source-path adjustment or
extra `-f` / `--env-file` arguments are needed. It requires Compose 2.20.3 or later.
Reference: https://docs.docker.com/compose/how-tos/multiple-compose-files/include/

If you prefer copying the YAML directly, copy all `x-form-*`, `services`, `volumes` and `networks` entries
from `compose.app.yaml` into the matching top-level sections of your generic file. Change **all three**
`build.context: .` values to `build.context: ./form` (or your actual source path), and keep the anchors.
Do not create duplicate top-level `services`/`volumes`/`networks` keys. No container names or project name
are hard-coded. If port 2324 is already used, change its host port; update any explicitly pinned origin too.

Existing `FORM_HTTP_PORT` overrides must be 2324 for the default app URL.
Compose publishes host port 2324 to the web container's internal 8080;
container healthchecks still use the internal port. For example, the default port mapping is `2324:8080`.

After updating the Compose origin, recreate the frontend from your main Compose directory
(no image rebuild is needed for this configuration change):

```sh
sudo docker compose up -d --no-deps --force-recreate form-frontend
```

Then reload the app at `http://rpi5:2324`. A 403 response means the configured host/origin guard
rejected the request: use `auto` for a private LAN IP/`.local` address, or pin the correct origin for other
hostnames, then recreate the affected containers. No frontend connection dialog is required.

The workout logger, per-set editor and live workouts also work on plain HTTP LAN URLs. UUIDs use the
browser's cryptographically random `getRandomValues` fallback when `randomUUID` requires HTTPS.
PWA installation/offline service workers still require a secure context away from localhost.

If the status still waits for the backend, the banner now shows the actual API failure. On the Pi, run:

```sh
sudo docker compose ps -a
sudo docker compose logs --tail 80 form-backend form-migrate form-frontend
curl -i -H 'Host: rpi5:2324' http://127.0.0.1:2324/api/v1/ready
curl -i -H 'Host: rpi5:2324' http://127.0.0.1:2324/api/v1/capabilities
```

With the configured Host header, readiness and capabilities should return 200 JSON. A 401 indicates mismatched API
credentials; a 502/503 means the API/database is unavailable or not ready. Check migration/database logs
instead of deleting the host database directory.

## Services, startup and persistence

| Service         | Purpose                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `form-init`     | Generates a random private API token in `form_credentials` once; retains it on subsequent starts. |
| `form-db`       | PostgreSQL 17 listening on 5433 inside `form_network`; no database port exposed on the Pi.        |
| `form-migrate`  | Applies committed migrations, then transactionally seeds the public catalog.                      |
| `form-backend`  | Starts after credentials, database health and successful migrations.                              |
| `form-frontend` | Serves the PWA and proxies API requests after the backend is healthy.                             |

`form-init` and `form-migrate` exiting with code 0 is expected. The app network and service names are
prefixed to avoid collisions with other applications named `db`, `backend` or `frontend`. Other apps are
not attached to this network automatically. The database and backend have no published host ports.
The private database also retains the old `db` network alias, so older container database URLs keep resolving
without colliding with other applications' default networks.

The database uses the host directory **`/home/pi/configs/form`** through a bind mount at
`/var/lib/postgresql/data`. Compose creates the host directory if absent, and PostgreSQL initializes it on a
fresh installation. Keep this directory for persistent workout data. `FORM_POSTGRES_DATA_DIR` can override
the default with another absolute host path. The generated
credential uses the named volume **`form_credentials`**, mounted read-only by the API, migration job and web
proxy. The credential is generated at runtime, never printed, and never included in static assets or images.
The web process reads it without exposing it to the browser. Explicit `DOCKER_API_ACCESS_TOKEN` settings are
still supported when configured identically for backend and frontend.

If your data is currently in the old `workout_data` named volume, changing this mount alone does not move it.
Follow [the one-time migration instructions](POSTGRES-STORAGE.md) before starting the updated stack.
They stop only Form services, verify PostgreSQL 17 and an empty destination, and preserve the old volume.
Never run two PostgreSQL containers against the same data directory.

The database identity remains `form_local`, database `form`, password `development_only`, compatible with
existing data. PostgreSQL is private to the app network. If you changed existing database credentials,
configure `FORM_DATABASE_URL` to match; changing `POSTGRES_PASSWORD` alone does not update existing data.
A second independent installation needs a separate host data directory and credential volume name.

## Manage and back up from your generic stack directory

```sh
sudo docker compose ps -a
sudo docker compose logs --tail 100 form-init form-migrate form-backend form-frontend
sudo docker compose stop form-frontend form-backend form-migrate form-db form-init
sudo docker compose up -d form-frontend
```

Starting `form-frontend` brings up its dependencies. The long-running services use `restart: unless-stopped`.
A failed initializer, database or migration blocks dependent services instead of pretending saves succeeded.
To explicitly retry an interrupted migration/seed task:

```sh
sudo docker compose run --rm form-migrate
```

Back up the database and copy the dump off your Pi:

```sh
sudo docker compose exec -T form-db pg_dump -U form_local -p 5433 -d form -Fc > form-backup.dump
```

The host database directory survives container recreation and Compose `down`. Keep it and the credential
volume, and maintain independent database backups. See [storage and migration](POSTGRES-STORAGE.md).

## Native development and previous configuration

The old database-only model is retained as `compose.db.yaml`, with service `db`, port `127.0.0.1:5433:5433`
and the same bind-mount default `/home/pi/configs/form`. `pnpm db:up`, `pnpm db:down` and `pnpm db:setup`
use that model. Set `FORM_POSTGRES_DATA_DIR` to a suitable absolute path on Windows or another development
host. Stop the full app's database first if switching between the database-only and full Docker stacks.

The `docker:up`, `docker:down`, `docker:logs` and `docker:status` scripts now wrap the default Compose file.
The shell launcher `sh scripts/docker-up.sh` is optional. `.env.docker` and `docker:init` are no longer needed
for default startup; old operator values can be moved into the main stack's `.env`, exported environment or
inline Compose settings. Do not use the old two-file `-f compose.yaml -f compose.app.yaml` command.

The frontend build still uses public `/api/v1` with proxy authentication. The backend entrypoint reads the
runtime token before launching the server or migration command; both still require authenticated PostgreSQL.

## Verification boundary

Credential creation/preservation, real shell entrypoints, proxy configuration rendering, type checking and
application tests are checked locally, including logger, builder and live training without `randomUUID`.
The proxy was executed against a test API using official Ubuntu Nginx 1.24: 28 HTTP checks covered private
IPs, mDNS, IPv6, pinned HTTP/HTTPS origins, credential forwarding and cross-site/DNS-rebinding rejection.
Compose YAML and path references are validated. This environment has
no Docker daemon, so image builds, actual Compose startup, PostgreSQL migrations and ARM64 execution still
need verification on your Pi. Use `curl --fail http://localhost:2324/healthz` for the web healthcheck; open the
configured origin to test saving and persistence.

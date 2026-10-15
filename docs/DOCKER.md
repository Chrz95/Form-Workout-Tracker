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

Set the browser URL once before using the app from your phone or laptop. Edit the single `x-form-origin`
setting near the top of `compose.app.yaml`, replacing the default with your Pi's address, for example:

```yaml
x-form-origin: &form-origin http://192.168.1.50:8080
```

Then open that exact URL. This value is shared by the API origin allow-list and the private web proxy's
host/origin guard. The frontend listens on all Pi interfaces on port 8080 by default. Find your Pi's address
with `hostname -I`; a DHCP reservation keeps it stable. The browser connects and saves automatically through
`/api/v1`. No API token needs to be copied into the browser.

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

If it already has an `include` list, append the path there. Set `x-form-origin` in `form/compose.app.yaml`
once as shown above. From `rpi-stack/`, start all applications with:

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
are hard-coded. If port 8080 is already used, change its host port and the origin together.

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

The database uses the exact named volume **`workout_data`**, preserving existing workout data. The generated
credential uses the named volume **`form_credentials`**, mounted read-only by the API, migration job and web
proxy. The credential is generated at runtime, never printed, and never included in static assets or images.
The web process reads it without exposing it to the browser. Explicit `DOCKER_API_ACCESS_TOKEN` settings are
still supported when configured identically for backend and frontend.

An existing deployment must be stopped **before** the new stack mounts its existing `workout_data` volume;
never run two PostgreSQL containers against that volume. When migrating from the old two-file setup, stop it
using the old project/files before replacing its source. In a generic project, stop/start just these services
without interrupting unrelated apps; do not run a blanket `down` for that project unless intended.

The database identity remains `form_local`, database `form`, password `development_only`, compatible with the
previous volume. PostgreSQL is private to the app network. If you changed existing database credentials,
configure `FORM_DATABASE_URL` to match; changing `POSTGRES_PASSWORD` alone does not update an existing volume.
No cleanup or migration command deletes existing private workouts. Fixed volume names represent one Form
installation per Docker host; a second independent installation needs different names.

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

`down` normally retains volumes. Avoid `down -v`, deleting `workout_data`, or pruning volumes if you want to
retain workouts. Keep independent backups; test restoration in a separate database.

## Native development and previous configuration

The old database-only model is retained as `compose.db.yaml`, with service `db`, port `127.0.0.1:5433:5433`
and the same `workout_data` volume. `pnpm db:up`, `pnpm db:down` and `pnpm db:setup` use that model. Stop the
full app's database first if switching between native development and the full Docker stack.

The `docker:up`, `docker:down`, `docker:logs` and `docker:status` scripts now wrap the default Compose file.
The shell launcher `sh scripts/docker-up.sh` is optional. `.env.docker` and `docker:init` are no longer needed
for default startup; old operator values can be moved into the main stack's `.env`, exported environment or
inline Compose settings. Do not use the old two-file `-f compose.yaml -f compose.app.yaml` command.

The frontend build still uses public `/api/v1` with proxy authentication. The backend entrypoint reads the
runtime token before launching the server or migration command; both still require authenticated PostgreSQL.

## Verification boundary

Credential creation/preservation, real shell entrypoints, proxy configuration rendering, type checking and
application tests are checked locally. Compose YAML and path references are validated. This environment has
no Docker daemon, so image builds, actual Compose startup, PostgreSQL migrations and ARM64 execution still
need verification on your Pi. Use `curl --fail http://localhost:8080/healthz` for the web healthcheck; open the
configured origin to test saving and persistence.

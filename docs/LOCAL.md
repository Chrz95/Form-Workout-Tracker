# Run locally without Docker

Use Node 24.19.0, pnpm 11.25.0, and an installed/running PostgreSQL 17 server.
Run every command from the project root. No command in this guide invokes Docker.

## Configure once

Copy `.env.example` to the private root `.env`, preserving an existing configuration if you have one.
Set `DATABASE_URL` to your actual PostgreSQL database, user, password and port. For example, the supplied local
configuration uses port 5433; the app also accepts another configured PostgreSQL port. The database must already
exist, and its service must be running. The application does not install or start your operating system's database service.

Local startup and `db:setup:local` automatically run `pnpm local:init`. This creates a private random
`API_ACCESS_TOKEN` when missing/blank or still the supplied example. Your configured database URL and valid existing
credential are preserved. Both backend and local proxy read the same root `.env`; no UI token entry is required.
You can also run `pnpm local:init` separately. Explicit process credentials take precedence and must be valid.
The backend uses `HOST` (default `127.0.0.1`), `PORT` (default `3001`) and `API_PREFIX` (default `/api/v1`).

Leave `VITE_API_BASE_URL` blank, use `/api/v1`, or retain an older HTTP loopback URL such as
`http://localhost:3001/api/v1`. All activate automatic connection. The private proxy targets the actual backend
`HOST`/`PORT`, maps to its configured `API_PREFIX`, and publishes `/api/v1` to the browser.
An explicit remote API URL retains manual bearer authentication.

Use `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080` for the default development and built app.
Restart both application processes after changing `.env`.

## Prepare your configured database

```sh
pnpm install
pnpm db:setup:local
```

`db:setup:local` prepares private credentials, then applies committed migrations, seeds public exercise references and checks connectivity using
`DATABASE_URL`. It does not start Compose or replace the database. Use it for first setup and releases requiring
migrations or a catalog reseed. Existing private workout data remains in your PostgreSQL database.
For an already prepared database, you can run `pnpm db:check` before starting the app.

## Development

```sh
pnpm dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.
The command starts both frontend and backend; stopping either stops the other.
Saved training loads automatically after the API capability check succeeds. Reloading reconnects automatically.
The UI shows server status without an API setup prompt. Startup failures and detected transport outages trigger
read-only connection retries every five seconds; browser online events retry immediately. Drafts and confirmed
records are preserved, and failed writes are never replayed automatically.

## Built local application

```sh
pnpm start:local
```

Open `http://localhost:8080`. The command first builds the local PWA and backend, then starts the compiled backend
and the loopback web server together. The built app uses the same private proxy and cross-site guards as development.
You do not need Docker or a token-entry step. This is a personal local runner, not a public production hosting server.

`pnpm build:local` builds without starting either process and does not require a private token. `pnpm start` alone retains its backend-only behavior;
`pnpm build` retains the static preview/Docker production build behavior.
The web server binds to `127.0.0.1`; keep this trusted-local access boundary. Anyone with access to the local
web port can use the owner's data. Public/shared hosting requires authenticated ingress or manual bearer access.

## Browser compatibility

Draft, set and submission UUIDs use `crypto.getRandomValues` when `crypto.randomUUID` is unavailable on a
plain HTTP origin. This covers the logger, individual-set editing and live training. HTTPS is still needed
for PWA service workers and installation from a non-localhost device.

## Upgrade and troubleshooting

Keep your private `.env` and existing PostgreSQL data directory. Stop the old app processes, update the source,
then run `pnpm dev` or `pnpm start:local`. This release adds no new migration.
If upgrading by extracting a ZIP, use a fresh source directory and copy only your configuration across.

- Database unavailable: start your PostgreSQL service and check `DATABASE_URL` credentials, database and port.
  `pnpm db:check` reports readiness without printing the connection string.
- Proxy connection refused: check that `HOST`/`PORT` match the running backend, and restart both processes.
- Startup configuration error: run `pnpm local:init` from the project root. Existing invalid tokens are reported
  without exposing their values; fix those explicitly. For separate frontend/backend processes, initialize first.
- Environment file location: keep `.env` beside the root `package.json`, not inside `frontend/`.
  Vite resolves this location from its config file, including when invoked from another working directory.
- Port 8080 already used: stop the old frontend process. The built local runner refuses to silently change its port.
- Connection failed during startup: restore backend/database availability; the app retries automatically.

PostgreSQL owns persistent records. Unsaved drafts and remote credentials remain in tab memory.
Your operating system's PostgreSQL data directory controls persistence; `workout_data` remains the named volume
for the optional Docker setup, not a prerequisite for this native setup.

## Verification

Tests cover legacy local URLs, configured backend ports/API prefixes, private server-only headers, development
and built-app proxy settings, remote authentication preservation, startup loading/saves and cross-site blocking.
The standalone frontend/backend build and checks are verified. An actual native PostgreSQL service and browser
are unavailable in the delivery environment, so complete local startup/persistence requires checking on your host.

# Form — Workout Studio

Form is a personal workout PWA with a searchable library of 3,201 exercises, real instructional images,
controllable frame demonstrations, custom routines, live per-set training, rest timers, a daily workout journal,
and exercise progress charts calculated from saved sessions.
Saved routines and date-filtered journal entries can also be downloaded as spreadsheet-safe CSV files.
The visual design uses soft olive surfaces, generous spacing, and an editorial training banner.

## Release 2.2

The catalog adds 2,325 described records from licensed snapshots, for 3,201 exercises total. It includes 1,960 bundled
image assets, three real animations with still posters, and 49 original video links. 1,041 exercises have images;
text-only entries are labelled clearly. Five original references have no source instructions and show a missing-steps
message. Existing exercise IDs remain unchanged. See `docs/CATALOG-SOURCES.md` for exact source counts and rights.

Create/edit private exercises and delete unused custom references through the authenticated PostgreSQL API.
Custom content joins catalog search, filters, routine selection and progress; My exercises isolates authored entries.
Related movements share listed primary muscles. Builder substitutions preserve position, sets and reps while resetting
load to 0 kg; saved records and active workouts stay unchanged. See `docs/RELEASE-2.2.md` for compatibility and upgrades.

Rerun `pnpm db:seed` after applying existing migrations, before saving routines using new public references.
Custom writes use the existing exercise JSON table and never overwrite imported IDs. Existing foreign keys prevent
referenced custom entries being deleted; the API returns `EXERCISE_IN_USE` without erasing routines or history.
No new application dependency, package manifest, database technology or migration was introduced.

## Release 2.0

Start a routine or builder draft, record different values for each set, compare previous performance, minimize/resume
training, and finish with a reviewed session. Timers support pause/resume, skip, adjustable rest and optional sound.
The journal retains actual set values; progress includes exercise records, selectable charts and exact-value tables.
See `docs/RELEASE-2.0.md` for data definitions, compatibility behavior and migration requirements.

## Delivered experience and deployment boundary

The private Sites deployment is the frontend preview. Its catalog, filters, demonstration frames, bookmarks, live workout mode and rest timers,
workout drafts, and journal forms are usable immediately. **Saving and syncing require a separately deployed
Express API backed by PostgreSQL.** The preview consistently identifies this boundary and never reports an
unsaved draft as a saved workout. Nothing substitutes browser storage for PostgreSQL.

Sites runs static assets or Cloudflare Workers, not a persistent Express process with a TCP PostgreSQL pool.
The supplied backend therefore remains a normal Node application and is not hosted inside the private preview.
Use the connection dialog to supply its HTTPS `/api/v1` URL and private token after deploying it.
Do not publish the API without its authentication and configured origin allow-list.

This is a **single-owner application**. The bearer token authorizes all personal records in that server deployment.
It is not a multi-user account system. Deploy one API/database per owner; adding multiple users requires a user
identity model and owner filters on every record query before that deployment can safely be shared.

## Dependency purposes

| Dependencies                                            | Purpose                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| React, react-dom                                        | Component rendering and DOM root lifecycle.                          |
| Vite, @vitejs/plugin-react                              | Frontend compilation, development server and React transforms.       |
| TypeScript, @types/react, @types/react-dom, @types/node | Strict language checks and platform type declarations.               |
| Express, @types/express                                 | Typed HTTP routing and middleware.                                   |
| Zod                                                     | Configuration and request/response runtime validation.               |
| Drizzle ORM, pg, @types/pg, drizzle-kit                 | Typed PostgreSQL access, pooled driver and migration generation.     |
| Helmet, CORS, @types/cors                               | HTTP header hardening and explicit browser origin policy.            |
| pino, pino-http                                         | Structured redacted application/request logs.                        |
| express-rate-limit                                      | Bounded protected API traffic.                                       |
| dotenv                                                  | Local server settings through the central configuration module only. |
| lucide-react                                            | Consistent UI icons.                                                 |
| tsx                                                     | TypeScript loading in local server and maintenance scripts.          |
| concurrently                                            | Supervises the two development processes.                            |
| oxlint, Prettier                                        | Lint conventions and source formatting.                              |
| Vitest, Supertest, @types/supertest                     | Service/API tests and HTTP integration probes.                       |
| Testing Library React, user-event, jest-dom, jsdom      | DOM interaction and accessibility-oriented UI tests.                 |

## Prerequisites

- Node.js **24.19.0** in the 24.x release line; `.nvmrc` and the package engine agree.
- pnpm **11.25.0**, pinned in `packageManager` and engines.
- Docker with Compose for the documented local database, or your own PostgreSQL **17** instance.
- A PostgreSQL database and credentials for the API; a separate disposable database ending in `_test` for DB tests.

TypeScript is pinned to **6.0.3**, the latest compatible JavaScript compiler used here. The installed 7.0.2 native
compiler could not run in this managed environment because `/proc/self/exe` is unavailable. See the validation report.
All other resolved dependency versions are recorded in the root manifest and the committed lockfile.

## Quick start

1. Copy `.env.example` to `.env`. Keep `.env` private and outside source control.
2. Replace `API_ACCESS_TOKEN` with a random private value of at least 32 characters.
3. Set `VITE_API_BASE_URL=http://localhost:3001/api/v1` for local development.
4. Keep `CORS_ALLOWED_ORIGINS=http://localhost:5173` for the local Vite frontend.
5. Start the database, apply migrations, seed reference data, and run the two processes:

```bash
pnpm install
pnpm db:setup
pnpm dev
```

Open the local Vite URL printed in the terminal. Choose **Connect workout API**, enter the API URL and the private
token, and connect. Credentials remain in memory for the current tab. Refreshing requires reconnection.
The catalog is immediately available without a backend; saved routines and history load after connection succeeds.

### Local PostgreSQL port and persistent storage

Compose runs PostgreSQL 17 on **5433**, including its internal listening port, loopback host mapping and health check.
The provided database URLs use `localhost:5433`. The Docker volume is named exactly **`workout_data`** and is mounted
at `/var/lib/postgresql/data`. Docker stores this volume independently of the container; restarting or recreating the
service and `pnpm db:down` retain its contents. The database restarts automatically unless explicitly stopped.
Volume removal or Docker volume pruning can still destroy data; keep separate backups.

`pnpm db:setup` starts the database, waits for readiness, applies committed migrations, idempotently seeds the public
catalog, and checks connectivity. It stops at the first failure. Docker and Compose must already be installed and running.
The managed build runtime used for this delivery has no Docker executable and cannot run an unprivileged PostgreSQL
process, so this configuration could not be started here. It does not provision a database for the private hosted Site.

If upgrading an existing installation using the earlier `form_database` volume, its records are **not automatically
copied** into `workout_data`. Retain the old volume and back up/restore its database before switching a populated system.
The supplied stop command never requests volume deletion. The example credentials are for loopback local development;
use private credentials and a managed backup policy for a deployed PostgreSQL instance.

## Root commands

There is exactly **one `package.json`**, at the repository root. Both application directories use it.
`pnpm-workspace.yaml` contains only the pnpm 11 build-script permission for `esbuild`; it declares no workspace
packages and does not introduce a monorepo or extra manifest.

| Command                | Responsibility                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm install`         | Installs the complete frontend and backend dependency graph.                             |
| `pnpm dev`             | Runs Vite and the API together; concurrently stops the other process when either exits.  |
| `pnpm dev:frontend`    | Runs Vite using the frontend-specific configuration.                                     |
| `pnpm dev:backend`     | Runs Node watch mode with the tsx TypeScript loader.                                     |
| `pnpm db:up`           | Starts only the PostgreSQL 17 Compose service and waits for its health check.            |
| `pnpm db:down`         | Stops Compose without deleting the database volume.                                      |
| `pnpm db:setup`        | Starts PostgreSQL on 5433 with `workout_data`, migrates, seeds, and checks connectivity. |
| `pnpm db:test:prepare` | Creates the explicitly configured disposable test database if missing; never drops it.   |
| `pnpm db:generate`     | Generates a versioned Drizzle SQL migration from schema changes.                         |
| `pnpm db:migrate`      | Applies committed migrations as a separate operation.                                    |
| `pnpm db:seed`         | Idempotently imports only public exercise reference records.                             |
| `pnpm db:check`        | Executes a real lightweight PostgreSQL query.                                            |
| `pnpm build`           | Builds frontend static assets and compiles the backend independently.                    |
| `pnpm build:frontend`  | Type-checks, runs Vite, and creates the versioned PWA precache manifest.                 |
| `pnpm build:backend`   | Compiles backend and shared contracts into `backend/dist`.                               |
| `pnpm preview`         | Serves the production frontend build locally.                                            |
| `pnpm start`           | Starts only the compiled Express server; migrations are not run implicitly.              |
| `pnpm lint`            | Runs oxlint with warnings treated as failures.                                           |
| `pnpm typecheck`       | Checks strict frontend and backend TypeScript configurations.                            |
| `pnpm test`            | Runs Vitest in watch mode.                                                               |
| `pnpm test:run`        | Runs UI/API tests and DB tests when the dedicated database is configured.                |
| `pnpm test:db`         | Runs only the real PostgreSQL integration suite.                                         |
| `pnpm format`          | Formats authored source and configuration.                                               |
| `pnpm format:check`    | Verifies formatting without rewriting source.                                            |
| `pnpm check:structure` | Checks component size, line length, named-function documentation and conventions.        |

The Node `--import tsx` loader avoids creating a separate CLI IPC socket for one-shot database commands.
The process runner exists solely to supervise the two development applications.

## Repository responsibilities

```text
frontend/
  src/app/                 screen composition, typed configuration and coordination hook
  src/features/exercises/  catalog discovery, filters, cards, detail and motion controls
  src/features/training/   routines, editor, prescriptions, journal, progress and HTTP services
  src/components/layout/   responsive navigation, page header and installation affordance
  src/components/ui/       native accessible dialog and render error boundary
  src/lib/api/             centralized fetch, runtime parsing and normalized transport errors
  src/lib/logger/          narrowly scoped browser diagnostic logger
  src/styles/              responsive CSS and visual tokens
  public/                  PWA metadata, service worker, fonts and bundled media
backend/
  src/app/                 independent application factory, environment and middleware
  src/features/training/   controllers, routes, service, typed repository interface and repositories
  src/features/exercises/  PostgreSQL catalog reads
  src/db/                  pooled connection, typed tables, migrations and explicit maintenance scripts
  src/lib/                 safe errors and redacted structured logging
  src/constants/           operational bounds and process signals
shared/                    dependency-light Zod HTTP contracts and domain constants
scripts/                   build precache generation and source-convention verification
compose.yaml               local PostgreSQL service only
```

No backend module imports frontend implementation code. No frontend module imports backend runtime code.
The shared directory contains transport contracts and public reference data, not server credentials.

## API flow and contracts

The flow is component → hook → feature service → centralized API client → HTTP controller → service → repository
→ PostgreSQL. Controllers parse untrusted bodies and route parameters using Zod and translate HTTP concerns only.
Services validate references and unique exercise selection. Repositories own all Drizzle queries and transactions.

The configurable API prefix defaults to `/api/v1`.

| Method and path               | Authentication | Result                                                        |
| ----------------------------- | -------------- | ------------------------------------------------------------- |
| `GET /api/v1/health`          | Public         | Liveness; independent of PostgreSQL.                          |
| `GET /api/v1/ready`           | Public         | Readiness; executes `SELECT 1`, returns 503 when unavailable. |
| `GET /api/v1/capabilities`    | Bearer token   | Release metadata and required per-set/safe-finish features.   |
| `GET /api/v1/exercises`       | Bearer token   | PostgreSQL exercise reference records.                        |
| `GET /api/v1/workouts`        | Bearer token   | Saved custom routines with ordered prescriptions.             |
| `POST /api/v1/workouts`       | Bearer token   | Validated routine creation.                                   |
| `PUT /api/v1/workouts/:id`    | Bearer token   | Atomic routine and item replacement.                          |
| `DELETE /api/v1/workouts/:id` | Bearer token   | Routine deletion with cascading item cleanup.                 |
| `GET /api/v1/sessions`        | Bearer token   | Training history, ordered newest training date first.         |
| `POST /api/v1/sessions`       | Bearer token   | Session with date, duration, notes, sets, reps and load.      |
| `DELETE /api/v1/sessions/:id` | Bearer token   | Session deletion and item cleanup.                            |

Success envelopes use `{ data: ... }`; collections use the same shape with an array. Deletion returns `{ data: null }`.
Failures use `{ error: { code, message, details? }, requestId? }`. Examples of codes include `VALIDATION_ERROR`,
`UNAUTHORIZED`, `NOT_FOUND`, `UNKNOWN_EXERCISE`, `DUPLICATE_EXERCISE`, `RECORD_CONFLICT`, `RATE_LIMITED`,
`DATABASE_UNAVAILABLE`, and `INTERNAL_ERROR`. Expected status codes live in `shared/constants.ts`.

A workout request contains `name`, `notes`, and `items`. Each item contains `exerciseId`, `sets`, `reps`, and `weight`
in kilograms. A session also includes an ISO calendar `date` and integer `duration` in minutes. Each exercise appears
once per record. Routine items retain an aggregate prescription. Completed session items may include
`performedSets`, each with a UUID `id`, `reps`, `weight`, optional/null `rpe` and `kind` (`working` or `warmup`).
When those values exist, the aggregate count and last-set values must agree with them. Optional `submissionId`
provides safe completion retries. Legacy uniform session entries remain valid.
Resource identifiers are UUIDs. Invalid calendar dates, excessive values, duplicate exercises and unknown references
are rejected. Reads are bounded to the most recent 1,000 records; pagination is an extension point for larger histories.

The frontend uses its bundled public catalog for offline discovery and fetches private records only after connection.
Private responses are validated against shared Zod schemas. A failed save leaves the editor and draft intact and
shows a readable error inside the active dialog. A successful save updates the visible collection only after the API confirms it.

## PostgreSQL and migration conventions

Drizzle uses `pg.Pool` with a configured connection count and timeout. One pool belongs to one process.
Exercises have stable catalog IDs. Workouts and sessions have UUID primary keys, timestamp metadata, and
separate item tables with foreign keys, positive numeric checks, stable positions, and cascade deletion.
The composite primary keys prevent duplicate exercises within one workout or session.

Creation inserts metadata and exercise items in one transaction. Replacement updates the parent, deletes old items,
and inserts new items in one transaction. A failed replacement rolls back the metadata and restores the previous list.
No raw user-input SQL is concatenated. The pool is closed only after HTTP traffic drains during shutdown.

Schema changes start in `backend/src/db/schema/tables.ts`. Generate a migration with `pnpm db:generate`, inspect
its SQL and snapshot metadata, commit both, and apply it with `pnpm db:migrate` before starting a compatible server.
Never generate schema changes automatically in production. Application startup verifies connectivity but does not
run migrations or seed personal data.

The seed imports public catalog data only and is idempotent. It does not insert demonstration workout records,
accounts, passwords, tokens, journal sessions or fake progress. Media paths refer to the frontend's static deployment.

## Configuration and secrets

All server environment reads belong to `backend/src/app/config/environment.ts`. Missing or invalid required
configuration fails startup. Browser configuration belongs to `frontend/src/app/config/environment.ts`.

| Variable                                      | Purpose                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `NODE_ENV`                                    | Development, test or production behavior.                                                |
| `HOST`                                        | Bind address; local default is loopback. Set explicitly for your production platform.    |
| `PORT`                                        | Express listening port; default 3001.                                                    |
| `CORS_ALLOWED_ORIGINS`                        | Comma-separated exact frontend origins. Include the hosted Site URL for that deployment. |
| `LOG_LEVEL`                                   | Pino severity.                                                                           |
| `API_PREFIX`                                  | Versioned `/api/vN` prefix.                                                              |
| `DATABASE_URL`                                | Required private PostgreSQL connection URL.                                              |
| `DATABASE_POOL_MAX_CONNECTIONS`               | Per-process pool bound; default 10.                                                      |
| `DATABASE_CONNECTION_TIMEOUT_IN_MILLISECONDS` | Connection timeout; default 5000.                                                        |
| `API_ACCESS_TOKEN`                            | Private single-owner bearer token, at least 32 characters.                               |
| `TEST_DATABASE_URL`                           | Optional dedicated disposable PostgreSQL database ending in `_test`.                     |
| `VITE_API_BASE_URL`                           | Public API URL embedded in the static frontend; blank for a disconnected preview.        |

Never prefix server credentials with `VITE_`. Never add secrets to the repository, frontend build, access logs,
or the hosting manifest. The static Site does not contain a token. The connection dialog retains it only in tab memory.

The bearer credential remains valid until operator rotation; there are no browser cookies, refresh tokens or implicit
sessions. Generate high-entropy tokens, deliver them privately, and rotate them in deployment secrets. Rotation
invalidates old clients immediately after the server restarts. Reconnect with the new token. Use TLS for remote APIs.
This explicit mechanism is suitable for the private single-owner scope, not a replacement for multi-user identity.

## Security and lifecycle

Bootstrap loads typed settings, creates the logger and bounded pool, verifies PostgreSQL, builds the Express app,
and only then listens. Importing `createApp.ts` never starts a listener.

Middleware order is intentional: Helmet → request correlation ID → redacted request logging → bounded JSON parser
→ explicit CORS → independent probes → protected API rate limit and authentication → feature routes → not-found
→ centralized errors. Every request receives a generated correlation identifier. Known failures map to safe
responses; unknown failures do not expose stack traces, database messages, paths or secrets.

Pino redacts authorization, cookies, tokens, passwords and request bodies. The browser logger reports error types
without application data. The API is single-owner; every personal endpoint requires the same constant-time compared
bearer token. Public probes expose no connection strings. The API limits authenticated-route traffic to 120 requests
per minute and JSON bodies to 1 MiB. Configure trusted proxy behavior explicitly if your platform requires it.

SIGINT and SIGTERM stop accepting requests, drain active work, and close the PostgreSQL pool. A bounded deadline
forces connection cleanup. Uncaught failures and server errors use structured logging and nonzero shutdown.

## Testing and verification

The UI suite covers live start/minimize/resume/review, failed completion preservation, working-volume calculations,
previous-set matching, clock deadline catch-up, chart/table interaction, API feature compatibility, catalog search/equipment filtering, actual exercise instructions and frame controls, duplicate
selection prevention, failed-save draft preservation, and honest empty progress. The API suite covers request
validation, bearer authentication, liveness/readiness failure behavior, route identifiers, error envelopes, CORS,
security headers, service business rules, and safe unexpected-error translation.

The separate real PostgreSQL suite covers per-set storage, concurrent finish retries, content-conflict detection,
actual-set rollback, CRUD, foreign keys, duplicate keys, positive-value checks, creation and
replacement rollback, cascade cleanup, concurrent independent writes, and readiness against a real query.
It is skipped only when `TEST_DATABASE_URL` is unset; skipping is visible in Vitest output and is not a passing DB check.
When a URL is provided, connection/migration failures fail the suite instead of being swallowed.

Set `TEST_DATABASE_URL=postgresql://form_local:development_only@localhost:5433/form_test` for the local Compose instance,
then run `pnpm db:test:prepare`. This explicit command connects to the test server's `postgres` maintenance database,
creates the dedicated database only if missing, and checks ownership when it exists; it never replaces or clears data.
The creation identity needs `CREATEDB` permission; the local Compose identity has it. For managed hosting, an administrator
can instead create the isolated test database first. Use a test role with access only to that disposable database.

The name safeguard accepts lowercase ASCII database names ending in `_test`, and rejects the primary application's
database name even if that name ends in `_test` or the URL uses a hostname alias. Existing dedicated test databases
are reused, so do not store personal records there.
The suite applies migrations before tests and clears only test-database routines and sessions between tests.
**Never point integration tests at personal or production data.**

```bash
pnpm lint
pnpm format:check
pnpm check:structure
pnpm typecheck
pnpm test:run
pnpm db:test:prepare
pnpm test:db
pnpm build
```

See `docs/VALIDATION.md` for the exact executed results and environment limitations.
Browser layout, focus behavior, native install prompts, service-worker behavior and device-specific offline behavior
still require manual browser verification; DOM tests do not certify those capabilities.

### CSV exports

Choose **Export CSV** in My workouts or the Journal. The journal export includes only the sessions matching its date
filter. Export is disabled when that selection is empty. Only loaded saved records are included; drafts and unsaved
active workouts are not exported. The current API read limit is 1,000 records, so this is an export of the loaded
selection, not a complete database backup for larger histories.

Files use UTF-8 with a BOM, quoted fields, and CRLF row endings. Columns include record identity, creation timestamp,
session date/duration, notes, exercise identity/name/order, set identity/order/classification, reps, kilograms and effort.
Actual sets each get a row marked `performed`; routine prescriptions are marked `prescribed`. Legacy uniform session
entries remain one aggregate row with `set_count` and `legacy_uniform`, without invented set IDs or classifications.
Formula-like text is prefixed with an apostrophe for spreadsheet safety. CSV import is not implemented in this release.
Downloads contain personal training data and remain under the user's control.

## PWA and offline behavior

The Web App Manifest defines standalone installation, theme colors, and correctly sized icons. The install affordance
uses the native installation event when available and explains the iOS Add to Home Screen path otherwise.
The build script generates a precache manifest for hashed application assets, local fonts, catalog data and icons.
The service worker uses a build-derived version to invalidate old caches. Its static network-first strategy supports
cached navigation and previously viewed exercise images offline. All 1,960 image assets are bundled on the server,
but only viewed frames are cached on the device; initial installation does not download the entire photo collection.

The service worker never caches API responses, authorization-bearing requests, or writes. Offline drafts and
bookmarks remain in tab memory and are lost on reload. The persistent application database is PostgreSQL only.
Cache API is used solely for read-only application assets, not workout or journal persistence.

## State, components and code conventions

Local UI state controls dialogs, inputs, discovery filters, bookmarks and drafts. Server state owns saved routines and
sessions. `useRecords` centralizes loading, pending states and API failures. `useCatalog` owns public discovery;
`useStudio` coordinates screen navigation and drafts. `useLiveWorkout` owns per-set training and completion phases;
`useRestTimer` uses wall-clock deadlines and `progress.utils.ts` derives saved exercise metrics. No global state dependency is necessary for this scope.

Named functions include JSDoc descriptions with typed parameter entries and return documentation where applicable.
Component docs describe the props object and every individual prop. Use descriptive names, camel case variables,
Pascal case components, and stable exercise/UUID keys. Strict TypeScript checks include unused code, unchecked
array access and override correctness. Avoid `any`, suppression comments and non-null assertions.

Keep component files at or below 100 lines. Move submissions, calculations or side effects into a nearby hook,
and move independent control groups into a small presentational component. Create shared UI only when responsibility
is genuinely shared. Feature internals do not import another feature's internals. HTTP paths belong in contracts;
components do not call fetch or query the database.

Multiline JSX uses one attribute per line and no spreading. Prettier uses `printWidth: 120` and
`singleAttributePerLine: true`. The source checker enforces the 120-character limit on authored implementation;
the upstream exercise JSON and generated migration metadata are data, not handwritten component source.

Semantic HTML, native buttons, associated form labels, a skip link, visible keyboard focus, meaningful image text,
native modal dialogs and reduced-motion preferences support accessibility. Responsive layouts cover desktop,
tablet and mobile breakpoints. Browser-based accessibility verification remains necessary.

## Constants and linting

Operational values, domain limits, icon dimensions and defaults live in documented constants near their use.
Fixed states use union types or `as const` objects. Single-use visible labels and descriptive HTML attributes remain
inline when their purpose is obvious. Exercise prose belongs to the attributed read-only dataset.

```ts
/** Named defaults make prescriptions consistent across forms and APIs. */
export const WORKOUT_DEFAULTS = { sets: 3, reps: 10, weight: 0, duration: 45, pageSize: 12 } as const;
```

Oxlint enforces the requested supported rules, React hooks, accessibility, unused code and no-magic-numbers.
Warnings fail `pnpm lint`. Its numeric policy allows the obvious 0, 1 and -1, ignores array indexes, and treats
constant definitions and test fixtures through narrow overrides. String conventions require human review;
no claim is made that oxlint reliably detects magic strings.

The allowed rule changes are documented exactly in `docs/VALIDATION.md`: plugin activation, `.tsx` JSX extension,
numeric enforcement, the narrowly scoped logger override and five unsupported requested rules. The original values
of unsupported rules are preserved for reference in `docs/unsupported-oxlint-rules.json`.
The source checker and strict TypeScript cover applicable conventions; they are not advertised as perfect lint equivalents.

## Adding a feature

1. Define HTTP contracts and named paths in `shared/` without importing either application's implementation.
2. Add the typed Drizzle schema if persistent data is required; generate and inspect a migration.
3. Add feature-specific repository methods and a narrow injectable interface.
4. Implement service rules, safe errors, input schemas, controllers and route composition.
5. Register the feature behind authentication in `createApp` and add observable HTTP/database tests.
6. Add a feature service that uses the centralized browser API client.
7. Add a focused hook for server/loading/error state, small components, and a composing screen.
8. Run all relevant checks and update this README, API table and deployment plan.

## Adding a component

1. Keep the component beside the feature it serves; move it to shared UI only for a real shared responsibility.
2. Define each prop on its own line with clear boolean/callback names.
3. Add JSDoc for the props object and every prop in interface order.
4. Use native elements, labels, focus styles, stable keys and explicit JSX attributes.
5. Extract a hook or child when the complete file would exceed 100 lines.
6. Write interaction tests when the behavior is consequential; avoid implementation-mirroring tests.
7. Run formatting, structural checks, lint and type-checks.

## Production operations

Deploy the static frontend to HTTPS hosting and the compiled API to a Node 24 environment with PostgreSQL 17.
Configure the API's `HOST`, TLS/reverse proxy, exact frontend origin, pool limits and secrets explicitly.
Run migrations as a release step before starting the new API process. Apply backward-compatible expand/contract
migrations for rolling releases; delay removing old columns until old processes have drained.
Build frontend assets with a public API URL or enter the URL through the app's connection dialog.
Serve `dist/` as static files; the frontend requires no production Node process.

Keep runtime DB credentials least-privileged: allow only needed SELECT/INSERT/UPDATE/DELETE on application tables.
Use a separate migration identity for schema changes. Size total pool capacity across all API instances to fit the
managed PostgreSQL connection limit with operational headroom. Monitor readiness, latency, rate-limit failures,
connection counts, failed writes and backup success using redacted logs and your hosting platform's tooling.

Use encrypted managed backups and point-in-time recovery where available. For logical backups, your database
administration tooling should dump the database, encrypt the output, and store it in restricted off-host storage.
Exercise restoration into an isolated database regularly, verify migrations and reference counts, and document
recovery-point/recovery-time objectives. Never test restoration by replacing the live owner's data.
Rotate database credentials through deployment secrets, redeploy the pool configuration, verify readiness, and
revoke old credentials after traffic drains. Secrets never belong in a downloadable frontend or this repository.

## Troubleshooting

- **Backend exits before listening:** verify required configuration and `pnpm db:check`; the process deliberately
  refuses startup without PostgreSQL.
- **401 response:** check the private token; operator rotation invalidates the previous value.
- **Browser cannot reach API:** use a remote HTTPS URL and exact CORS origin; run both local apps together for local work.
- **Empty library:** reload online; static catalog loading provides a visible retry screen.
- **Failed save:** read the active form error, reconnect the API if necessary, and retry; the draft remains available.
- **DB tests skipped:** configure a disposable `_test` database; skipped tests do not verify persistence.
- **Migration conflict:** inspect the migration history before changes; never delete production migration records blindly.
- **Offline images missing:** only previously visited frames are cached; open them online first.
- **Install button unavailable:** use the browser's installation affordance or iOS Share → Add to Home Screen.

## Git and review checklist

Commit source, lockfile, schema migrations and metadata together. Keep credentials, local caches, compiled backend,
frontend build output and test artifacts ignored. Use clear commits describing the behavior rather than generated-file counts.

Before review, check functionality, meaningful UI/API/database tests, lint with zero warnings, type-checks, formatting,
component size, JSDoc, naming, constants, responsiveness, accessibility, error states, dependency boundaries,
HTTP contracts, documentation, authentication and migration order. Record unverified environment prerequisites explicitly.

## Content and media provenance

The original 876 exercise records and original frames come from **yuhonas/free-exercise-db**, advertised by its maintainer as a
public-domain dataset under the Unlicense. Three source records have no photographs and clearly display a text-guide fallback.
The bundled frames are resized WebP conversions, not generated
technique videos. The detail preview alternates actual photographic positions and identifies its frame count.
External YouTube links open exercise-name searches; no external video is represented as reviewed or bundled.

Source: https://github.com/yuhonas/free-exercise-db
Hero photo: https://images.unsplash.com/photo-1534438327276-14e5300c3a48 (Unsplash image CDN).
DM Sans and Manrope are bundled Google Fonts under their respective SIL Open Font Licenses.
See `THIRD_PARTY_NOTICES.md` and `licenses/` for copied license terms.

## Custom catalog HTTP contracts

| Method/path                           | Result                                                                |
| ------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/v1/exercises/custom`        | Authenticated private authored entries only.                          |
| `POST /api/v1/exercises/custom`       | Validated owner content with server-assigned `custom_` UUID identity. |
| `PUT /api/v1/exercises/custom/:id`    | Updated private content, stable reference ID.                         |
| `DELETE /api/v1/exercises/custom/:id` | Removes unused custom references; 409 if used by saved records.       |

Inputs contain name, difficulty, equipment, category, primary/supporting muscle arrays, instruction steps and an optional
HTTPS image URL. Shared schemas reject identity/source overrides, empty steps and executable or credential-bearing image
URLs. The API never fetches custom images; the browser uses the owner's supplied link with a visible failure fallback.
The application supports one owner per API deployment. Imported public references cannot be edited through these routes.

Connection loads custom entries only when the server advertises `custom-exercises`. Older per-set-compatible APIs still
support their existing training flows; saving custom content requires release 2.2. New private content enters visible
collections only after confirmation, and failed writes preserve the form. Owner records never enter public JSON or caches.

## Expanded media and source handling

Credits, original links, modifications and separate text/image licenses appear in exercise details and `/catalog-licenses.html`.
MIT permissions and original copyrights are bundled with the Site. wger English descriptions use their translation-specific
license, and each image/video retains independent attribution. ShareAlike adaptations retain their original license.
Restricted Gym visual media and uncertain purchased videos are excluded. Source-generated Arham Wani metadata is identified.
No combinations or source instructions were invented to inflate the catalog; different names can still overlap semantically.
Missing difficulty remains unspecified and missing anatomy remains unknown. Filters include actual catalog labels and search
includes aliases. The import tool, snapshots, accounting and legal texts are documented in `docs/CATALOG-SOURCES.md`.

Image galleries are labelled separately from original start/end photographic frame sequences. Real animations and thumbnails
start still; motion requires a deliberate play action. H.264 source videos stream on demand and start muted; other codecs have
external original links. Source captions are unavailable; written guides remain available. Streaming depends on the source
host and browser and is not cached offline. Browser playback, animation behavior and native modal focus still require QA.
The PWA precache includes legal notices and versioning covers catalog/notice contents so catalog-only changes invalidate old
static caches. PostgreSQL remains configured on 5433 with the persistent Docker volume workout_data; it could not run here.

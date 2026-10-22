# Form — Workout Studio

## Multiple app addresses (2.29)

Docker now supports a comma-separated frontend address allowlist. The supplied Compose publishes both
http://rpi5:2324 and http://rpi5.nord:4983 through one frontend and the same backend/database.
See [RELEASE-2.29.md](docs/RELEASE-2.29.md) for the image-based Compose update and compatibility notes.

## Inline set controls (2.28)

Mobile set rows place the set label and a bin icon directly beside the equal-width repetitions and weight
fields. The icon keeps an accessible label and a 44px touch target. See [RELEASE-2.28.md](docs/RELEASE-2.28.md).

## Wider mobile set inputs (2.27)

Repetitions and weight now share the available mobile row width equally, with the set label and Remove
button on a separate row. Inputs are taller and numbers larger. See [RELEASE-2.27.md](docs/RELEASE-2.27.md).

## Personal collection and review editing (2.26)

My exercises includes custom exercises and movements used in saved workouts or the current draft.
Existing workouts populate the collection automatically, with canonical IDs and aliases counted once.
Saved-workout reviews now offer Edit workout, retaining notes, set targets and component references.
See [RELEASE-2.26.md](docs/RELEASE-2.26.md) for behavior and update instructions.

## Compact mobile training (2.25)

Phone workout lists use compact thumbnail rows with Start and More. Previews summarize targets with
expandable exact sets; editor notes, options and composition controls fold away; exercise details use
smaller media and expandable technique sections. Draft values and individual set overrides survive toggling.
See [RELEASE-2.25.md](docs/RELEASE-2.25.md) for details and update instructions.

## Library popup and set entry (2.24)

The floating workout action dock opens a separate exercise-library popup with search, filters, thumbnails,
infinite scrolling and technique review. Public exercise names use consistent capitalization. Set 1 reps and
weight copy independently to following sets; later sets remain individually editable, and live completed sets
are protected. See [RELEASE-2.24.md](docs/RELEASE-2.24.md) for behavior and update instructions.

## Training studio redesign (2.23)

Form now has a cohesive light/dark visual system, refined typography, clearer exercise discovery, a desktop
weekly training summary, and reachable mobile navigation. Workout cards use their actual exercise thumbnails;
editors, per-set controls, charts and journal screens share the same presentation. Appearance persists between
visits. All training, catalog, Docker and native-running capabilities are retained.
See [RELEASE-2.23.md](docs/RELEASE-2.23.md) for details and update instructions.

## Further exercise restoration (2.22)

The catalog now contains **1,482 exercises**, restoring 28 more movements with **84 local images** and descriptions,
resolving 14 duplicate references, and adding three Muscle & Strength guides with two direct video links.
The selected Flow illustrations keep their AI-generated label and manual image controls. All 4,089 historical IDs
remain represented, including saved workout references. **2,021 entries remain archived pending suitable media**.
See [RELEASE-2.22.md](docs/RELEASE-2.22.md), the [full status CSV](docs/catalog-restoration-status-2.22.csv), and
[the independent media notices](licenses/alternative-sources-MEDIA-notices.txt).
Run `pnpm catalog:verify-restoration` to verify current dispositions and all **534 assets** across the restoration passes.

## Additional-source restoration (2.21)

The 2.21 catalog contained **1,454 exercises**. That pass restored 50 archived movements, resolves 11 duplicate
references and adds 139 images plus one local video. Wikimedia Commons provides credited real footage/photographs;
48 restored movements use reviewed Flow illustrations, clearly labeled as AI-generated static positions in the app.
All 4,089 historical IDs remain represented. That pass left **2,063 entries awaiting suitable reusable media**.
See [RELEASE-2.21.md](docs/RELEASE-2.21.md), the [full status CSV](docs/catalog-restoration-status-2.21.csv), and
[the independent media notices](licenses/alternative-sources-MEDIA-notices.txt).
The current verifier also includes subsequent restoration passes.

## Catalog restoration continuation (2.20)

The 2.20 catalog contained **1,404 exercises**, after restoring 22 more archived movements and resolving 16 duplicate
references. This continuation adds 31 local videos and 31 thumbnails, including enrichment of nine existing movements.
All 4,089 historical IDs remain represented for saved workouts. It left **2,124 entries awaiting verified reusable media**.
See [RELEASE-2.20.md](docs/RELEASE-2.20.md) and the [complete status CSV](docs/catalog-restoration-status-2.20.csv).
Run `pnpm catalog:verify-restoration` to check current dispositions and all 310 assets from the two restoration passes.

## Catalog restoration (2.19)

The 2.19 catalog contained **1,382 exercises**. That pass restored 95 archived movements with local videos,
images and descriptions, and consolidated 127 duplicate references. Every historical ID remains available to saved
workouts. It left **2,162 entries awaiting verified reusable media**; the continuation above gives current counts. OpenGym metadata
was checked, but its current media terms prohibit reuse in an independent application without a separate license.
See [RELEASE-2.19.md](docs/RELEASE-2.19.md) and the [complete status CSV](docs/catalog-restoration-status-2.19.csv).
Its 248 new media assets remain included and verified in the continuation.

## Requested exercise names and motion (2.18)

Seven requested movements are now searchable by their supplied names. Existing pec fly, rope face pull,
dumbbell reverse lunge and seated single-arm high row IDs are retained. The kettlebell single-arm calf raise is
restored, while low-held kettlebell lateral lunge and single-arm twisting dumbbell curl are distinct additions.
All visible entries have local images or genuine motion frames. Biceps remains a muscle filter.
See [RELEASE-2.18.md](docs/RELEASE-2.18.md) for the per-exercise decisions and publisher-specific video terms.

## Per-exercise notes (2.16)

Add an optional note below each movement in the workout builder or manual log. Notes belong to the workout entry,
so one exercise can have different reminders in different workouts. Notes appear in workout review, follow nested
workouts and copies, and carry into a live session. Live edits are saved in journal history without changing the
source routine. CSV export/import preserves exercise notes; earlier Form CSV files remain supported.

See [the update instructions](docs/RELEASE-2.16.md) for the additive PostgreSQL migration and Docker/local commands.

Form is a personal workout PWA with a searchable library of 1,482 image-backed exercises, real instructional images,
controllable frame demonstrations, custom routines, live per-set training, rest timers, a daily workout journal,
and exercise progress charts calculated from saved sessions.
Saved routines and date-filtered journal entries can be exported as spreadsheet-safe CSV files and imported after review.
The visual design uses soft olive surfaces, generous spacing, and an editorial training banner.

## Raspberry Pi and generic Docker Compose stacks

Run the complete application with `sudo docker compose up` from the project root. For your existing Raspberry Pi
Compose stack, add `include: [./form/compose.yaml]` and keep the complete source in the sibling `form/` folder.
The Docker configuration includes `http://rpi5:2324` as its allowed browser address and publishes web port **2324**.
Keep the `x-form-origin` anchor when copying it into your main Compose file. Startup generates and retains private
proxy credentials, migrates and seeds PostgreSQL, and connects the browser automatically; no `.env.docker`,
manual token generation or additional startup flags are required. The frontend shows managed backend status,
loads records on startup and retries automatically if the backend is unavailable; no Connect workout API action
is required. PostgreSQL data is stored in the host directory `/home/pi/configs/form`.
See [Docker setup](docs/DOCKER.md) for inclusion, direct YAML copying, existing-data upgrades and backups.
The database-only developer stack now lives in `compose.db.yaml`; never run both against the same database directory.

## Current Docker storage

Both Compose models now bind PostgreSQL data to **`/home/pi/configs/form`** by default. `sudo docker compose up`
creates and uses this host directory. Optional `FORM_POSTGRES_DATA_DIR` overrides can select a different absolute path.
Native PostgreSQL without Docker continues using its configured operating-system data directory.

Earlier release notes refer to the previous `workout_data` volume. To keep an existing installation's data,
follow [the one-time storage migration](docs/POSTGRES-STORAGE.md) **before starting with the new mount**.
The credential volume `form_credentials` is unchanged, and the frontend remains at `http://rpi5:2324`.

## Release 2.15 — More reviewed image-backed exercises

The 2.15 release contained **1,284 exercises**, adding five new movements and restoring seven archived identities
with twelve visually reviewed, licensed illustrations. Publisher references total **308 guides and 191 linked videos**.
See [the release notes](docs/RELEASE-2.15.md) for accepted movements, duplicate exclusions, attribution and update steps.

## Release 2.14 — External exercise guides

Checked MuscleWiki and Muscle & Strength references now enrich **238 existing exercises** with **299 publisher guide links**
and **188 linked videos**, with on-demand YouTube/Vimeo players. Existing exercise identities, instructions and licensed local images are retained.
See [release details and update steps](docs/RELEASE-2.14.md) and the complete discovery/acceptance audit in `docs/`.

## Workout builder exercise discovery

The builder and workout logger now progressively load exercises as you scroll, with lazy thumbnails,
separate review/add buttons, and independent muscle, equipment and level filters. Changing a filter resets
paging; movements already present in the draft or included workouts stay excluded. Search matches all words
in any order, including aliases, and ignores case, accents and punctuation across exercise discovery.
For example, `press dumbbell incline` finds `Incline Dumbbell Bench Press`.

## Release 2.13 — More exercises with verified images

The public library now contains **1,272 image-backed exercises**, adding 30 distinct entries to discovery:
21 new yoga/mobility movements, eight previously image-free entries with new guides, and one standing curl
restored as a separate movement from a seated curl. Examples include BOSU dome push-ups, dumbbell squat curls,
step-ups with curls, tree and warrior poses, happy baby, and reverse planks.

Twenty-four independently credited Commons photographs and twelve original Everkinetic SVG poses are bundled locally.
Every candidate was visually reviewed; mislabeled poses and an already-present ball push-up were excluded.
Muscle groups, equipment and instructions accompany every addition. No workout/session data is rewritten.

Run **`pnpm db:seed`** for an existing local database and restart the API/refresh the PWA. Docker’s startup seed
imports the same metadata. No database migration or storage change is needed. See [release notes](docs/RELEASE-2.13.md).

## Release 2.12 — Illustrated catalog cleanup

The public library now contains **1,242 distinct image-backed entries**. This release adds 24 reviewed movements,
adds licensed illustrations to 90 existing entries, uses four real video posters as image guides, and merges seven
reviewed equivalent movements. All images are bundled; no remote exercise-image dependency is introduced.
Transparent illustrations use a dark background in both appearance modes.

The 2,400 entries still lacking images are removed from discovery and replacement suggestions. Their names, instructions,
IDs and aliases remain in separate compatibility metadata so saved routines, session logs and imports continue to resolve.
No workout data is deleted. Private owner-created exercises remain managed by the authenticated API.

For an existing local database, run **`pnpm db:seed`** and restart/refresh the application. Docker’s migration service
already seeds on startup; rebuild using the documented Docker commands. PostgreSQL stays on port 5433 with
persistent `workout_data` storage. See [release notes](docs/RELEASE-2.12.md) for counts, attribution and validation.

## Release 2.11 — Mobile navigation and training controls

Phones and tablets up to 900px now use persistent five-tab bottom navigation, short visible labels and full accessible
page names. Page changes focus/scroll to the main content while preserving workout drafts. Appearance and connection
settings remain available in a compact header. The content and selection tray reserve space for navigation and safe areas.

Phone layouts up to 600px use full-screen native dialogs, reachable close/save controls, single-column exercise cards,
stacked forms and readable instructions. Set targets and live logging use two-column value fields, 44px touch actions
and numeric/decimal keyboard hints. Inputs use 16px type to reduce mobile focus zoom. Calendar columns and long routine
names stay within their containers; progress tables can scroll independently.

Dark mode, nested exercise review dialogs, automatic local PostgreSQL connection and existing persistence remain intact.
No database migration is required. See [mobile release notes](docs/RELEASE-2.11.md) for validation and device QA limits.

## Release 2.10.2 — Local build and credential initialization fix

The standalone build no longer requires `API_ACCESS_TOKEN` or creates a server proxy at build time.
Vite locates the root `.env` using its configuration file location, independent of the current working directory.
`pnpm dev`, `pnpm start:local` and `pnpm db:setup:local` run `pnpm local:init` first. It generates a private local
credential only when missing/blank or still the supplied example, preserving configured database settings and valid
existing credentials. Missing `.env` files are created from the template; set `DATABASE_URL` to your running database.
`pnpm local:init` can also prepare settings before running frontend/backend commands separately.

## Release 2.10.1 — Automatic connection without Docker

`pnpm dev` now automatically connects even if `.env` still contains an older local API URL such as
`http://localhost:3001/api/v1`. The private proxy uses the configured backend `HOST`, `PORT` and `API_PREFIX`;
the backend uses `DATABASE_URL`. Tokens remain server-side. No connection-dialog step is required after refreshing.

For an already running, installed PostgreSQL instance, use `pnpm db:setup:local` and then `pnpm dev`.
These commands do not invoke Docker. To run the built app locally, `pnpm start:local` builds both applications,
starts the backend and serves the PWA at `http://localhost:8080` with the same protected automatic connection.
See the [local setup guide](docs/LOCAL.md) for configuration, upgrade and troubleshooting details.

## Release 2.10 — Automatic local database connection

The Docker app and default `pnpm dev` setup now connect automatically to the configured Express/PostgreSQL backend,
verify its capabilities and load saved training at startup. The local server proxy supplies authentication privately;
no database password or API token enters the browser bundle. Refreshing reconnects without entering a token.
If startup fails, open connection settings and retry after checking the backend/database readiness.

Keep `.env.docker` and `workout_data`, then rebuild with `sh scripts/docker-up.sh` or `pnpm docker:up`.
PostgreSQL remains on **5433**. No new database migration is required for this update.
For host development, leave `VITE_API_BASE_URL` blank in `.env` to use the automatic local proxy.
A separately hosted static preview still requires a reachable HTTPS workout API and manual bearer credentials.
See [Docker setup](docs/DOCKER.md) for the trusted-local access boundary and remote hosting configuration.

## Release 2.9.1 — Import module resolution fix

The CSV import component and validator now have distinct module names: `TrainingImportReview.tsx` and
`reviewImportRecords.ts`. This prevents extensionless imports from resolving the wrong module on case-insensitive
filesystems. The structure check rejects future case-insensitive extensionless module collisions across source roots.
If updating from an extracted ZIP, use a fresh source folder or remove the obsolete `ImportReview.tsx` and
`importReview.ts` files. Restart the Vite dev server and reload the page after upgrading.

## Release 2.9 — Find and duplicate saved routines

The workout library now searches names, notes, nested component names, movement aliases and muscles. Searches ignore
case, accents and punctuation and require all entered terms. Sort by creation date, natural name order, resolved
exercise count or total planned sets. Filter routines with/without components or those used by other workouts.
Matching counts, a no-results message and Reset view make the current selection explicit.

Filtering changes the visible cards only. Preview resolution, reference validation, parent usage and CSV exports use
the complete connected library, so hidden components remain available. CSV export continues to include all saved
workouts; existing import bounds still apply.

Duplicate opens a new unsaved builder draft with a bounded Copy of name, copied notes and independent direct per-set
arrays. Component references and their order remain linked to the same saved routines. Review and Save creates a
separate record through POST; duplication never overwrites the source or saves automatically. Use the existing
Copy exercises instead builder action when you want to flatten component targets into an independent snapshot.

No migration, dependency or new API capability is required. Rebuild with `sh scripts/docker-up.sh`, keeping
`.env.docker` and the persistent `workout_data` volume. PostgreSQL remains on port 5433.
See [release details](docs/RELEASE-2.9.md) and [verification limits](docs/VALIDATION.md).

## Release 2.8 — Full workout preview and parent visibility

Use Review on a saved workout card or Review full workout in the builder to inspect the complete resolved exercise
order, component source path and exact reps/load for every planned set. Uniform older prescriptions expand into
explicit read-only rows. The preview uses current connected records, validates the full draft and blocks starting
invalid targets. Click a movement to open its instructional dialog above the preview; closing it returns to the
preview and closing the preview preserves the builder draft. Start from the preview to create an independent session.

Workout cards identify their direct parent routines and disable deletion while referenced, with an accessible
explanation. Full previews list every direct parent and let you review those parents. Previewing an edited component
also shows its saved parent relations. The server’s existing deletion restrictions remain authoritative after refresh.

No additional migration or dependency is needed beyond release 2.7. Rebuild with `sh scripts/docker-up.sh` while keeping
`.env.docker` and `workout_data`. PostgreSQL remains on port 5433. See [release details](docs/RELEASE-2.8.md).

## Release 2.7 — Saved workouts inside workouts

In the builder, choose Add another workout and Include workout to retain an ordered reference to a saved routine.
Components can include other components. Direct exercises run first, followed by referenced routines in order.
The builder previews component movements and opens their exercise instructions above the draft. Reorder or remove
components, or choose Copy exercises instead for an independent snapshot. Both approaches preserve per-set targets.

Saving rejects circular references, missing components and duplicate canonical movements throughout the resolved
routine. A child edit is rejected atomically if it would invalidate an existing parent; deleting an in-use component
returns an actionable conflict. Starting a saved or planned routine expands the current connected records into an
independent live session, preserving completed history and workouts already in progress.

Apply migration `0005_glorious_martin_li.sql` and reseed before starting the new API. Docker’s existing migration
service handles this on `sh scripts/docker-up.sh`. PostgreSQL remains on port 5433 with the exact persistent volume
`workout_data`. Keep your environment file and volume when upgrading. Existing release 2.6 copied routines stay copies.
The API advertises `nested-workouts`; the client blocks reference saves/imports to older servers.

CSV exports retain component UUIDs and order. Imports can restore a parent before its children within the same atomic
batch, or reference routines already saved. Import review shows component identities and every planned/actual set.
Old aggregate CSV files remain supported. Limits are eight total levels, 20 immediate components, 100 resolved
exercises, 1,000 saved routines and the existing import bounds. See [release details](docs/RELEASE-2.7.md).

## Release 2.6 — Workout targets, composition, motion and dark mode

Choose System, Light or Dark appearance in the sidebar. In the workout builder, click an exercise name to review
its instructions in a second dialog while the draft stays open. Expand Individual set targets to edit each set’s
weight and repetitions. Saved targets survive API reloads, CSV transfer and starting a live workout.

Use Add another workout to combine saved routines, including previously combined routines. Composition copies
exercises and their targets into an independent snapshot; duplicate canonical movements are skipped, preserving the
existing draft’s targets. Later source edits do not propagate. Release 2.7 adds live nested references as a separate option.

Motion guides now prefer genuine GIF/animated WebP sources, then playable video, then photographs and instructions.
Six GIFs and fourteen local muted H264 clips cover seventeen existing exercises; three earlier animated WebP guides
remain. Playback is opt-in, with static posters, author credits and original source/license links.
The catalog remains 3,625 entries with 2,162 image references and no additional movement records.

Upgrade with `./scripts/docker-up.sh`: the migration service adds nullable `workout_items.planned_sets` and reseeds
before the API starts. Existing aggregate routines and completed history remain compatible. Manual non-Docker upgrades:
`pnpm db:migrate && pnpm db:seed`. Keep your existing `.env.docker` and `workout_data` volume.
See [release details](docs/RELEASE-2.6.md) and [verification limits](docs/VALIDATION.md).

## Release 2.5 — Docker application stack

Run the frontend, backend and PostgreSQL together with `sudo docker compose up`, or use
`pnpm docker:up`. No host Node/pnpm installation is needed for the shell launcher.
Open http://localhost:2324; the app connects automatically using the private server proxy.
Multi-stage images serve the production PWA through unprivileged Nginx and run compiled Express as the Node user.
Compose waits for database health, a separate migration/seed job, then API health before starting the frontend.
The database remains on 5433 with the exact persistent volume `workout_data`. Existing database-only commands still work.
See [Docker setup](docs/DOCKER.md) for direct Compose/Windows instructions, upgrades, backups and verification limits.

## Release 2.4

CSV import restores saved routines and journal sessions with their IDs, timestamps and original training values.
Select a Form export, review each record locally, then confirm one atomic PostgreSQL transaction. Unchanged saved IDs
are skipped; conflicting IDs, missing exercise references and duplicate canonical movements block the whole file.
Actual sets retain UUIDs, warmup/working classification, weights, reps and RPE. Legacy aggregates remain aggregates.
Imports require the `atomic-csv-import` API capability. No new database migration is needed beyond release 2.3.
See `docs/RELEASE-2.4.md` for limits and format compatibility.

## Release 2.3 (catalog and calendar)

The release 2.3 catalog had 3,625 visible exercises and 2,141 image references after consolidating 412 duplicate or
alternate-name records from existing and candidate catalogs. 635 entries from the new rthepen/Everkinetic snapshots
are retained, including 222 licensed SVG illustrations. Retired IDs remain valid for saved prescriptions and actual sets.
`pnpm catalog:deduplicate` checks/consolidates normalized movement-name keys; reviewed mappings are separately retained
in `docs/catalog-deduplication.json`. Do not claim that simple name matching proves anatomical uniqueness.

Workout calendar adds month/day navigation, separate planned/logged counts, and protected plan create/reschedule/cancel
operations. Starting a planned routine uses its current prescription and the actual training date; it does not fabricate
history. Apply the new committed migration and reseed before starting release 2.3. See `docs/RELEASE-2.3.md`.

## Release 2.2 (previous catalog expansion)

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
3. Leave `VITE_API_BASE_URL` blank or use your existing local `/api/v1` URL; Vite supplies the private proxy.
4. Set `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080` for development and the built local app.
5. Start your installed PostgreSQL service and set its actual credentials/port/database in `DATABASE_URL`.
   Apply migrations, seed reference data, and run the two processes without Docker:

```bash
pnpm install
pnpm db:setup:local
pnpm dev
```

Open the local Vite URL printed in the terminal. Saved training loads automatically from the configured backend.
The development proxy reads `API_ACCESS_TOKEN` privately from `.env` and forwards `/api/` to configured `HOST`/`PORT`
(default 127.0.0.1:3001), mapping to `API_PREFIX` when needed. Restart both processes after changing configuration.
Explicit remote `VITE_API_BASE_URL` uses manual token entry.

`pnpm start:local` builds and runs the complete local app at `http://localhost:8080` without Docker.
`pnpm start` alone remains the compiled backend-only command.
If you prefer a Docker-managed database, use `pnpm db:setup` instead of `pnpm db:setup:local`.
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
| `pnpm docker:init`     | Creates `.env.docker` with a random token; never replaces an existing file.              |
| `pnpm docker:up`       | Builds/starts frontend, migration job, API and PostgreSQL and waits for health.          |
| `pnpm docker:down`     | Stops the whole stack while preserving `workout_data`.                                   |
| `pnpm docker:status`   | Shows running/healthy services and the completed migration job.                          |
| `pnpm docker:logs`     | Follows recent stack logs.                                                               |
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
scripts/                   build precache, source checks and Docker credential/start helpers
docker/                    Nginx configuration and API container readiness probe
Dockerfile                 multi-stage frontend/backend production image targets
compose.app.yaml           standalone full app, generated credentials, migrations and health ordering
compose.yaml               default full stack; includes compose.app.yaml
compose.db.yaml            local-development PostgreSQL service only
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

| Variable                                      | Purpose                                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                    | Development, test or production behavior.                                                          |
| `HOST`                                        | Bind address; local default is loopback. Set explicitly for your production platform.              |
| `PORT`                                        | Express listening port; default 3001.                                                              |
| `CORS_ALLOWED_ORIGINS`                        | Comma-separated exact frontend origins. Include the hosted Site URL for that deployment.           |
| `LOG_LEVEL`                                   | Pino severity.                                                                                     |
| `API_PREFIX`                                  | Versioned `/api/vN` prefix.                                                                        |
| `DATABASE_URL`                                | Required private PostgreSQL connection URL.                                                        |
| `DATABASE_POOL_MAX_CONNECTIONS`               | Per-process pool bound; default 10.                                                                |
| `DATABASE_CONNECTION_TIMEOUT_IN_MILLISECONDS` | Connection timeout; default 5000.                                                                  |
| `API_ACCESS_TOKEN`                            | Private single-owner bearer token, at least 32 characters.                                         |
| `TEST_DATABASE_URL`                           | Optional dedicated disposable PostgreSQL database ending in `_test`.                               |
| `VITE_API_BASE_URL`                           | Public API URL; `/api/v1` resolves to the page origin in Docker; blank for a disconnected preview. |

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
Formula-like text and leading apostrophes are prefixed with an apostrophe for spreadsheet safety. New exports include
`text_encoding=apostrophe-v1` so import can remove that guard exactly, including literal apostrophes.
Downloads contain personal training data and remain under the user's control.

### CSV imports

Choose **Import CSV** in My workouts or the Journal. Reading and reviewing the file happens locally, before any API
request. Expand records to check names, notes, dates, prescriptions and actual sets. Confirm only after reviewing.
Files must use the original Form headers and contain one record type, up to 50 records, 2,000 data rows and 1 MiB.
The JSON transfer is separately limited to 900,000 bytes; larger histories must be split into valid smaller exports.

Connect an API advertising `atomic-csv-import` to save. The server checks all references and canonical exercise aliases
inside one transaction, and locks imported identities before comparing saved data. Any conflict rolls back the entire
file. Identical record IDs are skipped, including after a lost network response; changed values never overwrite saved
records. Duplicate protection is based on stable record/set IDs, not guesses about whether different IDs describe the
same workout. Preserve IDs when retrying an export. Custom exercises must already exist under their original IDs.

Older 18-column exports are accepted with their spreadsheet safety apostrophes kept as literal text and an explicit
review notice, because those files cannot distinguish a guard from a literal apostrophe. New 19-column exports resolve
that ambiguity. Calendar plans, custom exercise definitions and session submission retry tokens are not CSV fields.
Imported files and credentials stay in tab memory until the API confirms PostgreSQL persistence; reconnect after reload.

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

## Calendar API and duplicate-reference maintenance

| Method/path                | Result                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `GET /api/v1/plans`        | Protected chronological plans, bounded to 1,000 records.      |
| `POST /api/v1/plans`       | Date plus saved routine; snapshot label; no session creation. |
| `PUT /api/v1/plans/:id`    | Replace date/routine and retain plan identity.                |
| `DELETE /api/v1/plans/:id` | Cancel intent without deleting workout/history records.       |

The calendar feature follows controller → service → repository → PostgreSQL. Invalid dates/UUIDs fail before writes.
A routine/date unique constraint prevents duplicate plans, and routine deletion sets its plan link to null while
retaining the planned date/label. Calendar saving requires the `calendar-plans` capability. Dates use local calendar
components and midday month anchors; no UTC conversion shifts the selected day. This feature does not send reminders.

Visible public exercises are in `shared/exercises.json`; `shared/retiredExercises.json` preserves duplicate references.
Canonical records list legacy IDs and alternate names. Database seeding upserts both groups, assigns unique name keys
only to visible canonicals, and leaves custom identities alone. Migration 0003 adds the nullable unique name key and
plan table. Existing actual values are never rewritten. The frontend resolves old names and comparison/progress groups.
The API rejects repeated canonical references and known duplicate custom names/aliases; the database handles concurrent
identical-key custom writes. Review existing private collisions before reseeding; failures roll back safely.

New snapshots and their pinned hashes/rights are in `docs/catalog-expansion-2.3.json`; review decisions are in
`docs/catalog-deduplication.json`. `/catalog-attribution.json` credits visible and retired public assets. Original
Everkinetic SVGs are validated to reject active content/external resources and retained byte-for-byte. Source guidance
is imported from the verified dist dataset; no technique instructions or exercise combinations are fabricated.

# Form 2.25 — Compact mobile training

Phone layouts at 680px and below now use a denser presentation across the workout library, preview,
editor and exercise details. Touch controls remain at least 44px and numeric/text inputs retain 16px text.
Light, dark and system appearance use the existing theme.

- Workout cards become compact thumbnail rows with resolved movement/set counts, Start and More.
  Tap the title to preview; More retains Review, Edit, Duplicate and Delete with reference protections.
  The full exercise-chip list and routine notes remain available in the preview instead of filling each card.
  Search stays above side-by-side sorting and workout-type filters.
- Workout previews show exercise thumbnails and compact target ranges. Expand a summary to see every
  set's exact weight/repetitions, exercise note and source workout. Varying targets display ranges rather
  than suggesting every set has the same prescription. Preview and exercise-detail actions stay sticky.
- Editor cards begin with collapsed set targets and options/notes. Expand targets to edit individual sets;
  Set 1 replication and later overrides behave as before. Notes, ordering and replacement controls stay
  available under Options & note. Included workouts and routine notes share a secondary section with
  indicators for existing content. The floating Add exercises / Save workout dock remains available.
- Exercise details use a compact sticky title and smaller media area. Instructions and supporting muscle/
  technique information expand on demand. Primary muscles, media playback, image navigation, AI labels,
  original source credits and related exercises remain available.

Secondary sections begin expanded on desktop, except the existing per-set editor's initial expansion policy.
Crossing the phone breakpoint applies that layout's default. Closing sections keeps their children mounted:
existing notes, numerical targets, draft names and component references are not discarded.

## Update and run

Extract all numbered 2.25 ZIP files into the same empty folder, then run `node verify-project.mjs`.
Part 01 includes `package.json`, lockfile, all scripts, frontend, backend, migrations and Compose files.
Exercise media is unchanged from 2.24; an existing complete media folder can be reused.

Rebuild from the project or your generic stack that includes Form:

```sh
sudo docker compose up -d --build
```

The Raspberry Pi address remains **http://rpi5:2324**. Automatic backend connection, database port/storage
and native local startup are unchanged. No database migration is added, and training records/catalog IDs
are preserved. With PostgreSQL running and `DATABASE_URL` configured, native startup remains:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

## Verification

267 tests pass; 24 PostgreSQL integration tests are skipped without a test database. The new phone interaction
checks cover retained notes across disclosure/viewport changes, per-set replication and independent overrides,
exact preview targets and exercise review, More actions and protected deletion, and exercise instructions/media.
Frontend/backend strict type checks, source-structure checks, catalog asset verification and production builds pass.

Browser visual QA, actual Docker startup and live PostgreSQL are unavailable in this environment.

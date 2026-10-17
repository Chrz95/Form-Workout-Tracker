# Form 2.23 — A refined training studio

This release redesigns Form's presentation across exercise discovery, saved routines, the journal, calendar, progress, and workout dialogs.

## Design and navigation

The visual system uses a warm neutral canvas, deep green surfaces, a restrained lime accent, stronger typographic hierarchy, and consistent spacing, borders and control sizes. Light and dark appearances share the same semantic color tokens. The geometric Form monogram appears in the navigation, favicon and installed PWA icons.

Desktop navigation includes a compact weekly summary calculated from confirmed sessions in the current local Monday-start week. An unavailable history displays an unknown total rather than a fabricated zero. Phones use the existing five destinations in a fixed bottom navigation bar with safe-area spacing. The library uses a compact collection panel, labelled filters, readable exercise cards and loading placeholders. Media badges distinguish video guides, image guides and AI illustrations. Actual guidance and source attribution remain available in exercise review.

Saved routines show thumbnails from their own exercises. Routine titles open their existing review dialog. The journal, calendar, progress metrics, charts, empty states and status messages use the same presentation system and concise product copy. Metrics remain based on saved sessions.

## Training and appearance

Workout dialogs use clearer fields, stronger section boundaries, larger controls and a full-height phone layout. Per-set weights/repetitions, exercise notes, nested workouts, infinite exercise selection, nested review dialogs and the sticky Save workout control retain their existing behavior.

Appearance supports System, Light and Dark. Only this presentation preference is persisted in browser storage. Training continues to use the configured backend and PostgreSQL. The browser theme color follows the selected appearance, and appearance switching still works when preference storage is blocked.

## Running the update

Download all numbered 2.23 ZIPs and extract them into the same empty project folder. The source part includes `package.json`, lockfile, all scripts, frontend, backend, migrations and Docker/Compose files. The media parts include the complete exercise collection; no previous release is needed. Run `node verify-project.mjs` after extracting every part.

On your Raspberry Pi, run from the project or your generic Compose stack that includes Form:

```sh
sudo docker compose up -d --build
```

The application remains at **http://rpi5:2324**, with automatic backend connection and the existing PostgreSQL storage. No database migration or training-data rewrite is introduced.

Local operation remains supported with PostgreSQL running and `DATABASE_URL` configured:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

## Validation

- 258 tests pass; 24 PostgreSQL integration tests are skipped without a test database.
- Added behavioral coverage verifies appearance persistence, blocked preference storage, local weekly session counts, and unknown history while disconnected.
- Existing integration-style frontend checks cover discovery, nested routines, notes, distinct set targets, exercise review above the editor, live training and automatic connection recovery.
- Strict frontend/backend type checks, source-structure checks and production builds pass.
- Catalog metadata and exercise assets are unchanged: 1,482 visible movements, 4,089 historical IDs, and all 534 restoration asset hashes remain valid.
- Browser visual QA, actual Docker startup and live PostgreSQL were unavailable in this environment; those checks are not claimed.

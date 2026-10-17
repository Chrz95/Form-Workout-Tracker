# Form 2.26 — My exercises and review editing

## Automatic personal collection

**My exercises** now includes your custom exercises plus discoverable catalog movements referenced by any
saved workout or the current draft. Adding, copying or replacing draft exercises updates membership immediately.
Saving a workout retains membership after reload through its existing database records. Previously saved and
imported workouts populate the collection automatically; no manual backfill or database migration is needed.

Included workouts are already part of the loaded saved-workout collection, so their exercises are included too.
Canonical IDs and historical aliases map to one entry. Repeated references across workouts never create duplicate
catalog records. Archived exercises remain available to historical workout references but stay out of discovery.
Search, muscle/equipment/level filters and bookmarks continue to work with My exercises.

Membership is derived from current custom exercises, saved workout references and the current draft. A public
movement disappears from My exercises when no saved workout or current draft uses it. Custom exercises remain
in the collection independently. This does not create private copies of public catalog content.

## Edit from review

Saved-workout reviews now offer **Edit workout**, alongside Close preview and Start workout. Editing closes the
review and opens the saved source in the editor. Workout/exercise notes, individual set targets and included-workout
references are retained. Opening the editor does not save anything or start a session.

Draft reviews retain **Back to builder**, returning to the existing unsaved state. If a saved review was opened
above another editor/logger, Edit workout asks before replacing that draft; cancelling leaves it intact.
On phones, Close/Edit share a row above the full-width Start action in the sticky footer.

## Update and run

This release changes frontend behavior only. Rebuild and push the frontend image from this source, then pull
and recreate your frontend service on the Raspberry Pi. No backend/database migration or media changes are required.
For the image-based Compose example using a service named `form`:

```sh
sudo docker compose pull form
sudo docker compose up -d form
```

For the source-based project Compose:

```sh
sudo docker compose up -d --build
```

The address remains **http://rpi5:2324**. Database storage, backend auto-connection, credential generation and
local native startup are unchanged. Part 01 of the complete export includes package.json, lockfile, all scripts,
frontend/backend source, migrations and Docker files. Extract all numbered ZIPs into the same empty folder and
run `node verify-project.mjs`; an existing complete exercise-media folder can also be reused.

## Verification

273 tests pass; 24 PostgreSQL integration tests are skipped without a test database. New tests cover immediate
My exercises membership, legacy-ID deduplication, shared references, reload behavior, custom preservation and
filter composition. Review-to-edit tests verify exact notes/set targets, retained component references, and both
cancelled and accepted replacement of an open draft. Frontend/backend strict type checks, structure checks,
catalog restoration verification and production builds pass.

Browser visual QA, Docker startup and live PostgreSQL are unavailable in this environment.

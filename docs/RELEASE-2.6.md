# Release 2.6

## Workout targets and composition

Each exercise in the builder exposes one row per set with independent repetitions and load, plus add/remove actions.
Bounds remain 1–30 sets, 1–1,000 repetitions and 0–1,000 kg; client and server validate the full prescription.
Aggregate metadata equals the target count and final set’s repetitions/load. Older uniform targets expand on demand.
Routine edits, PostgreSQL reads/writes, atomic imports, exports and live starts retain every target in order.
Manual journal entries with individual targets become explicit completed sets after the user reviews and saves them.
Completion retries retain their set IDs while the draft stays unchanged.

Add another workout copies a saved routine into the current draft, including a routine composed previously.
Canonical aliases and exact duplicate exercises are skipped; existing draft targets win. Order is preserved and the
100-exercise limit is enforced before changing the draft. Copies are independent snapshots: no live reference graph,
automatic source propagation or recursive deletion is introduced. Users can reorder, substitute and remove copied
exercises normally. Substitution resets every copied load to zero, preserving repetitions and set order.

Click an exercise name in the builder to open its instructional dialog above the builder. Closing it returns to the
existing name, notes, order and targets. Native modal dialogs supply focus containment, Escape and focus restoration;
DOM tests verify stacked dialog presence and retained draft values, not native browser focus mechanics.

## Appearance and media

The sidebar appearance selector offers System, Light and Dark. System mode responds to OS changes; a manual choice
lasts for the open tab. No browser database, storage fallback or persisted appearance preference is introduced.

Six genuine GIFs and fourteen local H264/yuv420p MP4 derivatives cover seventeen existing exercises. The earlier
three animated WebP guides remain. Demonstrations prefer real animation, then H264 video, then photos/instructions.
GIFs use static posters until Play animation is clicked and return to the poster on Stop motion. Videos have native
controls, no autoplay, preload none and a static poster when bundled. Video failures expose original source links.
Media retains independent author/source/license/conversion attribution; see `/motion-attribution.json`.
No exercise records were added; IDs and conservative normalized-name uniqueness remain checked across 3,625 entries.

Large video and range requests bypass the service worker. Read-only GIFs may be cached after viewing; the entire
motion library is not precached on install. Cache-write failures do not prevent an otherwise successful response.

## Upgrade and compatibility

Migration `0004_absent_luckman.sql` adds nullable JSONB `workout_items.planned_sets`. Existing rows need no rewrite.
Run migrations and seed before starting the new API. Docker Compose already runs those steps through its one-shot
migration service; use `./scripts/docker-up.sh` or the existing `pnpm docker:up` workflow. PostgreSQL remains on port
5433 and uses the persistent Docker volume named `workout_data`. Keep that volume and the existing environment file.

The API advertises `per-set-prescriptions`. Clients block saving or importing new planned arrays to older APIs to
prevent silent loss. Older uniform routines and session payloads remain compatible. CSV keeps the existing 19-column
header and adds `source=planned_set` rows: one consecutive position per target, count 1, and empty actual-set fields.
The new reader still accepts older 18/19-column aggregate files. Older clients reject the new source representation;
use a release 2.6 client for individual-target transfers. Import identity comparisons include every planned target.

## Verification limits

Strict frontend/backend typechecks, zero-warning lint, formatting, source constraints and production builds are run.
Tests cover prescription bounds, exact live values, snapshot deduplication, CSV round trips and import conflicts,
manual log conversion, stacked dialogs, theme switching, source asset existence and the original application paths.
A PostgreSQL integration case covers target save/reload/replacement/import retries, but the dedicated database is
unavailable in this environment, so real database tests are skipped. Docker execution, browser playback, native focus,
mobile layout and device installation remain unverified. The hosted preview serves the static frontend; durable
workout saving still requires the separately deployed Express/PostgreSQL API.

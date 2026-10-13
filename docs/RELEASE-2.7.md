# Release 2.7 — Saved workout composition

## User behavior

Include workout in the builder retains a reference to the selected saved routine. Components can contain other
components. Direct parent exercises run first, followed by each included routine in its chosen order. Reorder or
remove references in the builder; expand a component to review its movements and open an exercise’s instructional
dialog above the current draft. Component targets are edited in the source routine.

Copy exercises instead preserves the earlier independent snapshot behavior, expands nested components, skips
canonical duplicates already in direct draft items and retains every planned set. Copies do not follow source edits.
Existing release 2.6 combined routines remain ordinary copies, with no inferred or automatic conversion to references.

References use the current connected routine records. Saved source changes update parent counts and targets after
confirmation/reload. Starting a routine from its library card, builder or calendar resolves independent targets before
creating a live session. An existing unfinished session resumes instead of being overwritten. Neither source edits nor
reference deletion alter an active snapshot or previously saved completed sets.

## Validation and persistence

`includedWorkoutIds` is an optional ordered array of unique workout UUIDs. Direct `items` may be empty when a routine
contains components. API schema and pure graph resolution enforce:

- At least one exercise after expansion.
- At most 20 immediate components and eight total levels including the root.
- At most 100 resolved exercises, with each canonical movement appearing once.
- No missing component, direct/indirect cycle or repeated child identity.

`workout_links` stores parent, child and position. Parent deletion cascades its outgoing references; a referenced
child has a restrictive foreign key and returns `WORKOUT_IN_USE` through the API. Its parent references must be
removed first. Existing metadata, item prescriptions, calendar snapshots and completed session storage are retained.

The same transaction-level advisory lock serializes routine saves, imports, deletes and complete graph reads.
Validation examines every saved parent after a write. Invalid child edits roll back metadata, targets and links.
The supported library is bounded at 1,000 records; the API returns an explicit limit error instead of truncating a
component dependency. This release does not add pagination or multi-user storage.

## CSV transfer

The existing 19-column header and reversible text encoding remain. Rows with `source=workout_reference` contain a
component UUID in `exercise_id`, a descriptive component name in `exercise_name`, and its one-based component order in
`exercise_position`. Actual-set, numeric-target and session cells must be empty. Component positions are counted
separately from direct exercise positions. Older clients reject this representation; use a release 2.7 client.

Exports preserve identities and targets. A batch can contain a parent before its children because all new routine
metadata and targets are inserted before references, then the complete graph is validated before commit. Missing
components must either be in the same batch or already saved. Importing an unchanged ID skips it; differing identities,
references or targets reject the whole batch. Existing 18/19-column legacy files remain accepted.

Import review displays ordered component names/UUIDs, direct items and every planned/actual set value. Cycles, missing
sources and duplicate canonical movements block confirmation locally; the server independently rechecks its current
records. The existing limits of 50 records, 2,000 rows, 1 MiB per file and bounded JSON payloads remain. Import component
batches before their parents when transferring a library across multiple files.

## Upgrade and compatibility

Apply migration `0005_glorious_martin_li.sql`, then seed. `sh scripts/docker-up.sh` or `pnpm docker:up` runs the existing
migration service before starting the API. Keep `.env.docker` and the persistent `workout_data` volume. PostgreSQL stays
on port 5433. For standalone deployments: `pnpm db:migrate && pnpm db:seed` before starting the backend.

The API advertises `nested-workouts`. The frontend blocks reference persistence/imports when that capability is absent;
old uniform/per-set routines still work. Upgrade frontend and backend together before creating nested routines.

## Verification

Pure domain and DOM interaction tests cover expansion order, changing source targets, independent live sets, cycles,
missing sources, canonical aliases, depth/size bounds, CSV round trips, reviewed imports, reference save payloads,
component movement review, copy fallback and exact live target loads. API tests validate authenticated inputs and
safe component deletion errors. Real PostgreSQL cases cover actual reference storage and concurrent transaction
behavior but require `TEST_DATABASE_URL` and are skipped when unset. Docker, browser playback/native focus and device
installation cannot be verified in the current environment. The private hosted preview serves the frontend; durable
training records require the supplied separately deployed Express/PostgreSQL API.

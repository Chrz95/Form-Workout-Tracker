# Form 2.24 — Exercise selection and faster set entry

The workout editor now has a floating bottom action dock with **Add exercises** and **Save workout**. The embedded library has moved into a separate **Add exercises** popup. The manual session logger uses the same popup and bottom actions.

The popup retains unordered-word search, muscle/equipment/level filters, thumbnails, infinite scrolling and a manual load-more fallback. It supports adding multiple movements, excludes exercises already present directly or through an included workout, and keeps the workout draft intact. Exercise technique opens above the library as a third dialog. **Done adding exercises**, Close and Escape return to the underlying editor. The popup is rendered outside the editor's form so searching cannot accidentally submit a workout.

## Exercise names

Public exercise names use consistent title capitalization throughout library discovery, workout review, journal/progress labels and CSV exports. For example, `dumbbell single leg calf raise` displays as **Dumbbell Single Leg Calf Raise**. Known abbreviations such as TRX, BOSU, EZ, RDL and SMR retain their spelling. The API and normal database seed use the same formatting. Authored custom names remain under their owner's control.

All original catalog IDs, name identities, instructions, licenses and source snapshots are preserved. Capitalization does not create additional exercises or break saved references. The catalog remains at 1,482 visible exercises with all 4,089 historical identities represented.

## Set 1 replication

Changing **Set 1 repetitions** copies repetitions to all subsequent sets for that exercise. Changing **Set 1 weight** copies weight to subsequent sets. Each field is independent: changing repetitions does not overwrite individually adjusted weights. Later sets can be edited independently afterward. A later edit to Set 1 copies that field again.

This applies in the workout editor, manual session logger and live workout. Live replication updates only unfinished sets; completed sets, effort ratings, set types, saved routines and earlier sessions are not rewritten.

## Update and run

Extract every numbered 2.24 ZIP into the same empty project folder. No earlier ZIP is required. Part 01 contains `package.json`, lockfile, all scripts, frontend, backend, migrations and Docker/Compose configuration. The media parts include the complete exercise collection. Run `node verify-project.mjs` after extraction.

On your Raspberry Pi, rebuild from the full source in the project directory or your generic stack that includes Form:

```sh
sudo docker compose up -d --build
```

The app remains at **http://rpi5:2324**, with automatic backend connection and the existing PostgreSQL persistent storage. This update adds no migration. Normal startup refreshes public reference names without rewriting training records.

Local operation with a running PostgreSQL instance and configured `DATABASE_URL` remains supported:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

## Verification

262 tests pass; 24 PostgreSQL integration tests are skipped without a test database. Frontend/backend strict type checks, source-structure checks and production builds pass. Tests cover independent popup selection, nested review, retained drafts/notes, duplicate exclusion, existing paging/filtering, per-field replication, later overrides and completed-set protection. Name-format checks preserve the canonical name key of every historical catalog record. All 534 restoration asset hashes remain valid.

Browser visual QA, actual Docker startup and live PostgreSQL were unavailable in this environment.

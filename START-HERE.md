# Form 2.26 — Complete project

Extract every numbered ZIP into the SAME empty folder. These are ordinary ZIPs, not split-archive segments.
Part 01 includes package.json, pnpm-lock.yaml, all scripts, frontend, backend, shared contracts, migrations,
Docker/Compose files, licenses and documentation. The other parts contain all local exercise media.
No previous download is required. When updating a complete installation, the exercise media is unchanged.

Run `node verify-project.mjs` after extraction to check every project file against its SHA-256 inventory.

My exercises now includes custom exercises and movements from saved workouts or the current draft.
Previously saved workouts populate it automatically, with canonical references counted once.
Saved workout reviews offer Edit workout, preserving notes, individual targets and component links.
See docs/RELEASE-2.26.md for full behavior, including collection membership and draft replacement.

For Raspberry Pi images: rebuild/push the frontend target from this source, then pull and recreate your
frontend service. No backend/database migration is required. The app remains at http://rpi5:2324.
For the source-based Compose stack, run `sudo docker compose up -d --build`.
Preserve your existing PostgreSQL storage and configuration.

Native startup remains available with PostgreSQL running and DATABASE_URL configured:

```
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

273 tests pass; 24 database integration tests were skipped without PostgreSQL. Production builds and strict
type checks pass. Browser visual QA and actual Docker/PostgreSQL startup were unavailable.

Source commit: 136228f9c1ef6fba3f989244d50f225bc9cf3062

Parts:
- Form-2.26-01-Source.zip
- Form-2.26-02-Media.zip
- Form-2.26-03-Media.zip
- Form-2.26-04-Media.zip
- Form-2.26-05-Media.zip
- Form-2.26-06-Media.zip

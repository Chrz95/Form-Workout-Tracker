# Form 2.25 — Complete project

Extract every numbered ZIP into the SAME empty folder. These are ordinary ZIP files, not split-archive segments.
Part 01 includes package.json, pnpm-lock.yaml, frontend, backend, shared contracts, scripts, migrations,
Compose/Docker files, licenses and documentation. The other parts contain the complete local exercise media.
No older download is required. If updating an existing complete 2.24 installation, media is unchanged and can be reused.

Run `node verify-project.mjs` after extraction. It checks every packaged project file against the included SHA-256 inventory.

On Raspberry Pi, run `sudo docker compose up -d --build` from this project or your generic stack including Form.
Open http://rpi5:2324. Your existing PostgreSQL data location and automatic backend connection are retained.
See README.md, docs/RELEASE-2.25.md and the Compose instructions for configuration and persistent storage.

For native startup, use a running PostgreSQL instance and configure DATABASE_URL, then run:

```
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

All training features and 1,482 visible exercises are retained. This release makes phone workout cards,
previews, editors and exercise details more compact. Draft notes and per-set targets survive collapsing sections.

267 tests pass; 24 database integration tests require PostgreSQL and were skipped here.
Production builds and frontend/backend type checks pass. Browser visual QA and Docker runtime were unavailable.

Source commit: 4ded024564650d5eb4527cf4982cd9b61c7e604e

Parts:
- Form-2.25-01-Source.zip
- Form-2.25-02-Media.zip
- Form-2.25-03-Media.zip
- Form-2.25-04-Media.zip
- Form-2.25-05-Media.zip
- Form-2.25-06-Media.zip

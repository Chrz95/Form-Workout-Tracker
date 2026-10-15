# Complete project delivery: local and Docker

The previous large ZIP was truncated. This replacement uses independent smaller ZIPs.
Download and extract ALL of these into the SAME new folder, preserving the relative paths:

- Form-01-Project-Code.zip
- Form-02-Exercise-Media.zip
- Form-03-Exercise-Media.zip
- Form-04-Exercise-Media.zip

These are ordinary ZIP archives. Each extracts into the same project root; there are no numbered folders to move.
The first ZIP contains package.json at its root, the lockfile, workspace, all scripts, frontend/backend code, configuration, database migrations, tests, documents, fonts and supporting assets. The remaining ZIPs supply the complete exercise images and animations/videos.

After extracting every ZIP, run:

```sh
node verify-project.mjs
```

It verifies all 2,700 source files against the included SHA-256 inventory. Do not install dependencies or build until all media archives are extracted.

## Run locally without Docker

Use Node 24.19.x, pnpm 11.25.0 and a running native PostgreSQL 17 instance with an existing database/user. Copy .env.example to .env if you have no private configuration and configure DATABASE_URL for your database. From the project root:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Open http://localhost:5173, or use `pnpm start:local` instead of `pnpm dev` for the built app at http://localhost:8080.
Read docs/LOCAL.md for details.

## Docker / Raspberry Pi

Set x-form-origin in compose.app.yaml to the Pi's browser URL. Run `sudo docker compose up`.
For your generic stack, place this entire source in a sibling form/ folder and add `include: [./form/compose.yaml]` to the generic Compose file. Read docs/DOCKER.md.

Stop any old PostgreSQL container before the new stack uses its existing workout_data volume.

Private credentials, dependencies, generated builds and Git internals are excluded.

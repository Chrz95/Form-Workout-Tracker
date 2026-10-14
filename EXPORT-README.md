# Complete Form Workout Studio source, version 2.13.0

Extract this entire ZIP into one project directory. `package.json`, `scripts/`, `frontend/`, `backend/`, `shared/` and `docker/` belong beside each other at its root.

Before installing anything, verify every exported file using Node:

```sh
node verify-project.mjs
```

Use Node 24.19.x and pnpm 11.25.0, as declared in package.json. From this root:

```sh
pnpm install --frozen-lockfile
pnpm local:init
```

Set DATABASE_URL in the generated private local .env file to your existing PostgreSQL database. For an existing native PostgreSQL instance, initialize its schema/catalog and start the application:

```sh
pnpm db:setup:local
pnpm dev
```

For Docker, use:

```sh
pnpm docker:init
pnpm docker:up
```

See README.md and docs/DOCKER.md for the complete setup. PostgreSQL uses port 5433 and persistent workout_data storage.

This archive includes all 2,696 repository source files, scripts, database migrations, public environment examples, catalog data, exercise images/videos, fonts, licenses, tests and documentation. Dependencies (node_modules), generated build output, Git internals and private credentials are not source files; install dependencies using the supplied lockfile. Keep any existing private database settings outside the archive.

PROJECT-FILE-INVENTORY.json records each source file's size and SHA-256. The export includes this README and a verifier in addition to the unchanged repository files.

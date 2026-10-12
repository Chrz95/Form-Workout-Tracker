# Release 2.1 — PostgreSQL setup and CSV exports

PostgreSQL's internal port, host mapping, health check and example connection URLs now use **5433**.
Compose mounts a persistent Docker volume named exactly **workout_data** and restarts the service unless stopped.
`pnpm db:down` retains the volume. Earlier `form_database` volumes are not removed or automatically migrated.

`pnpm db:setup` starts the service, applies committed migrations, seeds the public catalog and checks connectivity.
`pnpm db:test:prepare` explicitly creates a missing disposable test database without dropping any database or clearing
its rows. Test targets must have safe lowercase names ending in `_test` and a name different from the application
database, including when a different hostname alias is supplied. No application schema migration changed in this release.

Saved routines and date-filtered journal sessions now have **Export CSV** controls. Actual sets retain their identities,
order, load, repetitions, warmup/working classification and optional effort. Uniform legacy entries are labelled
aggregate rows, and routine rows are labelled prescriptions. CSV fields retain commas, quotes, multiline notes and
Unicode; formula-like text is neutralized for spreadsheet safety. Drafts and unsaved sessions are excluded.
Exports cover only loaded records, currently bounded to 1,000 by the API; they are not a full database backup.

The database configuration is implemented, but it could not be started in the managed build runtime: Docker is
unavailable and native PostgreSQL initialization refuses the only available root process identity. Migrations and
connectivity checks failed with connection refusal at port 5433. The persistent volume is a Docker host resource;
no volume or running PostgreSQL server was created here. The published private Site still requires a separately
hosted authenticated HTTPS Express/PostgreSQL API for saving and history.

CSV download behavior, PWA installation, offline behavior and responsive layout still require browser/device QA.
Calendar planning, exercise alternatives, custom exercise creation and CSV import remain future additions.

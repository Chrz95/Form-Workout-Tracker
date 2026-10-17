# PostgreSQL storage in /home/pi/configs/form

The full application (`compose.app.yaml`) and optional database-only model (`compose.db.yaml`) now use:

```yaml
volumes:
  - type: bind
    source: ${FORM_POSTGRES_DATA_DIR:-/home/pi/configs/form}
    target: /var/lib/postgresql/data
    bind:
      create_host_path: true
```

This is the database's data directory. Keep project source and unrelated configuration elsewhere.
The PostgreSQL container initializes a new directory and sets its ownership and permissions on startup.
The application stays at `http://rpi5:2324`; PostgreSQL still uses internal port 5433. The frontend connects
automatically, and `form_credentials` remains a separate named volume.

## New installation or data already in this directory

From your generic Compose directory, including the updated Form Compose file:

```sh
sudo docker compose up -d form-frontend
```

Use `sudo docker compose up --build -d form-frontend` when updating application source and images too.
Compose creates the host path if necessary. If you copied service definitions into your generic file,
replace the old database mount with the bind mount above and remove only the old `form_workout_data`
volume declaration. Keep the other applications' mounts and volumes.

## Move existing data from workout_data

These steps apply to the previous PostgreSQL 17 installation using the exact `workout_data` volume.
Changing the Compose file does not copy old data: an empty directory initializes a new database.
Perform this one-time copy before starting the new database mount.

First, while the old database is running, make an independent logical backup and copy it off the Pi:

```sh
sudo docker compose exec -T form-db pg_dump -U form_local -p 5433 -d form -Fc > form-before-bind.dump
```

From your generic Compose directory, use this guarded command block. The destination must be empty;
it will not overwrite an existing database. The old volume is mounted read-only and is retained.
PostgreSQL is stopped before copying its files. The final startup runs only when every previous command succeeds.

```sh
sudo docker volume inspect workout_data >/dev/null &&
sudo docker compose stop -t 60 form-frontend form-backend form-migrate form-db &&
sudo mkdir -p /home/pi/configs/form &&
sudo docker run --rm --network none --user 0 \
  --mount type=volume,source=workout_data,target=/old,readonly \
  --mount type=bind,source=/home/pi/configs/form,target=/new \
  postgres:17-alpine sh -ec '
    test -f /old/PG_VERSION || { echo "Old PostgreSQL data was not found." >&2; exit 1; }
    test "$(cat /old/PG_VERSION)" = "17" || { echo "Expected PostgreSQL 17 data." >&2; exit 1; }
    test -z "$(ls -A /new)" || { echo "Destination is not empty; nothing copied." >&2; exit 1; }
    cp -a /old/. /new/
  ' &&
sudo docker compose up -d form-frontend
```

Use the updated Compose file for startup. If the copy fails, keep the database stopped and resolve the failure
before starting against the destination; the old volume remains available. If the old database-only model is
in use, stop its `db` service with `sudo docker compose -f compose.db.yaml stop -t 60 db` before the copy too.
If your old Form deployment used another Compose project, stop that project's database as well. No other
PostgreSQL process may write to the old volume during the copy.

If your generic stack exports `FORM_POSTGRES_DATA_DIR`, set it to `/home/pi/configs/form` for these commands,
or use that override path consistently as the copy destination and the mount source.

After startup, check health and confirm your saved workouts in the app:

```sh
sudo docker compose ps -a
sudo docker compose logs --tail 80 form-db form-backend
sudo docker compose exec -T form-db psql -U form_local -p 5433 -d form -c 'SELECT current_database();'
```

Keep the old volume and the backup until your history and routines have been verified. The project does not
automatically delete or migrate your old volume.

## Native local use without Docker

Native PostgreSQL keeps its operating-system data directory and the configured `DATABASE_URL`. This bind-mount
change does not move native database files or remove the Node/pnpm startup scripts. For the optional Docker
DB on another host, set `FORM_POSTGRES_DATA_DIR` to a suitable absolute host path before running `pnpm db:up`.

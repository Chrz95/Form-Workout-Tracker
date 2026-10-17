# Form 2.16 — Notes for each exercise

Each exercise entry now has an optional multiline note (up to 2,000 characters). Add or clear it in the workout
builder or manual session log. Workout review displays the note; copied and included workouts retain it. Included
workout notes are edited in their source workout. Starting a live workout copies its notes; editing them during
training affects that session only. Saved notes appear alongside actual sets in the journal and finish review.

CSV files now include exercise_notes with reversible spreadsheet text escaping. Both older Form header formats
remain importable. Conflicting notes across rows of the same exercise are rejected. Import identity and retry
comparisons include exercise notes, preventing silent replacement of changed training data.

## Update your Raspberry Pi

Extract the update over the existing project, keeping earlier exercise media. The package includes package.json,
scripts, frontend/backend code, migration SQL and native local runners.

From the directory containing your generic Compose file, which includes the updated Form Compose file:

```sh
sudo docker compose up --build -d form-frontend
```

The migration service adds notes columns to workout_items and session_items before the backend starts. Existing
rows receive empty notes; existing workouts and history are preserved. PostgreSQL still binds to
/home/pi/configs/form, uses internal port 5433, and the app opens at http://rpi5:2324 with automatic API connection.
If you have not migrated from the older workout_data volume yet, follow [POSTGRES-STORAGE.md](POSTGRES-STORAGE.md)
before starting against the bind directory. Keep your usual database backup before applying updates.

## Local use without Docker

With your local DATABASE_URL configured:

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

For a production local run, use pnpm start:local after migration. See [LOCAL.md](LOCAL.md).

## Validation

224 tests passed. The 24 PostgreSQL integration cases require a dedicated test database and were skipped here.
Type checks, source structure, formatting, frontend/backend production builds and the Docker-configured frontend
build passed. UI interactions were verified through DOM tests; browser and Raspberry Pi execution were unavailable.
The update adds an integration case for note persistence and conflict handling, ready to run against TEST_DATABASE_URL.

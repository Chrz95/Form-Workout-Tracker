# Form 2.17 — Standing Cable Pec Fly

A catalog check found the standing fly already present as Cable Crossover. This release renames that visible
entry to Standing Cable Pec Fly and retains Cable Crossover and Standing Cable Chest Fly as search aliases.
Its existing ID (Cable_Crossover), retired alias ID, instructions and two original instructional images remain
unchanged, preserving saved workouts, notes and history. The catalog still has 1,284 visible exercises.

The existing instructions describe the high-pulley variation, also described as a standing cable chest fly by
[StrengthLog](https://www.strengthlog.com/standing-cable-chest-fly/). A new photo by Nenad Stojkovic, obtained from
[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg),
is bundled unchanged under CC BY 2.0, with author, source, license and file hash recorded in the app's credits.

The linked [Muscle & Strength guide](<https://www.muscleandstrength.com/exercises/cable-crossovers-(mid-chest).html>)
and its YouTube demonstration show the related shoulder-height setup. The publisher's video loads only when
requested; no third-party video is copied. The archived mid-height entries remain hidden, and seated, incline,
low-to-high and rear-delt variants remain separate. Search for Standing Cable Pec Fly or Cable Crossover.

See standing-cable-pec-fly-review.json for the before record, duplicate decision and image provenance.

## Apply the update

Extract the update ZIP over your existing complete project, preserving earlier exercise media. From the directory
containing your generic Compose file that includes Form:

```sh
sudo docker compose up --build -d form-frontend
```

The normal seed step updates this existing catalog record. No new database schema migration is needed. PostgreSQL
still uses /home/pi/configs/form and internal port 5433; the app still uses http://rpi5:2324 and connects automatically.
If your installation still uses the old workout_data volume, follow POSTGRES-STORAGE.md before changing its mount.

For native local use, run pnpm install --frozen-lockfile, pnpm db:seed, then pnpm dev with DATABASE_URL configured.

## Validation

226 tests passed; 24 live PostgreSQL integration cases were skipped without a test database. Catalog checks verify
unique visible identities, preserved historical IDs, bundled image hash and credits, validated guide URLs, and
matching frontend/backend catalogs. Type checks, formatting, source structure and frontend/backend production
builds passed. Browser/device execution and live database seeding were unavailable in this environment.

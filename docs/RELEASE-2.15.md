# Release 2.15 — More reviewed exercises with licensed images

The visible library grows from **1,272 to 1,284 exercises**, with **12 new static illustrations**.
Five movements receive new canonical IDs:

- Smith Machine Hip Thrust
- Bodyweight Step-Down
- Supported Pistol Squat
- Weighted Chin-Up
- Standing Band Row

Seven previously archived movements return with their existing IDs: SkiErg Double Pole, Copenhagen Adduction
Exercise, Dynamic Side Plank (hip dips), Skater Hops, Seated Band Hip Abduction, Standing Band Hip Abduction,
and Seated Band Close-Grip Pulldown. All previous workout and journal references remain available.

## Duplicate and image review

Each candidate was compared with visible exercises, archived names, aliases and instructions, then its SVG
was rendered and visually checked. No unverified pose is accepted merely because its filename matches.
The twelve accepted first-frame SVGs are unchanged from Workout Guide by Bryl Lim at pinned commit
`aac599224bb9780305239607ef98540b7e0ce389`, under CC BY-SA 4.0. Attribution, source links and exact file hashes
are included in [the expansion audit](catalog-expansion-2.15.json), the app's image credits and license notices.
These are static instructional illustrations, not animations or verified movement sequences.

Excluded examples include a towel hamstring curl asset that depicts a supine stretch, a towel row pose that
does not match an anchored standing row, and a band squat pose without clear band placement. Generic shoulder
stretches, calf stretches, half burpees and existing hinge/row variants were excluded to avoid duplicate rows.

Standing and seated band hip abduction keep separate existing identities. A seated-abduction alias was removed
from the standing record; persisted exercise IDs and prescriptions are unchanged. The Smith Machine Hip Thrust
also remains separate from Smith Machine Hip Raise, whose existing instructions describe feet pressing against
an overhead bar while the pelvis rises off a bench.

## Continued guide review

Nine more checked publisher links bring the total to **308 guides and 191 linked videos**. The former standing
one-arm cable row URL now describes Shotgun Row and is attached to the existing `Shotgun_Row` record. A generic
band hip abduction page was rejected for the seated entry because it describes a standing movement. An overhand
pulldown page was not attached to the restored underhand close-grip entry.

The original 2.14 discovery audit remains as the historical baseline. The new audit records the accepted links,
response hashes and rejected guide mappings. No publisher image or video files are copied into the application.
External video playback still begins only after an explicit Load video action.

## Apply the update

The update ZIP includes every code/configuration file and the twelve new SVG images. Extract it over your
complete existing project, retaining the earlier exercise media folders. From your generic Compose directory:

```sh
sudo docker compose up --build -d form-frontend form-backend form-migrate
```

Open `http://rpi5:2324`. Startup reseeds reference metadata; no new database schema migration is required.
The PostgreSQL port remains 5433 internally and the persistent volume remains `workout_data`.

For native local use, run `pnpm install --frozen-lockfile`, then `pnpm db:seed` against the configured PostgreSQL
instance and restart the app. The root `package.json`, local runners and scripts remain included.

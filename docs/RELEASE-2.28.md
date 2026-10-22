# Form 2.28 — Inline set controls

On phones, repetitions and weight remain two equal, fluid fields with 52px inputs and 18px numbers.
A narrow side column directly beside them contains the set label above a bin icon. This puts the label
and deletion control alongside the fields rather than in a separate row above the whole set.

The bin replaces the visible Remove word in the shared planned-set editor, including desktop and the manual
workout logger. Its accessible label remains `Remove set N`, and the button retains a 44px touch target.
The final remaining set still cannot be deleted. Set 1 replication, later overrides, notes and saved data
are unchanged. No exercise media, backend or database changes are required.

## Update

Rebuild/push the frontend image from this source and pull/recreate its service on the Pi. For the image-based
Compose example with a frontend service named `form`:

```sh
sudo docker compose pull form
sudo docker compose up -d form
```

The app remains at http://rpi5:2324. Reuse your existing complete exercise-media folder. The source ZIP includes
package.json, lockfile, scripts, frontend/backend source, migrations, Docker files and native local-running support.

## Verification

The existing mobile training interaction checks and production frontend/backend builds pass. Source structure
and targeted formatting checks pass. Browser visual verification is unavailable because the managed preview
supervisor is unavailable. Docker/PostgreSQL runtime verification was unavailable.

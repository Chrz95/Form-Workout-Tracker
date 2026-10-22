# Form 2.28 — Source update

Extract this ZIP into your existing complete Form project folder. Keep the exercise media from your earlier
2.26 or 2.27 installation: media files are unchanged and are intentionally not repeated in this source ZIP.
A fresh installation also needs those previously supplied media parts.

This ZIP includes package.json, lockfile, every script, frontend/backend/shared source, migrations,
Docker/Compose configuration, public exercise metadata, licenses and documentation.

The mobile set label and a bin icon sit in a narrow side column directly beside the two equal-width fields.
Inputs retain their 52px height and 18px numbers. The bin keeps an accessible Remove set N label, and the
last remaining set is protected. See docs/RELEASE-2.28.md for details and verification limits.

Rebuild and push the frontend image from this source. Then pull/recreate your frontend service on the Pi.
No backend image rebuild, database migration or media update is required. The URL remains http://rpi5:2324.

After applying this update to the existing complete project, run `node verify-project.mjs`. The inventory
checks every source and media file against its SHA-256 hash, including the reused media.

Source-based Compose startup: `sudo docker compose up -d --build`.
Native startup with PostgreSQL running and DATABASE_URL configured:

```
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Existing mobile training interaction checks, source structure and production builds pass.
Browser visual QA was unavailable because the managed preview supervisor is unavailable.

Source commit: a9cb39646a3b49ff806c4a0013ba34a7f9b172c4

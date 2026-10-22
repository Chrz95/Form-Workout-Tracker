# Form 2.29 — Source update

Extract this ZIP into your existing complete Form project folder. Keep the exercise media from your earlier
2.26, 2.27 or 2.28 installation: media files are unchanged and are intentionally not repeated in this source ZIP.
A fresh installation also needs those previously supplied media parts.

This ZIP includes package.json, lockfile, every script, frontend/backend/shared source, migrations,
Docker/Compose configuration, public exercise metadata, licenses and documentation.

The Docker frontend accepts both http://rpi5:2324 and http://rpi5.nord:4983 through the new
FORM_FRONTEND_ORIGINS allowlist. The supplied Compose publishes both ports to the same frontend.
See docs/RELEASE-2.29.md for image-based Compose configuration and verification limits.

Rebuild and push the frontend image from this source. Older images do not support the plural setting.
Then pull/recreate the frontend and update the backend CORS_ALLOWED_ORIGINS environment as documented.
No backend image rebuild, database migration or media update is required.

After applying this update to the existing complete project, run `node verify-project.mjs`. The inventory
checks every source and media file against its SHA-256 hash, including the reused media.

Source-based Compose startup: `sudo docker compose up -d --build`.
Native startup with PostgreSQL running and DATABASE_URL configured:

```
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Proxy renderer tests, the full test suite, source checks and production builds pass.
Actual Docker, Nginx and PostgreSQL runtime verification was unavailable in this environment.

Source commit: 33ef998eb2b1f482d8e9e6ef5a868d8b1293f4ee

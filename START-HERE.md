# Raspberry Pi HTTP crash and backend connection fix

Extract this complete code ZIP over your existing full project. Keep the exercise media supplied by Form-02-Exercise-Media.zip, Form-03-Exercise-Media.zip and Form-04-Exercise-Media.zip; it is unchanged. All root package, lockfile, workspace, scripts, configuration, migrations and local runners remain included.

## Apply on the Pi

Use the UPDATED compose.app.yaml included here. Its default x-form-origin is auto. Remove old FORM_FRONTEND_ORIGIN=http://localhost:2324 overrides from your main stack's .env, or change them to FORM_FRONTEND_ORIGIN=auto.

Auto mode accepts private LAN address literals, localhost and .local names while rejecting public DNS hosts and cross-site requests. Public/custom DNS names or HTTPS reverse proxies can retain a correct explicit origin. The API's separate FORM_CORS_ALLOWED_ORIGINS setting is already supplied by the updated Compose file; do not put auto into CORS_ALLOWED_ORIGINS when manually merging an older file.

The root include stays `include: [./form/compose.yaml]`. From your generic Compose directory:

```sh
sudo docker compose up --build -d form-frontend
```

This rebuilds the frontend and applies changed dependency configuration. Reload http://<pi-address>:2324.

## Fixes

All browser UUID generation, including logger submission IDs, planned sets, live workout sets and shared prescription conversion, now falls back to crypto.getRandomValues when crypto.randomUUID is unavailable on plain HTTP LAN origins. IDs remain valid cryptographically random v4 UUIDs.

The old default pinned API access to localhost, which could reject requests made through the Pi's IP. Automatic LAN origin mode removes that default block while retaining explicit-origin support and server-side authentication. The old private database hostname db is also preserved as a network alias for older database URL overrides.

The connection banner now reports address rejection, credentials mismatch or backend readiness failures. It keeps automatic retries and never replays failed writes.

## If still waiting

Run these on the Pi from your generic Compose directory:

```sh
sudo docker compose ps -a
curl -i http://127.0.0.1:2324/api/v1/ready
curl -i http://127.0.0.1:2324/api/v1/capabilities
sudo docker compose logs --tail 80 form-db form-migrate form-backend form-frontend
```

In auto mode, ready and capabilities should return 200 JSON. Send the displayed banner error and these diagnostic results if connection remains unavailable. Do not delete workout_data to troubleshoot.

## Local without Docker

Use Node 24.19.x, pnpm 11.25.0 and an installed/running PostgreSQL 17 instance. Configure DATABASE_URL in the private root .env from .env.example.

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Open http://localhost:5173, or use pnpm start:local for http://localhost:8080.

## Verification

204 application tests passed, including logger, builder and live workflows with randomUUID unavailable. 23 PostgreSQL integration tests were skipped because no test database was configured. TypeScript, structure, formatting, shell syntax and frontend/backend builds passed. Actual Nginx 1.24 served an isolated test backend for 28 HTTP checks covering LAN IPv4/mDNS/IPv6, pinned origins, authentication forwarding, and cross-site/DNS-rebinding rejection. Docker daemon/ARM64 execution and your real PostgreSQL connection were not available here.

After extracting code plus all media, run node verify-project.mjs before customizing configuration to check every source file against PROJECT-FILE-INVENTORY.json.

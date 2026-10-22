# Form 2.29 — Two application addresses

The Docker frontend now accepts a comma-separated **FORM_FRONTEND_ORIGINS** allowlist. The supplied Compose
configuration allows both **http://rpi5:2324** and **http://rpi5.nord:4983**, publishing host ports 2324 and 4983
to the same frontend container's port 8080. Both addresses use the same backend, saved workouts and database.

Each request must use an allowed Host and its corresponding browser Origin, or no Origin header. A request
cannot combine one listed Host with another listed Origin. Cross-site Fetch Metadata requests remain blocked.
Paths, wildcards, empty list entries and CR/LF configuration injection are rejected at startup. Spaces around
comma-separated entries are accepted. The token remains server-side and automatic API connection is retained.

FORM_FRONTEND_ORIGINS takes precedence when nonempty. The earlier singular FORM_FRONTEND_ORIGIN remains
supported for a single address. The existing `auto` mode is retained for private IPs, localhost and .local names;
use explicit addresses for .nord hostnames. No frontend API URL needs to be hardcoded: it uses `/api/v1` on the
address currently open in the browser.

## Image-based Compose update

Rebuild and push the **frontend** image from this release first. Older images do not support the plural setting.
The backend already accepts a comma-separated CORS list and does not need a new image for this feature.
Merge these values into your existing Compose, retaining the image, volumes, networks, database and other
backend environment settings:

```yaml
services:
  form:
    ports:
      - "2324:8080"
      - "4983:8080"
    environment:
      FORM_AUTO_CONNECT: "true"
      FORM_FRONTEND_ORIGINS: "http://rpi5:2324,http://rpi5.nord:4983"
      FORM_API_UPSTREAM: "form-backend:3001"
      API_ACCESS_TOKEN: ""
      API_ACCESS_TOKEN_FILE: /run/form-credentials/api-token

  form-backend:
    environment:
      # Merge into the existing environment; keep DATABASE_URL and token settings.
      CORS_ALLOWED_ORIGINS: "http://rpi5:2324,http://rpi5.nord:4983"
```

If the backend inherits `x-form-api`, update CORS_ALLOWED_ORIGINS in that common environment instead.
After pushing the rebuilt frontend image:

```sh
sudo docker compose pull form
sudo docker compose up -d form-backend form
```

## Source-based Compose

The supplied `compose.app.yaml` already contains both mappings and the allowlist. Run:

```sh
sudo docker compose up -d --build
```

FORM_HTTP_PORT and FORM_NORD_HTTP_PORT default to 2324 and 4983. FORM_FRONTEND_ORIGINS overrides the default
list; FORM_CORS_ALLOWED_ORIGINS can override the backend's CORS list separately. Keep public ports and allowed
addresses in sync. `.env.docker.example` and `pnpm docker:init` include the two-address configuration; initialization
preserves an existing environment file instead of rewriting it.

The client must resolve/reach rpi5 or rpi5.nord respectively. No database migration or exercise-media update is
required. Existing database storage, package.json, scripts and native local-running support are retained.

## Verification

Proxy tests execute the real shell configuration renderer and cover the two exact Host/Origin pairs,
backward compatibility, automatic mode, IPv6, token-file injection/cleanup and malformed lists. Backend CORS
parsing accepts both addresses. The full test suite, strict frontend/backend builds and source checks pass.
Actual Nginx/Docker/PostgreSQL runtime verification is unavailable in this environment.

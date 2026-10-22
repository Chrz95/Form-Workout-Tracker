# Form 2.27 — Wider mobile set inputs

At phone widths (680px and below), each planned set now uses two equal columns for repetitions and weight.
Together the fields fill the available content width, with a small gap and normal page padding. The set label
and Remove button occupy a separate row above the inputs, so they no longer squeeze the numeric fields.

Both inputs are 52px tall with 18px numbers. Remove keeps a full label and a 44px minimum touch target.
The shared set editor also provides the same layout in the manual workout logger. Desktop/tablet layouts,
Set 1 replication, independent later-set values, notes and saved training are unchanged.

## Update

Rebuild and push the frontend image from this source, then pull/recreate the frontend service on the Pi.
The image-based Compose example in the chat calls that service `form`:

```sh
sudo docker compose pull form
sudo docker compose up -d form
```

The app remains at http://rpi5:2324. Existing media and backend images can be reused; no database migration
is required. Native local running, package.json, scripts and Docker configuration remain included.

## Verification

The existing mobile training interaction tests pass, including first-set replication, later overrides,
retained notes and exact review targets. Source-structure checks and production frontend/backend builds pass.
Browser visual verification could not run because the managed preview supervisor is unavailable.
Docker/PostgreSQL runtime verification was unavailable.

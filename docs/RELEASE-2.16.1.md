# Form 2.16.1 — Floating save button

The workout editor now keeps a compact Save workout bar at the bottom of the dialog while scrolling, on desktop
and mobile. The bar uses the current light/dark theme, respects the phone's safe area and retains the Saving…
state and duplicate-click prevention. Review and Start remain above it, keeping the floating bar compact.

Extract this update over your existing complete project, preserving earlier exercise media. From your generic
Compose directory, including the updated Form Compose file:

```sh
sudo docker compose up --build -d form-frontend
```

Native local startup remains available. This release adds no new database migration beyond the per-exercise note
migration in 2.16. PostgreSQL storage remains /home/pi/configs/form and the application remains http://rpi5:2324.
If updating from an older workout_data volume, migrate it using POSTGRES-STORAGE.md before starting the new mount.

Validation: seven existing workout-builder interaction tests, frontend type checking, source structure and formatting
passed. Frontend/backend production builds passed. Browser/device visual verification was unavailable here.

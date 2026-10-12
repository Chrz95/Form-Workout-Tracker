# Release 2.2 — Expanded catalog, custom exercises and alternatives

The catalog grows from **876 to 3,201 exercises**, with 2,325 additional described records from licensed snapshots.
There are **1,960 bundled image assets**, three real animated WebPs with separate still posters, and **49 original
technique-video links** across 29 exercises. 1,041 exercises have images; others clearly use text guidance.
Five retained original references lack instructions and show an explicit missing-steps message.

## Added behavior

- Create and edit private exercises with equipment, category, primary/supporting muscles, steps and an optional HTTPS image.
- Delete unused custom exercises; referenced routine/session history is protected by existing PostgreSQL foreign keys.
- Search/filter custom content alongside the public catalog or use the My exercises filter.
- Discover related movements with listed primary muscle overlap; matching equipment ranks first.
- Replace builder prescriptions with unused alternatives, retaining position/sets/reps and resetting load to 0 kg.
- Keep saved routines, history and active live workouts unchanged until their own normal save flow.
- Display text and independent media attribution, source links, licenses and modifications in exercise details.
- Keep thumbnail views and real animations still until motion is requested; stopping restores the poster.
- Stream H.264 source videos on demand, starting muted, with original links for other codecs or playback failures.

Custom routes reject imported IDs, identity/source spoofing, empty steps, and executable or credential-bearing image
URLs. Private content never enters the public bundled catalog. The API never downloads custom image URLs.
`EXERCISE_IN_USE` deletion conflicts retain existing records. Failed saves preserve fields. Drafts remain in tab
memory; PostgreSQL remains the only persistent application database.

## Upgrade

Custom exercises reuse the existing JSON reference table; no new migration is needed. Apply all earlier per-set
migrations and reseed the public catalog before saving routines using new references. Seed never overwrites `custom_` IDs.

On the Docker host after configuring `.env`:

```bash
pnpm db:setup
pnpm build
pnpm start
```

This uses PostgreSQL **5433** and the persistent volume **workout_data**. Already running external databases can use
`pnpm db:migrate`, `pnpm db:seed` and `pnpm db:check` separately. Connect the authenticated HTTPS API as usual.
Release 2.2 advertises `custom-exercises`; older per-set-compatible APIs retain their existing training flows,
but custom saving stays disabled until an updated server is connected.

## Verification and limits

83 tests pass, including full catalog parsing/assets, private route protection, spoofing rejection, deletion
conflicts, failed-save draft retention and safe substitutions. The 12 actual PostgreSQL tests remain skipped because
this runtime cannot start PostgreSQL. No running server or Docker volume was created here.
The published Site remains a private static PWA; durable custom content, routines and history require the supplied
Express/PostgreSQL server on a suitable host. Browser layout, native-dialog focus, installation/offline behavior,
motion and remote playback still require device QA. Videos are not bundled or cached offline and depend on the
source host/browser. No captions are supplied by the source; written guides remain available.

See `CATALOG-SOURCES.md`, `catalog-provenance.json`, and the copied license texts. Calendar planning and CSV import
remain future additions; CSV exports continue to work.

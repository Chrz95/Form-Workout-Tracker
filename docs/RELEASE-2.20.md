# Form 2.20 — Continued exercise restoration

The catalog now has **1,404 visible exercises**, all with local images and descriptive guidance. This continuation restores **22** archived identities and resolves **16** duplicate references. It also enriches nine existing movements, bundling **31 original H.264 videos and 31 full-frame thumbnails**. These add to the verified restoration in 2.19; they do not replace its assets.

**2,124 entries remain archived pending matching, reusable media. Full restoration is still incomplete.** No substitute footage was assigned when posture, load, support or equipment orientation differed.

## Restored movements

- Standing bodyweight hip abduction; fixed-supination supine dumbbell curl; two-handed kettlebell goblet curl.
- Standing quadriceps, bent-knee soleus, cobra, sleeper, step calf, butchers block, seated piriformis and prone single-leg quadriceps stretches.
- BOSU dome lateral lunge and BOSU platform push-up.
- Kettlebell kickstand RDL, hand-to-hand swing and contralateral single-leg RDL.
- Barbell front raise to shoulder height and barbell lateral lunge.
- Standing single-arm dumbbell lateral raise, mini-band squat, bodyweight side lunge and dumbbell pullover with the torso supported along the bench.

The fixed-grip supine curl stays separate from the existing rotating curl. BOSU platform and dome push-ups stay separate. Contralateral and ipsilateral kettlebell RDLs retain their own IDs. The shoulder-height barbell raise does not replace the overhead raise. The supported-along-bench pullover is distinct from the existing cross-bench setup.

## Duplicate handling and saved workouts

Sixteen archived references now resolve to reviewed visible identities, including standing hamstring/toe-touch names, seated single-leg hamstring stretch, overhead triceps stretch, shoulder and neck stretches, two-arm dumbbell preacher curl, pec deck, single-arm kettlebell clean/snatch, BOSU balance and trap-bar squat/deadlift terminology.

All **4,089 historical exercise IDs** remain represented. Legacy IDs are transferred to canonical movements and retired reference chains are flattened. Workout entries, per-exercise notes and individual set prescriptions are not rewritten. Restored IDs become discoverable again after the public catalog seed runs.

## Source review and licensing

MuscleWiki permits branded, linked video and instructional sharing for non-profit or academic use. Original MP4 files are bundled unmodified, with full-frame 640-pixel thumbnails extracted at 40% of each clip. Its independently licensed media is not covered by the application's source-code license. No website SVG/JPEG/PNG assets were copied. Source pages, file hashes, video dimensions, codecs, durations and image hashes are recorded in the asset report and media notices.

OpenGym remains a metadata lookup resource: the pinned catalog and notice details are retained from 2.19. Its Gym Visual media cannot be reused in this independent application without a separate license, and no such images, animations or generated derivatives were imported. Newer AGPL descriptions were not copied. This continuation also inspected Workout Guide stretch artwork: its hamstring illustration elevates a leg on a rail, which is not the bilateral toe-touch movement. Matching native footage was available for the standing quadriceps stretch, so no new artwork was imported.

Rejected clips include a medicine-ball halo offered for a kettlebell halo, a bench chest press offered for a standing kettlebell press, BOSU bridges and side planks with the opposite orientation, and a floor sit-up lifting the BOSU instead of supporting the lower back on it. Rejection details remain in the report.

Six incomplete descriptions were clarified with independently written Form guidance; their original text is retained in the restoration snapshot. Other retained instructions and their original source licenses remain in place.

## Update

Extract every numbered release ZIP into the same empty `form` folder. The source part contains `package.json`, the lockfile, `scripts/`, frontend, backend, database migrations, Compose configuration, catalog metadata and instructions; the media parts contain the complete existing and new media collection. No older download is required. Run `node verify-project.mjs` after extraction to check the full file inventory.

For your Raspberry Pi installation, use the complete updated source and run:

```sh
sudo docker compose up -d --build
```

Or run that command from the directory containing your generic Compose file that includes Form. The app stays at **http://rpi5:2324**, connects to its backend automatically, and retains the configured PostgreSQL storage and credential volume. No database migration is needed for this catalog-only update; normal startup seeds the public references without changing saved training.

Local operation without Docker remains supported:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Configure `DATABASE_URL` for your running local PostgreSQL as described in the main README. `db:setup:local` applies existing migrations and the updated public seed; it does not start Docker.

## Validation

The full suite passes **245 tests**; 24 PostgreSQL integration tests are skipped because this workspace has no test database. Strict frontend/backend type checks, catalog integrity and source-structure checks pass. All 4,089 current IDs also match the SHA-256 digest of the sorted original ID list.

## Verification records

- `docs/catalog-restoration-2.20.json`: decisions, baseline snapshots and all 2,162 baseline archived IDs with current dispositions.
- `docs/catalog-restoration-status-2.20.csv`: complete continuation status table.
- `docs/catalog-restoration-assets-2.20.json`: 31 clip-and-thumbnail provenance records.
- `pnpm catalog:verify-restoration`: checks current dispositions, all historical IDs and 310 media assets introduced by 2.19 and 2.20.

Browser playback, live PostgreSQL and actual Docker startup require verification on the target machine; they were not exercised in this workspace.

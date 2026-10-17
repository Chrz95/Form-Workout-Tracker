# Form 2.22 — Further reviewed exercise restoration

The catalog contains **1,482 visible exercises**, adding **28** restored movements with **84 local images**, and resolving **14** duplicate references. Three Muscle & Strength guide pages add references for incline cable curls and seated bilateral/alternating dumbbell kickbacks; two include direct publisher-selected video links. The alternating kickback page remains a guide link because its Vimeo embed requires an unlisted hash.

**2,021 entries remain archived awaiting suitable media.** Restoration remains incomplete. All **4,089 historical exercise IDs** and every previously visible movement remain represented. Existing workout notes, exercise references and per-set targets are preserved.

## Accepted images and descriptions

144 additional published Flow illustration sets were inspected. This pass accepts 28 sets, with three manually browsable static positions each. The app keeps the visible **AI-generated illustration · static positions** label. No new artwork, simulated video or GIF is generated. Original pose geometry remains intact, a dark background improves contrast, and XML/DTD headers are removed. Complete publisher notices, licensing limits and retained generation provenance remain included.

Restored coverage includes seated stability-ball cable presses, a single-arm cable fly, overhead cable curl and seated cable twist; incline cable curls, two-arm cable kickbacks, a squat-to-row and standing rotational row; a single-arm decline dumbbell fly, stability-ball chest press and curl, prone flat-bench hammer curl, rotational dumbbell row and bowling lunge curl; seated alternating and simultaneous triceps kickbacks, stability-ball dips and overhead triceps extensions; hanging oblique knee raises, push-up combinations, side-plank leg raises, parallel-bar side raises, slider reverse lunges and squat-to-overhead reaches.

The retained squat-row instructions were clarified with independently written guidance. Muscle and equipment labels were corrected where needed, including the chest emphasis of the push-up with inside leg kick. Misleading source titles are kept as search aliases while display names match the retained posture and movement. Original records are retained in the audit snapshot.

Images with swapped identities or conflicting apparatus were rejected. Examples include a kneeling hinge mislabeled as a supine strap stretch, a strap stretch mislabeled as a band hip thrust, a seated row labeled as a shoulder press, and a squat labeled as a triceps press. The one-arm barbell floor-press reference remains archived because its retained grip guidance needs further review.

## Duplicate references

Verified pairs include seated barbell good mornings, kneeling barbell squats, incline-supported barbell curls, one-arm side barbell deadlifts, stability-ball pullovers, bodyweight hamstring curls, suspension fallouts, inchworms, kettlebell lunge pass-throughs, slider reverse lunges and hanging oblique knee raises. Alternating and simultaneous kickbacks remain distinct. Seated stability-ball cable twists remain distinct from the existing supine ball cable twist. Each decision has an explicit reason in the report.

## Running the update

Extract all numbered 2.22 ZIPs into the same empty project folder, then run:

```sh
node verify-project.mjs
```

The source ZIP includes `package.json`, lockfile, all scripts, frontend, backend, migrations and Compose files. Media ZIPs include the entire earlier catalog plus this update; no earlier download is required.

On the Raspberry Pi, run from the project directory, or your generic Compose stack that includes Form:

```sh
sudo docker compose up -d --build
```

The app remains at **http://rpi5:2324**, connects to its backend automatically, and uses the existing PostgreSQL persistent-storage configuration. This release adds no database migration; startup seeds the revised catalog.

Local operation remains supported with a running PostgreSQL instance and configured `DATABASE_URL`:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

## Validation and audit

- **254 tests pass**; 24 PostgreSQL integration tests are skipped without a test database.
- Frontend/backend strict type checks, source structure and production builds pass.
- `pnpm catalog:verify-restoration` verifies every baseline disposition, all 4,089 historical IDs, and **534 asset hashes** across releases 2.19–2.22.
- `docs/catalog-restoration-2.22.json` records original entries, preserved identities, duplicate decisions, accepted/rejected sources and all 2,063 baseline archived dispositions.
- `docs/catalog-restoration-status-2.22.csv` provides the full status table.
- `docs/catalog-restoration-assets-2.22.json` includes exact source and bundled hashes, selected frame indexes and publisher provenance.
- `licenses/alternative-sources-MEDIA-notices.txt` retains source notices and individual media links, mirrored inside the app.

Live PostgreSQL, actual Docker startup and browser playback were not exercised in this environment. Linked external video availability depends on its publisher.

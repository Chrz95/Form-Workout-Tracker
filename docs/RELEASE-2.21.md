# Form 2.21 — Images from additional sources

The visible catalog now contains **1,454 exercises**. This pass restores **50** archived movements with local images and instructions, resolves **11** duplicate references, and adds **139 images plus one locally playable video**. One additional credited photograph enriches the existing suspension push-up.

**2,063 entries remain archived pending suitable media.** This is further restoration, not a claim that every remaining entry has been recovered.

## Sources and presentation

**Flow Exercise Dataset:** 48 restored movements use 136 selected SVG positions from its published CC0 artwork collection. The publisher reports that these are AI-generated illustrations and documents limits in its surviving generation records. Form labels them **“AI-generated illustration · static positions”**, preserves the publisher's complete notices and provenance, and provides manual image browsing. They are not played as simulated photographic/video motion. Pose geometry is retained; a dark background makes the artwork readable in both themes. XML/DTD headers are removed and passive vector content is checked.

154 candidate illustration sets were inspected. Images were rejected when support, equipment or movement differed, or when the illustrated position was unsuitable. In particular, arm-sling raises did not receive hand-hanging artwork, a roller body saw did not receive ring-dip artwork, and a single-hand chest tap did not receive a two-hand-release pose. The wall-sit march uses only its reviewed single-leg position.

**Wikimedia Commons:** Taco Fleur's CC BY-SA 4.0 overhead-walk footage restores the single-arm kettlebell overhead carry, with a full-duration muted H.264 conversion and a real extracted thumbnail. A still from his double-kettlebell strict press illustrates the shared overhead finish of the double clean-and-press. That record explicitly describes the photograph as a finish position and does not claim the source shows a complete clean-and-press cycle. PTPioneer's CC BY 2.0 TRX push-up photograph enriches the existing suspension push-up with the requested linked creator credit.

Other sources were checked, including wger, Workout Guide, RepDB, TrainAI and Your Move. Their candidate media was not imported where the reuse scope was unsuitable, creator details were absent, or the actual equipment/setup did not match an archived movement. No OpenGym/Gym Visual media or newly generated derivatives were used.

## Restored coverage

The new visible movements include band concentration curls, reverse wrist curls, kneeling rotational crunches, twisting presses/rows and Y-raises; stability-ball pike push-ups, back extensions, fly variations, seated curls and kickbacks; full planche, planche push-up and lean, front-lever position, kneeling shoulder taps, wall-sit march and reverse-plank leg lift; dumbbell overhead carry, curl-and-press and burpee-with-press; and kettlebell floor press, bottoms-up hang clean, seated double press, overhead carry and double clean-and-press.

Five incomplete or unclear descriptions were clarified with Form-authored guidance. The original instructions remain in the restoration snapshot. Existing description licenses are preserved independently from media licenses.

## Identity preservation and duplicates

All **4,089 historical exercise IDs** remain represented, and every previously visible identity remains visible. Duplicate decisions compare the retained instructions and equipment: examples include two names for kettlebell renegade rows, band front raises, shoulder presses, L-sit references and floor body-up extensions. Their old IDs remain canonical aliases; stored workout records, notes and per-set prescriptions are not rewritten.

## Running the update

Extract every numbered 2.21 ZIP into the same empty `form` folder. The source ZIP includes `package.json`, lockfile, all scripts, frontend, backend, migrations, Compose configuration and catalog metadata. The media ZIPs include the entire earlier collection plus this update. No earlier ZIP is required. Run `node verify-project.mjs` after extracting every part.

On your Raspberry Pi, rebuild from the full updated source:

```sh
sudo docker compose up -d --build
```

Run this from your generic stack directory if that Compose file includes Form. The app remains at **http://rpi5:2324**, with automatic backend connection and the existing PostgreSQL persistent storage configuration. This release adds no database migration. Normal startup seeds the revised public catalog.

Local development remains supported with your running PostgreSQL and configured `DATABASE_URL`:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

## Validation

The full test suite passes **250 tests**; 24 PostgreSQL integration tests are skipped because no test database is available. Strict frontend/backend type checks, source-structure checks and production builds pass. The restoration verifier checks 450 asset hashes and all historical IDs.

## Audit files

- `docs/catalog-restoration-2.21.json`: baseline identity digest, original descriptions, decisions, source review, and all 2,124 baseline archived IDs with current dispositions.
- `docs/catalog-restoration-status-2.21.csv`: complete continuation status table.
- `docs/catalog-restoration-assets-2.21.json`: source/bundled hashes, selected frame indexes, original publisher provenance, source pages and Commons media records.
- `licenses/alternative-sources-MEDIA-notices.txt`: complete source notices and independent license credits, mirrored in the public app.
- `pnpm catalog:verify-restoration`: checks current dispositions and 450 assets introduced across 2.19–2.21.

Actual Docker startup, live PostgreSQL integration and browser playback require target-machine verification and were not exercised here.

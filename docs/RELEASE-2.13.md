# Release 2.13 — More non-duplicate exercises with images

The public library now contains **1,272 image-backed entries**, adding **30** movements to discovery:

- 21 new yoga and mobility movements, including warrior, tree, eagle, chair, boat, camel and happy baby poses.
- Eight previously image-free entries restored, including BOSU dome push-ups, squat curls, curls on a stability ball,
  step-ups with curls, single-leg hinge curls, upward-facing dog, sphinx and reverse plank.
- One standing curl with a rear foot on a ball restored from an incorrectly merged historical alias.

There are 24 independently credited photographs and 12 original SVG positions. Every image is bundled locally,
with no third-party request required while browsing. Instructions, muscle groups, equipment and difficulty accompany each entry.
Photographs and start/end drawings are static; genuine animation is not claimed for these assets.

## Non-duplicate review

Canonical names are unique across visible and historical collections. Body position, equipment and laterality were reviewed
against existing instructions. Four photograph candidates were excluded because the rendered pose did not match the label
or would duplicate Superman. A feet-on-ball push-up was excluded because it already exists in the library.

The original `everkinetic:0263` instructions and SVG show a **standing** curl with a rear foot supported on a stability ball.
Its former parent, `hasan:1652`, describes a **seated** curl with a raised leg. They now have separate canonical records,
with the original IDs retained. Historical aliases resolve directly; no workout or journal prescriptions are rewritten.
All 4,061 previous exercise IDs remain available. There are 2,392 archived records and 418 retired aliases.

## Attribution and updates

Commons photographs retain per-file photographer credits, file/history pages and CC BY 2.0/3.0 or CC BY-SA 3.0/4.0 links.
Original files or Commons-supplied thumbnails are bundled unchanged. New Form instructions use CC BY-SA 4.0.
Everkinetic/Greg Priday poses and instructions use CC BY-SA 4.0 at pinned commit
`446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6`. Source notices accompany both the application and source package.
`catalog-expansion-2.13.json` records source provenance, previous content, selected identities, exclusions and asset hashes.

Run `pnpm db:seed` after updating an existing local installation, then restart the API and refresh the PWA.
Docker’s startup seed imports the same metadata after rebuilding. No schema migration is necessary.
PostgreSQL remains on port 5433 with persistent `workout_data` storage.

## Validation

- 187 tests passed; 23 PostgreSQL integration cases skipped because no test database is available.
- All 2,301 distinct referenced image files decoded with valid dimensions; no broken image files found.
- All 36 new asset hashes match the recorded sources; the 12 SVGs contain passive vector content only.
- All 4,061 prior exercise IDs remain available. Canonical names and IDs are unique; every retired alias resolves.
- New tests verify independent seated/standing curl graph identities, source/asset hashes, photograph credits,
  and yoga/Sanskrit search aliases.
- Type checking, lint, formatting, structure checks and frontend/backend builds passed.
- Real PostgreSQL reseeding and browser/device QA were not performed in this environment.

The existing Vite chunk-size advisory remains and does not fail the build.

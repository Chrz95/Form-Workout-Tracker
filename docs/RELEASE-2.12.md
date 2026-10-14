# Release 2.12 — Image-backed catalog cleanup

The public exercise library now contains **1,242 unique image-backed entries**:

- 24 new reviewed movements with original instructions and licensed illustrations.
- 90 existing entries enriched with licensed illustrations.
- Four entries now use genuine, licensed video stills as image guides.
- Seven reviewed equivalent movements merged, with original IDs retained as aliases.
- 2,400 image-free entries excluded from discovery and replacement suggestions.

Workout Guide supplies 114 unmodified SVG first poses at pinned commit
`aac599224bb9780305239607ef98540b7e0ce389`. All 137 candidate illustrations were rendered and inspected;
23 candidates were excluded for equipment, apparatus or pose mismatches. White line illustrations receive a dark
background in light and dark themes. Static drawings are not presented as genuine animation.

See `catalog-image-review-2.12.json` for selected movements, exclusions, source provenance and asset hashes.
The art is CC BY-SA 4.0, with Bryl Lim and upstream Everkinetic/Greg Priday credits per frame.
Existing descriptions keep their original licenses; new Form instructions are original and shared under CC BY-SA 4.0.
All prior videos, animation licenses and source notices remain available.

## Saved record compatibility

Every one of the prior 4,037 canonical/retired exercise IDs remains in active, archived or alias metadata.
Image-free metadata is loaded separately from `/exercise-references.json` for old workout labels, graph identity
resolution, exercise review, imports and session history. It is precached for offline browsing alongside the active catalog.
Archived cards cannot be newly added through exercise review or offered as replacements. Existing workout prescriptions
and training records are not deleted or rewritten.

The PostgreSQL seed upserts active, archived and alias metadata. Historical records have no discovery name key;
the API omits archived and alias cards while persistence lookups retain them. No schema migration is necessary.
Private owner-authored exercises remain private API records and retain the existing editor behavior.
The deduplication command preserves alias targets in both active and archived collections.

## Applying to a local installation

Run `pnpm db:seed`, then restart the API and refresh the PWA. Use your existing configured PostgreSQL instance.
Docker rebuilds include all three metadata files; the migration service seeds before the API starts.
PostgreSQL remains on port 5433 and its named volume remains `workout_data`.

## Validation

- 183 tests passed; 23 PostgreSQL integration cases skipped because this environment has no PostgreSQL/Docker service.
- Catalog names/IDs are unique; all retired aliases resolve directly to an active or archived canonical record.
- All 2,265 distinct referenced image files decoded successfully; no broken or missing image files found.
- Every accepted SVG hash matches its pinned source; all prior identities remain available.
- New tests cover discovery counts/filter options, historical lookup, compatibility fetch failure,
  archived API filtering and archived alternative exclusion.
- Type checking, lint, formatting, structure checks and frontend/backend builds passed.
- Browser/device layout QA and real database reseeding were not performed in this environment.

Existing Vite chunk-size advisory remains; it does not fail the build.

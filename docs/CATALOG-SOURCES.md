# Exercise catalog sources and import

The verified snapshot union has **3,201 retained references**, not a promise of 3,201 anatomically distinct movements.
New names are deduplicated after case/accent/punctuation normalization; differently named variations can overlap.
Original 876 IDs remain unchanged for compatibility, including five records with no source instructions.
Every new record has source guidance; no combinations or instructions were invented to inflate the count.

| Source              | Snapshot records |     Retained | Terms                                                          |
| ------------------- | ---------------: | -----------: | -------------------------------------------------------------- |
| Free Exercise DB    |              876 | 876 original | Unlicense/public domain; existing photographs retained         |
| wger English        |              925 |    770 added | Translation-specific CC-BY-SA 3/4 or CC0                       |
| Hasan Yıldırım      |            1,324 |  1,161 added | MIT text/metadata; no excluded-license media                   |
| Glowupp             |              322 |    242 added | MIT descriptions, tips and metadata                            |
| Kinetic Place       |              899 |     16 added | MIT instructions/metadata; extensive overlap                   |
| Arham Wani metadata |              317 |    136 added | MIT generated/curated source metadata; purchased media omitted |

Import precedence is original references, wger, Hasan, Glowupp, Kinetic, Arham Wani. Most exclusions are duplicate
names. wger also excludes 73 translations without required author/history attribution and empty/unusable guidance.
Difficulty is `unspecified` when not supplied. Missing anatomy remains visibly unknown; filter normalization does
not infer missing muscle groups. Source aliases are searchable. Similar names are not automatically equated.

## Media and licensing

279 attributed wger images were freshly downloaded and decoded; 214 assets across 168 retained exercises are
selected after exercise-name and image-hash duplicate suppression. Each preserves its author, original URL,
independent license and conversion note. Images are proportionally resized to a maximum 1,000-pixel edge and
converted to WebP. Three retain actual animation frames; separate first-frame posters support stopped motion.
One AI-marked image and unattributed assets are excluded. The final catalog references 1,960 images plus three
posters; 1,041 exercises have images. 49 original video links cover 29 exercises, including 19 H.264 clips.
Videos stream from the original host and are neither bundled nor cached offline.

MIT permissions and original copyrights are copied in `licenses/` and publicly bundled under `/licenses/`.
wger descriptions use the English translation's license rather than the parent exercise's license; five upstream
entries have different values. Full translation attribution metadata, selected asset credits and snapshot SHA-256
values are preserved in `catalog-provenance.json`. wger HTML becomes plain text and supplied muscle/equipment labels
are normalized. Description and image adaptations retain their original ShareAlike licenses.
Exercise details and `/catalog-licenses.html` show credits, sources, modifications and legal links.

No Gym visual images/GIFs covered by Hasan's media exception or uncertain purchased Arham Wani videos are copied.
Restricted RepDB redistribution and unclear inherited Yoga API descriptions are excluded. Custom owner exercises
remain private API content and never enter this public catalog.

## Maintenance

`scripts/merge-catalog.mjs` reads explicitly supplied verified snapshots; it never fetches data at application runtime.
Required inputs are `wger.json`, `wger-licenses.json`, `wger-images-manifest.json`, `wger-attributed-videos.json`,
`hasan.json`, `glow.json`, `kinetic.json`, `zenith.json`, and prepared `wger-images/` WebPs and animation posters.
Review attribution and terms for every refresh; new upstream content can change permissions.

```bash
pnpm exec node scripts/merge-catalog.mjs /absolute/path/to/verified-snapshots
pnpm test:run
pnpm db:seed
pnpm build
```

The script retains original identities, rebuilds additions deterministically and copies shared/public JSON together.
Seed upserts public references and leaves private identities intact. Existing database references absent from a newer
snapshot remain to protect history; do not remove those rows blindly.

Primary sources:

- https://github.com/yuhonas/free-exercise-db
- https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json
- https://raw.githubusercontent.com/Glowupp-app/open-exercisedb/main/exercises.json
- https://raw.githubusercontent.com/kinetic-place/exercises-db/main/en/exercises.json
- https://raw.githubusercontent.com/luisaraujoc/free-exercise-db-api/main/data/exercises.json
- https://wger.de/api/v2/exerciseinfo/?limit=1000
- https://wger.de/api/v2/license/?limit=100

## Release 2.6 motion assets

Catalog identities remain unchanged at 3,625 visible exercises. Six GIFs and fourteen locally bundled H264/yuv420p
MP4 clips cover seventeen existing wger movements. Three GIFs are original animations; three are derivatives of
actual footage. Video derivatives retain the full source duration, are resized to fit 640 pixels and omit audio.
They retain CC BY-SA 4.0 licensing, original source URLs, authors and explicit conversion notes.
GIFs never start in thumbnails; each has a static poster and an explicit Play animation/Stop motion control.
Videos use native controls, no autoplay and preload none. MP4 requests bypass service-worker caching for reliable
byte-range playback; local filenames do not imply guaranteed offline video availability.

`frontend/public/motion-attribution.json` records exact source mappings, verified formats, dimensions, hashes,
conversion notes and source license evidence. `/catalog-attribution.json` includes the updated per-exercise metadata.
There are now 2,147 image references and nine animation posters. The three earlier animated WebP guides remain.
The original license texts are still bundled. Browser codec/playback and mobile-device checks remain unperformed.

## Release 2.12: image-backed discovery

The visible catalog now has 1,242 image-backed canonical records, including 24 new movements and 90 existing
records enriched with illustrations. Four genuine licensed video stills now qualify as image guides. Seven equivalent
movements are merged; all legacy IDs and independent media credits remain. The 2,400 records without images are
retained in `shared/archivedExercises.json` and public compatibility metadata, outside discovery. There are 419 retired
aliases resolving directly to active or archived canonical records.

114 Workout Guide SVG first poses are bundled unchanged from pinned commit
`aac599224bb9780305239607ef98540b7e0ce389`. Artwork is CC BY-SA 4.0; metadata/code is MIT. Bryl Lim and original
Everkinetic/Greg Priday artwork, upstream URLs and tracing changes are credited separately on each applicable frame.
New Form instructions are original and shared under CC BY-SA 4.0; existing text licenses remain unchanged.
23 source matches were rejected after inspecting rendered poses for mismatched equipment or positions.
`catalog-image-review-2.12.json` retains selections, exclusions, source manifest hash and each accepted SVG hash.
The new poses are static illustrations, not claimed to be genuine animations. Existing motion assets remain licensed.

The deduplication command processes both active and archived canonical records and preserves alias links across both.
Future verified imports must be followed by `pnpm catalog:deduplicate` to exclude image-free discovery entries.

## Release 2.13: further image-backed discovery

Thirty distinct entries are added to the visible library, which now contains 1,272 records with images.
Twenty-one entirely new yoga/mobility movements use original Form instructions and independently licensed Commons
photographs. Eight historical image-free canonical records return with verified image guides. One retired Everkinetic
standing curl reference is restored as a canonical record after confirming that its rear-foot-on-ball position differs
from the previously merged seated leg-raised curl. Every prior ID remains available; no stored prescriptions are rewritten.

Twenty-four photographs or Commons-provided thumbnails are bundled unchanged, with photographer names, source/history
pages and per-file CC BY 2.0/3.0 or CC BY-SA 3.0/4.0 links. Twelve original SVG poses and guidance from Everkinetic use
CC BY-SA 4.0 at pinned commit `446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6`.
Rendered candidates were inspected for actual equipment and posture; four poorly matched photograph candidates and
an existing feet-on-ball push-up were excluded. Detailed credit notices accompany the static app and source archive.

`catalog-expansion-2.13.json` records selected IDs, original source metadata, source/asset hashes, previous record content,
reviewed exclusions and the standing/seated identity decision. Canonical name keys are unique across visible and archived
metadata; every retired alias resolves directly to its canonical parent.

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

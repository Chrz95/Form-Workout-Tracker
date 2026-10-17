# Form 2.19 — verified catalog restoration

This pass restores **95** distinct archived exercises with local videos, thumbnail images and descriptions. The
visible catalog now contains **1,382** exercises. Another **127** archived entries resolve to existing canonical
exercises as duplicate aliases. All **4,089** historical public IDs remain in the visible, archived or retired
reference collections; saved workout IDs, per-set targets and exercise notes are not rewritten.

**This is not a complete restoration.** There are **2,162** archived entries still awaiting verified media and,
where necessary, further identity review. Some may prove to be additional duplicates. No placeholder pictures,
unrelated movements or unlicensed OpenGym animations were substituted to inflate the restored count.

The complete list is in [catalog-restoration-status-2.19.csv](catalog-restoration-status-2.19.csv). The
[review JSON](catalog-restoration-2.19.json) records the earlier fields, duplicate destinations, candidate links,
source checks and unresolved IDs. A candidate link or numeric source-ID match is not an approved movement match.

## Examples restored

The batch includes dumbbell thrusters and push presses; unilateral supinated, hammer and reverse dumbbell curls;
dumbbell single-leg hip thrusts; band pull-throughs, overhead triceps extensions and squat rows; kettlebell curls,
goblet Cossack squats, floor presses and double kettlebell Z-presses; TRX hamstring curls, pikes, squats and mountain
climbers; BOSU squats and balance work; and wide-stance leg presses. Existing records also gain videos, including
machine leg curls, hip abduction/adduction, calf raises, cable rows and barbell hip thrusts.

The former single-arm fixed-grip dumbbell curl is restored under its original ID. It remains separate from the
rotating single-arm curl added in 2.18. The low-held kettlebell lateral lunge also remains separate from the
restored goblet Cossack squat. Grip, support, posture and equipment differences are retained when they describe
different movements. Reviewed duplicate aliases share one discoverable canonical exercise.

## Media and descriptions

There are **124 newly bundled clips** with 124 static thumbnails: 120 original branded MuscleWiki MP4 files and
four attributed Goulart/wger H264 conversions. They cover the 95 restored exercises and enrich 27 existing visible
records. Videos play on request; cards use still thumbnails. All MP4 files and thumbnails are local, so ordinary
playback does not depend on a third-party media host. The PWA does not precache MP4 files for offline playback.

MuscleWiki's own sharing terms apply: personal/non-profit or academic use with original branding and links. This
is not a Creative Commons or unrestricted commercial-use grant. Thumbnails are extracted from the source footage;
no MuscleWiki website JPG, PNG or SVG assets were copied. Goulart footage and its derivatives retain CC BY-SA 4.0.
The [asset report](catalog-restoration-assets-2.19.json) records source hashes, final hashes, codecs, dimensions,
durations and poster timestamps. Independent media terms and credits appear in the app's source details and
`licenses/catalog-restoration-MEDIA-notices.txt`.

Existing description licenses are preserved. Form revised incorrect or incomplete instructions for the landmine
lateral raise, kneeling triceps extension, single-arm hammer curl, frog crunch, cable kickback
standing bodyweight hamstring curl, single-leg dumbbell calf raise and machine hip abduction. The prior text is retained in the review JSON.

OpenGym was checked as requested: a pinned metadata catalog of 5,632 records produced 1,115 name/source-ID lookup
candidates across the archive. Its current notice prohibits copying or integrating its licensed media into an
independent application without a separate license. No OpenGym images, animations, generated derivatives or new
AGPL descriptions were imported. Numeric matches alone were not used to merge identities.

Rejected examples include a seated band row paired with standing footage, hands-on-ball push-ups paired with
feet-on-ball footage, hanging wipers paired with floor footage, supine toe taps paired with standing box taps,
and a one-sided kettlebell deadlift paired with footage using two kettlebells. Workout Guide pose candidates
were also checked and rejected where the illustrated grip or position did not match.

## Update and run

Extract **all distribution ZIP parts into the same folder**, preserving their relative paths. The source package
includes `package.json`, the lockfile, scripts, frontend, backend, database migrations and Docker configuration.
The media packages contain all earlier and new bundled assets. Run `node verify-project.mjs` from that folder to
check that every inventoried file is present and unchanged.

On the Raspberry Pi, from the project or generic Compose stack directory:

```sh
sudo docker compose up -d --build
```

Startup migrates and reseeds the reference catalog. Existing training data is preserved. The configured address
remains `http://rpi5:2324`; PostgreSQL remains on internal port 5433, with the existing host data directory and
persistent proxy credentials. No connection UI step is required. Do not remove database storage to update media.

For the existing native local setup, stop the app, then run:

```sh
pnpm install --frozen-lockfile
pnpm db:seed
pnpm dev
```

Use the existing configured PostgreSQL connection. There is no new migration or dependency. Run
`pnpm catalog:verify-restoration` to check restoration accounting and all 248 new asset hashes.

## Verification

All 241 runnable tests pass; 24 PostgreSQL integration cases are skipped because no test database is configured.
Frontend/backend strict type checks and the source structure check pass. The new verifier checks all restored and
duplicate IDs and every new media hash. The whole-project linter still reports the same 54 errors and 10 warnings
as the unchanged 2.18 baseline; no new diagnostics were introduced. New restoration code passes targeted lint.
Docker execution, a live PostgreSQL reseed and native browser playback were unavailable in this environment.

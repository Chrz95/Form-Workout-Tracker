# Release 2.14 — Checked external exercise guides

This update enriches the existing image-backed catalog with public how-to guides from MuscleWiki and
Muscle & Strength: **238 exercises**, **299 guides** (137 MuscleWiki and 162 Muscle & Strength), and
**188 linked video demonstrations**. The exact accepted totals, links, exclusions and response
hashes are recorded in [the enrichment audit](catalog-enrichment-2.14.json).

## What appears in the app

Exercise details now include **More technique guides** where a publisher page was verified against an
existing exercise identity. Publisher guide links always open in a new tab. Available publisher-selected
YouTube or Vimeo players load after pressing the publisher's Load video button; they do not autoplay.
Each player can be closed, and the original guide and direct video links remain available if an embed fails.
The same detail dialog is available from the workout builder's thumbnails.

The 1,272 visible exercises keep their existing IDs, instructions, classifications, photographs, illustrations
and media licenses. No new duplicate exercise rows are created. Previously archived movements remain archived;
old workout references, nested routines and logged set values are preserved.

## Crawl and identity review

The crawl visited the requested landing pages and public exercise directories, and read both public sitemaps
and robots files. Discovery contains **3,223 URLs**: 1,985 MuscleWiki exercise paths and 1,238 Muscle & Strength
exercise-directory paths. The latter includes category paths; these totals are URLs, not a count of unique
new exercises. Tracking parameters from the supplied Muscle & Strength URL were discarded.

Conservative movement keys compare titles and aliases across visible records, archived movements and retired
aliases. Equipment, laterality, position and movement qualifiers are retained. The 335 paths with a single
visible match received a separate page fetch. Actual page titles are checked again before accepting a guide.
Generic paths that now describe a Vitruvian exercise, a belt squat, or another distinct variant are excluded.
No fuzzy name match is imported automatically. Renamed guides without a confirmed identity remain excluded.

[The candidate CSV](catalog-crawl-candidates-2.14.csv) includes every discovered URL and its initial match
status. Labels are derived from URL slugs and are explicitly unverified. `unmatched` means further identity
and image review is required; it does not prove a new movement. `archived` is already known but currently hidden,
`ambiguous` has multiple possible canonical identities, and `visible` identifies a candidate for page validation.
New movements are held for independent image rights and identity review before entering the public library.

## Publisher content and media

The app retains its existing licensed local media. External references preserve each publisher's ownership
and attribution; no publisher photographs, thumbnails, video files, or instruction blocks are bundled.
MuscleWiki's public website terms permit some branded non-profit sharing but reserve image assets; its API
has separate subscription and caching terms. Muscle & Strength reserves rights in its content. This update
uses public guide links and the embeds selected on those guides; it does not use either site's private APIs.
Original publisher and player availability or embedding permissions can change.

- https://musclewiki.com/terms
- https://www.iubenda.com/terms-and-conditions/27031375

## Apply on your Raspberry Pi

Extract the updated code over your complete existing project, retaining the exercise media folders.
From your generic Compose directory:

```sh
sudo docker compose up --build -d form-frontend form-backend form-migrate
```

The migration service's existing startup command reseeds public reference metadata. No new database schema
migration is required. The address remains `http://rpi5:2324`, PostgreSQL uses internal port 5433, and the exact
persistent volume is `workout_data`. The frontend still connects automatically.

For native local usage, install dependencies with `pnpm install --frozen-lockfile`, run `pnpm db:seed`, then
restart the application. Native local runners and the root package files remain included.

## Repeat discovery

Run from the project root using the existing Node/tsx development dependencies:

```sh
node --import tsx scripts/crawl-exercise-guides.mjs ../catalog-crawl
```

This creates a cached discovery comparison and checked-page list outside the application. It follows only
public paths on the two selected hosts, with four workers, request timeouts and robots exclusions.
It does not modify the catalog. Inspect actual page titles and variants before preparing a reviewed audit.
A reviewed audit can be applied idempotently with:

```sh
node --import tsx scripts/apply-exercise-guides.mjs docs/catalog-enrichment-2.14.json
```

The importer requires existing visible IDs and independent publisher links and preserves all previous fields.

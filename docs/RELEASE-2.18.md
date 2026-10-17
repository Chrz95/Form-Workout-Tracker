# Form 2.18 — Requested exercises with reviewed motion

| Requested name                             | Result                                                                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standing Cable Pec Fly                     | Existing Cable_Crossover entry retained from 2.17, including images and publisher video guide.                                                                       |
| Seated Single-Arm High Pulley Row          | Existing wger:1637 seated high-cable entry renamed and clarified, retaining its photo and ID. FITTR guide/video added. Kneeling and low-pulley rows remain separate. |
| Cable rope face pulls                      | Existing Face_Pull entry renamed Cable Rope Face Pull, with plural/search aliases. Existing images and Muscle & Strength video retained.                             |
| Dumbbell Reverse Lunge                     | Existing Dumbbell_Rear_Lunge renamed with rear/reverse aliases. Images and Muscle & Strength video retained.                                                         |
| Kettlebell single arm calf raise           | Existing glow:kettlebell_calf_raise restored with corrected kettlebell/calves metadata. This is two feet with a one-hand load, not a single-leg calf raise.          |
| Kettlebell lateral lunge                   | New low-held stepping variation; the archived goblet/Cossack entry remains separate.                                                                                 |
| Dumbbell Standing Single Arm Twisting Curl | New single-dumbbell rotating curl, distinct from fixed-supination and two-dumbbell alternating variations.                                                           |
| Biceps                                     | Muscle group/filter for curl discovery; no placeholder exercise created.                                                                                             |

The visible catalog now has 1,287 entries, all with local images or genuine motion frames. Three full-duration
MuscleWiki demonstrations are bundled as original MP4 files and looping GIFs. Still thumbnails come from those
videos. Framing and MuscleWiki branding are retained; no poses or animation frames are invented.

## Source and usage notes

The new footage uses MuscleWiki's publisher-specific non-profit/academic sharing terms, appropriate to this
personal workout app; it is not a blanket Creative Commons or commercial-use media license. Branding, guide links,
per-exercise credits and terms links are included. No MuscleWiki website image assets were copied. See
licenses/musclewiki-MOTION-notices.txt and the in-app Catalog sources page. Existing content keeps its own licenses.

Each source video/page hash, local asset hash, duplicate decision and pre-change record is recorded in
catalog-request-review-2.18.json. FITTR's YouTube video is linked through an on-demand player; it is not copied.

## Raspberry Pi update

Extract the update ZIP over the existing project, retaining earlier exercise media. All code, package.json,
scripts, Docker configuration, catalog files and the new motion assets are included.

From your generic Compose directory, including the updated Form Compose file:

```sh
sudo docker compose up --build -d form-frontend
```

The normal seed step updates catalog metadata and preserves saved exercise IDs. No additional database schema
migration is introduced. PostgreSQL remains at /home/pi/configs/form on internal port 5433, and the application
remains at http://rpi5:2324 with automatic backend connection. If you still use the older workout_data volume,
follow POSTGRES-STORAGE.md before starting with the changed mount.

For native local use, run pnpm install --frozen-lockfile, pnpm db:seed and pnpm dev with DATABASE_URL configured.

## Validation

237 tests passed; 24 live PostgreSQL integration cases were skipped without a dedicated test database. Checks
cover all seven supplied search names, unordered word search, Biceps filtering, unique visible identities,
historical IDs, media hashes and source credits. The three GIFs were decoded and checked against the complete
source video durations; source frames and final thumbnails were visually reviewed. Type checks, source structure,
formatting and frontend/backend production builds passed. Browser/device execution and live database seeding
were unavailable here.

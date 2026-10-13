# Release 2.3 — Duplicate consolidation, more exercises and calendar planning

The visible catalog has **3,625 exercises**, up from 3,201. It retains **635 entries from two newly verified sources**
(520 rthepen, 115 Everkinetic), while consolidating duplicates from both the prior catalog and candidate imports.
**412 duplicate/equivalent-name references** are retired from discovery and retained for existing saved records.
It references **2,141 images/illustrations**, including three opt-in animations, and preserves 49 source video links.
222 original Everkinetic SVG illustrations were downloaded, XML/safety-checked and retained without alteration.

## Duplicate controls

- Unique IDs and canonical movement-name keys are checked across every visible exercise.
- Name matching covers spelling, plurals, reordered descriptors and familiar equipment synonyms.
- Grip, body angle, one/two limbs, underfoot equipment and ordered movement sequences remain significant.
- Original source names are reviewed with equipment and full instructions to avoid false new entries from equipment prefixes.
- Identical guidance and confidently reviewed aliases are consolidated; distinct apparatus/rope/ladder variations stay separate.
- Canonical records retain searchable alternate names and all retired IDs; routines and actual sets are never rewritten.
- Progress groups actual values for canonical and retired IDs; previous-performance lookup and labels resolve old references.
- New routine/session writes reject repeated canonical movements, even if different old IDs were submitted.
- Custom creation checks canonical names and known aliases; PostgreSQL unique name keys also prevent concurrent duplicate names.

`catalog-deduplication.json` records every retirement and its reason. The conservative name key and reviewed alias
mapping are enforceable checks, not a claim that automated text matching can prove anatomical uniqueness for every
community-authored description. Different qualified movements are retained rather than merged speculatively.

## Calendar

The new Workout calendar shows a Monday-start month grid, previous/next/Today controls, and a selected-day agenda.
Planned workouts and actually logged sessions have separate counts and sections. Plan a saved routine, reschedule it,
cancel its intent, or start its current prescription. Starting a plan does not create a logged session or mark it
complete; normal live-workout finishing still confirms an actual journal save.

One routine/date pair is unique. Plans snapshot their label and retain it if a routine is removed; the routine link
becomes null and starting is disabled until another routine is chosen. Cancelling a plan never deletes history.
Failed saves preserve the date/routine draft. Older APIs still connect for supported features; calendar saving is
enabled only when `calendar-plans` is advertised. This is date planning, not notification/reminder automation.

## Upgrade and verification

Apply migration `0003_stiff_robbie_robertson.sql` before starting this API. It adds `plans`, the routine/date constraint,
and nullable unique `exercises.name_key`. Reseed canonical and retired references before accepting writes.

```bash
pnpm db:setup
pnpm build
pnpm start
```

The local database remains PostgreSQL 17 on **5433**, with persistent Docker volume **workout_data**. Public seed
updates key metadata in a transaction; retired IDs remain valid foreign-key targets with no visible name key.
Existing private records are not erased. If a private name collides with a new public canonical key, review and rename
that private entry before reseeding; seed failure rolls back instead of deleting personal data.

98 application tests pass; 14 real PostgreSQL tests remain skipped because this runtime cannot start PostgreSQL.
TypeScript, lint, formatting, source structure and production builds pass. Migration generation succeeded; applying
it, database uniqueness/FK behavior and browser/device QA remain unverified. The published Site remains a private
static PWA. Durable calendar plans, routines, private exercises and history require the supplied external PostgreSQL API.

New source commits, hashes and licenses are recorded in `catalog-expansion-2.3.json`. The full public attribution index
is `/catalog-attribution.json`; new legal notices are in `/licenses/`. rthepen MIT guidance and Everkinetic CC-BY-SA 4.0
guidance/illustrations preserve original rights and credits. No paid/restricted media or invented exercise combinations
were added. CSV import remains future work.

# Release 2.9 — Workout library tools

## Search, sorting and filters

Search workouts matches saved names/notes, nested component names, exercise names/aliases and primary/secondary muscle
labels. Canonical and retired exercise IDs resolve through the complete catalog. Matching ignores case, accents and
punctuation; all entered terms must occur in the indexed routine. Component notes are not recursively indexed.

Ordering supports newest/oldest creation time, natural name ordering, most resolved exercises and most planned sets.
Creation time is not an edit timestamp. Equal ranks use creation time and stable IDs. Invalid graphs keep their own
metadata/direct movements searchable; unresolved counts sort after valid counts. The card’s existing graph error
remains available for review or repair.

Relationship filters select all routines, routines without components, those with components, or routines directly
used by another workout. These categories can overlap: a routine with components may itself be used by a parent.
The matching/total count and Reset view expose the current selection; a clear no-results state invites another query.
Controls use the existing light/dark palette and stack on narrow screens.

The view is transient in-memory UI state and resets when its page is remounted. It introduces no browser data store.
Search/sort do not mutate saved records or the graph. Hidden components and parents remain available to previews,
starts, duplication and deletion safeguards. CSV export still transfers the complete connected workout collection,
including component identities; it is not a filtered-card export. Existing file/import limits remain unchanged.

## Duplicate into a new draft

Each card has Duplicate. It opens a new unsaved builder draft, copies notes and prefixes the bounded name with Copy of.
The name is shortened without cutting a Unicode character. Direct prescriptions and individual target arrays are
independent copies. Component UUIDs/order are copied as references to the same saved source routines, so later
component changes continue to affect both parents as usual. Existing exercises and components remain editable/removable
in the copied draft.

The copied input has no saved ID or creation timestamp. Review and Save sends a new-record POST and waits for API
confirmation. The source record and its targets are unchanged. Duplication does not automatically save or overwrite a
routine. Invalid source compositions are rejected before replacing the current draft. For a fully independent flat
prescription, use Copy exercises instead in the builder’s component picker.

## Upgrade and verification

No database migration, dependency or new API capability is required beyond the existing feature support for the
record being copied. Rebuild the Docker application with `sh scripts/docker-up.sh`, retaining `.env.docker` and the
persistent `workout_data` volume. PostgreSQL remains on port 5433. Durable records still require the separately
deployed authenticated Express/PostgreSQL API when using the private hosted frontend.

Tests cover normalized queries, nested/alias/muscle indexing, relationship filters, creation/name/count ordering,
deterministic ties, invalid counts, unchanged source ordering, independent target/reference copies, Unicode bounds,
explicit POST saves and previews whose dependencies are hidden by a filter. Strict typechecks, zero-warning lint,
formatting, source constraints and production builds are run. Actual PostgreSQL tests require a dedicated URL and are
skipped when unavailable. Docker execution, responsive browser rendering, native focus and media playback remain
unverified in the current environment.

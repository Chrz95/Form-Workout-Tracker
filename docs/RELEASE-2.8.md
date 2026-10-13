# Release 2.8 — Resolved workout review

## Preview before starting

Saved workout cards now have Review; the builder has Review full workout. The preview expands direct targets followed
by nested components in order and shows the source component path for each movement. Every planned set has its own
repetitions and weight row. Older uniform records expand into explicit rows without rewriting saved data.

The preview validates both the root prescription and its complete graph. Invalid values, missing components,
duplicates, cycles and bounds failures prevent starting and display a readable error. The preview does not save or
modify any source routine. It uses the currently connected records; reconnect to load changes made elsewhere.

Click an exercise name to open its guide above the preview. Closing the guide returns to the preview; Back to builder
preserves name, notes, direct targets and component references. Starting from a draft preview closes preview/builder
and creates an independent live session. Saved previews can also start or resume training through the existing flow.
Drafts and unfinished sessions still live only in memory until explicitly saved through the authenticated API.

## Parent relationships

Cards identify the routines directly referencing a component and disable its delete button. The accessible description
explains which parents must remove their references before deletion. Card descriptions abbreviate large parent lists;
full previews display all direct parents and allow reviewing them. Edited-component previews include the component’s
saved parent relations, so dependencies remain visible while checking an unsaved change.

These descriptions show direct parents, not every ancestor. A parent may itself be referenced by another routine.
Client-side disabling is a convenience; PostgreSQL and the API retain their authoritative deletion restriction.
Stale client state cannot bypass server protection. Existing atomic parent/child edit validation remains unchanged.

## Implementation and compatibility

The shared graph resolver now produces independent ordered entries with component paths. The existing target-only
resolver uses those same entries, keeping preview and live-start order consistent. UI components remain under 100
lines with documented props, strict types and bounded graph expansion. The preview tables and wrapping card actions
use the existing light/dark palette and responsive layout.

No database migration, dependency or new API capability is introduced. Existing release 2.7 nested-workout support is
sufficient; existing aggregate and per-set records remain valid. Rebuild the Docker stack using
`sh scripts/docker-up.sh`, retaining `.env.docker` and the persistent `workout_data` volume. PostgreSQL remains on 5433.
The private hosted frontend still requires the separately deployed Express/PostgreSQL API for durable records.

## Verification limits

Tests cover component provenance/order, independent target copies, exact preview tables, invalid draft handling,
three simultaneously mounted dialogs, draft retention, starting from previews, parent navigation and accessible
blocked-delete explanations. Existing prescription, API, CSV, calendar, catalog and live-session tests remain in scope.
Actual PostgreSQL tests require the dedicated database URL and are skipped when unavailable. Native dialog focus,
responsive browser rendering, media playback, Docker execution and device installation remain unverified here.

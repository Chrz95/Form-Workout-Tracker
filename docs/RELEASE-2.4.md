# Release 2.4 — Reviewed CSV import

My workouts and the Training journal now accept Form CSV exports. Selecting a file performs bounded local parsing and
validation, then shows expandable records with notes, creation timestamp, dates, exercise prescriptions and actual sets.
Reading a file sends nothing to the API. Saving requires an explicit confirmation and a compatible connected server.

## Data preservation and duplicate controls

- Routine and session IDs, creation timestamps and exercise order are preserved.
- Actual sets preserve their UUIDs, reps, weights, warmup/working classification and optional RPE.
- Legacy uniform sessions remain aggregate records; no performed sets are fabricated.
- Every file commits as one PostgreSQL transaction; failures roll back all new records.
- Repeated unchanged record IDs are skipped. Changed saved IDs return `IMPORT_CONFLICT`, without overwriting data.
- The database rejects reused actual-set UUIDs and unknown exercise foreign keys.
- Canonical and retired exercise IDs resolve inside the transaction; alternate names cannot duplicate a movement.
- Competing imports serialize through a transaction-scoped advisory lock; existing identities are row-locked for comparison.
- Client review is advisory. The server rechecks its current data before committing.

Duplicate-record detection relies on stable IDs. Changing IDs can create another record even if its values are similar.
Custom exercise definitions and calendar plans are not included; referenced private exercises must already exist under
their original IDs. Imported sessions omit API completion submission tokens, which are not training values.

## Format and limits

Files use the existing 18 training columns plus `text_encoding`. New exports prefix formula-like text and any leading
apostrophe with one apostrophe, then mark `apostrophe-v1`; import reverses this encoding without losing literal text.
Older 18-column files remain supported with apostrophes treated literally and a review notice, since their encoding is
ambiguous. Numeric cells require plain nonnegative decimal values, then pass shared training limits.

Limits: 50 records, 2,000 data rows, 1 MiB file, 10,000 characters per cell and 900,000 bytes per JSON transfer.
Headers, row widths, repeated metadata, consecutive exercise/set positions, unique IDs and source types are validated.
Mixed collections, unsupported markers, truncated quoting and conflicting unused fields are rejected before review.
Credentials and file drafts remain in memory; API data is never placed in browser storage or an offline write queue.

## Upgrade and verification

Deploy the release 2.4 Express build. Its capabilities include `atomic-csv-import`; older APIs still support their prior
features, but cannot save imports. No new schema or migration is introduced. Existing release 2.3 migrations and public
canonical/retired seed data must already be applied. PostgreSQL remains on **5433**, with Docker volume **workout_data**.

124 tests pass across 15 executed files. Tests cover CSV round trips, malformed/bounded payloads, text encoding,
legacy records, actual sets, API authentication/validation, offline review, explicit commit and failed-save retention.
18 actual PostgreSQL integration cases remain skipped, including four new import cases for retries, batch rollback,
actual set uniqueness and canonical aliases. PostgreSQL cannot be started in this managed runtime, so transaction,
locking and constraint behavior are implemented but not claimed as integration-tested. Browser/device QA remains
unavailable. The published private Site is a static PWA; durable saving requires the separately hosted supplied API.

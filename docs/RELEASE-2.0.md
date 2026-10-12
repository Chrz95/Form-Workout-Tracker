# Release 2.0 — Live training and exercise progress

This release implements the recommended next sequence: **live workouts → previous-session values → progress charts**.
It includes per-set logging and an adjustable rest timer as part of the live workout experience.

## What changed

- Start a saved routine or an unsaved builder draft immediately.
- Record each set's load, reps, warm-up/working classification and optional effort rating.
- Complete or undo sets individually; only completed sets enter the final session.
- Add working or warm-up sets and remove unfinished rows.
- See previous values by training date and matching set classification, with one-tap copying.
- Keep today's effort and completion state separate from historical values.
- Minimize the active workout, navigate the library, and resume the same in-memory session.
- Use automatic rest timing, adjustable next-rest duration, pause/resume, restart, skip and optional sound.
- Review completed sets, edit session metadata, and save only after API confirmation.
- Display individual set values in the journal while retaining clear uniform-entry labels for old records.
- Explore per-exercise weight, repetition and working-volume charts, all-time records and exact-value tables.

Rest timing uses real clock deadlines rather than counting interval callbacks. When a throttled tab resumes, the
remaining time catches up. Sound is optional and operates while the browser allows its audio context to run;
lock-screen alarms and background system notifications are not promised.

## Persistence and compatibility

New PostgreSQL `session_sets` rows store each set's UUID, position, reps, load, effort and classification. They belong
to an existing session/exercise pair, cascade on deletion, and enforce numeric/type/identity constraints.
Session creation writes metadata, exercise items and actual sets in one transaction.

Live and manual session completion generate stable submission UUIDs. Identical retries return the already accepted
session instead of creating duplicates. A retry with changed content is rejected with `SUBMISSION_CONFLICT` so the
client cannot claim that edited values replaced a possibly committed first request.

Before connection succeeds, the frontend checks the protected `/api/v1/capabilities` endpoint for per-set logging
and safe-finish support. An older API is rejected instead of silently flattening set variations.
Historical aggregate records remain valid. They are explicitly displayed as uniform set entries and are used as
uniform comparisons without altering the stored data.

Apply **both new migrations** before starting the updated API:

```bash
pnpm db:migrate
pnpm db:check
pnpm build
pnpm start
```

The frontend, backend and shared schema source are updated together. No new application dependency or extra package
manifest was introduced. JSON bodies are bounded to 1 MiB to accommodate the existing maximum exercise/set counts;
oversized submissions receive a safe 413 envelope. Client requests time out rather than keeping a review pending forever.

## Progress definitions

- **Heaviest working set:** highest recorded working-set weight in a session.
- **Most reps:** highest working-set repetition count in a session.
- **Working volume:** sum of weight × reps across completed working sets; warm-ups are excluded.
- **Records:** maxima across all saved observations for the selected exercise.
- **Chart:** latest 20 saved sessions, spaced by chronological session order, with an exact-value table.

These are descriptive training records, not strength estimates, calorie estimates or automated exercise prescriptions.
Bodyweight exercises can have zero external load; the repetitions measure remains useful and zero-load charts are valid.

## Delivery boundary

The published Site remains a private static PWA. Live drafts and timers work without an API. An authenticated HTTPS
Express endpoint backed by PostgreSQL is still required for saving, previous-session history and populated progress.
No endpoint or credentials were configured in the Site environment during this release.

Drafts stay in the current tab and are lost on reload. Browser asset caching is not used to persist workout records.
The original PostgreSQL-only persistence requirement remains intact. No alternate database or browser-storage queue
was added. The managed environment cannot run the required unprivileged PostgreSQL process, so the real database
suite remains unverified; the validation report gives the exact executed results.

Calendar planning, exercise alternatives, custom exercise creation and CSV import/export remain future additions.

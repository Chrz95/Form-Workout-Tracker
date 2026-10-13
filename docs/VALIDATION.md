# Validation and explicit requirement resolutions

## Application scope

The application supplies a private, installable frontend preview plus a separately deployable Express/PostgreSQL backend.
The frontend bundles 3,625 visible exercise records, 2,147 image references, nine animation posters and fourteen local H264 video clips. Release 2.0 adds actual per-set live
training, resumable in-tab sessions, previous values, rest timers and exercise charts. See `RELEASE-2.0.md`.
Release 2.1 adds port 5433, the exact persistent Docker volume `workout_data`, explicit database setup/test preparation,
and CSV exports of saved routines and date-filtered session history. See `RELEASE-2.1.md`. Saved routine/session operations require
an authenticated connection to the API; preview drafts and bookmarks remain in memory. No alternate application
database, local-storage fallback, IndexedDB store, SQLite database or invented saved records were introduced.

Sites cannot host the requested persistent Node/Express process and pooled TCP PostgreSQL connection.
The most reasonable resolution preserves that required implementation and publishes the static PWA separately.
Deploy and connect the supplied HTTPS API to enable durable logging and lists in the preview.

The backend deliberately supports one owner per deployment, with actual bearer authentication. Multi-user accounts,
long-term tab credentials, and pagination beyond the bounded recent history
are not implemented. Genuine GIF/animated WebP guides and H264 clips take precedence over photographic frames;
missing guides retain source links and instructions. MP4 and partial-range responses bypass service-worker caching.

## Executed checks

| Check                                    | Result                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Root `pnpm install` through installer    | Passed after granting esbuild's build permission.                                                                       |
| `pnpm db:generate`                       | Passed; committed SQL migration and Drizzle metadata generated.                                                         |
| `pnpm db:up`                             | Could not run: Docker executable is unavailable.                                                                        |
| `pnpm db:check`                          | Failed with connection refusal at port 5433 because no PostgreSQL server was available.                                 |
| `pnpm db:migrate`                        | Failed with connection refusal at port 5433; application of migrations is unverified.                                   |
| `pnpm lint`                              | Passed with warnings treated as failures; zero errors and warnings.                                                     |
| `pnpm format:check`                      | Passed; all matched files follow committed Prettier configuration.                                                      |
| `pnpm typecheck`                         | Passed for frontend and backend with strict configurations.                                                             |
| `pnpm test:run`                          | 162 tests passed across 21 test files; 23 real PostgreSQL tests skipped because the dedicated URL is unset.             |
| `pnpm build`                             | Passed for static frontend and compiled backend.                                                                        |
| `pnpm check:structure`                   | Passed: 78 component files, all at most 100 lines; 318 named functions and their identifier parameters documented.      |
| Source line length                       | Passed for authored TS, TSX, JS, MJS and CSS: at most 120 characters.                                                   |
| Catalog and media files                  | All 3,625 records parse; IDs are unique; all image/poster references exist; source credits and codec metadata verified. |
| Browser QA                               | Not performed: the required browser-control capability is unavailable.                                                  |
| Native installation and offline behavior | Implementation supplied; not verified in a browser/device.                                                              |

Generated data, original license text, exercise JSON and generated migration metadata are not handwritten implementation
and are excluded from the authored-source line-length check. Component tests are not component implementation files.
The structure checker verifies the existence of JSDoc on named functions; typed parameter descriptions are also checked where identifier parameters are declared; return descriptions and
individual prop documentation were also reviewed in the component/handler implementation.

An isolated PostgreSQL 17 binary verification setup was attempted without adding it to the application dependencies.
The managed execution environment could not switch to an unprivileged database process user; a user-namespace
attempt was also blocked because `/proc/self/uid_map` is unavailable. It was not used as a
substitute database, and no PostgreSQL integration result is represented as passing.

Release 2.1 repeated the native `initdb` attempt, which explicitly refused the root identity. Docker remains absent.
The Compose YAML parsed successfully and its server port, loopback mapping, readiness probe, data path and exact
volume name agree. This is a static configuration check, not `docker compose config` or a running-container check.
No persistent volume was created in this runtime and no existing database volume was deleted.
The additional tests cover disposable-database target rejection and exported values, legacy aggregate labelling,
formula protection, quoting, Unicode and selected-record behavior. Browser downloads and volume persistence across
actual container recreation have not been verified. The test database preparation script's live CREATE DATABASE
operation also remains unverified because PostgreSQL could not be started.

## Permitted oxlint adjustments and unavailable rules

The installed oxlint version is 1.87.0. It rejects five names from the requested configuration.
Supported requested rules retain their original order, severity and settings, except the expressly allowed `.tsx` fix.
The exact original values of unsupported entries are retained in `unsupported-oxlint-rules.json` for future tooling review.

Allowed additions/adjustments:

- Enabled the `typescript`, `react`, `import` and `jsx-a11y` plugins so supported rules actually run.
- Changed only `react/jsx-filename-extension` extensions from `.js` to `.tsx`, retaining error severity.
- Added `no-magic-numbers` at error severity with explicit allowances for 0, 1, -1 and array indexes.
- Added narrowly scoped constant/test-fixture overrides for numeric definitions.
- Kept `no-console` globally at error; only `frontend/src/lib/logger/**/*.ts` may use console for minimal diagnostics.
- Ignored dependency, build, coverage and upstream static-data output paths.

| Requested rule rejected by oxlint         | Closest applied check; limitations                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `camelcase`                               | AST source naming check plus descriptive-name review; not a full ESLint camelcase equivalent.             |
| `react/destructuring-assignment`          | Manual review of destructured component props and typed interfaces.                                       |
| `react/forbid-foreign-prop-types`         | TypeScript prop interfaces; no runtime PropTypes or foreign PropTypes are used.                           |
| `react/no-deprecated`                     | Manual React API review: current createRoot, hooks and supported error-boundary lifecycle methods.        |
| `react/no-unused-class-component-methods` | Strict unused-code checks and review of the single error-boundary class; no exact native rule equivalent. |

Additional default oxlint React and accessibility checks were kept enabled and their findings resolved.
Numbers are checked by the native numeric rule; strings, endpoint constants, status discriminants, identifiers,
user-facing reused labels and storage behavior require source review. No automatic magic-string enforcement is claimed.

## Toolchain compatibility resolution

Latest dependencies were resolved, installed and then pinned exactly with the root lockfile.
TypeScript 7.0.2's native compiler failed in this environment with `/proc/self/exe` unavailable.
TypeScript 6.0.3 was selected as the working compatible JavaScript compiler and passed both applications' checks.
Node 24.19.0 and pnpm 11.25.0 match the available runtime and are pinned consistently in project instructions.

pnpm 11 requires build-script permissions in `pnpm-workspace.yaml`. That file contains only the permission for esbuild;
it declares no workspace packages. There remains one package manifest at the root and no frontend/backend manifests.
One-shot TypeScript maintenance commands use Node's `--import tsx` loader to avoid the CLI's blocked temporary IPC socket.

## Remaining production acceptance work

1. Provision PostgreSQL 17, apply migrations to a fresh development/test database, and run the 14 real DB tests.
2. Deploy the authenticated Express backend with private credentials, TLS and this frontend's explicit CORS origin.
3. Run the save/edit/delete/log flows against that server and reconnect from another tab/device to confirm durability.
4. Verify responsive layouts, keyboard focus, reduced-motion behavior, manifest installation and offline navigation in browsers.
5. Complete operational backup/restore and deployment-platform checks described in the README.

This report does not certify the disconnected static preview as a complete hosted production deployment.

## Release 2.2 verification

83 tests pass across 12 files, including catalog integrity, custom HTTP authorization, imported-ID/source spoofing rejection,
foreign-key conflict translation, failed-save draft preservation, opt-in motion and safe substitution counts/load behavior.
Two real PostgreSQL tests were added for custom CRUD and referenced history retention; all 12 persistence tests remain skipped.
The table above describes application checks, not a running database certification. New custom records reuse the existing
reference table. Reseeding the expanded public catalog remains required on the actual PostgreSQL host.

The source asset batch decoded and converted 279 attributed wger images with zero download/conversion failures; 214 selected
assets are used after duplicate and excluded-content filtering. Catalog tests verify every bundled reference and still poster.
No claim is made that remote video links were played or that responsive/native-dialog/PWA device behavior was browser-tested.
Browser-control capability remains unavailable. The private Site is still static and requires the externally hosted API.

## Release 2.3

Generated canonical and retired catalog payloads are excluded from formatting, like the original public dataset;
authored source and configuration remain checked. Their JSON is parsed and tested separately.

98 tests pass, including movement identity spelling/descriptor order, protected variant/sequence distinctions,
full visible catalog key uniqueness, all retired-to-canonical links, history preservation, leap-year month grids,
plan authentication/date validation, intent-only writes/cancellations and duplicate-plan conflict messages.
All visible IDs and name keys are unique; 412 reviewed references are retired. This is a conservative identity/audit
check rather than a proof of anatomical uniqueness across community-authored synonyms. Distinct qualified variants
are retained. 222 source SVG files were safety/XML/hash verified; all used source credits/legal texts are bundled.

Migration generation passed for plan schema and unique exercise-name keys. Two additional actual PostgreSQL tests
cover name-key uniqueness and plan CRUD/date uniqueness/routine-link retention; all 14 DB tests remain unverified.
This runtime still lacks Docker and cannot initialize an unprivileged PostgreSQL process. Browser focus/layout,
calendar day selection on devices, installation/offline behavior and media playback remain unverified.

## Release 2.4

CSV imports preserve stable IDs and real set values in one PostgreSQL transaction, with unchanged-ID skipping and
conflicting-ID rejection. The server resolves canonical exercise aliases inside the transaction. File parsing and
record review are local, and API persistence requires an explicit confirmation and the atomic-csv-import capability.
Current exports have reversible text encoding; older 18-column files preserve ambiguous apostrophes literally.

124 tests pass, including export/import round trips, real/legacy values, numeric/row/metadata validation, limits,
API authentication, disconnected review, explicit commit, conflicting-ID blocking and failed-save draft retention.
Four new real PostgreSQL cases cover stable retries, full-batch rollback, actual sets and canonical aliases. All 18
DB cases remain skipped because this runtime cannot start PostgreSQL. No schema changes were introduced.
The local Compose configuration remains port 5433 and volume workout_data; its actual startup and persistence are
unverified here. The private Site is a static PWA and cannot host the supplied Express/PostgreSQL server.

## Release 2.5

Multi-stage frontend/API images and a Compose application overlay preserve the database-only development workflow.
Startup explicitly waits for PostgreSQL health, completed compiled migrations/seed, then API readiness. The database
remains on 5433 with workout_data. Tokens are generated once in ignored .env.docker, excluded from build contexts and
passed to the API only at runtime. Both application containers run as unprivileged users with read-only filesystems.

127 tests pass, including same-origin API resolution for custom ports and HTTPS origins. The token initializer and
second-run preservation were executed, with mode 0600 and no secret output. Shell syntax and parsed Compose YAML
were checked; image targets, dependencies, internal API exposure and persistent volume were reviewed. Docker is not
installed and no daemon is available, so actual image builds, Compose interpolation, Nginx configuration execution,
startup and restart persistence could not be tested. No PostgreSQL integration case is represented as passing.

## Release 2.7

Ordered saved workout references now persist in PostgreSQL `workout_links`. Routines can contain direct exercises,
components, or both. A graph-wide transaction lock shared with imports serializes writes, deletes and consistent
reads. Every routine is revalidated after a write, so a child update cannot silently invalidate its parents.
Foreign keys protect missing sources and in-use deletion; self-links, duplicate child positions and negative positions
also have database constraints. Expansion checks cycles, canonical movement duplicates, depth and exercise bounds.

Three queries read the complete supported graph, including every component dependency, and group items in memory.
The library supports up to 1,000 saved routines and returns an explicit limit error rather than silently omitting
required dependencies. Live sessions retain a resolved independent snapshot; existing completed history is unchanged.
CSV transfers preserve ordered references, allow parent-first batches, and review exact planned/actual values.
API capabilities prevent reference saves/imports to older servers. Legacy copied routines are not automatically linked.

Tests cover recursive expansion, updated targets, immutable active sessions, cycles, missing references, aliases,
bounds, reference-only CSV round trips, import review, authenticated payload validation and builder save/start/review.
Four additional PostgreSQL integration cases cover actual links, deletion restrictions, atomic imports, invalid child
edit rollback and competing cycle writes, but are skipped without the dedicated database URL. Docker operation,
native browser focus/playback and device installation remain unverified. The hosted preview still requires the separate
Express/PostgreSQL deployment for durable records.

## Release 2.8

Read-only previews resolve complete saved/draft routines using the same graph validation as session starts.
Each movement shows its component path and exact individual targets; older uniform prescriptions expand into rows.
Invalid drafts display a concise validation error and cannot start. Exercise review opens another native dialog above
preview and builder, preserving draft values. Starting from a preview creates an independent live session.

Routine cards identify direct parents and disable deleting used components with an accessible relationship description.
Full previews show all direct parents and support parent review navigation, including previews of edited components.
The server still rechecks deletion after client state changes. No new migration, dependency or API feature requirement
was introduced; existing release 2.7 nested-workout support is sufficient.

Three additional tests and extended builder coverage verify source paths, cloned targets, exact table values, stacked
review, invalid drafts, preview starts, parent navigation and blocked deletion descriptions. The existing 23 actual
PostgreSQL cases remain skipped because the dedicated server is unavailable. Docker execution, native browser focus,
media playback, responsive rendering and device PWA installation remain unverified in this environment.

## Release 2.9

The routine library has normalized multi-term search, creation/name/resolved-count sorting and relationship filters.
Indexes are derived in memory from complete connected records. Filtering never replaces the graph used by previews,
reference validation, parent usage or exports. Invalid graphs remain discoverable; unavailable counts sort after valid
counts instead of inventing totals. Name ordering is natural, with deterministic creation/ID tie handling.

Duplication produces a new unsaved input with no copied record ID/timestamp, independent direct target arrays and
ordered references to the same saved components. Names are bounded without splitting Unicode characters. The builder
uses a new-record POST after explicit review/save, retaining the original record. No new migration, dependency or API
feature requirement is introduced.

Seven domain tests plus two UI cases verify normalized/nested/alias search, relationship filters, numeric/name/date
ordering, invalid graph handling, non-mutating view operations, target/reference cloning, Unicode name bounds,
reviewed POST duplication and filtered previews with hidden dependencies. The 23 actual PostgreSQL cases remain
skipped without the dedicated database URL. Docker execution, browser layout/native focus and media playback remain
unverified here. The static preview requires the separate authenticated Express/PostgreSQL API for durable records.

## Release 2.9.1

CSV import no longer pairs an `ImportReview.tsx` UI component with an `importReview.ts` validator. The active modules
are `TrainingImportReview.tsx` and `reviewImportRecords.ts`, with all callers updated. This avoids case-insensitive
extension lookup choosing the validator when the component is requested. A new structure-check guard caught the
original layout before the rename and passes after it; the guard excludes explicit stylesheet imports and checks
code module stems across source roots. Existing CSV review/confirmation/conflict tests remain applicable.

Use a fresh extraction or remove the obsolete files when overlaying a ZIP upgrade; restart Vite and reload the page.
No database migration, dependency, import format or API capability changed. Native browser verification remains
unavailable, so the fix is validated through the collision check, strict compilation, tests and production builds.

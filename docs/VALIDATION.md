# Validation and explicit requirement resolutions

## Application scope

The application supplies a private, installable frontend preview plus a separately deployable Express/PostgreSQL backend.
The frontend bundles 3,201 exercise records, 1,960 image assets and three animation posters. Release 2.0 adds actual per-set live
training, resumable in-tab sessions, previous values, rest timers and exercise charts. See `RELEASE-2.0.md`.
Release 2.1 adds port 5433, the exact persistent Docker volume `workout_data`, explicit database setup/test preparation,
and CSV exports of saved routines and date-filtered session history. See `RELEASE-2.1.md`. Saved routine/session operations require
an authenticated connection to the API; preview drafts and bookmarks remain in memory. No alternate application
database, local-storage fallback, IndexedDB store, SQLite database or invented saved records were introduced.

Sites cannot host the requested persistent Node/Express process and pooled TCP PostgreSQL connection.
The most reasonable resolution preserves that required implementation and publishes the static PWA separately.
Deploy and connect the supplied HTTPS API to enable durable logging and lists in the preview.

The backend deliberately supports one owner per deployment, with actual bearer authentication. Multi-user accounts,
hosted video playback, long-term tab credentials, and pagination beyond the bounded recent history
are not implemented. Frame previews are explicitly identified as photographic demonstrations; video links open searches.

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
| `pnpm test:run`                          | 83 tests passed across 12 test files; 12 real PostgreSQL tests skipped because the dedicated URL is unset.              |
| `pnpm build`                             | Passed for static frontend and compiled backend.                                                                        |
| `pnpm check:structure`                   | Passed: 55 component files, all at most 100 lines; 216 named functions and their identifier parameters documented.      |
| Source line length                       | Passed for authored TS, TSX, JS, MJS and CSS: at most 120 characters.                                                   |
| Catalog and media files                  | All 3,201 records parse; IDs are unique; all image/poster references exist; source credits and codec metadata verified. |
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

1. Provision PostgreSQL 17, apply migrations to a fresh development/test database, and run the 12 real DB tests.
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

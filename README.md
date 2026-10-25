<p align="center">
  <img src="frontend/public/icon-192.png" alt="Form app icon" width="80" height="80" />
</p>

# Form — Workout Studio

**Discover exercises. Build your routine. Track every set.**

Form is a self-hosted workout companion that brings exercise discovery, reusable routines and your training
history into one place. Browse **1,482 exercises with images**, plan your workouts, train with live set logging
and see your progress over time—all from your phone, tablet or desktop.

Run it on a Raspberry Pi with Docker, add it to your existing Compose stack, or run it locally with PostgreSQL.
Your saved workouts and training history stay in your own database.

[Features](#features) · [Get started](#get-started) · [Documentation](#documentation) · [Support](#support)

## Features

### Find the right exercise

- **Extensive visual library:** 1,482 public exercises with descriptions, step-by-step instructions and images.
- **Flexible search:** match exercise names and aliases, with words in any order. For example,
  `press dumbbell incline` finds `Incline Dumbbell Bench Press`.
- **Useful filters:** narrow the library by muscle group, equipment and difficulty.
- **Technique reference:** view image galleries, frame demonstrations, and animations or short videos where available.
  Selected exercises also include external instructional guides and videos.
- **Your own collection:** create custom exercises and automatically collect movements used in your workouts under
  My exercises. Canonical names and aliases help prevent duplicate entries.

### Build workouts your way

- Create, edit, duplicate, search and sort reusable routines.
- Add exercises through a dedicated library popup with thumbnails, filters and infinite scrolling.
- Open exercise details while building a workout, then return to the same draft.
- Set **different repetitions and weights for every set**. Values entered in Set 1 carry forward to following sets,
  while later sets remain individually editable.
- Add workout notes and **separate notes for each exercise**—useful for technique cues, setup and progression goals.
- **Combine workouts:** include saved routines inside other workouts to reuse warm-ups, supersets or training blocks.
  Review the resolved exercise order and exact set targets before starting.
- Use the floating save controls and open an existing routine directly in the editor from its preview.

### Train and log as you go

- Start a live session from a saved workout and record the repetitions and weight you actually perform.
- Mark completed sets, distinguish warm-ups from working sets and use an adjustable rest timer.
- Keep track of elapsed time and set completion, with a minimized session view while you browse.
- Review your completed workout before saving it to your journal.
- Prefer to log afterward? Add a workout manually with its date, duration, exercises, sets and notes.

### Plan ahead and see your progress

- Schedule saved workouts on a monthly calendar.
- Browse a date-filtered journal of completed sessions and their recorded sets.
- Follow exercise-specific charts for weight, repetitions and working volume.
- See records for your heaviest working set, most repetitions and best working volume.
- Review total sessions, training days, time invested and working sets from your saved history.
- Export routines and journal entries as CSV, or review a Form CSV import before saving it.

### Designed for everyday use

- **Responsive layouts:** compact workout cards, readable exercise details and reachable mobile controls.
- **Comfortable set entry:** large numeric fields and touch targets for repetitions and weight.
- **Light and dark modes:** choose the appearance that suits your training environment.
- **Installable PWA:** launch Form from your home screen in supported browsers.
- **Automatic backend connection:** the supplied Docker and local runners connect without entering an API token in the UI.

## From plan to progress

1. **Discover** a movement and review its technique guide.
2. **Build** a routine with your exercises, per-set targets and notes.
3. **Schedule** it on your calendar or start training immediately.
4. **Log** your completed sets and save the session to your journal.
5. **Review** your history and exercise progress before your next session.

## Get started

### Docker and Raspberry Pi

From the complete project folder, run:

```sh
sudo docker compose up -d --build
```

The supplied stack builds the frontend and backend, starts PostgreSQL, prepares the database and connects the app
automatically. On a Pi named `rpi5`, open either address:

- [http://rpi5:2324](http://rpi5:2324)
- [http://rpi5.nord:4983](http://rpi5.nord:4983)

Both addresses serve the same app and database. The device opening Form must be able to resolve and reach the
chosen hostname. For your own hostname or ports, update the published ports and `FORM_FRONTEND_ORIGINS` allowlist
in [compose.app.yaml](compose.app.yaml). See the [multiple-address guide](docs/RELEASE-2.29.md) for details,
including how to use prebuilt frontend and backend images.

The default database storage directory is **`/home/pi/configs/form`**. Set `FORM_POSTGRES_DATA_DIR` to use another
absolute host path. PostgreSQL listens on port **5433** inside the stack; the full application stack does not
publish a database port to the host.

To include Form in an existing Compose stack, keep the full project in a `form/` subfolder and add:

```yaml
include:
  - ./form/compose.yaml
```

Then run your usual `sudo docker compose up -d` from the parent stack.
See [Docker setup](docs/DOCKER.md) for deployment details and the
[storage migration guide](docs/POSTGRES-STORAGE.md) before upgrading an installation that uses the older
`workout_data` volume.

### Run locally without Docker

Use the versions pinned by this project: **Node.js 24.19.x**, **pnpm 11.25.0** and a running **PostgreSQL 17** server.

1. Copy `.env.example` to `.env` at the project root.
2. Set `DATABASE_URL` to your existing PostgreSQL database and credentials.
3. Leave `VITE_API_BASE_URL` blank to use the automatic local connection.
4. Install dependencies, prepare the database and start both applications:

```sh
pnpm install --frozen-lockfile
pnpm db:setup:local
pnpm dev
```

Open the frontend URL printed in the terminal, normally [http://localhost:5173](http://localhost:5173).
Local initialization generates the private API credential automatically.

For a built local application, run `pnpm start:local` and open [http://localhost:8080](http://localhost:8080).
See [local setup](docs/LOCAL.md) for configuration, upgrades and troubleshooting.

## Your data, your deployment

Form uses PostgreSQL for saved routines, calendar plans, custom exercises and training sessions. Access the same
backend from your devices to work with the same saved records. CSV export gives you a portable copy of your routines
and journal; use database backups to preserve the complete installation.

The supplied deployment is intended for **one owner**. Devices that can reach its web interface can access that
owner's training data. Keep it on a trusted network or place it behind an authenticated reverse proxy for remote access.

PWA installation and service workers require HTTPS outside localhost. After an online visit, supported browsers can
reuse cached app assets, catalog data and previously viewed exercise images offline. Saving training requires the
backend; unsaved drafts and live sessions stay in the current tab and do not survive a reload. External videos require
a network connection.

## Built with

| Layer | Technology |
| --- | --- |
| Interface | React, TypeScript, Vite, Lucide icons |
| API | Express, Zod |
| Database | PostgreSQL, Drizzle ORM |
| Deployment | Docker Compose, Nginx, separate frontend/backend images |
| App installation | Web App Manifest and service worker |

## Documentation

| Guide | What you will find |
| --- | --- |
| [Docker setup](docs/DOCKER.md) | Raspberry Pi deployment and integration with an existing Compose stack |
| [Multiple app addresses](docs/RELEASE-2.29.md) | Current frontend allowlist, both public ports and image-based configuration |
| [Local setup](docs/LOCAL.md) | Run the frontend, backend and PostgreSQL without Docker |
| [PostgreSQL storage](docs/POSTGRES-STORAGE.md) | Persistent storage and migration from earlier volumes |
| [Catalog sources](docs/CATALOG-SOURCES.md) | Exercise sources, attribution and catalog handling |
| [Latest catalog restoration](docs/RELEASE-2.22.md) | Current library count and media restoration details |
| [Validation notes](docs/VALIDATION.md) | Checks and environment verification limits |
| [Third-party notices](THIRD_PARTY_NOTICES.md) | Dependency and media notices |

### Development commands

Run commands from the repository root, which contains the shared `package.json` and lockfile.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local frontend and backend |
| `pnpm start:local` | Build and run the complete local app |
| `pnpm build` | Build the frontend and backend |
| `pnpm typecheck` | Check TypeScript in both applications |
| `pnpm test:run` | Run the automated test suite |
| `pnpm check:structure` | Check source structure conventions |
| `pnpm catalog:verify-restoration` | Verify restored catalog entries and assets |

## Exercise content and credits

The library combines attributed exercise datasets and media with original source links and license information.
Image galleries, photographic frame sequences, animations and videos are presented according to the media available
for each exercise. Some entries use illustrations, including clearly labeled AI-generated static illustrations;
not every exercise has an animation or video.

Credits are available in exercise details, the app's catalog licenses page,
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [licenses/](licenses/).
Exercise content and media retain their respective licenses.

## Support

If Form helps you plan your workouts and keep your training consistent, you can support its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q1J229F1AG)

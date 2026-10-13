#!/bin/sh
# Starts the entire application using Docker alone (Linux/macOS/WSL).
set -eu
cd "$(dirname "$0")/.."
if ! command -v docker >/dev/null 2>&1; then
  printf '%s\n' 'Docker with the Compose plugin must be installed and running.' >&2
  exit 1
fi
if [ ! -f .env.docker ]; then
  docker run --rm --user "$(id -u):$(id -g)" \
    -v "$PWD:/workspace" -w /workspace \
    node:24.19.0-bookworm-slim node scripts/docker-init.mjs
fi
exec docker compose --env-file .env.docker -f compose.yaml -f compose.app.yaml \
  up --build -d --wait --wait-timeout 180

#!/bin/sh
# Complete application startup; initialization is performed by Compose services.
set -eu
cd "$(dirname "$0")/.."
exec docker compose up --build -d --wait --wait-timeout 600

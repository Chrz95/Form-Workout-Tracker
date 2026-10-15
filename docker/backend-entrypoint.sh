#!/bin/sh
# Resolve runtime credentials before starting the API or the migration job.
set -eu
if [ -z "${API_ACCESS_TOKEN:-}" ]; then
  API_ACCESS_TOKEN=$(cat "${API_ACCESS_TOKEN_FILE:-/run/form-credentials/api-token}")
  export API_ACCESS_TOKEN
fi
if [ "${#API_ACCESS_TOKEN}" -lt 32 ]; then
  printf '%s\n' 'A valid Form API credential is required.' >&2
  exit 1
fi
exec "$@"

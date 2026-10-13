#!/bin/sh
# Generate private proxy configuration in tmpfs; credentials never enter the static bundle.
set -eu
umask 077
authorization='$http_authorization'
guard=''
if [ "${FORM_AUTO_CONNECT:-true}" = true ]; then
  token=${API_ACCESS_TOKEN:-}
  if [ "${#token}" -lt 32 ] || [ "${#token}" -gt 512 ]; then
    printf '%s\n' 'A private API token of 32–512 characters is required.' >&2
    exit 1
  fi
  case "$token" in
    *[!a-zA-Z0-9_.-]*)
      printf '%s\n' 'Use a token containing letters, digits, underscores, dots or hyphens.' >&2
      exit 1 ;;
  esac
  origin=${FORM_FRONTEND_ORIGIN:-http://localhost:8080}
  if ! printf '%s\n' "$origin" | grep -Eq '^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$'; then
    printf '%s\n' 'FORM_FRONTEND_ORIGIN must be an HTTP(S) origin without a path.' >&2
    exit 1
  fi
  authority=${origin#*://}
  authorization="\"Bearer $token\""
  # Reject cross-site requests and unexpected hosts before granting local owner access.
  guard="set \$allowed_origin 1; if (\$http_origin != '') { set \$allowed_origin 0; }"
  guard="$guard if (\$http_origin = '$origin') { set \$allowed_origin 1; }"
  guard="$guard if (\$allowed_origin = 0) { return 403; }"
  guard="$guard if (\$http_sec_fetch_site = 'cross-site') { return 403; }"
  guard="$guard if (\$http_host != '$authority') { return 403; }"
fi
sed -e "s|__AUTHORIZATION__|$authorization|" -e "s|__LOCAL_GUARD__|$guard|" \
  /etc/nginx/nginx.conf > /tmp/form-nginx.conf
unset API_ACCESS_TOKEN token authorization guard
exec nginx -c /tmp/form-nginx.conf "$@"

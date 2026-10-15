#!/bin/sh
# Generate private proxy configuration in tmpfs; credentials never enter the static bundle.
set -eu
umask 077
authorization='$http_authorization'
guard=''
upstream=${FORM_API_UPSTREAM:-backend:3001}
if ! printf '%s\n' "$upstream" | grep -Eq '^[a-zA-Z0-9][a-zA-Z0-9_.-]*:[0-9]{1,5}$'; then
  printf '%s\n' 'FORM_API_UPSTREAM must be a container hostname and port.' >&2
  exit 1
fi
if [ "${FORM_AUTO_CONNECT:-true}" = true ]; then
  token=${API_ACCESS_TOKEN:-}
  if [ -z "$token" ] && [ -n "${API_ACCESS_TOKEN_FILE:-}" ]; then
    token=$(cat "$API_ACCESS_TOKEN_FILE")
  fi
  if [ "${#token}" -lt 32 ] || [ "${#token}" -gt 512 ]; then
    printf '%s\n' 'A private API token of 32–512 characters is required.' >&2
    exit 1
  fi
  case "$token" in
    *[!a-zA-Z0-9_.-]*)
      printf '%s\n' 'Use a token containing letters, digits, underscores, dots or hyphens.' >&2
      exit 1 ;;
  esac
  origin=${FORM_FRONTEND_ORIGIN:-auto}
  authorization="\"Bearer $token\""
  if [ "$origin" = auto ]; then
    # Trust only private address literals, localhost and mDNS names in automatic LAN mode.
    guard='if ($form_private_host = 0) { return 403; }'
    guard="$guard set \$allowed_origin 1; if (\$http_origin != '') { set \$allowed_origin 0; }"
    guard="$guard if (\$http_origin = \"\$scheme://\$http_host\") { set \$allowed_origin 1; }"
  else
    if ! printf '%s\n' "$origin" | grep -Eq '^https?://([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\])(:[0-9]+)?$'; then
      printf '%s\n' 'FORM_FRONTEND_ORIGIN must be auto or an HTTP(S) origin without a path.' >&2
      exit 1
    fi
    authority=${origin#*://}
    guard="if (\$http_host != '$authority') { return 403; }"
    guard="$guard set \$allowed_origin 1; if (\$http_origin != '') { set \$allowed_origin 0; }"
    guard="$guard if (\$http_origin = '$origin') { set \$allowed_origin 1; }"
  fi
  guard="$guard if (\$allowed_origin = 0) { return 403; }"
  guard="$guard if (\$http_sec_fetch_site = 'cross-site') { return 403; }"
fi
sed -e "s|__AUTHORIZATION__|$authorization|" -e "s|__LOCAL_GUARD__|$guard|" \
  -e "s|__API_UPSTREAM__|$upstream|" \
  /etc/nginx/nginx.conf > /tmp/form-nginx.conf
unset API_ACCESS_TOKEN token authorization guard
exec nginx -c /tmp/form-nginx.conf "$@"

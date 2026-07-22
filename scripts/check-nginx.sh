#!/usr/bin/env bash
# Infra smoke check: run the real nginx image against the built dist and assert
# the redirect + security-header behaviour that `astro preview` can't exercise.
# Guards the nginx-level regressions we've hit: trailing-slash canonicalisation,
# the legacy /in/solutions-* 301s, and the Content-Security-Policy header.
#
# Usage: npm run build && scripts/check-nginx.sh
set -euo pipefail

PORT="${PORT:-8899}"
NAME="lz-nginx-check-$$"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
	echo "⚠  docker not found — skipping nginx infra check."
	exit 0
fi
if [ ! -f "$DIR/dist/in/index.html" ]; then
	echo "✗  dist/ not built. Run 'npm run build' first."
	exit 1
fi

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --name "$NAME" -p "$PORT:80" \
	-v "$DIR/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
	-v "$DIR/dist:/usr/share/nginx/html:ro" nginx:alpine >/dev/null
# wait for nginx to answer
for _ in $(seq 1 20); do
	curl -sf -o /dev/null "http://localhost:$PORT/in/" && break || sleep 0.5
done

fail=0
# $1 = path, $2 = expected HTTP code, $3 = expected Location (empty = none)
expect_redirect() {
	code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$1")
	loc=$(curl -s -o /dev/null -w "%{redirect_url}" "http://localhost:$PORT$1")
	if [ "$code" != "$2" ] || { [ -n "$3" ] && [ "${loc%$3}" = "$loc" ]; }; then
		echo "✗  $1 → $code $loc (expected $2 $3)"
		fail=1
	else
		echo "✓  $1 → $code ${loc:+$loc}"
	fi
}

echo "== redirects =="
expect_redirect "/in/locations"            301 "/in/locations/"
expect_redirect "/in/locations/"           200 ""
expect_redirect "/in/solutions-clinics"    301 "/in/solutions/clinics/"
expect_redirect "/in/solutions-hospitals/" 301 "/in/solutions/hospitals/"
expect_redirect "/sitemap-index.xml"       200 ""
expect_redirect "/robots.txt"              200 ""

echo "== security headers on /in/ =="
headers=$(curl -s -D - -o /dev/null "http://localhost:$PORT/in/")
for h in "content-security-policy" "strict-transport-security" "x-content-type-options"; do
	if echo "$headers" | grep -iq "^$h:"; then
		echo "✓  $h present"
	else
		echo "✗  $h MISSING"
		fail=1
	fi
done

[ "$fail" -eq 0 ] && echo "nginx infra check passed." || { echo "nginx infra check FAILED."; exit 1; }

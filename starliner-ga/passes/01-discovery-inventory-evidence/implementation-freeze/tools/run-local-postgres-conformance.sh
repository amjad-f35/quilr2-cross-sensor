#!/usr/bin/env sh
set -eu

DIE_PG_BIN="${DIE_PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
DIE_PG_PORT="${DIE_PG_PORT:-55440}"
DIE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DIE_PG_TMP="$(mktemp -d /private/tmp/die-postgres-conformance.XXXXXX)"
DIE_PG_DATA="$DIE_PG_TMP/data"
DIE_PG_SOCKET="$DIE_PG_TMP/socket"
DIE_PG_LOG="$DIE_PG_TMP/postgres.log"

mkdir "$DIE_PG_SOCKET"

cleanup() {
  "$DIE_PG_BIN/pg_ctl" -D "$DIE_PG_DATA" -m immediate stop >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

"$DIE_PG_BIN/postgres" --version
"$DIE_PG_BIN/initdb" -D "$DIE_PG_DATA" --no-locale --encoding=UTF8 \
  --data-checksums >/dev/null
"$DIE_PG_BIN/pg_ctl" -D "$DIE_PG_DATA" -l "$DIE_PG_LOG" \
  -o "-k $DIE_PG_SOCKET -p $DIE_PG_PORT" start >/dev/null
"$DIE_PG_BIN/createdb" -h "$DIE_PG_SOCKET" -p "$DIE_PG_PORT" \
  die_conformance
"$DIE_PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$DIE_PG_SOCKET" \
  -p "$DIE_PG_PORT" -d die_conformance -f "$DIE_ROOT/sql/001-die-core.sql"
"$DIE_PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$DIE_PG_SOCKET" \
  -p "$DIE_PG_PORT" -d die_conformance \
  -f "$DIE_ROOT/sql/003-die-roles-and-grants.sql"
"$DIE_PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$DIE_PG_SOCKET" \
  -p "$DIE_PG_PORT" -d die_conformance \
  -f "$DIE_ROOT/tools/live/postgres-conformance.sql"

printf '%s\n' "Local PostgreSQL conformance passed"

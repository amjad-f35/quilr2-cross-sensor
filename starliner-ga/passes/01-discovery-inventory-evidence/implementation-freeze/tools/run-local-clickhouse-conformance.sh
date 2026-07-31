#!/usr/bin/env sh
set -eu

DIE_CLICKHOUSE_BIN="${DIE_CLICKHOUSE_BIN:-clickhouse}"
DIE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DIE_CH_PATH="$(mktemp -d /private/tmp/die-clickhouse-conformance.XXXXXX)"

"$DIE_CLICKHOUSE_BIN" local --version
"$DIE_CLICKHOUSE_BIN" local --path "$DIE_CH_PATH" --multiquery \
  < "$DIE_ROOT/sql/002-die-clickhouse.sql"
"$DIE_CLICKHOUSE_BIN" local --path "$DIE_CH_PATH" --multiquery \
  < "$DIE_ROOT/tools/live/clickhouse-conformance.sql"

printf '%s\n' "Local ClickHouse conformance passed"

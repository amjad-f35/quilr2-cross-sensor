#!/usr/bin/env sh
set -eu

DIE_POSTGRES_IMAGE="${DIE_POSTGRES_IMAGE:-postgres:17.10-alpine3.24}"
DIE_CLICKHOUSE_IMAGE="${DIE_CLICKHOUSE_IMAGE:-clickhouse/clickhouse-server:26.3.17.56}"
DIE_PG_CONTAINER="die-postgres-conformance"
DIE_CH_CONTAINER="die-clickhouse-conformance"
DIE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cleanup() {
  docker stop "$DIE_PG_CONTAINER" >/dev/null 2>&1 || true
  docker stop "$DIE_CH_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker pull "$DIE_POSTGRES_IMAGE"
docker pull "$DIE_CLICKHOUSE_IMAGE"
docker image inspect "$DIE_POSTGRES_IMAGE" --format '{{json .RepoDigests}}'
docker image inspect "$DIE_CLICKHOUSE_IMAGE" --format '{{json .RepoDigests}}'

docker run --rm --name "$DIE_PG_CONTAINER" \
  -e POSTGRES_PASSWORD=die-conformance \
  -e POSTGRES_DB=die_conformance \
  -e POSTGRES_INITDB_ARGS=--data-checksums \
  -d "$DIE_POSTGRES_IMAGE"

until docker exec "$DIE_PG_CONTAINER" pg_isready -U postgres -d die_conformance >/dev/null 2>&1; do
  sleep 1
done

docker exec -i "$DIE_PG_CONTAINER" \
  psql -v ON_ERROR_STOP=1 -U postgres -d die_conformance \
  < "$DIE_ROOT/sql/001-die-core.sql"
docker exec -i "$DIE_PG_CONTAINER" \
  psql -v ON_ERROR_STOP=1 -U postgres -d die_conformance \
  < "$DIE_ROOT/sql/003-die-roles-and-grants.sql"
docker exec -i "$DIE_PG_CONTAINER" \
  psql -v ON_ERROR_STOP=1 -U postgres -d die_conformance \
  < "$DIE_ROOT/tools/live/postgres-conformance.sql"

docker run --rm --name "$DIE_CH_CONTAINER" -d "$DIE_CLICKHOUSE_IMAGE"
until docker exec "$DIE_CH_CONTAINER" clickhouse-client --query "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done

docker exec -i "$DIE_CH_CONTAINER" clickhouse-client --multiquery \
  < "$DIE_ROOT/sql/002-die-clickhouse.sql"
docker exec -i "$DIE_CH_CONTAINER" clickhouse-client --multiquery \
  < "$DIE_ROOT/tools/live/clickhouse-conformance.sql"

echo "Live PostgreSQL and ClickHouse conformance passed."

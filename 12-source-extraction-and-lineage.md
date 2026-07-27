# Source extraction and lineage

The complete matrix is [source-extraction.csv](matrices/source-extraction.csv).

## Extraction rules

Every adapter records:

```text
source endpoint/table/topic/symbol
auth principal and tenant resolution method
collection mode
cursor/watermark/sequence
request page/rate-limit metadata
source/native schema version
backfill range/run
idempotency key
ordering guarantees
delete/tombstone semantics
retention and replay limit
failure/retry/DLQ behavior
expected volume/sensitivity
transform/adapter version
```

## Source paths

| Source | Exact collection boundary | Mode/cursor | Backfill and recovery |
| --- | --- | --- | --- |
| Vanguard | Page/content/background message handlers and BES interaction/event routes | Push; request/context/native IDs | Browser-local durable backfill is not evidenced; add adapter spool for outage |
| Native host | Chrome native stdin/stdout plus local SQLite Persona/config | Push; `SystemEvent.id`; per-file ID must be added | Replay state/config only; heartbeat/reconnect; fix false-success write handling |
| BES | 181 HTTP mappings, heartbeat/risk/audit Kafka, PostgreSQL, Neo4j, Redis, DWH | Push/stream/query; route/native IDs and query IDs | Tenant/time/table backfill; reconcile lossy buckets/publishes |
| Endpoint discovery | app-ID POST, gzip discovered-apps POST, delta GET | Push + delta poll; entity IDs and `u64` cursor | Snapshot/pending repeat; five-second retry; preserve failed cursor/batch |
| Endpoint proxy | Interception hooks/local broker/alerts/activity APIs | Push; flow/process/action IDs | Add bounded durable spool and explicit delivery acknowledgment |
| IDE hooks | Local framed socket + activity HTTP batches | Push; session/event IDs | Current bounded channel drops and has no durable spool; add one |
| Persona/email | Nine-source scan + local framed IPC | Scan; email/source/device context | Repeat scan; bind peer/run nonce; preserve partial-source errors |
| Diagnostics | Local broker, NDJSON, OpenSearch bulk | Push/batch; diagnostic UUID | Replay unsent NDJSON; preserve original ID/time/source |
| Endpoint dashboard | Go HTTP/ClickHouse | Query or future CDC; table IDs/time | Compatibility backfill with deployed-schema validation |
| LLM Gateway | 287 HTTP routes, SQLite, NATS, provider callbacks | Interception/push; request/context/API-key hash | SQLite/ClickHouse ID/time backfill; provider/source retry semantics |
| LLM workers | JetStream DLP/DB subjects and core request/reply | Stream; request-scoped subject/ID | Stream-retention backfill only; add DLQ; record worker/schema versions |
| Endpoint Config Manager | HTTP + `tenant_configs.sqlite3` | Poll/snapshot; tenant/config version | Full tenant snapshot; 409/version reconciliation |
| Gateway health | SQLite/public rollup | Poll; target/time bucket | Query retained 1–90 days; source retention is operational |
| MCP Gateway | External APIs/stream plus current warehouse projection | Contract unresolved | Block complete adapter sign-off until repository/schema/payloads arrive |
| Quilr 1 ClickHouse | Named tables in [Q1-DATA](../../quilr-platform-analysis/08-data-dictionary.md) | Backfill query; future CDC/append stream | Partition/time/native-key scans, source watermark and reconciliation |
| Quilr 1 Neo4j | Pinned graph/common client reads | Tenant snapshot | Import as relationship observations with authority unknown; never historical fact |
| Quilr 1 Redis | Cache/queue/marker snapshot | Diagnostic only | No history/authority; do not seed canonical identity |

## Pagination, rate limits, and credentials

- HTTP pollers use deterministic sort + opaque cursor; offset-only APIs require snapshot/time fences.
- Provider/connector/IdP limits use token-bucket throttling per tenant/integration and honor server retry hints.
- Backfills checkpoint only after downstream raw+observation durability.
- Credentials live in managed secret storage; adapters receive short-lived references, never write values into observations/logs.
- Source-native credentials are represented by provider ID or tenant-scoped nonreversible fingerprint.
- If a source cannot signal deletes, staleness is inferred only under a healthy expected-coverage rule and remains separate from retirement.

## Transformation lineage

Canonical field values keep:

```text
source observation ID
native JSON/table path
adapter and normalization function/version
source authority class
transform inputs
valid and transaction times
confidence/conflicts
manual override if any
```

Key examples are [canonical-field-lineage.csv](matrices/canonical-field-lineage.csv).

## Current evidence limitations

- BES proprietary decoder/DWH/graph/Kafka library behavior and deployment routes are not fully local.
- Endpoint-to-backend deployed schema compatibility remains unresolved in several paths.
- LLM gateway production service/worker topology varies and some consumers are absent from the tracked all-in-one supervisor.
- MCP source is absent.
- Production schema drift, data volumes, retention, and external rate limits were not supplied.

These limitations are adapter readiness gates, not reasons to invent semantics.

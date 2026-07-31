# Events, messages, and records


Records: **14**; events: **14**; messages:
**257**. Current native delivery guarantees remain record-path
specific. No Starliner acknowledgement is inferred from SQLite/NATS/Axis.

## Interface coverage

| Protocol | Interfaces |
| --- | --- |
| HTTP via db writer | 1 |
| HTTP/WebSocket | 252 |
| NATS JetStream | 2 |
| SQLite WAL | 1 |
| native/HTTP via clients/master API | 1 |

HTTP rows preserve their bidirectional request/response nature. NATS, Axis,
SQLite, and ClickHouse interfaces are retained rather than silently excluded.
Producer/consumer wording names external boundaries explicitly when the caller
identity is deployment-specific.

## Record access limitation

The source dossier proves transport/storage families, not deployment-safe
table names or topics. Record recipes therefore use
`NO_CURRENT_ACCESS_PATH` with a rationale instead of fabricating a query.

Catalogs:
[`records.csv`](../../lg008-llm-gateway/catalogs/records.csv),
[`events.csv`](../../lg008-llm-gateway/catalogs/events.csv), and
[`messages.csv`](../../lg008-llm-gateway/catalogs/messages.csv).

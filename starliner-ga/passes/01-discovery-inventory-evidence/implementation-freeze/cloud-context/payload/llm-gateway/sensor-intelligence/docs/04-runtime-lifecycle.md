# Runtime lifecycle


`Verified in source:` BlackSheep startup initializes shared resources and
background retry state; routes then accept requests. A request validates
identity/key/configuration, applies limits and request guardrails, resolves a
provider/model, performs the upstream operation, applies response guardrails
where implemented, finalizes telemetry, and returns/streams. Shutdown closes
HTTP/provider clients, database state and configured resources.

```mermaid
sequenceDiagram
  participant C as Caller
  participant G as LLM Gateway
  participant D as DLP workers
  participant P as Provider
  participant W as DB writer/storage
  C->>G: request
  G->>G: authenticate, configure, limit, route
  G->>D: request content classification
  D-->>G: prediction/result
  alt blocked
    G-->>C: block/error
  else allowed or transformed
    G->>P: provider request
    P-->>G: response/stream
    G->>D: response classification where supported
    D-->>G: prediction/result
    G-->>C: allowed/transformed/block result
  end
  G->>W: final request log and optional Axis evidence
```

Existing durable state includes SQLite WAL, JetStream and ClickHouse paths.
`Unresolved:` production topology, exact replay retention and end-to-end Axis
acknowledgement. `Proposed:` Starliner adds an authenticated local outbox with
sequence/ack/replay; it is not current behavior.

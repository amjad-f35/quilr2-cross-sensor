# Sensor versus platform responsibilities

| responsibility | sensor | adapter_starliner | central_platform | reason |
| --- | --- | --- | --- | --- |
| Native capture | Owns | Receives native record | Does not recapture | Only inline gateway has complete request context |
| Source-specific parsing/normalization | Owns protocol walkers | Owns source-profile mapping | Validates contract | Preserve native semantics |
| Stable native IDs | Generates/preserves | Namespaces | Resolves | No source adapter canonical IDs |
| Canonical IDs/entity resolution | No | No | Owns | Cross-sensor authority |
| Local policy/enforcement | Owns | Reports/certifies | Administers policy/commands where supported | Inline latency and effect boundary |
| Evidence capture/privacy | Captures/redacts | Filters/hashes/references | Controls access/retention | Minimize sensitive transport |
| Durable outbox/delivery | Commits record | Owns sequence/batch/ack/replay | Acknowledges/idempotently ingests | Trustworthy delivery |
| Cross-sensor findings/metrics/UI | Signals only | Maps inputs | Owns | Requires canonical data and coverage |

# Adapter Architecture

| component | responsibility | input | output | implementation |
| --- | --- | --- | --- | --- |
| profile manager | pin schema/version/capabilities | store metadata/config | capability profile | proposed |
| ClickHouse extractors | bounded tenant-scoped reads/cursors | source tables | raw evidence | proposed |
| PostgreSQL snapshot extractors | transactional state snapshots/deletes | source tables | raw evidence | proposed |
| Neo4j snapshot extractor | low-authority graph assertions | graph | relationship evidence | proposed |
| privacy gate | classify/redact/reject fields | raw evidence | safe/restricted evidence | proposed |
| normalizer | source-scoped entity/event candidates | evidence | candidates/assertions | proposed |
| WAL/outbox | durable retry/idempotency/checkpoint | envelopes | acknowledged delivery | proposed |
| reconciler | count/watermark balance | source+delivery metrics | coverage/health | proposed |
| control adapter | translate approved commands and observe effect | platform command | result/effect evidence | proposed |

## Responsibility boundary

The adapter pins source profiles, reads and privacy-classifies evidence, creates source-scoped candidates, and delivers durably. Starliner/platform owns global IDs, admission, resolution, canonical findings, read models, and command orchestration. This architecture is **Proposed**, not implemented in this repository.

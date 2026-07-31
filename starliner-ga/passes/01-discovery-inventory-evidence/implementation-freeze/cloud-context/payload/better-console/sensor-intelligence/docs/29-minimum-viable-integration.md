# Minimum Viable Integration

| capability | scope | reason | acceptance |
| --- | --- | --- | --- |
| source profiles | include | required for safe extraction | schema/version/key/tenant verified |
| read-only ClickHouse evidence | include | primary cross-sensor platform visibility | bounded cursor/replay/reconcile |
| PostgreSQL snapshots | include | configuration/identity/product documents | transactional snapshot/delete handling |
| Neo4j assertions | conditional | useful graph evidence but lower authority | outage never implies delete |
| LocalStore data | exclude as canonical | derived cache/read model | use only operational/compatibility evidence |
| native controls | defer except verified adapters | effect proof incomplete | command/result/effect state machine |
| canonical findings | defer | source signals require global definitions | central admission tests |
| coverage/health | include | prevent silent source loss | customer/operator degraded states |
| compatibility reads | selected | migration support | golden fixture parity and rollback |

Go requires pinned source contracts, tenant/privacy failure-closed behavior, restart/replay/idempotency, reconciliation balance, degraded coverage, selected golden compatibility parity, and exercised rollback.

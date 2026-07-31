# Error and Recovery Model

| Area | Failure handling | Retry/recovery | Fatality |
| --- | --- | --- | --- |
| configuration/state initialization | anyhow context | operator fixes configuration/dependency | fatal startup |
| bind/server | contextual error | process restart | fatal |
| HTTP handlers | AppError status/safe message | client/context specific | request only |
| ClickHouse reads | converted to AppError and timed | request retry/UI retry or refresher fallback | request/background only |
| local refresh | log and preserve prior snapshot | periodic retry | nonfatal |
| topic schema | warn/error | indefinite retry | HTTP remains available |
| topic classification | provider retry then structured correction | 3 transports; up to 4 validation calls; bucket retry/dead letter | tenant cycle only |
| Redis lease release | warning | TTL expiry | nonfatal |
| frontend query | one retry default; 401 triggers session re-probe | manual/UI retry | view-level |
| control proxy | bounded transport/status mapping | caller retry; no global outbox | request only |

No circuit breaker library is globally applied. Graph deployment adapters implement an explicit cooldown/half-open circuit and have cancellation tests. Cross-store mutations do not form one distributed transaction.

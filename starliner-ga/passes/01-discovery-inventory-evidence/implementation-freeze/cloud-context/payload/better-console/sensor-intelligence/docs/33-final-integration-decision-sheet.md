# Final Integration Decision Sheet

| Field | Decision |
| --- | --- |
| Source | Better Console Backend platform aggregator at `68132e67d0b494d52aac01a1ad811c03faf21550` |
| Actual role | Cross-sensor console/BFF/read-model and management adapter; not a native sensor |
| Unique visibility | Unified LLM/MCP/Endpoint/Browser inventory, users, conversations, metrics, source readiness, identity/configuration, and derived topics |
| Current emission boundary | HTTP responses, structured logs, PostgreSQL documents, Redis session/lease state, SQLite mirrors/caches, and three derived ClickHouse topic tables |
| Adapter readiness | Requires a new stable evidence/profile/WAL boundary |
| Starliner integration | Dedicated read-only extractors plus privacy gate and durable WAL/outbox; central admission/resolution |
| Durable outbox | Absent as a universal capability |
| Primary inventory | applications, accounts/users/groups, devices, conversations, models/providers, MCP tools/backends, policies/configuration |
| Primary events | source interaction/tool/endpoint/browser evidence plus platform auth/document/topic transitions |
| Enforcement | session/authz/CSRF and multiple management proxies; universal independent native effect proof absent |
| Customer surfaces | inventory, users, activity, findings with admission, analytics, configuration |
| Operator surfaces | capability health, cache/schema/cursor/lease/dead-letter/reconciliation |
| MVS | read-only evidence import, candidates/assertions, health/reconciliation, selected compatibility reads |
| Overall readiness | **Requires a new stable platform integration boundary** |

This decision does not recommend rewriting the console. It reuses its verified source knowledge and APIs while preventing derived caches/UI contracts from becoming unqualified canonical sensor truth.

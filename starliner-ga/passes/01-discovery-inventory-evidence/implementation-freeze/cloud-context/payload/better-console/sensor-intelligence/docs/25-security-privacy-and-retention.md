# Security, Privacy, and Retention

| Data | Class | Origin | Handling | Boundary |
| --- | --- | --- | --- | --- |
| credentials/API keys | secret | runtime env/config and trusted stores | redact/no logs/no fixtures | crosses service/provider boundary |
| session IDs/cookies | authentication secret | browser/Redis | opaque, secure flags, bounded logs | browser-server boundary |
| emails/user IDs | personal data | source rows/session/local mirror | tenant scope and normalized matching | multiple stores |
| conversation bodies | potential sensitive content | ClickHouse to sanitized detail/cache | bounded/redacted; not topic persistence | sensor-console boundary |
| MCP arguments/results | potential secret/content | ClickHouse/export | export sanitizer; UI detail controls | source-console/download |
| endpoint DLP content | sensitive evidence | Endpoint ClickHouse | query/select constraints; cache excludes captured content | sensor-console |
| IP address/GeoIP | personal/network data | request/source + local GeoLite | best effort; display annotation | request/log boundary |
| provider configuration | secret/config | PostgreSQL/upstream | Debug redaction and safe projection | service boundary |
| internal telemetry | operational metadata | SQLite | operator-only | internal admin boundary |
| dashboard prompts/output | tenant content | PostgreSQL/Claude/Python | ACL and sandbox limits | external model/process boundary |
| source observations | not currently emitted | proposed adapter | requires field policy/retention | future Starliner boundary |

Repository code implements many bounds/redactions but does not define a universal retention/deletion policy across upstream stores. **Unresolved:** deployed row policies, grants, retention TTLs, legal basis, and deletion propagation require environment/policy evidence.

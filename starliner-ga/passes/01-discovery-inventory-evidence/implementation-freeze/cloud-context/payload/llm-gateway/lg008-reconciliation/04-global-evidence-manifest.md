# LLM evidence manifest


Evidence rows: **1,265**.

| Evidence type | Rows |
| --- | --- |
| CONFIGURATION | 50 |
| FIXTURE | 11 |
| GENERATED_INDEX | 73 |
| RUNTIME_COMMAND | 1 |
| RUNTIME_STDERR | 1 |
| RUNTIME_STDOUT | 1 |
| SCHEMA | 32 |
| SOURCE_FILE | 1093 |
| SUPPORTING_REPOSITORY | 3 |

Every row carries repository/revision context, SHA-256, proof status,
reachability, retention location, sanitization, owner, and reverse assertion
links. The validator re-hashes every retained artifact. Source and runtime
proof remain separate; `BOTH` requires both evidence classes.

`Verified:` source evidence retention locations now identify the actual pinned
checkout blobs, not merely the inventory CSV. Supporting repositories are
represented as boundary evidence and do not become additional sensor profiles.

Manifest: [`evidence-registry.ndjson`](../../lg008-llm-gateway/registries/evidence-registry.ndjson).

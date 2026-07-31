# 31 — Open Questions

## Use

These questions identify evidence that cannot be obtained from the pinned
repositories alone. “Blocking” means the answer materially changes the MVS
contract or safe implementation.

## Platform contracts and Starliner

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-001 | Which contract is authoritative for unresolved source observations when `canonical_entity` is not known? | Starliner contracts/resolution owners; accepted schema | Yes |
| OQ-002 | Is `DeliveryRecord { envelope, body }` the actual ingest wire shape, and which component validates it? | Running ingest route plus contract tests | Yes |
| OQ-003 | What is the exact per-record delivery result schema, including missing result IDs? | Ingest/delivery API owner | Yes |
| OQ-004 | What are idempotency, duplicate, ordering and replay guarantees? | Ingest/storage contract and tests | Yes |
| OQ-005 | How are `in_flight` records leased and recovered after worker crash? | Production outbox implementation/tests | Yes |
| OQ-006 | Which endpoint entity/action/relationship kinds will be added to canonical enums? | Ontology owner/version plan | Yes |
| OQ-007 | Will `FindingSignal.signal_type` be extensible or versioned for endpoint signals? | Findings contract owner | Yes for findings |
| OQ-008 | Which canonical body types are currently admitted by production Starliner? | Live registry/config/API | Yes |
| OQ-009 | Are the cross-sensor design drafts normative, or is `starliner_contracts` always authoritative? | Architecture governance decision | Yes |
| OQ-010 | Is delivery HTTP, gRPC or another transport, and what motivates the choice? | Platform network/operations requirements | No for semantics; yes before implementation |

## Enrollment, tenancy and identity

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-011 | How is an endpoint sensor enrolled, revoked and rotated? | Identity/control-plane design | Yes |
| OQ-012 | What cryptographically binds tenant, device and sensor instance? | Credential/certificate/token contract | Yes |
| OQ-013 | What is the authoritative device identifier and migration from the three current namespaces? | Device/identity owners and production data | Yes |
| OQ-014 | How should MCP IDs distinguish parent application, transport, scope and user? | Ontology/resolution policy | Yes |
| OQ-015 | How are canonical entity merge, split and rollback audited? | Resolution service behavior | Yes |
| OQ-016 | What happens in production when Persona/tenant changes while queues contain records? | Live design/runtime test | Yes |
| OQ-017 | Which endpoint identity sources are permitted, and which are authoritative versus hints? | Privacy/identity product policy | Yes |
| OQ-018 | Are stable issuer/subject values available from current Persona backend responses? | Backend schema/live response | No |

## Endpoint deployment and configuration

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-019 | Which macOS/Windows versions, architectures and endpoint builds are actually supported? | Release/support matrix and deployed fleet | Yes |
| OQ-020 | Which features and services are enabled in production packages? | Signed package/config/runtime inventory | Yes |
| OQ-021 | What are the effective production scan intervals, roots, scripts and package ecosystems? | Deployed config and override precedence | Yes |
| OQ-022 | Which proxy bind addresses, ports, filters, bypasses and upstream modes are deployed? | Runtime config/extension/driver state | Yes for coverage |
| OQ-023 | Which Cursor/Claude versions/events/templates are certified? | Hook support/certification matrix | Yes |
| OQ-024 | What OS ACLs protect hook sockets, broker endpoints, snapshots, logs and configuration? | Installed filesystem/pipe ACL capture | Yes for trust claims |
| OQ-025 | Is the active Lua script directory protected and are scripts signed in deployed packages? | Artifact and host ACL evidence | Yes |
| OQ-026 | Does any deployed runtime enable the dormant `grpc_server` feature? | Build flags/process/listener inventory | No; current source has no default start |
| OQ-027 | Which current dashboard endpoints are still production dependencies? | Live traffic/service inventory | Yes for migration |

## Capture semantics

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-028 | What exact process start/boot evidence can each OS enumerator provide? | macOS/Windows runtime implementation/test | Yes |
| OQ-029 | How should source-native scan and event IDs be generated across restart? | Endpoint/adapter ID contract | Yes |
| OQ-030 | Which rich Lua records/relationships/risk values appear in real deployed scripts? | Sanitized captured parser fixtures | No, but required before mapping complete |
| OQ-031 | How are repository roots/commits/remotes detected locally today, if at all beyond typed records? | Runtime fixtures/source-specific configs | No |
| OQ-032 | Which hook events can arrive without `session_id`, timestamps or tool/file fields? | Supported IDE schema corpus | Yes |
| OQ-033 | What is the actual hook queue/batch loss rate and restart behavior under load? | Fault/load tests | No |
| OQ-034 | Which proxy paths see bodies versus metadata/tunnels only? | Protocol/route runtime matrix | Yes for claims |
| OQ-035 | How often does process attribution fail or become stale on each OS? | Instrumented fleet/runtime measurement | No |
| OQ-036 | Does current macOS UDP behavior reject, proxy or bypass each deployed configuration? | Extension/runtime tests | Yes for coverage |
| OQ-037 | What exact Windows IPv6/UDP/allow/deny behavior occurs with deployed WinDivert filters? | Windows runtime matrix | Yes for coverage |

## DLP, policy and control

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-038 | Is the remote analyzer endpoint authenticated outside the inspected client? | Network/deployment/auth evidence | Yes if used |
| OQ-039 | How are remote non-2xx statuses interpreted by the actual reqwest path? | Runtime tests | Yes if used |
| OQ-040 | Which analyzer modes are enabled per tenant and what fallback is accepted? | Production policy/config | Yes |
| OQ-041 | Is policy fail-open at 100 ms an accepted product policy for every protected action? | Security/product decision | Yes |
| OQ-042 | Is `AllowPromptAfterRemovalOfSensitiveData` intended to redact-and-forward or block? | Policy owner plus byte-level runtime behavior | Yes |
| OQ-043 | What constitutes successful Application termination on each OS? | Control semantics and final observation test | Yes |
| OQ-044 | Is Quarantined intended to add filesystem/network isolation later? | Product/control roadmap | No; current UI must not claim it |
| OQ-045 | Who is authorized to approve/justify and how is actor identity bound? | Authorization/identity design | Yes before remote control |
| OQ-046 | What are command expiry, cancellation, precedence and duplicate semantics? | Control contract | Yes before remote control |

## Privacy, security and retention

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-047 | Which tenants permit raw prompt/body/file evidence, if any? | Legal/privacy/product policy | Yes before protected evidence |
| OQ-048 | What are retention durations for observations, events, evidence, logs, outbox, DLQ and backups? | Legal/security/data governance | Yes |
| OQ-049 | Where are evidence and outbox encryption keys stored/rotated? | Security/key-management design | Yes |
| OQ-050 | What roles can view raw identity/path/content and request controls? | Authorization matrix | Yes |
| OQ-051 | How is deletion propagated and proven across endpoint, outbox, backend, indexes and backups? | Data-deletion architecture | Yes |
| OQ-052 | Are tenant-scoped digests allowed for secret/path/content correlation? | Privacy/security decision | Yes |
| OQ-053 | What production logs currently contain request, prompt, path, identity or token data? | Sanitized log sampling/config | No, but urgent validation |
| OQ-054 | Are current local IPC endpoints reachable by unprivileged users in production? | Host ACL/peer tests | Yes for evidence confidence |
| OQ-055 | What security boundary protects the macOS extension relay/heartbeat listener? | Host firewall/sandbox/peer evidence | Yes |

## Health, operations and performance

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-056 | What freshness/SLO thresholds apply per source and product view? | Product/SRE policy | Yes |
| OQ-057 | What outbox byte/record quotas and priority policy are safe? | Load/modeling and endpoint storage constraints | Yes |
| OQ-058 | How much hot-path latency can hook/proxy bridges add? | Performance budget and load tests | Yes |
| OQ-059 | What event/byte rates occur on representative endpoints? | Sanitized fleet measurements | Yes for capacity |
| OQ-060 | How should high-cardinality paths/processes/destinations be bounded in metrics? | Observability design | Yes |
| OQ-061 | How are adapter upgrades rolled back with unread old outbox versions? | Upgrade/compatibility design | Yes |
| OQ-062 | Which health failures page operators versus open customer coverage findings? | Product/SRE routing policy | No |
| OQ-063 | What debug bundle can support collect without exposing user content? | Support/security design | No |
| OQ-064 | What is the actual effect of cumulative rather than windowed proxy failure rate? | Runtime simulation/fleet data | No |

## Cross-sensor and product

| ID | Question | Evidence needed / owner | Blocking |
| --- | --- | --- | --- |
| OQ-065 | Which browser, LLM gateway, MCP gateway, agent-runtime, SCM, cloud and identity sensors exist with contracts? | Sensor registry/contracts | Yes for cross-sensor findings |
| OQ-066 | Which exact IDs can be propagated end-to-end across those sensors? | Integration schemas/runtime tests | Yes |
| OQ-067 | What late windows and clock tolerances apply per correlation? | Data/analytics policy | Yes |
| OQ-068 | How are conflicting policies/effects ordered across endpoint and gateways? | Policy precedence design | Yes |
| OQ-069 | Which of the 32 finding candidates are product-approved and with what severity defaults? | Product/security rule review | Yes for findings |
| OQ-070 | Which state dimensions appear in Overview versus Inventory versus Activity? | Product information architecture | No |
| OQ-071 | How are unsupported/degraded sources represented in customer exports/APIs? | Product/API design | Yes |
| OQ-072 | Which current dashboard routes/data models must remain compatible during migration? | Product/runtime inventory | Yes |

## Questions answered by this analysis

- Does the current endpoint exhaustively discover agents across macOS, Windows,
  Linux, cloud, serverless, CI, MCP, repositories and skills? **No.** It has
  meaningful macOS/Windows process/config/package/hook/proxy contributions and
  local typed MCP/skill/repo records, but lacks active Linux and authoritative
  cloud/serverless/CI/SCM/runtime coverage.
- Are proxy and hooks part of the sensor? **Yes, conditionally**, with explicit
  coverage and control limitations.
- Is active gRPC used? **No active default runtime was found.** The dormant
  feature is incomplete/incompatible and is not an MVS dependency.
- Can the adapter assign canonical entities? **No.** That belongs to the
  platform, and the current Starliner contract mismatch is a blocker.


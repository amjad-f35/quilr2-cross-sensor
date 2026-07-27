# Gap and new telemetry plan

The prioritized matrix is [gaps.csv](matrices/gaps.csv).

## P0 — structural correctness

| Gap | Required work | Why first |
| --- | --- | --- |
| Source observation envelope | Versioned adapters, source registry, raw reference, idempotency/delete/correction | Without it, nothing is replayable or provenance-safe |
| Immutable raw/evidence store | Tenant encryption, hash/integrity, retention/legal hold/access audit | Findings/decisions cannot be defended |
| Canonical/alias/provenance/bitemporal ledger | PostgreSQL schema and outbox | Identity, merge/split, history, and consistency |
| Entity resolver + manual merge/split | Entity-specific keys/rules/confidence/Resolution Center | Prevent false splits/merges |
| Coverage/capability registry | Sensor installation/version/capabilities/cadence/enforceability | Distinguish unknown from absent and claimed from enforceable |
| MCP source contract | Repository/API/event schemas and payload samples | Current external UI/analytics cannot prove native semantics |
| Stable agent identity | Definition/version/deployment/runtime/session/run/step IDs and artifact/config digest | Unlock agent dependencies, actions, findings, cost/outcomes |
| Browser/provider account identity | Provider tenant/account ID and personal/enterprise evidence | Prevent false personal-account claims |

## P1 — actionable correlation

- Unified policy/control/version/decision/enforcement/approval/exception contract.
- MCP tool schema/version, call/request/result/effect, actor/run, target, idempotency, OAuth scope, and gateway identity.
- Tenant-scoped credential fingerprints, provider IDs, owner, issue/expiry/rotation/revocation.
- Data catalog identity for files/repos/KB/memory and event-time classification mapping.
- Model deployment/account/region/endpoint and actual route target per invocation.
- IdP/HR user/group/department/manager/role-change bitemporal sync.
- Connector/integration/account/OAuth scope/health/access lifecycle.
- Provider/billing rate-card and cost-record contract.

## P2 — assurance and value

- outcome/task success verification and business value;
- sensor/agent artifact digest and certification/attestation;
- action effect reconciliation;
- long-term memory read/write/retention/delete evidence;
- permitted search index for aliases/events/evidence metadata.

## Sensor-specific changes

### Browser/native

- propagate one globally unique activity ID through page/content/background/native/BES/gateway;
- add per-file element ID and response association;
- add account provider/tenant/type evidence without collecting passwords/tokens;
- authenticate/bind page/native messages and report delivery integrity;
- emit explicit source version, decision/policy/enforcement IDs.

### Endpoint

- preserve raw Lua entities, relationships, events, risk, and rich attributes;
- include entity kind, parent application, transport, package/signing identifiers in source IDs;
- refresh changing payload fields with validity;
- emit application/process start/stop and installation lifecycle;
- spool IDE/proxy activity durably;
- bind local IPC peers and preserve original diagnostic IDs/times;
- emit actual policy evaluation rather than unconditional hook allow.

### LLM Gateway

- emit canonical candidate fields for application/account/credential/agent/workload/project;
- record exact provider model/deployment/endpoint/account/region and model route target;
- emit provider request IDs, attempts, usage, rate-card version, cost/outcome;
- attach policy/control/version/decision/enforcement IDs;
- add producer publish acknowledgment and standardized DLQ;
- identify worker/model/schema versions in results.

### MCP Gateway

- server product/deployment/client/tool/schema identifiers;
- config/discovery/change/version events;
- calls with actor/run/step, arguments/result evidence refs, target resources, decision/approval, effect, retries, idempotency, cost;
- connected account/OAuth scopes/credential fingerprint;
- heartbeat/version/certification/capabilities.

### Quilr platform

- canonical command/query APIs and outbox;
- projection watermarks/reconciliation/DLQs;
- Resolution Center;
- legacy alias resolver;
- evidence authorization/retention;
- canonical metric/finding definition registry.

## Privacy and minimization

New telemetry should prefer:

- stable provider IDs and nonreversible fingerprints over raw secrets;
- content references/classifications/sizes over duplicated plaintext;
- explicit consent/purpose for browser account identity;
- schema/capability digests over full tool payloads in inventory;
- artifact hashes over source code content;
- evidence access controls and audited unmasking.

## Acceptance criteria

A gap closes only when:

1. the schema and semantic owner are documented;
2. tenant/isolation/auth are tested;
3. native ID uniqueness and lifecycle are known;
4. delivery/idempotency/ordering/delete/replay behavior is tested;
5. sensitivity/retention are approved;
6. adapter normalization/lineage is versioned;
7. golden fixtures and negative/contradiction tests pass;
8. coverage and freshness are observable.

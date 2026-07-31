# Gap and sensor-change plan

## Available now

- backend registration source observation;
- tool discovery/call-time source observation;
- Direct tool-call action/outcome/latency;
- safe DLP labels and block direction;
- call/latency metric samples;
- block finding signal;
- validated bounded SQLite outbox;
- retry/terminal delivery;
- manifest, local self-test, metrics/health;
- actor pseudonym and source integrity hashes.

These still require the optional contract package, active configuration, and a
healthy runtime.

## Available through adapter mapping only

- richer backend/tool/resource/prompt/catalog inventory from gateway DB;
- safe tool-call, event, rejection, OAuth/admin/audit telemetry;
- settings/control configuration and precedence;
- workflow definitions/runs/steps/schedules/artifact metadata;
- token-saving analytics;
- client/agent heuristic and OneMCP rich-client diagnostics;
- credential metadata without values.

## Minor sensor instrumentation

1. remove locally created canonical entity reference and emit source namespace/
   identifiers;
2. close Direct exception observation gap;
3. add registry snapshots, revisions, deletes, status and stale lifecycle;
4. add explicit OneMCP remote/native tool hooks;
5. add resources/prompts/init capability-change/session/progress/cancel hooks;
6. propagate workflow agent/run/step/delegation refs;
7. add auth mode/client class/confirmation/decision/effect safe fields;
8. add ZIA/control attribution;
9. emit durable capability-specific health/loss;
10. add pseudonym key epoch, source sequence and instance epoch;
11. include top-level sensor tests in default CI;
12. bound batch bytes and terminal retention.

## Substantial sensor changes

- workload identity and signed delivery/receipts;
- raw evidence object/reference/access/retention system;
- local signed policy bundle/PEP replacing normal central hot-path calls;
- authenticated typed command and effect-reconciliation protocol;
- complete action-effect semantics for side-effecting tools;
- multi-replica durable session/confirmation/lock/queue state;
- cross-process workflow/runner adapter with stable causal propagation;
- encrypted local evidence storage if not supplied by deployment disk controls;
- authoritative registry reconciliation and bypass coverage integration.

## Requires external authoritative source

- human/person/account/group lifecycle;
- device/process/application installation;
- workload/deployment identity and attestation;
- model/provider/deployment/route and cost;
- billing/rate card;
- data asset/catalog/owner/region/retention;
- direct/bypass MCP traffic;
- software artifact signing/build/deployer provenance.

## Not useful / discard

- raw tokens/secrets/authorization headers;
- unbounded free-form arguments/results in ordinary telemetry;
- source-local canonical IDs as central authority;
- JSON-RPC request ID as global event ID;
- user-agent as verified client identity;
- low-entropy raw content hashes;
- every metric spike as a finding;
- duplicate ClickHouse and SQLite records as independent evidence;
- current-state config presented as historical event-time policy.

## Prioritized plan

| Priority | Change | Outcome | Dependency |
| --- | --- | --- | --- |
| P0 | correct source identity boundary | central resolution-safe backend/tool inventory | target source schema |
| P0 | make contract package reproducible and tests default | trustworthy build/certification | exact pinned artifacts |
| P0 | durable health/loss + missing-tenant quarantine | honest coverage | health contract |
| P0 | delivery workload identity/receipt/conflict semantics | production evidence channel | central ingest |
| P1 | registry snapshot/delete/revision | usable lifecycle/inventory | mapper/outbox schema |
| P1 | OneMCP/native/resources/prompts/session coverage | honest MCP coverage | handler instrumentation |
| P1 | close Direct exception and control-attribution gaps | correct activity/finding signals | typed result DTO |
| P1 | terminal retention/replay/byte bounds | operable outbox | policy/operator API |
| P2 | workflow causal lineage | agent→tool correlation | runner/gateway changes |
| P2 | safe DB event/rejection adapter | auth/control/activity visibility | privacy allowlists |
| P2 | local policy bundle/PEP | low-latency resilient control | policy service |
| P2 | typed commands/effects | customer actions | auth/audit/control plane |
| P3 | multi-replica externalization/certification | horizontal scale | deployment architecture |
| P3 | protected raw evidence system | authorized deep evidence | privacy/security platform |

## Acceptance gates

- no producer-created canonical IDs;
- no secret/raw-content leakage in ordinary records;
- no unsupported capability shown as observed;
- exact contract/profile/adapter/product versions;
- crash/replay/conflict/partial-ack tests;
- healthy/stale/loss semantics and customer-visible coverage;
- central identity resolution and non-merge tests;
- command receipt separated from effect;
- top-level certification included in CI;
- deployment topology consistent with certified state model.


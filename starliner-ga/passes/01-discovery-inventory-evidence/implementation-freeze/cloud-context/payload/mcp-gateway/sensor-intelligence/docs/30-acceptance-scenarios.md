# Acceptance scenarios

Legend: **Pass** current evidence satisfies the scenario; **Partial** some
layers exist; **Fail** required target behavior is absent; **Unresolved** needs
external/runtime evidence.

| ID | Scenario | Required assertion | Current result | Evidence/gap |
| --- | --- | --- | --- | --- |
| AS-01 | sensor enrolls and proves instance identity | authenticated, unique workload/runtime identity | Fail | operator string runtime ID and bearer only; no enrollment/attestation |
| AS-02 | reports capability manifest | versioned truthful supported/deferred capabilities | Partial | manifest exists; profile coverage incomplete and public exposure unresolved |
| AS-03 | emits representative observation | valid source/action record from native seam | Pass prototype | mapper/hook tests and targeted runtime pass |
| AS-04 | survives restart/network outage | durable queued record replayed after restart | Partial | SQLite/retry/lease tests; no killed-process/live network test |
| AS-05 | duplicate delivery idempotent | same record no duplicate fact | Pass local prototype | local scoped dedupe and duplicate terminal tests; central unresolved |
| AS-06 | same key/different body conflict | conflict preserved and surfaced | Fail | local first body silently wins |
| AS-07 | source appears in coverage | capability/version/health/freshness visible | Partial | manifest/routes; no durable health/heartbeat |
| AS-08 | inventory entity has source provenance | source IDs/time/sensor/evidence preserved | Partial | current observation has provenance but wrong canonical-authority semantics |
| AS-09 | registry lifecycle reconciles | snapshot completeness + update/delete/tombstone | Fail | upsert/sighting only |
| AS-10 | entity detail exposes safe attributes | server/tool safe fields and source confidence | Partial | backend/tool/transport/name subset only |
| AS-11 | representative activity canonicalizes | one call becomes one canonical action with linked samples/signals | Partial | source records correlate; central materializer not exercised |
| AS-12 | finding produced from sufficient evidence | admission, owner, dedup, close/reopen, evidence | Fail current sensor alone | only source signal; central/external evidence required |
| AS-13 | finding links to evidence | immutable source/evidence refs and receipt | Partial | hashes/IDs exist; no central finding/raw evidence system |
| AS-14 | outage lowers coverage without deleting inventory | health gap changes confidence, preserves entity | Fail | no durable health/materializer exercised |
| AS-15 | policy command reaches correct sensor | typed authenticated target command | Fail | no Starliner command channel |
| AS-16 | command effect observed | native read-back/runtime effect distinct from receipt | Fail | no command/effect contract |
| AS-17 | sensor version change visible | product/adapter/profile/runtime version/epoch | Partial | adapter/product config present; profile/epoch absent |
| AS-18 | unsupported version clear | reject/degrade with explicit coverage state | Partial | contract validation/disabled reasons; no central admission test |
| AS-19 | Direct allowed call observed | upstream true, success, labels, latency | Pass prototype | handler/mapper tests |
| AS-20 | Direct input DLP block observed | pre-upstream, block reason, upstream false | Pass prototype | golden trace and mapper tests |
| AS-21 | output block not described as prevention | post-execution, upstream true, output reason | Pass source semantics | mapping tests/source; product materializer untested |
| AS-22 | handler exception observed | converted failure creates action evidence | Fail | scheduling point bypass |
| AS-23 | OneMCP native tool observed | explicit surface/tool/action | Fail | deferred |
| AS-24 | resource/prompt/session lifecycle observed | typed records | Fail | deferred |
| AS-25 | evidence queue saturation visible durably | loss event survives process restart | Fail | process counter/log only |
| AS-26 | terminal payload removed | local terminal ledger has metadata only | Pass | repository tests |
| AS-27 | secrets/raw content absent | adversarial validation across every record/fixture | Partial | extensive unit/cert tests; no full live/privacy fuzz certification |
| AS-28 | production ingest authenticated | workload identity/receipt validated | Unresolved/Fail target | optional bearer transport only; no live ingest |
| AS-29 | multi-replica safe | sessions/locks/queue/idempotency certified | Fail | process-local state and SQLite topology |
| AS-30 | CI enforces sensor certification | default pipeline runs pinned trace pack | Fail | top-level tests excluded; Jenkins has no scoped test stage |

## Executable target trace packs

Required future packs:

- manifest/enrollment/version compatibility;
- backend/tool snapshot, update, delete, out-of-order, late, replay;
- Direct allowed/error/input block/output block/confirmation/legacy decision;
- handler exception and cancellation;
- OneMCP remote/native/resource/prompt/session/progress/cancel;
- privacy adversarial payloads and identifier/label leakage;
- outbox restart/crash/duplicate/conflict/partial ack/429/4xx/5xx/TLS/auth;
- disk capacity/terminal retention/operator replay;
- health heartbeat/stale/offline/recovery;
- typed command authorize/reject/idempotent/effect/rollback;
- single- and multi-replica topology;
- cross-sensor workflow→MCP→LLM correlation.


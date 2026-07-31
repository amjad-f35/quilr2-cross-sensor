# 26 — Runtime Verification

## Verification status

This sensor-intelligence pass is primarily a pinned-source static analysis.
It did not run a production endpoint, intercept real user traffic, terminate
real applications, connect to the live Quilr backend, or admit records into a
live Starliner environment.

| Evidence type | Status |
| --- | --- |
| Source commits | Reverified locally for all three repositories |
| Repository inventory/symbol analysis | Completed in the prior 1,265-path archaeology pass |
| Static source/config/schema/test search | Performed in both passes |
| Existing frontend build | Passed in prior archaeology pass |
| Go tests | Not run; Go unavailable |
| Rust builds/tests | Not run; Cargo/rustc unavailable and some build prerequisites absent |
| Swift runtime/build | Not run; endpoint extension needs Apple entitlements/signing/system-extension environment |
| Windows runtime/build | Not run; no Windows/WinDivert/SCM environment |
| Docker/integration backends | Not run; Docker unavailable |
| Live backend contracts | Not exercised |
| Live endpoint capture/coverage | Not observed |
| Live enforcement effects | Not observed |
| Sensor-intelligence CSV/YAML integrity | Validated locally with Python parsers |

Tool availability at this continuation:

| Tool | Result |
| --- | --- |
| `cargo`, `rustc`, `go`, `docker`, `pwsh` | unavailable |
| `node`, `npm`, `python3`, `swift` | available |

Availability does not imply that executing a platform runtime is safe or
representative. The proxy and monitor require privileges, certificates,
services, drivers/extensions, Persona/backend state and supported build
targets.

## Pinned source verification

| Repository | Verified commit |
| --- | --- |
| `sentinel-endpoint-agent` | `a022e52bf2fff6a9445ebad96c3afeaf277e259f` |
| `sentinel-dashboard` | `cd755d37c14b8b86623a15a4dbae41d33b226b2b` |
| `ipc-event-bus` current source | `0cf45bc50e4121d6a4521c58f1fa52a97c125e19` |
| IPC commit pinned by endpoint dependency | `9ce5b25131d7de8e9dbf2b8b4c2f32939c98e46b` |

`Contradiction:` the analyzed current IPC repository revision is newer than
the commit pinned by the endpoint. Platform integration must test the pinned
ABI and the intended upgrade independently.

## What static analysis verifies

Static evidence directly verifies:

- which source files, features, dependencies, routes, message types, fields and
  entry points exist;
- which branches return Allow/Block, retry, log, persist or drop;
- configured defaults and compile/feature gates;
- current serialization shapes and field transformations;
- call sites, registrations and repository-visible consumers;
- test declarations and checked CI commands;
- contradictions such as the dormant gRPC schema/code mismatch;
- missing common outbox/coverage/manifest contracts.

It does not verify:

- deployed configuration/feature flags;
- OS ACLs, entitlements, privileges and firewall;
- installed binary/artifact identity;
- live packet/filter/proxy route coverage;
- runtime parser output against actual user files;
- backend compatibility, latency or admission;
- final process termination effect;
- race frequency, throughput, resource use or crash recovery;
- actual data retention/access/deletion.

## Existing test evidence

The prior archaeology pass classified test declarations instead of treating
their presence as successful execution.

| Subsystem | Repository-visible tests | Important qualification |
| --- | --- | --- |
| System Monitor v2 | 283 declarations including six scanner integration tests | Three integration tests read developer-home state and can return early while appearing to pass |
| Proxy | 318 declarations across inline and integration roots | Some roots are undiscovered/feature- or platform-incompatible; no current execution |
| Core service integrations | 91 direct integration tests plus excluded helpers | Many assert retired service graph or suppress setup errors |
| Core scripting | seven local plus six monitor scanner integration tests | Rich graph/risk/conversion loss and active signature bypass are not covered |
| Template service | 27 automatic plus five ignored/manual | No full monitor-to-template runtime; many window/IPC/security paths uncovered |
| Diagnostics | five unit plus one live OpenSearch integration | Live test is not isolated and can match stale records |
| Endpoint infra | 47 inline tests | Linux selector reaches `todo!`; high-risk platform process/IPC paths uncovered |
| Email discovery executable | zero local declarations | Core has only partial related tests |
| Dashboard API | 15 Go test files | Go unavailable; six integration packages need ClickHouse |
| Dashboard frontend | no executable test suite found | Production TypeScript/Vite build passed in prior pass |

No checked endpoint production workflow contains an explicit comprehensive
Cargo test stage. The dashboard Jenkinsfile builds/pushes images without a test
stage; external reusable security workflow behavior is `Unresolved`.

## Current behavior requiring target runtime verification

### Process discovery and inventory

1. Poll a controlled process fixture with known start/exit/child timing.
2. Verify process-instance identity across PID reuse and sleep/wake.
3. Assert per-poll `CoverageRecord`.
4. Confirm process exit does not silently delete durable application inventory.
5. Exercise access-denied and partial enumeration.

### Lua/config/package discovery

1. Run every enabled parser against versioned normal/minimal/invalid fixtures.
2. Compare native emitted graph/risk/typed fields against adapter output.
3. Exercise missing roots, permission failures, unsupported schema and timeout.
4. Verify scan completeness is root/parser scoped.
5. Confirm raw secret values never enter output/logs.

### Hooks

1. Install into supported Cursor/Claude versions on both OS families.
2. Exercise every configured event shape, invalid JSON, oversize frame,
   concurrent sessions and queue saturation.
3. Verify current evaluator always Allows and does not overclaim enforcement.
4. Test socket/pipe peer restrictions and local spoofing.
5. Kill/restart hook manager and prove session/event loss and recovery behavior.
6. Verify integrity repair for valid modification, malformed JSON and
   permission denial.

### Proxy and redirectors

1. Build a protocol/route matrix: explicit HTTP, CONNECT, TLS interception,
   WebSocket, HTTP/2, macOS TCP/UDP, Windows TCP/UDP, IPv4/IPv6, bypasses and
   upstream proxy modes.
2. Measure captured, bypassed, unattributed, tunneled, dropped and reinjected
   traffic.
3. Exercise certificate trust/rejection and temp-file cleanup.
4. Verify health endpoint exposure under every bind configuration.
5. Validate macOS extension IPC/heartbeat and Windows tuple attribution under
   churn.
6. Demonstrate behavior when redirector/extension starts without proxy IPC.

### DLP/policy

1. Run normal, non-UTF8, prefilter-negative, oversize and parser-error content.
2. Verify exact heuristic labels and prove they are pattern names, not secret
   values.
3. Exercise remote 2xx/4xx/5xx/malformed/timeout and AI 401 paths.
4. Record primary/fallback/unavailable mode per request.
5. Exercise policy ready/not-ready/error/100 ms timeout and every action.
6. Verify `AllowPromptAfterRemovalOfSensitiveData` actual transport behavior;
   no redaction-forward claim is accepted from static naming.
7. Correlate request, detection, decision, UI response and observed local/
   upstream effect.

### Enforcement

1. Use controlled process trees with same-name unrelated processes.
2. Exercise macOS application quit, SIGTERM and SIGKILL stages.
3. Exercise Windows taskkill success, non-success, “not found,” permissions and
   descendants.
4. Re-enumerate after the final stage and record effect.
5. Test audit first response, retry non-success and transport failure.
6. Confirm Blocked and Quarantined have the same current termination effect.

### Delivery adapter/outbox

1. Append before returning from each asynchronous capture bridge.
2. Crash after append, before send, after send, before ack and while `in_flight`.
3. Prove deterministic ID/idempotency and duplicate/replay handling.
4. Exercise disk full, quota, corruption, partial write and key rotation.
5. Require per-record admission results; HTTP 2xx alone is insufficient.
6. Verify tenant switch, credential rotation and unsupported schema.
7. Validate the selected Starliner ABI for pre-resolution source observations.

## Runtime evidence record

Every executed scenario must capture:

- scenario/fixture version and source commit/build digests;
- OS/version/architecture and privilege mode;
- exact enabled feature/config/manifest;
- component start/readiness/self-test states;
- input and expected native output;
- observed native/adapter/platform output with IDs and times;
- logs/metrics/coverage/control results;
- redaction and protected-evidence outcome;
- cleanup and postcondition;
- pass/fail plus deviations.

The result should be checked in as a sanitized fixture/report, not summarized
only in prose.

## Static acceptance already performed for generated analysis artifacts

The analysis validators check:

- each CSV parses with one consistent header width;
- key ledgers have expected row/unique-ID counts;
- every native field has a platform and privacy disposition;
- YAML loads without syntax errors;
- fixture JSON will parse and match its declared status;
- Markdown links resolve locally;
- required deliverable names exist.

These checks validate documentation integrity, not endpoint runtime behavior.

## Runtime status conclusion

**Partial:** source-level behavior and test/CI reachability are deeply verified,
but production runtime claims remain bounded by the absence of supported build
toolchains, OS targets, privileges, live services and dynamic capture. Every
such limitation is carried into findings, coverage and MVS acceptance rather
than being silently treated as implemented.


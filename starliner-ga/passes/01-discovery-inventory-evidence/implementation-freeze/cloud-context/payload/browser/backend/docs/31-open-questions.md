# Open questions

> Profile: **Browser Backend / Browser Extension Service**  
> Pinned repository: `quilrbusiness/browser-extension-service@99e9599e1582184f5061492b430cd0b2af38d753`  
> Evidence classes are preserved from the reviewed source corpus. Proposed target behavior is not current behavior.

## Purpose and boundary

Records evidence that is absent from the pinned Browser Extension Service repository and therefore cannot be resolved statically.

## Verified findings

- **Verified:** Open questions are retained as explicit gaps with owners/validation paths.

## Unresolved or non-implemented behavior

- **Unresolved:** Production topology, proprietary library internals, secrets/config values, broker guarantees, DB constraints, and downstream consumers require external evidence.

## `gaps.csv`

Complete machine-readable ledger: [`gaps.csv`](../../../matrices/sensor-intelligence/browser-backend/gaps.csv) (6 rows).

| Gap ID | Gap | Evidence | Impact | Required change | Owner | Priority | Readiness effect | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G-003 | Untyped/unversioned browser event maps | Package/EventLogRequest variants lack native schema/version | Schema drift and unsafe mapping | Add schema_id/schema_version and per-record validators | Vanguard/BES adapter | P0 | Blocks certification | Unsupported-version/quarantine tests |
| G-010 | Heartbeat pre-publish store is process-local | ConcurrentHashMap in HeartbeatBucketService | Pod restart/multi-pod loss and fragmentation | Durable/shared bucket or direct outbox/Kafka per accepted heartbeat | BES | P0 | Health evidence blocker | Pod-kill/multi-pod test |
| G-011 | Heartbeat false publish can still delete bucket | Producer logs false; scheduler deletes after call | Silent heartbeat loss | Throw/return aggregate status and delete only confirmed success | BES | P0 | Reliability blocker | Producer false-return test |
| G-012 | Heartbeat DTO mismatch drops agentEnabled/extensionEnabled | Vanguard sends unknown fields; BES ignores unknown | Health loses enabled states | Align versioned request DTO and tests | Vanguard/BES | P1 | Minor sensor change | Contract round-trip test |
| G-019 | External extension-log-service contract/repository absent | Vanguard routes inventory there, not to analyzed BES | Inventory destination/storage/ack unresolved | Obtain repository/schema or tee inventory before external call | Architecture | P0 | Inventory integration blocker | Contract/runtime capture |
| G-020 | Legacy transformer path not reachable and required metadata unenforced | Private method no caller; 137 mappings | Cannot claim normalized transformation coverage | Keep migration-only or explicitly reactivate with validation/tests | BES | P2 | Does not block raw adapter | Call graph and integration tests |

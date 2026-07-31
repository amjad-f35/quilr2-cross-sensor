# Open questions

This ledger begins with unresolved boundaries inherited from the first pass.
Questions will be narrowed or closed only with source, test, runtime, contract,
or deployment evidence.

## Current implementation and ABI

1. `Verified in source:` the observe/certification path pins
   `starliner_contracts` commit
   `860079c312c13f842b5804a590fa1d5430860286`. `Unresolved:` which immutable
   version of the different legacy `starliner.adapters` SDK matches the pinned
   sensor source?
2. `Partially resolved:` the current mapper inputs and most pinned model fields
   have been traced. `Unresolved:` exact pinned `FindingSignal` enumeration and
   payload-safety validator source could not be read because their promised Git
   objects were absent from the partial local clone; current sensor tests cover
   the MCP signal shape and delivery validation behavior.
3. `Unresolved:` Is every current Starliner route and runtime mode enabled in
   production, and with what effective configuration?
4. `Unresolved:` Does any parent-repository code consume or mutate the sensor's
   Starliner outbox, terminal-delivery, or manifest state?

## Coverage and deployment

5. `Unresolved:` Are production gateway deployments single-replica, sticky,
   or horizontally scaled?
6. `Unresolved:` Which manifests start the workflow runner API, execution
   worker, retention worker, scheduler, and ClickHouse syncer?
7. `Unresolved:` Which MCP clients and servers can bypass this gateway?
8. `Unresolved:` What production retention and recovery policies apply to
   SQLite, workflow artifacts, logs, events, and outbox rows?

## Delivery, trust, and control

9. `Unresolved:` What workload identity, certificate, or bearer mechanism
   authenticates current production telemetry delivery?
10. `Unresolved:` What central acknowledgement and replay semantics are
    required beyond the current per-record HTTP response handling?
11. `Unresolved:` Is legacy central pre-tool evaluation enabled in production,
    and which failure-open/failure-closed mode is intended?
12. `Unresolved:` Which platform-to-sensor commands are approved for the first
    release, and which native effect checks can actually verify them?

## Product and privacy

13. `Unresolved:` Which tenants permit argument/result content capture, and
    what local privacy configuration is authoritative?
14. `Unresolved:` What customer-visible retention and evidence-access policy
    applies to tool arguments, results, memory content, identities, and logs?
15. `Unresolved:` Which external source owns human, account, agent, model,
    workload, subscription, and credential identity for correlation?

## Corpus/versioning

16. `Unresolved:` The local `docs/quilr2-cross-sensor` repository is based on
    commit `513d60d3...`, but `README.md` is modified and `starliner-ga/` is
    untracked. Is this exact working tree the release-frozen target?
17. `Unresolved:` Is `project-starliner-audit@b747393...` the intended
    implementation authority for the adapter, or only an audit/reference
    implementation?

18. `Unresolved:` Does the central ingest treat an idempotency-key replay with a
    different body hash as a conflict? The local outbox silently retains the
    first body and counts the later enqueue as a duplicate.
19. `Unresolved:` Is the public, unauthenticated
    `GET /starliner/manifest` endpoint intended for production exposure?
20. `Unresolved:` Should exceptions converted by
    `MCPHandler.handle_request()` be observed? The scheduling point is inside
    the `tools/call` dispatch branch, so exceptions handled by the outer
    `except` clauses return a `ToolCallResult` without invoking the observe
    hook.

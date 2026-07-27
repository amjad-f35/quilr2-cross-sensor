# Analysis state

## Status

**Complete for the supplied analysis-document boundary.** The canonical architecture and mandatory continuous-identity addendum, machine-readable contracts, field ledger, resolution rules, relationship/event/finding/metric catalogs, IAM/workload/delegation/provenance model, current-to-target mapping, migration, MVS, scenarios, examples, and coverage audit are present and cross-validated.

## Completed inputs

- 121 Browser extension / native host / Browser Extension Service analysis documents.
- 110 endpoint-agent / endpoint dashboard / IPC analysis documents.
- 64 LLM/DLP gateway analysis documents.
- 124 Quilr 1 web/query-builder analysis documents.
- Total: 419 documents, all `Analyzed` in `matrices/input-coverage.csv`.

The source analyses themselves account for 1,226 browser-system files, 1,265 endpoint analysis records, 1,030 gateway files, and 2,903 Quilr 1 files.

## Verified source families

- Browser extension, browser native host, Browser Extension Service.
- Endpoint System Monitor v2, proxy/DLP, IDE hooks, Persona/email discovery, diagnostics, dashboard/API.
- LLM/DLP gateway, detector/model workers, Endpoint Config Manager, gateway-health probes.
- MCP Gateway external contract as evidenced by current frontend/query-builder integration only.
- Quilr 1 query-builder/ClickHouse/Neo4j/Redis aggregation paths.
- Identity/IdP and SaaS connector boundaries as evidenced external integrations, with source contracts unresolved.

## Canonical status

- Canonical entity types: 54.
- Entity types with an identity rule: 54.
- Relationship types: 64.
- Event types: 75.
- Finding types evaluated: 119.
- Metrics: 33.
- Source field rows: 578.

## Continuous identity addendum status

- Canonical entity types evaluated: 54/54.
- Continuous-identity extension types added/evaluated: 64/64.
- Total identity types evaluated: 118.
- Sensor/source profiles evaluated: 17/17.
- Identity identifier namespaces: 34.
- Identifier strength rules: 30.
- Field authority rules: 30.
- Identity event types: 82.
- Identity finding types: 80.
- Identity metrics: 29.
- Golden identity scenarios: 71/71.
- Final identity validations: 40/40 represented in the target design.
- Identity schemas: 11.
- Identity matrices: 28.

The addendum separates verified current behavior from target design. Workload identity, complete agent/runtime attribution, signed provenance, credential brokering, and authoritative external identity reconciliation are target/integration work—not claims of current production implementation.

## Known contradictions carried forward

- Endpoint System Monitor UUIDs can collide across same-name entity kinds; MCP IDs omit parent application and transport.
- Endpoint conversion discards raw Lua relationships, composite risk, and rich fields.
- Endpoint application exit does not make the stored application inactive as its documentation claims.
- Browser native file scan results can be associated to the wrong file in mixed batches because correlation is positional.
- Browser Extension Service transformation `required`/type metadata is descriptive and not enforced.
- LLM Gateway all-in-one deployment omits some workers/services launched in development.
- Quilr 1 frontend/backend contains route mismatches, and source-specific API composition remains.
- Quilr 1 graph authority, graph-to-warehouse consistency, and a global interaction-source definition remain unresolved.

## Pending external evidence

- MCP Gateway source repository, schemas, and real payloads.
- Authoritative live IdP/HR and connector contracts.
- Production ClickHouse/Neo4j/PostgreSQL/Redis schemas, drift, retention, grants, and volumes.
- Provider billing/region/account APIs.
- Stable agent definition/version/deployment/run/step telemetry.
- Tool call/result/effect and authorization/delegation telemetry.
- Outcome verification and certification/artifact attestation.
- Workload identity authority, runtime attestation, trust-domain/federation state, and credential renewal/revocation evidence.
- Build identities, immutable production artifact digests, signatures, provenance, release manifests, and runtime artifact verification.

## Files created

- 45 numbered narrative documents plus this state file and README.
- Seventeen schemas, including 11 identity contracts.
- Forty-three matrices, including 28 identity matrices.
- Five worked examples.
- Two deterministic artifact generators and two generated count files.

## Next exact task

No required consolidation work remains. Before implementation, resolve the P0 decisions in [open questions](23-open-questions.md) and [identity gaps](matrices/current-identity-gaps.csv), then freeze version 1 of the observation, canonical-ID, actor-chain, credential-grant, event, and evidence contracts.

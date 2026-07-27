# Minimum viable system

## MVS objective

Prevent source fragmentation, present one evidence-backed estate, and produce a small set of trustworthy actionable findings. Structural correctness outranks catalog breadth.

## Launch requirements

1. Source registry and versioned adapter contract.
2. Immutable raw/evidence store and access/retention policy.
3. Source observation schema and replay.
4. Curated product/surface/provider/model seed catalog.
5. Operational canonical entity/identifier/provenance/bitemporal schema.
6. Entity-specific resolver with confidence/non-merge rules.
7. Resolution Center with manual merge/split/replay.
8. Entity and relationship materializers.
9. Canonical event envelope and browser/endpoint/LLM adapters.
10. Coverage/freshness/capability materializer.
11. Basic root-cause finding materializer and workflow.
12. Canonical metric materializer for estate/adoption/coverage.
13. Unified Estate, Findings, Activity, Coverage, and Resolution APIs.
14. Minimal product surfaces for those APIs.
15. Backfill/dual-read/reconciliation for Quilr 1.
16. Tenant isolation, audit, watermarks, DLQ, schema/version observability.

## Launch source scope

- Browser extension + native host + BES.
- Endpoint System Monitor discovery/sync and device/sensor health.
- LLM Gateway model invocation/DLP/usage.
- Quilr 1 applications/users/devices/interactions/alerts/status/audit backfill.
- MCP endpoint-discovery observations marked partial; external MCP call semantics excluded until contract.

## Launch canonical scope

- AI Product, Application Surface, Tenant Application, Installation, Application Account when evidenced.
- Human User, Device, Sensor, Enforcement Point.
- Model Provider/Family/Version/Deployment/Route.
- Agent Definition as observed/configured with explicit low/medium confidence; no run claims without run IDs.
- MCP Client/Server Deployment/Tool as observed configuration with source limitations.
- Policy/Decision/Evidence/Finding.

## Launch findings

Keep the launch set small:

- unmanaged/new/unknown/conflicting/duplicate application;
- low-confidence merge;
- unowned/stale/retired-but-active asset;
- unapproved widely adopted application;
- unapproved model and unattributed model invocation;
- unmanaged endpoint-discovered MCP server;
- sensitive data to unapproved app;
- secret/credential in prompt;
- policy conflict/no enforcement point/coverage gap;
- stale sensor/partial source sync/materializer lag/evidence incomplete;
- orphaned gateway API key;
- policy decision not explainable;
- current-state-only audit/relationship assurance gap.

Each launches only if its catalog row’s required data and admission test pass.

## Launch metrics

- canonical products and tenant application instances;
- unmanaged/unowned/stale/duplicate candidates;
- assets by healthy source coverage;
- active/repeat users;
- browser vs API and managed vs unmanaged usage;
- model-call success;
- sensor/materializer freshness;
- unresolved identity matches;
- spend by canonical product/model and unallocated spend where cost exists.

## Next phase

- authoritative MCP adapter and tool/action findings;
- IdP/HR and connector/account/OAuth integration;
- stable agent version/deployment/run/step;
- policy/approval/exception unification;
- model deployment/region/route details;
- credential fingerprint/owner lifecycle;
- data catalog identity;
- provider billing.

## Future hardening

- action-effect reconciliation;
- outcome/value verification;
- certification/artifact attestation;
- behavior sequence analytics;
- regulated-region/retention/memory findings;
- verified savings;
- automated catalog promotion/rebrand governance;
- cross-region/disaster recovery and cryptographic source attestation.

## Non-goals

- exposing every raw field in default UI;
- migrating every alert as a finding;
- making Neo4j or ClickHouse the canonical operational store;
- adding hundreds of speculative findings;
- claiming MCP/account/agent-run certainty from names;
- replacing all legacy APIs before dual-read evidence passes.

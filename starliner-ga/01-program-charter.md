# Program Charter

## Mission

Build and migrate to a GA enterprise platform that continuously discovers and resolves the AI estate; correlates real activity; produces defensible, coverage-aware insights; enables policy and remediation; and verifies outcomes.

## Customer outcomes

### Outcome O-01 — One estate

The same tenant application observed by multiple sensors appears once, with separate surfaces, accounts, installations, observations, confidence, and history.

### Outcome O-02 — Agentic visibility

Customers can inventory agents, versions, deployments, models, MCP servers/tools, permissions, repositories, credentials, and runtime activity without treating names as identity.

### Outcome O-03 — Actionable risk

Signals are grouped into a small number of findings that explain condition, impact, evidence, missing coverage, owner, and recommended action.

### Outcome O-04 — Trustworthy analytics

Overview and analytics use canonical entities/events and coverage denominators, not sensor-row counts.

### Outcome O-05 — Governed control

Policies are versioned, simulated, approved, distributed, evaluated, and tied to every decision. Commands are authorized, idempotent, observed, and verified.

### Outcome O-06 — Enterprise assurance

Tenant isolation, privacy, identity, release provenance, retention, legal hold, backup, DR, and audit satisfy selected deployment-tier GA gates.

## Product surfaces

Primary:

```text
Overview
Inventory
Insights
Analytics
Policies
```

Inventory:

```text
Applications | Agents | Models | MCP & Tools
```

Permissioned/operator:

```text
Activity | Coverage | Resolution Center | Evidence | Administration
```

## GA scope

Included:

- Browser extension/native-host and browser-service observations under distinct producer profiles and relay lineage
- Endpoint discovery, process/network/DLP/hook activity, and health
- LLM Gateway model invocation, tools, DLP/Guardian, usage, cost inputs, and health
- MCP discovery/call semantics after its source profile passes certification
- Quilr 1 applications, users, devices, interactions, findings/status/audit/compliance as backfill observations
- IdP/SCIM/HRIS and selected enterprise integrations under role-specific discovery, telemetry, control, or response contracts
- Canonical catalog, identity, estate, relationships, activity, findings, metrics, policy, actions, and evidence
- Tenant-cell architecture compatible with shared, dedicated, and on-prem profiles; the launch profile remains `NEEDS_INPUT` and each advertised profile has an independent gate

Deferred but schema-compatible:

- Air-gapped operations
- Deployment profiles not selected for launch
- Hardware-backed attestation for every endpoint
- Full business-outcome verification for every agent task
- Global automatic catalog promotion from tenant-private observations
- Autonomous remediation without explicit policy/approval eligibility

## Success metrics

The program reports:

- canonical inventory precision and reviewed false-merge rate;
- percentage of selected entities with explainable field lineage;
- source coverage and stale-source rate;
- finding precision, duplicate rate, mean time to owner/action/close, and reopen rate;
- policy decision explainability and effect-verification rate;
- canonical/API freshness and projection lag;
- tenant-isolation, privacy, and security gate results;
- migration discrepancy closure and legacy dependency retirement;
- adoption, customer workflow completion, and verified savings where supported.

## Operating principles

1. Evidence before conclusions.
2. Canonical identity only in the central tenant cell.
3. Unknown is not safe, absent, approved, or zero.
4. Configuration is not runtime use.
5. A command receipt is not an effect.
6. Product copy cannot exceed evidence admission.
7. Internal complexity is hidden behind stable customer objects and workflows.
8. Every release is production-operable; no test-only architecture enters the critical path.
9. Architecture changes require ADRs and migration plans.
10. Runtime values are never invented.

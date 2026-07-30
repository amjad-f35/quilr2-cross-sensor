# Observability, Incident Response, and Support

Status: **normative**

## Observability principles

- Instrument customer outcomes and data correctness, not only service uptime.
- Preserve tenant isolation and privacy in telemetry.
- Use bounded-cardinality attributes.
- Link evidence, canonical mutation, projection, API, decision, command, and workflow through safe correlation IDs.
- Propagate trace context only across causal transactions.
- Every alert has an owner, severity, runbook, and customer-impact statement.

## Required telemetry

### Metrics

Rates, errors, latency, saturation, queue depth/age, watermarks, rejections, coverage, resolution quality, projection parity, command/effect state, and SLO/error-budget burn.

### Logs

Structured event name, time, service/version, region/cell, safe tenant token, request/correlation ID, outcome, error code, and bounded context. No secret or normal restricted content.

### Traces

Ingest request, canonical transaction, interactive API, policy decision, command dispatch, and connector calls where causal tracing is meaningful. High-volume scans and independent evidence use observation/reconciliation IDs.

### Audit

Separate immutable security and customer-action ledger, not a debug log.

## Data-quality observability

Dashboards and alerts cover:

- producer/source freshness and expected population;
- snapshot completion and count drift;
- unknown schema/enums;
- normalization quarantine;
- identity conflict/false-merge indicators;
- materializer lag and replay divergence;
- read-model parity;
- finding admission volume and precision proxies;
- metric coverage and restatements;
- workflow and effect verification.

## Incident classification

- security/privacy;
- cross-tenant or authorization;
- durable data loss/integrity;
- control safety;
- widespread availability;
- partial feature/regional degradation;
- data freshness/correctness;
- connector/source-specific;
- support issue without service incident.

Cross-tenant exposure, secret leakage, unintended control, and durable evidence loss are critical regardless of request volume.

## Response

1. detect and declare;
2. assign incident command and domain leads;
3. contain with documented kill switches;
4. preserve evidence and audit;
5. assess tenants, regions, data, and control impact;
6. communicate under the incident policy;
7. restore the safest authoritative path;
8. validate correctness and backlogs;
9. remediate and produce a blameless review;
10. track prevention work to closure.

## Kill switches

Independently controlled switches exist for:

- sensor/profile admission;
- schema/normalizer/resolver/materializer release;
- insight definition;
- policy bundle;
- command type or all new commands;
- connector;
- export/evidence access;
- deployment cohort.

Disabling control should not disable visibility.

## Runbook minimum

Each service and critical data flow documents:

- symptoms and customer impact;
- dashboards and queries;
- dependencies and authority;
- safe diagnostic steps;
- mitigation and rollback;
- data-integrity validation;
- backlog/catch-up behavior;
- escalation;
- customer communication triggers;
- recovery completion criteria.

## Support model

Support sees safe tenant health and diagnostics by default. Elevated access requires purpose, approval, bounded duration, and audit. Support tools never expose unrestricted cross-tenant search or arbitrary production SQL.

## Readiness

GA requires staffed ownership, escalation paths, incident exercises, game days, on-call access, runbook validation, status-page integration, customer communication templates, and post-incident governance.

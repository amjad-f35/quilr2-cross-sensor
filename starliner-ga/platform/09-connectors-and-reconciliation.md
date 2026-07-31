# Enterprise Connectors and Reconciliation

Status: **normative**

## Purpose

External systems provide identity, ownership, population, approval, billing, and configuration facts no Quilr-owned sensor can observe. Managed connectors bring those facts into the same evidence and resolution plane.

This document specifies discovery/reconciliation behavior. The authoritative separation among runtime sensor, discovery, telemetry-import, control, and response roles is in [Integration Role Taxonomy](11-integration-role-taxonomy.md). A connector package may implement several roles only with role-bounded credentials, queues, health, certification, and authority.

## Initial connector families

- IdP and directory;
- HRIS;
- MDM/UEM;
- CMDB and asset inventory;
- cloud provider and Kubernetes inventory;
- SaaS admin APIs;
- agent platforms and AI application builders;
- CI/CD, build runners and ephemeral workload identity;
- external LLM/agent observability and trace systems;
- SIEM, SOAR, CASB/SSE and AI-SPM security systems;
- AI provider organization, usage, and billing APIs;
- ticketing and workflow systems;
- CRM and business application platforms;
- data catalogs/DLP classifications;
- Quilr 1 import and coexistence.

Each connector ships only when there is a supported source profile, security review, scale test, and operational runbook.

## Runtime model

Connectors run as tenant-cell managed workers. They use the Starliner profile and record contracts but not an edge WAL on customer devices. Their durable cursor, webhook receipt log, rate-limit state, and source snapshot state are held regionally.

## Authentication

- Prefer OAuth/OIDC or source-native workload federation.
- Use least-privilege scopes.
- Encrypt credentials with tenant- and region-bound keys.
- Separate credential metadata from secret material.
- Audit creation, use, rotation, failure, and deletion.
- Support customer-managed credential rotation.
- Never copy source secrets into evidence.

## Reconciliation state machine

```text
configured
  -> authenticating
  -> initial_snapshot
  -> current
  -> degraded | paused
  -> resyncing
  -> disconnected
```

Every run records scope, pages, counts, cursor, source watermark, start/end, partial failures, throttling, and completeness. Absence conclusions require a completed authoritative snapshot.

## Webhooks and polling

- Webhooks are authenticated, replay-protected, durably received, and idempotent.
- Polling uses incremental cursor APIs where reliable.
- Periodic full reconciliation detects missed webhooks and source resets.
- Backfill is independently rate-limited.
- Source rate limits do not block unrelated tenants.
- Cursor invalidation triggers a controlled resnapshot.

## Identity and population

Connectors never directly mutate product rows. They create source evidence and normalized claims. For example:

- IdP: user/service-principal identity and account state;
- HRIS: employment and organizational relationships;
- MDM: expected device population and management state;
- CMDB: business owner and service relationships;
- provider API: model deployments and billed usage;
- agent platform: agent definitions, deployments, tools, models, owners and lifecycle;
- CI/CD: pipeline/job/runner identity, ephemeral agent runtime and produced artifact relationships;
- external observability: trace/run/session/tool/model activity with declared sampling and retention;
- AI-SPM/CASB: source-native assets, posture, findings and policy/control state with explicit external authority;
- SIEM: imported security events or exported Quilr records under separate telemetry/export roles;
- ticketing: external workflow references and status.

## Deletion and disconnect

Disconnect stops future collection but does not silently erase historical evidence or canonical state. The UI previews:

- affected coverage and findings;
- retention consequences;
- credentials to revoke;
- in-progress workflows;
- reconfiguration required for another connector.

Data erasure follows retention and legal-hold policy.

## Connector operations

Operators can inspect safe status, last success, next run, cursor age, rate-limit state, scope changes, object counts, rejection reasons, and coverage. Raw external records require a separate evidence access permission.

## Certification

Certification covers source API version drift, pagination, webhook replay, cursor reset, tenant scale, throttling, partial permissions, credential expiry, data deletion, privacy, regional routing, and source-specific semantic fixtures.

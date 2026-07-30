# Security Architecture and Threat Model

Status: **normative**

## Security objectives

1. No cross-tenant evidence, identity, policy, or control access.
2. No secret or unrestricted content in normal telemetry.
3. Only authenticated, certified producers can submit evidence or receive commands.
4. Only authorized actors and services can change policy, identity, workflow, or control state.
5. Evidence provenance and material administrative actions are auditable.
6. A compromised component has bounded blast radius.
7. Recovery does not weaken security or retention controls.

## Protected assets

- customer source evidence and restricted content;
- canonical estate and activity;
- identity claims and organizational mappings;
- policies, exceptions, decisions, approvals, and commands;
- credentials, keys, trust anchors, and signing identities;
- software artifacts and provenance;
- billing/cost data;
- audit and legal-hold state;
- tenant routing and residency metadata.

## Trust boundaries

```text
native source
  | adapter privilege boundary
edge runtime
  | workload identity + network boundary
regional ingest
  | evidence/canonical processing boundary
tenant cell services and stores
  | product API authorization boundary
customer user/integration

global control metadata
  | strict residency and deployment boundary
tenant cell
```

The telemetry and command channels are separate trust paths.

Component boxes are not sufficient security boundaries. The required actor inventory, privilege/action record, separation rules, failure posture, and signing-incident treatment are specified in [Actor Security and Authority Model](07-actor-security-and-authority-model.md).

## Principal threats and controls

| Threat | Primary controls |
|---|---|
| Producer impersonation | workload identity, short-lived credentials, tenant/profile binding, rotation/revocation |
| Replay or record substitution | sequence epochs, stable record IDs, digests, idempotency, signed/authenticated receipts |
| Secret/content leakage | safe-fact boundary, schema classification, local privacy engine, ingest DLP/quarantine, separate content grants |
| Cross-tenant access | cell/database/index isolation, tenant-bound identity, authorization middleware, cache partitioning, tests |
| Canonical poisoning | source authority catalog, claim provenance, resolver constraints, review, rollback |
| Confused-deputy command | target/capability binding, policy/approval references, local verification, typed commands |
| Supply-chain compromise | signed artifacts, provenance, SBOM, dependency policy, staged release, revocation |
| Insider evidence access | least privilege, just-in-time purpose grants, field controls, audit, anomaly monitoring |
| Projection tampering | canonical authority separation, transactional outbox, rebuild and comparison |
| Data deletion abuse | approvals, legal-hold check, delayed/recoverable workflow, immutable audit |
| Availability attack | per-tenant quotas, cell isolation, backpressure, circuit breakers, capacity reserve |
| Model/detector abuse | versioned logic, shadowing, impact limits, explanation, rollback |

## Identity and access

- Customer users authenticate through OIDC/SAML federation; lifecycle through SCIM where supported.
- Strong authentication is required for high-impact actions.
- Services use workload identities, not shared permanent tokens.
- Authorization combines role, tenant, environment, business scope, entity sensitivity, purpose, and action.
- Support access is just-in-time, customer/contract controlled where applicable, time-bounded, and audited.
- Evidence and restricted-content access are separate privileges.
- Break-glass is monitored and reviewed.

## Cryptography and key management

- TLS is required for all service and edge transport.
- Data at rest is encrypted; higher-sensitivity material supports separate keys.
- Keys are region- and tenant/cell-bound according to the deployment profile.
- Signing, encryption, workload identity, and content-grant keys have separate purposes.
- Rotation, revocation, recovery, and destruction are tested.
- Algorithms and minimum versions are set by the security standard and crypto-agility register, not hard-coded in prose.

## Application security

The implementation uses:

- parameterized access and safe serialization;
- centralized authorization and tenant context;
- output encoding and CSRF protection for browser flows;
- SSRF protections for connectors and webhooks;
- bounded parsing and decompression;
- file/export malware and content handling;
- secrets scanning and dependency controls;
- tamper-evident audit;
- abuse/rate protection;
- secure defaults and minimized debug information.

## AI-specific risks

Customer-controlled labels, model/tool descriptions, MCP schemas, prompts, and tool results are untrusted data. They cannot become system instructions, execute in support tooling, or influence privileged automated action without typed validation and policy. Generated summaries link to source facts and cannot authorize control.

## Assurance

Threat modeling occurs per material design change. GA requires architecture review, code review, automated security testing, penetration testing of tenant/control boundaries, privacy assessment, incident runbooks, vulnerability response, and evidence that critical findings are resolved or explicitly accepted by accountable authority.

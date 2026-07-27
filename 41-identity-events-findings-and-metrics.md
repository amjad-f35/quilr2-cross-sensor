# 41. Identity events, findings, metrics, services, and product

## Events

The addendum defines 82 canonical identity events across:

| Category | Examples |
| --- | --- |
| Discovery/resolution | observed, candidate, resolved, verified, attested, merge, split, conflict, stale, reappeared |
| Human/account | person/account changes, membership/role, session lifecycle |
| Non-human | service-account rotation/revocation, workload attestation/credential, agent deploy/runtime |
| Credential/key | issue/use/rotate/expire/revoke/replay, secret/key/certificate lifecycle |
| Delegation | create/attenuate/use/child/expire/revoke |
| Artifact/provenance | source, build, sign, verify, release, deployment, runtime match/mismatch |
| Federation | create, metadata/bundle change, failed verification, expiry/revoke |

The complete taxonomy and replay rules are [identity-events.csv](matrices/identity-events.csv).

Every event includes:

```text
event ID/type/schema
tenant
canonical subject and source-native ID
actor chain where consequential
occurred/observed/ingested time
valid interval where stateful
source/sensor identity and sequence
evidence reference
correlation/idempotency key
```

An event says what happened. It is not itself a finding.

## Findings

The addendum evaluates 80 identity findings:

| Category | Examples |
| --- | --- |
| Human/account | unresolved person, bad merge, email reassignment, leaver/guest/privileged orphan, issuer/audience mismatch |
| Agent | missing stable/version/artifact/deployment/owner/runtime/delegation identity |
| Workload | unverifiable/shared/cross-tenant/expired/failed/mismatched runtime |
| Model | unresolved alias, unapproved change, missing account/owner/digest/adapter/workload |
| Application/account | duplicate/bad merge/account type/subscription/owner/display-name/domain |
| MCP/tool/connector | unverifiable server, ambiguous/schema-changing tool, unattributed connection/client/call |
| Credential/secret | long-lived/unowned/no-expiry/shared/orphaned/outside-manager/replay/untrusted/expired |
| Artifact/provenance | missing digest/provenance/signer/trust, source/build/release/deployment/SBOM mismatch |
| Sensor/evidence | unauthenticated sensor, unknown version, invalid signature/certificate/tenant/snapshot |

Each definition contains the condition, observations, identities, relationships, confidence, evidence, owner, action, close/reopen rule, product location, and current producibility in [identity-findings.csv](matrices/identity-findings.csv).

### Materialization rule

```text
identity observations/events/claims/proofs
→ required source coverage check
→ identity/relationship/event correlation
→ condition evaluation
→ confidence and severity
→ dedup lineage
→ owner/action routing
→ evidence snapshot
```

Unknown required coverage produces `not_evaluable`, not “no finding.”

## Metrics

The 29 decision-supporting metrics cover:

- canonical identity and actor-chain coverage;
- agent/workload/artifact/provenance/delegation completeness;
- ownership and credential-expiration coverage;
- unresolved/conflicting/duplicate/orphaned/stale identities;
- expired/shared/unowned/mutable/unattributed conditions;
- resolution, revocation, leaver, rotation, synchronization, attestation, and verification lag.

Every metric defines numerator/denominator or duration population, unknown handling, dimensions, drill-down, availability, and decision supported in [identity-metrics.csv](matrices/identity-metrics.csv).

Unknown records are excluded from compliant numerators and shown separately.

## Required logical services

The minimum logical plane contains:

1. Identity Observation Ingestor
2. Canonical Identity Registry
3. Identifier and Alias Registry
4. Identity Resolution Engine
5. Identity Reconciler
6. Federation Registry
7. Workload Identity Service/integration
8. Runtime Identity Binder
9. Credential Broker
10. Secret Inventory Adapter
11. Access Graph Materializer
12. Artifact and Provenance Registry
13. Identity Context Assembler
14. Revocation and Status Service
15. Identity Evidence Store
16. Identity Search Projection

Inputs, outputs, priority, and build/integration disposition are in [identity-service-catalog.csv](matrices/identity-service-catalog.csv).

## Minimum product surfaces

### Identity & Authority Overview

Coverage, incomplete actor chains, unresolved/conflicting identities, orphaned non-human identities, stale workloads, expiring credentials, delegation changes, and material findings.

### People & Accounts

People, employment, accounts, groups, roles, sessions, authentication, link evidence, ownership, and lifecycle.

### Agents & Workloads

Agent definition/version/deployment, artifact/config, workload/instance, attestation, credential, owner, recent runs/actions.

### Non-Human Identities

Service accounts, OAuth clients, workloads, connectors, sensors, build/deploy identities, permissions, credentials, last use, review, and revocation.

### Delegations and Effective Access

Plain-language authority paths with parent/child constraints and current use.

### Credentials & Secrets

Metadata only: owner, issuer, consumer, age, expiry, rotation, status, last use, and approved storage.

### Federation & Trust

Issuers/trust domains/anchors/audiences/mappings/key rotation/verification and dependent identities.

### Artifact & Provenance

Repository/Git/SWH source, build, artifact digest, signature, provenance, release, deployment, runtime, certification.

### Resolution Center

Candidates, conflicts, negative matches, merge/split history, source evidence, and manual operations.

Raw cryptographic and sensitive evidence is hidden by default and available only through privileged drill-down.


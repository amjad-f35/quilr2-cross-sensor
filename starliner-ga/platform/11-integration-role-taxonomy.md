# Integration Role Taxonomy

Status: **normative**

## Decision

An integration is classified by the authority and behavior it provides, not by vendor, repository, or transport. One product package may implement multiple roles, but each role has a separate manifest section, permission set, certification scope, runtime health, and product claim.

## Roles

| Role | Purpose | Typical direction | May provide | Must not imply |
|---|---|---|---|---|
| Runtime sensor | observes or enforces in the action runtime | edge → platform; control → edge where certified | source observations, action/effect facts, local health | enterprise completeness, owner, or global identity |
| Discovery connector | reconciles authoritative/configured populations and objects | external source → platform | snapshots, lifecycle, ownership/config claims, coverage denominator | runtime use or execution |
| Telemetry importer | imports historical or external activity/measurements | external log/stream → platform | time-bounded activity, measurement, source status | live enforcement or complete inventory |
| Control/PEP connector | applies a typed authorized action at a native control point | platform → target; effect → platform | policy/config deployment, suspend/block/quarantine, native result | verified effect until postcondition passes |
| Response connector | coordinates human or downstream workflow | platform ↔ workflow system | tickets, notifications, approvals, external status references | canonical finding/workflow authority |
| Export connector | publishes authorized Quilr evidence, activity, findings or posture to a downstream security/data system | platform → external sink; receipt → platform | filtered versioned exports, delivery status, downstream object references | downstream acknowledgement as canonical truth or proof of downstream action |

Quilr 1 compatibility is a discovery/telemetry migration source. It is not a runtime sensor or canonical authority.

## Multi-role integrations

If an IdP integration imports users and disables an account, it contains:

- a discovery connector role for directory reconciliation;
- a control connector role for account disable;
- optionally a response role for approval/ticket coordination.

Compromise or degradation of one role MUST NOT automatically grant or degrade the other role. Credentials, scopes, queues, health, rate limits, and kill switches are role-bounded.

## Role manifest

Every role instance declares:

- role and profile/version;
- tenant, environment, region, and source instance;
- authenticated workload and artifact identity;
- native API/protocol versions;
- requested and admitted capabilities;
- read/write scopes and target restrictions;
- data classes and privacy behavior;
- cursor, watermark, snapshot, event, or command semantics as applicable;
- idempotency and replay model;
- failure, throttle, partial-permission, and disconnect behavior;
- health, freshness, completeness, certification, and support matrix;
- owner, runbook, rotation, and revocation.

No connector may report an admitted certification, assurance, confidence, or coverage state merely by placing it in a payload. The platform derives admitted state from registry, runtime proof, reconciliation, and certification evidence.

## Discovery connector contract

A discovery connector:

1. durably records webhook receipt or poll run;
2. scopes every run to one tenant/source instance;
3. maintains cursors, source watermarks, pagination, and reset state;
4. distinguishes complete snapshot, incremental delta, and partial failure;
5. emits source records and claims, never canonical mutations;
6. does not infer absence until an authoritative snapshot is complete;
7. periodically reconciles to detect missed deltas and source resets;
8. records permission/scope changes that alter coverage.

## Telemetry importer contract

A telemetry importer declares:

- time semantics and source clock;
- duplicate/reorder behavior;
- known sampling/loss;
- backfill watermark;
- actor/resource identifiers and limitations;
- cost/usage provenance;
- whether data is live, delayed, or historical;
- retention and source deletion semantics.

Historical telemetry cannot silently become current presence, and source event count cannot become an enterprise denominator without coverage.

## Control connector contract

A control connector implements only registered typed commands. It verifies:

- command signature, tenant, target binding, expiry, nonce, capability, policy/approval authority, and preconditions;
- native retry versus transport retry;
- exact native request and privacy-safe result classification;
- idempotency and safe cancellation;
- direct and independent verification policy;
- blast-radius limit and kill switch.

Read credentials and write credentials are separated wherever the source supports it.

## Response connector contract

A response connector may create/update tickets, send notifications, request approvals, and import external workflow state. The canonical case retains:

- external system and object reference;
- request and response identity;
- last synchronized state and watermark;
- conflict rule and authority boundary;
- retry and human-resolution state.

Deleting or closing an external ticket does not delete or resolve a canonical finding unless the governed workflow transition passes.

## Export connector contract

An export connector publishes only an authorized, versioned product contract.
It declares:

- source projection generation and watermark;
- tenant, scope, field set and field-classification policy;
- destination instance, stream/index/table and schema version;
- batching, retry, ordering, idempotency and dead-letter behavior;
- destination acknowledgement and independently observed delivery status;
- redaction/tokenization applied before egress;
- retention, replay and customer disconnect semantics.

SIEM, security data lake, SOAR, CASB and external AI-SPM export packages use
this role. A delivery acknowledgement is an export receipt; it does not make
the destination an authority for Quilr canonical entities, findings or policy
effects.

## Connections administration

The customer-facing admin surface shows:

- role(s), source, environment, and scope;
- credential posture without secret material;
- last complete snapshot/import/control/response;
- cursor/watermark/freshness and partial failures;
- supported capabilities and admitted certification;
- affected coverage and product features;
- rate limit/backlog;
- safe diagnostics, rotation, pause, resync, disconnect, and revocation.

Connections is an administration/operator capability, not a replacement for canonical Inventory.

## Candidate families

IdP, HRIS, MDM, CMDB, cloud, Kubernetes, SaaS admin, AI-provider
organization/billing, data catalog, CI/CD, ticketing/CRM, Slack/email,
SIEM/SOAR, CASB/SSE, AI-SPM, external observability and provider-specific agent
platforms are prospective families. None is launch scope until `NI-012` and
the role-specific source profile, security, scale, certification, and support
gates are approved.

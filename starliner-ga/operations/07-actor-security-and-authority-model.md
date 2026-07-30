# Actor Security and Authority Model

Status: **normative**

## Principle

Security boundaries are defined by actors and actions, not only by repositories or component boxes. “Browser,” “endpoint,” “gateway,” “platform,” and “CI” each contain principals with materially different privileges and blast radii.

Every material actor has an owned actor record before its capability passes a release gate.

## Required actor record

| Field | Requirement |
|---|---|
| Actor identity | stable principal/workload/user identity and tenant/environment binding |
| Authentication | issuer, credential form, lifetime, rotation, revocation, bootstrap |
| Authorization | allowed actions/resources, conditions, separation of duties |
| Secrets | exact classes readable/signable/decryptable; never secret values in the register |
| Trust boundary | callers, callees, local privilege, network/storage boundary |
| Data access | allowed classifications, fields, purposes, residency |
| Audit | security-relevant attempts, outcomes, correlation, retention |
| Failure posture | fail-open/closed/degraded by action and risk class |
| Blast radius | tenant, device, fleet, region, data/control scope |
| Controls | sandboxing, isolation, signing, rate/blast limits, approval, kill switch |
| Owner/runbook | accountable owner, on-call, compromise/recovery procedure |
| Proof | threat tests, certification, artifact/config identity |

## Minimum actor inventory

| Actor | Primary privilege/risk |
|---|---|
| Customer administrator | tenant policy, users, connectors, evidence grants, high-impact controls |
| Customer analyst/operator/auditor | findings, workflow, exports, evidence metadata, possibly purpose grants |
| Support operator | exceptional JIT access; cross-customer operational blast radius |
| Browser content script | untrusted page proximity; minimal message/data privilege |
| Browser background worker | extension storage, policy, local decision, delivery, browser APIs |
| Native messaging host | local file/OCR/DLP privilege and host boundary |
| Browser backend service | enrollment/config/event receipt and product-native fan-out |
| Endpoint proxy/monitor/hook/updater | elevated device/network/process/update privileges; separate actors |
| LLM gateway request worker | provider routing, request metadata, native policy, provider credential use |
| MCP gateway/runtime | tool/resource invocation and external-system effects |
| Edge adapter and delivery worker | safe-fact conversion, WAL, workload identity, telemetry delivery |
| Ingest/trust service | evidence admission, tenant routing, quarantine |
| Resolver/materializer/finding worker | canonical truth mutation or candidate computation |
| Decision/policy service | policy authority and verdicts |
| Command/approval service | high-impact action authorization and orchestration |
| Connector worker | scoped external credentials, polling/webhooks, possibly native control |
| Product API | authorized canonical reads/mutations; no independent truth |
| Signing service | release/bundle/command signing keys |
| CI/CD runner | build, test, provenance, promotion; no general production secrets |
| Cell/SRE automation | provisioning, recovery, routing, backup, operational keys |

The actual deployment may have more actors. Combining actors requires an explicit blast-radius and separation-of-duties review.

## Actor-action matrix

The maintained machine or catalog record MUST answer:

```text
actor
  can perform action
  on resource/scope
  under policy/approval/precondition
  using credential/identity class
  producing audit/evidence
  with failure posture and blast limit
```

Authorization tests are generated or traced from this matrix. A role label alone is insufficient.

## High-impact separations

- A producer capable of emitting evidence cannot self-certify or admit its own assurance.
- A detector cannot authorize a command.
- A command orchestrator cannot claim verified effect without the verification policy.
- A source read connector cannot inherit write/control permissions.
- A release builder cannot possess unrestricted production signing authority.
- A signing service cannot choose what artifact/policy/command to approve.
- Support access does not imply restricted-content access.
- A frontend entitlement does not replace server-side authorization.
- Inventory relationships do not automatically confer ReBAC authorization.

## Failure posture

Fail-open/fail-closed is chosen per actor/action/risk class and approved policy, not as a universal sensor setting.

Examples:

- observe-only evidence delivery failure may preserve native runtime while degrading health and buffering/gapping evidence;
- expired/invalid policy bundle rejects the bundle and retains the last valid bundle under its lifecycle policy;
- high-risk enforceable action with no valid local or central authority follows the approved conservative mode;
- unavailable approval never becomes silent allow;
- unavailable analytics/search never changes canonical or control state.

Exact thresholds and budgets require profile certification and `NEEDS_INPUT`.

## Signing and secret incidents

A claim that a private signing or CA key exists in source, build context, image, package, or customer-delivered artifact MUST be verified immediately. If confirmed:

1. activate the security incident process;
2. stop affected promotion/distribution;
3. scope exposure and trust use;
4. revoke/rotate keys and trust anchors;
5. produce clean signed artifacts;
6. define customer upgrade/invalidation;
7. remove secret material from active source/artifacts and restrict history according to incident/legal policy;
8. add scanning, isolated KMS/HSM signing, provenance, and non-exportability controls;
9. monitor abuse and retain incident evidence.

The current endpoint source audit verifies private signing/key material in the audited source tree and a packaging mode capable of including the CA private key. `NI-031` is therefore an incident-disposition input, not a fact-verification input: actual artifact/customer distribution, revocation, rotation, clean rebuilds and customer update remain unresolved.

## Gate proof

G0/G1 require the actor inventory and named owners for all launch actors. Each later feature updates the matrix and proves:

- least privilege and tenant isolation;
- credential rotation/revocation;
- negative authorization;
- secret/content non-leakage;
- compromise/blast-radius scenario;
- audit completeness;
- failure behavior and recovery;
- artifact/configuration binding.

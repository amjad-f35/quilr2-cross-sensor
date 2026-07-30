# Ownership, RACI, and Program Control

Status: **normative role model; names require assignment**

## Required accountable roles

| Role | Accountable for |
|---|---|
| Executive sponsor | funding, organizational priority, launch risk acceptance |
| Product lead | customer promise, scope, packaging, product acceptance |
| Chief/platform architect | constitution, ADR integrity, cross-system semantics |
| Protocol lead | protocol/schema/profile compatibility |
| Edge lead | runtime durability, privacy, management, update |
| Sensor leads | browser, endpoint, LLM gateway, MCP adapter correctness |
| Data/identity lead | normalization, claims, resolver, canonical model |
| Insights/analytics lead | findings, metrics, cost quality |
| Policy/control lead | decisions, approvals, commands, effects |
| API/frontend lead | customer contracts, UI, accessibility |
| Security lead | threat, IAM, cryptography, product security |
| Privacy/data governance lead | data use, retention, residency, rights |
| SRE/platform lead | cell, SLO, capacity, DR, incident response |
| Quality/release lead | test, certification, gate evidence, promotion |
| Migration lead | Quilr 1 parity, cutover, rollback, decommission |
| Customer/support lead | pilot, onboarding, documentation, support readiness |

Actual names and backups are `NEEDS_INPUT`.

## Decision rights

| Decision | Accountable | Required consultation |
|---|---|---|
| Change constitution | Chief architect | product, security, data, SRE, affected leads |
| Protocol breaking change | Protocol lead | edge, sensors, ingest, migration, release |
| Customer scope/claim | Product lead | architecture, security, support |
| Identity merge semantics | Data/identity lead | sources, product, privacy |
| New insight GA | Insights lead | product, data, security, support |
| New control capability GA | Policy/control lead | sensor, security, SRE, product |
| Launch region/profile | Executive/product | privacy, security, SRE, legal |
| Gate approval | Named gate authority | all gate evidence owners |
| Critical risk acceptance | Executive sponsor | security/product/architecture/legal as applicable |

No single contributor self-approves a high-impact production control capability.

## Forums

### Architecture council

Weekly or as needed. Reviews ADRs, cross-domain contracts, and exceptions. It does not replace accountable owners.

### Protocol compatibility review

Reviews schema/profile changes, mixed versions, deprecation, and certification.

### Product quality review

Reviews insight/metric correctness, UX language, coverage, customer outcomes, and rollout.

### Security/privacy review

Reviews data flows, threats, control capability, residency, and assurance.

### Release gate review

Reviews immutable evidence package for a named gate and artifact set.

## Program artifacts

Maintained continuously:

- requirements trace;
- decision and ADR register;
- risks and mitigations;
- needs-input register;
- dependency/service catalog;
- release/gate status;
- artifact/certification inventory;
- migration cohort status;
- SLO/error budget;
- customer issues and insight quality.

## Change control

Material changes identify:

- affected frozen decision/requirement;
- reason and alternatives;
- data/migration/compatibility effect;
- security/privacy/operations effect;
- product wording effect;
- rollout and rollback;
- accountable approval.

Urgency does not permit invisible architecture changes.

## Escalation

Escalate when:

- an external input blocks a gate;
- workstream ownership is missing;
- a requirement conflicts with the constitution;
- a production value is being invented;
- a customer claim exceeds source authority or coverage;
- a safety/durability/isolation gate is proposed for waiver;
- the delivery date would require a second disposable architecture.

## Reporting

Report customer outcomes, gate evidence, critical risks, quality, SLO, and migration—not percentage complete based on story points alone.

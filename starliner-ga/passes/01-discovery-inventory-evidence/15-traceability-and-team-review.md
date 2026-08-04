# Traceability and Team Review

Status: **normative control and review checklist**

Readiness note: the “before broad implementation” checklist below was the
entry condition for producing the implementation freeze. It is satisfied by
the accepted
[implementation authority](implementation-freeze/README.md), selected-source
audit and exact target-engine baseline smoke. Full bounded-pass implementation
is now authorized; the checklist remains normative for traceability and change
control.

## Feature trace

Every customer-visible feature must trace:

```text
customer question
→ pass requirement
→ source authority/capability
→ event/profile schema
→ privacy classification
→ adapter seam and exact artifact
→ ingest/normalizer/resolver behavior
→ canonical entity/relationship/activity
→ read model/API
→ UI state
→ authorization
→ tests and certification
→ SLO/runbook/support
→ release gate evidence
```

Missing links block the bounded DIE claim they support. The separate migration
track adds its own extraction/parity/cohort/rollback trace from these stable
outputs; that trace is not a prerequisite for DIE implementation or DIE-GA.

## Required team reviews

### Product/design

- customer promise and prohibited language;
- five inventory types;
- Activity versus Evidence distinction;
- important event families;
- UI simplicity and partial states;
- accessibility;
- pilot acceptance.

### Sensor teams

- exact audited seams;
- complete supported event matrix;
- source-native IDs and lifecycle;
- privacy mapping;
- WAL/delivery/resource behavior;
- gaps and certification;
- native/Quilr 2 claim separation.

### Data/identity

- entity/relationship model;
- source authority;
- create/link/defer;
- merge/split/correction;
- evaluation corpus/precision;
- provenance.

### Platform

- role-specific deployment topology;
- PostgreSQL/object/ClickHouse ownership;
- worker partitions/fencing;
- ingest receipts;
- outbox/projection rebuild;
- API/read paths;
- capacity and failure.

### Security/privacy

- threat boundaries;
- workload/human identity;
- tenant isolation;
- endpoint incident;
- prohibited content;
- keys/signing/provenance;
- evidence/support/export access;
- retention/residency.

### SRE/release/support

- artifacts/configuration;
- deployment profile;
- SLO/capacity;
- dashboards/runbooks/on-call;
- backup/restore;
- upgrade/rollback;
- pilot operations;
- customer communications.

### Separate migration/legacy-track review

The following review is retained for the parallel migration program only. It
does not gate bounded DIE implementation, integration, product claims, or
DIE-GA.

- live Quilr 1 scope;
- consumers/exports;
- ID/field/event mappings;
- semantic parity;
- domain authority;
- cohort/cutover/fallback;
- rollback and stabilization.

## Freeze package

Freeze-entry checklist:

- approved pass documents;
- accepted decisions register;
- closed `DIE-0` needs-input items;
- exact-source `project-starliner` audit and retain/refactor/replace/missing disposition;
- concrete schemas/OpenAPI;
- physical DDL;
- repository/module/deployment map;
- threat/privacy review;
- source adapter change plans;
- named owners and delivery capacity.

Teams may implement the complete bounded pass in the frozen dependency order.
They may not invent divergent wire or canonical semantics.

## Weekly evidence review

Review:

- requirements implemented/proven;
- source event coverage;
- schema/API changes;
- unresolved design inputs;
- sensor artifact/config delta;
- identity quality;
- ingestion/projection lag;
- privacy/security issues;
- customer/pilot feedback;
- risks, owners, dependencies and gate status.

Progress is measured in verified permanent-path capabilities, not file count, service count, dashboards, or emitted event volume.

## Team approval questions

1. Does the pass answer the promised customer questions without findings/policy?
2. Does “full evidence” have a bounded, privacy-safe, testable meaning?
3. Are all four sensors represented by exact event/capability matrices?
4. Can every inventory field be explained?
5. Can loss, gaps, unsupported states and bypass be seen?
6. Can the product operate without sensor APIs during reads?
7. Can every projection be destroyed and rebuilt?
8. Can the pass ship without a graph/search/cache service?
9. Are source credentials and local IPC production safe?
10. Are capacity, backup, support and exact deployed artifacts proven?

Any “no” must become a requirement, input, risk, or approved scope change.

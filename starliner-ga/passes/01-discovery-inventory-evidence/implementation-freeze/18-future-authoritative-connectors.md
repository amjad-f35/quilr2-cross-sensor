# Future Authoritative Connector Boundary

**Status:** recorded design boundary; implementation is outside this pass

The canonical ontology intentionally has room for enterprise identities, devices, roles, permissions, cloud resources, SaaS accounts, repositories and ACLs. The current four sensors must not synthesize those facts.

The machine-readable backlog is [future-connector-backlog.csv](registers/future-connector-backlog.csv).

## Required future connector families

| Connector | Adds authoritative truth for |
|---|---|
| IdP/directory | people, accounts, groups, service principals, membership and deprovisioning |
| HRIS | employment, manager hierarchy, business units and effective dates |
| MDM/CMDB | stable device identity, ownership, management state, posture and installed software |
| Cloud/IAM | cloud accounts/projects/resources/agents, roles, policies and effective access |
| SaaS | SaaS tenants/accounts/apps/roles and application/object access |
| Source control/repository | organizations, repositories, teams, roles, deploy keys and app installations |
| Filesystem/ACL | volumes/shares/resources, inherited ACLs and effective read/write/execute |
| Data catalog/storage | datasets/buckets/databases/tables, classifications, grants and ownership |

## Integration architecture

External systems use central adapters because Quilr does not own code inside those sources:

```text
poll/webhook/backfill adapter
→ connector checkpoint + durable source outbox
→ common ingest envelope + typed connector profile
→ immutable evidence
→ connector normalizer
→ continuous identity resolution
→ canonical claims and relationship versions
→ rebuildable product projections
```

Each connector must provide:

- stable source authority and native object IDs;
- tenant/account/subscription scope;
- full and delta reconciliation;
- deletion/deprovisioning/tombstone semantics;
- source revision and effective/valid time;
- direct versus inherited versus effective relationship semantics;
- permission/role scope;
- coverage and API-limit gaps;
- privacy classification and field authorization;
- replayable evidence and connector certification.

## What remains unknown until then

Without these connectors, the product must not claim:

- complete enterprise user inventory;
- complete group or organization hierarchy;
- complete device inventory;
- every role, permission or credential held by a person/agent;
- every resource an identity or local agent can reach;
- full cloud, SaaS, source-control, filesystem or data inventory;
- cloud agents that do not traverse Quilr gateways.

The UI language is `not connected`, `unsupported`, or `unknown`, never zero access or no exposure.

## Relationship admission

Future connector relationships are already listed in [relationship-support.csv](registers/relationship-support.csv) with `future_connector_required`.

Those rows cannot materialize until:

1. a versioned typed source profile is accepted;
2. its identity authority and key precedence are defined;
3. its direct/inherited/effective permission semantics are explicit;
4. its reconciliation and deletion behavior is tested;
5. its product claims and UI fields are added to the disposition registers;
6. the exact connector artifact is certified.

This preserves an extensible graph without pretending the four sensors currently provide enterprise entitlement truth.

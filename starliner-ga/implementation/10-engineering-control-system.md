# Engineering Control System and Systems of Record

Status: **normative operating model; vendor selection is `NEEDS_INPUT`**

## Outcome

The build plan remains executable as repositories, teams, releases, incidents, and customer commitments change. Architecture truth, execution state, runtime truth, and narrative context are connected without letting one tool silently become authoritative for all four.

## Authority hierarchy

| Concern | System of record | Required behavior |
|---|---|---|
| Architecture invariants | this corpus, accepted ADRs, versioned contracts | reviewed in Git; linked to changes/releases |
| Code and immutable artifacts | source forge, artifact/registry, provenance system | reviewed commits; digest promotion; SBOM/signature |
| Product requirements and gates | requirements/gate registers and approved evidence packages | trace to outcome, owner, test, artifact, release |
| Work execution | approved issue/project system | no independent architecture invention |
| Service/ownership catalog | approved engineering catalog | owner, tier, dependencies, APIs, data, runbooks, deploys |
| Runtime truth | observability/incident systems | SLOs, health, alerts, incidents, deploy/config identity |
| Customer/organizational narrative | approved knowledge system | decisions summarized and linked, not duplicated as hidden authority |
| Security/privacy/compliance evidence | approved assurance system or immutable gate package | access-controlled, retained, linked to exact release |

Candidate products such as Backstage, Jira, Confluence, Grafana, GitHub, or equivalents are mappings, not frozen requirements. `NI-030` names the actual company systems and owners.

## Source-of-truth rules

1. A work ticket cannot override the constitution, ADR, contract, or requirement.
2. A wiki summary links to the governing decision; copy/paste does not create a second architecture.
3. A dashboard shows runtime state; it cannot prove an uninstrumented SLO or capability.
4. A catalog entry points to owners/contracts/runbooks/deployments; it does not replace them.
5. A test fixture or mock environment is never marked as a live capability.
6. Every release/gate package binds exact artifact digests, configuration, contract/profile versions, migrations, tests, risk/exception state, and approvals.
7. Broken links, missing owners, stale runbooks, unowned services, and untraced P0 requirements are release-visible defects.

## Engineering catalog record

Every deployable/service/worker/edge component/connector role records:

- stable component ID, type, lifecycle, criticality;
- owning team, accountable person, backup, on-call;
- source repository and module;
- build/release pipeline and artifact location;
- deployment profiles, environments, regions/cells;
- APIs/events/contracts and consumers;
- authority/data classes/stores/retention;
- dependencies and failure isolation;
- workload identity, secrets class, network policy;
- SLO/dashboard/alerts/runbook;
- threat model, certification, support matrix;
- current production versions and deprecation state.

Catalog automation may derive facts from repositories and deployment systems, but manual claims remain reviewable and freshness-labelled.

## Required control views

The engineering system can answer:

- Who owns this requirement, service, source profile, contract, risk, and gate?
- Which customer features and gates depend on this component?
- Which actors can call/mutate it?
- What data does it own or project?
- Which producer/consumer versions are compatible?
- What fails when it is unavailable?
- Which artifact/configuration is in each environment?
- Where are the SLO, alert, runbook, incident history, backup, and recovery proof?
- Which `NEEDS_INPUT`, risk, waiver, or security finding blocks release?

## Work hierarchy

A planning tool SHOULD represent:

```text
customer outcome / release gate
  -> capability or workstream
    -> production epic
      -> implementation item
        -> reviewed change and immutable artifact
        -> verification evidence
```

Every implementation item has the definition of ready/complete from the workstream plan. Story-point or code-completion percentages do not replace gate evidence.

## Documentation contract

Repository documentation includes:

- service/component overview and authority;
- local development and supported dependency setup;
- contract/API/event docs generated or checked from source;
- configuration and secret references;
- deployment, rollback, migration, and compatibility;
- SLO/alerts/runbook and failure behavior;
- security/privacy model;
- ownership and support;
- requirements/ADR/gate links.

Empty templates, placeholder dashboards, fabricated metrics, unconnected API examples, and “TODO productionize” shells do not count as deliverables.

## Change propagation

A material change identifies and updates as applicable:

```text
requirement/customer wording
ADR/contract/profile
actor security and data authority
producer/consumer compatibility
code/migration/config
tests/certification
SLO/capacity/runbook
product/API/UI
migration/customer rollout
release/gate evidence
```

CI can lint links and metadata, but accountable review decides semantic completeness.

## Adoption sequence

1. Resolve actual company systems and owners (`NI-030`).
2. Import the corpus registers without changing their authority.
3. Catalog launch components and reconcile with live repositories/deployments.
4. Establish automated artifact/deploy/contract metadata.
5. Link epics, requirements, risks, and gates.
6. Link runtime/SLO/incident and security evidence.
7. enforce freshness/ownership/traceability in release gates.

No mass creation of placeholder services, dashboards, tickets, or pages is authorized by this plan.

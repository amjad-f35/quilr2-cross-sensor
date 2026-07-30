# ADR-0018: Engineering Truth and Feature Traceability

Status: **accepted**

## Context

The context proposed Backstage, Jira, Confluence, Grafana, GitHub, monorepos, service maps, and many document sets. The goals are sound, but freezing vendors, repository topology, or placeholder artifacts without live company evidence would violate the no-invention rule.

## Decision

Use a tool-neutral engineering control system with separate authorities for:

- architecture/contracts;
- code/artifacts/provenance;
- requirements/gates;
- work execution;
- component/ownership catalog;
- runtime/incident truth;
- organizational/customer narrative;
- security/compliance evidence.

Every customer feature has a top-down customer-to-contract trace and a bottom-up source-to-evidence trace. Every tier-0/tier-1 component has dependency, data-authority, actor-security, failure, version-skew, operations, and release metadata.

The actual tools, repositories, module paths, and owners remain `NEEDS_INPUT`.

## Consequences

- A ticket, wiki, dashboard, fixture, or catalog entry cannot silently override architecture or claim a capability.
- Releases can be audited from customer claim to exact artifact and production evidence.
- Repository/service count follows ownership and operational boundaries, not the number of conceptual planes/domains.
- Empty placeholder artifacts do not count as progress.

## Rejected

- making a named vendor a constitutional dependency without approval;
- treating 20 planes or 32 domains as 20/32 repos or services;
- measuring completion from tickets/code alone;
- generating placeholder services, dashboards, or docs as delivery.

# CTO Directive and Release Charter

Status: **normative product and engineering charter**

## Directive

Ship the discovery, inventory, and observability/evidence foundation completely
before building Quilr 2 intelligence/findings and policy/control. Preserve
stable, non-destructive compatibility seams for the separately governed
migration/coexistence track while internal architecture and deployment
discussions continue.

The engineering interpretation is:

- build permanent Quilr 2 evidence and canonical-truth boundaries now;
- integrate all four owned sensor families now;
- expose useful inventory and source-backed activity now;
- do not reproduce Quilr 1 API composition or competing truth stores;
- do not require the final findings, policy, billing, or deployment portfolio to ship this pass;
- do not remove, mutate, route, backfill, cut over, or destabilize Quilr 1 from
  this pass; and
- expose versioned evidence, identity-alias, API, export and tenant-routing seams
  that a later migration track can consume without changing DIE truth.

## Product job

An enterprise customer must be able to answer:

1. What AI applications, agents, models, MCP servers, and tools have our covered sensors discovered?
2. Which distinct surfaces, deployments, devices, accounts, producers, and source objects compose them?
3. Who or what used or invoked them where the evidence supports attribution?
4. What important source event happened, when, through which sensor, and with what outcome?
5. Which source facts support each inventory field and relationship?
6. How current and complete is visibility for the selected population and time?
7. What is ambiguous, conflicted, stale, missing, unsupported, or privacy-omitted?

The pass does not answer whether a condition is risky or recommend remediation. It provides the trustworthy facts later intelligence requires.

## Personas

### Enterprise AI/security owner

Needs a comprehensible estate, material recent changes, visibility status, and drilldown to evidence without learning sensor internals.

### Security or platform operator

Needs complete supported event/activity filtering, source coverage, provenance, identity composition, producer health, exports, and troubleshooting.

### Application/AI platform owner

Needs applications, agents, models, MCP dependencies, usage evidence, owners where available, and source-native identifiers.

### Quilr support/operator

Needs tenant-safe producer/enrollment health, backlog, gaps,
version/certification, projection freshness, and purpose-bound evidence access.

### Separate migration-track consumer

The future migration/coexistence track needs stable legacy-evidence ingestion,
ID-alias, API/export compatibility and tenant-routing seams from DIE. Legacy
extraction, parity, cohort state, cutover watermarks, fallback and rollback proof
are not DIE implementation or DIE-GA exit requirements.

## Success outcomes

- a customer sees one application rather than unrelated browser, process, and gateway rows when evidence justifies the resolution;
- distinct web, desktop, account, route, agent, model, MCP, and tool objects remain distinct;
- an entity page explains every source and relationship;
- an operator can trace a displayed activity to admitted evidence and producer artifact;
- missing data is shown as a coverage gap rather than “no usage”;
- important native blocks/DLP outcomes appear as events without implying Quilr 2 policy capability;
- sensor or projection outage does not corrupt canonical inventory;
- Quilr 1 remains untouched by DIE and a future migration track can add
  coexistence without rewriting canonical evidence or identity;
- the frontend never joins source-specific APIs;
- later findings and policies can consume the same canonical evidence without a rewrite.

## Program constraint

The pass may use provisional internal infrastructure bindings where production values are unresolved, but:

- provisional values are typed and visibly non-production;
- no provisional value becomes a customer promise;
- no implementation shortcut may violate identity, durability, tenant, privacy,
  or the frozen extension seams reserved for the separate migration track;
- every deferred architecture area is tracked in the [twenty-four-area register](14-twenty-four-area-disposition-register.md).

## Release identifier

The pass gate is `DIE-GA`. It precedes the broader `G2 Unified AI Estate GA`. `DIE-GA` ships facts and visibility; `G2` may later add governed ownership workflows and findings.

## Change control

The CTO directive may change scope or sequencing through an approved pass amendment. Engineering may change an implementation choice through an ADR when it preserves:

- source-native evidence;
- central canonical identity;
- durable delivery;
- one mutation authority;
- customer continuity;
- privacy;
- tenant isolation;
- unified product APIs.

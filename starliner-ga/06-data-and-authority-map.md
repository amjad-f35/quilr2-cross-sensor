# Data and Authority Map

## Authoritative ledgers

| Ledger | Owner | Key guarantees |
|---|---|---|
| Accepted evidence metadata | Evidence service | Immutable admission, idempotency, integrity, retention state |
| Source observations | Normalization service | Source-scoped, versioned, replayable transformation |
| Canonical entities | Estate materializer | Tenant-scoped durable identity and independent state dimensions |
| Identifier registry | Identity service | Namespace, validity, strength, assurance, status, reassignability |
| Claim ledger | Identity/claim materializer | Field-level provenance, authority, confidence, conflicts |
| Resolution decisions | Resolver | Versioned match/create/defer/conflict/merge/split |
| Relationship ledger | Relationship materializer | Typed bitemporal edges and assertion lineage |
| Canonical activity | Activity materializer | Resolved actors/actions/resources/decisions/outcomes |
| Findings | Finding service | Admission, dedupe, lifecycle, assignment, evidence, action |
| Policy and bundles | Policy service | Governed versions, compilation, deployment |
| Decision log | Decision service | Immutable decision snapshot and explanation |
| Approvals/delegations | Approval/authority service | Authority chain, expiry, revocation |
| Commands/effects | Command service | Typed command lifecycle and verification |
| Connector cursors/runs | Integration runtime | Atomic/recoverable sync progress |

## Projection rules

ClickHouse, graph, search, ReBAC, Redis, and UI summaries MUST:

- carry tenant ID and source canonical version;
- carry projector version and watermark;
- be reproducible from authority;
- tolerate at-least-once delivery;
- expose staleness;
- never accept direct application writes;
- have reconciliation and rebuild procedures.

## Field authority examples

| Field | Preferred authority | Sensor role |
|---|---|---|
| Employment status | HRIS/IdP | Hint only |
| Authenticated human subject | OIDC issuer | Preserve issuer+subject |
| Device posture | MDM/EDR | Endpoint supplies current observation |
| Application vendor/product | Curated catalog | Sensors contribute match identifiers |
| Application use | Runtime sensor event | Direct observation |
| Model provider ID | Provider/gateway | Endpoint config is supporting evidence |
| Agent owner | Explicit assignment/repository/deployment authority | Names are hints |
| Tool schema | MCP server/registry | Gateway preserves schema digest |
| Credential state | Issuer/secret manager | Runtime use is an event |
| Policy approval | Policy service | Sensor reports deployed version |
| Command effect | Declared verification source(s) | Executor report alone may be insufficient |

## State axes

Every applicable entity keeps independent:

```text
existence
lifecycle
management/governance
ownership
health
freshness
resolution
authentication
attestation
credential
certification
coverage
confidence
```

No generic `status` may replace these axes.

## Global versus tenant data

Global:

- curated public AI product/surface/model/provider/server/connector concepts;
- aliases and validity;
- catalog releases;
- public capability metadata.

Tenant:

- observed applications/accounts/installations;
- users, owners, governance, policies;
- custom products/agents/tools;
- activity, findings, spend, evidence;
- resolver and manual decisions.

Tenant-private data is never promoted globally without explicit stewardship.

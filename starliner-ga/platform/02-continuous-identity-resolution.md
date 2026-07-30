# Continuous Identity and Resolution

Status: **normative**

## Objective

Continuously reconcile source-native objects into canonical enterprise entities while preserving uncertainty, provenance, history, and reversibility.

Identity resolution is not a one-time import. Every new observation, correction, integration, merge, split, and source deletion can change the best-supported view.

## Canonical entity classes

The initial ontology includes:

- AI application or product;
- AI surface or account;
- agent definition;
- agent deployment or workload;
- model product;
- model deployment or endpoint;
- MCP server;
- tool;
- user;
- service principal;
- team and business unit;
- device;
- provider account and tenant;
- policy and control;
- data resource, where explicitly supported.

Product, deployment, account, and instance are not interchangeable.

## Claim ledger

Every resolvable identity fact is a claim:

- claim ID and type;
- value or privacy-safe token;
- source object and evidence reference;
- subject candidate;
- authority and issuer;
- valid time and observation time;
- normalization version;
- confidence components;
- status: active, superseded, disputed, withdrawn;
- privacy and retention class.

The canonical entity is a projection over claims and decisions, not an overwrite of them.

## Resolution pipeline

```text
normalized source objects
  -> candidate generation
  -> deterministic exact rules
  -> probabilistic/scored rules where approved
  -> constraints and negative evidence
  -> decision: link, create, defer, conflict
  -> claim/entity/relationship ledgers
  -> review queue when needed
  -> canonical projection
```

## Matching tiers

1. **Exact authoritative**: same immutable source-issued identifier in the same namespace and scope.
2. **Exact cross-source bridge**: a verified mapping from an authoritative integration.
3. **Deterministic composite**: a versioned tuple approved for the entity class.
4. **Strong corroboration**: multiple independent claims with no hard conflict.
5. **Ambiguous candidate**: plausible but insufficient; keep separate and queue when material.

Names alone are never a sufficient automatic merge key.

## Constraints and negative evidence

Hard constraints can prevent a merge:

- mutually exclusive source tenant or environment;
- incompatible entity classes;
- simultaneously active singleton identities that cannot coexist;
- verified provider/account mismatch;
- customer-declared “not the same” decision;
- incompatible cryptographic artifact identities where equivalence is impossible.

Negative evidence is retained and versioned.

## Confidence

Identity confidence is platform-calculated from:

- claim authority;
- identifier stability;
- source independence;
- corroboration;
- freshness;
- parsing quality;
- conflicts and negative evidence;
- rule/model version.

The producer cannot set final confidence. Thresholds are entity- and consequence-specific and remain `NEEDS_INPUT` until validated.

## Merge and split

Every merge or split:

- is an immutable decision with actor and reason;
- records input claims and algorithm version;
- preserves predecessor and successor IDs;
- reassigns claims through effective-dated links;
- causes deterministic rematerialization;
- updates affected findings, metrics, ownership, and policy targets;
- is reversible unless retention has lawfully removed required evidence;
- produces customer-visible audit history.

Canonical IDs never get silently recycled.

## Human review

Review is prioritized by impact, not queue age alone. Reviewers see:

- candidate entities and differences;
- supporting and conflicting claims;
- source and authority;
- downstream impact of merge or split;
- recommended decision and explanation;
- history of prior decisions;
- privacy-safe evidence links.

Bulk decisions require preview, bounded scope, audit, and rollback.

## Ownership and organizational identity

IdP, HRIS, CMDB, SaaS admin, and customer assignments contribute typed claims. “Observed user,” “technical operator,” “business owner,” “security owner,” and “approver” are separate roles. Last user is not automatically the owner.

## Evaluation

Each resolver release is measured on:

- precision and recall using adjudicated tenant-safe datasets;
- false-merge rate, weighted more heavily than missed merges;
- split correctness;
- stability under late and reordered events;
- explainability;
- review workload;
- cross-tenant isolation;
- deterministic replay for exact rules;
- impact on product findings.

No machine-learned resolver can autonomously promote to production without shadow comparison, impact limits, and rollback.

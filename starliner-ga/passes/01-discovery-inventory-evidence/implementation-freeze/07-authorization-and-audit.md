# Product Authorization and Audit

## Decision

Discovery, inventory, activity, evidence and coverage use one deny-by-default authorization kernel combining:

- **RBAC** for coarse capabilities;
- **ReBAC** for authoritative membership and responsibility relationships;
- **ABAC** for request, subject, resource and field conditions;
- PostgreSQL row-level security as tenant-isolation defense in depth;
- append-only audit for sensitive reads and every mutation.

This is product data authorization. It is separate from producer authentication, sensor command authorization and any later AI-use policy engine.

The pass implements the kernel as a Go module in the `starliner-api` process. It reads the dedicated `die_authz` schema and evaluates compiled, typed rules. There is no network call to OPA, OpenFGA, SpiceDB or another authorization service in the request hot path. The port is explicit so the storage/evaluator can be replaced later without changing API semantics.

RLS is not the only boundary against a compromised SQL credential because a
role executing arbitrary SQL can attempt to set a custom GUC. Primary isolation
also includes authenticated tenant derivation, per-cell/per-workload database
logins, least-privilege grants and transaction-scoped repositories.
`tenant_cell_assignment` binds a tenant to one cell;
`tenant_cell_principal` independently binds each API/ingest/normalizer/truth/
projector/maintenance login to that tenant and its one declared group role.
Enrollment counts effective PostgreSQL role membership, including transitive
role grants, across all DIE runtime roles and rejects anything other than the
one declared role. Direct-membership counting is not an isolation control.
Principal bindings are append-preserved enrollment epochs: revocation closes the
epoch, an active partial uniqueness constraint prevents simultaneous duplicate
bindings, and a new binding ID may enroll the same login after a controlled cell
move. A cell ID can change only after all principals in the prior cell have
been revoked; a new principal can target only the tenant's current active cell.
`die_authz.current_tenant_id()` returns the requested GUC tenant only when
`session_user` has an active principal binding in an active/draining assignment
(except the two bootstrap administration roles). An unassigned guessed tenant
therefore resolves to null inside every ordinary tenant policy. Runtime workers
can enumerate only their assigned tenants and set context from that registry.
Work-item and execution triggers then independently enforce the declared
role-to-stage map; tenant visibility does not authorize cross-stage handling.
Every activity child partition receives FORCE RLS and its own tenant policy
before direct grants or availability; parent policy inheritance is never
assumed.

Authorization administration is the one synchronous non-canonical mutation surface in the product API. It runs only on admin-surface API replicas, after `authz.admin`, step-up, preview-digest and optimistic-revision checks, through a dedicated `die_authz_admin` database login. Ordinary read-surface replicas do not possess that credential. The transaction locks the tenant revision, validates the expected prior value, advances it exactly once, stamps every new/closed grant, scope change and complete closure snapshot with that new revision, validates scope acyclicity and tuple sources, appends the audit event and commits atomically. Database triggers reject fabricated past/future revisions and serialize a concurrent revision update. It never writes canonical inventory. No API process receives the migration-owner or RLS-bypass role.

## Identity inputs

The API authenticates interactive users with tenant-configured OIDC. Service clients use OAuth 2 client credentials with an audience restricted to the DIE API. A verified principal contains:

- issuer and immutable subject;
- tenant selected from trusted issuer/client mapping;
- user, service, group or time-bounded support-session identity;
- authentication assurance and authentication time;
- trusted group IDs;
- optional support-session approval and expiry;
- request ID and session ID.

Tenant, roles and scope are never accepted from ordinary request query/body fields. Display personas in the Nuxt shell are not security identities and grant nothing.

## Capabilities

| Capability | Protected operation |
|---|---|
| `overview.read` | scoped canonical overview and changes |
| `inventory.list` | list canonical entities |
| `inventory.read` | entity details and safe provenance summary |
| `relationship.read` | direct/bounded relationship queries |
| `activity.read` | canonical activity lists/details |
| `evidence.metadata.read` | safe evidence metadata and lineage |
| `evidence.object.read` | decrypted immutable evidence object; not granted by default |
| `coverage.read` | coverage, gaps and freshness |
| `producer.read` | producer, capability and certification state |
| `identity.read` | bindings, claims and resolution explanation |
| `identity.review` | preview and commit resolution corrections |
| `export.create` | request an authorized snapshot export |
| `export.read` | inspect own or scope-authorized export metadata |
| `export.download` | stream completed export bytes after fresh authorization |
| `audit.read` | audit-event search |
| `authz.admin` | role, scope and relation administration |

## Frozen built-in roles

| Role | Default capabilities | Default scope |
|---|---|---|
| `tenant_admin` | all customer pass capabilities including `authz.admin`; raw evidence still needs explicit grant | tenant |
| `inventory_viewer` | overview, inventory and relationships | assigned business scope |
| `activity_viewer` | overview, activity and safe entity references | assigned business scope |
| `evidence_viewer` | evidence metadata, lineage, coverage and producer read | assigned business scope |
| `source_operator` | coverage, producer state/certification read, safe evidence metadata | assigned producer/business scope |
| `identity_reviewer` | inventory/read, relationships, identity read/review, evidence metadata | assigned business scope |
| `export_operator` | matching read capabilities plus export create/read/download | assigned business scope |
| `auditor` | overview, inventory, relationships, activity, evidence metadata, coverage, producer and audit read | assigned audit scope |
| `support_session` | only capabilities and resources named in a time-bounded approved support session | explicit tenant scope |

Roles are additive, but a deny condition, tenant mismatch or field restriction always wins. No role receives `evidence.object.read` implicitly.

## Scope and relationship model

Business scopes form a shallow, acyclic hierarchy:

```text
tenant
└── organization
    ├── department
    │   └── team
    └── environment
```

`die_authz.scope_closure` is a derived transitive-closure table. Mutating a scope validates acyclicity and rebuilds affected closure rows in the same transaction. Product resources carry a primary `business_scope_id`; explicit authoritative relation tuples can additionally express:

- `member` of scope;
- `viewer`, `operator`, `reviewer` or `auditor` of resource/scope;
- `owner` or `delegate` for a canonical entity;
- `requested_by` for an export;
- `approved_support` for a support session.

Role bindings and relation tuples use non-overlapping validity ranges for the same logical grant. Bounded duplicate intervals cannot silently preserve access after a revocation. SQL role and relation values are generated from [model.yaml](authz/model.yaml), and unknown values fail closed.

Only the authorization administration path, trusted identity provisioning or an approved authoritative connector may write authorization tuples. `owned_by`, `assigned_to`, `used`, `member_of` or any other observed inventory edge does **not** become an authorization tuple automatically.

Every producer is enrolled into one non-null business scope and environment. The tenant-root scope is the conservative fallback, so an unclassified producer is visible only to a principal authorized at tenant root. Entity scope follows field-authority rules. Activity scope is selected deterministically from verified actor, workload, primary resource and finally producer enrollment scope; coverage and evidence metadata inherit producer/population scope. PostgreSQL read models and ClickHouse search rows carry those authorization dimensions so filtering occurs inside the query. Cross-scope actor/resource references are independently filtered and masked—row visibility never implies permission to reveal every referenced entity.

The root scope is created only by the signed one-time `maintenance tenant bootstrap` transaction. It also creates the self-closure row, initial authorization revision and tamper-evident audit event. `create_scope` in the customer admin API starts below that root; root replacement, reparenting and deletion are invariants, not ordinary permissions.

## ABAC inputs and rules

The kernel evaluates:

- subject type, assurance, groups and support-session expiry;
- tenant and allowed scope closure;
- capability and operation;
- resource type, business scope, environment and sensitivity;
- evidence capture state, evidence quality and retention/legal-hold state;
- field classification;
- request purpose, export field set and requested time range.

Frozen deny rules:

1. tenant mismatch;
2. missing capability;
3. resource outside the principal's authorized scope/relation;
4. raw evidence without `evidence.object.read`;
5. prohibited/expired evidence or failed legal/purpose constraint;
6. field classification above the principal's maximum;
7. expired or unapproved support session;
8. export asking for a field or row the same principal could not read interactively;
9. correction without step-up assurance, preview digest or current revision;
10. unknown resource/scope state where allowing could expose data.

## Decision contract

Every repository query receives an immutable `AuthorizationFilter`, never a boolean alone:

```text
principal_id
tenant_id
authorization_revision
capability
allowed_scope_ids
allowed_resource_ids (optional narrowing)
allowed_environments
maximum_field_classification
field_mask
time_bound
decision_id
reason_codes
```

Evaluation order:

1. verify authenticated principal and tenant;
2. load/cache the tenant authorization snapshot by revision;
3. match role capability;
4. expand authorized scopes;
5. apply curated relations;
6. evaluate ABAC denies/requirements;
7. produce row filter and field mask;
8. execute the query with `SET LOCAL app.tenant_id`;
9. serialize only permitted fields;
10. write audit when required.

The data repository API cannot be called without an `AuthorizationFilter`. SQL builders join/filter scopes before pagination and aggregation. Filtering after a broad query is forbidden because counts, cursors, timing and caches could leak data.

## Field security

| Class | Examples | Default |
|---|---|---|
| `public_product` | display name, entity type, lifecycle | authorized inventory reader |
| `internal` | source profile, business scope, safe activity subtype | matching reader |
| `sensitive_metadata` | native identifiers, source namespace, actor identity, correlation IDs | explicit role plus scope |
| `restricted_evidence` | immutable evidence body or protected source attributes | explicit `evidence.object.read`, purpose and audit |
| `prohibited` | secrets, credentials, raw tokens, disallowed content | never returned; should not be admitted |

Field masking is schema-defined in `authz/api-field-policy.yaml`. Every OpenAPI
schema with properties has a default classification, overrides may only
strengthen it, and every dynamic map has a key-classification handler. Unknown
schemas, fields and keys fail closed. It never relies on ad hoc frontend hiding.
When a field is withheld, the response may expose an allowed
`field_redactions` reason code but never the value.

## List, graph and aggregate safety

- counts are computed after authorization predicates;
- opaque cursors bind tenant, filter digest, field set, projection generation and authorization revision;
- a changed authorization revision invalidates a cursor;
- relationship traversal may not cross into an unauthorized endpoint;
- graph counts include only visible nodes/edges;
- search snippets contain only allowed projected fields;
- `404` is returned instead of `403` when resource existence itself is sensitive;
- caches key tenant, authorization revision, scope/filter digest, field set and projection generation;
- shared response caches never store raw evidence objects.

## Raw evidence access

The ordinary product UI uses evidence metadata and normalized/canonical provenance. Raw evidence is a separate high-friction operation:

1. re-evaluate `evidence.object.read`;
2. require a declared purpose;
3. verify capture/retention/legal-hold state;
4. create audit intent;
5. issue a single-use, short-lived, tenant/principal/purpose-bound grant and redeem it only through the authenticated API stream;
6. audit completion/failure and bytes returned.

Object-store keys and permanent credentials are never sent to the browser.

## Corrections and optimistic concurrency

Identity correction is two phase:

- `preview` evaluates impact, authorization and invariants, persists the normalized request, and returns a preview ID/digest tied to principal, scope, canonical/authz revisions and expiry;
- `commit` requires that preview ID/digest, an idempotency key, step-up authentication and `If-Match`.

Commit durably queues an identity command and returns its ID. The truth worker rechecks the same scope decision, authorization revision, canonical revision and preview digest before its atomic canonical transaction. Stale/revoked commands terminate as rejected and expose a safe conflict result. The actor cannot move a source object into an entity/scope they cannot review.

Authorization administration uses the same preview resource and API idempotency
ledger. Its commit locks and consumes the preview, advances the authorization
revision, applies rows stamped with that revision, writes the complete closure
snapshot, idempotency response and audit append in one transaction.

## Audit

Always audited:

- authentication/authorization denials;
- raw evidence intent and delivery;
- exports and downloads;
- producer operations;
- identity preview/merge/split/correct/unbind;
- role/scope/relation changes;
- support access;
- replay, repair, retention and projection activation.

Ordinary successful list reads use sampled/aggregated access audit unless contractual policy requires every read. Detail reads of sensitive metadata are individually audited.

Each event records actor, session, action, resource, outcome, reason, request ID,
authorization revision, evidence references and bounded safe details. Hash
chaining is scoped to an ordered tenant audit shard. The PostgreSQL trigger
locks the shard head, requires the next sequence and previous hash, computes the
event hash from PostgreSQL's canonical `jsonb` representation, inserts the
immutable event and requires the same transaction to advance the matching head.
An application-supplied event hash is overwritten; a failed transaction
advances neither.

Maintenance periodically snapshots every shard head, signs the canonical head set through KMS/HSM, stores the immutable checkpoint object, and appends `audit_checkpoint`. Verification detects missing, reordered, mutated or forked events between signed checkpoints. Hashes do not replace database/object access controls.

## Cache and failure behavior

Authorization snapshots are immutable by revision and may be cached briefly. Revocation increments `authorization_revision` transactionally and publishes invalidation. If revision freshness cannot be established for a sensitive action, the request fails closed. Cached allow decisions are never used past their revision/expiry.

Authorization change responses return only after the database transaction commits and the new revision is known. Invalidation publication is an optimization: revision-bound tokens, cursors and cache keys make a stale snapshot unusable even if invalidation delivery is delayed.

The authorization store being unavailable does not turn into an allow. Public health endpoints remain available without tenant data.

## Required tests

- complete role × capability matrix;
- tenant and sibling-scope non-interference;
- ReBAC traversal and cycle rejection;
- ABAC deny precedence;
- field masks and serializer completeness;
- authorization-before-pagination/count/search;
- cursor/authz-revision invalidation;
- raw-evidence and support-session expiry;
- export snapshot authorization;
- correction preview/commit TOCTOU;
- cache isolation/invalidation;
- RLS bypass attempts with every application database role;
- observed inventory edges never granting product access.

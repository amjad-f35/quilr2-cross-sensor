# Unified API and Query Plane

Status: **normative**

## Principles

- One customer-facing API model over canonical entities and product contracts.
- Evidence and operator APIs are separate and more restricted.
- API behavior is stable, versioned, tenant-safe, paginated, and observable.
- Read APIs never assemble contradictory truth ad hoc from multiple backend stores.

## API surfaces

| Surface | Audience | Authority |
|---|---|---|
| Product API | Customer UI and integrations | Canonical/product read models |
| Workflow API | Customer automation | Policy, finding, case, approval, command state |
| Export API | Asynchronous customer exports | Authorized snapshots |
| Evidence API | Investigators and support with grant | Immutable evidence references |
| Operator API | Quilr operations | Cell/producer/connector health |
| Internal service API/events | Platform services | Versioned internal contracts |

## Resource model

Primary resources:

- estate entities and relationships;
- activity and executions;
- findings and cases;
- metrics and time series;
- policies, exceptions, decisions, approvals;
- commands and effects;
- coverage;
- integrations and producers;
- resolution conflicts;
- audit events.

## API conventions

- OpenAPI 3.1.2 is the normative HTTP contract format.
- JSON Schema 2020-12 defines payloads.
- Stable opaque IDs; no business meaning encoded in IDs.
- Cursor pagination with deterministic sort.
- RFC-compliant timestamps and explicit timezone.
- ETags or version preconditions for mutable resources.
- Idempotency keys for mutation creation.
- Structured error type with machine code, safe message, request ID, and field details.
- Rate-limit headers and documented retry behavior.
- Sparse fields and includes only where authorization and cost are bounded.
- Filter and sort fields are allowlisted per resource.

## Authorization

Every request is checked for:

- authenticated principal and tenant;
- environment and regional cell;
- role and attribute scope;
- resource sensitivity;
- operation and purpose;
- field-level restrictions;
- evidence/content grant where applicable.

Object identifiers never bypass authorization. Cross-tenant caching is prohibited.

## Consistency

Product APIs expose projection watermark and freshness where material. Mutations return canonical transaction versions; read-after-write paths use the canonical store or wait for a bounded projection watermark. APIs never imply global linearizability.

## Search

Search is a projection with:

- tenant-specific index;
- authorized-field index mapping;
- canonical ID results;
- projection watermark;
- safe snippets;
- bounded fuzzy matching;
- no restricted content by default.

Search unavailability does not affect canonical writes.

## Bulk and export

Large operations are asynchronous jobs:

- immutable input scope;
- preview for mutations;
- per-item result;
- cancellation where possible;
- progress and expiration;
- encrypted object-store output;
- signed time-bounded download;
- audit;
- customer-configured export retention.

## Webhooks

Customer webhooks use signed events, event IDs, retries, replay protection, delivery logs, secret rotation, and filtering. They convey product events, not internal database changes. Payload schemas are independently versioned.

## Compatibility

- Additive fields do not break clients.
- Enum evolution has an unknown-value strategy.
- Breaking changes require a new major surface and migration window.
- Deprecation is observable per tenant.
- Contract tests run against supported SDKs and the UI.
- API documentation, examples, limits, and error behavior ship with the implementation.

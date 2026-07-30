# Evidence, Activity, and Provenance

Status: **normative pass evidence contract**

## Three distinct product objects

### Source evidence

An immutable statement from an authenticated producer about what it directly observed or did. It preserves source semantics and native identifiers.

### Canonical activity

A versioned central interpretation or correlation of one or more source evidence records into a customer-understandable action such as:

- application use;
- model execution;
- MCP invocation;
- process/application execution;
- browser data operation;
- source-native DLP or enforcement outcome.

### Audit

An immutable record of a user, service, identity, export, evidence-access, migration, configuration, or release action inside Quilr 2.

These are never collapsed into one generic “event.”

## Source evidence minimum

Every admitted record includes:

- tenant and environment;
- producer/workload/installation identity;
- source profile and subtype;
- producer artifact, adapter, runtime, schema, and capability versions;
- producer epoch, sequence, record ID, idempotency key;
- source-native object/action references;
- event, observation, enqueue, ingest, and admission time as applicable;
- correlation/causal identifiers;
- privacy capture state and disposition;
- direct observation/decision/outcome;
- safe measures and bounded attributes;
- relay/member lineage;
- reconciliation/snapshot context;
- correction/supersession reference;
- retention and evidence class;
- central admission receipt.

Missing source time or identity is explicit. The platform does not silently substitute ingest time as event time.

## Canonical activity minimum

When supported:

- activity ID and version;
- activity type;
- actor/person/workload/delegation;
- application/agent;
- model route/deployment;
- MCP server/tool/resource/prompt;
- device/environment/account;
- started/completed times;
- result/outcome/status class;
- existing native decision and effect;
- safe token/unit/latency/count measures;
- data-class indicators;
- source member evidence IDs;
- correlation rule/version/confidence;
- coverage and capture caveats;
- provenance and retention.

An activity may remain source-local when correlation would overstate identity.

## Important event views

The UI provides:

- discovery changes;
- application/agent/model/MCP/tool activity;
- browser and endpoint operations;
- routed model executions;
- MCP invocations;
- native DLP/decision/effect events;
- sensor lifecycle and configuration;
- source gaps, loss, outage, and recovery;
- identity merge/split/correction history;
- migration/backfill events;
- evidence access/export audit.

It does not label frequency or severity as “important” through an ungoverned score. Importance filters are explicit event families and customer-selected scopes.

## Chain of custody

Evidence detail exposes:

```text
native source fact
→ adapter/profile version
→ privacy disposition
→ edge WAL record
→ delivery attempt
→ central admission receipt
→ immutable evidence reference
→ normalizer output/version
→ source claim/object
→ resolver decision/version
→ canonical entity/activity version
→ product projection/watermark
```

Authorized users can distinguish:

- what the sensor asserted;
- what Quilr normalized;
- what Quilr resolved or correlated;
- what the UI projected.

## Privacy and content

Ordinary evidence is metadata-first. Raw content is not needed for this pass.

Capture dispositions:

- `captured_safe`
- `tokenized_approved`
- `redacted`
- `privacy_omitted`
- `prohibited`
- `unsupported`
- `not_available`
- `sampled`
- `restricted_reference`

The UI never implies that omitted content was inspected centrally.

## Time model

- event time: native occurrence;
- observation time: sensor observation;
- edge enqueue time;
- central admission time;
- valid interval: when a source/canonical fact applies;
- system interval: when Quilr knew/selected it;
- projection watermark.

Late and out-of-order evidence is normal. Corrections append and may create a new canonical activity version.

## Retention and deletion

Retention classes are separately configurable for:

- edge WAL;
- immutable evidence;
- high-volume activity projection;
- normalized observations;
- canonical inventory/relationship history;
- audit;
- migration artifacts;
- exports.

Deleting a projection does not delete evidence or canonical history. Tenant deletion, legal hold, source deletion, privacy request, and export expiry propagate through an audited workflow. Exact production periods remain an accountable input.

## Product limitations

- an admitted record proves authenticated producer submission, not physical-world truth beyond that producer's assurance;
- a backend receipt does not prove a browser action if the client record never arrived;
- a gateway action does not prove absence of bypass;
- source policy output does not prove Quilr 2 policy;
- correlation confidence does not become entity-resolution confidence;
- missing evidence under a gap never becomes a negative fact.

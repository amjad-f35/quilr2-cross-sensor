# Source observation contract

The normative draft is [source-observation.schema.json](schemas/source-observation.schema.json).

## Required envelope

| Field | Required | Purpose |
| --- | --- | --- |
| `observation_id` | Yes | Platform idempotency and evidence linkage |
| `tenant_id` | Yes | Isolation and routing |
| `source_sensor_id` | Yes | Installed/deployed source identity |
| `source_sensor_type` | Yes | Registered source schema/capability |
| `source_sensor_version` | No but strongly recommended | Reliability/certification/schema interpretation |
| `source_native_id` | No | Native alias/idempotency input when present |
| `source_object_type` | Yes | Exact source semantic type |
| `entity_kind_hint` | No | Candidate canonical type; never authoritative |
| `observed_at` | Yes | When the source observed/produced the statement |
| `valid_from` / `valid_until` | No | Source-stated fact validity |
| `first_observed_at` / `last_observed_at` | No | Source aggregation bounds |
| `collection_method` | Yes | Push, poll, stream, scan, query, sync, interception |
| `collection_scope` | No | User/device/process/session/account/run/global scope |
| `native_identifiers` | Yes, may be empty | Lossless source IDs |
| `normalized_identifiers` | No | Adapter-normalized candidate IDs |
| `native_attributes` | Yes | Lossless meaningful source fields |
| `normalized_attributes` | No | Versioned normalization output |
| `proposed_relationships` | No | Source relationship statements/candidates |
| `confidence` | Yes | Adapter/source confidence, not merge confidence |
| `raw_payload_reference` | Yes | Immutable raw evidence lookup |
| `schema_version` | Yes | Source-observation schema |
| `ingestion_version` | Yes | Adapter/normalizer version |
| `operation` | Yes | `upsert`, `delete`, `correct`, or `tombstone` |
| `sequence` | No | Source ordering where available |

## One record may mention many entities

An upload observation can mention a user, device, process/browser, application surface/account, file/data class, policy/decision, and destination. The observation remains one source statement; its resolver creates multiple entity candidates and relationship/event inputs. Do not duplicate the raw payload for every entity.

## Idempotency and ordering

Preferred observation ID:

```text
HMAC(tenant-ingestion-key,
     source_sensor_id || source_schema_version ||
     source_native_id || operation || source_revision)
```

If no native ID exists, hash a source-specific canonical subset plus source event time and a collision discriminator. Payload hashes are evidence integrity aids, not cross-tenant global IDs.

- Duplicate delivery with the same ID and payload is a no-op.
- Same ID with a different payload is a correction conflict; preserve both and require a revision/correction record.
- `occurred_at`/`observed_at` ordering never overrides a higher source sequence/revision.
- Late data updates event-time projections and may reopen findings.
- Out-of-order observations are accepted; materializers compare validity and source sequence.
- Delete/tombstone expires only that source assertion. A canonical entity retires only when lifecycle policy and all expected-source coverage support it.

## Reprocessing and schema evolution

- Raw payloads are immutable and addressed by tenant plus content hash/object ID.
- Normalization/resolution/materializer versions are stored separately.
- A new adapter version emits a new derived observation revision or reprocess record; it never mutates the original.
- Replay is tenant-, source-, schema-, and time-bounded.
- Resolver/manual decisions may be pinned, superseded, or invalidated; replay respects active manual constraints.

## Staleness and unknown

For each source/object type configure:

```text
expected cadence
late-arrival allowance
stale threshold
retirement threshold
delete semantics
coverage requirement
```

No observation means `unknown` unless a healthy, in-scope source was expected to report and its negative/delta semantics prove absence. “Sensor stale” and “asset absent” are different facts.

## Raw evidence integrity

The raw/evidence layer records:

- tenant and source identity;
- payload content hash, byte length, media/schema type;
- received time and transport metadata;
- encryption/key version;
- retention/legal-hold policy;
- adapter signature/version;
- access log;
- optional source signature/certificate/sequence.

Evidence confidence is reduced when the source is unauthenticated, regenerates IDs/time, logs after transformation only, or has known loss/correlation defects.

## Source-specific adapter requirements

- Browser/native upload adapter must create a stable per-file element ID instead of preserving positional ambiguity.
- Endpoint adapter must retain raw Lua relationships/risk/rich attributes even though current v2 conversion drops them.
- LLM gateway adapter must qualify provider/model/deployment/route and actor credential context.
- MCP adapter cannot be declared complete until native source contracts are supplied.
- Quilr 1 backfill adapters must attach table/schema/query provenance and never claim that current cache/graph values were the event-time truth.

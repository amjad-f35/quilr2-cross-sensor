# Event correlation and deduplication

## Two different operations

1. **Deduplication** removes repeated delivery or exact copies of the same source fact.
2. **Correlation** groups independent observations that likely describe one real-world activity.

Do not delete independent observations after correlation. One canonical event/activity may have many observers/evidence records.

## Exact duplicate rules

Preferred key:

```text
tenant_id
+ source_sensor_id
+ source_schema_version
+ source_native_event_id
+ source_revision/operation
```

Without a native ID, use a versioned source-specific fingerprint over stable fields. Never use only timestamp and display name.

## Candidate correlation keys

Ranked strongest to weakest:

1. shared request/correlation/context/prompt/run/tool-call/action ID;
2. browser/native request ID plus stable per-file element ID;
3. gateway request ID plus propagated endpoint/browser trace ID;
4. device + process start identity + destination + connection/request identity;
5. user/account + application surface + file content-safe digest/size/name + direction;
6. actor + provider/model/tool + normalized target + bounded time window;
7. timestamp/name-only similarity—review/analytics candidate only.

Clock offset is learned per sensor from heartbeats/ingestion comparisons and bounded; it is not silently subtracted without recording the estimate.

## File-upload example

```text
Browser: selected File metadata and upload to claude.ai
Native host: local path resolution and DLP scan
Endpoint proxy: process read/network destination
LLM Gateway: prompt attachment/request (only if path uses gateway)
DLP: customer-data classification
```

Correlation produces:

- one parent `data.transferred` activity when keys/confidence pass threshold;
- child `data.read`, `data.uploaded`, `prompt.submitted`, policy/decision events as actually observed;
- all source observations/evidence and their timestamps;
- unresolved alternate candidates when positional file association is unsafe.

The current browser/native positional defect lowers confidence and blocks high-severity automatic correlation when a mixed batch can misassociate files.

## Keep events separate when

- different source-native IDs prove separate actions;
- distinct process start identities or account IDs exist;
- directions/targets/files/tool calls differ materially;
- time windows overlap but no shared actor/resource/correlation evidence exists;
- a retry has a distinct provider/action idempotency key and could execute independently;
- one record is configuration/discovery and another is actual activity;
- one record is a decision and another is observed effect.

## Correlation output

```text
correlation_group_id
canonical parent event ID
member event/observation IDs
rule/version
matched and conflicting features
estimated clock offsets
score/threshold
correlation window
root actor/action/resource
manual override/split history
```

Late evidence can increase/decrease confidence, attach a new observer, split a parent, or update/reopen a finding. The original correlation versions remain auditable.

## Cross-sensor contradiction

If browser says blocked but endpoint observes network effect:

- retain both;
- create decision and effect events;
- correlate them under the action;
- mark enforcement outcome conflict;
- open “Sensors report inconsistent enforcement outcomes” or “Authorized action effect differed” only when actionability/evidence thresholds pass.

## Finding dedup

Event correlation precedes finding correlation. A root-cause finding key normally includes:

```text
tenant
+ finding_type
+ root_cause canonical entity
+ affected scope/data class/policy
+ finding generation/window
```

Sensor name and source alert ID are evidence fields, not root-cause dedup keys.

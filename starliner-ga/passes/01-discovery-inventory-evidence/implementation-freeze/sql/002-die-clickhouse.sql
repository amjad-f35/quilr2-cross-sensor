CREATE DATABASE IF NOT EXISTS die;

CREATE TABLE IF NOT EXISTS die.activity_versions_v1
(
    tenant_id String,
    activity_id UUID,
    canonical_version UInt64,
    occurred_at DateTime64(6, 'UTC'),
    ingested_at DateTime64(6, 'UTC'),
    family LowCardinality(String),
    subtype LowCardinality(String),
    business_scope_id UUID,
    environment LowCardinality(String),
    sensitivity LowCardinality(String),
    lifecycle LowCardinality(String),
    visibility LowCardinality(String),
    outcome LowCardinality(String),
    actor_entity_id Nullable(UUID),
    actor_entity_type LowCardinality(String),
    resource_entity_ids Array(UUID),
    resource_entity_types Array(LowCardinality(String)),
    source_profile LowCardinality(String),
    producer_id UUID,
    native_decision LowCardinality(String),
    effect LowCardinality(String),
    evidence_ids Array(UUID),
    capture_state LowCardinality(String),
    coverage_state LowCardinality(String),
    correlation_tokens Map(LowCardinality(String), String),
    safe_metric_names Array(LowCardinality(String)),
    safe_metric_values Array(Float64),
    canonical_watermark UInt64,
    projection_generation UInt64,
    row_digest FixedString(64),
    CONSTRAINT resource_array_lengths CHECK length(resource_entity_ids) = length(resource_entity_types),
    CONSTRAINT metric_array_lengths CHECK length(safe_metric_names) = length(safe_metric_values),
    CONSTRAINT bounded_activity_arrays CHECK
      length(resource_entity_ids) <= 256
      AND length(evidence_ids) <= 256
      AND length(safe_metric_names) <= 128,
    CONSTRAINT bounded_activity_correlation CHECK
      length(correlation_tokens) <= 32
      AND arrayAll(x -> length(x) BETWEEN 1 AND 128, mapKeys(correlation_tokens))
      AND arrayAll(x -> length(x) <= 512, mapValues(correlation_tokens)),
    CONSTRAINT safe_metric_values CHECK
      arrayAll(x -> isFinite(x) AND abs(x) <= 9007199254740991, safe_metric_values),
    CONSTRAINT safe_integer_bounds CHECK
      canonical_version <= 9007199254740991
      AND canonical_watermark <= 9007199254740991
      AND projection_generation <= 9007199254740991,
    CONSTRAINT activity_row_digest_hex CHECK match(toString(row_digest), '^[0-9a-f]{64}$')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(occurred_at)
ORDER BY (tenant_id, projection_generation, business_scope_id, toDate(occurred_at), family, activity_id, canonical_version)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS die.activity_current_state_v1
(
    tenant_id String,
    projection_generation UInt64,
    activity_id UUID,
    occurred_at_state AggregateFunction(argMax, DateTime64(6, 'UTC'), Tuple(UInt64, FixedString(64))),
    family_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    subtype_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    business_scope_id_state AggregateFunction(argMax, UUID, Tuple(UInt64, FixedString(64))),
    environment_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    sensitivity_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    lifecycle_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    visibility_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    outcome_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    actor_entity_id_state AggregateFunction(argMax, Nullable(UUID), Tuple(UInt64, FixedString(64))),
    actor_entity_type_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    resource_entity_ids_state AggregateFunction(argMax, Array(UUID), Tuple(UInt64, FixedString(64))),
    resource_entity_types_state AggregateFunction(argMax, Array(String), Tuple(UInt64, FixedString(64))),
    source_profile_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    producer_id_state AggregateFunction(argMax, UUID, Tuple(UInt64, FixedString(64))),
    native_decision_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    effect_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    evidence_ids_state AggregateFunction(argMax, Array(UUID), Tuple(UInt64, FixedString(64))),
    capture_state_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    coverage_state_state AggregateFunction(argMax, String, Tuple(UInt64, FixedString(64))),
    correlation_tokens_state AggregateFunction(argMax, Map(String, String), Tuple(UInt64, FixedString(64))),
    safe_metric_names_state AggregateFunction(argMax, Array(String), Tuple(UInt64, FixedString(64))),
    safe_metric_values_state AggregateFunction(argMax, Array(Float64), Tuple(UInt64, FixedString(64))),
    canonical_watermark_state AggregateFunction(max, UInt64),
    canonical_version_state AggregateFunction(max, UInt64)
)
ENGINE = AggregatingMergeTree
PARTITION BY cityHash64(tenant_id) % 32
ORDER BY (tenant_id, projection_generation, activity_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS die.activity_current_mv_v1
TO die.activity_current_state_v1
AS
SELECT
    tenant_id,
    projection_generation,
    activity_id,
    argMaxState(occurred_at, tuple(canonical_version, row_digest)) AS occurred_at_state,
    argMaxState(toString(family), tuple(canonical_version, row_digest)) AS family_state,
    argMaxState(toString(subtype), tuple(canonical_version, row_digest)) AS subtype_state,
    argMaxState(business_scope_id, tuple(canonical_version, row_digest)) AS business_scope_id_state,
    argMaxState(toString(environment), tuple(canonical_version, row_digest)) AS environment_state,
    argMaxState(toString(sensitivity), tuple(canonical_version, row_digest)) AS sensitivity_state,
    argMaxState(toString(lifecycle), tuple(canonical_version, row_digest)) AS lifecycle_state,
    argMaxState(toString(visibility), tuple(canonical_version, row_digest)) AS visibility_state,
    argMaxState(toString(outcome), tuple(canonical_version, row_digest)) AS outcome_state,
    argMaxState(actor_entity_id, tuple(canonical_version, row_digest)) AS actor_entity_id_state,
    argMaxState(toString(actor_entity_type), tuple(canonical_version, row_digest)) AS actor_entity_type_state,
    argMaxState(resource_entity_ids, tuple(canonical_version, row_digest)) AS resource_entity_ids_state,
    argMaxState(arrayMap(x -> toString(x), resource_entity_types), tuple(canonical_version, row_digest)) AS resource_entity_types_state,
    argMaxState(toString(source_profile), tuple(canonical_version, row_digest)) AS source_profile_state,
    argMaxState(producer_id, tuple(canonical_version, row_digest)) AS producer_id_state,
    argMaxState(toString(native_decision), tuple(canonical_version, row_digest)) AS native_decision_state,
    argMaxState(toString(effect), tuple(canonical_version, row_digest)) AS effect_state,
    argMaxState(evidence_ids, tuple(canonical_version, row_digest)) AS evidence_ids_state,
    argMaxState(toString(capture_state), tuple(canonical_version, row_digest)) AS capture_state_state,
    argMaxState(toString(coverage_state), tuple(canonical_version, row_digest)) AS coverage_state_state,
    argMaxState(
      CAST(correlation_tokens, 'Map(String, String)'),
      tuple(canonical_version, row_digest)
    ) AS correlation_tokens_state,
    argMaxState(arrayMap(x -> toString(x), safe_metric_names), tuple(canonical_version, row_digest)) AS safe_metric_names_state,
    argMaxState(safe_metric_values, tuple(canonical_version, row_digest)) AS safe_metric_values_state,
    maxState(canonical_watermark) AS canonical_watermark_state,
    maxState(canonical_version) AS canonical_version_state
FROM die.activity_versions_v1
GROUP BY tenant_id, projection_generation, activity_id;

CREATE VIEW IF NOT EXISTS die.activity_current_v1 AS
SELECT
    tenant_id,
    projection_generation,
    activity_id,
    argMaxMerge(occurred_at_state) AS occurred_at,
    argMaxMerge(family_state) AS family,
    argMaxMerge(subtype_state) AS subtype,
    argMaxMerge(business_scope_id_state) AS business_scope_id,
    argMaxMerge(environment_state) AS environment,
    argMaxMerge(sensitivity_state) AS sensitivity,
    argMaxMerge(lifecycle_state) AS lifecycle,
    argMaxMerge(visibility_state) AS visibility,
    argMaxMerge(outcome_state) AS outcome,
    argMaxMerge(actor_entity_id_state) AS actor_entity_id,
    argMaxMerge(actor_entity_type_state) AS actor_entity_type,
    argMaxMerge(resource_entity_ids_state) AS resource_entity_ids,
    argMaxMerge(resource_entity_types_state) AS resource_entity_types,
    argMaxMerge(source_profile_state) AS source_profile,
    argMaxMerge(producer_id_state) AS producer_id,
    argMaxMerge(native_decision_state) AS native_decision,
    argMaxMerge(effect_state) AS effect,
    argMaxMerge(evidence_ids_state) AS evidence_ids,
    argMaxMerge(capture_state_state) AS capture_state,
    argMaxMerge(coverage_state_state) AS coverage_state,
    argMaxMerge(correlation_tokens_state) AS correlation_tokens,
    argMaxMerge(safe_metric_names_state) AS safe_metric_names,
    argMaxMerge(safe_metric_values_state) AS safe_metric_values,
    maxMerge(canonical_watermark_state) AS canonical_watermark,
    maxMerge(canonical_version_state) AS canonical_version
FROM die.activity_current_state_v1
GROUP BY tenant_id, projection_generation, activity_id
HAVING lifecycle = 'active' AND visibility = 'visible';

CREATE TABLE IF NOT EXISTS die.evidence_search_v1
(
    tenant_id String,
    evidence_id UUID,
    received_at DateTime64(6, 'UTC'),
    occurred_at DateTime64(6, 'UTC'),
    source_profile LowCardinality(String),
    record_type LowCardinality(String),
    producer_id UUID,
    business_scope_id UUID,
    environment LowCardinality(String),
    sensitivity LowCardinality(String),
    source_object_type LowCardinality(String),
    source_namespace String,
    source_object_token String,
    capture_state LowCardinality(String),
    evidence_quality LowCardinality(String),
    trust_state LowCardinality(String),
    disposition_state LowCardinality(String),
    correlation_tokens Map(LowCardinality(String), String),
    canonical_entity_ids Array(UUID),
    canonical_activity_ids Array(UUID),
    normalization_version String,
    canonical_watermark UInt64,
    projection_generation UInt64,
    row_digest FixedString(64),
    CONSTRAINT safe_integer_bounds CHECK
      canonical_watermark <= 9007199254740991
      AND projection_generation <= 9007199254740991
      AND length(canonical_entity_ids) <= 1024
      AND length(canonical_activity_ids) <= 1024
      AND length(correlation_tokens) <= 32
      AND length(source_namespace) <= 256
      AND length(source_object_token) <= 512
      AND length(normalization_version) <= 128,
    CONSTRAINT bounded_evidence_correlation CHECK
      arrayAll(x -> length(x) BETWEEN 1 AND 128, mapKeys(correlation_tokens))
      AND arrayAll(x -> length(x) <= 512, mapValues(correlation_tokens)),
    CONSTRAINT evidence_row_digest_hex CHECK match(toString(row_digest), '^[0-9a-f]{64}$')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(received_at)
ORDER BY (tenant_id, projection_generation, business_scope_id, toDate(received_at), source_profile, evidence_id)
SETTINGS index_granularity = 8192;

CREATE VIEW IF NOT EXISTS die.evidence_search_current_v1 AS
SELECT
    tenant_id,
    projection_generation,
    evidence_id,
    argMax(received_at, tuple(canonical_watermark, row_digest)) AS received_at,
    argMax(occurred_at, tuple(canonical_watermark, row_digest)) AS occurred_at,
    argMax(toString(source_profile), tuple(canonical_watermark, row_digest)) AS source_profile,
    argMax(toString(record_type), tuple(canonical_watermark, row_digest)) AS record_type,
    argMax(producer_id, tuple(canonical_watermark, row_digest)) AS producer_id,
    argMax(business_scope_id, tuple(canonical_watermark, row_digest)) AS business_scope_id,
    argMax(toString(environment), tuple(canonical_watermark, row_digest)) AS environment,
    argMax(toString(sensitivity), tuple(canonical_watermark, row_digest)) AS sensitivity,
    argMax(toString(source_object_type), tuple(canonical_watermark, row_digest)) AS source_object_type,
    argMax(source_namespace, tuple(canonical_watermark, row_digest)) AS source_namespace,
    argMax(source_object_token, tuple(canonical_watermark, row_digest)) AS source_object_token,
    argMax(toString(capture_state), tuple(canonical_watermark, row_digest)) AS capture_state,
    argMax(toString(evidence_quality), tuple(canonical_watermark, row_digest)) AS evidence_quality,
    argMax(toString(trust_state), tuple(canonical_watermark, row_digest)) AS trust_state,
    argMax(toString(disposition_state), tuple(canonical_watermark, row_digest)) AS disposition_state,
    argMax(correlation_tokens, tuple(canonical_watermark, row_digest)) AS correlation_tokens,
    argMax(canonical_entity_ids, tuple(canonical_watermark, row_digest)) AS canonical_entity_ids,
    argMax(canonical_activity_ids, tuple(canonical_watermark, row_digest)) AS canonical_activity_ids,
    argMax(normalization_version, tuple(canonical_watermark, row_digest)) AS normalization_version,
    max(canonical_watermark) AS canonical_watermark
FROM die.evidence_search_v1
GROUP BY tenant_id, projection_generation, evidence_id
HAVING disposition_state NOT IN ('object_deleted', 'deleted');

ALTER TABLE die.activity_versions_v1
  ADD INDEX IF NOT EXISTS idx_actor actor_entity_id TYPE bloom_filter(0.01) GRANULARITY 4;
ALTER TABLE die.activity_versions_v1
  ADD INDEX IF NOT EXISTS idx_resources resource_entity_ids TYPE bloom_filter(0.01) GRANULARITY 4;
ALTER TABLE die.activity_versions_v1
  ADD INDEX IF NOT EXISTS idx_correlation mapValues(correlation_tokens) TYPE bloom_filter(0.01) GRANULARITY 4;
ALTER TABLE die.evidence_search_v1
  ADD INDEX IF NOT EXISTS idx_evidence_entities canonical_entity_ids TYPE bloom_filter(0.01) GRANULARITY 4;

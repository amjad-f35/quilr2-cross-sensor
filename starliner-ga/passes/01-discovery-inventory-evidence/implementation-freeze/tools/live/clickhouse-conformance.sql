SET async_insert = 0;
SET wait_for_async_insert = 1;

INSERT INTO die.activity_versions_v1
(
  tenant_id, activity_id, canonical_version, occurred_at, ingested_at, family,
  subtype, business_scope_id, environment, sensitivity, lifecycle, visibility,
  outcome, actor_entity_id, actor_entity_type, resource_entity_ids,
  resource_entity_types, source_profile, producer_id, native_decision, effect,
  evidence_ids, capture_state, coverage_state, correlation_tokens,
  safe_metric_names, safe_metric_values, canonical_watermark,
  projection_generation, row_digest
)
VALUES
(
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 1,
  '2026-07-30 00:00:00.000000', '2026-07-30 00:00:01.000000',
  'application', 'application.used', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  'test', 'internal', 'active', 'visible', 'succeeded', NULL, '',
  [], [], 'browser', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '', '', [],
  'complete', 'covered', map('request', 'token-a'), [], [], 1, 1,
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
),
(
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 1,
  '2026-07-30 00:00:00.000000', '2026-07-30 00:00:02.000000',
  'agent', 'agent.observed', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  'test', 'internal', 'active', 'visible', 'succeeded', NULL, '',
  [], [], 'endpoint', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '', '', [],
  'complete', 'covered', map('request', 'token-a'), [], [], 1, 1,
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
);

SELECT throwIf(
  (SELECT family FROM die.activity_current_v1
   WHERE tenant_id = 'die-live-a'
     AND activity_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1') != 'agent',
  'deterministic argMax tie-break failed'
);

INSERT INTO die.evidence_search_v1
(
  tenant_id, evidence_id, received_at, occurred_at, source_profile, record_type,
  producer_id, business_scope_id, environment, sensitivity, source_object_type,
  source_namespace, source_object_token, capture_state, evidence_quality,
  trust_state, disposition_state, correlation_tokens, canonical_entity_ids,
  canonical_activity_ids, normalization_version, canonical_watermark,
  projection_generation, row_digest
)
VALUES
(
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  '2026-07-30 00:00:00.000000', '2026-07-30 00:00:00.000000',
  'endpoint', 'object.observed', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'test', 'internal', 'device',
  'endpoint', 'token-a', 'complete', 'audit_grade', 'trusted', 'active',
  map('request', 'token-a'), [], [], '1.0.0', 1, 1,
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
),
(
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  '2026-07-30 00:00:00.000000', '2026-07-30 00:00:00.000000',
  'endpoint', 'object.observed', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'test', 'internal', 'device',
  'endpoint', 'token-a', 'complete', 'audit_grade', 'trusted', 'deleted',
  map('request', 'token-a'), [], [], '1.0.0', 2, 1,
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
);

SELECT throwIf(
  (SELECT count() FROM die.evidence_search_current_v1
   WHERE tenant_id = 'die-live-a'
     AND evidence_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4') != 0,
  'deleted evidence remained in current search projection'
);

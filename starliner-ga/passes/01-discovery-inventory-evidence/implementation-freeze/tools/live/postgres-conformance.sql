\set ON_ERROR_STOP on

BEGIN;

INSERT INTO die_authz.authorization_revision (tenant_id, revision, updated_at)
VALUES
  ('die-live-a', 1, '2026-07-30T00:00:00Z'),
  ('die-live-b', 1, '2026-07-30T00:00:00Z');

INSERT INTO die_authz.business_scope (
  tenant_id, scope_id, scope_type, parent_scope_id, display_name, lifecycle, revision
) VALUES
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'tenant', NULL, 'Tenant A', 'active', 1),
  ('die-live-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'tenant', NULL, 'Tenant B', 'active', 1);

INSERT INTO die_control.producer (
  tenant_id, producer_id, installation_id, source_profile, business_scope_id,
  display_name, trust_state, artifact_digest, active_certification_id,
  credential_subject, environment, first_enrolled_at, revision
) VALUES
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'endpoint-a', 'endpoint',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Endpoint A', 'pending',
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    NULL, 'spiffe://die-live-a/endpoint-a', 'test', '2026-07-30T00:00:00Z', 1
  ),
  (
    'die-live-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'endpoint-b', 'endpoint',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Endpoint B', 'pending',
    'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    NULL, 'spiffe://die-live-b/endpoint-b', 'test', '2026-07-30T00:00:00Z', 1
  );

CREATE ROLE die_live_api LOGIN NOBYPASSRLS;
CREATE ROLE die_live_api_b LOGIN NOBYPASSRLS;
CREATE ROLE die_live_ingest LOGIN NOBYPASSRLS;
CREATE ROLE die_live_authz LOGIN NOBYPASSRLS;
CREATE ROLE die_live_normalizer LOGIN NOBYPASSRLS;
CREATE ROLE die_live_truth LOGIN NOBYPASSRLS;
CREATE ROLE die_live_maintenance LOGIN NOBYPASSRLS;
CREATE ROLE die_live_indirect LOGIN NOBYPASSRLS;
CREATE ROLE die_live_role_bridge NOLOGIN NOBYPASSRLS;
GRANT die_api TO die_live_api;
GRANT die_api TO die_live_api_b;
GRANT die_ingest TO die_live_ingest;
GRANT die_authz_admin TO die_live_authz;
GRANT die_normalizer TO die_live_normalizer;
GRANT die_truth TO die_live_truth;
GRANT die_maintenance TO die_live_maintenance;
GRANT die_normalizer TO die_live_indirect;
GRANT die_truth TO die_live_role_bridge;
GRANT die_live_role_bridge TO die_live_indirect;

INSERT INTO die_control.tenant_cell_assignment (
  tenant_id, cell_id, state, scheduling_weight, assigned_at, revision
) VALUES
  ('die-live-a', 'cell-a', 'active', 100, '2026-07-30T00:00:00Z', 1),
  ('die-live-b', 'cell-b', 'active', 100, '2026-07-30T00:00:00Z', 1);
INSERT INTO die_control.tenant_cell_principal (
  tenant_id, principal_binding_id, cell_id, database_principal, workload_role,
  state, assigned_at, revision
) VALUES
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'cell-a', 'die_live_api', 'die_api', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', 'cell-b', 'die_live_api_b', 'die_api', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'cell-a', 'die_live_ingest', 'die_ingest', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03', 'cell-a', 'die_live_authz', 'die_authz_admin', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04', 'cell-a', 'die_live_normalizer', 'die_normalizer', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05', 'cell-a', 'die_live_truth', 'die_truth', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06', 'cell-a', 'die_live_maintenance', 'die_maintenance', 'active', '2026-07-30T00:00:00Z', 1);

DO $$
BEGIN
  BEGIN
    INSERT INTO die_control.tenant_cell_principal (
      tenant_id, principal_binding_id, cell_id, database_principal,
      workload_role, state, assigned_at, revision
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07', 'cell-a',
      'die_live_indirect', 'die_normalizer', 'active',
      '2026-07-30T00:00:00Z', 1
    );
    RAISE EXCEPTION 'transitive second DIE workload role was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'transitive second DIE workload role was accepted'
        OR position('exactly its declared DIE workload role' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;

SET SESSION AUTHORIZATION die_live_api;
SET LOCAL app.tenant_id = 'die-live-a';
DO $$
DECLARE
  visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM die_control.producer;
  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'RLS tenant isolation failed: expected one producer, got %', visible_count;
  END IF;
  IF EXISTS (
    SELECT 1 FROM die_control.producer WHERE tenant_id = 'die-live-b'
  ) THEN
    RAISE EXCEPTION 'RLS tenant isolation leaked tenant B';
  END IF;
END
$$;
SET LOCAL app.tenant_id = 'die-live-b';
DO $$
DECLARE
  visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM die_control.producer;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'unassigned tenant context was trusted for the API login';
  END IF;
END
$$;
RESET SESSION AUTHORIZATION;

-- Principal history must not pin a tenant to its first cell. Revoke every
-- principal in the old cell, move the assignment, then rebind the same login.
UPDATE die_control.tenant_cell_principal
SET state = 'revoked', revoked_at = '2026-07-30T00:01:00Z', revision = 2
WHERE tenant_id = 'die-live-b'
  AND principal_binding_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01';
UPDATE die_control.tenant_cell_assignment
SET cell_id = 'cell-b2', assigned_at = '2026-07-30T00:01:00Z', revision = 2
WHERE tenant_id = 'die-live-b';
INSERT INTO die_control.tenant_cell_principal (
  tenant_id, principal_binding_id, cell_id, database_principal, workload_role,
  state, assigned_at, revision
) VALUES (
  'die-live-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'cell-b2',
  'die_live_api_b', 'die_api', 'active', '2026-07-30T00:01:00Z', 1
);
SET SESSION AUTHORIZATION die_live_api_b;
SET LOCAL app.tenant_id = 'die-live-b';
DO $$
DECLARE
  visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM die_control.producer;
  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'rebound principal could not enter the moved tenant cell';
  END IF;
END
$$;
RESET SESSION AUTHORIZATION;

SET SESSION AUTHORIZATION die_live_ingest;
SET LOCAL app.tenant_id = 'die-live-a';
UPDATE die_control.producer
SET last_seen_at = '2026-07-30T00:01:00Z'
WHERE producer_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
DO $$
BEGIN
  BEGIN
    UPDATE die_control.producer
    SET last_seen_at = '2026-07-29T23:59:00Z'
    WHERE producer_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
    RAISE EXCEPTION 'producer last_seen regression was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'producer last_seen regression was accepted'
        OR position('producer last_seen_at cannot regress' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
DO $$
BEGIN
  BEGIN
    UPDATE die_control.producer
    SET last_seen_at = NULL
    WHERE producer_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
    RAISE EXCEPTION 'producer last_seen reset to null was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'producer last_seen reset to null was accepted'
        OR position('producer last_seen_at cannot regress' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
RESET SESSION AUTHORIZATION;

SET SESSION AUTHORIZATION die_live_authz;
SET LOCAL app.tenant_id = 'die-live-a';
INSERT INTO die_authz.role_binding (
  tenant_id, binding_id, subject_type, subject_id, role, scope_id, conditions,
  valid_from, granted_by, revision
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'user', 'alice',
  'inventory_viewer', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{}',
  '2026-07-30T00:00:00Z', 'bootstrap', 1
);
DO $$
BEGIN
  BEGIN
    INSERT INTO die_authz.role_binding (
      tenant_id, binding_id, subject_type, subject_id, role, scope_id, conditions,
      valid_from, granted_by, revision
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'user', 'mallory',
      'tenant_admin', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '{}',
      '2026-07-30T00:00:00Z', 'invalid-future', 7
    );
    RAISE EXCEPTION 'future authorization revision was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'future authorization revision was accepted'
        OR position('authorization grant must be open and stamped with the current authorization revision' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
UPDATE die_authz.authorization_revision
SET revision = 2, updated_at = '2026-07-30T00:02:00Z'
WHERE tenant_id = 'die-live-a';
UPDATE die_authz.role_binding
SET valid_to = '2026-07-30T00:02:00Z', closed_revision = 2
WHERE binding_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
RESET SESSION AUTHORIZATION;

INSERT INTO die_audit.audit_head (
  tenant_id, audit_shard, last_sequence, last_event_hash, updated_at
) VALUES ('die-live-a', 0, 0, NULL, '2026-07-30T00:00:00Z');
INSERT INTO die_audit.audit_event (
  tenant_id, audit_id, audit_shard, audit_sequence, occurred_at, actor_type,
  actor_id, action, resource_type, resource_id, business_scope_id, outcome,
  reason_code, request_id, authorization_revision, safe_details, previous_hash,
  event_hash
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 0, 1,
  '2026-07-30T00:03:00Z', 'system', 'conformance', 'test.append', 'test',
  'row-1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'succeeded', 'TEST',
  'request-1', 2, '{}', NULL,
  'sha256:0000000000000000000000000000000000000000000000000000000000000000'
);
UPDATE die_audit.audit_head head
SET last_sequence = event.audit_sequence,
    last_event_hash = event.event_hash,
    updated_at = event.occurred_at
FROM die_audit.audit_event event
WHERE head.tenant_id = event.tenant_id
  AND head.audit_shard = event.audit_shard
  AND event.audit_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_audit.audit_event event
    JOIN die_audit.audit_head head
      USING (tenant_id, audit_shard)
    WHERE event.audit_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
      AND event.event_hash = head.last_event_hash
      AND event.event_hash <> 'sha256:0000000000000000000000000000000000000000000000000000000000000000'
  ) THEN
    RAISE EXCEPTION 'database-authoritative audit hashing/head advancement failed';
  END IF;
END
$$;

-- Expected-population history must close the prior interval and advance one.
INSERT INTO die_control.expected_population (
  tenant_id, population_id, producer_id, capability, population_type,
  source_namespace, source_population_id, current_revision, lifecycle,
  created_at, updated_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'inventory', 'device',
  'endpoint-agent', 'managed-devices', 1, 'active',
  '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z'
);
INSERT INTO die_control.expected_population_version (
  tenant_id, population_id, revision, business_scope_id, environment,
  expected_count, authority_type, authority_ref, lifecycle, valid_from,
  system_from
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 1,
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test', 1,
  'deployment_config', 'fixture:managed-devices', 'active',
  '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z'
);
UPDATE die_control.expected_population_version
SET valid_to = '2026-07-30T00:10:00Z',
    system_to = '2026-07-30T00:10:00Z'
WHERE tenant_id = 'die-live-a'
  AND population_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
  AND revision = 1;
INSERT INTO die_control.expected_population_version (
  tenant_id, population_id, revision, business_scope_id, environment,
  expected_count, authority_type, authority_ref, lifecycle, valid_from,
  system_from
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 2,
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test', 2,
  'deployment_config', 'fixture:managed-devices:v2', 'active',
  '2026-07-30T00:10:00Z', '2026-07-30T00:10:00Z'
);
UPDATE die_control.expected_population
SET current_revision = 2, updated_at = '2026-07-30T00:10:00Z'
WHERE tenant_id = 'die-live-a'
  AND population_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6';
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
BEGIN
  BEGIN
    UPDATE die_control.expected_population_version
    SET expected_count = 99
    WHERE tenant_id = 'die-live-a'
      AND population_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6'
      AND revision = 2;
    RAISE EXCEPTION 'expected-population payload mutation was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'expected-population payload mutation was accepted'
        OR position('expected population version payload is immutable' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET CONSTRAINTS ALL DEFERRED;

-- Canonical heads start at one and select the exact committed version/outbox.
INSERT INTO die_canonical.entity (
  tenant_id, entity_id, entity_type, current_version, lifecycle,
  first_observed_at, last_observed_at, created_at, updated_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'device', 1, 'active',
  '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z',
  '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z'
);
INSERT INTO die_canonical.entity_version (
  tenant_id, entity_id, version, entity_type, lifecycle, canonical_name,
  display_name, business_scope_id, environment, attributes, materializer_name,
  materializer_version, valid_from, system_from, change_reason
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 1, 'device', 'active',
  'device-a', 'Device A', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test', '{}',
  'live-conformance', '1.0.0', '2026-07-30T00:00:00Z',
  '2026-07-30T00:00:00Z', 'created'
);
INSERT INTO die_outbox.canonical_change (
  tenant_id, aggregate_type, aggregate_id, aggregate_version, change_type,
  partition_key, payload_version, aggregate_digest, causation_audit_event_id,
  payload, created_at
) VALUES (
  'die-live-a', 'entity', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 1, 'created',
  'entity:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'die.outbox.pointer.v1',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '{"entity_type":"device"}',
  '2026-07-30T00:11:00Z'
);
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
BEGIN
  BEGIN
    INSERT INTO die_canonical.entity (
      tenant_id, entity_id, entity_type, current_version, lifecycle,
      first_observed_at, last_observed_at, created_at, updated_at
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8', 'device', 42, 'active',
      '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z',
      '2026-07-30T00:00:00Z', '2026-07-30T00:00:00Z'
    );
    RAISE EXCEPTION 'non-one canonical head was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'non-one canonical head was accepted'
        OR position('canonical head version must start at one' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
  BEGIN
    INSERT INTO die_outbox.canonical_change (
      tenant_id, aggregate_type, aggregate_id, aggregate_version, change_type,
      partition_key, payload_version, aggregate_digest, causation_audit_event_id,
      payload, created_at
    ) VALUES (
      'die-live-a', 'entity', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 2,
      'coverage_changed', 'entity:bad', 'die.outbox.pointer.v1',
      'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '{}', '2026-07-30T00:12:00Z'
    );
    RAISE EXCEPTION 'aggregate-incompatible outbox change was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'aggregate-incompatible outbox change was accepted'
        OR position('outbox change type is incompatible with its aggregate type' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET CONSTRAINTS ALL DEFERRED;

-- Coverage revisions are identity-preserving, serialized and exact-next.
INSERT INTO die_canonical.coverage_interval (
  tenant_id, coverage_id, producer_id, business_scope_id, capability,
  population_id, state, valid_from, revision, system_from
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'inventory',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'covered',
  '2026-07-30T00:00:00Z', 1, '2026-07-30T00:00:00Z'
);
INSERT INTO die_outbox.canonical_change (
  tenant_id, aggregate_type, aggregate_id, aggregate_version, change_type,
  partition_key, payload_version, aggregate_digest, causation_audit_event_id,
  payload, created_at
) VALUES (
  'die-live-a', 'coverage', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', 1,
  'coverage_changed', 'coverage:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
  'die.outbox.pointer.v1',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '{"state":"covered"}',
  '2026-07-30T00:13:00Z'
);
UPDATE die_canonical.coverage_interval
SET valid_to = '2026-07-30T00:20:00Z',
    system_to = '2026-07-30T00:20:00Z'
WHERE tenant_id = 'die-live-a'
  AND coverage_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9'
  AND revision = 1;
INSERT INTO die_canonical.coverage_interval (
  tenant_id, coverage_id, producer_id, business_scope_id, capability,
  population_id, state, valid_from, revision, system_from
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'inventory',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'degraded',
  '2026-07-30T00:20:00Z', 2, '2026-07-30T00:20:00Z'
);
INSERT INTO die_outbox.canonical_change (
  tenant_id, aggregate_type, aggregate_id, aggregate_version, change_type,
  partition_key, payload_version, aggregate_digest, causation_audit_event_id,
  payload, created_at
) VALUES (
  'die-live-a', 'coverage', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', 2,
  'coverage_changed', 'coverage:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
  'die.outbox.pointer.v1',
  'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '{"state":"degraded"}',
  '2026-07-30T00:20:00Z'
);
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
BEGIN
  BEGIN
    UPDATE die_canonical.coverage_interval
    SET valid_to = '2026-07-30T00:30:00Z',
        system_to = '2026-07-30T00:30:00Z'
    WHERE tenant_id = 'die-live-a'
      AND coverage_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9'
      AND revision = 2;
    INSERT INTO die_canonical.coverage_interval (
      tenant_id, coverage_id, producer_id, business_scope_id, capability,
      population_id, state, valid_from, revision, system_from
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'inventory',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'gap',
      '2026-07-30T00:30:00Z', 4, '2026-07-30T00:30:00Z'
    );
    RAISE EXCEPTION 'skipped coverage revision was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'skipped coverage revision was accepted'
        OR position('coverage revision' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET CONSTRAINTS ALL DEFERRED;

-- Runtime roles may handle only their frozen stage, even though work rows share
-- one tenant-scoped table.
INSERT INTO die_pipeline.work_item (
  tenant_id, stage, subject_kind, subject_id, input_version,
  implementation_version, partition_key, status, available_at, created_at,
  updated_at
) VALUES
  (
    'die-live-a', 'truth', 'relationship_candidate', 'cross-stage-job', 'v1',
    'sha256:1111111111111111111111111111111111111111111111111111111111111111',
    'truth', 'pending', clock_timestamp(), clock_timestamp(),
    clock_timestamp()
  ),
  (
    'die-live-a', 'normalize', 'evidence', 'normalizer-job', 'v1',
    'sha256:2222222222222222222222222222222222222222222222222222222222222222',
    'normalize', 'pending', clock_timestamp(),
    clock_timestamp(), clock_timestamp()
  );
SET SESSION AUTHORIZATION die_live_normalizer;
SET LOCAL app.tenant_id = 'die-live-a';
DO $$
BEGIN
  BEGIN
    UPDATE die_pipeline.work_item
    SET status = 'leased', lease_owner = 'wrong-stage-worker',
        lease_token = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa20',
        lease_expires_at = clock_timestamp() + interval '5 minutes',
        attempt_count = 1, updated_at = clock_timestamp()
    WHERE tenant_id = 'die-live-a' AND subject_id = 'cross-stage-job';
    RAISE EXCEPTION 'normalizer leased a truth-stage work item';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'normalizer leased a truth-stage work item'
        OR position('runtime role is not authorized to handle stage truth' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
UPDATE die_pipeline.work_item
SET status = 'leased', lease_owner = 'normalizer-worker',
    lease_token = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
    lease_expires_at = clock_timestamp() + interval '5 minutes',
    attempt_count = 1, updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'normalizer-job';
RESET SESSION AUTHORIZATION;

-- Expired leases retry while attempts remain and finish as one fenced
-- lease-recovery quarantine on the final expired attempt.
INSERT INTO die_pipeline.work_item (
  tenant_id, stage, subject_kind, subject_id, input_version,
  implementation_version, partition_key, status, available_at, max_attempts,
  created_at, updated_at
) VALUES (
  'die-live-a', 'maintenance', 'maintenance_job', 'lease-recovery-job', 'v1',
  'sha256:3333333333333333333333333333333333333333333333333333333333333333',
  'maintenance', 'pending', clock_timestamp(), 2,
  clock_timestamp(), clock_timestamp()
);
SET SESSION AUTHORIZATION die_live_maintenance;
SET LOCAL app.tenant_id = 'die-live-a';
UPDATE die_pipeline.work_item
SET status = 'leased', lease_owner = 'maintenance-reaper',
    lease_token = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa22',
    lease_expires_at = clock_timestamp() + interval '50 milliseconds',
    attempt_count = 1, updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'lease-recovery-job';
SELECT pg_sleep(0.10);
UPDATE die_pipeline.work_item
SET status = 'retry', lease_owner = NULL, lease_token = NULL,
    lease_expires_at = NULL, available_at = clock_timestamp(),
    last_error_code = 'lease_expired', last_error_at = clock_timestamp(),
    updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'lease-recovery-job';
UPDATE die_pipeline.work_item
SET status = 'leased', lease_owner = 'maintenance-reaper',
    lease_token = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa23',
    lease_expires_at = clock_timestamp() + interval '50 milliseconds',
    attempt_count = 2, updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'lease-recovery-job';
SELECT pg_sleep(0.10);
INSERT INTO die_pipeline.stage_execution (
  tenant_id, execution_id, work_id, lease_token, stage, subject_kind,
  subject_id, input_version, implementation_version, output_digest,
  started_at, completed_at, execution_kind, result
)
SELECT tenant_id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24', work_id, lease_token,
       stage, subject_kind, subject_id, input_version, implementation_version,
       'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
       lease_expires_at, clock_timestamp(), 'lease_recovery', 'quarantined'
FROM die_pipeline.work_item
WHERE tenant_id = 'die-live-a' AND subject_id = 'lease-recovery-job';
UPDATE die_pipeline.work_item
SET status = 'quarantined', lease_owner = NULL, lease_token = NULL,
    lease_expires_at = NULL,
    last_error_code = 'lease_expired_attempts_exhausted',
    last_error_at = clock_timestamp(), updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'lease-recovery-job';
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;
RESET SESSION AUTHORIZATION;

-- Terminal work and immutable execution are a same-transaction pair.
INSERT INTO die_pipeline.work_item (
  tenant_id, stage, subject_kind, subject_id, input_version,
  implementation_version, partition_key, status, available_at, created_at,
  updated_at
) VALUES (
  'die-live-a', 'maintenance', 'maintenance_job', 'live-job', 'v1',
  'sha256:4444444444444444444444444444444444444444444444444444444444444444',
  'maintenance', 'pending', clock_timestamp(), clock_timestamp(),
  clock_timestamp()
);
UPDATE die_pipeline.work_item
SET status = 'leased', lease_owner = 'live-worker',
    lease_token = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10',
    lease_expires_at = clock_timestamp() + interval '5 minutes',
    attempt_count = 1, updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'live-job';
DO $$
BEGIN
  BEGIN
    UPDATE die_pipeline.work_item
    SET status = 'completed', lease_owner = NULL, lease_token = NULL,
        lease_expires_at = NULL, updated_at = clock_timestamp()
    WHERE tenant_id = 'die-live-a' AND subject_id = 'live-job';
    SET CONSTRAINTS work_terminal_requires_execution IMMEDIATE;
    RAISE EXCEPTION 'terminal work without execution was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'terminal work without execution was accepted'
        OR position('leased work cannot become terminal without its matching fenced execution' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET CONSTRAINTS ALL DEFERRED;
INSERT INTO die_pipeline.stage_execution (
  tenant_id, execution_id, work_id, lease_token, stage, subject_kind,
  subject_id, input_version, implementation_version, output_digest,
  started_at, completed_at, result
)
SELECT tenant_id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', work_id, lease_token,
       stage, subject_kind, subject_id, input_version, implementation_version,
       'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
       clock_timestamp(), clock_timestamp(), 'completed'
FROM die_pipeline.work_item
WHERE tenant_id = 'die-live-a' AND subject_id = 'live-job';
UPDATE die_pipeline.work_item
SET status = 'completed', lease_owner = NULL, lease_token = NULL,
    lease_expires_at = NULL, updated_at = clock_timestamp()
WHERE tenant_id = 'die-live-a' AND subject_id = 'live-job';
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;

-- Same-input replay is idempotent for one implementation and creates a new
-- work identity only for an explicit implementation version.
DO $$
BEGIN
  BEGIN
    INSERT INTO die_pipeline.work_item (
      tenant_id, stage, subject_kind, subject_id, input_version,
      implementation_version, partition_key, status, available_at, created_at,
      updated_at
    ) VALUES (
      'die-live-a', 'maintenance', 'maintenance_job', 'live-job', 'v1',
      'sha256:4444444444444444444444444444444444444444444444444444444444444444',
      'maintenance', 'pending', clock_timestamp(),
      clock_timestamp(), clock_timestamp()
    );
    RAISE EXCEPTION 'duplicate implementation work identity was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'duplicate implementation work identity was accepted'
        OR SQLSTATE <> '23505' THEN
        RAISE;
      END IF;
  END;
END
$$;
INSERT INTO die_pipeline.work_item (
  tenant_id, stage, subject_kind, subject_id, input_version,
  implementation_version, partition_key, status, available_at, created_at,
  updated_at
) VALUES (
  'die-live-a', 'maintenance', 'maintenance_job', 'live-job', 'v1',
  'sha256:5555555555555555555555555555555555555555555555555555555555555555',
  'maintenance', 'pending', clock_timestamp(), clock_timestamp(),
  clock_timestamp()
);

-- Projection verification is a complete required-partition barrier and standby
-- is the reversible state before final retirement.
INSERT INTO die_pipeline.projection_generation (
  tenant_id, projection_name, generation, state, required_partition_count,
  partition_manifest_digest, source_watermark, applied_watermark, created_at
) VALUES (
  'die-live-a', 'die_product_v1', 1, 'building', 1,
  'sha256:' || encode(
    digest(
      int8send(octet_length('pg:main')::bigint) || convert_to('pg:main', 'UTF8')
      || int8send(octet_length('postgresql')::bigint) || convert_to('postgresql', 'UTF8'),
      'sha256'
    ),
    'hex'
  ),
  0, 0, '2026-07-30T00:00:00Z'
);
INSERT INTO die_pipeline.projection_required_partition (
  tenant_id, projection_name, generation, partition_key, destination_kind, created_at
) VALUES (
  'die-live-a', 'die_product_v1', 1, 'pg:main', 'postgresql',
  '2026-07-30T00:00:00Z'
);
INSERT INTO die_pipeline.projection_checkpoint (
  tenant_id, projection_name, generation, partition_key, last_outbox_id, updated_at
) VALUES (
  'die-live-a', 'die_product_v1', 1, 'pg:main', 0, '2026-07-30T00:00:00Z'
);
UPDATE die_pipeline.projection_checkpoint
SET destination_ack_token = 'empty-generation-ack',
    destination_digest = 'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    updated_at = '2026-07-30T00:01:00Z'
WHERE tenant_id = 'die-live-a'
  AND projection_name = 'die_product_v1'
  AND generation = 1
  AND partition_key = 'pg:main';
UPDATE die_pipeline.projection_generation
SET state = 'catching_up'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
UPDATE die_pipeline.projection_generation
SET state = 'verifying',
    verification_digest = 'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
UPDATE die_pipeline.projection_generation
SET state = 'active', activated_at = '2026-07-30T00:02:00Z'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
INSERT INTO die_read.export_job (
  tenant_id, export_id, requested_by, resource_type, format, filter_json,
  filter_digest, authorization_decision_id, authorization_filter_digest,
  authorization_scope_digest, field_mask_digest, authorization_revision,
  projection_name, projection_generation, canonical_watermark,
  activity_watermark, status, created_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12', 'alice', 'inventory',
  'jsonl', '{}',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'decision-1',
  'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  2, 'die_product_v1', 1, 0, 'ch:0', 'queued', '2026-07-30T00:02:30Z'
);
UPDATE die_pipeline.projection_generation
SET state = 'standby'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
DO $$
BEGIN
  BEGIN
    INSERT INTO die_read.export_job (
      tenant_id, export_id, requested_by, resource_type, format, filter_json,
      filter_digest, authorization_decision_id, authorization_filter_digest,
      authorization_scope_digest, field_mask_digest, authorization_revision,
      projection_name, projection_generation, canonical_watermark,
      activity_watermark, status, created_at
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa13', 'alice', 'inventory',
      'jsonl', '{}',
      'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'decision-2',
      'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      2, 'die_product_v1', 1, 0, 'ch:0', 'queued', '2026-07-30T00:02:40Z'
    );
    RAISE EXCEPTION 'export bound to standby generation was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'export bound to standby generation was accepted'
        OR position('export snapshot must bind the active caught-up product generation' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
UPDATE die_pipeline.projection_generation
SET state = 'active'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
UPDATE die_pipeline.projection_generation
SET state = 'standby'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;
UPDATE die_pipeline.projection_generation
SET state = 'retired', retired_at = '2026-07-30T00:03:00Z'
WHERE tenant_id = 'die-live-a' AND projection_name = 'die_product_v1' AND generation = 1;

ROLLBACK;

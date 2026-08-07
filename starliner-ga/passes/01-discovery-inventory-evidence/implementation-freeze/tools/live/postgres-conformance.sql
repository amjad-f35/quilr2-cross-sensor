\set ON_ERROR_STOP on

BEGIN;

-- Catalog-level security invariants must hold before behavioral fixtures run.
DO $$
DECLARE
  violation text;
BEGIN
  SELECT string_agg(format('%I.%I', namespace.nspname, relation.relname), ', ' ORDER BY namespace.nspname, relation.relname)
    INTO violation
    FROM pg_class relation
    JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname LIKE 'die\_%' ESCAPE '\'
      AND relation.relkind IN ('r', 'p')
      AND NOT (
        namespace.nspname = 'die_control'
        AND relation.relname IN ('source_profile', 'source_profile_version')
      )
      AND (
        NOT relation.relrowsecurity
        OR NOT relation.relforcerowsecurity
        OR NOT EXISTS (
          SELECT 1
          FROM pg_policy policy
          WHERE policy.polrelid = relation.oid
        )
      );
  IF violation IS NOT NULL THEN
    RAISE EXCEPTION 'DIE tables missing ENABLE/FORCE RLS or a fail-closed policy: %', violation;
  END IF;

  SELECT string_agg(role.rolname, ', ' ORDER BY role.rolname)
    INTO violation
    FROM pg_roles role
    WHERE role.rolname IN (
      'die_ingest','die_normalizer','die_truth','die_projector',
      'die_api','die_bff','die_maintenance','die_enrollment','die_verifier',
      'die_control_admin','die_authz_admin'
    )
      AND (role.rolsuper OR role.rolbypassrls OR role.rolcanlogin);
  IF violation IS NOT NULL THEN
    RAISE EXCEPTION 'DIE group role is privileged or login-enabled: %', violation;
  END IF;

  SELECT string_agg(runtime_role.role_name, ', ' ORDER BY runtime_role.role_name)
    INTO violation
    FROM unnest(ARRAY[
      'die_ingest','die_normalizer','die_truth','die_projector',
      'die_api','die_bff','die_maintenance','die_enrollment','die_verifier',
      'die_control_admin','die_authz_admin'
    ]) AS runtime_role(role_name)
    WHERE has_table_privilege(
      runtime_role.role_name,
      'die_control.source_profile',
      'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES'
    )
       OR has_table_privilege(
      runtime_role.role_name,
      'die_control.source_profile_version',
      'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES'
    );
  IF violation IS NOT NULL THEN
    RAISE EXCEPTION 'runtime role can mutate release-managed source-profile registry: %', violation;
  END IF;

  SELECT string_agg(format('%I.%I', namespace.nspname, relation.relname), ', ' ORDER BY namespace.nspname, relation.relname)
    INTO violation
    FROM pg_class relation
    JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
    JOIN pg_roles owner_role ON owner_role.oid = relation.relowner
    WHERE namespace.nspname LIKE 'die\_%' ESCAPE '\'
      AND owner_role.rolname IN (
        'die_ingest','die_normalizer','die_truth','die_projector',
        'die_api','die_bff','die_maintenance','die_enrollment','die_verifier',
        'die_control_admin','die_authz_admin'
      );
  IF violation IS NOT NULL THEN
    RAISE EXCEPTION 'runtime role owns a DIE relation: %', violation;
  END IF;

  IF has_function_privilege(
    'public',
    'die_authz.current_tenant_id()',
    'EXECUTE'
  ) OR has_function_privilege(
    'public',
    'die_authz.jsonb_object_key_count(jsonb)',
    'EXECUTE'
  ) OR has_function_privilege(
    'public',
    'die_audit.compute_audit_event_hash(die_audit.audit_event)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PUBLIC retained execution on a DIE security/helper function';
  END IF;
END
$$;

-- Pre-GA Browser Backend profile convergence has three explicit cases: clean
-- install, the one known replaced candidate, and unknown drift. This exercise
-- runs inside the conformance transaction and is rolled back with the suite.
DO $$
DECLARE
  profile_digest text;
  rows_changed integer;
  unknown_rejected boolean := false;
BEGIN
  SELECT schema_digest INTO STRICT profile_digest
  FROM die_control.source_profile_version
  WHERE profile_id = 'browser_backend' AND profile_version = '1.0.0';
  IF profile_digest <>
    'sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e'
  THEN
    RAISE EXCEPTION 'clean Browser Backend profile digest is not corrected';
  END IF;

  UPDATE die_control.source_profile_version
  SET schema_digest =
    'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442'
  WHERE profile_id = 'browser_backend' AND profile_version = '1.0.0';
  UPDATE die_control.source_profile_version
  SET schema_digest =
    'sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e'
  WHERE profile_id = 'browser_backend'
    AND profile_version = '1.0.0'
    AND schema_digest =
      'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442';
  GET DIAGNOSTICS rows_changed = ROW_COUNT;
  IF rows_changed <> 1 THEN
    RAISE EXCEPTION 'known Browser Backend profile digest did not converge once';
  END IF;

  UPDATE die_control.source_profile_version
  SET schema_digest =
    'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  WHERE profile_id = 'browser_backend' AND profile_version = '1.0.0';
  BEGIN
    SELECT schema_digest INTO STRICT profile_digest
    FROM die_control.source_profile_version
    WHERE profile_id = 'browser_backend' AND profile_version = '1.0.0';
    IF profile_digest NOT IN (
      'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442',
      'sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e'
    ) THEN
      RAISE check_violation USING
        MESSAGE = 'unknown Browser Backend schema digest rejected';
    END IF;
  EXCEPTION WHEN check_violation THEN
    unknown_rejected := true;
  END;
  IF NOT unknown_rejected THEN
    RAISE EXCEPTION 'unknown Browser Backend profile digest was accepted';
  END IF;

  UPDATE die_control.source_profile_version
  SET schema_digest =
    'sha256:d07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e'
  WHERE profile_id = 'browser_backend' AND profile_version = '1.0.0';
END
$$;

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

-- The core is not hard-coded to the five launch profiles. A release-managed
-- connector profile/version can enroll, while an unregistered profile fails
-- at the database boundary even though the wire identifier shape is valid.
INSERT INTO die_control.source_profile (
  profile_id, source_family, integration_roles, deployment_forms, lifecycle,
  registered_at
) VALUES (
  'connector.copilot_studio', 'enterprise_connector',
  ARRAY['discovery_connector','telemetry_importer','control_connector'],
  ARRAY['managed_connector_worker'], 'active', '2026-07-30T00:00:00Z'
);

INSERT INTO die_control.source_profile_version (
  profile_id, profile_version, schema_ref, schema_digest, admission_state,
  accepted_at
) VALUES (
  'connector.copilot_studio', '1.0.0',
  'urn:quilr:test:connector.copilot-studio:1.0.0',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'accepted', '2026-07-30T00:00:00Z'
);

DO $$
BEGIN
  BEGIN
    INSERT INTO die_control.producer (
      tenant_id, producer_id, installation_id, source_profile,
      business_scope_id, display_name, trust_state, artifact_digest,
      active_certification_id, credential_subject, environment,
      first_enrolled_at, revision
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
      'copilot-studio-a', 'connector.copilot_studio',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Copilot Studio A', 'pending',
      'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      NULL, 'spiffe://die-live-a/connector/copilot-studio-a', 'test',
      '2026-07-30T00:00:00Z', 1
    );
    IF NOT EXISTS (
      SELECT 1
      FROM die_control.producer
      WHERE tenant_id = 'die-live-a'
        AND producer_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9'
    ) THEN
      RAISE EXCEPTION 'registered connector profile enrollment did not persist';
    END IF;
    RAISE EXCEPTION 'registered connector profile accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM <> 'registered connector profile accepted'
        OR SQLSTATE <> 'P0001' THEN
        RAISE;
      END IF;
  END;
END
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO die_control.producer (
      tenant_id, producer_id, installation_id, source_profile,
      business_scope_id, display_name, trust_state, artifact_digest,
      active_certification_id, credential_subject, environment,
      first_enrolled_at, revision
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
      'unregistered-a', 'connector.unregistered',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Unregistered', 'pending',
      'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      NULL, 'spiffe://die-live-a/connector/unregistered-a', 'test',
      '2026-07-30T00:00:00Z', 1
    );
    RAISE EXCEPTION 'unregistered source profile was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'unregistered source profile was accepted'
        OR position('new producer requires an active registered source profile' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;

CREATE ROLE die_live_api LOGIN NOBYPASSRLS;
CREATE ROLE die_live_api_b LOGIN NOBYPASSRLS;
CREATE ROLE die_live_bff LOGIN NOBYPASSRLS;
CREATE ROLE die_live_ingest LOGIN NOBYPASSRLS;
CREATE ROLE die_live_authz LOGIN NOBYPASSRLS;
CREATE ROLE die_live_control LOGIN NOBYPASSRLS;
CREATE ROLE die_live_verifier LOGIN NOBYPASSRLS;
CREATE ROLE die_live_normalizer LOGIN NOBYPASSRLS;
CREATE ROLE die_live_truth LOGIN NOBYPASSRLS;
CREATE ROLE die_live_maintenance LOGIN NOBYPASSRLS;
CREATE ROLE die_live_indirect LOGIN NOBYPASSRLS;
CREATE ROLE die_live_role_bridge NOLOGIN NOBYPASSRLS;
GRANT die_api TO die_live_api;
GRANT die_api TO die_live_api_b;
GRANT die_bff TO die_live_bff;
GRANT die_ingest TO die_live_ingest;
GRANT die_authz_admin TO die_live_authz;
GRANT die_control_admin TO die_live_control;
GRANT die_verifier TO die_live_verifier;
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

INSERT INTO die_control.tenant_cell_principal (
  tenant_id, principal_binding_id, cell_id, database_principal, workload_role,
  state, assigned_at, revision
) VALUES
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07', 'cell-a', 'die_live_bff', 'die_bff', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08', 'cell-a', 'die_live_control', 'die_control_admin', 'active', '2026-07-30T00:00:00Z', 1),
  ('die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa09', 'cell-a', 'die_live_verifier', 'die_verifier', 'active', '2026-07-30T00:00:00Z', 1);

-- Final-delta trust/session authorities: real RLS, state-machine and uniqueness
-- execution rather than DDL parsing alone.
SET ROLE die_live_authz;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.manifest_signer_key (
  tenant_id, key_id, revision, algorithm, public_jwk, fingerprint, state,
  manifest_kind, environment, not_before, not_after, issuer
) VALUES (
  'die-live-a', 'bootstrap-key-1', 1, 'ES256',
  '{"kty":"EC","crv":"P-256","x":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","y":"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"}',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'active', 'tenant_bootstrap', 'test',
  '2026-07-30T00:00:00Z', '2026-10-30T00:00:00Z', 'die-live-control'
);
DO $$
BEGIN
  BEGIN
    INSERT INTO die_control.manifest_signer_key (
      tenant_id, key_id, revision, algorithm, public_jwk, fingerprint, state,
      manifest_kind, environment, not_before, not_after, issuer
    ) VALUES (
      'die-live-a', 'bootstrap-key-conflict', 1, 'ES256',
      '{"kty":"EC","crv":"P-256","x":"CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC","y":"DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"}',
      'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'active', 'tenant_bootstrap', 'test',
      '2026-07-30T00:00:00Z', '2026-10-30T00:00:00Z', 'die-live-control'
    );
    RAISE EXCEPTION 'second active manifest signer was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLSTATE <> '23505'
        OR position('uq_manifest_signer_one_active' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET app.change_reason = 'rotation_started';
UPDATE die_control.manifest_signer_key
  SET state = 'retiring', revision = 2
  WHERE tenant_id = 'die-live-a' AND key_id = 'bootstrap-key-1';
DO $$
BEGIN
  IF (SELECT count(*) FROM die_control.manifest_signer_key_version
      WHERE tenant_id = 'die-live-a' AND key_id = 'bootstrap-key-1') <> 2 THEN
    RAISE EXCEPTION 'manifest signer key transition history is incomplete';
  END IF;
END
$$;
RESET ROLE;
SET ROLE die_live_verifier;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.manifest_verification (
  tenant_id, attempt_id, manifest_id, manifest_kind, schema_version,
  environment, received_document_digest, canonical_payload_digest,
  protected_header_digest, signature_digest,
  issuer, key_id, signer_key_revision, key_fingerprint, algorithm,
  verification_result, verifier_artifact_digest, applied_effects,
  verified_at, applied_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa91',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa92', 'tenant_bootstrap',
  'starliner.tenant-bootstrap.v1', 'test',
  'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'die-live-control', 'bootstrap-key-1', 2,
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'ES256', 'passed',
  'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  '{"root_scope":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"}',
  '2026-07-30T00:10:00Z', NULL
);
RESET ROLE;

SET ROLE die_live_control;
SET app.tenant_id = 'die-live-a';
UPDATE die_control.manifest_verification
SET applied_at = '2026-07-30T00:10:01Z'
WHERE tenant_id = 'die-live-a'
  AND attempt_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa91';
RESET ROLE;

-- Producer enrollment is a three-role protocol, not a privileged shortcut:
-- control administration binds the organization, authorization administration
-- registers the public key, the isolated verifier appends signature evidence,
-- and control administration applies exactly those verified effects.
SET ROLE die_live_control;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.organization_tenant (
  tenant_id, organization_tenant_id, state, registered_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa20',
  'active', '2026-07-30T00:11:00Z'
);
RESET ROLE;

SET ROLE die_live_authz;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.manifest_signer_key (
  tenant_id, key_id, revision, algorithm, public_jwk, fingerprint, state,
  manifest_kind, environment, not_before, not_after, issuer
) VALUES (
  'die-live-a', 'enrollment-key-1', 1, 'EdDSA',
  '{"kty":"OKP","crv":"Ed25519","x":"11qYAYdk9JHj9-_IhDZMeA5e7sK5mwdWJcyc6P6N4Vs"}',
  'sha256:2020202020202020202020202020202020202020202020202020202020202020',
  'active', 'producer_enrollment', 'test',
  '2026-07-30T00:00:00Z', '2026-10-30T00:00:00Z', 'die-live-enrollment'
);
RESET ROLE;

SET ROLE die_live_verifier;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.manifest_verification (
  tenant_id, attempt_id, manifest_id, manifest_kind, schema_version,
  environment, received_document_digest, canonical_payload_digest,
  protected_header_digest, signature_digest,
  issuer, key_id, signer_key_revision, key_fingerprint, algorithm,
  verification_result, verifier_artifact_digest, applied_effects,
  verified_at, applied_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa29',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28', 'producer_enrollment',
  'starliner.producer-enrollment.v1', 'test',
  'sha256:2121212121212121212121212121212121212121212121212121212121212121',
  'sha256:2222222222222222222222222222222222222222222222222222222222222222',
  'sha256:2323232323232323232323232323232323232323232323232323232323232323',
  'sha256:2424242424242424242424242424242424242424242424242424242424242424',
  'die-live-enrollment', 'enrollment-key-1', 1,
  'sha256:2020202020202020202020202020202020202020202020202020202020202020',
  'EdDSA', 'passed',
  'sha256:2525252525252525252525252525252525252525252525252525252525252525',
  '{
    "tenant_id":"die-live-a",
    "organization_tenant_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa20",
    "manifest_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28",
    "producer_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21",
    "operation":"apply",
    "revision":1,
    "manifest_issued_at":"2026-07-30T00:11:00Z",
    "manifest_expires_at":"2026-07-30T00:26:00Z",
    "bootstrap_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa22",
    "installation_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24",
    "producer_epoch":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa25",
    "source_profile":"browser_backend",
    "business_scope_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    "environment":"test",
    "credential_subject":"spiffe://die-live-a/browser-backend/a",
    "credential_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa27",
    "installation_key_thumbprint":"sha256:2626262626262626262626262626262626262626262626262626262626262626",
    "credential_expires_at":"2026-07-30T00:25:00Z",
    "artifact_digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "delivery_artifact_digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "component_set_digest":"sha256:2727272727272727272727272727272727272727272727272727272727272727",
    "capabilities":[{"capability":"inventory","mode":"observe","profile_version":"1.0.0","effective_from":"2026-07-30T00:12:00Z","effective_to":null}],
    "health_policy":{"policy_version":"v1","expected_report_interval_seconds":30,"degraded_after_seconds":90,"offline_after_seconds":300,"queue_degraded_after_ms":1000,"queue_unhealthy_after_ms":5000,"required_components":["browser_backend"]},
    "expected_populations":[{"population_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6","capability":"inventory","population_type":"device","source_namespace":"browser-backend","source_population_id":"managed-devices","expected_count":1,"authority_type":"producer_enrollment","authority_ref":"manifest:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28","valid_from":"2026-07-30T00:12:00Z","valid_to":null}]
  }',
  '2026-07-30T00:11:30Z', NULL
);
RESET ROLE;

SET ROLE die_live_control;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.producer (
  tenant_id, producer_id, installation_id, source_profile, business_scope_id,
  display_name, trust_state, artifact_digest, component_set_digest,
  active_certification_id, credential_subject, environment, first_enrolled_at,
  revision
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24', 'browser_backend',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Browser Backend A', 'pending',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  NULL, 'spiffe://die-live-a/browser-backend/a', 'test',
  '2026-07-30T00:12:00Z', 1
);
INSERT INTO die_control.sensor_bootstrap (
  tenant_id, organization_tenant_id, bootstrap_id, token_digest,
  source_profile, business_scope_id, environment, intent,
  discovery_issuer, discovery_subject_ref, issued_at, expires_at, state
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa20',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa22',
  'sha256:2828282828282828282828282828282828282828282828282828282828282828',
  'browser_backend', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test',
  'enroll', 'die-live-discovery', 'test-subject',
  '2026-07-30T00:10:00Z', '2026-07-30T00:25:00Z', 'issued'
);
UPDATE die_control.sensor_bootstrap
SET state = 'consumed', consumed_at = '2026-07-30T00:12:00Z',
    consumed_request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa23',
    consumed_request_digest = 'sha256:2929292929292929292929292929292929292929292929292929292929292929',
    installation_key_thumbprint = 'sha256:2626262626262626262626262626262626262626262626262626262626262626'
WHERE tenant_id = 'die-live-a'
  AND bootstrap_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa22';
INSERT INTO die_control.producer_component_set (
  tenant_id, producer_id, component_set_id, component_set_digest,
  enrollment_request_id, source_profile, measured_at, state, revision,
  activated_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa26',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa23', 'browser_backend',
  '2026-07-30T00:12:00Z', 'active', 1, '2026-07-30T00:12:00Z'
);
INSERT INTO die_control.producer_package (
  tenant_id, producer_id, component_set_digest, package_id, product,
  version, package_format, source_repository, source_commit, package_digest,
  build_evidence_ref
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  'browser-backend-package', 'Quilr Browser Backend', '1.0.0',
  'container_image', 'quilrbusiness/browser-extension-service',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'fixture://browser-backend-build'
);
INSERT INTO die_control.producer_component (
  tenant_id, producer_id, component_set_digest, component_id, package_id,
  component_role, product, version, source_repository, source_commit,
  package_member_path, package_member_digest, installed_artifact_digest,
  runtime_artifact_digest, runtime_identity, capture_owner, wal_owner,
  delivery_owner, health_component
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  'browser_backend', 'browser-backend-package', 'browser_backend',
  'Quilr Browser Backend', '1.0.0', 'quilrbusiness/browser-extension-service',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'app.jar',
  'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'spiffe://die-live-a/browser-backend/a', true, true, true, true
);
INSERT INTO die_control.installation_enrollment (
  tenant_id, enrollment_request_id, bootstrap_id, source_manifest_id,
  idempotency_key_digest, request_digest, client_nonce_digest, intent,
  source_profile, business_scope_id, environment,
  installation_key_thumbprint, producer_id, installation_id, producer_epoch,
  component_set_digest, assignment_response_digest, result, enrolled_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa23',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa22',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'sha256:2929292929292929292929292929292929292929292929292929292929292929',
  'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'enroll', 'browser_backend',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test',
  'sha256:2626262626262626262626262626262626262626262626262626262626262626',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa25',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  'enrolled', '2026-07-30T00:12:00Z'
);
INSERT INTO die_control.workload_credential (
  tenant_id, credential_id, producer_id, installation_id, producer_epoch,
  generation, credential_subject, installation_key_thumbprint,
  token_jti_digest, scopes, state, issued_at, renew_after, expires_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa27',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa25', 1,
  'spiffe://die-live-a/browser-backend/a',
  'sha256:2626262626262626262626262626262626262626262626262626262626262626',
  'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  ARRAY['starliner.ingest','starliner.credential.renew'], 'active',
  '2026-07-30T00:10:00Z', '2026-07-30T00:20:00Z', '2026-07-30T00:25:00Z'
);
UPDATE die_control.manifest_verification
SET applied_at = '2026-07-30T00:12:00Z'
WHERE tenant_id = 'die-live-a'
  AND attempt_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa29';
INSERT INTO die_control.enrollment_manifest (
  tenant_id, manifest_id, producer_id, operation, revision,
  received_document_digest, canonical_payload_digest,
  verification_attempt_id, issuer, signer_key_id, issued_at, expires_at,
  applied_at, result, reason_code
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'apply', 1,
  'sha256:2121212121212121212121212121212121212121212121212121212121212121',
  'sha256:2222222222222222222222222222222222222222222222222222222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa29', 'die-live-enrollment',
  'enrollment-key-1', '2026-07-30T00:11:00Z',
  '2026-07-30T00:26:00Z', '2026-07-30T00:12:00Z', 'applied', NULL
);
INSERT INTO die_control.producer_capability (
  tenant_id, producer_id, capability, mode, profile_version,
  source_manifest_id, certified, effective_from, effective_to
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'inventory',
  'observe', '1.0.0', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28', false,
  '2026-07-30T00:12:00Z', NULL
);
INSERT INTO die_control.producer_health_policy (
  tenant_id, producer_id, policy_version, component_set_digest,
  expected_report_interval_seconds, degraded_after_seconds,
  offline_after_seconds, queue_degraded_after_ms, queue_unhealthy_after_ms,
  required_components, source_manifest_id, effective_from, effective_to
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'v1',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  30, 90, 300, 1000, 5000, ARRAY['browser_backend'],
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28', '2026-07-30T00:12:00Z', NULL
);
RESET ROLE;

SET ROLE die_live_authz;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_authz.oidc_trust (
  tenant_id, issuer_uri, revision, discovery_uri, allowed_audiences,
  allowed_algorithms, jwks_soft_ttl_seconds, jwks_hard_ttl_seconds,
  forced_refresh_min_interval_seconds, max_token_lifetime_seconds,
  clock_skew_seconds, state
) VALUES (
  'die-live-a', 'https://id.die-live.example/', 1,
  'https://id.die-live.example/.well-known/openid-configuration',
  '["quilr-die-ui"]', '["ES256"]', 300, 3600, 60, 86400, 60, 'active'
);
DO $$
BEGIN
  BEGIN
    INSERT INTO die_authz.oidc_trust (
      tenant_id, issuer_uri, revision, discovery_uri, allowed_audiences,
      allowed_algorithms, jwks_soft_ttl_seconds, jwks_hard_ttl_seconds,
      forced_refresh_min_interval_seconds, max_token_lifetime_seconds,
      clock_skew_seconds, state
    ) VALUES (
      'die-live-a', 'https://id.die-live.example/', 3,
      'https://id.die-live.example/.well-known/openid-configuration',
      '["quilr-die-ui"]', '["ES256"]', 300, 3600, 60, 86400, 60, 'pending'
    );
    RAISE EXCEPTION 'non-contiguous OIDC trust revision was accepted';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLSTATE <> 'P0001'
        OR position('OIDC trust revision must be next contiguous revision 2' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
RESET ROLE;

SET ROLE die_live_bff;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_authz.runtime_session (
  tenant_id, session_id, session_token_digest, issuer_uri, issuer_revision,
  subject, role_ids,
  authorization_revision, session_epoch, authentication_time, assurance,
  state, created_at, last_seen_at, idle_expires_at, absolute_expires_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa93',
  'hmac-sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  'https://id.die-live.example/', 1, 'subject-1', '["viewer"]', 1, 1,
  '2026-07-30T00:00:00Z', 'mfa', 'active',
  '2026-07-30T00:00:00Z', '2026-07-30T00:01:00Z',
  '2026-07-30T01:01:00Z', '2026-07-30T12:00:00Z'
);
UPDATE die_authz.runtime_session
  SET state = 'logged_out', revoked_at = '2026-07-30T00:02:00Z',
      revocation_reason = 'logout', session_epoch = 2,
      purge_after = '2026-07-31T00:02:00Z'
  WHERE tenant_id = 'die-live-a'
    AND session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa93';
DO $$
BEGIN
  BEGIN
    UPDATE die_authz.runtime_session
      SET state = 'active', revoked_at = NULL, revocation_reason = NULL
      WHERE tenant_id = 'die-live-a'
        AND session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa93';
    RAISE EXCEPTION 'terminal runtime session reactivated';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLSTATE <> 'P0001'
        OR position('terminal runtime session cannot reactivate' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
SET app.tenant_id = 'die-live-b';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM die_authz.runtime_session) THEN
    RAISE EXCEPTION 'BFF runtime session RLS leaked another tenant';
  END IF;
END
$$;
RESET ROLE;

SET ROLE die_live_maintenance;
SET app.tenant_id = 'die-live-a';
SET app.change_reason = 'session_retention_expired';
DELETE FROM die_authz.runtime_session
  WHERE tenant_id = 'die-live-a'
    AND session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa93';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM die_authz.runtime_session
    WHERE tenant_id = 'die-live-a'
      AND session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa93'
  ) THEN
    RAISE EXCEPTION 'expired terminal runtime session was not purged';
  END IF;
END
$$;
RESET ROLE;

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
  IF visible_count <> 2 THEN
    RAISE EXCEPTION 'RLS tenant isolation failed: expected two tenant-A producers, got %', visible_count;
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

-- Hash verification must be independent of the database session TimeZone.
SET LOCAL TIME ZONE 'America/Los_Angeles';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM die_audit.audit_event
    WHERE audit_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
      AND event_hash IS DISTINCT FROM die_audit.compute_audit_event_hash(audit_event)
  ) THEN
    RAISE EXCEPTION 'audit hash changed under America/Los_Angeles session TimeZone';
  END IF;
END
$$;
SET LOCAL TIME ZONE 'UTC';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM die_audit.audit_event
    WHERE audit_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
      AND event_hash IS DISTINCT FROM die_audit.compute_audit_event_hash(audit_event)
  ) THEN
    RAISE EXCEPTION 'audit hash changed under UTC session TimeZone';
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
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'inventory', 'device',
  'browser-backend', 'managed-devices', 1, 'active',
  '2026-07-30T00:12:00Z', '2026-07-30T00:12:00Z'
);
INSERT INTO die_control.expected_population_version (
  tenant_id, population_id, revision, business_scope_id, environment,
  expected_count, authority_type, authority_ref, source_manifest_id,
  lifecycle, valid_from, system_from
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 1,
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test', 1,
  'producer_enrollment',
  'manifest:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa28', 'active',
  '2026-07-30T00:12:00Z', '2026-07-30T00:12:00Z'
);
UPDATE die_control.expected_population_version
SET valid_to = '2026-07-30T00:20:00Z',
    system_to = '2026-07-30T00:20:00Z'
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
  '2026-07-30T00:20:00Z', '2026-07-30T00:20:00Z'
);
UPDATE die_control.expected_population
SET current_revision = 2, updated_at = '2026-07-30T00:20:00Z'
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
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'inventory',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'covered',
  '2026-07-30T00:12:00Z', 1, '2026-07-30T00:12:00Z'
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
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
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
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
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
    SET CONSTRAINTS die_pipeline.work_terminal_requires_execution IMMEDIATE;
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

-- Erasure is a fenced saga. Sealing proves a complete placement-bound target
-- manifest; the executing transition is the database linearization point that
-- wins or loses atomically against a concurrent legal hold before any provider
-- operation is allowed.
SET ROLE die_live_verifier;
SET app.tenant_id = 'die-live-a';
INSERT INTO die_control.manifest_verification (
  tenant_id, attempt_id, manifest_id, manifest_kind, schema_version,
  environment, received_document_digest, canonical_payload_digest,
  protected_header_digest, signature_digest,
  issuer, key_id, signer_key_revision, key_fingerprint, algorithm,
  verification_result, verifier_artifact_digest, applied_effects,
  verified_at, applied_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa37',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38', 'producer_enrollment',
  'starliner.producer-enrollment.v1', 'test',
  'sha256:3636363636363636363636363636363636363636363636363636363636363636',
  'sha256:3737373737373737373737373737373737373737373737373737373737373737',
  'sha256:3838383838383838383838383838383838383838383838383838383838383838',
  'sha256:3939393939393939393939393939393939393939393939393939393939393939',
  'die-live-enrollment', 'enrollment-key-1', 1,
  'sha256:2020202020202020202020202020202020202020202020202020202020202020',
  'EdDSA', 'passed',
  'sha256:abababababababababababababababababababababababababababababababab',
  '{
    "tenant_id":"die-live-a",
    "organization_tenant_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa20",
    "manifest_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38",
    "producer_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21",
    "operation":"certify",
    "revision":2,
    "manifest_issued_at":"2026-07-30T00:29:00Z",
    "manifest_expires_at":"2026-07-30T00:44:00Z",
    "certification_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30",
    "source_profile":"browser_backend",
    "profile_version":"1.0.0",
    "component_set_digest":"sha256:2727272727272727272727272727272727272727272727272727272727272727",
    "delivery_artifact_digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "artifact_digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "contract_digest":"sha256:3030303030303030303030303030303030303030303030303030303030303030",
    "profile_versions":{"browser_backend":"1.0.0"},
    "test_pack_digest":"sha256:3131313131313131313131313131313131313131313131313131313131313131",
    "result":"passed",
    "certified_at":"2026-07-30T00:30:00Z",
    "certification_expires_at":"2026-08-30T00:30:00Z",
    "evidence_object_key":"die-live-a/certifications/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30"
  }',
  '2026-07-30T00:29:30Z', NULL
);
RESET ROLE;

SET ROLE die_live_control;
SET app.tenant_id = 'die-live-a';
UPDATE die_control.manifest_verification
SET applied_at = '2026-07-30T00:30:00Z'
WHERE tenant_id = 'die-live-a'
  AND attempt_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa37';
INSERT INTO die_control.enrollment_manifest (
  tenant_id, manifest_id, producer_id, operation, revision,
  received_document_digest, canonical_payload_digest,
  verification_attempt_id, issuer, signer_key_id, issued_at, expires_at,
  applied_at, result, reason_code
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'certify', 2,
  'sha256:3636363636363636363636363636363636363636363636363636363636363636',
  'sha256:3737373737373737373737373737373737373737373737373737373737373737',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa37', 'die-live-enrollment',
  'enrollment-key-1', '2026-07-30T00:29:00Z',
  '2026-07-30T00:44:00Z', '2026-07-30T00:30:00Z', 'applied', NULL
);
INSERT INTO die_control.certification (
  tenant_id, certification_id, producer_id, source_manifest_id,
  source_profile, profile_version, component_set_digest,
  delivery_artifact_digest, artifact_digest, contract_digest, profile_versions,
  test_pack_digest, result, certified_at, expires_at, evidence_object_key
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38',
  'browser_backend', '1.0.0',
  'sha256:2727272727272727272727272727272727272727272727272727272727272727',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'sha256:3030303030303030303030303030303030303030303030303030303030303030',
  '{"browser_backend":"1.0.0"}',
  'sha256:3131313131313131313131313131313131313131313131313131313131313131',
  'passed', '2026-07-30T00:30:00Z', '2026-08-30T00:30:00Z',
  'die-live-a/certifications/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30'
);
UPDATE die_control.producer
SET trust_state = 'trusted',
    active_certification_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30',
    revision = 2
WHERE tenant_id = 'die-live-a'
  AND producer_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21';
RESET ROLE;
INSERT INTO die_evidence.producer_sequence (
  tenant_id, producer_id, producer_epoch, sequence_no, record_id,
  content_sha256, evidence_id, received_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa25', 1,
  '018f0000-0000-7000-8000-000000000001',
  'sha256:3232323232323232323232323232323232323232323232323232323232323232',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', '2026-07-30T00:31:00Z'
);
INSERT INTO die_evidence.evidence_record (
  tenant_id, evidence_id, producer_id, installation_id, producer_epoch,
  sequence_no, record_id, record_type, source_profile, profile_version,
  schema_ref, source_object_type, source_namespace, source_object_id,
  occurred_at, observed_at, enqueued_at, received_at, object_key,
  object_version, object_size_bytes, content_sha256, privacy_policy_version,
  capture_state, record_origin, evidence_quality, certification_id,
  business_scope_id, environment, sensitivity, admitted_trust_state,
  correlation, retention_class, admitted_by_artifact
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa24',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa25', 1,
  '018f0000-0000-7000-8000-000000000001', 'browser_backend.test',
  'browser_backend', '1.0.0',
  'urn:quilr:fixture:browser-backend.test:1.0.0',
  'browser_installation', 'fixture', 'installation-1',
  '2026-07-30T00:30:00Z', '2026-07-30T00:30:10Z',
  '2026-07-30T00:30:20Z', '2026-07-30T00:31:00Z',
  'die-live-a/evidence/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32',
  'version-1', 1,
  'sha256:3232323232323232323232323232323232323232323232323232323232323232',
  'privacy-v1', 'complete', 'fixture', 'fixture',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa30',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'test', 'internal',
  'trusted', '{}', 'fixture-short',
  'sha256:3333333333333333333333333333333333333333333333333333333333333333'
);
INSERT INTO die_evidence.evidence_disposition (
  tenant_id, evidence_id, revision, state, legal_hold, reason_code,
  changed_by, changed_at
) VALUES
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 1,
    'active', false, 'admitted', 'conformance',
    '2026-07-30T00:31:00Z'
  ),
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 2,
    'tombstoned', false, 'retention_expired', 'conformance',
    '2026-07-30T00:32:00Z'
  ),
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 3,
    'deletion_pending', false, 'retention_expired', 'conformance',
    '2026-07-30T00:33:00Z'
  );
WITH target_manifest(target_ordinal, target_kind, target_locator_digest) AS (
  VALUES
    (
      0, 'object_bytes',
      'sha256:3434343434343434343434343434343434343434343434343434343434343434'
    ),
    (
      1, 'clickhouse_evidence_rows',
      'sha256:3535353535353535353535353535353535353535353535353535353535353535'
    )
), manifest AS (
  SELECT 'sha256:' || encode(
    digest(
      string_agg(
        int4send(target_ordinal)
          || int8send(octet_length(target_kind)::bigint)
          || convert_to(target_kind, 'UTF8')
          || int8send(octet_length(target_locator_digest)::bigint)
          || convert_to(target_locator_digest, 'UTF8'),
        ''::bytea
        ORDER BY target_ordinal
      ),
      'sha256'
    ),
    'hex'
  ) AS target_manifest_digest
  FROM target_manifest
)
INSERT INTO die_evidence.erasure_plan (
  tenant_id, erasure_plan_id, evidence_id, source_disposition_revision,
  placement_snapshot_digest, target_count, target_manifest_digest,
  planner_artifact_digest, state, created_at
)
SELECT
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 3,
  'sha256:3636363636363636363636363636363636363636363636363636363636363636',
  2, target_manifest_digest,
  'sha256:3737373737373737373737373737373737373737373737373737373737373737',
  'building', '2026-07-30T00:34:00Z'
FROM manifest;
INSERT INTO die_evidence.erasure_target (
  tenant_id, erasure_plan_id, target_id, target_ordinal, target_kind,
  target_locator_digest
) VALUES
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa34', 0, 'object_bytes',
    'sha256:3434343434343434343434343434343434343434343434343434343434343434'
  ),
  (
    'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa35', 1,
    'clickhouse_evidence_rows',
    'sha256:3535353535353535353535353535353535353535353535353535353535353535'
  );
UPDATE die_evidence.erasure_plan
SET state = 'sealed', sealed_at = '2026-07-30T00:35:00Z'
WHERE tenant_id = 'die-live-a'
  AND erasure_plan_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36';

DO $$
BEGIN
  BEGIN
    INSERT INTO die_evidence.erasure_target (
      tenant_id, erasure_plan_id, target_id, target_ordinal, target_kind,
      target_locator_digest
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa37', 2, 'cache_copy',
      'sha256:3737373737373737373737373737373737373737373737373737373737373737'
    );
    RAISE EXCEPTION 'target was added after erasure-plan sealing';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'target was added after erasure-plan sealing'
        OR position('only while the plan is building' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
  BEGIN
    INSERT INTO die_evidence.evidence_disposition (
      tenant_id, evidence_id, revision, state, legal_hold, reason_code,
      changed_by, changed_at
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 4,
      'held', true, 'legal_hold', 'conformance',
      '2026-07-30T00:35:30Z'
    );
    UPDATE die_evidence.erasure_plan
    SET state = 'executing',
        execution_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38',
        execution_started_at = '2026-07-30T00:36:00Z'
    WHERE tenant_id = 'die-live-a'
      AND erasure_plan_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36';
    RAISE EXCEPTION 'erasure execution started after a legal hold won the race';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'erasure execution started after a legal hold won the race'
        OR position('exact latest unheld deletion-pending revision' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;

SET SESSION AUTHORIZATION die_live_maintenance;
SET LOCAL app.tenant_id = 'die-live-a';
UPDATE die_evidence.erasure_plan
SET state = 'executing',
    execution_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa38',
    execution_started_at = '2026-07-30T00:36:00Z'
WHERE tenant_id = 'die-live-a'
  AND erasure_plan_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36';
DO $$
BEGIN
  BEGIN
    INSERT INTO die_evidence.evidence_disposition (
      tenant_id, evidence_id, revision, state, legal_hold, reason_code,
      changed_by, changed_at
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 4,
      'held', true, 'legal_hold', 'conformance',
      '2026-07-30T00:36:30Z'
    );
    RAISE EXCEPTION 'legal hold was accepted after erasure execution commit';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'legal hold was accepted after erasure execution commit'
        OR position('too late after erasure execution commit' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
INSERT INTO die_evidence.erasure_receipt (
  tenant_id, erasure_plan_id, target_id, receipt_digest,
  verifier_artifact_digest, receipt_evidence_object_key, completed_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa34',
  'sha256:3838383838383838383838383838383838383838383838383838383838383838',
  'sha256:3939393939393939393939393939393939393939393939393939393939393939',
  'die-live-a/erasure-receipts/object-34', '2026-07-30T00:37:00Z'
);
INSERT INTO die_evidence.evidence_disposition (
  tenant_id, evidence_id, revision, state, legal_hold, reason_code,
  changed_by, changed_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 4,
  'object_deleted', false, 'object_delete_verified', 'conformance',
  '2026-07-30T00:37:00Z'
);
DO $$
BEGIN
  BEGIN
    INSERT INTO die_evidence.evidence_disposition (
      tenant_id, evidence_id, revision, state, legal_hold, reason_code,
      changed_by, changed_at
    ) VALUES (
      'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 5,
      'deleted', false, 'erasure_verified', 'conformance',
      '2026-07-30T00:37:30Z'
    );
    RAISE EXCEPTION 'terminal deletion was accepted before every receipt';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'terminal deletion was accepted before every receipt'
        OR position('unreceipted required targets' in SQLERRM) = 0 THEN
        RAISE;
      END IF;
  END;
END
$$;
INSERT INTO die_evidence.erasure_receipt (
  tenant_id, erasure_plan_id, target_id, receipt_digest,
  verifier_artifact_digest, receipt_evidence_object_key, completed_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa36',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa35',
  'sha256:4040404040404040404040404040404040404040404040404040404040404040',
  'sha256:4141414141414141414141414141414141414141414141414141414141414141',
  'die-live-a/erasure-receipts/clickhouse-35', '2026-07-30T00:38:00Z'
);
INSERT INTO die_evidence.evidence_disposition (
  tenant_id, evidence_id, revision, state, legal_hold, reason_code,
  changed_by, changed_at
) VALUES (
  'die-live-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa32', 5,
  'deleted', false, 'erasure_verified', 'conformance',
  '2026-07-30T00:38:00Z'
);
RESET SESSION AUTHORIZATION;

ROLLBACK;

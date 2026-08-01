BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE SCHEMA IF NOT EXISTS die_control;
CREATE SCHEMA IF NOT EXISTS die_evidence;
CREATE SCHEMA IF NOT EXISTS die_pipeline;
CREATE SCHEMA IF NOT EXISTS die_normalized;
CREATE SCHEMA IF NOT EXISTS die_identity;
CREATE SCHEMA IF NOT EXISTS die_canonical;
CREATE SCHEMA IF NOT EXISTS die_outbox;
CREATE SCHEMA IF NOT EXISTS die_read;
CREATE SCHEMA IF NOT EXISTS die_authz;
CREATE SCHEMA IF NOT EXISTS die_audit;

-- PostgreSQL provides jsonb_array_length but no jsonb_object_length. Keep the
-- bounded-object invariant in SQL with one immutable, data-independent helper.
CREATE OR REPLACE FUNCTION die_authz.jsonb_object_key_count(value jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT count(*)::integer
  FROM jsonb_object_keys(value)
$$;

CREATE OR REPLACE FUNCTION die_authz.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')
$$;

-- Source profiles are release-managed protocol plugins. The five launch
-- profiles are seeded here, but no table or wire contract assumes they are the
-- permanent universe. A connector becomes admissible only after its exact
-- profile/version/schema digest is registered and certified.
CREATE TABLE IF NOT EXISTS die_control.source_profile (
  profile_id text NOT NULL
    CHECK (profile_id ~ '^[a-z][a-z0-9_.-]{0,127}$'),
  source_family text NOT NULL CHECK (source_family IN (
    'browser','endpoint','llm_gateway','mcp_gateway',
    'enterprise_connector','legacy'
  )),
  integration_roles text[] NOT NULL,
  deployment_forms text[] NOT NULL,
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','deprecated','revoked')),
  registered_at timestamptz NOT NULL,
  retired_at timestamptz,
  PRIMARY KEY (profile_id),
  CHECK (cardinality(integration_roles) BETWEEN 1 AND 8),
  CHECK (integration_roles <@ ARRAY[
    'runtime_sensor','discovery_connector','telemetry_importer',
    'control_connector','response_connector','export_connector'
  ]::text[]),
  CHECK (cardinality(deployment_forms) BETWEEN 1 AND 8),
  CHECK (deployment_forms <@ ARRAY[
    'embedded','sidecar','daemon','managed_connector_worker'
  ]::text[]),
  CHECK ((lifecycle = 'revoked') = (retired_at IS NOT NULL)),
  CHECK (retired_at IS NULL OR retired_at >= registered_at)
);

CREATE TABLE IF NOT EXISTS die_control.source_profile_version (
  profile_id text NOT NULL,
  profile_version text NOT NULL
    CHECK (profile_version ~ '^[1-9][0-9]*[.][0-9]+[.][0-9]+(?:[-+][0-9A-Za-z.-]+)?$'),
  schema_ref text NOT NULL,
  schema_digest text NOT NULL CHECK (schema_digest ~ '^sha256:[0-9a-f]{64}$'),
  admission_state text NOT NULL CHECK (admission_state IN ('accepted','deprecated','revoked')),
  accepted_at timestamptz NOT NULL,
  retired_at timestamptz,
  PRIMARY KEY (profile_id, profile_version),
  FOREIGN KEY (profile_id) REFERENCES die_control.source_profile(profile_id),
  CHECK ((admission_state = 'revoked') = (retired_at IS NOT NULL)),
  CHECK (retired_at IS NULL OR retired_at >= accepted_at)
);

INSERT INTO die_control.source_profile (
  profile_id, source_family, integration_roles, deployment_forms, lifecycle,
  registered_at
) VALUES
  ('browser', 'browser', ARRAY['runtime_sensor'], ARRAY['embedded','daemon'], 'active', '2026-07-30T00:00:00Z'),
  ('browser_backend', 'browser', ARRAY['runtime_sensor'], ARRAY['embedded','sidecar'], 'active', '2026-07-30T00:00:00Z'),
  ('endpoint', 'endpoint', ARRAY['runtime_sensor'], ARRAY['daemon','sidecar'], 'active', '2026-07-30T00:00:00Z'),
  ('llm_gateway', 'llm_gateway', ARRAY['runtime_sensor'], ARRAY['embedded','sidecar'], 'active', '2026-07-30T00:00:00Z'),
  ('mcp_gateway', 'mcp_gateway', ARRAY['runtime_sensor'], ARRAY['embedded','sidecar'], 'active', '2026-07-30T00:00:00Z')
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO die_control.source_profile_version (
  profile_id, profile_version, schema_ref, schema_digest, admission_state,
  accepted_at
) VALUES
  ('browser', '1.0.0', 'schemas/profile-browser-v1.schema.json', 'sha256:6cd7d92e293f11f482fe5409132b494f1014c0ec1b3b94d16667b3285a28e7be', 'accepted', '2026-07-30T00:00:00Z'),
  ('browser_backend', '1.0.0', 'schemas/profile-browser-backend-v1.schema.json', 'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442', 'accepted', '2026-07-30T00:00:00Z'),
  ('endpoint', '1.0.0', 'schemas/profile-endpoint-v1.schema.json', 'sha256:fb686ed047e38ca311cb6fcc724b63b4bf8857f648a438b310dc0403734372d6', 'accepted', '2026-07-30T00:00:00Z'),
  ('llm_gateway', '1.0.0', 'schemas/profile-llm-gateway-v1.schema.json', 'sha256:35008e7bc7bf9586d16b4c1cb7343d5e363b3100c93fa1181f115d63d3356476', 'accepted', '2026-07-30T00:00:00Z'),
  ('mcp_gateway', '1.0.0', 'schemas/profile-mcp-gateway-v1.schema.json', 'sha256:65fc5c9338dd66a239f11e3d529738d8f9b0aec5d7a5e2f6b31ff4c9540b09ad', 'accepted', '2026-07-30T00:00:00Z')
ON CONFLICT (profile_id, profile_version) DO NOTHING;

CREATE TABLE IF NOT EXISTS die_control.producer (
  tenant_id text NOT NULL,
  producer_id uuid NOT NULL,
  installation_id text NOT NULL,
  source_profile text NOT NULL,
  business_scope_id uuid NOT NULL,
  display_name text NOT NULL,
  trust_state text NOT NULL CHECK (trust_state IN ('pending','trusted','degraded','revoked','rejected')),
  artifact_digest text NOT NULL CHECK (artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  active_certification_id uuid,
  credential_subject text NOT NULL,
  environment text NOT NULL,
  first_enrolled_at timestamptz NOT NULL,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision BETWEEN 1 AND 9007199254740991),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, producer_id),
  UNIQUE (tenant_id, installation_id, source_profile),
  UNIQUE (tenant_id, producer_id, installation_id, source_profile),
  CONSTRAINT producer_source_profile_fk
  FOREIGN KEY (source_profile)
    REFERENCES die_control.source_profile(profile_id),
  CHECK (jsonb_typeof(metadata) = 'object'),
  CHECK (pg_column_size(metadata) <= 65536),
  CHECK (last_seen_at IS NULL OR last_seen_at >= first_enrolled_at),
  CHECK (revoked_at IS NULL OR revoked_at >= first_enrolled_at),
  CHECK ((trust_state = 'revoked') = (revoked_at IS NOT NULL)),
  CHECK (trust_state NOT IN ('trusted','degraded') OR active_certification_id IS NOT NULL)
);

-- Tenant IDs are control metadata, not customer data. Cell workers may discover
-- only assignments explicitly bound to their database login. They then start one
-- transaction per tenant and SET LOCAL app.tenant_id.
CREATE TABLE IF NOT EXISTS die_control.tenant_cell_assignment (
  tenant_id text NOT NULL,
  cell_id text NOT NULL,
  state text NOT NULL CHECK (state IN ('active','draining','suspended')),
  scheduling_weight integer NOT NULL DEFAULT 100 CHECK (scheduling_weight > 0),
  assigned_at timestamptz NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id),
  UNIQUE (tenant_id, cell_id)
);

CREATE TABLE IF NOT EXISTS die_control.tenant_cell_principal (
  tenant_id text NOT NULL,
  principal_binding_id uuid NOT NULL,
  cell_id text NOT NULL,
  database_principal name NOT NULL,
  workload_role text NOT NULL CHECK (workload_role IN (
    'die_ingest','die_normalizer','die_truth','die_projector',
    'die_api','die_bff','die_maintenance','die_control_admin','die_authz_admin'
  )),
  state text NOT NULL CHECK (state IN ('active','revoked')),
  assigned_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, principal_binding_id),
  FOREIGN KEY (tenant_id)
    REFERENCES die_control.tenant_cell_assignment(tenant_id),
  CHECK ((state = 'revoked') = (revoked_at IS NOT NULL)),
  CHECK (revoked_at IS NULL OR revoked_at >= assigned_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tenant_cell_principal_active
  ON die_control.tenant_cell_principal(tenant_id, database_principal)
  WHERE state = 'active';

-- Resolve a caller-supplied tenant context only when the session login has an
-- active workload binding in an active/draining cell. The two bootstrap admin
-- roles are deliberately exempt so they can create the initial mapping.
CREATE OR REPLACE FUNCTION die_authz.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT requested.tenant_id
  FROM (
    SELECT NULLIF(current_setting('app.tenant_id', true), '') AS tenant_id
  ) requested
  WHERE requested.tenant_id IS NOT NULL
    AND (
      pg_has_role(session_user, 'die_control_admin', 'member')
      OR pg_has_role(session_user, 'die_authz_admin', 'member')
      OR EXISTS (
        SELECT 1
        FROM die_control.tenant_cell_principal principal
        JOIN die_control.tenant_cell_assignment assignment
          USING (tenant_id, cell_id)
        WHERE principal.tenant_id = requested.tenant_id
          AND principal.database_principal = session_user
          AND principal.state = 'active'
          AND assignment.state IN ('active','draining')
      )
    )
$$;

CREATE TABLE IF NOT EXISTS die_control.producer_capability (
  tenant_id text NOT NULL,
  producer_id uuid NOT NULL,
  capability text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('observe','metadata_only','native_enforce','unsupported')),
  profile_version text NOT NULL,
  certified boolean NOT NULL DEFAULT false,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  PRIMARY KEY (tenant_id, producer_id, capability, effective_from),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (profile_version ~ '^[0-9]+[.][0-9]+[.][0-9]+(?:[-+][0-9A-Za-z.-]+)?$'),
  CHECK (effective_to IS NULL OR effective_to > effective_from),
  CHECK (mode <> 'unsupported' OR certified = false),
  EXCLUDE USING gist (
    tenant_id WITH =,
    producer_id WITH =,
    capability WITH =,
    tstzrange(effective_from, effective_to, '[)') WITH &&
  ) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS die_control.expected_population (
  tenant_id text NOT NULL,
  population_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  capability text NOT NULL,
  population_type text NOT NULL CHECK (population_type IN (
    'producer','browser_installation','device','account','workload',
    'gateway_route','mcp_surface','integration_instance','external_account',
    'agent','agent_runtime','cloud_resource','saas_object','repository',
    'dataset','pipeline','job','source_object'
  )),
  source_namespace text NOT NULL,
  source_population_id text NOT NULL,
  current_revision bigint NOT NULL CHECK (current_revision BETWEEN 1 AND 9007199254740991),
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','inactive')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, population_id),
  UNIQUE (tenant_id, population_id, producer_id, capability),
  UNIQUE (tenant_id, producer_id, capability, source_namespace, source_population_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (updated_at >= created_at)
);

CREATE TABLE IF NOT EXISTS die_control.expected_population_version (
  tenant_id text NOT NULL,
  population_id uuid NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  business_scope_id uuid NOT NULL,
  environment text NOT NULL,
  expected_count bigint NOT NULL CHECK (expected_count BETWEEN 0 AND 9007199254740991),
  authority_type text NOT NULL CHECK (authority_type IN ('producer_enrollment','deployment_config','authoritative_connector')),
  authority_ref text NOT NULL,
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','inactive')),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, population_id, revision),
  FOREIGN KEY (tenant_id, population_id)
    REFERENCES die_control.expected_population(tenant_id, population_id),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

ALTER TABLE die_control.expected_population_version
  ADD CONSTRAINT expected_population_version_system_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    population_id WITH =,
    tstzrange(system_from, system_to, '[)') WITH &&
  )
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_control.expected_population
  ADD CONSTRAINT expected_population_current_version_fk
  FOREIGN KEY (tenant_id, population_id, current_revision)
  REFERENCES die_control.expected_population_version(tenant_id, population_id, revision)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_control.enrollment_manifest (
  tenant_id text NOT NULL,
  manifest_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('apply','revoke','certify')),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  manifest_digest text NOT NULL CHECK (manifest_digest ~ '^sha256:[0-9a-f]{64}$'),
  issuer text NOT NULL,
  signer_key_id text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  applied_at timestamptz NOT NULL,
  result text NOT NULL CHECK (result IN ('applied','no_change','rejected')),
  reason_code text,
  PRIMARY KEY (tenant_id, manifest_id),
  UNIQUE (tenant_id, producer_id, revision),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS die_control.certification (
  tenant_id text NOT NULL,
  certification_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  artifact_digest text NOT NULL CHECK (artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  contract_digest text NOT NULL CHECK (contract_digest ~ '^sha256:[0-9a-f]{64}$'),
  profile_versions jsonb NOT NULL,
  test_pack_digest text NOT NULL CHECK (test_pack_digest ~ '^sha256:[0-9a-f]{64}$'),
  result text NOT NULL CHECK (result IN ('passed','failed','blocked','expired','revoked')),
  certified_at timestamptz NOT NULL,
  expires_at timestamptz,
  evidence_object_key text NOT NULL,
  PRIMARY KEY (tenant_id, certification_id),
  UNIQUE (tenant_id, producer_id, certification_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (jsonb_typeof(profile_versions) = 'object'),
  CHECK (pg_column_size(profile_versions) <= 16384),
  CHECK (expires_at IS NULL OR expires_at > certified_at)
);

-- Tenant-scoped public verification keys for signed bootstrap, enrollment and
-- edge-configuration manifests. One row is intentionally scoped to one kind:
-- this makes least privilege and the single-active-key invariant enforceable.
CREATE TABLE IF NOT EXISTS die_control.manifest_signer_key (
  tenant_id text NOT NULL,
  key_id text NOT NULL CHECK (length(key_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  algorithm text NOT NULL CHECK (algorithm IN ('ES256', 'EdDSA')),
  public_jwk jsonb NOT NULL CHECK (jsonb_typeof(public_jwk) = 'object'),
  fingerprint text NOT NULL CHECK (fingerprint ~ '^sha256:[0-9a-f]{64}$'),
  state text NOT NULL CHECK (state IN (
    'pending', 'active', 'retiring', 'retired',
    'revoked', 'revoked_compromised'
  )),
  manifest_kind text NOT NULL CHECK (manifest_kind IN (
    'tenant_bootstrap', 'producer_enrollment', 'edge_configuration'
  )),
  environment text NOT NULL CHECK (length(environment) BETWEEN 1 AND 128),
  not_before timestamptz NOT NULL,
  not_after timestamptz NOT NULL,
  issuer text NOT NULL CHECK (length(issuer) BETWEEN 1 AND 512),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, key_id),
  UNIQUE (tenant_id, fingerprint, manifest_kind, environment),
  CHECK (not_after > not_before),
  CHECK (NOT (public_jwk ?| ARRAY['d','p','q','dp','dq','qi','k'])),
  CHECK (
    (algorithm = 'ES256'
      AND public_jwk->>'kty' = 'EC'
      AND public_jwk->>'crv' = 'P-256'
      AND public_jwk ? 'x' AND public_jwk ? 'y'
      AND (public_jwk - ARRAY['kty','crv','x','y']) = '{}'::jsonb)
    OR
    (algorithm = 'EdDSA'
      AND public_jwk->>'kty' = 'OKP'
      AND public_jwk->>'crv' = 'Ed25519'
      AND public_jwk ? 'x' AND NOT public_jwk ? 'y'
      AND (public_jwk - ARRAY['kty','crv','x']) = '{}'::jsonb)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_manifest_signer_one_active
  ON die_control.manifest_signer_key (
    tenant_id, environment, manifest_kind
  ) WHERE state = 'active';

CREATE TABLE IF NOT EXISTS die_control.manifest_signer_key_version (
  tenant_id text NOT NULL,
  key_id text NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  state text NOT NULL CHECK (state IN (
    'pending', 'active', 'retiring', 'retired',
    'revoked', 'revoked_compromised'
  )),
  fingerprint text NOT NULL CHECK (fingerprint ~ '^sha256:[0-9a-f]{64}$'),
  manifest_kind text NOT NULL CHECK (manifest_kind IN (
    'tenant_bootstrap', 'producer_enrollment', 'edge_configuration'
  )),
  environment text NOT NULL,
  changed_at timestamptz NOT NULL,
  changed_by name NOT NULL,
  reason_code text NOT NULL CHECK (length(reason_code) BETWEEN 1 AND 256),
  PRIMARY KEY (tenant_id, key_id, revision),
  FOREIGN KEY (tenant_id, key_id)
    REFERENCES die_control.manifest_signer_key(tenant_id, key_id)
);

CREATE TABLE IF NOT EXISTS die_control.manifest_verification (
  tenant_id text NOT NULL,
  attempt_id uuid NOT NULL,
  manifest_id uuid,
  manifest_kind text NOT NULL CHECK (manifest_kind IN (
    'tenant_bootstrap', 'producer_enrollment', 'edge_configuration'
  )),
  schema_version text,
  manifest_digest text NOT NULL CHECK (manifest_digest ~ '^sha256:[0-9a-f]{64}$'),
  issuer text,
  key_id text,
  key_fingerprint text CHECK (
    key_fingerprint IS NULL OR key_fingerprint ~ '^sha256:[0-9a-f]{64}$'
  ),
  algorithm text,
  verification_result text NOT NULL CHECK (length(verification_result) BETWEEN 1 AND 128),
  verifier_artifact_digest text NOT NULL CHECK (verifier_artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  applied_effects jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(applied_effects) = 'object'),
  verified_at timestamptz NOT NULL,
  applied_at timestamptz,
  PRIMARY KEY (tenant_id, attempt_id)
);

ALTER TABLE die_control.producer
  ADD CONSTRAINT producer_active_certification_fk
  FOREIGN KEY (tenant_id, producer_id, active_certification_id)
  REFERENCES die_control.certification(tenant_id, producer_id, certification_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_evidence.producer_sequence (
  tenant_id text NOT NULL,
  producer_id uuid NOT NULL,
  producer_epoch uuid NOT NULL,
  sequence_no bigint NOT NULL CHECK (sequence_no BETWEEN 0 AND 9007199254740991),
  record_id uuid NOT NULL,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^sha256:[0-9a-f]{64}$'),
  evidence_id uuid NOT NULL,
  received_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, producer_id, producer_epoch, sequence_no),
  UNIQUE (tenant_id, producer_id, record_id),
  UNIQUE (tenant_id, evidence_id),
  UNIQUE (tenant_id, producer_id, producer_epoch, sequence_no, record_id, evidence_id, content_sha256),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (
    record_id::text ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE TABLE IF NOT EXISTS die_evidence.evidence_record (
  tenant_id text NOT NULL,
  evidence_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  installation_id text NOT NULL,
  producer_epoch uuid NOT NULL,
  sequence_no bigint NOT NULL CHECK (sequence_no BETWEEN 0 AND 9007199254740991),
  record_id uuid NOT NULL,
  record_type text NOT NULL,
  source_profile text NOT NULL,
  profile_version text NOT NULL,
  schema_ref text NOT NULL,
  source_object_type text NOT NULL,
  source_namespace text NOT NULL,
  source_object_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  observed_at timestamptz NOT NULL,
  enqueued_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  object_key text NOT NULL,
  object_version text,
  object_size_bytes bigint NOT NULL
    CHECK (object_size_bytes BETWEEN 1 AND 9007199254740991),
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^sha256:[0-9a-f]{64}$'),
  privacy_policy_version text NOT NULL,
  capture_state text NOT NULL CHECK (capture_state IN ('complete','minimized','redacted','metadata_only','unsupported')),
  record_origin text NOT NULL CHECK (record_origin IN (
    'live_sensor','managed_connector','external_telemetry','control_result',
    'response_sync','selftest','synthetic','fixture','legacy_backfill',
    'manual_import'
  )),
  evidence_quality text NOT NULL CHECK (evidence_quality IN ('audit_grade','operational','best_effort','debug_only','fixture')),
  certification_id uuid NOT NULL,
  business_scope_id uuid NOT NULL,
  environment text NOT NULL,
  sensitivity text NOT NULL CHECK (sensitivity IN ('public_product','internal','sensitive_metadata','restricted_evidence')),
  admitted_trust_state text NOT NULL CHECK (admitted_trust_state IN ('trusted','degraded')),
  correlation jsonb NOT NULL DEFAULT '{}'::jsonb,
  retention_class text NOT NULL,
  admitted_by_artifact text NOT NULL CHECK (admitted_by_artifact ~ '^sha256:[0-9a-f]{64}$'),
  PRIMARY KEY (tenant_id, evidence_id),
  UNIQUE (tenant_id, evidence_id, producer_id),
  UNIQUE (tenant_id, evidence_id, producer_id, source_profile, profile_version),
  UNIQUE (tenant_id, object_key),
  FOREIGN KEY (tenant_id, producer_id, producer_epoch, sequence_no, record_id, evidence_id, content_sha256)
    REFERENCES die_evidence.producer_sequence(tenant_id, producer_id, producer_epoch, sequence_no, record_id, evidence_id, content_sha256),
  FOREIGN KEY (tenant_id, producer_id, installation_id, source_profile)
    REFERENCES die_control.producer(tenant_id, producer_id, installation_id, source_profile),
  CONSTRAINT evidence_record_source_profile_version_fk
  FOREIGN KEY (source_profile, profile_version)
    REFERENCES die_control.source_profile_version(profile_id, profile_version),
  FOREIGN KEY (tenant_id, producer_id, certification_id)
    REFERENCES die_control.certification(tenant_id, producer_id, certification_id),
  CHECK (jsonb_typeof(correlation) = 'object'),
  CHECK (pg_column_size(correlation) <= 32768)
);

CREATE TABLE IF NOT EXISTS die_evidence.evidence_disposition (
  tenant_id text NOT NULL,
  evidence_id uuid NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  state text NOT NULL CHECK (state IN ('active','held','tombstoned','metadata_only','deletion_pending','object_deleted','deleted')),
  legal_hold boolean NOT NULL DEFAULT false,
  reason_code text NOT NULL,
  changed_by text NOT NULL,
  changed_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, evidence_id, revision),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_disposition_latest
  ON die_evidence.evidence_disposition(tenant_id, evidence_id, revision DESC);

CREATE TABLE IF NOT EXISTS die_evidence.erasure_plan (
  tenant_id text NOT NULL,
  erasure_plan_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  source_disposition_revision bigint NOT NULL
    CHECK (source_disposition_revision BETWEEN 1 AND 9007199254740991),
  placement_snapshot_digest text NOT NULL
    CHECK (placement_snapshot_digest ~ '^sha256:[0-9a-f]{64}$'),
  target_count integer NOT NULL CHECK (target_count BETWEEN 1 AND 4096),
  target_manifest_digest text NOT NULL
    CHECK (target_manifest_digest ~ '^sha256:[0-9a-f]{64}$'),
  planner_artifact_digest text NOT NULL
    CHECK (planner_artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  state text NOT NULL CHECK (state IN ('building','sealed','executing')),
  created_at timestamptz NOT NULL,
  sealed_at timestamptz,
  execution_id uuid,
  execution_started_at timestamptz,
  PRIMARY KEY (tenant_id, erasure_plan_id),
  UNIQUE (tenant_id, evidence_id, source_disposition_revision),
  UNIQUE (tenant_id, execution_id),
  FOREIGN KEY (tenant_id, evidence_id, source_disposition_revision)
    REFERENCES die_evidence.evidence_disposition(tenant_id, evidence_id, revision),
  CHECK (
    (
      state = 'building'
      AND sealed_at IS NULL
      AND execution_id IS NULL
      AND execution_started_at IS NULL
    )
    OR (
      state = 'sealed'
      AND sealed_at IS NOT NULL
      AND execution_id IS NULL
      AND execution_started_at IS NULL
    )
    OR (
      state = 'executing'
      AND sealed_at IS NOT NULL
      AND execution_id IS NOT NULL
      AND execution_started_at IS NOT NULL
    )
  ),
  CHECK (sealed_at IS NULL OR sealed_at >= created_at),
  CHECK (execution_started_at IS NULL OR execution_started_at >= sealed_at)
);

CREATE TABLE IF NOT EXISTS die_evidence.erasure_target (
  tenant_id text NOT NULL,
  erasure_plan_id uuid NOT NULL,
  target_id uuid NOT NULL,
  target_ordinal integer NOT NULL CHECK (target_ordinal BETWEEN 0 AND 4095),
  target_kind text NOT NULL CHECK (target_kind IN (
    'object_bytes','clickhouse_evidence_rows',
    'clickhouse_activity_evidence_references','cache_copy','export_artifact'
  )),
  target_locator_digest text NOT NULL
    CHECK (target_locator_digest ~ '^sha256:[0-9a-f]{64}$'),
  PRIMARY KEY (tenant_id, erasure_plan_id, target_id),
  UNIQUE (tenant_id, erasure_plan_id, target_ordinal),
  UNIQUE (tenant_id, erasure_plan_id, target_kind, target_locator_digest),
  FOREIGN KEY (tenant_id, erasure_plan_id)
    REFERENCES die_evidence.erasure_plan(tenant_id, erasure_plan_id)
);

CREATE TABLE IF NOT EXISTS die_evidence.erasure_receipt (
  tenant_id text NOT NULL,
  erasure_plan_id uuid NOT NULL,
  target_id uuid NOT NULL,
  receipt_digest text NOT NULL CHECK (receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  verifier_artifact_digest text NOT NULL
    CHECK (verifier_artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  receipt_evidence_object_key text NOT NULL,
  completed_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, erasure_plan_id, target_id),
  FOREIGN KEY (tenant_id, erasure_plan_id, target_id)
    REFERENCES die_evidence.erasure_target(tenant_id, erasure_plan_id, target_id),
  CHECK (length(receipt_evidence_object_key) BETWEEN 1 AND 2048)
);

CREATE TABLE IF NOT EXISTS die_evidence.ingest_receipt (
  tenant_id text NOT NULL,
  ingest_request_id uuid NOT NULL,
  batch_id text NOT NULL,
  producer_id uuid NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^sha256:[0-9a-f]{64}$'),
  request_digest text NOT NULL CHECK (request_digest ~ '^sha256:[0-9a-f]{64}$'),
  received_at timestamptz NOT NULL,
  record_count integer NOT NULL CHECK (record_count BETWEEN 1 AND 500),
  accepted_count integer NOT NULL CHECK (accepted_count BETWEEN 0 AND 500),
  duplicate_count integer NOT NULL CHECK (duplicate_count BETWEEN 0 AND 500),
  rejected_count integer NOT NULL CHECK (rejected_count BETWEEN 0 AND 500),
  retry_count integer NOT NULL CHECK (retry_count BETWEEN 0 AND 500),
  latency_ms integer NOT NULL CHECK (latency_ms BETWEEN 0 AND 300000),
  result_digest text NOT NULL CHECK (result_digest ~ '^sha256:[0-9a-f]{64}$'),
  PRIMARY KEY (tenant_id, ingest_request_id),
  UNIQUE (tenant_id, producer_id, batch_id),
  UNIQUE (tenant_id, producer_id, idempotency_key_hash),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (accepted_count + duplicate_count + rejected_count + retry_count = record_count)
);

CREATE TABLE IF NOT EXISTS die_evidence.ingest_receipt_item (
  tenant_id text NOT NULL,
  ingest_request_id uuid NOT NULL,
  result_index integer NOT NULL CHECK (result_index BETWEEN 0 AND 499),
  record_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted','duplicate','rejected','retry')),
  evidence_id uuid,
  producer_epoch uuid,
  sequence_no bigint CHECK (sequence_no BETWEEN 0 AND 9007199254740991),
  error_code text,
  error_field text,
  retry_after_ms integer CHECK (retry_after_ms BETWEEN 1 AND 300000),
  result_digest text NOT NULL CHECK (result_digest ~ '^sha256:[0-9a-f]{64}$'),
  PRIMARY KEY (tenant_id, ingest_request_id, result_index),
  UNIQUE (tenant_id, ingest_request_id, record_id),
  FOREIGN KEY (tenant_id, ingest_request_id)
    REFERENCES die_evidence.ingest_receipt(tenant_id, ingest_request_id),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id),
  CHECK (
    (status IN ('accepted','duplicate') AND evidence_id IS NOT NULL AND producer_epoch IS NOT NULL AND sequence_no IS NOT NULL AND error_code IS NULL)
    OR
    (status = 'rejected' AND evidence_id IS NULL AND error_code IS NOT NULL AND retry_after_ms IS NULL)
    OR
    (status = 'retry' AND evidence_id IS NULL AND error_code IS NOT NULL AND retry_after_ms IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_evidence.rejected_record (
  tenant_id text NOT NULL,
  rejection_id uuid NOT NULL,
  producer_id uuid,
  producer_epoch uuid,
  sequence_no bigint CHECK (sequence_no IS NULL OR sequence_no BETWEEN 0 AND 9007199254740991),
  record_id uuid,
  received_at timestamptz NOT NULL,
  error_code text NOT NULL,
  error_field text,
  content_sha256 text,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, rejection_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (content_sha256 IS NULL OR content_sha256 ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (jsonb_typeof(safe_metadata) = 'object'),
  CHECK (pg_column_size(safe_metadata) <= 32768)
);

CREATE TABLE IF NOT EXISTS die_evidence.sequence_gap (
  tenant_id text NOT NULL,
  gap_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  producer_epoch uuid NOT NULL,
  first_missing_sequence bigint NOT NULL CHECK (first_missing_sequence BETWEEN 0 AND 9007199254740991),
  last_missing_sequence bigint NOT NULL CHECK (last_missing_sequence BETWEEN 0 AND 9007199254740991),
  detected_at timestamptz NOT NULL,
  closed_at timestamptz,
  reason_code text NOT NULL,
  state text NOT NULL CHECK (state IN ('open','narrowed','closed','declared_loss')),
  PRIMARY KEY (tenant_id, gap_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (first_missing_sequence >= 0),
  CHECK (last_missing_sequence >= first_missing_sequence),
  CHECK (closed_at IS NULL OR closed_at >= detected_at)
);

CREATE TABLE IF NOT EXISTS die_pipeline.work_item (
  tenant_id text NOT NULL,
  work_id bigint GENERATED ALWAYS AS IDENTITY CHECK (work_id BETWEEN 1 AND 9007199254740991),
  stage text NOT NULL CHECK (stage IN ('normalize','truth','identity_command','project_postgres','project_clickhouse','export','maintenance')),
  subject_kind text NOT NULL CHECK (subject_kind IN (
    'evidence','normalization_run','relationship_candidate',
    'activity_candidate','coverage_candidate','reconciliation_run',
    'identity_command','canonical_change','projection_generation',
    'export_job','maintenance_job','evidence_erasure'
  )),
  subject_id text NOT NULL,
  input_version text NOT NULL,
  implementation_version text NOT NULL
    CHECK (implementation_version ~ '^sha256:[0-9a-f]{64}$'),
  partition_key text NOT NULL,
  priority smallint NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','leased','retry','completed','quarantined','cancelled')),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 4096),
  max_attempts integer NOT NULL DEFAULT 12 CHECK (max_attempts BETWEEN 1 AND 4096),
  last_error_code text,
  last_error_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, work_id),
  UNIQUE (tenant_id, work_id, implementation_version),
  UNIQUE (
    tenant_id, stage, subject_kind, subject_id, input_version,
    implementation_version
  ),
  CHECK (
    (status <> 'leased') OR
    (lease_owner IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
  ),
  CHECK (attempt_count <= max_attempts),
  CHECK (status <> 'retry' OR attempt_count < max_attempts),
  CHECK (
    (stage = 'normalize' AND subject_kind = 'evidence')
    OR (stage = 'truth' AND subject_kind IN (
      'normalization_run','relationship_candidate','activity_candidate',
      'coverage_candidate','reconciliation_run'
    ))
    OR (stage = 'identity_command' AND subject_kind = 'identity_command')
    OR (stage IN ('project_postgres','project_clickhouse') AND subject_kind IN ('canonical_change','projection_generation'))
    OR (stage = 'export' AND subject_kind = 'export_job')
    OR (stage = 'maintenance' AND subject_kind IN ('maintenance_job','evidence_erasure'))
  )
);

CREATE TABLE IF NOT EXISTS die_pipeline.mutation_preview (
  tenant_id text NOT NULL,
  preview_id uuid NOT NULL,
  mutation_type text NOT NULL CHECK (mutation_type IN ('identity','authorization')),
  action_type text NOT NULL,
  requested_by text NOT NULL,
  request_json jsonb NOT NULL,
  request_digest text NOT NULL CHECK (request_digest ~ '^sha256:[0-9a-f]{64}$'),
  preview_digest text NOT NULL CHECK (preview_digest ~ '^sha256:[0-9a-f]{64}$'),
  expected_canonical_watermark bigint CHECK (expected_canonical_watermark IS NULL OR expected_canonical_watermark BETWEEN 0 AND 9007199254740991),
  authorization_revision bigint NOT NULL CHECK (authorization_revision BETWEEN 1 AND 9007199254740991),
  scope_digest text NOT NULL CHECK (scope_digest ~ '^sha256:[0-9a-f]{64}$'),
  invariant_results jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('active','consumed','expired','revoked')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_by text,
  PRIMARY KEY (tenant_id, preview_id),
  CHECK (jsonb_typeof(request_json) = 'object'),
  CHECK (jsonb_typeof(invariant_results) = 'array'),
  CHECK (pg_column_size(request_json) <= 65536),
  CHECK (pg_column_size(invariant_results) <= 32768),
  CHECK (expires_at > created_at),
  CHECK (
    (status = 'consumed' AND consumed_at IS NOT NULL AND consumed_by IS NOT NULL)
    OR
    (status <> 'consumed' AND consumed_at IS NULL AND consumed_by IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_pipeline.api_idempotency (
  tenant_id text NOT NULL,
  principal_id text NOT NULL,
  operation_id text NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^sha256:[0-9a-f]{64}$'),
  request_digest text NOT NULL CHECK (request_digest ~ '^sha256:[0-9a-f]{64}$'),
  state text NOT NULL CHECK (state IN ('in_progress','completed','failed')),
  response_status integer,
  response_json jsonb,
  resource_id text,
  created_at timestamptz NOT NULL,
  completed_at timestamptz,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, principal_id, operation_id, idempotency_key_hash),
  CHECK (response_json IS NULL OR jsonb_typeof(response_json) = 'object'),
  CHECK (response_json IS NULL OR pg_column_size(response_json) <= 65536),
  CHECK (expires_at > created_at),
  CHECK (
    (state = 'in_progress' AND completed_at IS NULL)
    OR
    (state <> 'in_progress' AND completed_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_pipeline.evidence_access_grant (
  tenant_id text NOT NULL,
  access_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  principal_id text NOT NULL,
  purpose_digest text NOT NULL CHECK (purpose_digest ~ '^sha256:[0-9a-f]{64}$'),
  authorization_revision bigint NOT NULL CHECK (authorization_revision BETWEEN 1 AND 9007199254740991),
  request_id text NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^sha256:[0-9a-f]{64}$'),
  state text NOT NULL CHECK (state IN ('active','consumed','revoked','expired')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  PRIMARY KEY (tenant_id, access_id),
  UNIQUE (tenant_id, principal_id, idempotency_key_hash),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id),
  CHECK (expires_at > created_at),
  CHECK (
    (state = 'consumed' AND consumed_at IS NOT NULL)
    OR
    (state <> 'consumed' AND consumed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_pipeline.identity_command (
  tenant_id text NOT NULL,
  command_id uuid NOT NULL,
  preview_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('bind','unbind','merge','split','correct_field')),
  status text NOT NULL CHECK (status IN ('queued','applying','succeeded','rejected','failed')),
  requested_by text NOT NULL,
  requested_at timestamptz NOT NULL,
  request_id text NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^sha256:[0-9a-f]{64}$'),
  preview_digest text NOT NULL CHECK (preview_digest ~ '^sha256:[0-9a-f]{64}$'),
  expected_canonical_watermark bigint NOT NULL CHECK (expected_canonical_watermark BETWEEN 0 AND 9007199254740991),
  authorization_revision bigint NOT NULL CHECK (authorization_revision BETWEEN 1 AND 9007199254740991),
  command_json jsonb NOT NULL,
  result_json jsonb,
  reason_code text,
  completed_at timestamptz,
  PRIMARY KEY (tenant_id, command_id),
  UNIQUE (tenant_id, requested_by, idempotency_key_hash),
  FOREIGN KEY (tenant_id, preview_id)
    REFERENCES die_pipeline.mutation_preview(tenant_id, preview_id),
  CHECK (jsonb_typeof(command_json) = 'object'),
  CHECK (result_json IS NULL OR jsonb_typeof(result_json) = 'object'),
  CHECK (pg_column_size(command_json) <= 65536),
  CHECK (result_json IS NULL OR pg_column_size(result_json) <= 65536),
  CHECK (
    (status IN ('succeeded','rejected','failed') AND completed_at IS NOT NULL)
    OR
    (status IN ('queued','applying') AND completed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_pipeline.stage_execution (
  tenant_id text NOT NULL,
  execution_id uuid NOT NULL,
  work_id bigint NOT NULL CHECK (work_id BETWEEN 1 AND 9007199254740991),
  lease_token uuid NOT NULL,
  stage text NOT NULL CHECK (stage IN ('normalize','truth','identity_command','project_postgres','project_clickhouse','export','maintenance')),
  subject_kind text NOT NULL CHECK (subject_kind IN (
    'evidence','normalization_run','relationship_candidate',
    'activity_candidate','coverage_candidate','reconciliation_run',
    'identity_command','canonical_change','projection_generation',
    'export_job','maintenance_job','evidence_erasure'
  )),
  subject_id text NOT NULL,
  input_version text NOT NULL,
  implementation_version text NOT NULL
    CHECK (implementation_version ~ '^sha256:[0-9a-f]{64}$'),
  output_digest text NOT NULL CHECK (output_digest ~ '^sha256:[0-9a-f]{64}$'),
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  execution_kind text NOT NULL DEFAULT 'worker'
    CHECK (execution_kind IN ('worker','lease_recovery')),
  result text NOT NULL CHECK (result IN ('completed','no_change','quarantined')),
  PRIMARY KEY (tenant_id, execution_id),
  UNIQUE (tenant_id, work_id, lease_token),
  UNIQUE (tenant_id, stage, subject_kind, subject_id, input_version, implementation_version),
  FOREIGN KEY (tenant_id, work_id, implementation_version)
    REFERENCES die_pipeline.work_item(
      tenant_id, work_id, implementation_version
    ),
  CHECK (
    (stage = 'normalize' AND subject_kind = 'evidence')
    OR (stage = 'truth' AND subject_kind IN (
      'normalization_run','relationship_candidate','activity_candidate',
      'coverage_candidate','reconciliation_run'
    ))
    OR (stage = 'identity_command' AND subject_kind = 'identity_command')
    OR (stage IN ('project_postgres','project_clickhouse') AND subject_kind IN ('canonical_change','projection_generation'))
    OR (stage = 'export' AND subject_kind = 'export_job')
    OR (stage = 'maintenance' AND subject_kind IN ('maintenance_job','evidence_erasure'))
  ),
  CHECK (execution_kind = 'worker' OR result = 'quarantined'),
  CHECK (completed_at >= started_at)
);

CREATE TABLE IF NOT EXISTS die_pipeline.projection_generation (
  tenant_id text NOT NULL,
  projection_name text NOT NULL CHECK (projection_name = 'die_product_v1'),
  generation bigint NOT NULL CHECK (generation BETWEEN 1 AND 9007199254740991),
  state text NOT NULL CHECK (state IN ('building','catching_up','verifying','active','standby','retired','failed')),
  required_partition_count integer NOT NULL CHECK (required_partition_count BETWEEN 1 AND 4096),
  partition_manifest_digest text NOT NULL CHECK (partition_manifest_digest ~ '^sha256:[0-9a-f]{64}$'),
  source_watermark bigint NOT NULL DEFAULT 0 CHECK (source_watermark BETWEEN 0 AND 9007199254740991),
  applied_watermark bigint NOT NULL DEFAULT 0 CHECK (applied_watermark BETWEEN 0 AND 9007199254740991),
  verification_digest text,
  created_at timestamptz NOT NULL,
  activated_at timestamptz,
  retired_at timestamptz,
  PRIMARY KEY (tenant_id, projection_name, generation),
  CHECK (applied_watermark <= source_watermark),
  CHECK (activated_at IS NULL OR activated_at >= created_at),
  CHECK (retired_at IS NULL OR retired_at >= created_at)
);

CREATE TABLE IF NOT EXISTS die_pipeline.projection_required_partition (
  tenant_id text NOT NULL,
  projection_name text NOT NULL,
  generation bigint NOT NULL CHECK (generation BETWEEN 1 AND 9007199254740991),
  partition_key text NOT NULL CHECK (length(partition_key) BETWEEN 1 AND 256),
  destination_kind text NOT NULL CHECK (destination_kind IN ('postgresql','clickhouse')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, projection_name, generation, partition_key),
  FOREIGN KEY (tenant_id, projection_name, generation)
    REFERENCES die_pipeline.projection_generation(tenant_id, projection_name, generation)
);

CREATE TABLE IF NOT EXISTS die_pipeline.projection_checkpoint (
  tenant_id text NOT NULL,
  projection_name text NOT NULL,
  generation bigint NOT NULL CHECK (generation BETWEEN 1 AND 9007199254740991),
  partition_key text NOT NULL,
  last_outbox_id bigint NOT NULL DEFAULT 0 CHECK (last_outbox_id BETWEEN 0 AND 9007199254740991),
  destination_ack_token text,
  destination_digest text,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, projection_name, generation, partition_key),
  FOREIGN KEY (tenant_id, projection_name, generation)
    REFERENCES die_pipeline.projection_generation(tenant_id, projection_name, generation),
  FOREIGN KEY (tenant_id, projection_name, generation, partition_key)
    REFERENCES die_pipeline.projection_required_partition(
      tenant_id, projection_name, generation, partition_key
    ),
  CHECK (destination_ack_token IS NULL OR length(destination_ack_token) BETWEEN 1 AND 2048),
  CHECK (destination_digest IS NULL OR destination_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (
    (last_outbox_id = 0
      AND ((destination_ack_token IS NULL AND destination_digest IS NULL)
        OR (destination_ack_token IS NOT NULL AND destination_digest IS NOT NULL)))
    OR
    (last_outbox_id > 0 AND destination_ack_token IS NOT NULL AND destination_digest IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_projection_active
  ON die_pipeline.projection_generation(tenant_id, projection_name)
  WHERE state = 'active';

CREATE TABLE IF NOT EXISTS die_normalized.source_object (
  tenant_id text NOT NULL,
  source_object_pk uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_profile text NOT NULL,
  source_namespace text NOT NULL,
  source_object_type text NOT NULL,
  source_object_id text NOT NULL,
  presence_state text NOT NULL CHECK (presence_state IN ('referenced_only','observed')),
  first_referenced_at timestamptz NOT NULL,
  last_referenced_at timestamptz NOT NULL,
  first_observed_at timestamptz,
  last_observed_at timestamptz,
  source_lifecycle text NOT NULL CHECK (source_lifecycle IN ('active','stale','tombstoned','unknown')),
  current_observation_id uuid,
  PRIMARY KEY (tenant_id, source_object_pk),
  UNIQUE (tenant_id, source_object_pk, producer_id),
  UNIQUE (tenant_id, source_object_pk, producer_id, source_profile),
  UNIQUE (tenant_id, producer_id, source_profile, source_namespace, source_object_type, source_object_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (last_referenced_at >= first_referenced_at),
  CHECK ((first_observed_at IS NULL) = (last_observed_at IS NULL)),
  CHECK (last_observed_at IS NULL OR last_observed_at >= first_observed_at),
  CHECK (
    (presence_state = 'referenced_only'
      AND first_observed_at IS NULL
      AND current_observation_id IS NULL
      AND source_lifecycle = 'unknown')
    OR
    (presence_state = 'observed'
      AND first_observed_at IS NOT NULL
      AND current_observation_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_normalized.normalization_run (
  tenant_id text NOT NULL,
  normalization_run_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_profile text NOT NULL,
  profile_version text NOT NULL,
  normalizer_name text NOT NULL,
  normalizer_version text NOT NULL,
  normalizer_artifact_digest text NOT NULL CHECK (normalizer_artifact_digest ~ '^sha256:[0-9a-f]{64}$'),
  output_count integer NOT NULL CHECK (output_count BETWEEN 1 AND 4096),
  bundle_digest text NOT NULL CHECK (bundle_digest ~ '^sha256:[0-9a-f]{64}$'),
  normalized_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, normalization_run_id),
  UNIQUE (tenant_id, evidence_id, normalizer_name, normalizer_version),
  UNIQUE (tenant_id, normalization_run_id, evidence_id, producer_id, source_profile, profile_version),
  UNIQUE (
    tenant_id, normalization_run_id, evidence_id, producer_id, source_profile, profile_version,
    normalizer_name, normalizer_version, normalizer_artifact_digest, normalized_at
  ),
  FOREIGN KEY (tenant_id, evidence_id, producer_id, source_profile, profile_version)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id, producer_id, source_profile, profile_version)
);

CREATE TABLE IF NOT EXISTS die_normalized.cross_sensor_assertion_use (
  tenant_id text NOT NULL,
  assertion_id uuid NOT NULL,
  assertion_kind text NOT NULL CHECK (assertion_kind IN ('browser_local_binding','llm_gateway_attribution','mcp_gateway_attribution')),
  issuer_producer_id uuid NOT NULL,
  recipient_producer_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  normalization_run_id uuid NOT NULL,
  nonce_hash text NOT NULL CHECK (nonce_hash ~ '^sha256:[0-9a-f]{64}$'),
  assertion_digest text NOT NULL CHECK (assertion_digest ~ '^sha256:[0-9a-f]{64}$'),
  audience_source_id text NOT NULL,
  request_binding_digest text,
  signing_key_id text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, issuer_producer_id, assertion_id),
  UNIQUE (tenant_id, issuer_producer_id, nonce_hash),
  UNIQUE (tenant_id, normalization_run_id, assertion_id),
  FOREIGN KEY (tenant_id, issuer_producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  FOREIGN KEY (tenant_id, recipient_producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  FOREIGN KEY (tenant_id, evidence_id, recipient_producer_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id, producer_id),
  FOREIGN KEY (tenant_id, normalization_run_id)
    REFERENCES die_normalized.normalization_run(tenant_id, normalization_run_id),
  CHECK (issuer_producer_id <> recipient_producer_id),
  CHECK (request_binding_digest IS NULL OR request_binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (
    (assertion_kind = 'browser_local_binding' AND request_binding_digest IS NULL)
    OR
    (assertion_kind IN ('llm_gateway_attribution','mcp_gateway_attribution')
      AND request_binding_digest IS NOT NULL)
  ),
  CHECK (expires_at > issued_at),
  CHECK (used_at >= issued_at AND used_at < expires_at)
);

CREATE TABLE IF NOT EXISTS die_normalized.observation (
  tenant_id text NOT NULL,
  normalization_run_id uuid NOT NULL,
  output_key text NOT NULL,
  observation_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  source_profile text NOT NULL,
  profile_version text NOT NULL,
  normalizer_name text NOT NULL,
  normalizer_version text NOT NULL,
  normalizer_artifact_digest text NOT NULL,
  observed_at timestamptz NOT NULL,
  normalized_at timestamptz NOT NULL,
  output_digest text NOT NULL,
  PRIMARY KEY (tenant_id, observation_id),
  UNIQUE (tenant_id, normalization_run_id, output_key),
  UNIQUE (tenant_id, normalization_run_id, observation_id),
  UNIQUE (tenant_id, observation_id, source_object_pk),
  UNIQUE (tenant_id, observation_id, producer_id),
  UNIQUE (tenant_id, observation_id, evidence_id),
  UNIQUE (tenant_id, observation_id, source_object_pk, producer_id),
  UNIQUE (tenant_id, observation_id, evidence_id, producer_id),
  FOREIGN KEY (tenant_id, evidence_id, producer_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id, producer_id),
  FOREIGN KEY (
    tenant_id, normalization_run_id, evidence_id, producer_id, source_profile, profile_version,
    normalizer_name, normalizer_version, normalizer_artifact_digest, normalized_at
  )
    REFERENCES die_normalized.normalization_run(
      tenant_id, normalization_run_id, evidence_id, producer_id, source_profile, profile_version,
      normalizer_name, normalizer_version, normalizer_artifact_digest, normalized_at
    ),
  FOREIGN KEY (tenant_id, source_object_pk, producer_id, source_profile)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk, producer_id, source_profile),
  CHECK (output_digest ~ '^sha256:[0-9a-f]{64}$')
);

ALTER TABLE die_normalized.source_object
  ADD CONSTRAINT source_object_current_observation_fk
  FOREIGN KEY (tenant_id, current_observation_id, source_object_pk, producer_id)
  REFERENCES die_normalized.observation(tenant_id, observation_id, source_object_pk, producer_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_normalized.claim (
  tenant_id text NOT NULL,
  claim_id uuid NOT NULL,
  claim_key text NOT NULL,
  observation_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  claim_kind text NOT NULL CHECK (claim_kind IN ('identifier','attribute','lifecycle','ownership','classification')),
  field_path text NOT NULL,
  value_json jsonb NOT NULL,
  normalized_value_json jsonb,
  value_type text NOT NULL,
  normalized_value_type text,
  authority_class text NOT NULL CHECK (authority_class IN ('source_native','authoritative_connector','declared_config','observed_runtime','derived')),
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL DEFAULT now(),
  sensitivity text NOT NULL DEFAULT 'internal',
  PRIMARY KEY (tenant_id, claim_id),
  UNIQUE (tenant_id, observation_id, claim_kind, field_path, claim_key),
  FOREIGN KEY (tenant_id, observation_id, source_object_pk)
    REFERENCES die_normalized.observation(tenant_id, observation_id, source_object_pk),
  CHECK (value_type IN ('string','integer','number','boolean','timestamp','identifier','object','array','null')),
  CHECK (normalized_value_type IS NULL OR normalized_value_type IN ('string','integer','number','boolean','timestamp','identifier','object','array','null')),
  CHECK ((normalized_value_json IS NULL) = (normalized_value_type IS NULL)),
  CHECK (pg_column_size(value_json) <= 65536),
  CHECK (normalized_value_json IS NULL OR pg_column_size(normalized_value_json) <= 65536),
  CHECK (valid_to IS NULL OR valid_to > valid_from)
);

CREATE TABLE IF NOT EXISTS die_normalized.claim_supersession (
  tenant_id text NOT NULL,
  prior_claim_id uuid NOT NULL,
  successor_claim_id uuid NOT NULL,
  reason_code text NOT NULL,
  decided_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, prior_claim_id, successor_claim_id),
  FOREIGN KEY (tenant_id, prior_claim_id)
    REFERENCES die_normalized.claim(tenant_id, claim_id),
  FOREIGN KEY (tenant_id, successor_claim_id)
    REFERENCES die_normalized.claim(tenant_id, claim_id),
  CHECK (prior_claim_id <> successor_claim_id)
);

CREATE TABLE IF NOT EXISTS die_normalized.relationship_candidate (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  observation_id uuid NOT NULL,
  observation_producer_id uuid NOT NULL,
  subject_source_object_pk uuid NOT NULL,
  subject_producer_id uuid NOT NULL,
  predicate text NOT NULL,
  object_source_object_pk uuid NOT NULL,
  object_producer_id uuid NOT NULL,
  semantic text NOT NULL CHECK (semantic IN ('structural','configured','entitlement','observed','ownership','coverage')),
  scope_kind text NOT NULL DEFAULT 'unscoped' CHECK (scope_kind IN ('unscoped','authorization_context','source_configuration','source_observation')),
  scope_key text NOT NULL DEFAULT 'unscoped',
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','ended','retracted')),
  PRIMARY KEY (tenant_id, candidate_id),
  UNIQUE (tenant_id, observation_id, subject_source_object_pk, subject_producer_id, predicate, object_source_object_pk, object_producer_id, semantic, scope_kind, scope_key),
  FOREIGN KEY (tenant_id, observation_id, observation_producer_id)
    REFERENCES die_normalized.observation(tenant_id, observation_id, producer_id),
  FOREIGN KEY (tenant_id, subject_source_object_pk, subject_producer_id)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk, producer_id),
  FOREIGN KEY (tenant_id, object_source_object_pk, object_producer_id)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk, producer_id),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (
    (scope_kind = 'unscoped' AND scope_key = 'unscoped')
    OR
    (scope_kind <> 'unscoped' AND scope_key ~ '^sha256:[0-9a-f]{64}$')
  )
);

CREATE TABLE IF NOT EXISTS die_normalized.activity_candidate (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  observation_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_activity_id text NOT NULL,
  family text NOT NULL CHECK (family IN ('application','agent','workload','session','model','mcp','tool','network','resource','source','native_control')),
  subtype text NOT NULL,
  occurred_at timestamptz NOT NULL,
  actor_source_object_pk uuid,
  actor_producer_id uuid,
  outcome text NOT NULL CHECK (outcome IN ('succeeded','failed','blocked','cancelled','timed_out','unknown')),
  native_decision text,
  observed_effect text,
  safe_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, candidate_id),
  UNIQUE (tenant_id, observation_id, source_activity_id, subtype),
  UNIQUE (tenant_id, candidate_id, producer_id),
  FOREIGN KEY (tenant_id, observation_id, evidence_id, producer_id)
    REFERENCES die_normalized.observation(tenant_id, observation_id, evidence_id, producer_id),
  FOREIGN KEY (tenant_id, actor_source_object_pk, actor_producer_id)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk, producer_id),
  CHECK ((actor_source_object_pk IS NULL) = (actor_producer_id IS NULL)),
  CHECK (jsonb_typeof(safe_metrics) = 'object'),
  CHECK (jsonb_typeof(correlation) = 'object'),
  CHECK (pg_column_size(safe_metrics) <= 32768),
  CHECK (pg_column_size(correlation) <= 32768)
);

CREATE TABLE IF NOT EXISTS die_normalized.activity_candidate_resource (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  candidate_producer_id uuid NOT NULL,
  resource_ordinal integer NOT NULL CHECK (resource_ordinal >= 0),
  source_object_pk uuid NOT NULL,
  source_producer_id uuid NOT NULL,
  resource_role text NOT NULL,
  PRIMARY KEY (tenant_id, candidate_id, resource_ordinal),
  UNIQUE (tenant_id, candidate_id, source_object_pk, resource_role),
  FOREIGN KEY (tenant_id, candidate_id, candidate_producer_id)
    REFERENCES die_normalized.activity_candidate(tenant_id, candidate_id, producer_id),
  FOREIGN KEY (tenant_id, source_object_pk, source_producer_id)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk, producer_id)
);

CREATE TABLE IF NOT EXISTS die_normalized.coverage_candidate (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  observation_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  population_type text NOT NULL CHECK (population_type IN ('producer','browser_installation','device','account','workload','gateway_route','mcp_surface')),
  source_namespace text NOT NULL,
  source_population_id text NOT NULL,
  capability text NOT NULL,
  state text NOT NULL CHECK (state IN ('covered','degraded','gap','unsupported','unknown')),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  reason_code text,
  PRIMARY KEY (tenant_id, candidate_id),
  UNIQUE (tenant_id, observation_id, producer_id, population_type, source_namespace, source_population_id, capability, valid_from),
  FOREIGN KEY (tenant_id, observation_id, producer_id)
    REFERENCES die_normalized.observation(tenant_id, observation_id, producer_id),
  CHECK (valid_to IS NULL OR valid_to > valid_from)
);

-- A candidate can arrive before one of its referenced source objects has an
-- active canonical binding. That is a normal dependency state, never corrupt
-- evidence and never a reason to guess. Evaluation rows are append-only and
-- candidate dependencies provide the reverse index used for deterministic
-- re-enqueue when a binding changes.
CREATE TABLE IF NOT EXISTS die_normalized.candidate_evaluation (
  tenant_id text NOT NULL,
  evaluation_id uuid NOT NULL,
  candidate_kind text NOT NULL CHECK (candidate_kind IN ('relationship','activity','coverage')),
  candidate_id uuid NOT NULL,
  materializer_name text NOT NULL,
  materializer_version text NOT NULL,
  evaluation_revision bigint NOT NULL CHECK (evaluation_revision BETWEEN 1 AND 9007199254740991),
  input_binding_digest text NOT NULL CHECK (input_binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  result text NOT NULL CHECK (result IN ('materialized','pending_dependency','held_ambiguous','rejected','no_change')),
  result_digest text NOT NULL CHECK (result_digest ~ '^sha256:[0-9a-f]{64}$'),
  reason_code text NOT NULL,
  evaluated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, evaluation_id),
  UNIQUE (tenant_id, candidate_kind, candidate_id, materializer_name, materializer_version, evaluation_revision),
  UNIQUE (tenant_id, candidate_kind, candidate_id, materializer_name, materializer_version, input_binding_digest)
);

CREATE TABLE IF NOT EXISTS die_normalized.candidate_dependency (
  tenant_id text NOT NULL,
  candidate_kind text NOT NULL CHECK (candidate_kind IN ('relationship','activity','coverage')),
  candidate_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  dependency_role text NOT NULL CHECK (dependency_role IN ('subject','object','actor','resource','population')),
  state text NOT NULL CHECK (state IN ('pending','resolved','ambiguous','invalidated')),
  last_binding_revision bigint CHECK (last_binding_revision IS NULL OR last_binding_revision BETWEEN 1 AND 9007199254740991),
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, candidate_kind, candidate_id, source_object_pk, dependency_role),
  FOREIGN KEY (tenant_id, source_object_pk)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk),
  CHECK (last_binding_revision IS NULL OR last_binding_revision > 0)
);

CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_run (
  tenant_id text NOT NULL,
  run_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_profile text NOT NULL,
  snapshot_id text NOT NULL,
  scope_type text NOT NULL,
  scope_source_id text,
  source_revision text,
  state text NOT NULL CHECK (state IN ('open','receiving','ready','failed','quarantined')),
  completeness text NOT NULL CHECK (completeness IN ('full','partial','unknown')),
  expected_count bigint CHECK (expected_count IS NULL OR expected_count BETWEEN 0 AND 9007199254740991),
  declared_page_count bigint CHECK (declared_page_count IS NULL OR declared_page_count BETWEEN 0 AND 9007199254740991),
  declared_observed_count bigint CHECK (declared_observed_count IS NULL OR declared_observed_count BETWEEN 0 AND 9007199254740991),
  declared_snapshot_digest text,
  computed_snapshot_digest text,
  started_at timestamptz NOT NULL,
  terminal_at timestamptz,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, run_id),
  UNIQUE (tenant_id, producer_id, source_profile, snapshot_id),
  UNIQUE (tenant_id, run_id, producer_id, source_profile, snapshot_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (declared_snapshot_digest IS NULL OR declared_snapshot_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (computed_snapshot_digest IS NULL OR computed_snapshot_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (terminal_at IS NULL OR terminal_at >= started_at),
  CHECK (
    state NOT IN ('ready','failed','quarantined')
    OR terminal_at IS NOT NULL
  ),
  CHECK (
    state <> 'ready'
    OR (
      declared_page_count IS NOT NULL
      AND declared_observed_count IS NOT NULL
      AND declared_snapshot_digest IS NOT NULL
      AND computed_snapshot_digest = declared_snapshot_digest
    )
  )
);

CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_candidate (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  run_id uuid NOT NULL,
  observation_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  source_profile text NOT NULL,
  snapshot_id text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('started','page','completed','failed')),
  scope_type text NOT NULL,
  scope_source_id text,
  page_sequence bigint CHECK (page_sequence IS NULL OR page_sequence BETWEEN 0 AND 9007199254740991),
  page_digest text,
  page_count bigint CHECK (page_count IS NULL OR page_count BETWEEN 0 AND 9007199254740991),
  expected_count bigint CHECK (expected_count IS NULL OR expected_count BETWEEN 0 AND 9007199254740991),
  observed_count bigint CHECK (observed_count IS NULL OR observed_count BETWEEN 0 AND 9007199254740991),
  completeness text NOT NULL CHECK (completeness IN ('full','partial','unknown')),
  source_revision text,
  snapshot_digest text,
  reason_code text,
  occurred_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, candidate_id),
  UNIQUE (tenant_id, observation_id, snapshot_id, stage),
  FOREIGN KEY (tenant_id, run_id, producer_id, source_profile, snapshot_id)
    REFERENCES die_normalized.reconciliation_run(tenant_id, run_id, producer_id, source_profile, snapshot_id),
  FOREIGN KEY (tenant_id, observation_id, producer_id)
    REFERENCES die_normalized.observation(tenant_id, observation_id, producer_id),
  CHECK (snapshot_digest IS NULL OR snapshot_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (page_digest IS NULL OR page_digest ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (stage <> 'page' OR (page_sequence IS NOT NULL AND page_digest IS NOT NULL)),
  CHECK (
    stage <> 'completed'
    OR (page_count IS NOT NULL AND observed_count IS NOT NULL AND snapshot_digest IS NOT NULL)
  ),
  CHECK (stage <> 'failed' OR reason_code IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reconciliation_started
  ON die_normalized.reconciliation_candidate(tenant_id, run_id)
  WHERE stage = 'started';

CREATE UNIQUE INDEX IF NOT EXISTS uq_reconciliation_page
  ON die_normalized.reconciliation_candidate(tenant_id, run_id, page_sequence)
  WHERE stage = 'page';

CREATE UNIQUE INDEX IF NOT EXISTS uq_reconciliation_terminal
  ON die_normalized.reconciliation_candidate(tenant_id, run_id)
  WHERE stage IN ('completed','failed');

CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_member (
  tenant_id text NOT NULL,
  candidate_id uuid NOT NULL,
  member_ordinal integer NOT NULL CHECK (member_ordinal BETWEEN 0 AND 511),
  source_object_type text NOT NULL,
  source_namespace text NOT NULL,
  source_object_id text NOT NULL,
  PRIMARY KEY (tenant_id, candidate_id, member_ordinal),
  UNIQUE (tenant_id, candidate_id, source_object_type, source_namespace, source_object_id),
  FOREIGN KEY (tenant_id, candidate_id)
    REFERENCES die_normalized.reconciliation_candidate(tenant_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS die_identity.binding (
  tenant_id text NOT NULL,
  binding_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  canonical_entity_id uuid NOT NULL,
  decision_id uuid NOT NULL,
  binding_kind text NOT NULL CHECK (binding_kind IN ('automatic_exact','authoritative','reviewed','corrected','legacy_alias')),
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, binding_id),
  UNIQUE (tenant_id, source_object_pk, revision),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

ALTER TABLE die_identity.binding
  ADD CONSTRAINT binding_current_valid_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    source_object_pk WITH =,
    tstzrange(valid_from, valid_to, '[)') WITH &&
  )
  WHERE (system_to IS NULL);

CREATE TABLE IF NOT EXISTS die_identity.resolution_decision (
  tenant_id text NOT NULL,
  decision_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  decision_type text NOT NULL CHECK (decision_type IN ('create','bind','no_match','ambiguous','merge','split','correct','unbind')),
  selected_entity_id uuid,
  resolver_name text NOT NULL,
  resolver_version text NOT NULL,
  rules_digest text NOT NULL,
  negative_constraint_codes text[] NOT NULL DEFAULT '{}',
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  actor_type text NOT NULL CHECK (actor_type IN ('system','customer_user','support_user')),
  actor_id text NOT NULL,
  reason_code text NOT NULL,
  preview_digest text,
  decided_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, decision_id)
);

CREATE TABLE IF NOT EXISTS die_identity.resolution_decision_claim (
  tenant_id text NOT NULL,
  decision_id uuid NOT NULL,
  claim_id uuid NOT NULL,
  claim_role text NOT NULL CHECK (claim_role IN ('strong_key','negative_constraint','field_authority','context')),
  PRIMARY KEY (tenant_id, decision_id, claim_id, claim_role),
  FOREIGN KEY (tenant_id, decision_id)
    REFERENCES die_identity.resolution_decision(tenant_id, decision_id),
  FOREIGN KEY (tenant_id, claim_id)
    REFERENCES die_normalized.claim(tenant_id, claim_id)
);

ALTER TABLE die_identity.binding
  ADD CONSTRAINT binding_decision_fk
  FOREIGN KEY (tenant_id, decision_id)
  REFERENCES die_identity.resolution_decision(tenant_id, decision_id);

ALTER TABLE die_identity.binding
  ADD CONSTRAINT binding_source_object_fk
  FOREIGN KEY (tenant_id, source_object_pk)
  REFERENCES die_normalized.source_object(tenant_id, source_object_pk);

ALTER TABLE die_identity.resolution_decision
  ADD CONSTRAINT resolution_source_object_fk
  FOREIGN KEY (tenant_id, source_object_pk)
  REFERENCES die_normalized.source_object(tenant_id, source_object_pk);

CREATE TABLE IF NOT EXISTS die_identity.conflict (
  tenant_id text NOT NULL,
  conflict_id uuid NOT NULL,
  source_object_pk uuid NOT NULL,
  conflict_type text NOT NULL,
  state text NOT NULL CHECK (state IN ('open','resolved','dismissed','superseded')),
  detected_at timestamptz NOT NULL,
  resolved_at timestamptz,
  resolution_decision_id uuid,
  impact_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, conflict_id),
  FOREIGN KEY (tenant_id, source_object_pk)
    REFERENCES die_normalized.source_object(tenant_id, source_object_pk),
  FOREIGN KEY (tenant_id, resolution_decision_id)
    REFERENCES die_identity.resolution_decision(tenant_id, decision_id),
  CHECK (jsonb_typeof(impact_summary) = 'object'),
  CHECK (pg_column_size(impact_summary) <= 32768),
  CHECK (
    (state = 'open' AND resolved_at IS NULL)
    OR
    (state <> 'open' AND resolved_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS die_identity.conflict_candidate (
  tenant_id text NOT NULL,
  conflict_id uuid NOT NULL,
  candidate_entity_id uuid NOT NULL,
  candidate_rank integer CHECK (candidate_rank IS NULL OR candidate_rank > 0),
  reason_code text NOT NULL,
  PRIMARY KEY (tenant_id, conflict_id, candidate_entity_id),
  FOREIGN KEY (tenant_id, conflict_id)
    REFERENCES die_identity.conflict(tenant_id, conflict_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.entity (
  tenant_id text NOT NULL,
  entity_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('application_product','application_surface','application_deployment','application_account','agent_definition','agent_deployment','agent_hook','agent_skill','agent_plugin','configured_permission_rule','repository','model_product','model_family','model_version','model_deployment','model_route','provider_account','mcp_server_product','mcp_server_deployment','mcp_tool','mcp_resource_definition','mcp_prompt_definition','person','directory_account','service_principal','team','business_unit','device','browser_installation','endpoint_installation','llm_gateway_deployment','mcp_gateway_deployment','browser_backend_deployment','workload','workload_identity','provider','source_producer','source_object','session','resource','artifact_or_package')),
  current_version bigint NOT NULL CHECK (current_version BETWEEN 1 AND 9007199254740991),
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','inactive','stale','retired','ambiguous')),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, entity_id),
  CHECK (last_observed_at >= first_observed_at),
  CHECK (updated_at >= created_at)
);

CREATE TABLE IF NOT EXISTS die_identity.resolution_decision_entity (
  tenant_id text NOT NULL,
  decision_id uuid NOT NULL,
  entity_id uuid NOT NULL,
  participant_role text NOT NULL CHECK (participant_role IN ('source','target','created','restored','retired','survivor')),
  PRIMARY KEY (tenant_id, decision_id, entity_id, participant_role),
  FOREIGN KEY (tenant_id, decision_id)
    REFERENCES die_identity.resolution_decision(tenant_id, decision_id),
  FOREIGN KEY (tenant_id, entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id)
);

CREATE TABLE IF NOT EXISTS die_identity.entity_alias (
  tenant_id text NOT NULL,
  predecessor_entity_id uuid NOT NULL,
  survivor_entity_id uuid NOT NULL,
  decision_id uuid NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, predecessor_entity_id, system_from),
  FOREIGN KEY (tenant_id, predecessor_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  FOREIGN KEY (tenant_id, survivor_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  FOREIGN KEY (tenant_id, decision_id)
    REFERENCES die_identity.resolution_decision(tenant_id, decision_id),
  CHECK (predecessor_entity_id <> survivor_entity_id),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

CREATE TABLE IF NOT EXISTS die_identity.correction_claim (
  tenant_id text NOT NULL,
  correction_claim_id uuid NOT NULL,
  command_id uuid NOT NULL,
  entity_id uuid NOT NULL,
  field_path text NOT NULL,
  value_json jsonb NOT NULL,
  value_type text NOT NULL,
  sensitivity text NOT NULL CHECK (sensitivity IN ('public_product','internal','sensitive_metadata','restricted_evidence')),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  actor_id text NOT NULL,
  reason_code text NOT NULL,
  system_from timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, correction_claim_id),
  FOREIGN KEY (tenant_id, command_id)
    REFERENCES die_pipeline.identity_command(tenant_id, command_id),
  FOREIGN KEY (tenant_id, entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  CHECK (pg_column_size(value_json) <= 65536),
  CHECK (valid_to IS NULL OR valid_to > valid_from)
);

ALTER TABLE die_identity.conflict_candidate
  ADD CONSTRAINT conflict_candidate_entity_fk
  FOREIGN KEY (tenant_id, candidate_entity_id)
  REFERENCES die_canonical.entity(tenant_id, entity_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.entity_version (
  tenant_id text NOT NULL,
  entity_id uuid NOT NULL,
  version bigint NOT NULL CHECK (version BETWEEN 1 AND 9007199254740991),
  entity_type text NOT NULL,
  lifecycle text NOT NULL,
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  vendor text,
  owner_entity_id uuid,
  business_scope_id uuid NOT NULL,
  environment text,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  materializer_name text NOT NULL,
  materializer_version text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  change_reason text NOT NULL,
  PRIMARY KEY (tenant_id, entity_id, version),
  FOREIGN KEY (tenant_id, entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  FOREIGN KEY (tenant_id, owner_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK (jsonb_typeof(attributes) = 'object'),
  CHECK (pg_column_size(attributes) <= 65536),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

CREATE TABLE IF NOT EXISTS die_canonical.entity_version_claim (
  tenant_id text NOT NULL,
  entity_id uuid NOT NULL,
  entity_version bigint NOT NULL CHECK (entity_version BETWEEN 1 AND 9007199254740991),
  field_path text NOT NULL,
  claim_id uuid NOT NULL,
  selection_role text NOT NULL CHECK (selection_role IN ('selected','supporting','conflicting')),
  PRIMARY KEY (tenant_id, entity_id, entity_version, field_path, claim_id),
  FOREIGN KEY (tenant_id, entity_id, entity_version)
    REFERENCES die_canonical.entity_version(tenant_id, entity_id, version),
  FOREIGN KEY (tenant_id, claim_id)
    REFERENCES die_normalized.claim(tenant_id, claim_id)
);

ALTER TABLE die_canonical.entity_version
  ADD CONSTRAINT entity_system_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    entity_id WITH =,
    tstzrange(system_from, system_to, '[)') WITH &&
  )
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.entity_version_correction_claim (
  tenant_id text NOT NULL,
  entity_id uuid NOT NULL,
  entity_version bigint NOT NULL CHECK (entity_version BETWEEN 1 AND 9007199254740991),
  field_path text NOT NULL,
  correction_claim_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, entity_id, entity_version, field_path, correction_claim_id),
  FOREIGN KEY (tenant_id, entity_id, entity_version)
    REFERENCES die_canonical.entity_version(tenant_id, entity_id, version),
  FOREIGN KEY (tenant_id, correction_claim_id)
    REFERENCES die_identity.correction_claim(tenant_id, correction_claim_id)
);

ALTER TABLE die_canonical.entity
  ADD CONSTRAINT entity_current_version_fk
  FOREIGN KEY (tenant_id, entity_id, current_version)
  REFERENCES die_canonical.entity_version(tenant_id, entity_id, version)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_identity.binding
  ADD CONSTRAINT binding_entity_fk
  FOREIGN KEY (tenant_id, canonical_entity_id)
  REFERENCES die_canonical.entity(tenant_id, entity_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_identity.resolution_decision
  ADD CONSTRAINT resolution_selected_entity_fk
  FOREIGN KEY (tenant_id, selected_entity_id)
  REFERENCES die_canonical.entity(tenant_id, entity_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.relationship (
  tenant_id text NOT NULL,
  relationship_id uuid NOT NULL,
  subject_entity_id uuid NOT NULL,
  predicate text NOT NULL,
  object_entity_id uuid NOT NULL,
  semantic text NOT NULL CHECK (semantic IN ('structural','configured','entitlement','observed','ownership','coverage')),
  scope_kind text NOT NULL DEFAULT 'unscoped' CHECK (scope_kind IN ('unscoped','authorization_context','source_configuration','source_observation')),
  scope_key text NOT NULL DEFAULT 'unscoped',
  current_version bigint NOT NULL CHECK (current_version BETWEEN 1 AND 9007199254740991),
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','ended','stale','ambiguous')),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, relationship_id),
  UNIQUE (tenant_id, subject_entity_id, predicate, object_entity_id, semantic, scope_kind, scope_key),
  FOREIGN KEY (tenant_id, subject_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  FOREIGN KEY (tenant_id, object_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id),
  CHECK (last_observed_at >= first_observed_at),
  CHECK (
    (scope_kind = 'unscoped' AND scope_key = 'unscoped')
    OR
    (scope_kind <> 'unscoped' AND scope_key ~ '^sha256:[0-9a-f]{64}$')
  )
);

CREATE TABLE IF NOT EXISTS die_canonical.relationship_version (
  tenant_id text NOT NULL,
  relationship_id uuid NOT NULL,
  version bigint NOT NULL CHECK (version BETWEEN 1 AND 9007199254740991),
  lifecycle text NOT NULL,
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  materializer_version text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, relationship_id, version),
  FOREIGN KEY (tenant_id, relationship_id)
    REFERENCES die_canonical.relationship(tenant_id, relationship_id),
  CHECK (jsonb_typeof(attributes) = 'object'),
  CHECK (pg_column_size(attributes) <= 65536),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

CREATE TABLE IF NOT EXISTS die_canonical.relationship_version_candidate (
  tenant_id text NOT NULL,
  relationship_id uuid NOT NULL,
  relationship_version bigint NOT NULL CHECK (relationship_version BETWEEN 1 AND 9007199254740991),
  candidate_id uuid NOT NULL,
  support_role text NOT NULL CHECK (support_role IN ('supporting','ending','retracted','conflicting')),
  PRIMARY KEY (tenant_id, relationship_id, relationship_version, candidate_id),
  FOREIGN KEY (tenant_id, relationship_id, relationship_version)
    REFERENCES die_canonical.relationship_version(tenant_id, relationship_id, version),
  FOREIGN KEY (tenant_id, candidate_id)
    REFERENCES die_normalized.relationship_candidate(tenant_id, candidate_id)
);

ALTER TABLE die_canonical.relationship_version
  ADD CONSTRAINT relationship_system_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    relationship_id WITH =,
    tstzrange(system_from, system_to, '[)') WITH &&
  )
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.relationship_version_evidence (
  tenant_id text NOT NULL,
  relationship_id uuid NOT NULL,
  relationship_version bigint NOT NULL CHECK (relationship_version BETWEEN 1 AND 9007199254740991),
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, relationship_id, relationship_version, evidence_id),
  FOREIGN KEY (tenant_id, relationship_id, relationship_version)
    REFERENCES die_canonical.relationship_version(tenant_id, relationship_id, version),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

ALTER TABLE die_canonical.relationship
  ADD CONSTRAINT relationship_current_version_fk
  FOREIGN KEY (tenant_id, relationship_id, current_version)
  REFERENCES die_canonical.relationship_version(tenant_id, relationship_id, version)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.activity_locator (
  tenant_id text NOT NULL,
  activity_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  current_version bigint NOT NULL CHECK (current_version BETWEEN 1 AND 9007199254740991),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, activity_id),
  UNIQUE (tenant_id, activity_id, occurred_at)
);

CREATE TABLE IF NOT EXISTS die_canonical.activity_source_binding (
  tenant_id text NOT NULL,
  activity_binding_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  source_profile text NOT NULL,
  producer_id uuid NOT NULL,
  source_namespace text NOT NULL,
  source_activity_id text NOT NULL,
  binding_kind text NOT NULL CHECK (binding_kind IN ('source_exact','causal_exact','session_exact','parent_child_exact','reviewed')),
  correlation_level smallint NOT NULL CHECK (correlation_level BETWEEN 1 AND 5),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, activity_binding_id),
  FOREIGN KEY (tenant_id, activity_id)
    REFERENCES die_canonical.activity_locator(tenant_id, activity_id),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  CHECK (binding_kind = 'reviewed' OR correlation_level BETWEEN 1 AND 4),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

CREATE TABLE IF NOT EXISTS die_canonical.activity_source_binding_evidence (
  tenant_id text NOT NULL,
  activity_binding_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, activity_binding_id, evidence_id),
  FOREIGN KEY (tenant_id, activity_binding_id)
    REFERENCES die_canonical.activity_source_binding(tenant_id, activity_binding_id),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

ALTER TABLE die_canonical.activity_source_binding
  ADD CONSTRAINT activity_binding_current_valid_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    source_profile WITH =,
    producer_id WITH =,
    source_namespace WITH =,
    source_activity_id WITH =,
    tstzrange(valid_from, valid_to, '[)') WITH &&
  )
  WHERE (system_to IS NULL)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.activity_version (
  tenant_id text NOT NULL,
  activity_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version BETWEEN 1 AND 9007199254740991),
  family text NOT NULL CHECK (family IN ('application','agent','workload','session','model','mcp','tool','network','resource','source','native_control')),
  subtype text NOT NULL,
  business_scope_id uuid NOT NULL,
  environment text NOT NULL,
  sensitivity text NOT NULL CHECK (sensitivity IN ('public_product','internal','sensitive_metadata','restricted_evidence')),
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','tombstoned','deleted')),
  visibility text NOT NULL CHECK (visibility IN ('visible','suppressed','legal_hold_only')),
  actor_entity_id uuid,
  outcome text NOT NULL CHECK (outcome IN ('succeeded','failed','blocked','cancelled','timed_out','unknown')),
  native_decision text,
  observed_effect text,
  correlation jsonb NOT NULL DEFAULT '{}'::jsonb,
  safe_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  capture_state text NOT NULL CHECK (capture_state IN ('complete','minimized','redacted','metadata_only','unsupported')),
  materializer_version text NOT NULL,
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, occurred_at, activity_id, version),
  CHECK (jsonb_typeof(correlation) = 'object'),
  CHECK (jsonb_typeof(safe_metrics) = 'object'),
  CHECK (pg_column_size(correlation) <= 32768),
  CHECK (pg_column_size(safe_metrics) <= 32768),
  CHECK (system_to IS NULL OR system_to > system_from)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE IF NOT EXISTS die_canonical.activity_version_default
  PARTITION OF die_canonical.activity_version DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_activity_version_system_current
  ON die_canonical.activity_version(tenant_id, occurred_at, activity_id)
  WHERE system_to IS NULL;

ALTER TABLE die_canonical.activity_version
  ADD CONSTRAINT activity_version_locator_fk
  FOREIGN KEY (tenant_id, activity_id, occurred_at)
  REFERENCES die_canonical.activity_locator(tenant_id, activity_id, occurred_at);

ALTER TABLE die_canonical.activity_version
  ADD CONSTRAINT activity_version_actor_fk
  FOREIGN KEY (tenant_id, actor_entity_id)
  REFERENCES die_canonical.entity(tenant_id, entity_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.activity_version_resource (
  tenant_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  activity_id uuid NOT NULL,
  activity_version bigint NOT NULL CHECK (activity_version BETWEEN 1 AND 9007199254740991),
  resource_ordinal integer NOT NULL CHECK (resource_ordinal >= 0),
  resource_entity_id uuid NOT NULL,
  resource_role text NOT NULL,
  PRIMARY KEY (tenant_id, occurred_at, activity_id, activity_version, resource_ordinal),
  UNIQUE (tenant_id, occurred_at, activity_id, activity_version, resource_entity_id, resource_role),
  FOREIGN KEY (tenant_id, occurred_at, activity_id, activity_version)
    REFERENCES die_canonical.activity_version(tenant_id, occurred_at, activity_id, version),
  FOREIGN KEY (tenant_id, resource_entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.activity_version_evidence (
  tenant_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  activity_id uuid NOT NULL,
  activity_version bigint NOT NULL CHECK (activity_version BETWEEN 1 AND 9007199254740991),
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, occurred_at, activity_id, activity_version, evidence_id),
  FOREIGN KEY (tenant_id, occurred_at, activity_id, activity_version)
    REFERENCES die_canonical.activity_version(tenant_id, occurred_at, activity_id, version),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.activity_version_candidate (
  tenant_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  activity_id uuid NOT NULL,
  activity_version bigint NOT NULL CHECK (activity_version BETWEEN 1 AND 9007199254740991),
  candidate_id uuid NOT NULL,
  support_role text NOT NULL CHECK (support_role IN ('primary','supporting','correlating','conflicting','retracted')),
  PRIMARY KEY (tenant_id, occurred_at, activity_id, activity_version, candidate_id),
  FOREIGN KEY (tenant_id, occurred_at, activity_id, activity_version)
    REFERENCES die_canonical.activity_version(tenant_id, occurred_at, activity_id, version),
  FOREIGN KEY (tenant_id, candidate_id)
    REFERENCES die_normalized.activity_candidate(tenant_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.activity_version_relationship (
  tenant_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  activity_id uuid NOT NULL,
  activity_version bigint NOT NULL CHECK (activity_version BETWEEN 1 AND 9007199254740991),
  relationship_id uuid NOT NULL,
  relationship_role text NOT NULL,
  PRIMARY KEY (tenant_id, occurred_at, activity_id, activity_version, relationship_id, relationship_role),
  FOREIGN KEY (tenant_id, occurred_at, activity_id, activity_version)
    REFERENCES die_canonical.activity_version(tenant_id, occurred_at, activity_id, version),
  FOREIGN KEY (tenant_id, relationship_id)
    REFERENCES die_canonical.relationship(tenant_id, relationship_id)
);

ALTER TABLE die_canonical.activity_locator
  ADD CONSTRAINT activity_current_version_fk
  FOREIGN KEY (tenant_id, occurred_at, activity_id, current_version)
  REFERENCES die_canonical.activity_version(tenant_id, occurred_at, activity_id, version)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_canonical.coverage_interval (
  tenant_id text NOT NULL,
  coverage_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  business_scope_id uuid NOT NULL,
  capability text NOT NULL,
  population_id uuid NOT NULL,
  state text NOT NULL CHECK (state IN ('covered','degraded','gap','unsupported','unknown')),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  reason_code text,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  system_from timestamptz NOT NULL,
  system_to timestamptz,
  PRIMARY KEY (tenant_id, coverage_id, revision),
  FOREIGN KEY (tenant_id, producer_id)
    REFERENCES die_control.producer(tenant_id, producer_id),
  FOREIGN KEY (tenant_id, population_id, producer_id, capability)
    REFERENCES die_control.expected_population(tenant_id, population_id, producer_id, capability),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (system_to IS NULL OR system_to > system_from)
);

CREATE TABLE IF NOT EXISTS die_canonical.coverage_interval_evidence (
  tenant_id text NOT NULL,
  coverage_id uuid NOT NULL,
  coverage_revision bigint NOT NULL CHECK (coverage_revision BETWEEN 1 AND 9007199254740991),
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, coverage_id, coverage_revision, evidence_id),
  FOREIGN KEY (tenant_id, coverage_id, coverage_revision)
    REFERENCES die_canonical.coverage_interval(tenant_id, coverage_id, revision),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.coverage_interval_candidate (
  tenant_id text NOT NULL,
  coverage_id uuid NOT NULL,
  coverage_revision bigint NOT NULL CHECK (coverage_revision BETWEEN 1 AND 9007199254740991),
  candidate_id uuid NOT NULL,
  support_role text NOT NULL CHECK (support_role IN ('primary','supporting','ending','conflicting')),
  PRIMARY KEY (tenant_id, coverage_id, coverage_revision, candidate_id),
  FOREIGN KEY (tenant_id, coverage_id, coverage_revision)
    REFERENCES die_canonical.coverage_interval(tenant_id, coverage_id, revision),
  FOREIGN KEY (tenant_id, candidate_id)
    REFERENCES die_normalized.coverage_candidate(tenant_id, candidate_id)
);

ALTER TABLE die_canonical.coverage_interval
  ADD CONSTRAINT coverage_current_valid_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    producer_id WITH =,
    capability WITH =,
    population_id WITH =,
    tstzrange(valid_from, valid_to, '[)') WITH &&
  )
  WHERE (system_to IS NULL);

CREATE TABLE IF NOT EXISTS die_canonical.reconciliation_evaluation (
  tenant_id text NOT NULL,
  evaluation_id uuid NOT NULL,
  run_id uuid NOT NULL,
  result text NOT NULL CHECK (result IN ('applied_full','recorded_partial','recorded_failure','no_change','rejected')),
  closed_source_support_count bigint NOT NULL DEFAULT 0
    CHECK (closed_source_support_count BETWEEN 0 AND 9007199254740991),
  evaluation_digest text NOT NULL CHECK (evaluation_digest ~ '^sha256:[0-9a-f]{64}$'),
  materializer_version text NOT NULL,
  evaluated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, evaluation_id),
  UNIQUE (tenant_id, run_id, materializer_version),
  FOREIGN KEY (tenant_id, run_id)
    REFERENCES die_normalized.reconciliation_run(tenant_id, run_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.reconciliation_evaluation_entity (
  tenant_id text NOT NULL,
  evaluation_id uuid NOT NULL,
  entity_id uuid NOT NULL,
  effect text NOT NULL CHECK (effect IN ('created','retained','staled','retired','changed')),
  PRIMARY KEY (tenant_id, evaluation_id, entity_id),
  FOREIGN KEY (tenant_id, evaluation_id)
    REFERENCES die_canonical.reconciliation_evaluation(tenant_id, evaluation_id),
  FOREIGN KEY (tenant_id, entity_id)
    REFERENCES die_canonical.entity(tenant_id, entity_id)
);

CREATE TABLE IF NOT EXISTS die_canonical.reconciliation_evaluation_evidence (
  tenant_id text NOT NULL,
  evaluation_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, evaluation_id, evidence_id),
  FOREIGN KEY (tenant_id, evaluation_id)
    REFERENCES die_canonical.reconciliation_evaluation(tenant_id, evaluation_id),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS die_outbox.canonical_change (
  tenant_id text NOT NULL,
  outbox_id bigint GENERATED ALWAYS AS IDENTITY CHECK (outbox_id BETWEEN 1 AND 9007199254740991),
  aggregate_type text NOT NULL CHECK (aggregate_type IN ('entity','relationship','activity','coverage','evidence')),
  aggregate_id uuid NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version BETWEEN 1 AND 9007199254740991),
  change_type text NOT NULL CHECK (change_type IN (
    'created','updated','ended','staled','retired','tombstoned',
    'restored','merged','split','ambiguous','coverage_changed',
    'evidence_disposition_changed'
  )),
  partition_key text NOT NULL CHECK (length(partition_key) BETWEEN 1 AND 256),
  payload_version text NOT NULL CHECK (payload_version = 'die.outbox.pointer.v1'),
  aggregate_digest text NOT NULL CHECK (aggregate_digest ~ '^sha256:[0-9a-f]{64}$'),
  causation_execution_id uuid,
  causation_audit_event_id uuid,
  causation_evidence_id uuid,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, outbox_id),
  UNIQUE (tenant_id, aggregate_type, aggregate_id, aggregate_version),
  FOREIGN KEY (tenant_id, causation_execution_id)
    REFERENCES die_pipeline.stage_execution(tenant_id, execution_id)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK (
    causation_execution_id IS NOT NULL
    OR causation_audit_event_id IS NOT NULL
    OR causation_evidence_id IS NOT NULL
  ),
  CHECK (jsonb_typeof(payload) = 'object'),
  CHECK (die_authz.jsonb_object_key_count(payload) <= 32),
  CHECK (pg_column_size(payload) <= 65536)
);

CREATE TABLE IF NOT EXISTS die_read.entity_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  entity_type text NOT NULL,
  lifecycle text NOT NULL,
  display_name text NOT NULL,
  canonical_name text NOT NULL,
  vendor text,
  owner_entity_id uuid,
  business_scope_id uuid NOT NULL,
  environment text,
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  relationship_count bigint NOT NULL CHECK (relationship_count BETWEEN 0 AND 9007199254740991),
  recent_activity_at timestamptz,
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  safe_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, entity_id),
  CHECK (jsonb_typeof(safe_summary) = 'object'),
  CHECK (pg_column_size(safe_summary) <= 65536)
);

CREATE TABLE IF NOT EXISTS die_read.agent_deployment_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  agent_deployment_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  agent_definition_id uuid NOT NULL,
  version text,
  agent_kind text NOT NULL,
  deployment_locality text NOT NULL,
  device_id uuid,
  observed_user_id uuid,
  execution_identity_id uuid,
  related_workload_id uuid,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  configured_mcp_server_count bigint NOT NULL CHECK (configured_mcp_server_count BETWEEN 0 AND 9007199254740991),
  configured_local_mcp_server_count bigint NOT NULL CHECK (configured_local_mcp_server_count BETWEEN 0 AND 9007199254740991),
  configured_remote_mcp_server_count bigint NOT NULL CHECK (configured_remote_mcp_server_count BETWEEN 0 AND 9007199254740991),
  configured_model_count bigint NOT NULL CHECK (configured_model_count BETWEEN 0 AND 9007199254740991),
  configured_component_count bigint NOT NULL CHECK (configured_component_count BETWEEN 0 AND 9007199254740991),
  repository_count bigint NOT NULL CHECK (repository_count BETWEEN 0 AND 9007199254740991),
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  identity_assurance text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, agent_deployment_id)
);

CREATE TABLE IF NOT EXISTS die_read.application_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  primary_entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  aggregation_level text NOT NULL,
  product_entity_id uuid,
  vendor text,
  technology_class text NOT NULL,
  agentic_capability text NOT NULL,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  surface_count bigint NOT NULL CHECK (surface_count BETWEEN 0 AND 9007199254740991),
  deployment_count bigint NOT NULL CHECK (deployment_count BETWEEN 0 AND 9007199254740991),
  account_count bigint NOT NULL CHECK (account_count BETWEEN 0 AND 9007199254740991),
  observed_identity_count bigint NOT NULL CHECK (observed_identity_count BETWEEN 0 AND 9007199254740991),
  device_count bigint NOT NULL CHECK (device_count BETWEEN 0 AND 9007199254740991),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, primary_entity_id)
);

CREATE TABLE IF NOT EXISTS die_read.model_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  model_entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  asset_level text NOT NULL,
  provider_entity_id uuid,
  provider_account_entity_id uuid,
  model_family_entity_id uuid,
  model_version_entity_id uuid,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  configured_application_count bigint NOT NULL CHECK (configured_application_count BETWEEN 0 AND 9007199254740991),
  invocation_count bigint NOT NULL CHECK (invocation_count BETWEEN 0 AND 9007199254740991),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, model_entity_id)
);

CREATE TABLE IF NOT EXISTS die_read.mcp_server_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  server_deployment_entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  server_product_entity_id uuid,
  locality text NOT NULL,
  transport text,
  parent_application_entity_id uuid,
  parent_agent_entity_id uuid,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  tool_count bigint NOT NULL CHECK (tool_count BETWEEN 0 AND 9007199254740991),
  resource_count bigint NOT NULL CHECK (resource_count BETWEEN 0 AND 9007199254740991),
  prompt_count bigint NOT NULL CHECK (prompt_count BETWEEN 0 AND 9007199254740991),
  call_count bigint NOT NULL CHECK (call_count BETWEEN 0 AND 9007199254740991),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, server_deployment_entity_id)
);

CREATE TABLE IF NOT EXISTS die_read.device_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  device_entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  hostname text,
  os_platform text,
  os_version text,
  device_type text,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  application_count bigint NOT NULL CHECK (application_count BETWEEN 0 AND 9007199254740991),
  agent_count bigint NOT NULL CHECK (agent_count BETWEEN 0 AND 9007199254740991),
  observed_identity_count bigint NOT NULL CHECK (observed_identity_count BETWEEN 0 AND 9007199254740991),
  installation_count bigint NOT NULL CHECK (installation_count BETWEEN 0 AND 9007199254740991),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, device_entity_id)
);

CREATE TABLE IF NOT EXISTS die_read.identity_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  identity_entity_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  identity_kind text NOT NULL,
  authoritative_person_entity_id uuid,
  account_name text,
  account_domain text,
  identity_assurance text NOT NULL,
  business_scope_id uuid NOT NULL,
  environment text,
  lifecycle text NOT NULL,
  observed_device_count bigint NOT NULL CHECK (observed_device_count BETWEEN 0 AND 9007199254740991),
  observed_application_count bigint NOT NULL CHECK (observed_application_count BETWEEN 0 AND 9007199254740991),
  execution_count bigint NOT NULL CHECK (execution_count BETWEEN 0 AND 9007199254740991),
  first_observed_at timestamptz NOT NULL,
  last_observed_at timestamptz NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  ambiguity_state text NOT NULL,
  coverage_state text NOT NULL,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, identity_entity_id)
);

CREATE TABLE IF NOT EXISTS die_read.relationship_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  relationship_id uuid NOT NULL,
  canonical_version bigint NOT NULL CHECK (canonical_version BETWEEN 1 AND 9007199254740991),
  subject_entity_id uuid NOT NULL,
  predicate text NOT NULL,
  object_entity_id uuid NOT NULL,
  semantic text NOT NULL,
  scope_kind text NOT NULL DEFAULT 'unscoped',
  scope_key text NOT NULL DEFAULT 'unscoped',
  lifecycle text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  end_reason text CHECK (end_reason IS NULL OR end_reason IN (
    'source_ended', 'retracted', 'reconciliation_absent', 'corrected', 'unknown'
  )),
  confidence numeric(5,4) NOT NULL,
  source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991),
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, relationship_id),
  CHECK (scope_kind IN ('unscoped','authorization_context','source_configuration','source_observation')),
  CHECK (
    (scope_kind = 'unscoped' AND scope_key = 'unscoped')
    OR
    (scope_kind <> 'unscoped' AND scope_key ~ '^sha256:[0-9a-f]{64}$')
  ),
  CHECK (lifecycle <> 'ended' OR end_reason IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS die_read.producer_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  producer_id uuid NOT NULL,
  business_scope_id uuid NOT NULL,
  environment text NOT NULL,
  source_profile text NOT NULL,
  display_name text NOT NULL,
  trust_state text NOT NULL,
  health_state text NOT NULL,
  coverage_state text NOT NULL,
  last_seen_at timestamptz,
  queue_depth bigint CHECK (queue_depth IS NULL OR queue_depth BETWEEN 0 AND 9007199254740991),
  oldest_queue_age_ms bigint CHECK (oldest_queue_age_ms IS NULL OR oldest_queue_age_ms BETWEEN 0 AND 9007199254740991),
  open_gap_count bigint NOT NULL CHECK (open_gap_count BETWEEN 0 AND 9007199254740991),
  artifact_digest text NOT NULL,
  certification_id uuid,
  projection_watermark bigint NOT NULL CHECK (projection_watermark BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (tenant_id, projection_generation, producer_id)
);

CREATE TABLE IF NOT EXISTS die_read.overview_current (
  tenant_id text NOT NULL,
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  scope_key text NOT NULL,
  generated_at timestamptz NOT NULL,
  entity_counts jsonb NOT NULL,
  active_entity_counts jsonb NOT NULL,
  source_counts jsonb NOT NULL,
  activity_counts jsonb NOT NULL,
  coverage_summary jsonb NOT NULL,
  changes_summary jsonb NOT NULL,
  canonical_watermark bigint NOT NULL CHECK (canonical_watermark BETWEEN 0 AND 9007199254740991),
  activity_watermark text,
  PRIMARY KEY (tenant_id, projection_generation, scope_key),
  CHECK (jsonb_typeof(entity_counts) = 'object'),
  CHECK (jsonb_typeof(active_entity_counts) = 'object'),
  CHECK (jsonb_typeof(source_counts) = 'object'),
  CHECK (jsonb_typeof(activity_counts) = 'object'),
  CHECK (jsonb_typeof(coverage_summary) = 'object'),
  CHECK (jsonb_typeof(changes_summary) = 'object'),
  CHECK (pg_column_size(entity_counts) <= 65536),
  CHECK (pg_column_size(active_entity_counts) <= 65536),
  CHECK (pg_column_size(source_counts) <= 65536),
  CHECK (pg_column_size(activity_counts) <= 65536),
  CHECK (pg_column_size(coverage_summary) <= 65536),
  CHECK (pg_column_size(changes_summary) <= 65536)
);

CREATE TABLE IF NOT EXISTS die_read.export_job (
  tenant_id text NOT NULL,
  export_id uuid NOT NULL,
  requested_by text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('inventory','relationships','activity','evidence','coverage','producers','audit')),
  format text NOT NULL CHECK (format IN ('csv','jsonl','parquet')),
  filter_json jsonb NOT NULL,
  filter_digest text NOT NULL CHECK (filter_digest ~ '^sha256:[0-9a-f]{64}$'),
  authorization_decision_id text NOT NULL,
  authorization_filter_digest text NOT NULL CHECK (authorization_filter_digest ~ '^sha256:[0-9a-f]{64}$'),
  authorization_scope_digest text NOT NULL CHECK (authorization_scope_digest ~ '^sha256:[0-9a-f]{64}$'),
  field_mask_digest text NOT NULL CHECK (field_mask_digest ~ '^sha256:[0-9a-f]{64}$'),
  authorization_revision bigint NOT NULL CHECK (authorization_revision BETWEEN 1 AND 9007199254740991),
  projection_name text NOT NULL DEFAULT 'die_product_v1' CHECK (projection_name = 'die_product_v1'),
  projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991),
  canonical_watermark bigint NOT NULL CHECK (canonical_watermark BETWEEN 0 AND 9007199254740991),
  activity_watermark text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued','running','completed','failed','expired','cancelled')),
  object_key text,
  file_sha256 text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL,
  completed_at timestamptz,
  PRIMARY KEY (tenant_id, export_id),
  FOREIGN KEY (tenant_id, projection_name, projection_generation)
    REFERENCES die_pipeline.projection_generation(tenant_id, projection_name, generation),
  CHECK (jsonb_typeof(filter_json) = 'object'),
  CHECK (pg_column_size(filter_json) <= 65536),
  CHECK (length(activity_watermark) BETWEEN 1 AND 256)
);

CREATE TABLE IF NOT EXISTS die_read.export_job_field (
  tenant_id text NOT NULL,
  export_id uuid NOT NULL,
  field_ordinal smallint NOT NULL CHECK (field_ordinal BETWEEN 0 AND 255),
  field_path text NOT NULL CHECK (field_path ~ '^[A-Za-z][A-Za-z0-9_.]{0,127}$'),
  field_classification text NOT NULL CHECK (field_classification IN ('public_product','internal','sensitive_metadata','restricted_evidence')),
  PRIMARY KEY (tenant_id, export_id, field_ordinal),
  UNIQUE (tenant_id, export_id, field_path),
  FOREIGN KEY (tenant_id, export_id)
    REFERENCES die_read.export_job(tenant_id, export_id)
);

CREATE TABLE IF NOT EXISTS die_authz.business_scope (
  tenant_id text NOT NULL,
  scope_id uuid NOT NULL,
  scope_type text NOT NULL CHECK (scope_type IN ('tenant','organization','department','team','environment')),
  parent_scope_id uuid,
  display_name text NOT NULL,
  lifecycle text NOT NULL CHECK (lifecycle IN ('active','inactive')),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, scope_id),
  FOREIGN KEY (tenant_id, parent_scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id),
  CHECK (scope_type <> 'tenant' OR (parent_scope_id IS NULL AND lifecycle = 'active'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_business_scope_tenant_root
  ON die_authz.business_scope(tenant_id)
  WHERE scope_type = 'tenant';

ALTER TABLE die_control.producer
  ADD CONSTRAINT producer_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_control.expected_population_version
  ADD CONSTRAINT expected_population_version_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_evidence.evidence_record
  ADD CONSTRAINT evidence_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_canonical.entity_version
  ADD CONSTRAINT entity_version_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_canonical.activity_version
  ADD CONSTRAINT activity_version_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_canonical.coverage_interval
  ADD CONSTRAINT coverage_business_scope_fk
  FOREIGN KEY (tenant_id, business_scope_id)
  REFERENCES die_authz.business_scope(tenant_id, scope_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_authz.scope_closure (
  tenant_id text NOT NULL,
  ancestor_scope_id uuid NOT NULL,
  descendant_scope_id uuid NOT NULL,
  depth integer NOT NULL CHECK (depth >= 0),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, revision, ancestor_scope_id, descendant_scope_id),
  FOREIGN KEY (tenant_id, ancestor_scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id),
  FOREIGN KEY (tenant_id, descendant_scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id)
);

CREATE TABLE IF NOT EXISTS die_authz.role_binding (
  tenant_id text NOT NULL,
  binding_id uuid NOT NULL,
  subject_type text NOT NULL CHECK (subject_type IN ('user','group','service','support_session')),
  subject_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('tenant_admin','inventory_viewer','activity_viewer','evidence_viewer','source_operator','identity_reviewer','export_operator','auditor','support_session')),
  scope_id uuid NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  closed_revision bigint CHECK (closed_revision IS NULL OR closed_revision BETWEEN 2 AND 9007199254740991),
  granted_by text NOT NULL,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, binding_id),
  FOREIGN KEY (tenant_id, scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id),
  CHECK (jsonb_typeof(conditions) = 'object'),
  CHECK (pg_column_size(conditions) <= 16384),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK ((valid_to IS NULL) = (closed_revision IS NULL)),
  CHECK (closed_revision IS NULL OR closed_revision > revision)
);

CREATE TABLE IF NOT EXISTS die_authz.relation_tuple (
  tenant_id text NOT NULL,
  tuple_id uuid NOT NULL,
  subject_type text NOT NULL CHECK (subject_type IN ('user','group','service','support_session')),
  subject_id text NOT NULL,
  relation text NOT NULL CHECK (relation IN ('member','viewer','operator','reviewer','auditor','owner','delegate','requested_by','approved_support')),
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  source text NOT NULL CHECK (source IN ('admin','identity_provider','authoritative_connector','system')),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  closed_revision bigint CHECK (closed_revision IS NULL OR closed_revision BETWEEN 2 AND 9007199254740991),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  PRIMARY KEY (tenant_id, tuple_id),
  UNIQUE (tenant_id, subject_type, subject_id, relation, resource_type, resource_id, revision),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK ((valid_to IS NULL) = (closed_revision IS NULL)),
  CHECK (closed_revision IS NULL OR closed_revision > revision)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_role_binding_active
  ON die_authz.role_binding(tenant_id, subject_type, subject_id, role, scope_id)
  WHERE valid_to IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_relation_tuple_active
  ON die_authz.relation_tuple(
    tenant_id, subject_type, subject_id, relation, resource_type, resource_id
  )
  WHERE valid_to IS NULL;

ALTER TABLE die_authz.role_binding
  ADD CONSTRAINT role_binding_valid_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    subject_type WITH =,
    subject_id WITH =,
    role WITH =,
    scope_id WITH =,
    tstzrange(valid_from, valid_to, '[)') WITH &&
  );

ALTER TABLE die_authz.relation_tuple
  ADD CONSTRAINT relation_tuple_valid_time_no_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    subject_type WITH =,
    subject_id WITH =,
    relation WITH =,
    resource_type WITH =,
    resource_id WITH =,
    tstzrange(valid_from, valid_to, '[)') WITH &&
  );

CREATE TABLE IF NOT EXISTS die_authz.authorization_revision (
  tenant_id text PRIMARY KEY,
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS die_authz.bootstrap_manifest (
  tenant_id text NOT NULL,
  manifest_id uuid NOT NULL,
  root_scope_id uuid NOT NULL,
  revision bigint NOT NULL CHECK (revision = 1),
  manifest_digest text NOT NULL CHECK (manifest_digest ~ '^sha256:[0-9a-f]{64}$'),
  issuer text NOT NULL,
  signer_key_id text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  applied_at timestamptz NOT NULL,
  result text NOT NULL CHECK (result IN ('applied','no_change','rejected')),
  reason_code text,
  PRIMARY KEY (tenant_id, manifest_id),
  UNIQUE (tenant_id, revision),
  FOREIGN KEY (tenant_id, root_scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS die_authz.oidc_trust (
  tenant_id text NOT NULL,
  issuer_uri text NOT NULL CHECK (issuer_uri ~ '^https://'),
  revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
  discovery_uri text NOT NULL CHECK (discovery_uri ~ '^https://'),
  allowed_audiences jsonb NOT NULL CHECK (
    jsonb_typeof(allowed_audiences) = 'array'
    AND jsonb_array_length(allowed_audiences) BETWEEN 1 AND 32
    AND NOT jsonb_path_exists(allowed_audiences, '$[*] ? (@.type() != "string")')
  ),
  allowed_algorithms jsonb NOT NULL CHECK (
    jsonb_typeof(allowed_algorithms) = 'array'
    AND jsonb_array_length(allowed_algorithms) BETWEEN 1 AND 4
    AND allowed_algorithms <@ '["RS256","PS256","ES256","EdDSA"]'::jsonb
  ),
  jwks_soft_ttl_seconds integer NOT NULL CHECK (jwks_soft_ttl_seconds BETWEEN 60 AND 900),
  jwks_hard_ttl_seconds integer NOT NULL CHECK (jwks_hard_ttl_seconds BETWEEN 3600 AND 86400),
  forced_refresh_min_interval_seconds integer NOT NULL CHECK (forced_refresh_min_interval_seconds BETWEEN 60 AND 300),
  max_token_lifetime_seconds integer NOT NULL CHECK (max_token_lifetime_seconds BETWEEN 60 AND 86400),
  clock_skew_seconds integer NOT NULL CHECK (clock_skew_seconds BETWEEN 0 AND 300),
  state text NOT NULL CHECK (state IN ('pending', 'active', 'disabled', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, issuer_uri, revision),
  CHECK (jwks_hard_ttl_seconds >= jwks_soft_ttl_seconds)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_oidc_trust_one_active
  ON die_authz.oidc_trust (tenant_id, issuer_uri)
  WHERE state = 'active';

-- The raw cookie/JWT is never stored. The BFF resolves tenant routing from the
-- trusted host/router context, sets app.tenant_id, then looks up this HMAC.
CREATE TABLE IF NOT EXISTS die_authz.runtime_session (
  tenant_id text NOT NULL,
  session_id uuid NOT NULL,
  session_token_digest text NOT NULL CHECK (
    session_token_digest ~ '^hmac-sha256:[0-9a-f]{64}$'
  ),
  issuer_uri text NOT NULL CHECK (issuer_uri ~ '^https://'),
  issuer_revision bigint NOT NULL CHECK (
    issuer_revision BETWEEN 1 AND 9007199254740991
  ),
  subject text NOT NULL CHECK (length(subject) BETWEEN 1 AND 512),
  role_ids jsonb NOT NULL CHECK (
    jsonb_typeof(role_ids) = 'array'
    AND jsonb_array_length(role_ids) <= 128
    AND NOT jsonb_path_exists(role_ids, '$[*] ? (@.type() != "string")')
  ),
  authorization_revision bigint NOT NULL CHECK (
    authorization_revision BETWEEN 1 AND 9007199254740991
  ),
  session_epoch bigint NOT NULL CHECK (session_epoch BETWEEN 1 AND 9007199254740991),
  authentication_time timestamptz NOT NULL,
  assurance text NOT NULL CHECK (length(assurance) BETWEEN 1 AND 128),
  state text NOT NULL CHECK (state IN ('active', 'logged_out', 'expired', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  last_seen_at timestamptz NOT NULL,
  idle_expires_at timestamptz NOT NULL,
  absolute_expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revocation_reason text CHECK (revocation_reason IS NULL OR length(revocation_reason) <= 256),
  purge_after timestamptz,
  PRIMARY KEY (tenant_id, session_id),
  UNIQUE (tenant_id, session_token_digest),
  FOREIGN KEY (tenant_id, issuer_uri, issuer_revision)
    REFERENCES die_authz.oidc_trust(tenant_id, issuer_uri, revision),
  CHECK (last_seen_at >= created_at),
  CHECK (idle_expires_at > created_at),
  CHECK (absolute_expires_at > created_at),
  CHECK (idle_expires_at <= absolute_expires_at),
  CHECK ((state = 'active' AND revoked_at IS NULL AND purge_after IS NULL)
    OR (state <> 'active' AND revoked_at IS NOT NULL
      AND purge_after > revoked_at
      AND purge_after <= revoked_at + interval '7 days'))
);

CREATE TABLE IF NOT EXISTS die_audit.audit_head (
  tenant_id text NOT NULL,
  audit_shard smallint NOT NULL CHECK (audit_shard >= 0),
  last_sequence bigint NOT NULL DEFAULT 0 CHECK (last_sequence BETWEEN 0 AND 9007199254740991),
  last_event_hash text,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, audit_shard),
  CHECK (last_event_hash IS NULL OR last_event_hash ~ '^sha256:[0-9a-f]{64}$')
);

CREATE TABLE IF NOT EXISTS die_audit.audit_event (
  tenant_id text NOT NULL,
  audit_id uuid NOT NULL,
  audit_shard smallint NOT NULL CHECK (audit_shard >= 0),
  audit_sequence bigint NOT NULL CHECK (audit_sequence BETWEEN 1 AND 9007199254740991),
  occurred_at timestamptz NOT NULL,
  actor_type text NOT NULL,
  actor_id text NOT NULL,
  actor_session_id text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  business_scope_id uuid NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('succeeded','denied','failed')),
  reason_code text NOT NULL,
  request_id text NOT NULL,
  authorization_revision bigint CHECK (authorization_revision IS NULL OR authorization_revision BETWEEN 1 AND 9007199254740991),
  safe_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  previous_hash text,
  hash_format text NOT NULL DEFAULT 'die.audit.pg-jsonb-utc.v1',
  event_hash text NOT NULL,
  PRIMARY KEY (tenant_id, audit_id),
  UNIQUE (tenant_id, audit_shard, audit_sequence),
  FOREIGN KEY (tenant_id, audit_shard)
    REFERENCES die_audit.audit_head(tenant_id, audit_shard),
  FOREIGN KEY (tenant_id, business_scope_id)
    REFERENCES die_authz.business_scope(tenant_id, scope_id),
  CHECK (jsonb_typeof(safe_details) = 'object'),
  CHECK (pg_column_size(safe_details) <= 32768),
  CHECK (previous_hash IS NULL OR previous_hash ~ '^sha256:[0-9a-f]{64}$'),
  CHECK (hash_format = 'die.audit.pg-jsonb-utc.v1'),
  CHECK (event_hash ~ '^sha256:[0-9a-f]{64}$')
);

ALTER TABLE die_outbox.canonical_change
  ADD CONSTRAINT canonical_change_causation_audit_fk
  FOREIGN KEY (tenant_id, causation_audit_event_id)
  REFERENCES die_audit.audit_event(tenant_id, audit_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE die_outbox.canonical_change
  ADD CONSTRAINT canonical_change_causation_evidence_fk
  FOREIGN KEY (tenant_id, causation_evidence_id)
  REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS die_audit.audit_event_evidence (
  tenant_id text NOT NULL,
  audit_id uuid NOT NULL,
  evidence_id uuid NOT NULL,
  PRIMARY KEY (tenant_id, audit_id, evidence_id),
  FOREIGN KEY (tenant_id, audit_id)
    REFERENCES die_audit.audit_event(tenant_id, audit_id),
  FOREIGN KEY (tenant_id, evidence_id)
    REFERENCES die_evidence.evidence_record(tenant_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS die_audit.audit_checkpoint (
  tenant_id text NOT NULL,
  checkpoint_id uuid NOT NULL,
  created_at timestamptz NOT NULL,
  shard_heads jsonb NOT NULL,
  signer_key_id text NOT NULL,
  signature text NOT NULL,
  evidence_object_key text NOT NULL,
  PRIMARY KEY (tenant_id, checkpoint_id),
  CHECK (jsonb_typeof(shard_heads) = 'object'),
  CHECK (pg_column_size(shard_heads) <= 65536)
);

CREATE INDEX IF NOT EXISTS idx_producer_state
  ON die_control.producer(tenant_id, business_scope_id, trust_state, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_expected_population_scope
  ON die_control.expected_population_version(tenant_id, business_scope_id, environment, lifecycle, population_id, revision DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_received
  ON die_evidence.evidence_record(tenant_id, received_at DESC, evidence_id);
CREATE INDEX IF NOT EXISTS idx_evidence_source_object
  ON die_evidence.evidence_record(tenant_id, producer_id, source_profile, source_namespace, source_object_type, source_object_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_correlation
  ON die_evidence.evidence_record USING gin(correlation jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_gap_open
  ON die_evidence.sequence_gap(tenant_id, producer_id, detected_at)
  WHERE state IN ('open','narrowed','declared_loss');
CREATE INDEX IF NOT EXISTS idx_work_due
  ON die_pipeline.work_item(stage, status, available_at, partition_key, priority, work_id)
  WHERE status IN ('pending','retry');
CREATE INDEX IF NOT EXISTS idx_work_lease_expiry
  ON die_pipeline.work_item(stage, lease_expires_at)
  WHERE status = 'leased';
CREATE INDEX IF NOT EXISTS idx_identity_command_status
  ON die_pipeline.identity_command(tenant_id, status, requested_at, command_id);
CREATE INDEX IF NOT EXISTS idx_mutation_preview_expiry
  ON die_pipeline.mutation_preview(tenant_id, status, expires_at, preview_id);
CREATE INDEX IF NOT EXISTS idx_mutation_preview_digest
  ON die_pipeline.mutation_preview(tenant_id, requested_by, preview_digest, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_idempotency_expiry
  ON die_pipeline.api_idempotency(tenant_id, expires_at)
  WHERE state <> 'in_progress';
CREATE INDEX IF NOT EXISTS idx_evidence_access_grant_expiry
  ON die_pipeline.evidence_access_grant(tenant_id, expires_at, access_id)
  WHERE state = 'active';
CREATE INDEX IF NOT EXISTS idx_source_object_lifecycle
  ON die_normalized.source_object(tenant_id, producer_id, source_object_type, source_lifecycle, last_observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_identifier
  ON die_normalized.claim(tenant_id, field_path, normalized_value_json)
  WHERE claim_kind = 'identifier';
CREATE INDEX IF NOT EXISTS idx_claim_source
  ON die_normalized.claim(tenant_id, source_object_pk, system_from DESC);
CREATE INDEX IF NOT EXISTS idx_claim_supersession_successor
  ON die_normalized.claim_supersession(tenant_id, successor_claim_id, prior_claim_id);
CREATE INDEX IF NOT EXISTS idx_candidate_dependency_source
  ON die_normalized.candidate_dependency(tenant_id, source_object_pk, state, candidate_kind, candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluation_subject
  ON die_normalized.candidate_evaluation(tenant_id, candidate_kind, candidate_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resolution_decision_claim_reverse
  ON die_identity.resolution_decision_claim(tenant_id, claim_id, decision_id);
CREATE INDEX IF NOT EXISTS idx_entity_alias_survivor
  ON die_identity.entity_alias(tenant_id, survivor_entity_id, system_to, predecessor_entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_entity_alias_current_predecessor
  ON die_identity.entity_alias(tenant_id, predecessor_entity_id)
  WHERE system_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_conflict_candidate_entity
  ON die_identity.conflict_candidate(tenant_id, candidate_entity_id, conflict_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_stream
  ON die_normalized.reconciliation_candidate(
    tenant_id, run_id, occurred_at, candidate_id
  );
CREATE INDEX IF NOT EXISTS idx_reconciliation_member_source
  ON die_normalized.reconciliation_member(
    tenant_id, source_object_type, source_namespace, source_object_id, candidate_id
  );
CREATE INDEX IF NOT EXISTS idx_conflict_open
  ON die_identity.conflict(tenant_id, detected_at DESC)
  WHERE state = 'open';
CREATE INDEX IF NOT EXISTS idx_entity_list
  ON die_canonical.entity(tenant_id, entity_type, lifecycle, last_observed_at DESC, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_version_current
  ON die_canonical.entity_version(tenant_id, entity_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_entity_version_claim_reverse
  ON die_canonical.entity_version_claim(tenant_id, claim_id, entity_id, entity_version);
CREATE INDEX IF NOT EXISTS idx_relationship_subject
  ON die_canonical.relationship(tenant_id, subject_entity_id, predicate, scope_kind, scope_key, lifecycle, object_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationship_object
  ON die_canonical.relationship(tenant_id, object_entity_id, predicate, scope_kind, scope_key, lifecycle, subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationship_evidence_reverse
  ON die_canonical.relationship_version_evidence(tenant_id, evidence_id, relationship_id, relationship_version);
CREATE INDEX IF NOT EXISTS idx_activity_actor_time
  ON die_canonical.activity_version(tenant_id, business_scope_id, actor_entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_binding_activity
  ON die_canonical.activity_source_binding(tenant_id, activity_id, system_to, activity_binding_id);
CREATE INDEX IF NOT EXISTS idx_activity_resource_reverse
  ON die_canonical.activity_version_resource(tenant_id, resource_entity_id, occurred_at DESC, activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_evidence_reverse
  ON die_canonical.activity_version_evidence(tenant_id, evidence_id, occurred_at DESC, activity_id, activity_version);
CREATE INDEX IF NOT EXISTS idx_activity_candidate_reverse
  ON die_canonical.activity_version_candidate(tenant_id, candidate_id, occurred_at DESC, activity_id, activity_version);
CREATE INDEX IF NOT EXISTS idx_activity_binding_evidence_reverse
  ON die_canonical.activity_source_binding_evidence(tenant_id, evidence_id, activity_binding_id);
CREATE INDEX IF NOT EXISTS idx_coverage_scope
  ON die_canonical.coverage_interval(tenant_id, business_scope_id, state, valid_from DESC, coverage_id);
CREATE INDEX IF NOT EXISTS idx_coverage_evidence_reverse
  ON die_canonical.coverage_interval_evidence(tenant_id, evidence_id, coverage_id, coverage_revision);
CREATE INDEX IF NOT EXISTS idx_coverage_candidate_reverse
  ON die_canonical.coverage_interval_candidate(tenant_id, candidate_id, coverage_id, coverage_revision);
CREATE INDEX IF NOT EXISTS idx_reconciliation_evidence_reverse
  ON die_canonical.reconciliation_evaluation_evidence(tenant_id, evidence_id, evaluation_id);
CREATE INDEX IF NOT EXISTS idx_outbox_partition
  ON die_outbox.canonical_change(tenant_id, partition_key, outbox_id);
CREATE INDEX IF NOT EXISTS idx_read_entity_list
  ON die_read.entity_current(tenant_id, projection_generation, business_scope_id, entity_type, lifecycle, last_observed_at DESC, entity_id);
CREATE INDEX IF NOT EXISTS idx_read_entity_name
  ON die_read.entity_current(tenant_id, projection_generation, lower(display_name), entity_id);
CREATE INDEX IF NOT EXISTS idx_read_agent_deployment_list
  ON die_read.agent_deployment_current(
    tenant_id, projection_generation, business_scope_id, deployment_locality,
    lifecycle, last_observed_at DESC, agent_deployment_id
  );
CREATE INDEX IF NOT EXISTS idx_read_agent_deployment_device
  ON die_read.agent_deployment_current(
    tenant_id, projection_generation, device_id, execution_identity_id, agent_definition_id
  );
CREATE INDEX IF NOT EXISTS idx_read_application_list
  ON die_read.application_current(
    tenant_id, projection_generation, business_scope_id, technology_class,
    agentic_capability, lifecycle, last_observed_at DESC, primary_entity_id
  );
CREATE INDEX IF NOT EXISTS idx_read_model_list
  ON die_read.model_current(
    tenant_id, projection_generation, business_scope_id, asset_level,
    lifecycle, last_observed_at DESC, model_entity_id
  );
CREATE INDEX IF NOT EXISTS idx_read_mcp_server_list
  ON die_read.mcp_server_current(
    tenant_id, projection_generation, business_scope_id, locality,
    lifecycle, last_observed_at DESC, server_deployment_entity_id
  );
CREATE INDEX IF NOT EXISTS idx_read_device_list
  ON die_read.device_current(
    tenant_id, projection_generation, business_scope_id, os_platform,
    lifecycle, last_observed_at DESC, device_entity_id
  );
CREATE INDEX IF NOT EXISTS idx_read_identity_list
  ON die_read.identity_current(
    tenant_id, projection_generation, business_scope_id, identity_kind,
    identity_assurance, lifecycle, last_observed_at DESC, identity_entity_id
  );
CREATE INDEX IF NOT EXISTS idx_read_producer_scope
  ON die_read.producer_current(tenant_id, projection_generation, business_scope_id, source_profile, producer_id);
CREATE INDEX IF NOT EXISTS idx_read_relationship_subject
  ON die_read.relationship_current(tenant_id, projection_generation, subject_entity_id, predicate, scope_kind, scope_key, object_entity_id);
CREATE INDEX IF NOT EXISTS idx_read_relationship_object
  ON die_read.relationship_current(tenant_id, projection_generation, object_entity_id, predicate, scope_kind, scope_key, subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_role_binding_subject
  ON die_authz.role_binding(tenant_id, subject_type, subject_id, valid_to, scope_id);
CREATE INDEX IF NOT EXISTS idx_relation_tuple_subject
  ON die_authz.relation_tuple(tenant_id, subject_type, subject_id, relation, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_relation_tuple_resource
  ON die_authz.relation_tuple(tenant_id, resource_type, resource_id, relation, subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_audit_time
  ON die_audit.audit_event(tenant_id, business_scope_id, occurred_at DESC, audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_chain
  ON die_audit.audit_event(tenant_id, audit_shard, audit_sequence);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_reverse
  ON die_audit.audit_event_evidence(tenant_id, evidence_id, audit_id);

CREATE OR REPLACE FUNCTION die_evidence.reject_immutable_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'immutable DIE ledger rows cannot be updated or deleted';
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_producer_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  administrative_old jsonb;
  administrative_new jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'producer enrollment records cannot be deleted';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN
      RAISE EXCEPTION 'producer revision must start at one';
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM die_control.source_profile profile
      WHERE profile.profile_id = NEW.source_profile
        AND profile.lifecycle = 'active'
    ) THEN
      RAISE EXCEPTION 'new producer requires an active registered source profile';
    END IF;
  ELSE
    IF (OLD.last_seen_at IS NOT NULL AND NEW.last_seen_at IS NULL)
      OR (NEW.last_seen_at IS NOT NULL
        AND OLD.last_seen_at IS NOT NULL
        AND NEW.last_seen_at < OLD.last_seen_at) THEN
      RAISE EXCEPTION 'producer last_seen_at cannot regress';
    END IF;

    administrative_old := to_jsonb(OLD) - 'last_seen_at';
    administrative_new := to_jsonb(NEW) - 'last_seen_at';
    IF administrative_old IS NOT DISTINCT FROM administrative_new THEN
      RETURN NEW;
    END IF;

    IF (NEW.tenant_id, NEW.producer_id, NEW.installation_id, NEW.source_profile, NEW.first_enrolled_at)
      IS DISTINCT FROM
       (OLD.tenant_id, OLD.producer_id, OLD.installation_id, OLD.source_profile, OLD.first_enrolled_at) THEN
      RAISE EXCEPTION 'producer source identity and enrollment time are immutable';
    END IF;
    IF NEW.revision <> OLD.revision + 1 THEN
      RAISE EXCEPTION 'producer administrative revision must advance exactly one';
    END IF;
    IF NOT (
      NEW.trust_state = OLD.trust_state
      OR (OLD.trust_state = 'pending' AND NEW.trust_state IN ('trusted','degraded','rejected','revoked'))
      OR (OLD.trust_state = 'trusted' AND NEW.trust_state IN ('degraded','revoked'))
      OR (OLD.trust_state = 'degraded' AND NEW.trust_state IN ('trusted','revoked'))
    ) THEN
      RAISE EXCEPTION 'invalid producer trust transition % to %', OLD.trust_state, NEW.trust_state;
    END IF;
  END IF;

  IF NEW.trust_state IN ('trusted','degraded') AND NOT EXISTS (
    SELECT 1
    FROM die_control.certification certification
    JOIN die_control.source_profile profile
      ON profile.profile_id = NEW.source_profile
     AND profile.lifecycle IN ('active','deprecated')
    JOIN die_control.source_profile_version profile_version
      ON profile_version.profile_id = profile.profile_id
     AND profile_version.profile_version =
       certification.profile_versions ->> NEW.source_profile
     AND profile_version.admission_state IN ('accepted','deprecated')
    WHERE certification.tenant_id = NEW.tenant_id
      AND certification.producer_id = NEW.producer_id
      AND certification.certification_id = NEW.active_certification_id
      AND certification.artifact_digest = NEW.artifact_digest
      AND certification.result = 'passed'
      AND (certification.expires_at IS NULL OR certification.expires_at > transaction_timestamp())
  ) THEN
    RAISE EXCEPTION 'trusted or degraded producer requires a current passed certification for its artifact';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_capability_close()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'producer capability history cannot be deleted';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM die_control.producer producer
      JOIN die_control.source_profile profile
        ON profile.profile_id = producer.source_profile
       AND profile.lifecycle IN ('active','deprecated')
      JOIN die_control.source_profile_version profile_version
        ON profile_version.profile_id = producer.source_profile
       AND profile_version.profile_version = NEW.profile_version
       AND profile_version.admission_state IN ('accepted','deprecated')
      WHERE producer.tenant_id = NEW.tenant_id
        AND producer.producer_id = NEW.producer_id
    ) THEN
      RAISE EXCEPTION 'producer capability requires a registered admissible profile version';
    END IF;
    IF NEW.certified AND NOT EXISTS (
      SELECT 1
      FROM die_control.producer producer
      JOIN die_control.certification certification
        ON certification.tenant_id = producer.tenant_id
       AND certification.producer_id = producer.producer_id
       AND certification.certification_id = producer.active_certification_id
      WHERE producer.tenant_id = NEW.tenant_id
        AND producer.producer_id = NEW.producer_id
        AND producer.trust_state IN ('trusted','degraded')
        AND certification.result = 'passed'
        AND certification.artifact_digest = producer.artifact_digest
        AND certification.profile_versions ->> producer.source_profile = NEW.profile_version
        AND (certification.expires_at IS NULL OR certification.expires_at > NEW.effective_from)
    ) THEN
      RAISE EXCEPTION 'certified producer capability requires the active artifact certification and profile version';
    END IF;
    RETURN NEW;
  END IF;
  IF (to_jsonb(OLD) - 'effective_to') IS DISTINCT FROM (to_jsonb(NEW) - 'effective_to') THEN
    RAISE EXCEPTION 'producer capability facts are immutable; only interval closure is allowed';
  END IF;
  IF OLD.effective_to IS NOT NULL OR NEW.effective_to IS NULL
    OR NEW.effective_to <= OLD.effective_from THEN
    RAISE EXCEPTION 'producer capability interval may be closed exactly once with a nonempty range';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_tenant_cell_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'tenant cell assignments cannot be deleted';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN
      RAISE EXCEPTION 'tenant cell assignment revision must start at one';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.revision <> OLD.revision + 1
    OR NEW.assigned_at < OLD.assigned_at THEN
    RAISE EXCEPTION 'tenant cell assignment must preserve tenant identity and advance one revision';
  END IF;
  IF NEW.cell_id IS DISTINCT FROM OLD.cell_id AND EXISTS (
    SELECT 1
    FROM die_control.tenant_cell_principal principal
    WHERE principal.tenant_id = OLD.tenant_id
      AND principal.cell_id = OLD.cell_id
      AND principal.state = 'active'
  ) THEN
    RAISE EXCEPTION 'tenant cell move requires every principal in the old cell to be revoked first';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_tenant_cell_principal_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  effective_die_role_count integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'tenant cell principals cannot be deleted';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 OR NEW.state <> 'active' OR NEW.revoked_at IS NOT NULL THEN
      RAISE EXCEPTION 'tenant cell principal must start active at revision one';
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM die_control.tenant_cell_assignment assignment
      WHERE assignment.tenant_id = NEW.tenant_id
        AND assignment.cell_id = NEW.cell_id
        AND assignment.state = 'active'
    ) THEN
      RAISE EXCEPTION 'new tenant cell principal must target the current active cell assignment';
    END IF;
    SELECT count(*)
      INTO effective_die_role_count
      FROM unnest(ARRAY[
        'die_ingest','die_normalizer','die_truth','die_projector',
        'die_api','die_bff','die_maintenance','die_control_admin','die_authz_admin'
      ]) AS runtime_role(role_name)
      WHERE pg_has_role(NEW.database_principal, runtime_role.role_name, 'member');
    IF effective_die_role_count <> 1
      OR NOT pg_has_role(NEW.database_principal, NEW.workload_role, 'member')
      OR NOT EXISTS (
        SELECT 1
        FROM pg_roles login
        WHERE login.rolname = NEW.database_principal
          AND login.rolcanlogin
          AND NOT login.rolbypassrls
      ) THEN
      RAISE EXCEPTION 'database principal must be a NOBYPASSRLS login with exactly its declared DIE workload role';
    END IF;
    RETURN NEW;
  END IF;
  IF (NEW.tenant_id, NEW.principal_binding_id, NEW.cell_id,
      NEW.database_principal, NEW.workload_role, NEW.assigned_at)
    IS DISTINCT FROM
     (OLD.tenant_id, OLD.principal_binding_id, OLD.cell_id,
      OLD.database_principal, OLD.workload_role, OLD.assigned_at)
    OR NEW.revision <> OLD.revision + 1
    OR OLD.state <> 'active'
    OR NEW.state <> 'revoked'
    OR NEW.revoked_at IS NULL THEN
    RAISE EXCEPTION 'tenant cell principal may only advance once from active to revoked';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_expected_population_head()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'expected population heads cannot be deleted';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.current_revision <> 1 OR NEW.updated_at < NEW.created_at THEN
      RAISE EXCEPTION 'expected population must start at revision one with a valid clock';
    END IF;
    RETURN NEW;
  END IF;
  IF (NEW.tenant_id, NEW.population_id, NEW.producer_id, NEW.capability,
      NEW.population_type, NEW.source_namespace, NEW.source_population_id, NEW.created_at)
    IS DISTINCT FROM
     (OLD.tenant_id, OLD.population_id, OLD.producer_id, OLD.capability,
      OLD.population_type, OLD.source_namespace, OLD.source_population_id, OLD.created_at) THEN
    RAISE EXCEPTION 'expected population identity and authority key are immutable';
  END IF;
  IF NEW.current_revision <> OLD.current_revision + 1
    OR NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'expected population head must advance exactly one revision without clock regression';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.require_expected_population_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_control.expected_population_version version
    WHERE version.tenant_id = NEW.tenant_id
      AND version.population_id = NEW.population_id
      AND version.revision = NEW.current_revision
      AND version.lifecycle = NEW.lifecycle
  ) THEN
    RAISE EXCEPTION 'expected population head lacks a matching lifecycle version';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_expected_population_version_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  head_revision bigint;
BEGIN
  SELECT current_revision
    INTO STRICT head_revision
    FROM die_control.expected_population
    WHERE tenant_id = NEW.tenant_id
      AND population_id = NEW.population_id
    FOR UPDATE;
  IF NEW.revision NOT IN (head_revision, head_revision + 1) THEN
    RAISE EXCEPTION 'expected population version must equal the current or exact next head revision';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.allow_only_expected_population_version_close()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_payload jsonb;
  new_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'expected population versions cannot be deleted';
  END IF;
  old_payload := to_jsonb(OLD) - 'system_to' - 'valid_to';
  new_payload := to_jsonb(NEW) - 'system_to' - 'valid_to';
  IF old_payload IS DISTINCT FROM new_payload THEN
    RAISE EXCEPTION 'expected population version payload is immutable; only interval closure is allowed';
  END IF;
  IF OLD.system_to IS NOT NULL AND NEW.system_to IS DISTINCT FROM OLD.system_to THEN
    RAISE EXCEPTION 'closed expected-population system interval cannot be changed';
  END IF;
  IF OLD.valid_to IS NOT NULL AND NEW.valid_to IS DISTINCT FROM OLD.valid_to THEN
    RAISE EXCEPTION 'closed expected-population valid interval cannot be changed';
  END IF;
  IF NEW.system_to IS NOT NULL AND NEW.system_to <= OLD.system_from THEN
    RAISE EXCEPTION 'expected-population system_to precedes system_from';
  END IF;
  IF NEW.valid_to IS NOT NULL AND NEW.valid_to <= OLD.valid_from THEN
    RAISE EXCEPTION 'expected-population valid_to precedes valid_from';
  END IF;
  IF NEW.valid_to IS DISTINCT FROM OLD.valid_to AND NEW.system_to IS NULL THEN
    RAISE EXCEPTION 'expected-population valid-time closure requires simultaneous system-time closure';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.require_expected_population_head()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_control.expected_population population
    JOIN die_control.expected_population_version committed_version
      ON committed_version.tenant_id = population.tenant_id
     AND committed_version.population_id = population.population_id
     AND committed_version.revision = NEW.revision
    WHERE population.tenant_id = NEW.tenant_id
      AND population.population_id = NEW.population_id
      AND population.current_revision >= NEW.revision
      AND committed_version.lifecycle = NEW.lifecycle
      AND (
        (
          population.current_revision = NEW.revision
          AND population.lifecycle = committed_version.lifecycle
          AND committed_version.system_to IS NULL
        )
        OR
        (
          population.current_revision > NEW.revision
          AND committed_version.system_to IS NOT NULL
          AND committed_version.valid_to IS NOT NULL
        )
      )
  ) THEN
    RAISE EXCEPTION 'expected population version is neither the current head nor committed closed history';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.require_expected_population_version_successor()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_control.expected_population population
    JOIN die_control.expected_population_version successor
      ON successor.tenant_id = population.tenant_id
     AND successor.population_id = population.population_id
     AND successor.revision = population.current_revision
    WHERE population.tenant_id = NEW.tenant_id
      AND population.population_id = NEW.population_id
      AND population.current_revision = OLD.revision + 1
      AND successor.system_from >= NEW.system_to
  ) THEN
    RAISE EXCEPTION 'closed expected-population version requires the exact next committed head';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_normalized.enforce_cross_sensor_assertion_use()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  issuer_profile text;
  recipient_profile text;
  run_evidence_id uuid;
  run_producer_id uuid;
BEGIN
  SELECT issuer.source_profile
    INTO STRICT issuer_profile
    FROM die_control.producer issuer
    WHERE issuer.tenant_id = NEW.tenant_id
      AND issuer.producer_id = NEW.issuer_producer_id
      AND issuer.trust_state IN ('trusted','degraded')
      AND EXISTS (
        SELECT 1
        FROM die_control.certification certification
        WHERE certification.tenant_id = NEW.tenant_id
          AND certification.producer_id = NEW.issuer_producer_id
          AND certification.certification_id = issuer.active_certification_id
          AND certification.artifact_digest = issuer.artifact_digest
          AND certification.result = 'passed'
          AND (certification.expires_at IS NULL OR certification.expires_at > NEW.used_at)
      )
    FOR SHARE;
  IF issuer_profile <> 'endpoint' THEN
    RAISE EXCEPTION 'cross-sensor attribution issuer must be an active certified Endpoint producer';
  END IF;

  SELECT source_profile
    INTO STRICT recipient_profile
    FROM die_control.producer
    WHERE tenant_id = NEW.tenant_id
      AND producer_id = NEW.recipient_producer_id
    FOR SHARE;
  IF NOT (
    (NEW.assertion_kind = 'browser_local_binding' AND recipient_profile = 'browser')
    OR (NEW.assertion_kind = 'llm_gateway_attribution' AND recipient_profile = 'llm_gateway')
    OR (NEW.assertion_kind = 'mcp_gateway_attribution' AND recipient_profile = 'mcp_gateway')
  ) THEN
    RAISE EXCEPTION 'cross-sensor assertion kind does not match the recipient source profile';
  END IF;

  SELECT evidence_id, producer_id
    INTO STRICT run_evidence_id, run_producer_id
    FROM die_normalized.normalization_run
    WHERE tenant_id = NEW.tenant_id
      AND normalization_run_id = NEW.normalization_run_id;
  IF run_evidence_id <> NEW.evidence_id OR run_producer_id <> NEW.recipient_producer_id THEN
    RAISE EXCEPTION 'cross-sensor assertion use must belong to its recipient evidence normalization run';
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'cross-sensor assertion references an unavailable or untrusted producer/run';
END;
$$;

CREATE OR REPLACE FUNCTION die_evidence.enforce_erasure_plan_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actual_target_count bigint;
  actual_object_target_count bigint;
  actual_manifest_digest text;
  latest_disposition_revision bigint;
  latest_disposition_state text;
  latest_legal_hold boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'building'
      OR NEW.sealed_at IS NOT NULL
      OR NEW.execution_id IS NOT NULL
      OR NEW.execution_started_at IS NOT NULL THEN
      RAISE EXCEPTION 'evidence erasure plan must start building and unsealed';
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM die_evidence.evidence_disposition disposition
      WHERE disposition.tenant_id = NEW.tenant_id
        AND disposition.evidence_id = NEW.evidence_id
        AND disposition.revision = NEW.source_disposition_revision
        AND disposition.state = 'deletion_pending'
        AND NOT disposition.legal_hold
    ) THEN
      RAISE EXCEPTION 'evidence erasure plan requires its exact unheld deletion-pending revision';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'evidence erasure plans cannot be deleted';
  END IF;

  IF OLD.state = 'building' AND NEW.state = 'sealed' THEN
    IF (to_jsonb(OLD) - ARRAY['state','sealed_at'])
      IS DISTINCT FROM
       (to_jsonb(NEW) - ARRAY['state','sealed_at'])
      OR NEW.sealed_at IS NULL THEN
      RAISE EXCEPTION 'erasure plan seal may change only state and sealed_at';
    END IF;

    SELECT count(*),
           count(*) FILTER (WHERE target_kind = 'object_bytes'),
           'sha256:' || encode(
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
           )
      INTO actual_target_count, actual_object_target_count, actual_manifest_digest
      FROM die_evidence.erasure_target
      WHERE tenant_id = NEW.tenant_id
        AND erasure_plan_id = NEW.erasure_plan_id;
    IF actual_target_count <> NEW.target_count
      OR actual_object_target_count <> 1
      OR actual_manifest_digest IS DISTINCT FROM NEW.target_manifest_digest THEN
      RAISE EXCEPTION 'evidence erasure target manifest is incomplete or has a digest mismatch';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.state = 'sealed' AND NEW.state = 'executing' THEN
    IF (to_jsonb(OLD) - ARRAY['state','execution_id','execution_started_at'])
      IS DISTINCT FROM
       (to_jsonb(NEW) - ARRAY['state','execution_id','execution_started_at'])
      OR NEW.execution_id IS NULL
      OR NEW.execution_started_at IS NULL THEN
      RAISE EXCEPTION 'erasure execution commit may change only state, execution ID and start time';
    END IF;
    PERFORM pg_advisory_xact_lock(
      hashtextextended(
        NEW.tenant_id || E'\x1f' || NEW.evidence_id::text,
        0
      )
    );
    SELECT disposition.revision, disposition.state, disposition.legal_hold
      INTO STRICT latest_disposition_revision, latest_disposition_state,
        latest_legal_hold
      FROM die_evidence.evidence_disposition disposition
      WHERE disposition.tenant_id = NEW.tenant_id
        AND disposition.evidence_id = NEW.evidence_id
      ORDER BY disposition.revision DESC
      LIMIT 1;
    IF latest_disposition_revision <> NEW.source_disposition_revision
      OR latest_disposition_state <> 'deletion_pending'
      OR latest_legal_hold THEN
      RAISE EXCEPTION 'erasure execution requires the exact latest unheld deletion-pending revision';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'invalid erasure plan transition % to %', OLD.state, NEW.state;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'erasure execution requires a current evidence disposition';
END;
$$;

CREATE OR REPLACE FUNCTION die_evidence.enforce_erasure_target_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'evidence erasure targets are immutable';
  END IF;
  PERFORM 1
  FROM die_evidence.erasure_plan plan
  WHERE plan.tenant_id = NEW.tenant_id
    AND plan.erasure_plan_id = NEW.erasure_plan_id
    AND plan.state = 'building'
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'evidence erasure targets can be registered only while the plan is building';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_evidence.enforce_erasure_receipt_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  plan_created_at timestamptz;
  plan_evidence_id uuid;
  plan_source_revision bigint;
  selected_target_kind text;
  latest_disposition_revision bigint;
  latest_disposition_state text;
  latest_legal_hold boolean;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'evidence erasure receipts are immutable';
  END IF;
  SELECT plan.evidence_id
    INTO STRICT plan_evidence_id
    FROM die_evidence.erasure_plan plan
    WHERE plan.tenant_id = NEW.tenant_id
      AND plan.erasure_plan_id = NEW.erasure_plan_id;
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      NEW.tenant_id || E'\x1f' || plan_evidence_id::text,
      0
    )
  );
  SELECT plan.created_at, plan.evidence_id, plan.source_disposition_revision,
         target.target_kind
    INTO STRICT plan_created_at, plan_evidence_id, plan_source_revision,
      selected_target_kind
    FROM die_evidence.erasure_plan plan
    JOIN die_evidence.erasure_target target
      ON target.tenant_id = plan.tenant_id
     AND target.erasure_plan_id = plan.erasure_plan_id
    WHERE plan.tenant_id = NEW.tenant_id
      AND plan.erasure_plan_id = NEW.erasure_plan_id
      AND plan.state = 'executing'
      AND target.target_id = NEW.target_id
    FOR SHARE OF plan;
  IF NEW.completed_at < plan_created_at THEN
    RAISE EXCEPTION 'evidence erasure receipt predates its plan';
  END IF;
  SELECT disposition.revision, disposition.state, disposition.legal_hold
    INTO STRICT latest_disposition_revision, latest_disposition_state,
      latest_legal_hold
    FROM die_evidence.evidence_disposition disposition
    WHERE disposition.tenant_id = NEW.tenant_id
      AND disposition.evidence_id = plan_evidence_id
    ORDER BY disposition.revision DESC
    LIMIT 1;
  IF latest_legal_hold
    OR (
      selected_target_kind = 'object_bytes'
      AND (
        latest_disposition_revision <> plan_source_revision
        OR latest_disposition_state <> 'deletion_pending'
      )
    )
    OR (
      selected_target_kind <> 'object_bytes'
      AND (
        latest_disposition_revision <> plan_source_revision + 1
        OR latest_disposition_state <> 'object_deleted'
      )
    ) THEN
    RAISE EXCEPTION 'evidence erasure receipt is outside its exact unheld deletion phase';
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'evidence erasure receipt requires an exact target in an executing plan';
END;
$$;

CREATE OR REPLACE FUNCTION die_evidence.require_erasure_completion(
  requested_tenant_id text,
  requested_evidence_id uuid,
  requested_source_revision bigint,
  require_all_targets boolean
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  selected_plan_id uuid;
  missing_target_count bigint;
BEGIN
  SELECT erasure_plan_id
    INTO STRICT selected_plan_id
    FROM die_evidence.erasure_plan
    WHERE tenant_id = requested_tenant_id
      AND evidence_id = requested_evidence_id
      AND source_disposition_revision = requested_source_revision
      AND state = 'executing'
    FOR SHARE;

  SELECT count(*)
    INTO missing_target_count
    FROM die_evidence.erasure_target target
    WHERE target.tenant_id = requested_tenant_id
      AND target.erasure_plan_id = selected_plan_id
      AND (require_all_targets OR target.target_kind = 'object_bytes')
      AND NOT EXISTS (
        SELECT 1
        FROM die_evidence.erasure_receipt receipt
        WHERE receipt.tenant_id = target.tenant_id
          AND receipt.erasure_plan_id = target.erasure_plan_id
          AND receipt.target_id = target.target_id
      );
  IF missing_target_count <> 0 THEN
    RAISE EXCEPTION 'evidence erasure plan has % unreceipted required targets', missing_target_count;
  END IF;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'executing evidence erasure plan is missing for the deletion-pending revision';
END;
$$;

CREATE OR REPLACE FUNCTION die_evidence.enforce_disposition_append()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prior die_evidence.evidence_disposition%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      NEW.tenant_id || E'\x1f' || NEW.evidence_id::text,
      0
    )
  );
  SELECT *
    INTO prior
    FROM die_evidence.evidence_disposition
    WHERE tenant_id = NEW.tenant_id
      AND evidence_id = NEW.evidence_id
    ORDER BY revision DESC
    LIMIT 1;

  IF NOT FOUND THEN
    IF NEW.revision <> 1
      OR NEW.state NOT IN ('active','held')
      OR (NEW.state = 'held') IS DISTINCT FROM NEW.legal_hold THEN
      RAISE EXCEPTION 'initial evidence disposition must be revision one active or held';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.revision <> prior.revision + 1
    OR NEW.changed_at < prior.changed_at THEN
    RAISE EXCEPTION 'evidence disposition must advance one revision with monotonic time';
  END IF;
  IF prior.state = 'deleted' THEN
    RAISE EXCEPTION 'deleted evidence disposition is terminal';
  END IF;
  IF prior.legal_hold THEN
    IF NOT (
      (NEW.state = 'held' AND NEW.legal_hold)
      OR (NEW.state = 'active' AND NOT NEW.legal_hold
        AND NEW.reason_code = 'legal_hold_released')
    ) THEN
      RAISE EXCEPTION 'legal hold must remain held until an explicit release';
    END IF;
  ELSIF NOT (
    (prior.state = 'active' AND NEW.state IN ('active','held','tombstoned','metadata_only'))
    OR (prior.state = 'held' AND NEW.state IN ('held','active'))
    OR (prior.state IN ('tombstoned','metadata_only')
      AND NEW.state IN ('held','deletion_pending'))
    OR (prior.state = 'deletion_pending'
      AND NEW.state IN ('held','tombstoned','object_deleted'))
    OR (prior.state = 'object_deleted' AND NEW.state = 'deleted')
  ) THEN
    RAISE EXCEPTION 'invalid evidence disposition transition % to %', prior.state, NEW.state;
  END IF;
  IF prior.state = 'deletion_pending'
    AND NEW.state IN ('held','tombstoned')
    AND EXISTS (
      SELECT 1
      FROM die_evidence.erasure_plan plan
      WHERE plan.tenant_id = NEW.tenant_id
        AND plan.evidence_id = NEW.evidence_id
        AND plan.source_disposition_revision = prior.revision
        AND plan.state = 'executing'
    ) THEN
    RAISE EXCEPTION 'legal hold or deletion cancellation is too late after erasure execution commit';
  END IF;
  IF (NEW.state = 'held') IS DISTINCT FROM NEW.legal_hold THEN
    RAISE EXCEPTION 'held state and legal_hold must agree';
  END IF;
  IF NEW.state IN ('deletion_pending','object_deleted','deleted') AND NEW.legal_hold THEN
    RAISE EXCEPTION 'held evidence cannot enter a deletion state';
  END IF;
  IF NEW.state = 'object_deleted' THEN
    PERFORM die_evidence.require_erasure_completion(
      NEW.tenant_id, NEW.evidence_id, prior.revision, false
    );
  ELSIF NEW.state = 'deleted' THEN
    PERFORM die_evidence.require_erasure_completion(
      NEW.tenant_id, NEW.evidence_id, prior.revision - 1, true
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.allow_only_version_close()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_payload jsonb;
  new_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'canonical version rows cannot be deleted';
  END IF;

  old_payload := to_jsonb(OLD) - 'system_to' - 'valid_to';
  new_payload := to_jsonb(NEW) - 'system_to' - 'valid_to';
  IF old_payload IS DISTINCT FROM new_payload THEN
    RAISE EXCEPTION 'canonical version payload is immutable; only interval closure is allowed';
  END IF;
  IF OLD.system_to IS NOT NULL AND NEW.system_to IS DISTINCT FROM OLD.system_to THEN
    RAISE EXCEPTION 'closed system-time interval cannot be changed';
  END IF;
  IF OLD.valid_to IS NOT NULL AND NEW.valid_to IS DISTINCT FROM OLD.valid_to THEN
    RAISE EXCEPTION 'closed valid-time interval cannot be changed';
  END IF;
  IF NEW.system_to IS NOT NULL AND NEW.system_to <= OLD.system_from THEN
    RAISE EXCEPTION 'system_to precedes system_from';
  END IF;
  IF NEW.valid_to IS NOT NULL AND NEW.valid_to <= OLD.valid_from THEN
    RAISE EXCEPTION 'valid_to precedes valid_from';
  END IF;
  IF NEW.valid_to IS DISTINCT FROM OLD.valid_to AND NEW.system_to IS NULL THEN
    RAISE EXCEPTION 'valid-time closure requires simultaneous system-time closure';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.allow_only_activity_version_close()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_payload jsonb;
  new_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'canonical activity versions cannot be deleted';
  END IF;
  old_payload := to_jsonb(OLD) - 'system_to';
  new_payload := to_jsonb(NEW) - 'system_to';
  IF old_payload IS DISTINCT FROM new_payload THEN
    RAISE EXCEPTION 'canonical activity payload is immutable; only system-time closure is allowed';
  END IF;
  IF OLD.system_to IS NOT NULL AND NEW.system_to IS DISTINCT FROM OLD.system_to THEN
    RAISE EXCEPTION 'closed activity system-time interval cannot be changed';
  END IF;
  IF NEW.system_to IS NOT NULL AND NEW.system_to <= OLD.system_from THEN
    RAISE EXCEPTION 'system_to precedes system_from';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.protect_tenant_root()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.scope_type = 'tenant' THEN
    RAISE EXCEPTION 'tenant root scope cannot be deleted';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.scope_type = 'tenant' AND (
    NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.scope_id IS DISTINCT FROM OLD.scope_id
    OR NEW.scope_type IS DISTINCT FROM OLD.scope_type
    OR NEW.parent_scope_id IS NOT NULL
    OR NEW.lifecycle <> 'active'
  ) THEN
    RAISE EXCEPTION 'tenant root identity, parent and lifecycle are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.prevent_scope_cycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_scope_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.parent_scope_id = NEW.scope_id OR EXISTS (
    WITH RECURSIVE ancestors(scope_id, parent_scope_id) AS (
      SELECT scope_id, parent_scope_id
      FROM die_authz.business_scope
      WHERE tenant_id = NEW.tenant_id AND scope_id = NEW.parent_scope_id
      UNION
      SELECT parent.scope_id, parent.parent_scope_id
      FROM die_authz.business_scope parent
      JOIN ancestors child ON parent.scope_id = child.parent_scope_id
      WHERE parent.tenant_id = NEW.tenant_id
    )
    SELECT 1 FROM ancestors WHERE scope_id = NEW.scope_id
  ) THEN
    RAISE EXCEPTION 'business scope cycle is forbidden';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_business_scope_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_revision bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'business scopes cannot be deleted';
  END IF;
  SELECT revision
    INTO STRICT current_revision
    FROM die_authz.authorization_revision
    WHERE tenant_id = NEW.tenant_id
    FOR SHARE;
  IF NEW.revision <> current_revision THEN
    RAISE EXCEPTION 'business scope revision must equal the current authorization revision';
  END IF;
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  IF (OLD.tenant_id, OLD.scope_id, OLD.scope_type)
    IS DISTINCT FROM
     (NEW.tenant_id, NEW.scope_id, NEW.scope_type) THEN
    RAISE EXCEPTION 'business scope identity is immutable';
  END IF;
  IF NEW.revision <= OLD.revision THEN
    RAISE EXCEPTION 'business scope authorization revision must advance';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_binding_close()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_revision bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'authorization bindings and tuples cannot be deleted';
  END IF;
  SELECT revision
    INTO STRICT current_revision
    FROM die_authz.authorization_revision
    WHERE tenant_id = NEW.tenant_id
    FOR SHARE;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> current_revision
      OR NEW.valid_to IS NOT NULL
      OR NEW.closed_revision IS NOT NULL THEN
      RAISE EXCEPTION 'authorization grant must be open and stamped with the current authorization revision';
    END IF;
    RETURN NEW;
  END IF;
  IF (to_jsonb(OLD) - ARRAY['valid_to','closed_revision'])
    IS DISTINCT FROM
     (to_jsonb(NEW) - ARRAY['valid_to','closed_revision']) THEN
    RAISE EXCEPTION 'authorization binding identity and grant are immutable';
  END IF;
  IF OLD.valid_to IS NOT NULL OR OLD.closed_revision IS NOT NULL
    OR NEW.valid_to IS NULL OR NEW.closed_revision IS NULL THEN
    RAISE EXCEPTION 'authorization binding may be closed exactly once';
  END IF;
  IF NEW.valid_to <= OLD.valid_from
    OR NEW.closed_revision <= OLD.revision
    OR NEW.closed_revision <> current_revision THEN
    RAISE EXCEPTION 'authorization close time/revision precedes its grant';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_scope_closure_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_revision bigint;
BEGIN
  SELECT revision
    INTO STRICT current_revision
    FROM die_authz.authorization_revision
    WHERE tenant_id = NEW.tenant_id
    FOR SHARE;
  IF NEW.revision <> current_revision THEN
    RAISE EXCEPTION 'scope closure row must be stamped with the current authorization revision';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_authorization_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN
      RAISE EXCEPTION 'authorization revision must start at one';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'authorization revision cannot be deleted';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.revision <> OLD.revision + 1
    OR NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'authorization revision must advance exactly one without clock regression';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_identity.prevent_alias_cycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.system_to IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    WITH RECURSIVE successors(entity_id) AS (
      SELECT NEW.survivor_entity_id
      UNION
      SELECT alias.survivor_entity_id
      FROM die_identity.entity_alias alias
      JOIN successors ON alias.predecessor_entity_id = successors.entity_id
      WHERE alias.tenant_id = NEW.tenant_id
        AND alias.system_to IS NULL
    )
    SELECT 1 FROM successors WHERE entity_id = NEW.predecessor_entity_id
  ) THEN
    RAISE EXCEPTION 'entity alias cycle is forbidden';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_normalized.verify_candidate_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.candidate_kind = 'relationship' AND NOT EXISTS (
    SELECT 1 FROM die_normalized.relationship_candidate
    WHERE tenant_id = NEW.tenant_id AND candidate_id = NEW.candidate_id
  ) THEN
    RAISE EXCEPTION 'unknown relationship candidate';
  ELSIF NEW.candidate_kind = 'activity' AND NOT EXISTS (
    SELECT 1 FROM die_normalized.activity_candidate
    WHERE tenant_id = NEW.tenant_id AND candidate_id = NEW.candidate_id
  ) THEN
    RAISE EXCEPTION 'unknown activity candidate';
  ELSIF NEW.candidate_kind = 'coverage' AND NOT EXISTS (
    SELECT 1 FROM die_normalized.coverage_candidate
    WHERE tenant_id = NEW.tenant_id AND candidate_id = NEW.candidate_id
  ) THEN
    RAISE EXCEPTION 'unknown coverage candidate';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_controlled_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  immutable_old jsonb;
  immutable_new jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Keep table selection in an outer PL/pgSQL branch. A single boolean
    -- expression such as TG_TABLE_NAME = 'x' AND NEW.x_only_column ... still
    -- attempts to bind x_only_column against rows from other trigger tables.
    IF TG_TABLE_NAME = 'mutation_preview' THEN
      IF NEW.status <> 'active' OR NEW.consumed_at IS NOT NULL OR NEW.consumed_by IS NOT NULL THEN
        RAISE EXCEPTION 'mutation previews must be created active and unconsumed';
      END IF;
    ELSIF TG_TABLE_NAME = 'api_idempotency' THEN
      IF NEW.state <> 'in_progress' OR NEW.response_status IS NOT NULL
        OR NEW.response_json IS NOT NULL OR NEW.resource_id IS NOT NULL
        OR NEW.completed_at IS NOT NULL THEN
        RAISE EXCEPTION 'idempotency records must be created in progress without a response';
      END IF;
    ELSIF TG_TABLE_NAME = 'evidence_access_grant' THEN
      IF NEW.state <> 'active' OR NEW.consumed_at IS NOT NULL THEN
        RAISE EXCEPTION 'evidence access grants must be created active and unconsumed';
      END IF;
    ELSIF TG_TABLE_NAME = 'identity_command' THEN
      IF NEW.status <> 'queued' OR NEW.result_json IS NOT NULL
        OR NEW.reason_code IS NOT NULL OR NEW.completed_at IS NOT NULL THEN
        RAISE EXCEPTION 'identity commands must be created queued without a result';
      END IF;
    ELSIF TG_TABLE_NAME = 'export_job' THEN
      IF NEW.status <> 'queued' OR NEW.object_key IS NOT NULL
        OR NEW.file_sha256 IS NOT NULL OR NEW.expires_at IS NOT NULL
        OR NEW.completed_at IS NOT NULL THEN
        RAISE EXCEPTION 'export jobs must be created queued without output metadata';
      END IF;
    END IF;
    IF TG_TABLE_NAME = 'export_job' THEN
      PERFORM 1
      FROM die_pipeline.projection_generation generation
      WHERE generation.tenant_id = NEW.tenant_id
        AND generation.projection_name = NEW.projection_name
        AND generation.generation = NEW.projection_generation
        AND generation.state = 'active'
        AND generation.applied_watermark >= NEW.canonical_watermark
      FOR SHARE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'export snapshot must bind the active caught-up product generation';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE'
    AND TG_TABLE_NAME = 'api_idempotency'
    AND OLD.state IN ('completed','failed')
    AND OLD.expires_at <= transaction_timestamp()
    AND pg_has_role(session_user, 'die_maintenance', 'member') THEN
    RETURN OLD;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION '% control records cannot be deleted', TG_TABLE_NAME;
  END IF;

  IF TG_TABLE_NAME = 'mutation_preview' THEN
    immutable_old := to_jsonb(OLD) - ARRAY['status','consumed_at','consumed_by'];
    immutable_new := to_jsonb(NEW) - ARRAY['status','consumed_at','consumed_by'];
    IF immutable_old IS DISTINCT FROM immutable_new THEN
      RAISE EXCEPTION 'mutation preview request and authorization context are immutable';
    END IF;
    IF OLD.status <> 'active' THEN
      RAISE EXCEPTION 'terminal mutation preview cannot be changed';
    END IF;
    IF NEW.status NOT IN ('consumed','expired','revoked') THEN
      RAISE EXCEPTION 'invalid mutation preview transition % to %', OLD.status, NEW.status;
    END IF;

  ELSIF TG_TABLE_NAME = 'api_idempotency' THEN
    immutable_old := to_jsonb(OLD) - ARRAY['state','response_status','response_json','resource_id','completed_at'];
    immutable_new := to_jsonb(NEW) - ARRAY['state','response_status','response_json','resource_id','completed_at'];
    IF immutable_old IS DISTINCT FROM immutable_new THEN
      RAISE EXCEPTION 'idempotency identity, request digest and expiry are immutable';
    END IF;
    IF OLD.state <> 'in_progress' OR NEW.state NOT IN ('completed','failed') THEN
      RAISE EXCEPTION 'invalid idempotency transition % to %', OLD.state, NEW.state;
    END IF;
    IF NEW.response_status IS NULL THEN
      RAISE EXCEPTION 'terminal idempotency record requires response_status';
    END IF;

  ELSIF TG_TABLE_NAME = 'evidence_access_grant' THEN
    immutable_old := to_jsonb(OLD) - ARRAY['state','consumed_at'];
    immutable_new := to_jsonb(NEW) - ARRAY['state','consumed_at'];
    IF immutable_old IS DISTINCT FROM immutable_new THEN
      RAISE EXCEPTION 'evidence access grant identity and authorization context are immutable';
    END IF;
    IF OLD.state <> 'active' OR NEW.state NOT IN ('consumed','revoked','expired') THEN
      RAISE EXCEPTION 'invalid evidence access transition % to %', OLD.state, NEW.state;
    END IF;

  ELSIF TG_TABLE_NAME = 'identity_command' THEN
    immutable_old := to_jsonb(OLD) - ARRAY['status','result_json','reason_code','completed_at'];
    immutable_new := to_jsonb(NEW) - ARRAY['status','result_json','reason_code','completed_at'];
    IF immutable_old IS DISTINCT FROM immutable_new THEN
      RAISE EXCEPTION 'identity command request and authorization context are immutable';
    END IF;
    IF NOT (
      (OLD.status = 'queued' AND NEW.status IN ('applying','rejected','failed'))
      OR
      (OLD.status = 'applying' AND NEW.status IN ('succeeded','rejected','failed'))
    ) THEN
      RAISE EXCEPTION 'invalid identity command transition % to %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'succeeded' AND NEW.result_json IS NULL THEN
      RAISE EXCEPTION 'succeeded identity command requires result_json';
    END IF;
    IF NEW.status IN ('rejected','failed') AND NEW.reason_code IS NULL THEN
      RAISE EXCEPTION '% identity command requires reason_code', NEW.status;
    END IF;

  ELSIF TG_TABLE_NAME = 'export_job' THEN
    immutable_old := to_jsonb(OLD) - ARRAY['status','object_key','file_sha256','expires_at','completed_at'];
    immutable_new := to_jsonb(NEW) - ARRAY['status','object_key','file_sha256','expires_at','completed_at'];
    IF immutable_old IS DISTINCT FROM immutable_new THEN
      RAISE EXCEPTION 'export request and authorization snapshot are immutable';
    END IF;
    IF NOT (
      (OLD.status = 'queued' AND NEW.status IN ('running','failed','cancelled'))
      OR
      (OLD.status = 'running' AND NEW.status IN ('completed','failed','cancelled'))
      OR
      (OLD.status = 'completed' AND NEW.status = 'expired')
    ) THEN
      RAISE EXCEPTION 'invalid export transition % to %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'completed' AND (
      NEW.object_key IS NULL OR NEW.file_sha256 IS NULL
      OR NEW.expires_at IS NULL OR NEW.completed_at IS NULL
    ) THEN
      RAISE EXCEPTION 'completed export requires object, digest, expiry and completion time';
    END IF;
    IF NEW.status IN ('failed','cancelled') AND NEW.completed_at IS NULL THEN
      RAISE EXCEPTION '% export requires completed_at', NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.runtime_stage_allowed(
  requested_stage text,
  requested_operation text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  has_runtime_role boolean;
  has_migration_owner_authority boolean;
BEGIN
  has_runtime_role :=
    pg_has_role(session_user, 'die_ingest', 'member')
    OR pg_has_role(session_user, 'die_normalizer', 'member')
    OR pg_has_role(session_user, 'die_truth', 'member')
    OR pg_has_role(session_user, 'die_projector', 'member')
    OR pg_has_role(session_user, 'die_api', 'member')
    OR pg_has_role(session_user, 'die_maintenance', 'member')
    OR pg_has_role(session_user, 'die_control_admin', 'member')
    OR pg_has_role(session_user, 'die_authz_admin', 'member');

  SELECT pg_has_role(login.oid, relation.relowner, 'member')
    INTO has_migration_owner_authority
    FROM pg_class relation
    JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
    JOIN pg_roles login ON login.rolname = session_user
    WHERE namespace.nspname = 'die_pipeline'
      AND relation.relname = 'work_item';

  -- Only the table owner (or its member/superuser) bypasses runtime stage
  -- mapping for offline migrations. Merely granting a non-runtime login table
  -- access cannot bypass the transition guard.
  IF NOT has_runtime_role THEN
    RETURN coalesce(has_migration_owner_authority, false);
  END IF;

  IF requested_operation = 'recover' THEN
    RETURN pg_has_role(session_user, 'die_maintenance', 'member');
  ELSIF requested_operation = 'handle' THEN
    RETURN
      (requested_stage = 'normalize'
        AND pg_has_role(session_user, 'die_normalizer', 'member'))
      OR (requested_stage IN ('truth','identity_command')
        AND pg_has_role(session_user, 'die_truth', 'member'))
      OR (requested_stage IN ('project_postgres','project_clickhouse')
        AND pg_has_role(session_user, 'die_projector', 'member'))
      OR (requested_stage IN ('export','maintenance')
        AND pg_has_role(session_user, 'die_maintenance', 'member'));
  ELSIF requested_operation = 'enqueue' THEN
    RETURN
      (requested_stage = 'normalize'
        AND (
          pg_has_role(session_user, 'die_ingest', 'member')
          OR pg_has_role(session_user, 'die_maintenance', 'member')
        ))
      OR (requested_stage = 'truth'
        AND (
          pg_has_role(session_user, 'die_normalizer', 'member')
          OR pg_has_role(session_user, 'die_truth', 'member')
          OR pg_has_role(session_user, 'die_maintenance', 'member')
        ))
      OR (requested_stage = 'identity_command'
        AND (
          pg_has_role(session_user, 'die_api', 'member')
          OR pg_has_role(session_user, 'die_maintenance', 'member')
        ))
      OR (requested_stage IN ('project_postgres','project_clickhouse')
        AND (
          pg_has_role(session_user, 'die_truth', 'member')
          OR pg_has_role(session_user, 'die_projector', 'member')
          OR pg_has_role(session_user, 'die_maintenance', 'member')
        ))
      OR (requested_stage = 'export'
        AND (
          pg_has_role(session_user, 'die_api', 'member')
          OR pg_has_role(session_user, 'die_maintenance', 'member')
        ))
      OR (requested_stage = 'maintenance'
        AND (
          pg_has_role(session_user, 'die_maintenance', 'member')
          OR pg_has_role(session_user, 'die_control_admin', 'member')
        ));
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_work_item_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_outputs integer;
  actual_outputs bigint;
  expected_bundle_digest text;
  actual_bundle_digest text;
  expired_recovery boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT die_pipeline.runtime_stage_allowed(NEW.stage, 'enqueue') THEN
      RAISE EXCEPTION 'runtime role is not authorized to enqueue stage %', NEW.stage;
    END IF;
    IF NEW.status <> 'pending' OR NEW.attempt_count <> 0
      OR NEW.lease_owner IS NOT NULL OR NEW.lease_token IS NOT NULL
      OR NEW.lease_expires_at IS NOT NULL THEN
      RAISE EXCEPTION 'work items must be created pending, unattempted and unleased';
    END IF;
    IF NEW.stage = 'truth' AND NEW.subject_kind = 'normalization_run' THEN
      BEGIN
        SELECT output_count, bundle_digest
          INTO STRICT expected_outputs, expected_bundle_digest
          FROM die_normalized.normalization_run
          WHERE tenant_id = NEW.tenant_id
            AND normalization_run_id = NEW.subject_id::uuid;
      EXCEPTION
        WHEN invalid_text_representation OR no_data_found THEN
          RAISE EXCEPTION 'truth work item subject must identify one normalization run';
      END;
      SELECT count(*)
        INTO actual_outputs
        FROM die_normalized.observation
        WHERE tenant_id = NEW.tenant_id
          AND normalization_run_id = NEW.subject_id::uuid;
      IF actual_outputs <> expected_outputs THEN
        RAISE EXCEPTION 'truth work item cannot publish incomplete normalization run: expected %, found %',
          expected_outputs, actual_outputs;
      END IF;
      SELECT 'sha256:' || encode(
        digest(
          string_agg(
            int8send(octet_length(output_key)::bigint)
              || convert_to(output_key, 'UTF8')
              || int8send(octet_length(observation_id::text)::bigint)
              || convert_to(observation_id::text, 'UTF8')
              || int8send(octet_length(output_digest)::bigint)
              || convert_to(output_digest, 'UTF8'),
            ''::bytea
            ORDER BY convert_to(output_key, 'UTF8')
          ),
          'sha256'
        ),
        'hex'
      )
        INTO actual_bundle_digest
        FROM die_normalized.observation
        WHERE tenant_id = NEW.tenant_id
          AND normalization_run_id = NEW.subject_id::uuid;
      IF actual_bundle_digest IS DISTINCT FROM expected_bundle_digest THEN
        RAISE EXCEPTION 'truth work item cannot publish normalization run with a corrupt bundle digest';
      END IF;
      IF NEW.input_version <> expected_bundle_digest THEN
        RAISE EXCEPTION 'truth work item input_version must equal the verified normalization bundle digest';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'work items cannot be deleted';
  END IF;
  expired_recovery := OLD.status = 'leased'
    AND OLD.lease_expires_at <= clock_timestamp()
    AND NEW.status IN ('retry','quarantined');
  IF expired_recovery THEN
    IF NOT die_pipeline.runtime_stage_allowed(NEW.stage, 'recover') THEN
      RAISE EXCEPTION 'only the maintenance role may recover an expired lease';
    END IF;
    IF NEW.status = 'retry' AND OLD.attempt_count >= OLD.max_attempts THEN
      RAISE EXCEPTION 'an exhausted expired lease must be quarantined';
    END IF;
    IF NEW.status = 'quarantined' AND OLD.attempt_count < OLD.max_attempts THEN
      RAISE EXCEPTION 'an expired lease with attempts remaining must be retried';
    END IF;
    IF NEW.last_error_code IS DISTINCT FROM (
      CASE NEW.status
        WHEN 'retry' THEN 'lease_expired'
        ELSE 'lease_expired_attempts_exhausted'
      END
    ) OR NEW.last_error_at IS NULL THEN
      RAISE EXCEPTION 'expired lease recovery requires the exact safe error code and time';
    END IF;
  ELSIF NOT die_pipeline.runtime_stage_allowed(NEW.stage, 'handle') THEN
    RAISE EXCEPTION 'runtime role is not authorized to handle stage %', NEW.stage;
  END IF;
  IF (to_jsonb(OLD) - ARRAY[
        'status','available_at','lease_owner','lease_token','lease_expires_at',
        'attempt_count','last_error_code','last_error_at','updated_at'
      ]) IS DISTINCT FROM
     (to_jsonb(NEW) - ARRAY[
        'status','available_at','lease_owner','lease_token','lease_expires_at',
        'attempt_count','last_error_code','last_error_at','updated_at'
      ]) THEN
    RAISE EXCEPTION 'work item identity, routing and retry policy are immutable';
  END IF;
  IF OLD.status IN ('completed','quarantined','cancelled') THEN
    RAISE EXCEPTION 'terminal work item cannot be changed';
  END IF;
  IF NOT (
    (OLD.status IN ('pending','retry') AND NEW.status IN ('leased','cancelled'))
    OR
    (OLD.status = 'leased' AND NEW.status IN ('leased','completed','retry','quarantined','cancelled'))
  ) THEN
    RAISE EXCEPTION 'invalid work item transition % to %', OLD.status, NEW.status;
  END IF;
  IF OLD.status = 'leased' AND NOT expired_recovery
    AND NEW.status IN ('leased','completed','quarantined','cancelled')
    AND OLD.lease_expires_at <= clock_timestamp() THEN
    RAISE EXCEPTION 'expired lease cannot renew or commit a terminal result';
  END IF;
  IF NEW.status = 'leased' THEN
    IF NEW.lease_owner IS NULL OR NEW.lease_token IS NULL OR NEW.lease_expires_at IS NULL THEN
      RAISE EXCEPTION 'leased work item requires owner, token and expiry';
    END IF;
    IF NEW.lease_expires_at <= clock_timestamp() THEN
      RAISE EXCEPTION 'lease acquisition or renewal requires a future expiry';
    END IF;
    IF OLD.status <> 'leased' AND NEW.attempt_count <> OLD.attempt_count + 1 THEN
      RAISE EXCEPTION 'lease acquisition must increment attempt_count exactly once';
    END IF;
    IF OLD.status = 'leased' AND (
      NEW.attempt_count <> OLD.attempt_count
      OR NEW.lease_owner IS DISTINCT FROM OLD.lease_owner
      OR NEW.lease_token IS DISTINCT FROM OLD.lease_token
    ) THEN
      RAISE EXCEPTION 'lease renewal cannot change owner, token or attempt count';
    END IF;
    IF OLD.status = 'leased' AND NEW.lease_expires_at <= OLD.lease_expires_at THEN
      RAISE EXCEPTION 'lease renewal must extend expiry';
    END IF;
    IF NEW.attempt_count > NEW.max_attempts THEN
      RAISE EXCEPTION 'work item exceeded max_attempts';
    END IF;
  ELSE
    IF NEW.lease_owner IS NOT NULL OR NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL THEN
      RAISE EXCEPTION 'non-leased work item cannot retain lease credentials';
    END IF;
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'attempt_count changes only when acquiring a lease';
    END IF;
    IF NEW.status = 'retry' AND NEW.attempt_count >= NEW.max_attempts THEN
      RAISE EXCEPTION 'attempt exhaustion must produce a quarantined execution';
    END IF;
  END IF;
  IF NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'work item updated_at cannot move backwards';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_stage_execution_fence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.execution_kind = 'lease_recovery' THEN
    IF NOT die_pipeline.runtime_stage_allowed(NEW.stage, 'recover')
      OR NEW.result <> 'quarantined' THEN
      RAISE EXCEPTION 'lease recovery execution requires maintenance role and quarantined result';
    END IF;
    PERFORM 1
    FROM die_pipeline.work_item AS w
    WHERE w.tenant_id = NEW.tenant_id
      AND w.work_id = NEW.work_id
      AND w.stage = NEW.stage
      AND w.subject_kind = NEW.subject_kind
      AND w.subject_id = NEW.subject_id
      AND w.input_version = NEW.input_version
      AND w.implementation_version = NEW.implementation_version
      AND w.status = 'leased'
      AND w.lease_token = NEW.lease_token
      AND w.lease_expires_at <= clock_timestamp()
      AND w.attempt_count >= w.max_attempts
    FOR UPDATE;
  ELSE
    IF NOT die_pipeline.runtime_stage_allowed(NEW.stage, 'handle') THEN
      RAISE EXCEPTION 'runtime role is not authorized to execute stage %', NEW.stage;
    END IF;
    PERFORM 1
    FROM die_pipeline.work_item AS w
    WHERE w.tenant_id = NEW.tenant_id
      AND w.work_id = NEW.work_id
      AND w.stage = NEW.stage
      AND w.subject_kind = NEW.subject_kind
      AND w.subject_id = NEW.subject_id
      AND w.input_version = NEW.input_version
      AND w.implementation_version = NEW.implementation_version
      AND w.status = 'leased'
      AND w.lease_token = NEW.lease_token
      AND w.lease_expires_at > clock_timestamp()
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'stage execution requires a matching live lease or exact exhausted recovery fence';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.require_terminal_execution()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_result text[];
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.status <> 'leased'
    OR NEW.status NOT IN ('completed','quarantined') THEN
    RETURN NULL;
  END IF;
  expected_result := CASE NEW.status
    WHEN 'completed' THEN ARRAY['completed','no_change']
    ELSE ARRAY['quarantined']
  END;
  IF NOT EXISTS (
    SELECT 1
    FROM die_pipeline.stage_execution execution
    WHERE execution.tenant_id = NEW.tenant_id
      AND execution.work_id = NEW.work_id
      AND execution.lease_token = OLD.lease_token
      AND execution.stage = NEW.stage
      AND execution.subject_kind = NEW.subject_kind
      AND execution.subject_id = NEW.subject_id
      AND execution.input_version = NEW.input_version
      AND execution.implementation_version = NEW.implementation_version
      AND execution.result = ANY(expected_result)
  ) THEN
    RAISE EXCEPTION 'leased work cannot become terminal without its matching fenced execution';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.require_execution_terminal_work()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_status text;
BEGIN
  expected_status := CASE
    WHEN NEW.result IN ('completed','no_change') THEN 'completed'
    ELSE 'quarantined'
  END;
  IF NOT EXISTS (
    SELECT 1
    FROM die_pipeline.work_item work
    WHERE work.tenant_id = NEW.tenant_id
      AND work.work_id = NEW.work_id
      AND work.stage = NEW.stage
      AND work.subject_kind = NEW.subject_kind
      AND work.subject_id = NEW.subject_id
      AND work.input_version = NEW.input_version
      AND work.implementation_version = NEW.implementation_version
      AND work.status = expected_status
      AND work.lease_owner IS NULL
      AND work.lease_token IS NULL
      AND work.lease_expires_at IS NULL
  ) THEN
    RAISE EXCEPTION 'fenced execution committed without its matching terminal work state';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_normalized.enforce_source_object_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_observed_at timestamptz;
  old_normalized_at timestamptz;
  new_observed_at timestamptz;
  new_normalized_at timestamptz;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'source objects cannot be deleted';
  END IF;
  IF (to_jsonb(OLD) - ARRAY[
        'presence_state','first_referenced_at','last_referenced_at',
        'first_observed_at','last_observed_at','source_lifecycle','current_observation_id'
      ]) IS DISTINCT FROM
     (to_jsonb(NEW) - ARRAY[
        'presence_state','first_referenced_at','last_referenced_at',
        'first_observed_at','last_observed_at','source_lifecycle','current_observation_id'
      ]) THEN
    RAISE EXCEPTION 'source object identity is immutable';
  END IF;
  IF NEW.first_referenced_at > OLD.first_referenced_at THEN
    RAISE EXCEPTION 'source object first_referenced_at cannot move forward';
  END IF;
  IF NEW.last_referenced_at < OLD.last_referenced_at THEN
    RAISE EXCEPTION 'source object last_referenced_at cannot move backwards';
  END IF;
  IF OLD.presence_state = 'observed' AND NEW.presence_state <> 'observed' THEN
    RAISE EXCEPTION 'observed source object cannot regress to referenced_only';
  END IF;
  IF OLD.first_observed_at IS NOT NULL AND (
    NEW.first_observed_at IS NULL
    OR NEW.first_observed_at > OLD.first_observed_at
    OR NEW.last_observed_at < OLD.last_observed_at
  ) THEN
    RAISE EXCEPTION 'source object observation interval cannot regress';
  END IF;
  IF OLD.current_observation_id IS NOT NULL
    AND NEW.current_observation_id IS NULL THEN
    RAISE EXCEPTION 'source object current observation cannot be cleared';
  END IF;
  IF NEW.current_observation_id IS DISTINCT FROM OLD.current_observation_id
    AND NEW.current_observation_id IS NOT NULL THEN
    SELECT observed_at, normalized_at
      INTO STRICT new_observed_at, new_normalized_at
      FROM die_normalized.observation
      WHERE tenant_id = NEW.tenant_id
        AND observation_id = NEW.current_observation_id
        AND source_object_pk = NEW.source_object_pk
        AND producer_id = NEW.producer_id;
    IF new_observed_at > NEW.last_observed_at THEN
      RAISE EXCEPTION 'current observation cannot be newer than last_observed_at';
    END IF;
    IF NEW.presence_state <> 'observed'
      OR NEW.first_observed_at IS NULL
      OR new_observed_at < NEW.first_observed_at THEN
      RAISE EXCEPTION 'current observation requires a matching observed source interval';
    END IF;
    IF OLD.current_observation_id IS NOT NULL THEN
      SELECT observed_at, normalized_at
        INTO STRICT old_observed_at, old_normalized_at
        FROM die_normalized.observation
        WHERE tenant_id = OLD.tenant_id
          AND observation_id = OLD.current_observation_id;
      IF (new_observed_at, new_normalized_at, NEW.current_observation_id)
        < (old_observed_at, old_normalized_at, OLD.current_observation_id) THEN
        RAISE EXCEPTION 'current observation cannot move to an older deterministic order';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'source object current observation must exist in the same source lineage';
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.enforce_head_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'canonical heads cannot be deleted';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.current_version <> 1 THEN
      RAISE EXCEPTION 'canonical head version must start at one';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'entity' THEN
    IF (OLD.tenant_id, OLD.entity_id, OLD.entity_type, OLD.created_at)
      IS DISTINCT FROM
       (NEW.tenant_id, NEW.entity_id, NEW.entity_type, NEW.created_at) THEN
      RAISE EXCEPTION 'canonical entity identity is immutable';
    END IF;
    IF NEW.first_observed_at > OLD.first_observed_at
      OR NEW.last_observed_at < OLD.last_observed_at
      OR NEW.updated_at < OLD.updated_at THEN
      RAISE EXCEPTION 'canonical entity observation/update clocks cannot regress';
    END IF;
  ELSIF TG_TABLE_NAME = 'relationship' THEN
    IF (OLD.tenant_id, OLD.relationship_id, OLD.subject_entity_id, OLD.predicate,
        OLD.object_entity_id, OLD.semantic, OLD.scope_kind, OLD.scope_key)
      IS DISTINCT FROM
       (NEW.tenant_id, NEW.relationship_id, NEW.subject_entity_id, NEW.predicate,
        NEW.object_entity_id, NEW.semantic, NEW.scope_kind, NEW.scope_key) THEN
      RAISE EXCEPTION 'canonical relationship identity is immutable';
    END IF;
    IF NEW.first_observed_at > OLD.first_observed_at
      OR NEW.last_observed_at < OLD.last_observed_at THEN
      RAISE EXCEPTION 'canonical relationship observation clocks cannot regress';
    END IF;
  ELSIF TG_TABLE_NAME = 'activity_locator' THEN
    IF (OLD.tenant_id, OLD.activity_id, OLD.occurred_at, OLD.created_at)
      IS DISTINCT FROM
       (NEW.tenant_id, NEW.activity_id, NEW.occurred_at, NEW.created_at) THEN
      RAISE EXCEPTION 'canonical activity locator identity is immutable';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported canonical head table %', TG_TABLE_NAME;
  END IF;

  IF NEW.current_version <> OLD.current_version + 1 THEN
    RAISE EXCEPTION 'canonical head must advance exactly one version';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.require_version_head()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  head_matches boolean;
  version_kind text;
BEGIN
  version_kind := coalesce(TG_ARGV[0], TG_TABLE_NAME);
  CASE version_kind
    WHEN 'entity_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.entity head
        WHERE head.tenant_id = NEW.tenant_id
          AND head.entity_id = NEW.entity_id
          AND head.current_version = NEW.version
          AND head.entity_type = NEW.entity_type
          AND head.lifecycle = NEW.lifecycle
      ) INTO head_matches;
    WHEN 'relationship_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.relationship head
        WHERE head.tenant_id = NEW.tenant_id
          AND head.relationship_id = NEW.relationship_id
          AND head.current_version = NEW.version
          AND head.lifecycle = NEW.lifecycle
      ) INTO head_matches;
    WHEN 'activity_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.activity_locator head
        WHERE head.tenant_id = NEW.tenant_id
          AND head.activity_id = NEW.activity_id
          AND head.occurred_at = NEW.occurred_at
          AND head.current_version = NEW.version
      ) INTO head_matches;
    ELSE
      RAISE EXCEPTION 'unsupported canonical version kind %', version_kind;
  END CASE;
  IF NOT coalesce(head_matches, false) THEN
    RAISE EXCEPTION 'canonical version is not the exact matching committed head';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.require_closed_version_successor()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  version_kind text;
  successor_exists boolean;
BEGIN
  version_kind := coalesce(TG_ARGV[0], TG_TABLE_NAME);
  CASE version_kind
    WHEN 'entity_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.entity head
        JOIN die_canonical.entity_version successor
          ON successor.tenant_id = head.tenant_id
         AND successor.entity_id = head.entity_id
         AND successor.version = head.current_version
        WHERE head.tenant_id = NEW.tenant_id
          AND head.entity_id = NEW.entity_id
          AND head.current_version = OLD.version + 1
          AND successor.system_from >= NEW.system_to
      ) INTO successor_exists;
    WHEN 'relationship_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.relationship head
        JOIN die_canonical.relationship_version successor
          ON successor.tenant_id = head.tenant_id
         AND successor.relationship_id = head.relationship_id
         AND successor.version = head.current_version
        WHERE head.tenant_id = NEW.tenant_id
          AND head.relationship_id = NEW.relationship_id
          AND head.current_version = OLD.version + 1
          AND successor.system_from >= NEW.system_to
      ) INTO successor_exists;
    WHEN 'activity_version' THEN
      SELECT EXISTS (
        SELECT 1
        FROM die_canonical.activity_locator head
        JOIN die_canonical.activity_version successor
          ON successor.tenant_id = head.tenant_id
         AND successor.activity_id = head.activity_id
         AND successor.occurred_at = head.occurred_at
         AND successor.version = head.current_version
        WHERE head.tenant_id = NEW.tenant_id
          AND head.activity_id = NEW.activity_id
          AND head.occurred_at = NEW.occurred_at
          AND head.current_version = OLD.version + 1
          AND successor.system_from >= NEW.system_to
      ) INTO successor_exists;
    ELSE
      RAISE EXCEPTION 'unsupported canonical close kind %', version_kind;
  END CASE;
  IF NOT coalesce(successor_exists, false) THEN
    RAISE EXCEPTION 'closed canonical version requires the exact next committed head';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.enforce_coverage_revision_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prior die_canonical.coverage_interval%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(NEW.tenant_id || ':' || NEW.coverage_id::text, 0)
  );
  SELECT *
    INTO prior
    FROM die_canonical.coverage_interval
    WHERE tenant_id = NEW.tenant_id
      AND coverage_id = NEW.coverage_id
    ORDER BY revision DESC
    LIMIT 1;
  IF NOT FOUND THEN
    IF NEW.revision <> 1 THEN
      RAISE EXCEPTION 'coverage revision must start at one';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.revision <> prior.revision + 1 THEN
    RAISE EXCEPTION 'coverage revision must advance exactly one';
  END IF;
  IF (NEW.tenant_id, NEW.coverage_id, NEW.producer_id, NEW.business_scope_id,
      NEW.capability, NEW.population_id)
    IS DISTINCT FROM
     (prior.tenant_id, prior.coverage_id, prior.producer_id, prior.business_scope_id,
      prior.capability, prior.population_id) THEN
    RAISE EXCEPTION 'coverage aggregate identity is immutable across revisions';
  END IF;
  IF prior.system_to IS NULL OR NEW.system_from < prior.system_to THEN
    RAISE EXCEPTION 'prior coverage revision must be closed before the exact next revision';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_canonical.require_coverage_successor()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_canonical.coverage_interval successor
    WHERE successor.tenant_id = NEW.tenant_id
      AND successor.coverage_id = NEW.coverage_id
      AND successor.revision = OLD.revision + 1
      AND successor.system_from >= NEW.system_to
  ) THEN
    RAISE EXCEPTION 'closed coverage revision requires the exact next committed revision';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_outbox.enforce_canonical_pointer()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pointer_exists boolean;
  payload_key text;
  payload_value jsonb;
  payload_type text;
BEGIN
  FOR payload_key, payload_value IN
    SELECT key, value FROM jsonb_each(NEW.payload)
  LOOP
    payload_type := jsonb_typeof(payload_value);
    IF payload_key !~ '^[A-Za-z0-9_.:-]{1,128}$' THEN
      RAISE EXCEPTION 'outbox payload key is outside the pointer contract';
    END IF;
    IF payload_type = 'string' AND length(payload_value #>> '{}') > 4096 THEN
      RAISE EXCEPTION 'outbox payload string exceeds the pointer contract';
    ELSIF payload_type = 'number'
      AND abs((payload_value #>> '{}')::numeric) > 9007199254740991 THEN
      RAISE EXCEPTION 'outbox payload number exceeds the cross-language safe range';
    ELSIF payload_type NOT IN ('string','number','boolean','null') THEN
      RAISE EXCEPTION 'outbox payload values must be scalar';
    END IF;
  END LOOP;
  IF NOT (
    (NEW.aggregate_type = 'entity' AND NEW.change_type IN (
      'created','updated','staled','retired','tombstoned','restored',
      'merged','split','ambiguous'
    ))
    OR (NEW.aggregate_type = 'relationship' AND NEW.change_type IN (
      'created','updated','ended','staled','restored','ambiguous'
    ))
    OR (NEW.aggregate_type = 'activity' AND NEW.change_type IN (
      'created','updated','tombstoned','restored'
    ))
    OR (NEW.aggregate_type = 'coverage' AND NEW.change_type = 'coverage_changed')
    OR (NEW.aggregate_type = 'evidence'
      AND NEW.change_type = 'evidence_disposition_changed')
  ) THEN
    RAISE EXCEPTION 'outbox change type is incompatible with its aggregate type';
  END IF;
  CASE NEW.aggregate_type
    WHEN 'entity' THEN
      SELECT EXISTS (
        SELECT 1 FROM die_canonical.entity_version
        WHERE tenant_id = NEW.tenant_id
          AND entity_id = NEW.aggregate_id
          AND version = NEW.aggregate_version
      ) INTO pointer_exists;
    WHEN 'relationship' THEN
      SELECT EXISTS (
        SELECT 1 FROM die_canonical.relationship_version
        WHERE tenant_id = NEW.tenant_id
          AND relationship_id = NEW.aggregate_id
          AND version = NEW.aggregate_version
      ) INTO pointer_exists;
    WHEN 'activity' THEN
      SELECT EXISTS (
        SELECT 1 FROM die_canonical.activity_version
        WHERE tenant_id = NEW.tenant_id
          AND activity_id = NEW.aggregate_id
          AND version = NEW.aggregate_version
      ) INTO pointer_exists;
    WHEN 'coverage' THEN
      SELECT EXISTS (
        SELECT 1 FROM die_canonical.coverage_interval
        WHERE tenant_id = NEW.tenant_id
          AND coverage_id = NEW.aggregate_id
          AND revision = NEW.aggregate_version
      ) INTO pointer_exists;
    WHEN 'evidence' THEN
      SELECT EXISTS (
        SELECT 1 FROM die_evidence.evidence_disposition
        WHERE tenant_id = NEW.tenant_id
          AND evidence_id = NEW.aggregate_id
          AND revision = NEW.aggregate_version
      ) INTO pointer_exists;
  END CASE;
  IF NOT coalesce(pointer_exists, false) THEN
    RAISE EXCEPTION 'outbox pointer does not identify an authoritative aggregate version';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_outbox.require_head_pointer()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  aggregate_type_value text;
  aggregate_id_value uuid;
  aggregate_version_value bigint;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'entity' THEN
      aggregate_type_value := 'entity';
      aggregate_id_value := NEW.entity_id;
      aggregate_version_value := NEW.current_version;
    WHEN 'relationship' THEN
      aggregate_type_value := 'relationship';
      aggregate_id_value := NEW.relationship_id;
      aggregate_version_value := NEW.current_version;
    WHEN 'activity_locator' THEN
      aggregate_type_value := 'activity';
      aggregate_id_value := NEW.activity_id;
      aggregate_version_value := NEW.current_version;
    WHEN 'coverage_interval' THEN
      aggregate_type_value := 'coverage';
      aggregate_id_value := NEW.coverage_id;
      aggregate_version_value := NEW.revision;
    WHEN 'evidence_disposition' THEN
      aggregate_type_value := 'evidence';
      aggregate_id_value := NEW.evidence_id;
      aggregate_version_value := NEW.revision;
    ELSE
      RAISE EXCEPTION 'unsupported outbox-enforced aggregate table %', TG_TABLE_NAME;
  END CASE;

  IF NOT EXISTS (
    SELECT 1
    FROM die_outbox.canonical_change
    WHERE tenant_id = NEW.tenant_id
      AND aggregate_type = aggregate_type_value
      AND aggregate_id = aggregate_id_value
      AND aggregate_version = aggregate_version_value
  ) THEN
    RAISE EXCEPTION 'canonical aggregate version committed without an outbox pointer';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_projection_generation_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actual_partition_count bigint;
  actual_checkpoint_count bigint;
  actual_manifest_digest text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'building' OR NEW.applied_watermark <> 0
      OR NEW.verification_digest IS NOT NULL OR NEW.activated_at IS NOT NULL
      OR NEW.retired_at IS NOT NULL THEN
      RAISE EXCEPTION 'projection generation must be created as an unverified build';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'projection generations cannot be deleted';
  END IF;
  IF (to_jsonb(OLD) - ARRAY[
        'state','source_watermark','applied_watermark','verification_digest',
        'activated_at','retired_at'
      ]) IS DISTINCT FROM
     (to_jsonb(NEW) - ARRAY[
        'state','source_watermark','applied_watermark','verification_digest',
        'activated_at','retired_at'
      ]) THEN
    RAISE EXCEPTION 'projection generation identity and creation time are immutable';
  END IF;
  IF NEW.source_watermark < OLD.source_watermark
    OR NEW.applied_watermark < OLD.applied_watermark THEN
    RAISE EXCEPTION 'projection watermarks cannot move backwards';
  END IF;
  IF NEW.state IN ('building','catching_up')
    AND NEW.verification_digest IS NOT NULL THEN
    RAISE EXCEPTION 'unverified projection state cannot carry a verification digest';
  END IF;
  IF NOT (
    (OLD.state = NEW.state AND OLD.state IN ('building','catching_up','verifying','active','standby'))
    OR (OLD.state = 'building' AND NEW.state IN ('catching_up','failed'))
    OR (OLD.state = 'catching_up' AND NEW.state IN ('verifying','failed'))
    OR (OLD.state = 'verifying' AND NEW.state IN ('active','failed'))
    OR (OLD.state = 'active' AND NEW.state IN ('standby','retired'))
    OR (OLD.state = 'standby' AND NEW.state IN ('active','retired'))
  ) THEN
    RAISE EXCEPTION 'invalid projection generation transition % to %', OLD.state, NEW.state;
  END IF;
  IF OLD.state IN ('verifying','active','standby','retired','failed')
    AND NEW.verification_digest IS DISTINCT FROM OLD.verification_digest THEN
    RAISE EXCEPTION 'verified projection digest is immutable';
  END IF;
  IF OLD.state = 'verifying' AND (
    NEW.verification_digest IS DISTINCT FROM OLD.verification_digest
    OR NEW.source_watermark <> OLD.source_watermark
    OR NEW.applied_watermark <> OLD.applied_watermark
  ) THEN
    RAISE EXCEPTION 'projection verification snapshot is immutable';
  END IF;
  IF NEW.state = 'verifying' AND (
    NEW.verification_digest IS NULL
    OR NEW.applied_watermark <> NEW.source_watermark
  ) THEN
    RAISE EXCEPTION 'verifying projection must be caught up with a digest';
  END IF;
  IF NEW.state IN ('verifying','active','standby') THEN
    SELECT count(*),
           'sha256:' || encode(
             digest(
               string_agg(
                 int8send(octet_length(partition_key)::bigint)
                   || convert_to(partition_key, 'UTF8')
                   || int8send(octet_length(destination_kind)::bigint)
                   || convert_to(destination_kind, 'UTF8'),
                 ''::bytea
                 ORDER BY convert_to(partition_key, 'UTF8')
               ),
               'sha256'
             ),
             'hex'
           )
      INTO actual_partition_count, actual_manifest_digest
      FROM die_pipeline.projection_required_partition
      WHERE tenant_id = NEW.tenant_id
        AND projection_name = NEW.projection_name
        AND generation = NEW.generation;
    IF actual_partition_count <> NEW.required_partition_count
      OR actual_manifest_digest IS DISTINCT FROM NEW.partition_manifest_digest THEN
      RAISE EXCEPTION 'projection required-partition manifest does not match its frozen count/digest';
    END IF;
    SELECT count(*)
      INTO actual_checkpoint_count
      FROM die_pipeline.projection_required_partition required
      JOIN die_pipeline.projection_checkpoint checkpoint
        USING (tenant_id, projection_name, generation, partition_key)
      WHERE required.tenant_id = NEW.tenant_id
        AND required.projection_name = NEW.projection_name
        AND required.generation = NEW.generation
        AND checkpoint.last_outbox_id = NEW.applied_watermark
        AND checkpoint.destination_ack_token IS NOT NULL
        AND checkpoint.destination_digest IS NOT NULL;
    IF actual_checkpoint_count <> NEW.required_partition_count THEN
      RAISE EXCEPTION 'projection watermark is not acknowledged by every required partition';
    END IF;
  END IF;
  IF NEW.state IN ('active','standby') AND (
    NEW.verification_digest IS NULL OR NEW.activated_at IS NULL
    OR NEW.applied_watermark <> NEW.source_watermark
  ) THEN
    RAISE EXCEPTION 'serving or rollback-ready projection must be verified and fully caught up';
  END IF;
  IF NEW.state IN ('building','catching_up','verifying','failed')
    AND NEW.activated_at IS NOT NULL THEN
    RAISE EXCEPTION 'an unactivated projection state cannot have activated_at';
  END IF;
  IF OLD.activated_at IS NOT NULL AND NEW.activated_at IS DISTINCT FROM OLD.activated_at THEN
    RAISE EXCEPTION 'projection first activated_at is immutable';
  END IF;
  IF OLD.activated_at IS NULL AND NEW.state = 'active' AND NEW.activated_at IS NULL THEN
    RAISE EXCEPTION 'first projection activation requires activated_at';
  END IF;
  IF NEW.state = 'retired' AND NEW.retired_at IS NULL THEN
    RAISE EXCEPTION 'retired projection requires retired_at';
  END IF;
  IF NEW.state <> 'retired' AND NEW.retired_at IS NOT NULL THEN
    RAISE EXCEPTION 'only a retired projection has retired_at';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_projection_required_partition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  generation_state text;
  generation_created_at timestamptz;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'projection required-partition manifests are immutable';
  END IF;
  SELECT state, created_at
    INTO STRICT generation_state, generation_created_at
    FROM die_pipeline.projection_generation
    WHERE tenant_id = NEW.tenant_id
      AND projection_name = NEW.projection_name
      AND generation = NEW.generation
    FOR SHARE;
  IF generation_state <> 'building' OR NEW.created_at < generation_created_at THEN
    RAISE EXCEPTION 'required partitions can be registered only while a generation is building';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_pipeline.enforce_projection_checkpoint()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  generation_state text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'projection checkpoints cannot be deleted';
  END IF;
  SELECT state
    INTO STRICT generation_state
    FROM die_pipeline.projection_generation
    WHERE tenant_id = NEW.tenant_id
      AND projection_name = NEW.projection_name
      AND generation = NEW.generation
    FOR SHARE;
  IF generation_state IN ('verifying','retired','failed') THEN
    RAISE EXCEPTION 'projection checkpoint cannot change in generation state %', generation_state;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF (to_jsonb(OLD) - ARRAY[
          'last_outbox_id','destination_ack_token','destination_digest','updated_at'
        ]) IS DISTINCT FROM
       (to_jsonb(NEW) - ARRAY[
          'last_outbox_id','destination_ack_token','destination_digest','updated_at'
        ]) THEN
      RAISE EXCEPTION 'projection checkpoint identity is immutable';
    END IF;
    IF NEW.last_outbox_id < OLD.last_outbox_id THEN
      RAISE EXCEPTION 'projection checkpoint cannot move backwards';
    END IF;
    IF NEW.last_outbox_id = OLD.last_outbox_id AND (
      NEW.destination_ack_token IS DISTINCT FROM OLD.destination_ack_token
      OR NEW.destination_digest IS DISTINCT FROM OLD.destination_digest
    ) AND NOT (
      NEW.last_outbox_id = 0
      AND OLD.destination_ack_token IS NULL
      AND OLD.destination_digest IS NULL
      AND NEW.destination_ack_token IS NOT NULL
      AND NEW.destination_digest IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'projection acknowledgement cannot change without watermark advance';
    END IF;
    IF NEW.last_outbox_id > OLD.last_outbox_id AND (
      NEW.destination_ack_token IS NULL OR NEW.destination_digest IS NULL
    ) THEN
      RAISE EXCEPTION 'projection checkpoint advance requires destination acknowledgement and digest';
    END IF;
    IF NEW.updated_at < OLD.updated_at THEN
      RAISE EXCEPTION 'projection checkpoint time cannot move backwards';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_audit.enforce_audit_head()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.last_sequence <> 0 OR NEW.last_event_hash IS NOT NULL THEN
      RAISE EXCEPTION 'audit head must be initialized at sequence zero without a hash';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'audit heads cannot be deleted';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.audit_shard IS DISTINCT FROM OLD.audit_shard THEN
    RAISE EXCEPTION 'audit head identity is immutable';
  END IF;
  IF NEW.last_sequence <> OLD.last_sequence + 1 OR NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'audit head must advance exactly one sequence with monotonic time';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM die_audit.audit_event event
    WHERE event.tenant_id = NEW.tenant_id
      AND event.audit_shard = NEW.audit_shard
      AND event.audit_sequence = NEW.last_sequence
      AND event.event_hash = NEW.last_event_hash
      AND event.previous_hash IS NOT DISTINCT FROM OLD.last_event_hash
  ) THEN
    RAISE EXCEPTION 'audit head advance has no matching chained immutable event';
  END IF;
  RETURN NEW;
END;
$$;

-- The hash format is explicit and session-independent. In particular,
-- timestamptz-to-JSON output otherwise changes with the connection TimeZone,
-- which would make later verification disagree with insertion.
CREATE OR REPLACE FUNCTION die_audit.compute_audit_event_hash(
  audit_row die_audit.audit_event
)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $$
  SELECT 'sha256:' || encode(
    public.digest(
      convert_to(
        jsonb_build_object(
          'hash_format', audit_row.hash_format,
          'tenant_id', audit_row.tenant_id,
          'audit_id', audit_row.audit_id::text,
          'audit_shard', audit_row.audit_shard,
          'audit_sequence', audit_row.audit_sequence,
          'occurred_at_utc',
            to_char(
              audit_row.occurred_at AT TIME ZONE 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            ),
          'actor_type', audit_row.actor_type,
          'actor_id', audit_row.actor_id,
          'actor_session_id', audit_row.actor_session_id,
          'action', audit_row.action,
          'resource_type', audit_row.resource_type,
          'resource_id', audit_row.resource_id,
          'business_scope_id', audit_row.business_scope_id::text,
          'outcome', audit_row.outcome,
          'reason_code', audit_row.reason_code,
          'request_id', audit_row.request_id,
          'authorization_revision', audit_row.authorization_revision,
          'safe_details', audit_row.safe_details,
          'previous_hash', audit_row.previous_hash
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  )
$$;

CREATE OR REPLACE FUNCTION die_audit.enforce_audit_event_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  head_sequence bigint;
  head_hash text;
  computed_hash text;
BEGIN
  SELECT last_sequence, last_event_hash
    INTO STRICT head_sequence, head_hash
    FROM die_audit.audit_head
    WHERE tenant_id = NEW.tenant_id
      AND audit_shard = NEW.audit_shard
    FOR UPDATE;
  IF NEW.audit_sequence <> head_sequence + 1
    OR NEW.previous_hash IS DISTINCT FROM head_hash THEN
    RAISE EXCEPTION 'audit event does not append to the locked shard head';
  END IF;
  IF NEW.hash_format <> 'die.audit.pg-jsonb-utc.v1' THEN
    RAISE EXCEPTION 'unsupported audit hash format';
  END IF;
  computed_hash := die_audit.compute_audit_event_hash(NEW);
  NEW.event_hash := computed_hash;
  RETURN NEW;
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'audit shard head must exist before appending an event';
END;
$$;

CREATE OR REPLACE FUNCTION die_audit.require_audit_head_advance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM die_audit.audit_head
    WHERE tenant_id = NEW.tenant_id
      AND audit_shard = NEW.audit_shard
      AND last_sequence = NEW.audit_sequence
      AND last_event_hash = NEW.event_hash
  ) THEN
    RAISE EXCEPTION 'audit event committed without advancing its shard head';
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.enforce_manifest_signer_key_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'manifest signer keys are append-preserved';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN
      RAISE EXCEPTION 'new manifest signer key must start at revision one';
    END IF;
    RETURN NEW;
  END IF;
  IF (NEW.tenant_id, NEW.key_id, NEW.algorithm, NEW.public_jwk,
      NEW.fingerprint, NEW.manifest_kind, NEW.environment, NEW.not_before,
      NEW.not_after, NEW.issuer, NEW.created_at)
     IS DISTINCT FROM
     (OLD.tenant_id, OLD.key_id, OLD.algorithm, OLD.public_jwk,
      OLD.fingerprint, OLD.manifest_kind, OLD.environment, OLD.not_before,
      OLD.not_after, OLD.issuer, OLD.created_at) THEN
    RAISE EXCEPTION 'manifest signer key material and scope are immutable';
  END IF;
  IF NEW.revision <> OLD.revision + 1 THEN
    RAISE EXCEPTION 'manifest signer key revision must advance by one';
  END IF;
  IF NOT (
    (OLD.state = 'pending' AND NEW.state IN ('active', 'revoked', 'revoked_compromised'))
    OR (OLD.state = 'active' AND NEW.state IN ('retiring', 'revoked', 'revoked_compromised'))
    OR (OLD.state = 'retiring' AND NEW.state IN ('retired', 'revoked', 'revoked_compromised'))
  ) THEN
    RAISE EXCEPTION 'invalid manifest signer key state transition % -> %', OLD.state, NEW.state;
  END IF;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_control.record_manifest_signer_key_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, die_control
AS $$
DECLARE
  reason text;
BEGIN
  reason := CASE
    WHEN TG_OP = 'INSERT' THEN 'key_created'
    ELSE NULLIF(current_setting('app.change_reason', true), '')
  END;
  IF reason IS NULL THEN
    RAISE EXCEPTION 'manifest signer key transition requires app.change_reason';
  END IF;
  INSERT INTO die_control.manifest_signer_key_version (
    tenant_id, key_id, revision, state, fingerprint, manifest_kind,
    environment, changed_at, changed_by, reason_code
  ) VALUES (
    NEW.tenant_id, NEW.key_id, NEW.revision, NEW.state, NEW.fingerprint,
    NEW.manifest_kind, NEW.environment, NEW.updated_at, session_user, reason
  );
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_oidc_trust_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_revision bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'OIDC trust rows are append-preserved';
  END IF;
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(NEW.tenant_id || chr(31) || NEW.issuer_uri, 0)
    );
    SELECT COALESCE(max(revision), 0) + 1
      INTO expected_revision
      FROM die_authz.oidc_trust
      WHERE tenant_id = NEW.tenant_id
        AND issuer_uri = NEW.issuer_uri;
    IF NEW.revision <> expected_revision THEN
      RAISE EXCEPTION 'OIDC trust revision must be next contiguous revision %', expected_revision;
    END IF;
    RETURN NEW;
  END IF;
  IF (NEW.tenant_id, NEW.issuer_uri, NEW.revision, NEW.discovery_uri,
      NEW.allowed_audiences, NEW.allowed_algorithms,
      NEW.jwks_soft_ttl_seconds, NEW.jwks_hard_ttl_seconds,
      NEW.forced_refresh_min_interval_seconds, NEW.max_token_lifetime_seconds,
      NEW.clock_skew_seconds, NEW.created_at)
     IS DISTINCT FROM
     (OLD.tenant_id, OLD.issuer_uri, OLD.revision, OLD.discovery_uri,
      OLD.allowed_audiences, OLD.allowed_algorithms,
      OLD.jwks_soft_ttl_seconds, OLD.jwks_hard_ttl_seconds,
      OLD.forced_refresh_min_interval_seconds, OLD.max_token_lifetime_seconds,
      OLD.clock_skew_seconds, OLD.created_at) THEN
    RAISE EXCEPTION 'OIDC trust revision contents are immutable';
  END IF;
  IF OLD.state = 'revoked'
    OR NOT (
      (OLD.state = 'pending' AND NEW.state IN ('active', 'disabled', 'revoked'))
      OR (OLD.state = 'active' AND NEW.state IN ('disabled', 'revoked'))
      OR (OLD.state = 'disabled' AND NEW.state IN ('active', 'revoked'))
    ) THEN
    RAISE EXCEPTION 'invalid OIDC trust state transition % -> %', OLD.state, NEW.state;
  END IF;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION die_authz.enforce_runtime_session_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.state = 'active'
      OR OLD.purge_after IS NULL
      OR OLD.purge_after > clock_timestamp()
      OR NOT pg_has_role(session_user, 'die_maintenance', 'member')
      OR current_setting('app.change_reason', true) <> 'session_retention_expired' THEN
      RAISE EXCEPTION 'runtime session purge requires terminal expiry, maintenance role and retention reason';
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  IF (NEW.tenant_id, NEW.session_id, NEW.session_token_digest,
      NEW.issuer_uri, NEW.issuer_revision, NEW.subject, NEW.role_ids,
      NEW.authorization_revision,
      NEW.authentication_time, NEW.assurance, NEW.created_at,
      NEW.absolute_expires_at)
     IS DISTINCT FROM
     (OLD.tenant_id, OLD.session_id, OLD.session_token_digest,
      OLD.issuer_uri, OLD.issuer_revision, OLD.subject, OLD.role_ids,
      OLD.authorization_revision,
      OLD.authentication_time, OLD.assurance, OLD.created_at,
      OLD.absolute_expires_at) THEN
    RAISE EXCEPTION 'runtime session authority fields are immutable';
  END IF;
  IF OLD.state <> 'active' THEN
    IF NEW.state <> OLD.state THEN
      RAISE EXCEPTION 'terminal runtime session cannot reactivate';
    END IF;
    RAISE EXCEPTION 'terminal runtime session is immutable until bounded purge';
  END IF;
  IF NEW.last_seen_at < OLD.last_seen_at
    OR NEW.idle_expires_at < OLD.idle_expires_at
    OR NEW.session_epoch < OLD.session_epoch THEN
    RAISE EXCEPTION 'runtime session clocks and epoch cannot move backward';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER work_item_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.work_item
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_work_item_transition();

CREATE TRIGGER projection_generation_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.projection_generation
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_projection_generation_transition();

CREATE TRIGGER projection_required_partition_immutable
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.projection_required_partition
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_projection_required_partition();

CREATE TRIGGER projection_checkpoint_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.projection_checkpoint
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_projection_checkpoint();

CREATE TRIGGER mutation_preview_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.mutation_preview
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_controlled_transition();

CREATE TRIGGER api_idempotency_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.api_idempotency
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_controlled_transition();

CREATE TRIGGER evidence_access_grant_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.evidence_access_grant
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_controlled_transition();

CREATE TRIGGER identity_command_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_pipeline.identity_command
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_controlled_transition();

CREATE TRIGGER export_job_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_read.export_job
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_controlled_transition();

CREATE TRIGGER export_job_field_immutable
BEFORE UPDATE OR DELETE ON die_read.export_job_field
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER audit_head_controlled_advance
BEFORE INSERT OR UPDATE OR DELETE ON die_audit.audit_head
FOR EACH ROW EXECUTE FUNCTION die_audit.enforce_audit_head();

CREATE TRIGGER audit_event_fenced_insert
BEFORE INSERT ON die_audit.audit_event
FOR EACH ROW EXECUTE FUNCTION die_audit.enforce_audit_event_insert();

CREATE CONSTRAINT TRIGGER audit_event_requires_head_advance
AFTER INSERT ON die_audit.audit_event
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_audit.require_audit_head_advance();

CREATE TRIGGER evidence_record_immutable
BEFORE UPDATE OR DELETE ON die_evidence.evidence_record
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER evidence_disposition_immutable
BEFORE UPDATE OR DELETE ON die_evidence.evidence_disposition
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER evidence_disposition_ordered_insert
BEFORE INSERT ON die_evidence.evidence_disposition
FOR EACH ROW EXECUTE FUNCTION die_evidence.enforce_disposition_append();

CREATE TRIGGER evidence_erasure_plan_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_evidence.erasure_plan
FOR EACH ROW EXECUTE FUNCTION die_evidence.enforce_erasure_plan_transition();

CREATE TRIGGER evidence_erasure_target_immutable
BEFORE INSERT OR UPDATE OR DELETE ON die_evidence.erasure_target
FOR EACH ROW EXECUTE FUNCTION die_evidence.enforce_erasure_target_insert();

CREATE TRIGGER evidence_erasure_receipt_immutable
BEFORE INSERT OR UPDATE OR DELETE ON die_evidence.erasure_receipt
FOR EACH ROW EXECUTE FUNCTION die_evidence.enforce_erasure_receipt_insert();

CREATE TRIGGER ingest_receipt_immutable
BEFORE UPDATE OR DELETE ON die_evidence.ingest_receipt
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER ingest_receipt_item_immutable
BEFORE UPDATE OR DELETE ON die_evidence.ingest_receipt_item
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER producer_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_control.producer
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_producer_transition();

CREATE TRIGGER producer_capability_close_only
BEFORE INSERT OR UPDATE OR DELETE ON die_control.producer_capability
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_capability_close();

CREATE TRIGGER tenant_cell_assignment_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_control.tenant_cell_assignment
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_tenant_cell_transition();

CREATE TRIGGER tenant_cell_principal_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_control.tenant_cell_principal
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_tenant_cell_principal_transition();

CREATE TRIGGER expected_population_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_control.expected_population
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_expected_population_head();

CREATE CONSTRAINT TRIGGER expected_population_requires_version
AFTER INSERT OR UPDATE ON die_control.expected_population
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_control.require_expected_population_version();

CREATE TRIGGER enrollment_manifest_immutable
BEFORE UPDATE OR DELETE ON die_control.enrollment_manifest
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER certification_immutable
BEFORE UPDATE OR DELETE ON die_control.certification
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER manifest_signer_key_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_control.manifest_signer_key
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_manifest_signer_key_transition();

CREATE TRIGGER manifest_signer_key_version_append
AFTER INSERT OR UPDATE ON die_control.manifest_signer_key
FOR EACH ROW EXECUTE FUNCTION die_control.record_manifest_signer_key_version();

CREATE TRIGGER manifest_signer_key_version_immutable
BEFORE UPDATE OR DELETE ON die_control.manifest_signer_key_version
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER manifest_verification_immutable
BEFORE UPDATE OR DELETE ON die_control.manifest_verification
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER oidc_trust_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.oidc_trust
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_oidc_trust_transition();

CREATE TRIGGER runtime_session_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.runtime_session
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_runtime_session_transition();

CREATE TRIGGER expected_population_version_immutable
BEFORE UPDATE OR DELETE ON die_control.expected_population_version
FOR EACH ROW EXECUTE FUNCTION die_control.allow_only_expected_population_version_close();

CREATE TRIGGER expected_population_version_ordered_insert
BEFORE INSERT ON die_control.expected_population_version
FOR EACH ROW EXECUTE FUNCTION die_control.enforce_expected_population_version_insert();

CREATE CONSTRAINT TRIGGER expected_population_version_requires_head
AFTER INSERT ON die_control.expected_population_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_control.require_expected_population_head();

CREATE CONSTRAINT TRIGGER expected_population_closed_version_requires_successor
AFTER UPDATE ON die_control.expected_population_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_control.require_expected_population_version_successor();

CREATE TRIGGER stage_execution_immutable
BEFORE UPDATE OR DELETE ON die_pipeline.stage_execution
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER stage_execution_fenced_insert
BEFORE INSERT ON die_pipeline.stage_execution
FOR EACH ROW EXECUTE FUNCTION die_pipeline.enforce_stage_execution_fence();

CREATE CONSTRAINT TRIGGER work_terminal_requires_execution
AFTER UPDATE ON die_pipeline.work_item
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_pipeline.require_terminal_execution();

CREATE CONSTRAINT TRIGGER execution_requires_terminal_work
AFTER INSERT ON die_pipeline.stage_execution
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_pipeline.require_execution_terminal_work();

CREATE TRIGGER source_object_controlled_update
BEFORE UPDATE OR DELETE ON die_normalized.source_object
FOR EACH ROW EXECUTE FUNCTION die_normalized.enforce_source_object_update();

CREATE TRIGGER observation_immutable
BEFORE UPDATE OR DELETE ON die_normalized.observation
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER normalization_run_immutable
BEFORE UPDATE OR DELETE ON die_normalized.normalization_run
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER cross_sensor_assertion_use_validated
BEFORE INSERT ON die_normalized.cross_sensor_assertion_use
FOR EACH ROW EXECUTE FUNCTION die_normalized.enforce_cross_sensor_assertion_use();

CREATE TRIGGER cross_sensor_assertion_use_immutable
BEFORE UPDATE OR DELETE ON die_normalized.cross_sensor_assertion_use
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER claim_immutable
BEFORE UPDATE OR DELETE ON die_normalized.claim
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER claim_supersession_immutable
BEFORE UPDATE OR DELETE ON die_normalized.claim_supersession
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER relationship_candidate_immutable
BEFORE UPDATE OR DELETE ON die_normalized.relationship_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_candidate_immutable
BEFORE UPDATE OR DELETE ON die_normalized.activity_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_candidate_resource_immutable
BEFORE UPDATE OR DELETE ON die_normalized.activity_candidate_resource
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER coverage_candidate_immutable
BEFORE UPDATE OR DELETE ON die_normalized.coverage_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER candidate_evaluation_immutable
BEFORE UPDATE OR DELETE ON die_normalized.candidate_evaluation
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER candidate_evaluation_reference
BEFORE INSERT ON die_normalized.candidate_evaluation
FOR EACH ROW EXECUTE FUNCTION die_normalized.verify_candidate_reference();

CREATE TRIGGER candidate_dependency_reference
BEFORE INSERT ON die_normalized.candidate_dependency
FOR EACH ROW EXECUTE FUNCTION die_normalized.verify_candidate_reference();

CREATE TRIGGER resolution_decision_immutable
BEFORE UPDATE OR DELETE ON die_identity.resolution_decision
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER resolution_decision_claim_immutable
BEFORE UPDATE OR DELETE ON die_identity.resolution_decision_claim
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER resolution_decision_entity_immutable
BEFORE UPDATE OR DELETE ON die_identity.resolution_decision_entity
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER binding_immutable_except_close
BEFORE UPDATE OR DELETE ON die_identity.binding
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE TRIGGER entity_alias_immutable_except_close
BEFORE UPDATE OR DELETE ON die_identity.entity_alias
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE TRIGGER entity_alias_no_cycle
BEFORE INSERT ON die_identity.entity_alias
FOR EACH ROW EXECUTE FUNCTION die_identity.prevent_alias_cycle();

CREATE TRIGGER correction_claim_immutable
BEFORE UPDATE OR DELETE ON die_identity.correction_claim
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER conflict_candidate_immutable
BEFORE UPDATE OR DELETE ON die_identity.conflict_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER canonical_entity_head_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_canonical.entity
FOR EACH ROW EXECUTE FUNCTION die_canonical.enforce_head_transition();

CREATE TRIGGER canonical_relationship_head_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_canonical.relationship
FOR EACH ROW EXECUTE FUNCTION die_canonical.enforce_head_transition();

CREATE TRIGGER canonical_activity_head_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_canonical.activity_locator
FOR EACH ROW EXECUTE FUNCTION die_canonical.enforce_head_transition();

CREATE TRIGGER canonical_change_pointer_valid
BEFORE INSERT ON die_outbox.canonical_change
FOR EACH ROW EXECUTE FUNCTION die_outbox.enforce_canonical_pointer();

CREATE TRIGGER canonical_change_immutable
BEFORE UPDATE OR DELETE ON die_outbox.canonical_change
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE CONSTRAINT TRIGGER canonical_entity_requires_outbox
AFTER INSERT OR UPDATE ON die_canonical.entity
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_outbox.require_head_pointer();

CREATE CONSTRAINT TRIGGER canonical_relationship_requires_outbox
AFTER INSERT OR UPDATE ON die_canonical.relationship
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_outbox.require_head_pointer();

CREATE CONSTRAINT TRIGGER canonical_activity_requires_outbox
AFTER INSERT OR UPDATE ON die_canonical.activity_locator
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_outbox.require_head_pointer();

CREATE CONSTRAINT TRIGGER canonical_coverage_requires_outbox
AFTER INSERT OR UPDATE ON die_canonical.coverage_interval
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_outbox.require_head_pointer();

CREATE CONSTRAINT TRIGGER evidence_disposition_requires_outbox
AFTER INSERT ON die_evidence.evidence_disposition
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_outbox.require_head_pointer();

CREATE TRIGGER entity_version_immutable
BEFORE UPDATE OR DELETE ON die_canonical.entity_version
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE CONSTRAINT TRIGGER entity_version_requires_head
AFTER INSERT ON die_canonical.entity_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_version_head('entity_version');

CREATE CONSTRAINT TRIGGER entity_closed_version_requires_successor
AFTER UPDATE ON die_canonical.entity_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_closed_version_successor('entity_version');

CREATE TRIGGER entity_version_claim_immutable
BEFORE UPDATE OR DELETE ON die_canonical.entity_version_claim
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER entity_version_correction_claim_immutable
BEFORE UPDATE OR DELETE ON die_canonical.entity_version_correction_claim
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER relationship_version_immutable
BEFORE UPDATE OR DELETE ON die_canonical.relationship_version
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE CONSTRAINT TRIGGER relationship_version_requires_head
AFTER INSERT ON die_canonical.relationship_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_version_head('relationship_version');

CREATE CONSTRAINT TRIGGER relationship_closed_version_requires_successor
AFTER UPDATE ON die_canonical.relationship_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_closed_version_successor('relationship_version');

CREATE TRIGGER relationship_version_candidate_immutable
BEFORE UPDATE OR DELETE ON die_canonical.relationship_version_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER relationship_version_evidence_immutable
BEFORE UPDATE OR DELETE ON die_canonical.relationship_version_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_source_binding_evidence_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_source_binding_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_source_binding_immutable_except_close
BEFORE UPDATE OR DELETE ON die_canonical.activity_source_binding
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE TRIGGER activity_version_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_version
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_activity_version_close();

CREATE CONSTRAINT TRIGGER activity_version_requires_head
AFTER INSERT ON die_canonical.activity_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_version_head('activity_version');

CREATE CONSTRAINT TRIGGER activity_closed_version_requires_successor
AFTER UPDATE ON die_canonical.activity_version
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_closed_version_successor('activity_version');

CREATE TRIGGER activity_version_resource_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_version_resource
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_version_evidence_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_version_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_version_candidate_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_version_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER activity_version_relationship_immutable
BEFORE UPDATE OR DELETE ON die_canonical.activity_version_relationship
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER coverage_interval_evidence_immutable
BEFORE UPDATE OR DELETE ON die_canonical.coverage_interval_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER coverage_interval_candidate_immutable
BEFORE UPDATE OR DELETE ON die_canonical.coverage_interval_candidate
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER coverage_interval_immutable_except_close
BEFORE UPDATE OR DELETE ON die_canonical.coverage_interval
FOR EACH ROW EXECUTE FUNCTION die_canonical.allow_only_version_close();

CREATE TRIGGER coverage_interval_ordered_insert
BEFORE INSERT ON die_canonical.coverage_interval
FOR EACH ROW EXECUTE FUNCTION die_canonical.enforce_coverage_revision_insert();

CREATE CONSTRAINT TRIGGER coverage_closed_revision_requires_successor
AFTER UPDATE ON die_canonical.coverage_interval
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION die_canonical.require_coverage_successor();

CREATE TRIGGER reconciliation_evaluation_immutable
BEFORE UPDATE OR DELETE ON die_canonical.reconciliation_evaluation
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER reconciliation_evaluation_entity_immutable
BEFORE UPDATE OR DELETE ON die_canonical.reconciliation_evaluation_entity
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER reconciliation_evaluation_evidence_immutable
BEFORE UPDATE OR DELETE ON die_canonical.reconciliation_evaluation_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER audit_event_immutable
BEFORE UPDATE OR DELETE ON die_audit.audit_event
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER authz_bootstrap_manifest_immutable
BEFORE UPDATE OR DELETE ON die_authz.bootstrap_manifest
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER business_scope_protect_tenant_root
BEFORE UPDATE OR DELETE ON die_authz.business_scope
FOR EACH ROW EXECUTE FUNCTION die_authz.protect_tenant_root();

CREATE TRIGGER business_scope_no_cycle
BEFORE INSERT OR UPDATE OF parent_scope_id ON die_authz.business_scope
FOR EACH ROW EXECUTE FUNCTION die_authz.prevent_scope_cycle();

CREATE TRIGGER business_scope_controlled_transition
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.business_scope
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_business_scope_transition();

CREATE TRIGGER scope_closure_immutable
BEFORE UPDATE OR DELETE ON die_authz.scope_closure
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER scope_closure_current_revision
BEFORE INSERT ON die_authz.scope_closure
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_scope_closure_insert();

CREATE TRIGGER role_binding_close_only
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.role_binding
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_binding_close();

CREATE TRIGGER relation_tuple_close_only
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.relation_tuple
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_binding_close();

CREATE TRIGGER authorization_revision_controlled_advance
BEFORE INSERT OR UPDATE OR DELETE ON die_authz.authorization_revision
FOR EACH ROW EXECUTE FUNCTION die_authz.enforce_authorization_revision();

CREATE TRIGGER audit_event_evidence_immutable
BEFORE UPDATE OR DELETE ON die_audit.audit_event_evidence
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

CREATE TRIGGER audit_checkpoint_immutable
BEFORE UPDATE OR DELETE ON die_audit.audit_checkpoint
FOR EACH ROW EXECUTE FUNCTION die_evidence.reject_immutable_mutation();

ALTER TABLE die_control.producer ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_signer_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_signer_key_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.evidence_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.source_object ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.conflict ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_locator ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.entity_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.agent_deployment_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.application_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.model_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.mcp_server_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.device_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.identity_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.relationship_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.producer_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.overview_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.business_scope ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.role_binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.relation_tuple ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.oidc_trust ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.runtime_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_head ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_checkpoint ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_producer ON die_control.producer
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_manifest_signer_key ON die_control.manifest_signer_key
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_manifest_signer_key_version ON die_control.manifest_signer_key_version
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_manifest_verification ON die_control.manifest_verification
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_evidence ON die_evidence.evidence_record
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_source_object ON die_normalized.source_object
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_observation ON die_normalized.observation
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_claim ON die_normalized.claim
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_binding ON die_identity.binding
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_conflict ON die_identity.conflict
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_entity ON die_canonical.entity
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relationship ON die_canonical.relationship
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_locator ON die_canonical.activity_locator
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version ON die_canonical.activity_version
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_coverage ON die_canonical.coverage_interval
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_entity ON die_read.entity_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_agent_deployment ON die_read.agent_deployment_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_application ON die_read.application_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_model ON die_read.model_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_mcp_server ON die_read.mcp_server_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_device ON die_read.device_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_identity ON die_read.identity_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_relationship ON die_read.relationship_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_producer ON die_read.producer_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_read_overview ON die_read.overview_current
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_scope ON die_authz.business_scope
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_role_binding ON die_authz.role_binding
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relation_tuple ON die_authz.relation_tuple
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_oidc_trust ON die_authz.oidc_trust
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_runtime_session ON die_authz.runtime_session
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_audit ON die_audit.audit_event
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_audit_head ON die_audit.audit_head
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_audit_checkpoint ON die_audit.audit_checkpoint
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());

-- Defense-in-depth applies to internal ledgers as well as product-facing tables.
-- Runtime roles are not table owners and set app.tenant_id at transaction start.
ALTER TABLE die_control.producer FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.tenant_cell_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.tenant_cell_assignment FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.tenant_cell_principal ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.tenant_cell_principal FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.producer_capability ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.producer_capability FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_signer_key FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_signer_key_version FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.manifest_verification FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.expected_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.expected_population FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.expected_population_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.expected_population_version FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.enrollment_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.enrollment_manifest FORCE ROW LEVEL SECURITY;
ALTER TABLE die_control.certification ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_control.certification FORCE ROW LEVEL SECURITY;

ALTER TABLE die_evidence.producer_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.producer_sequence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.evidence_record FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.evidence_disposition ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.evidence_disposition FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_plan FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_target FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.erasure_receipt FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.ingest_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.ingest_receipt FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.ingest_receipt_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.ingest_receipt_item FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.rejected_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.rejected_record FORCE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.sequence_gap ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_evidence.sequence_gap FORCE ROW LEVEL SECURITY;

ALTER TABLE die_pipeline.work_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.work_item FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.mutation_preview ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.mutation_preview FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.api_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.api_idempotency FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.evidence_access_grant ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.evidence_access_grant FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.identity_command ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.identity_command FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.stage_execution ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.stage_execution FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_generation FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_required_partition ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_required_partition FORCE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_checkpoint ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_pipeline.projection_checkpoint FORCE ROW LEVEL SECURITY;

ALTER TABLE die_normalized.source_object FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.normalization_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.normalization_run FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.cross_sensor_assertion_use ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.cross_sensor_assertion_use FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.observation FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.claim FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.claim_supersession ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.claim_supersession FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.relationship_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.relationship_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.activity_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.activity_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.activity_candidate_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.activity_candidate_resource FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.coverage_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.coverage_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.candidate_evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.candidate_evaluation FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.candidate_dependency ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.candidate_dependency FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_member FORCE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_normalized.reconciliation_run FORCE ROW LEVEL SECURITY;

ALTER TABLE die_identity.binding FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision_claim FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.resolution_decision_entity FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.entity_alias ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.entity_alias FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.correction_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.correction_claim FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.conflict FORCE ROW LEVEL SECURITY;
ALTER TABLE die_identity.conflict_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_identity.conflict_candidate FORCE ROW LEVEL SECURITY;

ALTER TABLE die_canonical.entity FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version_claim FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version_correction_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.entity_version_correction_claim FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.relationship_version_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_locator FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_source_binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_source_binding FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_source_binding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_source_binding_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_default ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_default FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_resource FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.activity_version_relationship FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.coverage_interval_candidate FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation_entity FORCE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_canonical.reconciliation_evaluation_evidence FORCE ROW LEVEL SECURITY;

ALTER TABLE die_outbox.canonical_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_outbox.canonical_change FORCE ROW LEVEL SECURITY;

ALTER TABLE die_read.entity_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.agent_deployment_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.application_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.model_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.mcp_server_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.device_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.identity_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.relationship_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.producer_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.overview_current FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.export_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.export_job FORCE ROW LEVEL SECURITY;
ALTER TABLE die_read.export_job_field ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_read.export_job_field FORCE ROW LEVEL SECURITY;

ALTER TABLE die_authz.business_scope FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.scope_closure ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.scope_closure FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.role_binding FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.relation_tuple FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.authorization_revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.authorization_revision FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.bootstrap_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_authz.bootstrap_manifest FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.oidc_trust FORCE ROW LEVEL SECURITY;
ALTER TABLE die_authz.runtime_session FORCE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_head FORCE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_event FORCE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_event_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_event_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE die_audit.audit_checkpoint FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_producer_capability ON die_control.producer_capability
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY cell_worker_read_assignment ON die_control.tenant_cell_assignment
  FOR SELECT
  USING (EXISTS (
    SELECT 1
    FROM die_control.tenant_cell_principal principal
    WHERE principal.tenant_id = tenant_cell_assignment.tenant_id
      AND principal.cell_id = tenant_cell_assignment.cell_id
      AND principal.database_principal = session_user
      AND principal.state = 'active'
  ));
CREATE POLICY cell_admin_assignment ON die_control.tenant_cell_assignment
  USING (pg_has_role(session_user, 'die_control_admin', 'member'))
  WITH CHECK (pg_has_role(session_user, 'die_control_admin', 'member'));
CREATE POLICY cell_principal_self_read ON die_control.tenant_cell_principal
  FOR SELECT
  USING (
    database_principal = session_user
    OR pg_has_role(session_user, 'die_control_admin', 'member')
  );
CREATE POLICY cell_admin_principal ON die_control.tenant_cell_principal
  FOR ALL
  USING (pg_has_role(session_user, 'die_control_admin', 'member'))
  WITH CHECK (pg_has_role(session_user, 'die_control_admin', 'member'));
CREATE POLICY tenant_isolation_expected_population ON die_control.expected_population
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_expected_population_version ON die_control.expected_population_version
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_enrollment_manifest ON die_control.enrollment_manifest
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_certification ON die_control.certification
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_producer_sequence ON die_evidence.producer_sequence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_ingest_receipt ON die_evidence.ingest_receipt
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_evidence_disposition ON die_evidence.evidence_disposition
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_erasure_plan ON die_evidence.erasure_plan
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_erasure_target ON die_evidence.erasure_target
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_erasure_receipt ON die_evidence.erasure_receipt
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_ingest_receipt_item ON die_evidence.ingest_receipt_item
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_rejected_record ON die_evidence.rejected_record
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_sequence_gap ON die_evidence.sequence_gap
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_work_item ON die_pipeline.work_item
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_mutation_preview ON die_pipeline.mutation_preview
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_api_idempotency ON die_pipeline.api_idempotency
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_evidence_access_grant ON die_pipeline.evidence_access_grant
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_identity_command ON die_pipeline.identity_command
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_stage_execution ON die_pipeline.stage_execution
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_projection_generation ON die_pipeline.projection_generation
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_projection_required_partition ON die_pipeline.projection_required_partition
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_projection_checkpoint ON die_pipeline.projection_checkpoint
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_normalization_run ON die_normalized.normalization_run
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_cross_sensor_assertion_use ON die_normalized.cross_sensor_assertion_use
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_claim_supersession ON die_normalized.claim_supersession
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relationship_candidate ON die_normalized.relationship_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_candidate ON die_normalized.activity_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_candidate_resource ON die_normalized.activity_candidate_resource
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_coverage_candidate ON die_normalized.coverage_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_candidate_evaluation ON die_normalized.candidate_evaluation
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_candidate_dependency ON die_normalized.candidate_dependency
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_candidate ON die_normalized.reconciliation_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_member ON die_normalized.reconciliation_member
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_run ON die_normalized.reconciliation_run
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_resolution_decision ON die_identity.resolution_decision
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_resolution_decision_claim ON die_identity.resolution_decision_claim
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_resolution_decision_entity ON die_identity.resolution_decision_entity
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_entity_alias ON die_identity.entity_alias
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_correction_claim ON die_identity.correction_claim
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_conflict_candidate ON die_identity.conflict_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_entity_version ON die_canonical.entity_version
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_entity_version_claim ON die_canonical.entity_version_claim
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_entity_version_correction_claim ON die_canonical.entity_version_correction_claim
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relationship_version ON die_canonical.relationship_version
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relationship_version_candidate ON die_canonical.relationship_version_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_relationship_version_evidence ON die_canonical.relationship_version_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_source_binding ON die_canonical.activity_source_binding
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_source_binding_evidence ON die_canonical.activity_source_binding_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version_default ON die_canonical.activity_version_default
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version_resource ON die_canonical.activity_version_resource
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version_evidence ON die_canonical.activity_version_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version_candidate ON die_canonical.activity_version_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_activity_version_relationship ON die_canonical.activity_version_relationship
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_coverage_interval_evidence ON die_canonical.coverage_interval_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_coverage_interval_candidate ON die_canonical.coverage_interval_candidate
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_evaluation ON die_canonical.reconciliation_evaluation
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_evaluation_entity ON die_canonical.reconciliation_evaluation_entity
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_reconciliation_evaluation_evidence ON die_canonical.reconciliation_evaluation_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_outbox ON die_outbox.canonical_change
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_export ON die_read.export_job
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_export_field ON die_read.export_job_field
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_scope_closure ON die_authz.scope_closure
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_authz_revision ON die_authz.authorization_revision
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_authz_bootstrap_manifest ON die_authz.bootstrap_manifest
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());
CREATE POLICY tenant_isolation_audit_event_evidence ON die_audit.audit_event_evidence
  USING (tenant_id = die_authz.current_tenant_id())
  WITH CHECK (tenant_id = die_authz.current_tenant_id());

COMMIT;

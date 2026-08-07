BEGIN;

-- These are NOLOGIN group roles. Deployment creates workload login roles and
-- grants exactly one group role. Migrations run as a distinct non-runtime owner.
DO $$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY[
    'die_ingest',
    'die_normalizer',
    'die_truth',
    'die_projector',
    'die_api',
    'die_bff',
    'die_maintenance',
    'die_enrollment',
    'die_verifier',
    'die_control_admin',
    'die_authz_admin'
  ]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN NOBYPASSRLS', role_name);
    END IF;
  END LOOP;
END
$$;

REVOKE ALL ON SCHEMA die_control, die_evidence, die_pipeline, die_normalized,
  die_identity, die_canonical, die_outbox, die_read, die_authz, die_audit
  FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA die_control, die_evidence, die_pipeline,
  die_normalized, die_identity, die_canonical, die_outbox, die_read,
  die_authz, die_audit
  FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA die_pipeline, die_outbox FROM PUBLIC;
REVOKE ALL ON FUNCTION die_authz.current_tenant_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION die_authz.jsonb_object_key_count(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION die_audit.compute_audit_event_hash(die_audit.audit_event)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION die_control.record_manifest_signer_key_version()
  FROM PUBLIC;

GRANT USAGE ON SCHEMA die_control, die_evidence, die_pipeline, die_outbox,
  die_authz, die_audit
  TO die_ingest;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.organization_tenant,
  die_control.producer, die_control.producer_capability,
  die_control.certification, die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal, die_control.installation_enrollment,
  die_control.producer_component_set, die_control.workload_credential TO die_ingest;
GRANT SELECT, INSERT ON die_evidence.producer_sequence,
  die_evidence.evidence_record, die_evidence.ingest_receipt,
  die_evidence.ingest_receipt_item, die_evidence.evidence_disposition,
  die_evidence.rejected_record TO die_ingest;
GRANT SELECT, INSERT, UPDATE ON die_evidence.sequence_gap TO die_ingest;
GRANT UPDATE (last_seen_at) ON die_control.producer TO die_ingest;
GRANT SELECT, INSERT ON die_pipeline.work_item TO die_ingest;
GRANT SELECT, INSERT ON die_outbox.canonical_change TO die_ingest;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq,
  die_outbox.canonical_change_outbox_id_seq TO die_ingest;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_ingest;
GRANT INSERT ON die_audit.audit_event TO die_ingest;

GRANT USAGE ON SCHEMA die_control, die_evidence, die_pipeline, die_normalized, die_authz
  TO die_normalizer;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.producer, die_control.producer_capability,
  die_control.certification, die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal TO die_normalizer;
GRANT SELECT ON die_evidence.evidence_record TO die_normalizer;
GRANT SELECT, INSERT ON die_normalized.source_object TO die_normalizer;
GRANT UPDATE (
  presence_state, first_referenced_at, last_referenced_at,
  first_observed_at, last_observed_at, source_lifecycle, current_observation_id
)
  ON die_normalized.source_object TO die_normalizer;
GRANT SELECT, INSERT ON die_normalized.normalization_run,
  die_normalized.cross_sensor_assertion_use,
  die_normalized.observation, die_normalized.claim,
  die_normalized.relationship_candidate, die_normalized.activity_candidate,
  die_normalized.activity_candidate_resource,
  die_normalized.coverage_candidate, die_normalized.reconciliation_candidate,
  die_normalized.reconciliation_member TO die_normalizer;
GRANT SELECT, INSERT, UPDATE ON die_normalized.reconciliation_run TO die_normalizer;
GRANT SELECT, INSERT, UPDATE ON die_pipeline.work_item TO die_normalizer;
GRANT SELECT, INSERT ON die_pipeline.stage_execution TO die_normalizer;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq TO die_normalizer;

GRANT USAGE ON SCHEMA die_control, die_pipeline, die_normalized, die_identity,
  die_canonical, die_outbox, die_audit, die_authz TO die_truth;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.expected_population,
  die_control.expected_population_version,
  die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal TO die_truth;
GRANT SELECT ON ALL TABLES IN SCHEMA die_normalized TO die_truth;
GRANT INSERT ON die_normalized.claim_supersession,
  die_normalized.candidate_evaluation, die_normalized.candidate_dependency TO die_truth;
GRANT UPDATE (state, last_binding_revision, recorded_at)
  ON die_normalized.candidate_dependency TO die_truth;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA die_identity TO die_truth;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA die_canonical TO die_truth;
GRANT SELECT, INSERT ON die_outbox.canonical_change TO die_truth;
GRANT SELECT, INSERT, UPDATE ON die_pipeline.work_item TO die_truth;
GRANT SELECT ON die_pipeline.identity_command TO die_truth;
GRANT UPDATE (status, result_json, reason_code, completed_at)
  ON die_pipeline.identity_command TO die_truth;
GRANT SELECT ON die_pipeline.mutation_preview TO die_truth;
GRANT SELECT, INSERT ON die_pipeline.stage_execution TO die_truth;
GRANT SELECT, INSERT ON die_audit.audit_event,
  die_audit.audit_event_evidence TO die_truth;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_truth;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq,
  die_outbox.canonical_change_outbox_id_seq TO die_truth;

GRANT USAGE ON SCHEMA die_pipeline, die_canonical, die_outbox, die_read,
  die_control, die_evidence, die_authz TO die_projector;
GRANT SELECT ON ALL TABLES IN SCHEMA die_canonical, die_outbox TO die_projector;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.producer, die_control.producer_capability,
  die_control.certification, die_control.expected_population,
  die_control.expected_population_version,
  die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal, die_control.producer_component_set,
  die_control.producer_package, die_control.producer_component TO die_projector;
-- The projector derives producer health from the effective signed policy. It
-- reads the policy; it never authors one.
GRANT SELECT ON die_control.producer_health_policy TO die_projector;
GRANT SELECT ON die_evidence.erasure_plan, die_evidence.erasure_target
  TO die_projector;
GRANT INSERT ON die_evidence.erasure_receipt TO die_projector;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  die_read.entity_current, die_read.agent_deployment_current,
  die_read.application_current, die_read.model_current,
  die_read.mcp_server_current, die_read.device_current,
  die_read.identity_current, die_read.relationship_current,
  die_read.producer_current, die_read.producer_health_component_current,
  die_read.overview_current TO die_projector;
GRANT SELECT, INSERT, UPDATE ON die_pipeline.work_item,
  die_pipeline.projection_generation, die_pipeline.projection_checkpoint
  TO die_projector;
GRANT SELECT, INSERT ON die_pipeline.projection_required_partition
  TO die_projector;
GRANT SELECT, INSERT ON die_pipeline.stage_execution TO die_projector;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq
  TO die_projector;

GRANT USAGE ON SCHEMA die_control, die_evidence, die_normalized, die_identity,
  die_canonical, die_read, die_authz, die_audit, die_pipeline TO die_api;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.producer, die_control.producer_capability,
  die_control.certification, die_control.expected_population,
  die_control.expected_population_version, die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal, die_control.producer_component_set,
  die_control.producer_package, die_control.producer_component TO die_api;
GRANT SELECT ON die_evidence.evidence_record, die_evidence.sequence_gap
  TO die_api;
GRANT SELECT ON die_evidence.evidence_disposition TO die_api;
GRANT SELECT ON die_normalized.source_object, die_normalized.observation,
  die_normalized.claim TO die_api;
GRANT SELECT ON ALL TABLES IN SCHEMA die_identity, die_canonical, die_read,
  die_authz TO die_api;
GRANT SELECT ON die_audit.audit_event, die_audit.audit_event_evidence TO die_api;
GRANT SELECT, INSERT ON die_read.export_job TO die_api;
GRANT SELECT, INSERT ON die_read.export_job_field TO die_api;
GRANT SELECT, INSERT ON die_pipeline.mutation_preview,
  die_pipeline.api_idempotency, die_pipeline.evidence_access_grant TO die_api;
GRANT SELECT ON die_pipeline.projection_generation TO die_api;
GRANT UPDATE (status, consumed_at, consumed_by)
  ON die_pipeline.mutation_preview TO die_api;
GRANT UPDATE (state, response_status, response_json, resource_id, completed_at)
  ON die_pipeline.api_idempotency TO die_api;
GRANT UPDATE (state, consumed_at)
  ON die_pipeline.evidence_access_grant TO die_api;
GRANT SELECT, INSERT ON die_pipeline.identity_command TO die_api;
GRANT INSERT ON die_pipeline.work_item, die_audit.audit_event TO die_api;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_api;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq TO die_api;

-- Server-private browser-session broker. The trusted host/router resolves the
-- tenant before setting app.tenant_id; RLS then constrains every trust/session
-- lookup. The BFF cannot read inventory, evidence or canonical truth directly.
GRANT USAGE ON SCHEMA die_authz, die_control TO die_bff;
GRANT SELECT ON die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal TO die_bff;
GRANT SELECT ON die_authz.oidc_trust, die_authz.authorization_revision,
  die_authz.runtime_session TO die_bff;
GRANT INSERT ON die_authz.runtime_session TO die_bff;
GRANT UPDATE (
  last_seen_at, idle_expires_at, session_epoch, state,
  revoked_at, revocation_reason, purge_after
) ON die_authz.runtime_session TO die_bff;

-- Network-facing installed-product enrollment/renewal service. Its
-- login is still tenant-cell bound and RLS constrained; this role is not a
-- general control administrator and cannot author profile/schema/signing keys.
GRANT USAGE ON SCHEMA die_control, die_audit, die_authz TO die_enrollment;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version,
  die_control.organization_tenant,
  die_control.tenant_cell_assignment, die_control.tenant_cell_principal,
  die_control.sensor_bootstrap, die_control.installation_enrollment,
  die_control.installation_enrollment_attempt,
  die_control.producer, die_control.producer_component_set,
  die_control.producer_package, die_control.producer_component,
  die_control.workload_credential, die_control.workload_nonce,
  die_control.credential_renewal,
  die_control.credential_renewal_attempt, die_control.workload_proof_replay,
  die_control.producer_revocation, die_control.producer_revocation_attempt,
  die_control.producer_capability, die_control.producer_health_policy,
  die_control.expected_population, die_control.expected_population_version,
  die_control.enrollment_manifest, die_control.certification,
  die_control.manifest_signer_key TO die_enrollment;
GRANT UPDATE (
  state, consumed_at, consumed_request_id, consumed_request_digest,
  installation_key_thumbprint, terminal_at, terminal_reason
) ON die_control.sensor_bootstrap TO die_enrollment;
GRANT INSERT ON die_control.installation_enrollment,
  die_control.installation_enrollment_attempt,
  die_control.producer, die_control.producer_component_set,
  die_control.producer_package, die_control.producer_component,
  die_control.workload_credential, die_control.workload_nonce,
  die_control.credential_renewal,
  die_control.credential_renewal_attempt, die_control.workload_proof_replay
  TO die_enrollment;
GRANT UPDATE (state, ended_at, end_reason)
  ON die_control.workload_credential TO die_enrollment;
GRANT UPDATE (state, consumed_at, accepted_proof_digest)
  ON die_control.workload_nonce TO die_enrollment;
GRANT SELECT, INSERT ON die_audit.audit_event TO die_enrollment;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_enrollment;
GRANT SELECT ON die_authz.business_scope TO die_enrollment;

-- Isolated detached-JWS verifier. It can read the immutable trust snapshot and
-- append verification evidence, but it cannot register keys, apply effects,
-- enroll producers or mutate a verification after insertion.
GRANT USAGE ON SCHEMA die_control, die_audit, die_authz TO die_verifier;
GRANT SELECT ON die_control.organization_tenant,
  die_control.manifest_signer_key, die_control.manifest_signer_key_version,
  die_control.source_profile, die_control.source_profile_version,
  die_control.tenant_cell_assignment, die_control.tenant_cell_principal
  TO die_verifier;
GRANT INSERT ON die_control.manifest_verification TO die_verifier;
GRANT SELECT, INSERT ON die_audit.audit_event TO die_verifier;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_verifier;
GRANT SELECT ON die_authz.business_scope TO die_verifier;

-- Used only by the maintenance artifact's authenticated enrollment/certification
-- command. A long-lived API or ingest workload never receives this group role.
GRANT USAGE ON SCHEMA die_control, die_pipeline, die_audit, die_authz
  TO die_control_admin;
GRANT SELECT ON die_control.source_profile, die_control.source_profile_version
  TO die_control_admin;
GRANT SELECT, INSERT, UPDATE ON die_control.organization_tenant,
  die_control.producer,
  die_control.producer_capability, die_control.expected_population,
  die_control.tenant_cell_assignment, die_control.tenant_cell_principal
  TO die_control_admin;
GRANT SELECT, INSERT, UPDATE ON die_control.sensor_bootstrap,
  die_control.installation_enrollment, die_control.installation_enrollment_attempt,
  die_control.producer_component_set, die_control.producer_package,
  die_control.producer_component, die_control.workload_credential,
  die_control.workload_nonce,
  die_control.credential_renewal, die_control.credential_renewal_attempt,
  die_control.producer_revocation, die_control.producer_revocation_attempt
  TO die_control_admin;
GRANT SELECT, INSERT ON die_control.sensor_bootstrap_issue_attempt
  TO die_control_admin;
GRANT SELECT, INSERT, UPDATE ON die_control.expected_population_version
  TO die_control_admin;
-- Only the authenticated enrollment command admits an effective health policy,
-- and only from a verified signed producer-enrollment manifest.
GRANT SELECT, INSERT, UPDATE ON die_control.producer_health_policy
  TO die_control_admin;
GRANT SELECT, INSERT ON die_control.enrollment_manifest,
  die_control.certification TO die_control_admin;
-- Promotion may consume verification evidence but cannot register the key that
-- authorized that evidence or claim to have performed verification itself.
GRANT SELECT ON die_control.manifest_signer_key,
  die_control.manifest_signer_key_version TO die_control_admin;
GRANT SELECT ON die_control.manifest_verification TO die_control_admin;
-- The isolated verifier records immutable semantic effects with the passed
-- signature result. Control administration may only mark those exact effects
-- applied; it cannot rewrite what the signed manifest authorized.
GRANT UPDATE (applied_at)
  ON die_control.manifest_verification TO die_control_admin;
GRANT SELECT, INSERT ON die_pipeline.work_item TO die_control_admin;
GRANT SELECT, INSERT ON die_audit.audit_event TO die_control_admin;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_control_admin;
GRANT SELECT ON die_authz.business_scope TO die_control_admin;
GRANT USAGE, SELECT ON SEQUENCE die_pipeline.work_item_work_id_seq
  TO die_control_admin;

GRANT USAGE ON SCHEMA die_authz, die_audit, die_control TO die_authz_admin;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA die_authz TO die_authz_admin;
GRANT SELECT ON die_control.tenant_cell_assignment,
  die_control.tenant_cell_principal TO die_authz_admin;
GRANT SELECT, INSERT, UPDATE ON die_control.manifest_signer_key
  TO die_authz_admin;
GRANT SELECT ON die_control.manifest_signer_key_version TO die_authz_admin;
GRANT SELECT, INSERT ON die_audit.audit_event TO die_authz_admin;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_authz_admin;

-- Session rows are created/closed by the BFF. Authorization administration
-- manages issuer trust but never receives browser session credentials.
REVOKE ALL ON die_authz.runtime_session FROM die_authz_admin;
GRANT SELECT, INSERT, UPDATE ON die_authz.oidc_trust TO die_authz_admin;

GRANT USAGE ON SCHEMA die_control, die_evidence, die_pipeline, die_normalized,
  die_identity, die_canonical, die_outbox, die_read, die_authz, die_audit
  TO die_maintenance;
GRANT SELECT ON ALL TABLES IN SCHEMA die_control, die_evidence, die_pipeline,
  die_normalized, die_identity, die_canonical, die_outbox, die_read,
  die_authz, die_audit TO die_maintenance;
GRANT UPDATE (state, ended_at, end_reason)
  ON die_control.workload_credential TO die_maintenance;
GRANT DELETE ON die_authz.runtime_session TO die_maintenance;
GRANT SELECT ON die_control.manifest_signer_key TO die_maintenance;
GRANT SELECT ON die_control.manifest_signer_key_version TO die_maintenance;
GRANT SELECT, INSERT, UPDATE ON die_pipeline.work_item,
  die_pipeline.projection_generation, die_pipeline.projection_checkpoint
  TO die_maintenance;
GRANT SELECT, INSERT ON die_pipeline.projection_required_partition
  TO die_maintenance;
GRANT UPDATE (state, response_status, response_json, resource_id, completed_at),
  DELETE ON die_pipeline.api_idempotency TO die_maintenance;
GRANT SELECT, INSERT ON die_pipeline.stage_execution TO die_maintenance;
GRANT INSERT ON die_evidence.evidence_disposition TO die_maintenance;
GRANT INSERT ON die_evidence.erasure_plan, die_evidence.erasure_target,
  die_evidence.erasure_receipt TO die_maintenance;
GRANT UPDATE (state, sealed_at, execution_id, execution_started_at)
  ON die_evidence.erasure_plan
  TO die_maintenance;
GRANT INSERT ON die_outbox.canonical_change TO die_maintenance;
GRANT INSERT ON die_read.export_job TO die_maintenance;
GRANT UPDATE (status, object_key, file_sha256, expires_at, completed_at)
  ON die_read.export_job TO die_maintenance;
GRANT INSERT ON die_audit.audit_event TO die_maintenance;
GRANT INSERT ON die_audit.audit_event_evidence TO die_maintenance;
GRANT SELECT, INSERT, UPDATE ON die_audit.audit_head TO die_maintenance;
GRANT INSERT ON die_audit.audit_checkpoint TO die_maintenance;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA die_pipeline, die_outbox
  TO die_maintenance;

-- Maintenance schedules producer-health evaluation and never performs it. It
-- may read health to decide what is due and it may enqueue the projector's
-- execution work item, but it may not write either health read model. The
-- blanket die_read SELECT above stays; these revokes make the prohibition
-- explicit rather than incidental, and survive a future blanket write grant.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON die_read.producer_current
  FROM die_maintenance;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON die_read.producer_health_component_current
  FROM die_maintenance;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON die_read.producer_current
  FROM die_api, die_ingest, die_normalizer, die_truth, die_bff;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON die_read.producer_health_component_current
  FROM die_api, die_ingest, die_normalizer, die_truth, die_bff;
-- Authoring a health policy stays with control administration; maintenance
-- reads the effective policy only to compute which producers are due.
GRANT SELECT ON die_control.producer_health_policy TO die_maintenance;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON die_control.producer_health_policy
  FROM die_maintenance, die_projector;

-- Runtime roles must not own schemas/tables and cannot bypass RLS.
ALTER ROLE die_ingest NOBYPASSRLS;
ALTER ROLE die_normalizer NOBYPASSRLS;
ALTER ROLE die_truth NOBYPASSRLS;
ALTER ROLE die_projector NOBYPASSRLS;
ALTER ROLE die_api NOBYPASSRLS;
ALTER ROLE die_bff NOBYPASSRLS;
ALTER ROLE die_maintenance NOBYPASSRLS;
ALTER ROLE die_enrollment NOBYPASSRLS;
ALTER ROLE die_verifier NOBYPASSRLS;
ALTER ROLE die_control_admin NOBYPASSRLS;
ALTER ROLE die_authz_admin NOBYPASSRLS;

GRANT EXECUTE ON FUNCTION die_authz.current_tenant_id()
  TO die_ingest, die_normalizer, die_truth, die_projector, die_api,
     die_bff, die_maintenance, die_enrollment, die_verifier,
     die_control_admin, die_authz_admin;
GRANT EXECUTE ON FUNCTION die_authz.jsonb_object_key_count(jsonb)
  TO die_ingest, die_normalizer, die_truth, die_projector, die_api,
     die_bff, die_maintenance, die_enrollment, die_verifier,
     die_control_admin, die_authz_admin;
GRANT EXECUTE ON FUNCTION die_audit.compute_audit_event_hash(die_audit.audit_event)
  TO die_ingest, die_normalizer, die_truth, die_projector, die_api,
     die_bff, die_maintenance, die_enrollment, die_verifier,
     die_control_admin, die_authz_admin;
GRANT EXECUTE ON FUNCTION die_control.record_manifest_signer_key_version()
  TO die_authz_admin;

COMMIT;

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import {
  GATE_B_CERTIFICATION_HEADER,
  GATE_B_OBLIGATION_HEADER,
} from './gate-b-certification-lib.mjs'
import { serializeCsv } from './csv-lib.mjs'
import { buildCrossSourceSensorVerticalFixture } from './sensor-vertical-test-fixtures.mjs'

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function retain(root, reference, value) {
  const full = join(root, reference)
  mkdirSync(dirname(full), { recursive: true })
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value)
  writeFileSync(full, bytes)
  return digest(bytes)
}

function obligation(profile) {
  const browser = profile === 'browser'
  return {
    obligation_id: browser ? 'GB-0123456789abcdef01234567' : 'GB-fedcba9876543210fedcba98',
    profile,
    payload_kind: browser ? 'browser.installation' : 'endpoint.entity',
    obligation_kind: 'ROUTE',
    lg008_trace_id: 'NONE',
    target_field: 'ALL_ROUTE_BEHAVIOR',
    target_required: 'YES',
    route_support_state: 'adapter_derivable',
    field_support_state: 'ROUTE',
    native_authority: `exact ${profile} native caller`,
    adapter_requirement: 'emit the exact typed route',
    production_gate: 'exact installed route certification',
    required_proof_stages: 'NATIVE_CALLER|EXACT_ARTIFACT_RUNTIME|PRIVACY|LOCAL_WAL|INGEST_RECEIPT|NORMALIZATION|CANONICAL_CONSEQUENCE|API_UI_DISPOSITION|REPLAY_DEGRADED',
  }
}

function stageAssertion(stage, value, ids) {
  const payloadDigest = `sha256:${'1'.repeat(64)}`
  const privacyDigest = `sha256:${'2'.repeat(64)}`
  const commonTarget = value.target_field
  return {
    NATIVE_CALLER: {
      caller_symbol: `${value.profile}.native.emit`, native_record_id: ids.sourceRecord,
      native_kind: value.payload_kind, payload_digest: payloadDigest,
      trace_id: value.lg008_trace_id, target_field: commonTarget, target_observed: true,
    },
    PRIVACY: {
      native_record_id: ids.sourceRecord, input_digest: payloadDigest,
      output_digest: privacyDigest, disposition: 'allowed', rule_ids: ['PRIVACY-001'],
      prohibited_field_count: 0, target_field: commonTarget,
    },
    LOCAL_WAL: {
      native_record_id: ids.sourceRecord, wal_entry_id: ids.wal, wal_sequence: 1,
      payload_digest: privacyDigest, durable_before_send: true, target_field_persisted: true,
    },
    INGEST_RECEIPT: {
      wal_entry_id: ids.wal, batch_id: ids.batch, receipt_id: ids.receipt,
      receipt_record_id: ids.sourceRecord, disposition: 'accepted', evidence_id: ids.evidence,
      target_field_admitted: true,
    },
    NORMALIZATION: {
      evidence_id: ids.evidence, normalization_run_id: ids.normalization,
      output_count: 1, output_ids: [ids.output], bundle_digest: `sha256:${'3'.repeat(64)}`,
      normalized_target_path: commonTarget,
      normalized_target_value_digest: `sha256:${'4'.repeat(64)}`,
    },
    CANONICAL_CONSEQUENCE: {
      normalization_run_id: ids.normalization, result_kind: 'entity', result_id: ids.entity,
      canonical_version: 1, lineage_id: ids.lineage, source_object_id: ids.sourceObject,
      target_field_lineage_role: 'selected',
    },
    API_UI_DISPOSITION: {
      operation_id: 'listEntities', request_id: ids.request, status_code: 200,
      response_member_id: ids.entity, response_field_path: commonTarget,
      ui_route: '/estate/inventory', browser_session_id: ids.session,
      rendered_disposition: 'rendered', authorization_revision: '2',
    },
    REPLAY_DEGRADED: {
      original_delivery_id: ids.delivery, replay_delivery_id: `${ids.delivery}-replay`,
      replay_disposition: 'duplicate', entity_delta: 0, claim_delta: 0,
      relationship_delta: 0, activity_delta: 0, outbox_delta: 0,
      degraded_case: 'worker_restart_after_durable_commit', degraded_state_visible: true,
    },
  }[stage]
}

function certification(root, runtime, runtimeDigest, sensorRow, value) {
  const producer = runtime.producers.find(item => item.profile === value.profile)
  const ids = {
    sourceRecord: `${value.profile}-record-1`, wal: `${value.profile}-wal-1`,
    batch: `${value.profile}-batch-1`, receipt: `${value.profile}-receipt-1`,
    evidence: `${value.profile}-evidence-1`, normalization: `${value.profile}-normalization-1`,
    output: `${value.profile}-output-1`, entity: `${value.profile}-entity-1`,
    lineage: `${value.profile}-lineage-1`, sourceObject: `${value.profile}-source-object-1`,
    request: `${value.profile}-request-1`, session: `${value.profile}-session-1`,
    delivery: `${value.profile}-delivery-1`,
  }
  const row = Object.fromEntries(GATE_B_CERTIFICATION_HEADER.map(field => [field, 'NONE']))
  Object.assign(row, value, {
    profile_gate_state: 'COMPLETE', outcome: 'CERTIFIED',
    authority_commit: runtime.authority_commit, source_commit: sensorRow.source_commit,
    artifact_digest: sensorRow.installed_artifact_digest,
    runtime_manifest_ref: 'runtime/shared.json', runtime_manifest_digest: runtimeDigest,
    next_action: 'NONE',
  })
  const stages = [
    ['native_caller', 'NATIVE_CALLER'], ['privacy', 'PRIVACY'], ['wal', 'LOCAL_WAL'],
    ['receipt', 'INGEST_RECEIPT'], ['normalization', 'NORMALIZATION'],
    ['canonical', 'CANONICAL_CONSEQUENCE'], ['api_ui', 'API_UI_DISPOSITION'],
    ['replay_degraded', 'REPLAY_DEGRADED'],
  ]
  let predecessorDigest = 'NONE'
  for (const [field, stage] of stages) {
    const assertion = stageAssertion(stage, value, ids)
    const commandArgv = ['gate-b-execution-harness', '--stage', stage, '--obligation', value.obligation_id]
    const raw = {
      schema: 'die.gate-b-raw-execution.v1', obligation_id: value.obligation_id,
      evidence_stage: stage, integration_run_id: 'run-cross-source-001',
      command_argv: commandArgv, exit_code: 0, observations: assertion,
    }
    const rawRef = `evidence/gate-b/${value.profile}/raw/${stage.toLowerCase()}.json`
    const rawDigest = retain(root, rawRef, `${JSON.stringify(raw)}\n`)
    const proof = {
      schema: 'die.gate-b-stage-evidence.v1', obligation_id: value.obligation_id,
      profile: value.profile, payload_kind: value.payload_kind,
      obligation_kind: value.obligation_kind, lg008_trace_id: value.lg008_trace_id,
      target_field: value.target_field, evidence_stage: stage,
      observed_at: '2026-08-05T02:00:00Z', authority_commit: row.authority_commit,
      source_commit: row.source_commit, artifact_digest: row.artifact_digest,
      runtime_manifest_id: runtime.manifest_id, runtime_manifest_digest: runtimeDigest,
      integration_run_id: 'run-cross-source-001', logical_tenant_id: '442e052d-4c60-4cdc-961e-bc9db74a40ca',
      producer_id: producer.producer_id, installation_id: producer.installation_id,
      source_record_id: ids.sourceRecord, predecessor_digest: predecessorDigest,
      command_argv: commandArgv, exit_code: 0, raw_artifact_ref: rawRef,
      raw_artifact_digest: rawDigest, assertion,
    }
    const proofRef = `evidence/gate-b/${value.profile}/proof/${stage.toLowerCase()}.json`
    const proofDigest = retain(root, proofRef, `${JSON.stringify(proof)}\n`)
    row[`${field}_ref`] = proofRef
    row[`${field}_digest`] = proofDigest
    predecessorDigest = proofDigest
  }
  return row
}

export function buildGateBTestFixture(profiles = ['browser']) {
  const sensor = buildCrossSourceSensorVerticalFixture()
  const obligations = profiles.map(obligation)
  const sensorByProfile = new Map([
    ['browser', sensor.browserRow], ['endpoint', sensor.endpointRow],
  ])
  const rows = obligations.map(value => certification(
    sensor.root, sensor.runtime, sensor.runtimeDigest, sensorByProfile.get(value.profile), value,
  ))
  return {
    ...sensor,
    obligations,
    catalogText: serializeCsv([
      GATE_B_OBLIGATION_HEADER,
      ...obligations.map(value => GATE_B_OBLIGATION_HEADER.map(field => value[field])),
    ]),
    certificationRows: rows,
    certificationText: serializeCsv([
      GATE_B_CERTIFICATION_HEADER,
      ...rows.map(value => GATE_B_CERTIFICATION_HEADER.map(field => value[field])),
    ]),
  }
}

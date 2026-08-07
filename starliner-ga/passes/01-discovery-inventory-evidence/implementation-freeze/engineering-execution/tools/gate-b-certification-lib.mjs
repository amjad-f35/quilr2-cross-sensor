import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseCsv, serializeCsv } from './csv-lib.mjs'
import {
  parseRuntimeManifest,
  validateRuntimeManifestFile,
} from './validate-runtime-manifest.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const YAML_DECISION_REGISTER = 'starliner-ga/passes/01-discovery-inventory-evidence/registers/decisions.yaml'

export const GATE_B_OBLIGATION_HEADER = [
  'obligation_id', 'profile', 'payload_kind', 'obligation_kind',
  'lg008_trace_id', 'target_field', 'target_required', 'route_support_state',
  'field_support_state', 'native_authority', 'adapter_requirement',
  'production_gate', 'required_proof_stages',
]

export const GATE_B_CERTIFICATION_HEADER = [
  'obligation_id', 'profile', 'payload_kind', 'obligation_kind',
  'lg008_trace_id', 'target_field', 'profile_gate_state', 'outcome',
  'authority_commit', 'source_commit', 'artifact_digest', 'runtime_manifest_ref',
  'runtime_manifest_digest', 'native_caller_ref', 'native_caller_digest',
  'privacy_ref', 'privacy_digest', 'wal_ref', 'wal_digest', 'receipt_ref',
  'receipt_digest', 'normalization_ref', 'normalization_digest',
  'canonical_ref', 'canonical_digest', 'api_ui_ref', 'api_ui_digest',
  'replay_degraded_ref', 'replay_degraded_digest', 'change_control_id',
  'change_control_ref', 'change_control_digest', 'blocker_class',
  'blocker_ref', 'blocker_digest', 'unblock_condition', 'next_action',
]

export const REQUIRED_PROOF_STAGES = [
  'NATIVE_CALLER', 'EXACT_ARTIFACT_RUNTIME', 'PRIVACY', 'LOCAL_WAL',
  'INGEST_RECEIPT', 'NORMALIZATION', 'CANONICAL_CONSEQUENCE',
  'API_UI_DISPOSITION', 'REPLAY_DEGRADED',
]

const PROFILE_ORDER = new Map([
  ['endpoint', 0],
  ['browser', 1],
  ['browser_backend', 2],
  ['llm_gateway', 3],
  ['mcp_gateway', 4],
])
const ROUTE_SUPPORT = new Set(['adapter_derivable', 'new_capture_required'])
const FIELD_SUPPORT = new Set([
  'SOURCE_SUPPORTED', 'ADAPTER_SOURCE_ID', 'EDGE_RUNTIME_OR_ADAPTER_ENVELOPE',
  'CONTRACT_BOUNDED_DERIVATION', 'NEW_CAPTURE_REQUIRED_BY_FROZEN_CONTRACT',
])
const OUTCOMES = new Set([
  'PENDING_IMPLEMENTATION', 'CERTIFIED', 'APPROVED_UNSUPPORTED', 'EXTERNAL_BLOCKED',
])
const GATE_STATES = new Set(['OPEN', 'COMPLETE'])
const BLOCKERS = new Set([
  'EXTERNAL_CREDENTIAL', 'EXTERNAL_INFRASTRUCTURE', 'PRIVILEGED_USER_ACTION',
  'DESTRUCTIVE_APPROVAL',
])
const DIGEST = /^sha256:[0-9a-f]{64}$/
const SHA = /^[0-9a-f]{40}$/
const SAFE_REF = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9_.\/-]+$/
const FORBIDDEN_EVIDENCE_REF = /(?:^|[\/_.-])(?:fixture|mock|preview|manual|synthetic|hotfix|tmp)(?:[\/_.-]|$)/i
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

const TRACE_PARENT = new Map([
  ['browser:installation', 'browser.installation'],
  ['browser:device', 'browser.device'],
  ['browser:application', 'browser.application'],
  ['browser:accountContext', 'browser.account_context'],
  ['browser:relationship', 'browser.relationship'],
  ['browser:localBinding', 'browser.local_binding'],
  ['browser:bindingSignature', 'browser.local_binding'],
  ['browser:endpointDeviceRef', 'browser.local_binding'],
  ['browser:endpointIdentityRef', 'browser.local_binding'],
  ['browser:activity', 'browser.activity'],
  ['browser:upload', 'browser.upload'],
  ['browser:nativeOutcome', 'browser.native_outcome'],
  ['browser:snapshot', 'browser.snapshot'],
  ['browser:health', 'browser.health'],
  ['browser:gap', 'browser.gap'],
  ['browser_backend:application_catalog', 'application_catalog'],
  ['browser_backend:application_configuration', 'application_configuration'],
  ['browser_backend:browser_event', 'browser_event'],
  ['browser_backend:native_decision', 'native_decision'],
  ['browser_backend:action_outcome', 'action_outcome'],
  ['browser_backend:installation', 'installation'],
  ['browser_backend:heartbeat', 'heartbeat'],
  ['browser_backend:publication_gap', 'publication_gap'],
  ['browser_backend:reconciliation_snapshot', 'reconciliation_snapshot'],
  ['endpoint:entity', 'endpoint.entity'],
  ['endpoint:relationship', 'endpoint.relationship'],
  ['endpoint:activity', 'endpoint.activity'],
  ['endpoint:nativeDecision', 'endpoint.native_decision'],
  ['endpoint:nativeEffect', 'endpoint.native_effect'],
  ['endpoint:snapshot', 'endpoint.snapshot'],
  ['endpoint:health', 'endpoint.health'],
  ['endpoint:gap', 'endpoint.gap'],
  ['llm_gateway:entity', 'llm.entity'],
  ['llm_gateway:relationship', 'llm.relationship'],
  ['llm_gateway:crossSensorAttribution', 'llm.relationship'],
  ['llm_gateway:attributionSignature', 'llm.relationship'],
  ['llm_gateway:invocation', 'llm.invocation'],
  ['llm_gateway:nativeDecision', 'llm.native_decision'],
  ['llm_gateway:nativeEffect', 'llm.native_effect'],
  ['llm_gateway:snapshot', 'llm.snapshot'],
  ['llm_gateway:health', 'llm.health'],
  ['llm_gateway:gap', 'llm.gap'],
  ['mcp_gateway:entity', 'mcp.entity'],
  ['mcp_gateway:relationship', 'mcp.relationship'],
  ['mcp_gateway:crossSensorAttribution', 'mcp.relationship'],
  ['mcp_gateway:attributionSignature', 'mcp.relationship'],
  ['mcp_gateway:toolCall', 'mcp.tool_call'],
  ['mcp_gateway:operation', 'mcp.operation'],
  ['mcp_gateway:rejection', 'mcp.rejection'],
  ['mcp_gateway:nativeDecision', 'mcp.native_decision'],
  ['mcp_gateway:nativeEffect', 'mcp.native_effect'],
  ['mcp_gateway:snapshot', 'mcp.snapshot'],
  ['mcp_gateway:health', 'mcp.health'],
  ['mcp_gateway:gap', 'mcp.gap'],
])

function objects(text, label) {
  const rows = parseCsv(text, label)
  const header = rows[0]
  return rows.slice(1).map(row => Object.fromEntries(header.map((key, index) => [key, row[index]])))
}

function profileName(value) {
  return value.replaceAll('-', '_')
}

function obligationId(profile, payloadKind, kind, traceId = 'route') {
  const hash = createHash('sha256')
    .update(`${profile}\0${payloadKind}\0${kind}\0${traceId}`)
    .digest('hex')
    .slice(0, 24)
  return `GB-${hash}`
}

export function buildGateBObligations(profileDispositionText, targetTraceText) {
  const dispositions = objects(profileDispositionText, 'profile-capability-disposition.csv')
  const traces = objects(targetTraceText, 'target-field-traceability.csv')
  const errors = []
  const routes = new Map()
  const obligations = []
  for (const [index, route] of dispositions.entries()) {
    if (!ROUTE_SUPPORT.has(route.support_state)) {
      errors.push(`profile disposition row ${index + 2} has non-launch support state ${route.support_state}`)
      continue
    }
    const key = `${route.profile}:${route.payload_kind}`
    if (routes.has(key)) {
      errors.push(`duplicate Gate-B route ${key}`)
      continue
    }
    routes.set(key, { ...route, ordinal: index })
    obligations.push({
      obligation_id: obligationId(route.profile, route.payload_kind, 'ROUTE'),
      profile: route.profile,
      payload_kind: route.payload_kind,
      obligation_kind: 'ROUTE',
      lg008_trace_id: 'NONE',
      target_field: 'ALL_ROUTE_BEHAVIOR',
      target_required: 'YES',
      route_support_state: route.support_state,
      field_support_state: 'ROUTE',
      native_authority: route.native_evidence,
      adapter_requirement: route.adapter_requirement,
      production_gate: route.production_gate,
      required_proof_stages: REQUIRED_PROOF_STAGES.join('|'),
      ordinal: index,
    })
  }

  const seenRequiredTraces = new Set()
  for (const [index, trace] of traces.entries()) {
    if (trace.required !== 'YES')
      continue
    const profile = profileName(trace.profile)
    const parent = TRACE_PARENT.get(`${profile}:${trace.payload_kind}`)
    if (!parent) {
      errors.push(`required LG-008 trace ${trace.trace_id} has no closed Gate-B parent mapping`)
      continue
    }
    const route = routes.get(`${profile}:${parent}`)
    if (!route) {
      errors.push(`required LG-008 trace ${trace.trace_id} maps to absent route ${profile}:${parent}`)
      continue
    }
    if (!FIELD_SUPPORT.has(trace.support_state)) {
      errors.push(`required LG-008 trace ${trace.trace_id} has non-launch support state ${trace.support_state}`)
      continue
    }
    if (seenRequiredTraces.has(trace.trace_id)) {
      errors.push(`required LG-008 trace ${trace.trace_id} is duplicated`)
      continue
    }
    seenRequiredTraces.add(trace.trace_id)
    obligations.push({
      obligation_id: obligationId(profile, parent, 'FIELD', trace.trace_id),
      profile,
      payload_kind: parent,
      obligation_kind: 'FIELD',
      lg008_trace_id: trace.trace_id,
      target_field: trace.target_field,
      target_required: 'YES',
      route_support_state: route.support_state,
      field_support_state: trace.support_state,
      native_authority: trace.evidence || route.native_evidence,
      adapter_requirement: trace.derivation,
      production_gate: route.production_gate,
      required_proof_stages: REQUIRED_PROOF_STAGES.join('|'),
      ordinal: route.ordinal,
    })
  }
  const requiredCount = traces.filter(trace => trace.required === 'YES').length
  if (seenRequiredTraces.size !== requiredCount)
    errors.push(`Gate-B catalog covers ${seenRequiredTraces.size}/${requiredCount} required LG-008 traces`)
  if (errors.length)
    throw new Error(errors.join('\n'))

  obligations.sort((left, right) =>
    (PROFILE_ORDER.get(left.profile) - PROFILE_ORDER.get(right.profile))
    || (left.ordinal - right.ordinal)
    || (left.obligation_kind === right.obligation_kind ? 0 : left.obligation_kind === 'ROUTE' ? -1 : 1)
    || left.lg008_trace_id.localeCompare(right.lg008_trace_id))
  return obligations.map(({ ordinal: _ordinal, ...obligation }) => obligation)
}

export function serializeGateBObligations(obligations) {
  return serializeCsv([
    GATE_B_OBLIGATION_HEADER,
    ...obligations.map(value => GATE_B_OBLIGATION_HEADER.map(field => value[field])),
  ])
}

export function initializeGateBCertification(obligations) {
  return serializeCsv([
    GATE_B_CERTIFICATION_HEADER,
    ...obligations.map(obligation => GATE_B_CERTIFICATION_HEADER.map(field => ({
      ...obligation,
      profile_gate_state: 'OPEN',
      outcome: 'PENDING_IMPLEMENTATION',
      authority_commit: 'NONE',
      source_commit: 'NONE',
      artifact_digest: 'NONE',
      runtime_manifest_ref: 'NONE', runtime_manifest_digest: 'NONE',
      native_caller_ref: 'NONE', native_caller_digest: 'NONE',
      privacy_ref: 'NONE', privacy_digest: 'NONE',
      wal_ref: 'NONE', wal_digest: 'NONE',
      receipt_ref: 'NONE', receipt_digest: 'NONE',
      normalization_ref: 'NONE', normalization_digest: 'NONE',
      canonical_ref: 'NONE', canonical_digest: 'NONE',
      api_ui_ref: 'NONE', api_ui_digest: 'NONE',
      replay_degraded_ref: 'NONE', replay_degraded_digest: 'NONE',
      change_control_id: 'NONE', change_control_ref: 'NONE', change_control_digest: 'NONE',
      blocker_class: 'NONE', blocker_ref: 'NONE', blocker_digest: 'NONE',
      unblock_condition: 'NONE',
      next_action: obligation.production_gate,
    })[field])),
  ])
}

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function retained(reference, expected, evidenceRoot, label, errors) {
  if (!SAFE_REF.test(reference || '') || FORBIDDEN_EVIDENCE_REF.test(reference || '') || !DIGEST.test(expected || '')) {
    errors.push(`${label} must be a safe evidence-root-relative ref plus SHA-256 digest`)
    return null
  }
  if (!evidenceRoot) {
    errors.push(`${label} cannot be verified without an evidence root`)
    return null
  }
  try {
    const root = realpathSync(evidenceRoot)
    const candidate = resolve(root, reference)
    if (!existsSync(candidate)) {
      errors.push(`${label} does not exist: ${reference}`)
      return null
    }
    const real = realpathSync(candidate)
    const fromRoot = relative(root, real)
    if (fromRoot.startsWith('..') || isAbsolute(fromRoot) || !statSync(real).isFile()) {
      errors.push(`${label} escapes the evidence root or is not a file`)
      return null
    }
    const bytes = readFileSync(real)
    const observed = digest(bytes)
    if (observed !== expected)
      errors.push(`${label} digest mismatch: expected ${expected}; observed ${observed}`)
    return observed === expected ? { bytes, path: real } : null
  }
  catch (error) {
    errors.push(`${label} cannot be resolved: ${error.message}`)
    return null
  }
}

const PROOF_PAIRS = [
  ['runtime_manifest_ref', 'runtime_manifest_digest', 'EXACT_ARTIFACT_RUNTIME'],
  ['native_caller_ref', 'native_caller_digest', 'NATIVE_CALLER'],
  ['privacy_ref', 'privacy_digest', 'PRIVACY'],
  ['wal_ref', 'wal_digest', 'LOCAL_WAL'],
  ['receipt_ref', 'receipt_digest', 'INGEST_RECEIPT'],
  ['normalization_ref', 'normalization_digest', 'NORMALIZATION'],
  ['canonical_ref', 'canonical_digest', 'CANONICAL_CONSEQUENCE'],
  ['api_ui_ref', 'api_ui_digest', 'API_UI_DISPOSITION'],
  ['replay_degraded_ref', 'replay_degraded_digest', 'REPLAY_DEGRADED'],
]

const STAGE_PROOF_KEYS = [
  'schema', 'obligation_id', 'profile', 'payload_kind', 'obligation_kind',
  'lg008_trace_id', 'target_field', 'evidence_stage', 'observed_at',
  'authority_commit', 'source_commit', 'artifact_digest', 'runtime_manifest_id',
  'runtime_manifest_digest', 'integration_run_id', 'logical_tenant_id',
  'producer_id', 'installation_id', 'source_record_id', 'predecessor_digest',
  'command_argv', 'exit_code', 'raw_artifact_ref', 'raw_artifact_digest',
  'assertion',
]

const RAW_EXECUTION_KEYS = [
  'schema', 'obligation_id', 'evidence_stage', 'integration_run_id',
  'command_argv', 'exit_code', 'observations',
]

const ASSERTION_KEYS = new Map([
  ['NATIVE_CALLER', [
    'caller_symbol', 'native_record_id', 'native_kind', 'payload_digest',
    'trace_id', 'target_field', 'target_observed',
  ]],
  ['PRIVACY', [
    'native_record_id', 'input_digest', 'output_digest', 'disposition',
    'rule_ids', 'prohibited_field_count', 'target_field',
  ]],
  ['LOCAL_WAL', [
    'native_record_id', 'wal_entry_id', 'wal_sequence', 'payload_digest',
    'durable_before_send', 'target_field_persisted',
  ]],
  ['INGEST_RECEIPT', [
    'wal_entry_id', 'batch_id', 'receipt_id', 'receipt_record_id',
    'disposition', 'evidence_id', 'target_field_admitted',
  ]],
  ['NORMALIZATION', [
    'evidence_id', 'normalization_run_id', 'output_count', 'output_ids',
    'bundle_digest', 'normalized_target_path', 'normalized_target_value_digest',
  ]],
  ['CANONICAL_CONSEQUENCE', [
    'normalization_run_id', 'result_kind', 'result_id', 'canonical_version',
    'lineage_id', 'source_object_id', 'target_field_lineage_role',
  ]],
  ['API_UI_DISPOSITION', [
    'operation_id', 'request_id', 'status_code', 'response_member_id',
    'response_field_path', 'ui_route', 'browser_session_id',
    'rendered_disposition', 'authorization_revision',
  ]],
  ['REPLAY_DEGRADED', [
    'original_delivery_id', 'replay_delivery_id', 'replay_disposition',
    'entity_delta', 'claim_delta', 'relationship_delta', 'activity_delta',
    'outbox_delta', 'degraded_case', 'degraded_state_visible',
  ]],
])

function jsonObject(bytes, label, errors) {
  if (!bytes)
    return null
  try {
    const value = JSON.parse(bytes.toString('utf8'))
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      errors.push(`${label} must be one JSON object`)
      return null
    }
    return value
  }
  catch (error) {
    errors.push(`${label} is not JSON: ${error.message}`)
    return null
  }
}

function exactKeys(value, expected, label, errors) {
  if (!value || Array.isArray(value) || typeof value !== 'object'
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) {
    errors.push(`${label} keys must be exactly the frozen contract`)
  }
}

function nonPlaceholder(value) {
  return typeof value === 'string' && value.length > 0 && value !== 'NONE'
}

function canonicalJson(value) {
  if (Array.isArray(value))
    return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object')
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function validateAssertion(assertion, value, stage, label, state, errors) {
  exactKeys(assertion, ASSERTION_KEYS.get(stage) || [], `${label}.assertion`, errors)
  if (!assertion || Array.isArray(assertion) || typeof assertion !== 'object')
    return
  const strings = Object.entries(assertion)
    .filter(([, item]) => typeof item === 'string')
  for (const [field, item] of strings) {
    if (field === 'trace_id' && value.obligation_kind === 'ROUTE' && item === 'NONE')
      continue
    if (!nonPlaceholder(item))
      errors.push(`${label}.assertion.${field} must be a non-placeholder execution value`)
  }
  if (stage === 'NATIVE_CALLER') {
    if (assertion.native_kind !== value.payload_kind)
      errors.push(`${label}.assertion.native_kind must equal the obligated payload kind`)
    if (assertion.trace_id !== value.lg008_trace_id || assertion.target_field !== value.target_field)
      errors.push(`${label}.assertion must bind the exact route/field obligation`)
    if (assertion.target_observed !== true || !DIGEST.test(assertion.payload_digest || ''))
      errors.push(`${label}.assertion must prove the target and content-address the native payload`)
    state.nativeRecordId = assertion.native_record_id
    state.nativePayloadDigest = assertion.payload_digest
  }
  else if (stage === 'PRIVACY') {
    if (assertion.native_record_id !== state.nativeRecordId
      || assertion.input_digest !== state.nativePayloadDigest
      || !DIGEST.test(assertion.output_digest || '')) {
      errors.push(`${label}.assertion does not carry the native record through privacy disposition`)
    }
    if (!['allowed', 'redacted', 'metadata_only'].includes(assertion.disposition)
      || !Array.isArray(assertion.rule_ids) || !assertion.rule_ids.length
      || !Number.isInteger(assertion.prohibited_field_count) || assertion.prohibited_field_count < 0
      || assertion.target_field !== value.target_field) {
      errors.push(`${label}.assertion has an invalid privacy disposition`)
    }
    state.privacyOutputDigest = assertion.output_digest
  }
  else if (stage === 'LOCAL_WAL') {
    if (assertion.native_record_id !== state.nativeRecordId
      || assertion.payload_digest !== state.privacyOutputDigest
      || assertion.durable_before_send !== true || assertion.target_field_persisted !== true
      || !Number.isInteger(assertion.wal_sequence) || assertion.wal_sequence < 0) {
      errors.push(`${label}.assertion does not prove durable pre-send WAL persistence`)
    }
    state.walEntryId = assertion.wal_entry_id
  }
  else if (stage === 'INGEST_RECEIPT') {
    if (assertion.wal_entry_id !== state.walEntryId || assertion.disposition !== 'accepted'
      || assertion.target_field_admitted !== true) {
      errors.push(`${label}.assertion does not prove an accepted receipt for the WAL entry`)
    }
    state.evidenceId = assertion.evidence_id
  }
  else if (stage === 'NORMALIZATION') {
    if (assertion.evidence_id !== state.evidenceId || !Number.isInteger(assertion.output_count)
      || assertion.output_count < 1 || !Array.isArray(assertion.output_ids)
      || assertion.output_ids.length !== assertion.output_count
      || new Set(assertion.output_ids).size !== assertion.output_ids.length
      || !DIGEST.test(assertion.bundle_digest || '')
      || assertion.normalized_target_path !== value.target_field
      || !DIGEST.test(assertion.normalized_target_value_digest || '')) {
      errors.push(`${label}.assertion does not prove the exact normalized obligation output`)
    }
    state.normalizationRunId = assertion.normalization_run_id
  }
  else if (stage === 'CANONICAL_CONSEQUENCE') {
    if (assertion.normalization_run_id !== state.normalizationRunId
      || !['entity', 'relationship', 'activity', 'coverage'].includes(assertion.result_kind)
      || !/^[1-9][0-9]*$/.test(String(assertion.canonical_version))
      || !['selected', 'supporting', 'structural', 'observed'].includes(assertion.target_field_lineage_role)) {
      errors.push(`${label}.assertion does not prove a lineage-bound canonical consequence`)
    }
    state.canonicalResultId = assertion.result_id
  }
  else if (stage === 'API_UI_DISPOSITION') {
    if (assertion.status_code !== 200 || assertion.response_member_id !== state.canonicalResultId
      || assertion.response_field_path !== value.target_field
      || !['rendered', 'withheld', 'not_applicable'].includes(assertion.rendered_disposition)
      || !assertion.ui_route.startsWith('/')) {
      errors.push(`${label}.assertion does not prove the authorized API-to-UI disposition`)
    }
  }
  else if (stage === 'REPLAY_DEGRADED') {
    if (assertion.original_delivery_id === assertion.replay_delivery_id
      || !['duplicate', 'idempotent_replay'].includes(assertion.replay_disposition)
      || ['entity_delta', 'claim_delta', 'relationship_delta', 'activity_delta', 'outbox_delta']
        .some(field => assertion[field] !== 0)
      || assertion.degraded_state_visible !== true) {
      errors.push(`${label}.assertion does not prove idempotent replay plus visible degraded behavior`)
    }
  }
}

function validateStageProof(retainedProof, value, stage, label, proofDigest, state, evidenceRoot, errors) {
  const proof = jsonObject(retainedProof?.bytes, label, errors)
  if (!proof)
    return
  exactKeys(proof, STAGE_PROOF_KEYS, label, errors)
  const expected = {
    schema: 'die.gate-b-stage-evidence.v1',
    obligation_id: value.obligation_id,
    profile: value.profile,
    payload_kind: value.payload_kind,
    obligation_kind: value.obligation_kind,
    lg008_trace_id: value.lg008_trace_id,
    target_field: value.target_field,
    evidence_stage: stage,
    authority_commit: value.authority_commit,
    source_commit: value.source_commit,
    artifact_digest: value.artifact_digest,
    runtime_manifest_digest: value.runtime_manifest_digest,
  }
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (proof[field] !== expectedValue)
      errors.push(`${label}.${field} must be ${expectedValue}`)
  }
  if (!RFC3339.test(proof.observed_at || '') || Number.isNaN(Date.parse(proof.observed_at)))
    errors.push(`${label}.observed_at must be RFC3339`)
  for (const field of ['integration_run_id', 'logical_tenant_id', 'producer_id', 'installation_id', 'source_record_id', 'runtime_manifest_id']) {
    if (!proof[field] || proof[field] === 'NONE' || typeof proof[field] !== 'string')
      errors.push(`${label}.${field} must identify the continuous exact-product run`)
    if (state.common && proof[field] !== state.common[field])
      errors.push(`${label}.${field} does not match the other proof stages for this obligation`)
  }
  if (state.runtime) {
    for (const field of ['producer_id', 'installation_id', 'runtime_manifest_id']) {
      if (proof[field] !== state.runtime[field])
        errors.push(`${label}.${field} does not match the validated runtime manifest`)
    }
  }
  if (proof.predecessor_digest !== state.predecessorDigest)
    errors.push(`${label}.predecessor_digest does not bind the preceding proof stage`)
  if (!Array.isArray(proof.command_argv) || !proof.command_argv.length
    || proof.command_argv.some(item => !nonPlaceholder(item)) || proof.exit_code !== 0) {
    errors.push(`${label} must bind a successful non-placeholder execution command`)
  }
  const raw = retained(
    proof.raw_artifact_ref,
    proof.raw_artifact_digest,
    evidenceRoot,
    `${label}.raw_artifact_ref`,
    errors,
  )
  if (raw?.path === retainedProof.path)
    errors.push(`${label} cannot use its own proof JSON as the raw execution artifact`)
  const rawValue = jsonObject(raw?.bytes, `${label}.raw_artifact_ref`, errors)
  if (rawValue) {
    exactKeys(rawValue, RAW_EXECUTION_KEYS, `${label}.raw_artifact_ref`, errors)
    const rawExpected = {
      schema: 'die.gate-b-raw-execution.v1', obligation_id: value.obligation_id,
      evidence_stage: stage, integration_run_id: proof.integration_run_id,
      exit_code: proof.exit_code,
    }
    for (const [field, expectedValue] of Object.entries(rawExpected)) {
      if (rawValue[field] !== expectedValue)
        errors.push(`${label}.raw_artifact_ref.${field} must be ${expectedValue}`)
    }
    if (canonicalJson(rawValue.command_argv) !== canonicalJson(proof.command_argv)
      || canonicalJson(rawValue.observations) !== canonicalJson(proof.assertion)) {
      errors.push(`${label}.raw_artifact_ref must independently contain the command and typed observations`)
    }
  }
  validateAssertion(proof.assertion, value, stage, label, state, errors)
  state.common ||= Object.fromEntries(
    ['integration_run_id', 'logical_tenant_id', 'producer_id', 'installation_id', 'source_record_id', 'runtime_manifest_id']
      .map(field => [field, proof[field]]),
  )
  state.predecessorDigest = proofDigest
}

function parseYamlBytes(bytes, python, label, errors) {
  const script = [
    'import json,sys,yaml',
    'class L(yaml.SafeLoader): pass',
    'def m(loader,node,deep=False):',
    ' loader.flatten_mapping(node); out={}',
    ' for k,v in node.value:',
    '  key=loader.construct_object(k,deep=deep)',
    '  if key in out: raise ValueError(f"duplicate YAML mapping key: {key}")',
    '  out[key]=loader.construct_object(v,deep=deep)',
    ' return out',
    'L.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,m)',
    'json.dump(yaml.load(sys.stdin.read(),Loader=L),sys.stdout,separators=(",",":"),sort_keys=True)',
  ].join('\n')
  const result = spawnSync(python, ['-c', script], { input: bytes, encoding: 'utf8' })
  if (result.status !== 0) {
    errors.push(`${label} cannot be parsed with duplicate-key-safe YAML: ${(result.stderr || result.stdout).trim()}`)
    return null
  }
  try {
    return JSON.parse(result.stdout)
  }
  catch (error) {
    errors.push(`${label} parser returned invalid JSON: ${error.message}`)
    return null
  }
}

function loadAuthorityDecisions(options, label, errors) {
  const repo = options?.authorityRepo
  const commit = options?.authorityCommit
  const python = options?.python || process.env.DIE_VALIDATOR_PYTHON || 'python3'
  if (!repo || !SHA.test(commit || '')) {
    errors.push(`${label} requires an authority repository and exact committed authority SHA`)
    return null
  }
  const result = spawnSync(
    'git', ['-C', repo, 'show', `${commit}:${YAML_DECISION_REGISTER}`],
    { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024 },
  )
  if (result.status !== 0) {
    errors.push(`${label} cannot load ${YAML_DECISION_REGISTER} from authority commit ${commit}`)
    return null
  }
  const document = parseYamlBytes(result.stdout, python, `${label}.decision_register`, errors)
  if (!document || !Array.isArray(document.decisions)) {
    errors.push(`${label}.decision_register must contain a decisions array`)
    return null
  }
  return document.decisions
}

function validateChangeControl(retainedProof, value, label, authority, errors) {
  const proof = jsonObject(retainedProof?.bytes, label, errors)
  if (!proof)
    return
  const keys = [
    'schema', 'change_control_id', 'obligation_id', 'profile', 'payload_kind',
    'decision', 'rationale', 'approved_at', 'approved_by', 'authority_commit',
  ]
  if (JSON.stringify(Object.keys(proof).sort()) !== JSON.stringify(keys.sort()))
    errors.push(`${label} keys must be exactly the frozen Gate-B change-control contract`)
  const expected = {
    schema: 'die.gate-b-change-control.v1',
    change_control_id: value.change_control_id,
    obligation_id: value.obligation_id,
    profile: value.profile,
    payload_kind: value.payload_kind,
    decision: 'APPROVED_UNSUPPORTED',
  }
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (proof[field] !== expectedValue)
      errors.push(`${label}.${field} must be ${expectedValue}`)
  }
  if (proof.authority_commit !== value.authority_commit
    || proof.authority_commit !== authority?.authorityCommit) {
    errors.push(`${label}.authority_commit must equal the caller-supplied current authority commit`)
  }
  if (!RFC3339.test(proof.approved_at || '') || Number.isNaN(Date.parse(proof.approved_at)))
    errors.push(`${label}.approved_at must be RFC3339`)
  for (const field of ['rationale', 'approved_by']) {
    if (!proof[field] || proof[field] === 'NONE' || typeof proof[field] !== 'string')
      errors.push(`${label}.${field} is required`)
  }
  const decisions = loadAuthorityDecisions(authority, label, errors)
  if (!decisions)
    return
  const bindings = decisions.filter(decision => decision?.status === 'accepted'
    && decision?.gate_b_disposition === 'APPROVED_UNSUPPORTED'
    && Array.isArray(decision.gate_b_obligation_ids)
    && decision.gate_b_obligation_ids.includes(value.obligation_id))
  if (bindings.length !== 1)
    errors.push(`${label} obligation must have exactly one accepted APPROVED_UNSUPPORTED authority decision`)
  if (bindings.length === 1 && bindings[0].id !== value.change_control_id)
    errors.push(`${label}.change_control_id must name the accepted decision bound to this obligation`)
  const selected = decisions.find(decision => decision?.id === value.change_control_id)
  if (!selected || selected.status !== 'accepted'
    || selected.gate_b_disposition !== 'APPROVED_UNSUPPORTED'
    || !Array.isArray(selected.gate_b_obligation_ids)
    || !selected.gate_b_obligation_ids.includes(value.obligation_id)) {
    errors.push(`${label}.change_control_id is not an accepted exact-obligation Gate-B authority decision`)
  }
}

function validateBlocker(retainedProof, value, label, errors) {
  const proof = jsonObject(retainedProof?.bytes, label, errors)
  if (!proof)
    return
  const keys = [
    'schema', 'obligation_id', 'profile', 'payload_kind', 'blocker_class',
    'blocked_action', 'blocker_owner', 'unblock_condition', 'observed_at',
  ]
  if (JSON.stringify(Object.keys(proof).sort()) !== JSON.stringify(keys.sort()))
    errors.push(`${label} keys must be exactly the frozen Gate-B blocker contract`)
  const expected = {
    schema: 'die.gate-b-blocker.v1',
    obligation_id: value.obligation_id,
    profile: value.profile,
    payload_kind: value.payload_kind,
    blocker_class: value.blocker_class,
    unblock_condition: value.unblock_condition,
  }
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (proof[field] !== expectedValue)
      errors.push(`${label}.${field} must be ${expectedValue}`)
  }
  if (!RFC3339.test(proof.observed_at || '') || Number.isNaN(Date.parse(proof.observed_at)))
    errors.push(`${label}.observed_at must be RFC3339`)
  for (const field of ['blocked_action', 'blocker_owner']) {
    if (!proof[field] || proof[field] === 'NONE' || typeof proof[field] !== 'string')
      errors.push(`${label}.${field} is required`)
  }
}

function validateRuntimeBinding(retainedManifest, value, evidenceRoot, label, errors) {
  if (!retainedManifest)
    return null
  const python = process.env.DIE_VALIDATOR_PYTHON || 'python3'
  try {
    const runtimeErrors = validateRuntimeManifestFile(retainedManifest.path, python, evidenceRoot)
    errors.push(...runtimeErrors.map(error => `${label}: ${error}`))
  }
  catch (error) {
    errors.push(`${label} cannot be parsed or validated: ${error.message}`)
    return null
  }
  let manifest
  try {
    manifest = parseRuntimeManifest(retainedManifest.path, python)
  }
  catch (error) {
    errors.push(`${label} cannot be parsed: ${error.message}`)
    return null
  }
  if (manifest.authority_commit !== value.authority_commit)
    errors.push(`${label}.authority_commit does not match the certification row`)
  const producers = (manifest.producers || []).filter(producer => producer.profile === value.profile)
  if (producers.length !== 1) {
    errors.push(`${label} must contain exactly one producer for ${value.profile}`)
    return null
  }
  const producer = producers[0]
  const componentIds = new Set(producer.component_ids || [producer.component_id])
  const matching = (manifest.components || []).filter(component => componentIds.has(component.component_id)
    && component.commit_sha === value.source_commit
    && component.artifact_digest === value.artifact_digest)
  if (matching.length !== 1)
    errors.push(`${label} must bind the exact source commit and artifact to one enrolled producer component`)
  return {
    producer_id: producer.producer_id,
    installation_id: producer.installation_id,
    runtime_manifest_id: manifest.manifest_id,
  }
}

function none(value, fields, label, errors) {
  for (const field of fields) {
    if (value[field] !== 'NONE')
      errors.push(`${label}.${field} must be NONE for ${value.outcome}`)
  }
}

export function validateGateBCertification(certificationText, obligationText, evidenceRoot = null, authority = {}) {
  const errors = []
  let rows
  let obligations
  try {
    rows = parseCsv(certificationText, 'GATE_B_CERTIFICATION.csv')
    obligations = objects(obligationText, 'gate-b-certification-obligations.csv')
  }
  catch (error) {
    return [error.message]
  }
  if (JSON.stringify(rows[0]) !== JSON.stringify(GATE_B_CERTIFICATION_HEADER))
    return ['GATE_B_CERTIFICATION.csv header does not match the frozen Gate-B contract']
  const expected = new Map(obligations.map(value => [value.obligation_id, value]))
  const seen = new Set()
  const profiles = new Map()
  for (const [index, row] of rows.slice(1).entries()) {
    const value = Object.fromEntries(GATE_B_CERTIFICATION_HEADER.map((field, offset) => [field, row[offset]]))
    const label = `GATE_B_CERTIFICATION.csv:${index + 2}`
    const obligation = expected.get(value.obligation_id)
    if (!obligation) {
      errors.push(`${label} references unknown obligation ${value.obligation_id}`)
      continue
    }
    if (seen.has(value.obligation_id))
      errors.push(`${label} duplicates ${value.obligation_id}`)
    seen.add(value.obligation_id)
    for (const field of ['profile', 'payload_kind', 'obligation_kind', 'lg008_trace_id', 'target_field']) {
      if (value[field] !== obligation[field])
        errors.push(`${label}.${field} disagrees with the generated obligation catalog`)
    }
    if (!GATE_STATES.has(value.profile_gate_state))
      errors.push(`${label}.profile_gate_state is invalid`)
    if (!OUTCOMES.has(value.outcome))
      errors.push(`${label}.outcome is invalid`)
    const priorState = profiles.get(value.profile)
    if (priorState && priorState !== value.profile_gate_state)
      errors.push(`${label} mixes profile gate states ${priorState} and ${value.profile_gate_state}`)
    profiles.set(value.profile, value.profile_gate_state)

    const proofFields = PROOF_PAIRS.flatMap(([refField, digestField]) => [refField, digestField])
    if (value.outcome === 'CERTIFIED') {
      if (!SHA.test(value.authority_commit || ''))
        errors.push(`${label}.authority_commit must bind the runtime authority revision`)
      if (!SHA.test(value.source_commit || ''))
        errors.push(`${label}.source_commit must be an exact source commit`)
      if (!DIGEST.test(value.artifact_digest || ''))
        errors.push(`${label}.artifact_digest must bind the exact artifact`)
      const runtimeManifest = retained(
        value.runtime_manifest_ref,
        value.runtime_manifest_digest,
        evidenceRoot,
        `${label}.runtime_manifest_ref`,
        errors,
      )
      const state = {
        common: null,
        predecessorDigest: 'NONE',
        runtime: validateRuntimeBinding(
          runtimeManifest,
          value,
          evidenceRoot,
          `${label}.runtime_manifest_ref`,
          errors,
        ),
      }
      for (const [refField, digestField, stage] of PROOF_PAIRS.slice(1)) {
        const proof = retained(value[refField], value[digestField], evidenceRoot, `${label}.${refField}`, errors)
        validateStageProof(
          proof, value, stage, `${label}.${refField}`, value[digestField], state, evidenceRoot, errors,
        )
      }
      none(value, [
        'change_control_id', 'change_control_ref', 'change_control_digest',
        'blocker_class', 'blocker_ref', 'blocker_digest', 'unblock_condition',
      ], label, errors)
    }
    else if (value.outcome === 'APPROVED_UNSUPPORTED') {
      if (!SHA.test(value.authority_commit || ''))
        errors.push(`${label}.authority_commit must bind the current authority revision`)
      if (!/^DIE-ADR-[0-9]{3}$/.test(value.change_control_id || ''))
        errors.push(`${label}.change_control_id must identify an accepted bounded-pass ADR`)
      const proof = retained(
        value.change_control_ref,
        value.change_control_digest,
        evidenceRoot,
        `${label}.change_control`,
        errors,
      )
      validateChangeControl(proof, value, `${label}.change_control`, authority, errors)
      none(value, [
        'source_commit', 'artifact_digest', ...proofFields,
        'blocker_class', 'blocker_ref', 'blocker_digest', 'unblock_condition',
      ], label, errors)
    }
    else if (value.outcome === 'EXTERNAL_BLOCKED') {
      if (value.profile_gate_state !== 'OPEN')
        errors.push(`${label} externally blocked obligation cannot complete Gate B`)
      if (!BLOCKERS.has(value.blocker_class))
        errors.push(`${label}.blocker_class must be one bounded external approval/input class`)
      const bytes = retained(value.blocker_ref, value.blocker_digest, evidenceRoot, `${label}.blocker`, errors)
      validateBlocker(bytes, value, `${label}.blocker`, errors)
      if (!value.unblock_condition || value.unblock_condition === 'NONE')
        errors.push(`${label}.unblock_condition is required`)
      none(value, [
        'authority_commit', 'source_commit', 'artifact_digest', ...proofFields,
        'change_control_id', 'change_control_ref', 'change_control_digest',
      ], label, errors)
    }
    else if (value.outcome === 'PENDING_IMPLEMENTATION') {
      if (value.profile_gate_state !== 'OPEN')
        errors.push(`${label} pending implementation cannot complete Gate B`)
      none(value, [
        'authority_commit', 'source_commit', 'artifact_digest', ...proofFields,
        'change_control_id', 'change_control_ref', 'change_control_digest',
        'blocker_class', 'blocker_ref', 'blocker_digest', 'unblock_condition',
      ], label, errors)
      if (!value.next_action || value.next_action === 'NONE')
        errors.push(`${label}.next_action is required while pending`)
    }
  }
  for (const id of expected.keys()) {
    if (!seen.has(id))
      errors.push(`GATE_B_CERTIFICATION.csv omits generated obligation ${id}`)
  }
  for (const [profile, state] of profiles) {
    if (state !== 'COMPLETE')
      continue
    const rowsForProfile = rows.slice(1)
      .map(row => Object.fromEntries(GATE_B_CERTIFICATION_HEADER.map((field, offset) => [field, row[offset]])))
      .filter(value => value.profile === profile)
    if (rowsForProfile.some(value => !['CERTIFIED', 'APPROVED_UNSUPPORTED'].includes(value.outcome)))
      errors.push(`${profile} Gate B is COMPLETE with a non-terminal obligation`)
  }
  return errors
}

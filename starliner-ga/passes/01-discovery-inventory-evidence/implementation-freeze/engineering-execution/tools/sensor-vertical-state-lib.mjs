import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseCsv } from './csv-lib.mjs'
import {
  parseRuntimeManifest,
  validateRuntimeManifest,
  validateSourceProductPath,
} from './validate-runtime-manifest.mjs'

export const SENSOR_VERTICAL_HEADER = [
  'vertical_id', 'capability_id', 'profile', 'source_product_path_ref',
  'source_product_path_digest', 'implementation_state', 'normal_path_state',
  'proof_origin', 'artifact_binding', 'source_commit', 'install_artifact_ref',
  'install_artifact_digest', 'installed_artifact_ref', 'installed_artifact_digest',
  'component_set_digest', 'runtime_manifest_ref', 'runtime_manifest_digest',
  'runtime_manifest_id', 'native_capture_ref',
  'native_capture_digest', 'local_wal_ref', 'local_wal_digest',
  'ingest_receipt_ref', 'ingest_receipt_digest', 'immutable_evidence_ref',
  'immutable_evidence_digest', 'normalization_ref', 'normalization_digest',
  'canonical_entity_ref', 'canonical_entity_digest', 'canonical_graph_activity_ref',
  'canonical_graph_activity_digest', 'projection_ref', 'projection_digest',
  'authorized_api_ref', 'authorized_api_digest', 'live_ui_ref', 'live_ui_digest',
  'highest_integrated_stage', 'limitations_json', 'next_action',
]

export const VERTICAL_STAGES = [
  ['NATIVE_CAPTURE', 'native_capture_ref', 'native_capture_digest'],
  ['LOCAL_WAL', 'local_wal_ref', 'local_wal_digest'],
  ['INGEST_RECEIPT', 'ingest_receipt_ref', 'ingest_receipt_digest'],
  ['IMMUTABLE_EVIDENCE', 'immutable_evidence_ref', 'immutable_evidence_digest'],
  ['NORMALIZED', 'normalization_ref', 'normalization_digest'],
  ['CANONICAL_ENTITY', 'canonical_entity_ref', 'canonical_entity_digest'],
  ['CANONICAL_GRAPH_ACTIVITY', 'canonical_graph_activity_ref', 'canonical_graph_activity_digest'],
  ['PROJECTED', 'projection_ref', 'projection_digest'],
  ['AUTHORIZED_API', 'authorized_api_ref', 'authorized_api_digest'],
  ['LIVE_UI', 'live_ui_ref', 'live_ui_digest'],
]

const SHA = /^[0-9a-f]{40}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const SAFE_REF = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9_.\/-]+$/
const FORBIDDEN_PROOF_REF = /(?:^|[\/_.-])(?:fixture|fixtures|mock|mocks|preview|manual|synthetic|hotfix|tmp)(?:[\/_.-]|$)/i
const IMPLEMENTATION = new Set(['NOT_STARTED', 'ACTIVE', 'IMPLEMENTED', 'SUPERSEDED'])
const NORMAL_PATH = new Set([
  'UNASSIGNED', 'UNKNOWN', 'SOURCE_PROVEN', 'MISSING_PRODUCT_CODE',
  'EXTERNAL_INPUT_REQUIRED', 'INSTALLED_UNOBSERVED', 'INSTALLED_OBSERVED', 'COHERENT_E2E',
])
const PROOF_ORIGIN = new Set([
  'NONE', 'SOURCE_PROVEN', 'EXACT_INSTALLED_PRODUCT', 'EXACT_DEPLOYED_PRODUCT',
])
const ARTIFACT_BINDING = new Set([
  'NONE', 'SOURCE_COMMIT_ONLY', 'INSTALL_ARTIFACT_EXACT', 'FULL_EXACT',
])
const RUNTIME_MODES = new Set([
  'COHERENT_LOCAL_PRODUCT', 'ISOLATED_INTEGRATION', 'RELEASE_CANDIDATE',
])
const PROFILE_CAPABILITY = new Map([
  ['browser', 'PC-002'],
  ['browser_backend', 'PC-003'],
  ['endpoint', 'PC-004'],
  ['llm_gateway', 'PC-005'],
  ['mcp_gateway', 'PC-006'],
])

const TOOL_DIR = dirname(fileURLToPath(import.meta.url))
const FREEZE_ROOT = resolve(TOOL_DIR, '../..')

function authorityCsv(relativePath) {
  const rows = parseCsv(readFileSync(resolve(FREEZE_ROOT, relativePath), 'utf8'), relativePath)
  const header = rows[0]
  return rows.slice(1).map(row => Object.fromEntries(header.map((field, index) => [field, row[index]])))
}

const RELATIONSHIP_RULES = new Map(
  authorityCsv('registers/relationship-support.csv').map(rule => [rule.relationship_id, rule]),
)
const TEMPORAL_RULES = new Map(
  authorityCsv('registers/source-temporal-precedence.csv')
    .map(rule => [`${rule.profile}:${rule.payload_kind}`, rule]),
)
const ENTITY_ONTOLOGY_TEXT = readFileSync(resolve(FREEZE_ROOT, 'ontology/entity-types.yaml'), 'utf8')
const ENTITY_TYPES = new Set(
  [...ENTITY_ONTOLOGY_TEXT.split(/^classification:/m)[0].matchAll(/^  ([a-z][a-z0-9_]+):\s*$/gm)]
    .map(match => match[1]),
)
const ACTIVITY_ONTOLOGY_TEXT = readFileSync(resolve(FREEZE_ROOT, 'ontology/activity-types.yaml'), 'utf8')
const ACTIVITY_SUBTYPES = new Set(
  [...ACTIVITY_ONTOLOGY_TEXT.matchAll(/^\s+subtypes:\s*\[([^\]]+)]\s*$/gm)]
    .flatMap(match => match[1].split(',').map(value => value.trim())),
)
const SOURCE_NORMALIZATION_TEXT = readFileSync(resolve(FREEZE_ROOT, 'ontology/source-normalization.yaml'), 'utf8')

function profileAuthorityBlock(profile) {
  const start = SOURCE_NORMALIZATION_TEXT.search(new RegExp(`^  ${profile}:\\s*$`, 'm'))
  if (start < 0)
    return ''
  const tail = SOURCE_NORMALIZATION_TEXT.slice(start + 1)
  const next = tail.search(/^  [a-z][a-z0-9_]+:\s*$/m)
  return next < 0 ? SOURCE_NORMALIZATION_TEXT.slice(start) : SOURCE_NORMALIZATION_TEXT.slice(start, start + 1 + next)
}

const ACTIVITY_SUBTYPES_BY_PROFILE = new Map(
  PROFILE_CAPABILITY.keys().map(profile => {
    const block = profileAuthorityBlock(profile)
    return [profile, new Set([...ACTIVITY_SUBTYPES].filter(subtype => block.includes(subtype)))]
  }),
)

function openApiOperations() {
  const operations = new Map()
  const lines = readFileSync(resolve(FREEZE_ROOT, 'openapi/die-v1.openapi.yaml'), 'utf8').split(/\r?\n/)
  let path = null
  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/)
    if (pathMatch) {
      path = pathMatch[1]
      continue
    }
    const operationMatch = line.match(/^      operationId:\s*([A-Za-z][A-Za-z0-9]*)\s*$/)
    if (path && operationMatch)
      operations.set(operationMatch[1], path)
  }
  return operations
}

const OPENAPI_OPERATIONS = openApiOperations()
const API_ENTITY_TYPES = new Map([
  ['/inventory/agent-deployments', new Set(['agent_deployment'])],
  ['/inventory/applications', new Set(['application_product', 'application_surface', 'application_deployment', 'application_account'])],
  ['/inventory/models', new Set(['model_product', 'model_family', 'model_version', 'model_deployment', 'model_route', 'provider_account', 'provider'])],
  ['/inventory/mcp-servers', new Set(['mcp_server_product', 'mcp_server_deployment', 'mcp_tool', 'mcp_resource_definition', 'mcp_prompt_definition'])],
  ['/inventory/devices', new Set(['device', 'browser_installation', 'endpoint_installation'])],
  ['/inventory/identities', new Set(['person', 'directory_account', 'service_principal', 'team', 'business_unit', 'workload_identity'])],
])

function authoritySourceIncludes(rule, profile) {
  const expected = profile.replaceAll('_', ' ')
  return String(rule?.source || '')
    .split('+')
    .map(value => value.trim().toLowerCase())
    .some(value => value.replaceAll(' gateway', '_gateway').replaceAll(' ', '_') === profile
      || value === expected)
}

export function frozenRelationshipRule(ruleId) {
  return RELATIONSHIP_RULES.get(ruleId) || null
}

export function frozenIdentityBindingRule(profile, payloadKind) {
  const rule = TEMPORAL_RULES.get(`${profile}:${payloadKind}`)
  return rule?.aggregate_class === 'identity_assertion' ? rule : null
}

function validateGraphAuthority(assertion, profile, entityType, label, errors) {
  const path = `${label}.assertion`
  if (assertion.result_kind === 'activity') {
    if (!ACTIVITY_SUBTYPES.has(assertion.rule_id))
      errors.push(`${path}.rule_id does not exist in the frozen activity ontology`)
    else if (!ACTIVITY_SUBTYPES_BY_PROFILE.get(profile)?.has(assertion.rule_id))
      errors.push(`${path}.rule_id is not an activity mapping for profile ${profile}`)
    return
  }
  if (!['relationship', 'pending_dependency'].includes(assertion.result_kind))
    return
  const rule = RELATIONSHIP_RULES.get(assertion.rule_id)
  if (!rule) {
    errors.push(`${path}.rule_id does not exist in the frozen relationship registry`)
    return
  }
  if (!authoritySourceIncludes(rule, profile))
    errors.push(`${path}.rule_id is not applicable to profile ${profile}`)
  if (![rule.subject, rule.object].includes(entityType))
    errors.push(`${path}.rule_id is not applicable to canonical entity type ${entityType}`)
  if (assertion.result_kind === 'relationship'
    && (rule.support_state === 'future_connector_required' || rule.automatic_materialization === 'no')) {
    errors.push(`${path}.rule_id is not launch-materializable`)
  }
}

function apiOperationApplies(operationId, graphKind, entityType) {
  const path = OPENAPI_OPERATIONS.get(operationId)
  if (!path)
    return false
  if (graphKind === 'activity')
    return path === '/activity' || path === '/activity/{activity_id}'
  if (graphKind !== 'relationship')
    return false
  if (path.startsWith('/inventory/entities'))
    return true
  for (const [prefix, types] of API_ENTITY_TYPES) {
    if ((path === prefix || path.startsWith(`${prefix}/`)) && types.has(entityType))
      return true
  }
  return false
}

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function rowObject(row) {
  return Object.fromEntries(SENSOR_VERTICAL_HEADER.map((name, index) => [name, row[index]]))
}

function retainedFile(reference, expectedDigest, evidenceRoot, label, errors, options = {}) {
  if (!SAFE_REF.test(reference || '')) {
    errors.push(`${label} must be a safe evidence-root-relative file reference`)
    return null
  }
  if (options.rejectBypassNames && FORBIDDEN_PROOF_REF.test(reference)) {
    errors.push(`${label} uses a fixture, preview, mock, manual, synthetic, hotfix, or temporary proof path`)
    return null
  }
  if (!DIGEST.test(expectedDigest || '')) {
    errors.push(`${label} digest must be sha256:<64 lowercase hex>`)
    return null
  }
  if (!evidenceRoot) {
    errors.push(`${label} cannot be verified without an evidence root`)
    return null
  }
  let rootReal
  let candidateReal
  try {
    rootReal = realpathSync(evidenceRoot)
    const candidate = resolve(rootReal, reference)
    if (!existsSync(candidate)) {
      errors.push(`${label} does not exist: ${reference}`)
      return null
    }
    candidateReal = realpathSync(candidate)
    const fromRoot = relative(rootReal, candidateReal)
    if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) {
      errors.push(`${label} escapes the evidence root: ${reference}`)
      return null
    }
    if (!statSync(candidateReal).isFile()) {
      errors.push(`${label} is not a retained file: ${reference}`)
      return null
    }
  }
  catch (error) {
    errors.push(`${label} cannot be resolved: ${error.message}`)
    return null
  }
  const bytes = readFileSync(candidateReal)
  const observed = digest(bytes)
  if (observed !== expectedDigest) {
    errors.push(`${label} digest mismatch: expected ${expectedDigest}; observed ${observed}`)
    return null
  }
  return { bytes, path: candidateReal }
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() === value && value.length > 0
}

function parseStageEvidence(retained, label, errors) {
  if (!retained)
    return null
  try {
    const value = JSON.parse(retained.bytes.toString('utf8'))
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      errors.push(`${label} must contain one JSON object`)
      return null
    }
    return value
  }
  catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`)
    return null
  }
}

function checkExactKeys(value, expected, label, errors) {
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    errors.push(`${label} keys must be exactly: ${wanted.join(', ')}`)
}

const STAGE_EVIDENCE_KEYS = [
  'schema', 'vertical_id', 'capability_id', 'profile', 'stage', 'observed_at',
  'integration_run_id', 'logical_tenant_id', 'producer_id', 'installation_id',
  'source_record_id', 'source_commit', 'source_product_path_digest',
  'install_artifact_digest', 'installed_artifact_digest', 'component_set_digest',
  'runtime_manifest_digest', 'runtime_manifest_id',
  'proof_origin', 'runtime_mode', 'normal_entrypoint', 'fixture_substitution',
  'manual_bypass', 'preview_path', 'contamination_state', 'predecessor_digest', 'assertion',
]

const ASSERTION_KEYS = new Map([
  ['NATIVE_CAPTURE', ['native_record_id', 'capture_component_id', 'capture_symbol', 'native_record_digest']],
  ['LOCAL_WAL', ['native_record_id', 'wal_entry_id', 'wal_component_id', 'wal_sequence', 'wal_payload_digest', 'durable_before_send']],
  ['INGEST_RECEIPT', ['wal_entry_id', 'batch_id', 'receipt_id', 'receipt_record_id', 'disposition', 'ingest_operation_id', 'receipt_payload_digest']],
  ['IMMUTABLE_EVIDENCE', ['receipt_id', 'evidence_id', 'evidence_object_ref', 'evidence_payload_digest', 'evidence_state']],
  ['NORMALIZED', ['evidence_id', 'normalization_run_id', 'output_count', 'output_ids', 'bundle_digest']],
  ['CANONICAL_ENTITY', ['normalization_run_id', 'evidence_id', 'entity_id', 'entity_type', 'entity_version', 'binding_id', 'source_object_id', 'selected_claim_ids']],
  ['CANONICAL_GRAPH_ACTIVITY', ['entity_id', 'entity_version', 'result_kind', 'result_id', 'rule_id', 'applicability', 'reason_code', 'dependency_ids']],
  ['PROJECTED', ['entity_id', 'graph_result_id', 'projection_name', 'projection_generation', 'canonical_watermark', 'projection_watermark', 'destination_ack_id']],
  ['AUTHORIZED_API', ['entity_id', 'graph_result_id', 'projection_generation', 'projection_watermark', 'operation_id', 'request_id', 'authorization_revision', 'subject_id', 'response_member_id', 'response_digest', 'status_code']],
  ['LIVE_UI', ['api_request_id', 'operation_id', 'authorization_revision', 'ui_build_digest', 'route', 'browser_session_id', 'rendered_member_id', 'browser_assertions']],
])

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const DECIMAL = /^(0|[1-9][0-9]*)$/

function requireId(value, path, errors, uuid = false) {
  if (!nonEmptyString(value) || value === 'NONE' || (uuid && !UUID.test(value)))
    errors.push(`${path} must be a non-empty ${uuid ? 'UUID' : 'trace identifier'}`)
}

function requireDigest(value, path, errors) {
  if (!DIGEST.test(value || ''))
    errors.push(`${path} must be a SHA-256 digest`)
}

function validateStageAssertion(value, stage, label, errors) {
  const assertion = value.assertion
  if (!assertion || Array.isArray(assertion) || typeof assertion !== 'object') {
    errors.push(`${label}.assertion must be the closed ${stage} assertion object`)
    return
  }
  checkExactKeys(assertion, ASSERTION_KEYS.get(stage) || [], `${label}.assertion`, errors)
  const path = `${label}.assertion`
  if (stage === 'NATIVE_CAPTURE') {
    requireId(assertion.native_record_id, `${path}.native_record_id`, errors)
    requireId(assertion.capture_component_id, `${path}.capture_component_id`, errors)
    requireId(assertion.capture_symbol, `${path}.capture_symbol`, errors)
    requireDigest(assertion.native_record_digest, `${path}.native_record_digest`, errors)
  }
  else if (stage === 'LOCAL_WAL') {
    requireId(assertion.native_record_id, `${path}.native_record_id`, errors)
    requireId(assertion.wal_entry_id, `${path}.wal_entry_id`, errors)
    requireId(assertion.wal_component_id, `${path}.wal_component_id`, errors)
    if (!DECIMAL.test(assertion.wal_sequence || ''))
      errors.push(`${path}.wal_sequence must be an exact decimal string`)
    requireDigest(assertion.wal_payload_digest, `${path}.wal_payload_digest`, errors)
    if (assertion.durable_before_send !== true)
      errors.push(`${path}.durable_before_send must be true`)
  }
  else if (stage === 'INGEST_RECEIPT') {
    requireId(assertion.wal_entry_id, `${path}.wal_entry_id`, errors)
    for (const field of ['batch_id', 'receipt_id'])
      requireId(assertion[field], `${path}.${field}`, errors, true)
    requireId(assertion.receipt_record_id, `${path}.receipt_record_id`, errors)
    if (!['accepted', 'duplicate'].includes(assertion.disposition))
      errors.push(`${path}.disposition must be accepted or duplicate`)
    if (assertion.ingest_operation_id !== 'acceptDeliveryBatch')
      errors.push(`${path}.ingest_operation_id must be acceptDeliveryBatch`)
    requireDigest(assertion.receipt_payload_digest, `${path}.receipt_payload_digest`, errors)
  }
  else if (stage === 'IMMUTABLE_EVIDENCE') {
    for (const field of ['receipt_id', 'evidence_id'])
      requireId(assertion[field], `${path}.${field}`, errors, true)
    requireId(assertion.evidence_object_ref, `${path}.evidence_object_ref`, errors)
    requireDigest(assertion.evidence_payload_digest, `${path}.evidence_payload_digest`, errors)
    if (assertion.evidence_state !== 'immutable_accepted')
      errors.push(`${path}.evidence_state must be immutable_accepted`)
  }
  else if (stage === 'NORMALIZED') {
    for (const field of ['evidence_id', 'normalization_run_id'])
      requireId(assertion[field], `${path}.${field}`, errors, true)
    if (!Number.isSafeInteger(assertion.output_count) || assertion.output_count < 1)
      errors.push(`${path}.output_count must be a positive safe integer`)
    if (!Array.isArray(assertion.output_ids) || assertion.output_ids.length !== assertion.output_count
      || new Set(assertion.output_ids).size !== assertion.output_ids.length
      || assertion.output_ids.some(item => !UUID.test(item))) {
      errors.push(`${path}.output_ids must contain output_count unique UUIDs`)
    }
    requireDigest(assertion.bundle_digest, `${path}.bundle_digest`, errors)
  }
  else if (stage === 'CANONICAL_ENTITY') {
    for (const field of ['normalization_run_id', 'evidence_id', 'entity_id', 'binding_id'])
      requireId(assertion[field], `${path}.${field}`, errors, true)
    if (!ENTITY_TYPES.has(assertion.entity_type))
      errors.push(`${path}.entity_type must exist in the frozen entity ontology`)
    if (!DECIMAL.test(assertion.entity_version || '') || assertion.entity_version === '0')
      errors.push(`${path}.entity_version must be a positive decimal string`)
    requireId(assertion.source_object_id, `${path}.source_object_id`, errors)
    if (!Array.isArray(assertion.selected_claim_ids) || !assertion.selected_claim_ids.length
      || new Set(assertion.selected_claim_ids).size !== assertion.selected_claim_ids.length
      || assertion.selected_claim_ids.some(item => !UUID.test(item))) {
      errors.push(`${path}.selected_claim_ids must be non-empty unique UUIDs`)
    }
  }
  else if (stage === 'CANONICAL_GRAPH_ACTIVITY') {
    requireId(assertion.entity_id, `${path}.entity_id`, errors, true)
    if (!DECIMAL.test(assertion.entity_version || '') || assertion.entity_version === '0')
      errors.push(`${path}.entity_version must be a positive decimal string`)
    if (!['relationship', 'activity', 'pending_dependency', 'not_applicable'].includes(assertion.result_kind))
      errors.push(`${path}.result_kind is invalid`)
    requireId(assertion.rule_id, `${path}.rule_id`, errors)
    requireId(assertion.reason_code, `${path}.reason_code`, errors)
    if (!Array.isArray(assertion.dependency_ids) || new Set(assertion.dependency_ids).size !== assertion.dependency_ids.length)
      errors.push(`${path}.dependency_ids must be a unique array`)
    if (['relationship', 'activity'].includes(assertion.result_kind)) {
      requireId(assertion.result_id, `${path}.result_id`, errors)
      if (assertion.applicability !== 'applicable_supported' || assertion.dependency_ids?.length)
        errors.push(`${path} materialized results require applicable_supported with no dependency IDs`)
    }
    else if (assertion.result_kind === 'pending_dependency') {
      if (assertion.result_id !== 'NONE' || assertion.applicability !== 'applicable_pending_dependency'
        || !assertion.dependency_ids?.length) {
        errors.push(`${path} pending_dependency requires NONE result, pending applicability and dependency IDs`)
      }
    }
    else if (assertion.result_kind === 'not_applicable') {
      if (assertion.result_id !== 'NONE' || !String(assertion.applicability).startsWith('not_applicable_')
        || assertion.dependency_ids?.length) {
        errors.push(`${path} not_applicable requires NONE result, explicit applicability and no dependencies`)
      }
    }
  }
  else if (stage === 'PROJECTED') {
    requireId(assertion.entity_id, `${path}.entity_id`, errors, true)
    for (const field of ['projection_name', 'destination_ack_id'])
      requireId(assertion[field], `${path}.${field}`, errors)
    for (const field of ['projection_generation', 'canonical_watermark', 'projection_watermark']) {
      if (!DECIMAL.test(assertion[field] || ''))
        errors.push(`${path}.${field} must be an exact decimal string`)
    }
  }
  else if (stage === 'AUTHORIZED_API') {
    requireId(assertion.entity_id, `${path}.entity_id`, errors, true)
    for (const field of ['operation_id', 'request_id', 'subject_id', 'response_member_id'])
      requireId(assertion[field], `${path}.${field}`, errors)
    if (!OPENAPI_OPERATIONS.has(assertion.operation_id))
      errors.push(`${path}.operation_id does not exist in the frozen die-v1 OpenAPI`)
    for (const field of ['projection_generation', 'projection_watermark', 'authorization_revision']) {
      if (!DECIMAL.test(assertion[field] || ''))
        errors.push(`${path}.${field} must be an exact decimal string`)
    }
    requireDigest(assertion.response_digest, `${path}.response_digest`, errors)
    if (assertion.status_code !== 200)
      errors.push(`${path}.status_code must be 200`)
  }
  else if (stage === 'LIVE_UI') {
    for (const field of ['api_request_id', 'operation_id', 'browser_session_id', 'rendered_member_id'])
      requireId(assertion[field], `${path}.${field}`, errors)
    if (!DECIMAL.test(assertion.authorization_revision || ''))
      errors.push(`${path}.authorization_revision must be an exact decimal string`)
    requireDigest(assertion.ui_build_digest, `${path}.ui_build_digest`, errors)
    if (!/^\/estate(?:\/.*)?$/.test(assertion.route || ''))
      errors.push(`${path}.route must be a customer /estate route`)
    const required = ['authorized_member_visible', 'fixture_mode_absent', 'session_authz_context_matches']
    if (!Array.isArray(assertion.browser_assertions)
      || required.some(item => !assertion.browser_assertions.includes(item))
      || new Set(assertion.browser_assertions).size !== assertion.browser_assertions.length) {
      errors.push(`${path}.browser_assertions must include the three required real-browser assertions`)
    }
  }
}

function validateStageEvidence(value, row, stage, stageIndex, evidenceDigest, predecessorDigest, label, errors) {
  if (!value)
    return
  checkExactKeys(value, STAGE_EVIDENCE_KEYS, label, errors)
  const exact = new Map([
    ['schema', 'die.sensor-stage-evidence.v1'],
    ['vertical_id', row.vertical_id],
    ['capability_id', row.capability_id],
    ['profile', row.profile],
    ['stage', stage],
    ['source_commit', row.source_commit],
    ['source_product_path_digest', row.source_product_path_digest],
    ['install_artifact_digest', row.install_artifact_digest],
    ['installed_artifact_digest', row.installed_artifact_digest],
    ['component_set_digest', row.component_set_digest],
    ['proof_origin', row.proof_origin],
    ['normal_entrypoint', true],
    ['fixture_substitution', false],
    ['manual_bypass', false],
    ['preview_path', false],
    ['contamination_state', 'CLEAN'],
    ['predecessor_digest', predecessorDigest],
  ])
  for (const [field, expected] of exact) {
    if (value[field] !== expected)
      errors.push(`${label}.${field} must be ${JSON.stringify(expected)}`)
  }
  if (!RUNTIME_MODES.has(value.runtime_mode))
    errors.push(`${label}.runtime_mode is not an exact normal-product runtime`)
  for (const field of [
    'integration_run_id', 'logical_tenant_id', 'producer_id', 'installation_id',
    'source_record_id',
  ]) {
    if (!nonEmptyString(value[field]))
      errors.push(`${label}.${field} must be a non-empty exact trace binding`)
  }
  if (!RFC3339.test(value.observed_at || '') || Number.isNaN(Date.parse(value.observed_at)))
    errors.push(`${label}.observed_at must be an actual RFC3339 timestamp`)

  const expectedRuntime = stageIndex >= 2 ? row.runtime_manifest_digest : 'NONE'
  if (value.runtime_manifest_digest !== expectedRuntime) {
    errors.push(`${label}.runtime_manifest_digest must be ${expectedRuntime} at ${stage}`)
  }
  const expectedRuntimeId = stageIndex >= 2 ? row.runtime_manifest_id : 'NONE'
  if (value.runtime_manifest_id !== expectedRuntimeId)
    errors.push(`${label}.runtime_manifest_id must be ${expectedRuntimeId} at ${stage}`)
  if (evidenceDigest === predecessorDigest && stageIndex > 0)
    errors.push(`${label} reuses its predecessor file instead of retaining stage-specific evidence`)
  validateStageAssertion(value, stage, label, errors)
}

function sameTrace(current, first, previous, label, errors) {
  if (!current || !first)
    return
  for (const field of [
    'integration_run_id', 'logical_tenant_id', 'producer_id', 'installation_id',
    'source_record_id', 'runtime_mode',
  ]) {
    if (current[field] !== first[field])
      errors.push(`${label}.${field} does not match the first exact-product stage`)
  }
  if (previous && RFC3339.test(previous.observed_at || '') && RFC3339.test(current.observed_at || '')) {
    if (Date.parse(current.observed_at) < Date.parse(previous.observed_at))
      errors.push(`${label}.observed_at precedes the retained predecessor stage`)
  }
}

function parseYamlManifest(retained, label, errors) {
  if (!retained)
    return null
  try {
    return parseRuntimeManifest(retained.path)
  }
  catch (error) {
    errors.push(`${label} is not valid duplicate-safe YAML/JSON: ${error.message}`)
    return null
  }
}

function tenantRef(logicalTenantId) {
  return `tenant-ref:sha256:${createHash('sha256').update(logicalTenantId).digest('hex')}`
}

function crossBindStageChain(stages, sourcePath, runtimeManifest, producer, row, label, errors) {
  const first = stages.get('NATIVE_CAPTURE')
  if (!first)
    return
  const componentSet = sourcePath?.component_set
  const componentSetById = new Map((componentSet?.components || []).map(item => [item.component_id, item]))
  const sourceComponentsById = new Map((sourcePath?.components || []).map(item => [item.component_id, item]))
  const deliveryComponentId = componentSet?.ownership?.delivery_component_id
  const deliverySourceComponent = sourceComponentsById.get(deliveryComponentId)

  if (row.source_commit !== sourcePath?.source_commit)
    errors.push(`${label}.source_commit does not match SOURCE_PRODUCT_PATH`)
  if (row.install_artifact_ref !== sourcePath?.installation?.install_artifact_ref
    || row.install_artifact_digest !== sourcePath?.installation?.install_artifact_digest) {
    errors.push(`${label} install artifact does not match SOURCE_PRODUCT_PATH normal installation`)
  }
  if (!deliverySourceComponent
    || row.installed_artifact_ref !== deliverySourceComponent.installed_artifact_ref
    || row.installed_artifact_digest !== deliverySourceComponent.installed_artifact_digest) {
    errors.push(`${label} installed artifact does not match the measured delivery-owner component`)
  }
  if (row.component_set_digest !== componentSet?.component_set_digest)
    errors.push(`${label}.component_set_digest does not match SOURCE_PRODUCT_PATH component set`)

  if (runtimeManifest) {
    if (runtimeManifest.manifest_id !== row.runtime_manifest_id)
      errors.push(`${label}.runtime_manifest_id does not match parsed RUNTIME_MANIFEST`)
    if (runtimeManifest.runtime_mode !== first.runtime_mode)
      errors.push(`${label} stage runtime_mode does not match RUNTIME_MANIFEST`)
    if (runtimeManifest.tenant_authority?.tenant_ref !== tenantRef(first.logical_tenant_id))
      errors.push(`${label} logical tenant does not hash to RUNTIME_MANIFEST tenant authority`)
  }
  if (producer) {
    if (producer.profile !== row.profile)
      errors.push(`${label} runtime producer profile does not match vertical profile`)
    if (producer.producer_id !== first.producer_id)
      errors.push(`${label} producer_id does not match RUNTIME_MANIFEST producer`)
    if (producer.installation_id !== first.installation_id)
      errors.push(`${label} installation_id does not match RUNTIME_MANIFEST producer`)
    if (producer.source_product_path_ref !== row.source_product_path_ref
      || producer.source_product_path_digest !== row.source_product_path_digest) {
      errors.push(`${label} runtime producer is not bound to the exact SOURCE_PRODUCT_PATH file`)
    }
    if (producer.component_set_digest !== row.component_set_digest)
      errors.push(`${label} runtime producer component_set_digest does not match vertical evidence`)
    if (producer.component_id !== deliveryComponentId)
      errors.push(`${label} runtime primary component is not the measured delivery owner`)
    const expectedComponentIds = [...componentSetById.keys()].sort()
    if (JSON.stringify([...(producer.component_ids || [])].sort()) !== JSON.stringify(expectedComponentIds))
      errors.push(`${label} runtime producer components do not match the measured component-set topology`)
  }

  const capture = stages.get('NATIVE_CAPTURE')?.assertion
  if (capture && !componentSet?.ownership?.capture_component_ids?.includes(capture.capture_component_id))
    errors.push(`${label} native capture component is not an admitted capture owner`)
  const wal = stages.get('LOCAL_WAL')?.assertion
  if (wal && wal.wal_component_id !== componentSet?.ownership?.wal_component_id)
    errors.push(`${label} WAL stage component is not the admitted WAL owner`)

  const native = stages.get('NATIVE_CAPTURE')?.assertion
  const receipt = stages.get('INGEST_RECEIPT')?.assertion
  const immutable = stages.get('IMMUTABLE_EVIDENCE')?.assertion
  const normalized = stages.get('NORMALIZED')?.assertion
  const canonical = stages.get('CANONICAL_ENTITY')?.assertion
  const graph = stages.get('CANONICAL_GRAPH_ACTIVITY')?.assertion
  const projected = stages.get('PROJECTED')?.assertion
  const api = stages.get('AUTHORIZED_API')?.assertion
  const ui = stages.get('LIVE_UI')?.assertion
  if (native && wal && wal.native_record_id !== native.native_record_id)
    errors.push(`${label} LOCAL_WAL does not reference the captured native record`)
  if (wal && receipt && receipt.wal_entry_id !== wal.wal_entry_id)
    errors.push(`${label} INGEST_RECEIPT does not reference the durable WAL entry`)
  if (receipt && receipt.receipt_record_id !== first.source_record_id)
    errors.push(`${label} INGEST_RECEIPT receipt_record_id does not match the exact envelope source_record_id`)
  if (receipt && immutable && immutable.receipt_id !== receipt.receipt_id)
    errors.push(`${label} IMMUTABLE_EVIDENCE does not reference the accepted receipt`)
  if (immutable && normalized && normalized.evidence_id !== immutable.evidence_id)
    errors.push(`${label} NORMALIZED does not reference immutable evidence`)
  if (normalized && canonical) {
    if (canonical.normalization_run_id !== normalized.normalization_run_id
      || canonical.evidence_id !== normalized.evidence_id) {
      errors.push(`${label} CANONICAL_ENTITY does not reference the normalization/evidence chain`)
    }
  }
  if (canonical && graph
    && (graph.entity_id !== canonical.entity_id || graph.entity_version !== canonical.entity_version)) {
    errors.push(`${label} CANONICAL_GRAPH_ACTIVITY does not reference the canonical entity version`)
  }
  if (canonical && graph)
    validateGraphAuthority(graph, row.profile, canonical.entity_type, `${label}.CANONICAL_GRAPH_ACTIVITY`, errors)
  if (graph && projected) {
    const graphId = graph.result_id
    if (projected.entity_id !== graph.entity_id || projected.graph_result_id !== graphId)
      errors.push(`${label} PROJECTED does not reference the canonical entity/graph result`)
  }
  if (projected && api) {
    if (api.entity_id !== projected.entity_id || api.graph_result_id !== projected.graph_result_id
      || api.projection_generation !== projected.projection_generation
      || api.projection_watermark !== projected.projection_watermark) {
      errors.push(`${label} AUTHORIZED_API does not reference the projected generation/member`)
    }
    if (![api.entity_id, api.graph_result_id].includes(api.response_member_id))
      errors.push(`${label} AUTHORIZED_API response member is not the traced entity/graph result`)
    if (canonical && graph && !apiOperationApplies(api.operation_id, graph.result_kind, canonical.entity_type)) {
      errors.push(`${label} AUTHORIZED_API operation does not apply to the asserted canonical entity/activity`)
    }
  }
  if (api && ui) {
    if (ui.api_request_id !== api.request_id || ui.operation_id !== api.operation_id
      || ui.authorization_revision !== api.authorization_revision
      || ui.rendered_member_id !== api.response_member_id) {
      errors.push(`${label} LIVE_UI does not reference the authorized API request/member/revision`)
    }
  }
}

export function validateSensorVerticalState(text, evidenceRoot = null) {
  const errors = []
  let rows
  try {
    rows = parseCsv(text, 'SENSOR_VERTICAL_STATE.csv')
  }
  catch (error) {
    return [error.message]
  }
  if (JSON.stringify(rows[0]) !== JSON.stringify(SENSOR_VERTICAL_HEADER)) {
    errors.push('SENSOR_VERTICAL_STATE.csv header does not match the frozen vertical-evidence contract')
    return errors
  }

  const ids = new Set()
  for (const [index, row] of rows.slice(1).entries()) {
    const line = index + 2
    const value = rowObject(row)
    const label = `SENSOR_VERTICAL_STATE.csv:${line}`
    if (!/^SV-[A-Z0-9-]{3,64}$/.test(value.vertical_id || ''))
      errors.push(`${label}.vertical_id is invalid`)
    else if (ids.has(value.vertical_id))
      errors.push(`${label}.vertical_id is duplicated`)
    ids.add(value.vertical_id)

    const expectedCapability = PROFILE_CAPABILITY.get(value.profile)
    if (!expectedCapability)
      errors.push(`${label}.profile is not a bounded launch profile`)
    else if (value.capability_id !== expectedCapability)
      errors.push(`${label}.capability_id must be ${expectedCapability} for ${value.profile}`)
    if (!IMPLEMENTATION.has(value.implementation_state))
      errors.push(`${label}.implementation_state is invalid`)
    if (!NORMAL_PATH.has(value.normal_path_state))
      errors.push(`${label}.normal_path_state is invalid`)
    if (!PROOF_ORIGIN.has(value.proof_origin))
      errors.push(`${label}.proof_origin is invalid`)
    if (!ARTIFACT_BINDING.has(value.artifact_binding))
      errors.push(`${label}.artifact_binding is invalid`)
    if (!value.next_action)
      errors.push(`${label}.next_action is required`)
    try {
      const limitations = JSON.parse(value.limitations_json)
      if (!Array.isArray(limitations)
        || limitations.some(item => typeof item !== 'string' || !item)
        || new Set(limitations).size !== limitations.length) {
        errors.push(`${label}.limitations_json must be a unique array of non-empty strings`)
      }
    }
    catch {
      errors.push(`${label}.limitations_json is invalid JSON`)
    }

    const highestIndex = value.highest_integrated_stage === 'NONE'
      ? -1
      : VERTICAL_STAGES.findIndex(([stage]) => stage === value.highest_integrated_stage)
    if (value.highest_integrated_stage !== 'NONE' && highestIndex === -1)
      errors.push(`${label}.highest_integrated_stage is invalid`)

    let firstStage = null
    let previousStage = null
    let predecessorDigest = 'NONE'
    const stageEvidenceByName = new Map()
    for (const [stageIndex, [stage, refField, digestField]] of VERTICAL_STAGES.entries()) {
      const required = stageIndex <= highestIndex
      const reference = value[refField]
      const expectedDigest = value[digestField]
      if (required) {
        if (reference === 'NONE' || expectedDigest === 'NONE') {
          errors.push(`${label} claims ${value.highest_integrated_stage} without ${stage} evidence`)
        }
        else {
          const bytes = retainedFile(
            reference,
            expectedDigest,
            evidenceRoot,
            `${label}.${stage}`,
            errors,
            { rejectBypassNames: true },
          )
          const stageEvidence = parseStageEvidence(bytes, `${label}.${stage}`, errors)
          validateStageEvidence(
            stageEvidence,
            value,
            stage,
            stageIndex,
            expectedDigest,
            predecessorDigest,
            `${label}.${stage}`,
            errors,
          )
          if (stageEvidence) {
            stageEvidenceByName.set(stage, stageEvidence)
            if (!firstStage)
              firstStage = stageEvidence
            sameTrace(stageEvidence, firstStage, previousStage, `${label}.${stage}`, errors)
            previousStage = stageEvidence
          }
        }
        predecessorDigest = expectedDigest
      }
      else if (reference !== 'NONE' || expectedDigest !== 'NONE') {
        errors.push(`${label} carries ${stage} evidence beyond highest_integrated_stage ${value.highest_integrated_stage}`)
      }
    }

    if (highestIndex === -1) {
      if (value.proof_origin !== 'NONE' && value.proof_origin !== 'SOURCE_PROVEN')
        errors.push(`${label} has no integrated stage but claims product runtime proof`)
      if (value.artifact_binding !== 'NONE' && value.artifact_binding !== 'SOURCE_COMMIT_ONLY')
        errors.push(`${label} has no integrated stage but claims installed-artifact binding`)
      for (const field of [
        'install_artifact_ref', 'install_artifact_digest', 'installed_artifact_ref',
        'installed_artifact_digest', 'component_set_digest', 'runtime_manifest_ref',
        'runtime_manifest_digest', 'runtime_manifest_id',
      ]) {
        if (value[field] !== 'NONE')
          errors.push(`${label} has no integrated stage but ${field} is not NONE`)
      }
      if (value.proof_origin === 'SOURCE_PROVEN' || value.artifact_binding === 'SOURCE_COMMIT_ONLY') {
        if (!SHA.test(value.source_commit || ''))
          errors.push(`${label}.source_commit must be exact for source-proven state`)
        const sourceRetained = retainedFile(
          value.source_product_path_ref,
          value.source_product_path_digest,
          evidenceRoot,
          `${label}.source_product_path`,
          errors,
        )
        const sourcePath = parseYamlManifest(sourceRetained, `${label}.source_product_path`, errors)
        if (sourcePath) {
          for (const error of validateSourceProductPath(sourcePath, { evidenceRoot }))
            errors.push(`${label}.source_product_path invalid: ${error}`)
          if (sourcePath.profile !== value.profile || sourcePath.source_commit !== value.source_commit)
            errors.push(`${label}.source_product_path profile/source commit does not match ledger row`)
        }
      }
      else if (value.source_product_path_ref !== 'NONE'
        || value.source_product_path_digest !== 'NONE'
        || value.source_commit !== 'NONE') {
        errors.push(`${label} unassigned state cannot carry unverified source-product authority`)
      }
    }
    else {
      if (!['ACTIVE', 'IMPLEMENTED'].includes(value.implementation_state))
        errors.push(`${label} integrated evidence requires ACTIVE or IMPLEMENTED production code`)
      if (!['EXACT_INSTALLED_PRODUCT', 'EXACT_DEPLOYED_PRODUCT'].includes(value.proof_origin))
        errors.push(`${label} integrated evidence requires the exact normal installed/deployed product`)
      if (value.artifact_binding !== 'FULL_EXACT')
        errors.push(`${label} integrated evidence requires FULL_EXACT artifact binding`)
      if (!SHA.test(value.source_commit || ''))
        errors.push(`${label}.source_commit must be exact for integrated evidence`)
      if (!DIGEST.test(value.component_set_digest || ''))
        errors.push(`${label}.component_set_digest must bind the admitted installed package graph`)
      const sourceRetained = retainedFile(
        value.source_product_path_ref,
        value.source_product_path_digest,
        evidenceRoot,
        `${label}.source_product_path`,
        errors,
      )
      const sourcePath = parseYamlManifest(sourceRetained, `${label}.source_product_path`, errors)
      if (sourcePath) {
        for (const error of validateSourceProductPath(sourcePath, { evidenceRoot }))
          errors.push(`${label}.source_product_path invalid: ${error}`)
        if (sourcePath.profile !== value.profile)
          errors.push(`${label}.source_product_path profile does not match ledger row`)
        if (sourcePath.normal_path_state !== value.normal_path_state)
          errors.push(`${label}.normal_path_state does not match SOURCE_PRODUCT_PATH`)
        if (highestIndex >= 2 && sourcePath.normal_path_state !== 'COHERENT_E2E')
          errors.push(`${label} INGEST_RECEIPT and later require a COHERENT_E2E SOURCE_PRODUCT_PATH`)
      }
      retainedFile(
        value.install_artifact_ref,
        value.install_artifact_digest,
        evidenceRoot,
        `${label}.install_artifact`,
        errors,
        { rejectBypassNames: true },
      )
      retainedFile(
        value.installed_artifact_ref,
        value.installed_artifact_digest,
        evidenceRoot,
        `${label}.installed_artifact`,
        errors,
        { rejectBypassNames: true },
      )
      if (!['INSTALLED_OBSERVED', 'COHERENT_E2E'].includes(value.normal_path_state))
        errors.push(`${label} integrated evidence requires an observed normal product path`)
      if (highestIndex >= 2) {
        const runtimeRetained = retainedFile(
          value.runtime_manifest_ref,
          value.runtime_manifest_digest,
          evidenceRoot,
          `${label}.runtime_manifest`,
          errors,
        )
        const runtimeManifest = parseYamlManifest(runtimeRetained, `${label}.runtime_manifest`, errors)
        let producer = null
        if (runtimeManifest && sourcePath) {
          const sourceProductPaths = new Map()
          for (const runtimeProducer of runtimeManifest.producers || []) {
            const ref = runtimeProducer.source_product_path_ref
            if (sourceProductPaths.has(ref))
              continue
            if (ref === value.source_product_path_ref) {
              sourceProductPaths.set(ref, {
                binding: sourcePath,
                digest: value.source_product_path_digest,
                resolvedPath: sourceRetained?.path,
                evidenceRoot,
              })
              continue
            }
            const retained = retainedFile(
              ref,
              runtimeProducer.source_product_path_digest,
              evidenceRoot,
              `${label}.runtime_manifest.source_product_path[${runtimeProducer.profile}]`,
              errors,
            )
            const binding = parseYamlManifest(
              retained,
              `${label}.runtime_manifest.source_product_path[${runtimeProducer.profile}]`,
              errors,
            )
            if (binding) {
              sourceProductPaths.set(ref, {
                binding,
                digest: runtimeProducer.source_product_path_digest,
                resolvedPath: retained?.path,
                evidenceRoot,
              })
            }
          }
          for (const error of validateRuntimeManifest(runtimeManifest, { sourceProductPaths }))
            errors.push(`${label}.runtime_manifest invalid: ${error}`)
          const matching = (runtimeManifest.producers || []).filter(item => item.profile === value.profile)
          if (matching.length !== 1)
            errors.push(`${label}.runtime_manifest must contain exactly one ${value.profile} producer`)
          else
            producer = matching[0]
        }
        crossBindStageChain(stageEvidenceByName, sourcePath, runtimeManifest, producer, value, label, errors)
      }
      else if (value.runtime_manifest_ref !== 'NONE' || value.runtime_manifest_digest !== 'NONE') {
        errors.push(`${label} cannot bind a central runtime before INGEST_RECEIPT`)
      }
      else {
        if (value.runtime_manifest_id !== 'NONE')
          errors.push(`${label} cannot bind a runtime manifest ID before INGEST_RECEIPT`)
        crossBindStageChain(stageEvidenceByName, sourcePath, null, null, value, label, errors)
      }
      if (value.highest_integrated_stage === 'LIVE_UI' && value.normal_path_state !== 'COHERENT_E2E')
        errors.push(`${label} LIVE_UI requires normal_path_state COHERENT_E2E`)
    }
  }
  return errors
}

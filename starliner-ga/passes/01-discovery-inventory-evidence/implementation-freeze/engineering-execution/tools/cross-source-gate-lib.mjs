import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

import { parseCsv } from './csv-lib.mjs'
import {
  frozenIdentityBindingRule,
  frozenRelationshipRule,
  validateSensorVerticalState,
} from './sensor-vertical-state-lib.mjs'

export const CROSS_SOURCE_GATE_HEADER = [
  'gate_id', 'state', 'endpoint_vertical_id', 'browser_vertical_id',
  'runtime_manifest_ref', 'runtime_manifest_digest',
  'positive_binding_ref', 'positive_binding_digest',
  'positive_relationship_ref', 'positive_relationship_digest',
  'unresolved_candidates_ref', 'unresolved_candidates_digest',
  'no_fabricated_merge_ref', 'no_fabricated_merge_digest',
  'pending_dependency_ref', 'pending_dependency_digest',
  'reevaluation_ref', 'reevaluation_digest', 'replay_ref', 'replay_digest',
  'next_action',
]

const EVIDENCE = [
  ['POSITIVE_BINDING', 'positive_binding_ref', 'positive_binding_digest', 'trusted_binding_accepted'],
  ['POSITIVE_RELATIONSHIP', 'positive_relationship_ref', 'positive_relationship_digest', 'materialized_once'],
  ['UNRESOLVED_CANDIDATES', 'unresolved_candidates_ref', 'unresolved_candidates_digest', 'candidates_retained_separate'],
  ['NO_FABRICATED_MERGE', 'no_fabricated_merge_ref', 'no_fabricated_merge_digest', 'zero_weak_key_merge'],
  ['PENDING_DEPENDENCY', 'pending_dependency_ref', 'pending_dependency_digest', 'pending_dependency_durable'],
  ['REEVALUATION', 'reevaluation_ref', 'reevaluation_digest', 'reevaluated_after_binding'],
  ['REPLAY', 'replay_ref', 'replay_digest', 'no_duplicate_binding_relationship'],
]
const SAFE_REF = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9_.\/-]+$/
const FORBIDDEN = /(?:^|[\/_.-])(?:fixture|mock|preview|manual|synthetic|hotfix|tmp)(?:[\/_.-]|$)/i
const DIGEST = /^sha256:[0-9a-f]{64}$/
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const EVIDENCE_KEYS = [
  'schema', 'gate_id', 'evidence_kind', 'result', 'observed_at',
  'integration_run_id', 'logical_tenant_id', 'runtime_manifest_digest',
  'endpoint_vertical_id', 'browser_vertical_id',
  'endpoint_source_record_id', 'browser_source_record_id', 'assertion',
]

const ASSERTION_KEYS = new Map([
  ['POSITIVE_BINDING', [
    'binding_rule_id', 'endpoint_source_object_id', 'browser_source_object_id',
    'endpoint_entity_id', 'browser_entity_id', 'endpoint_evidence_id',
    'browser_evidence_id', 'binding_evidence_id', 'trust_basis', 'weak_key_only',
  ]],
  ['POSITIVE_RELATIONSHIP', [
    'relationship_id', 'relationship_rule_id', 'relationship_version', 'predicate',
    'subject_entity_id', 'object_entity_id', 'evidence_id',
    'materialized_count',
  ]],
  ['UNRESOLVED_CANDIDATES', [
    'endpoint_candidate_id', 'browser_candidate_id', 'endpoint_entity_id',
    'browser_entity_id', 'resolution_state', 'reason_code', 'visible_in_api',
  ]],
  ['NO_FABRICATED_MERGE', [
    'endpoint_entity_id', 'browser_entity_id', 'weak_key',
    'fabricated_merge_count',
  ]],
  ['PENDING_DEPENDENCY', [
    'candidate_id', 'dependency_id', 'state', 'persisted', 'wake_count',
  ]],
  ['REEVALUATION', [
    'candidate_id', 'dependency_id', 'trigger_binding_id', 'state',
    'materialized_relationship_id', 'wake_count',
  ]],
  ['REPLAY', [
    'original_delivery_id', 'replay_delivery_id', 'canonical_entity_count_delta',
    'binding_count_delta', 'relationship_count_delta', 'outbox_count_delta',
  ]],
])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function retained(reference, expected, rootPath, label, errors) {
  if (!SAFE_REF.test(reference || '') || FORBIDDEN.test(reference || '') || !DIGEST.test(expected || '')) {
    errors.push(`${label} must be a non-bypass evidence-root-relative ref plus SHA-256 digest`)
    return null
  }
  if (!rootPath) {
    errors.push(`${label} cannot be verified without an evidence root`)
    return null
  }
  try {
    const root = realpathSync(rootPath)
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
    if (observed !== expected) {
      errors.push(`${label} digest mismatch: expected ${expected}; observed ${observed}`)
      return null
    }
    return bytes
  }
  catch (error) {
    errors.push(`${label} cannot be resolved: ${error.message}`)
    return null
  }
}

function rowsById(sensorText) {
  const rows = parseCsv(sensorText, 'SENSOR_VERTICAL_STATE.csv')
  const header = rows[0]
  return new Map(rows.slice(1).map(row => {
    const value = Object.fromEntries(header.map((field, index) => [field, row[index]]))
    return [value.vertical_id, value]
  }))
}

function retainedJson(reference, expected, evidenceRoot, label, errors) {
  const bytes = retained(reference, expected, evidenceRoot, label, errors)
  if (!bytes)
    return null
  try {
    const value = JSON.parse(bytes.toString('utf8'))
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      errors.push(`${label} must contain one JSON object`)
      return null
    }
    return value
  }
  catch (error) {
    errors.push(`${label} is not JSON: ${error.message}`)
    return null
  }
}

function exactVerticalTrace(row, label, evidenceRoot, errors) {
  if (!row)
    return null
  const native = retainedJson(
    row.native_capture_ref,
    row.native_capture_digest,
    evidenceRoot,
    `${label}.NATIVE_CAPTURE`,
    errors,
  )
  const receipt = retainedJson(
    row.ingest_receipt_ref,
    row.ingest_receipt_digest,
    evidenceRoot,
    `${label}.INGEST_RECEIPT`,
    errors,
  )
  const immutable = retainedJson(
    row.immutable_evidence_ref,
    row.immutable_evidence_digest,
    evidenceRoot,
    `${label}.IMMUTABLE_EVIDENCE`,
    errors,
  )
  const canonical = retainedJson(
    row.canonical_entity_ref,
    row.canonical_entity_digest,
    evidenceRoot,
    `${label}.CANONICAL_ENTITY`,
    errors,
  )
  if (!native || !receipt || !immutable || !canonical)
    return null
  return {
    integrationRunId: native.integration_run_id,
    logicalTenantId: native.logical_tenant_id,
    sourceRecordId: native.source_record_id,
    receiptRecordId: receipt.assertion?.receipt_record_id,
    evidenceId: immutable.assertion?.evidence_id,
    entityId: canonical.assertion?.entity_id,
    entityType: canonical.assertion?.entity_type,
    sourceObjectId: canonical.assertion?.source_object_id,
  }
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() === value && value.length > 0 && value !== 'NONE'
}

function exactKeys(value, keys) {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort())
}

function validateAssertion(kind, assertion, label, context, errors) {
  const keys = ASSERTION_KEYS.get(kind)
  if (!assertion || Array.isArray(assertion) || typeof assertion !== 'object') {
    errors.push(`${label}.assertion must be one object`)
    return
  }
  if (!exactKeys(assertion, keys))
    errors.push(`${label}.assertion keys must be exactly the frozen ${kind} contract`)
  const requireStrings = keys.filter(key => ![
    'weak_key_only', 'relationship_version', 'materialized_count', 'visible_in_api',
    'fabricated_merge_count', 'persisted', 'wake_count',
    'canonical_entity_count_delta', 'binding_count_delta',
    'relationship_count_delta', 'outbox_count_delta',
  ].includes(key))
  for (const field of requireStrings) {
    if (!nonEmpty(assertion[field]))
      errors.push(`${label}.assertion.${field} must be a non-empty concrete identifier or semantic`)
  }
  if (kind === 'POSITIVE_BINDING') {
    const authority = frozenIdentityBindingRule('browser', assertion.binding_rule_id)
    if (!authority)
      errors.push(`${label}.assertion.binding_rule_id does not resolve to the frozen Browser identity-assertion authority`)
    if (assertion.trust_basis !== 'signed_local_binding')
      errors.push(`${label}.assertion.trust_basis must be signed_local_binding for Browser-to-Endpoint proof`)
    if (assertion.weak_key_only !== false)
      errors.push(`${label}.assertion.weak_key_only must be false`)
    for (const field of [
      'endpoint_entity_id', 'browser_entity_id', 'endpoint_evidence_id',
      'browser_evidence_id', 'binding_evidence_id',
    ]) {
      if (!UUID.test(assertion[field] || ''))
        errors.push(`${label}.assertion.${field} must be an exact UUID`)
    }
    context.positiveBinding = assertion
  }
  else if (kind === 'POSITIVE_RELATIONSHIP') {
    if (!Number.isSafeInteger(assertion.relationship_version) || assertion.relationship_version < 1)
      errors.push(`${label}.assertion.relationship_version must be a positive safe integer`)
    if (assertion.materialized_count !== 1)
      errors.push(`${label}.assertion.materialized_count must be exactly 1`)
    for (const field of ['relationship_id', 'subject_entity_id', 'object_entity_id', 'evidence_id']) {
      if (!UUID.test(assertion[field] || ''))
        errors.push(`${label}.assertion.${field} must be an exact UUID`)
    }
    const authority = frozenRelationshipRule(assertion.relationship_rule_id)
    if (!authority)
      errors.push(`${label}.assertion.relationship_rule_id does not exist in the frozen relationship registry`)
    else {
      if (authority.predicate !== assertion.predicate)
        errors.push(`${label}.assertion.predicate does not match the frozen relationship rule`)
      const sources = authority.source.split('+').map(value => value.trim())
      if (!sources.includes('Browser') || !sources.includes('Endpoint'))
        errors.push(`${label}.assertion.relationship_rule_id is not a Browser+Endpoint rule`)
      if (authority.support_state === 'future_connector_required' || authority.automatic_materialization === 'no')
        errors.push(`${label}.assertion.relationship_rule_id is not materializable by this launch gate`)
    }
    context.positiveRelationship = assertion
  }
  else if (kind === 'UNRESOLVED_CANDIDATES') {
    for (const field of ['endpoint_entity_id', 'browser_entity_id']) {
      if (!UUID.test(assertion[field] || ''))
        errors.push(`${label}.assertion.${field} must be an exact UUID`)
    }
    if (assertion.endpoint_entity_id === assertion.browser_entity_id)
      errors.push(`${label}.assertion must retain distinct Endpoint and Browser entities`)
    if (assertion.resolution_state !== 'unresolved' || assertion.visible_in_api !== true)
      errors.push(`${label}.assertion must retain a customer-visible unresolved state`)
    context.unresolved = assertion
  }
  else if (kind === 'NO_FABRICATED_MERGE') {
    for (const field of ['endpoint_entity_id', 'browser_entity_id']) {
      if (!UUID.test(assertion[field] || ''))
        errors.push(`${label}.assertion.${field} must be an exact UUID`)
    }
    if (assertion.endpoint_entity_id === assertion.browser_entity_id || assertion.fabricated_merge_count !== 0)
      errors.push(`${label}.assertion must prove distinct entities and zero fabricated merges`)
    context.noMerge = assertion
  }
  else if (kind === 'PENDING_DEPENDENCY') {
    if (assertion.state !== 'pending_dependency' || assertion.persisted !== true || assertion.wake_count !== 0)
      errors.push(`${label}.assertion must prove a durable unwoken pending dependency`)
    context.pending = assertion
  }
  else if (kind === 'REEVALUATION') {
    if (assertion.state !== 'materialized' || assertion.wake_count !== 1)
      errors.push(`${label}.assertion must prove exactly one durable reevaluation and materialization`)
    context.reevaluation = assertion
  }
  else if (kind === 'REPLAY') {
    if (assertion.original_delivery_id === assertion.replay_delivery_id)
      errors.push(`${label}.assertion must identify distinct original and replay attempts`)
    for (const field of [
      'canonical_entity_count_delta', 'binding_count_delta',
      'relationship_count_delta', 'outbox_count_delta',
    ]) {
      if (assertion[field] !== 0)
        errors.push(`${label}.assertion.${field} must be zero`)
    }
  }
}

export function validateCrossSourceGate(text, sensorText, evidenceRoot = null) {
  const errors = []
  let rows
  let verticals
  try {
    rows = parseCsv(text, 'CROSS_SOURCE_GATE.csv')
    verticals = rowsById(sensorText)
  }
  catch (error) {
    return [error.message]
  }
  if (JSON.stringify(rows[0]) !== JSON.stringify(CROSS_SOURCE_GATE_HEADER))
    return ['CROSS_SOURCE_GATE.csv header does not match the frozen cross-source contract']
  if (rows.length !== 2)
    errors.push('CROSS_SOURCE_GATE.csv must contain exactly one immediate Endpoint+Browser gate row')
  const sensorErrors = validateSensorVerticalState(sensorText, evidenceRoot)
  errors.push(...sensorErrors.map(error => `SENSOR_VERTICAL_STATE: ${error}`))
  if (rows.length < 2)
    return errors
  const value = Object.fromEntries(CROSS_SOURCE_GATE_HEADER.map((field, index) => [field, rows[1][index]]))
  if (value.gate_id !== 'CSG-ENDPOINT-BROWSER-001')
    errors.push('cross-source gate_id must be CSG-ENDPOINT-BROWSER-001')
  if (!['OPEN', 'PROVEN'].includes(value.state))
    errors.push('cross-source state must be OPEN or PROVEN')
  if (!value.next_action || value.next_action === 'NONE' && value.state === 'OPEN')
    errors.push('open cross-source gate requires a next_action')
  const endpoint = verticals.get(value.endpoint_vertical_id)
  const browser = verticals.get(value.browser_vertical_id)
  if (value.state === 'OPEN') {
    for (const field of CROSS_SOURCE_GATE_HEADER.slice(2, -1)) {
      if (value[field] !== 'NONE')
        errors.push(`open cross-source gate must set ${field}=NONE`)
    }
    return errors
  }
  if (!endpoint || endpoint.profile !== 'endpoint' || endpoint.capability_id !== 'PC-004')
    errors.push('proven cross-source gate must reference the valid Endpoint vertical')
  if (!browser || browser.profile !== 'browser' || browser.capability_id !== 'PC-002')
    errors.push('proven cross-source gate must reference the valid Browser vertical')
  for (const [label, vertical] of [['Endpoint', endpoint], ['Browser', browser]]) {
    if (vertical && vertical.highest_integrated_stage !== 'LIVE_UI')
      errors.push(`${label} vertical must reach LIVE_UI before the cross-source gate is proven`)
    if (vertical && vertical.normal_path_state !== 'COHERENT_E2E')
      errors.push(`${label} vertical must be a coherent exact-product path`)
  }
  if (endpoint && browser && endpoint.runtime_manifest_digest !== browser.runtime_manifest_digest)
    errors.push('Endpoint and Browser verticals do not bind the same runtime manifest')
  if (endpoint && value.runtime_manifest_digest !== endpoint.runtime_manifest_digest)
    errors.push('cross-source runtime manifest does not match the source verticals')
  retained(value.runtime_manifest_ref, value.runtime_manifest_digest, evidenceRoot, 'cross-source runtime manifest', errors)

  const endpointTrace = exactVerticalTrace(endpoint, 'Endpoint vertical trace', evidenceRoot, errors)
  const browserTrace = exactVerticalTrace(browser, 'Browser vertical trace', evidenceRoot, errors)
  if (endpointTrace && browserTrace) {
    if (endpointTrace.integrationRunId !== browserTrace.integrationRunId)
      errors.push('Endpoint and Browser vertical traces do not belong to the same integration run')
    if (endpointTrace.logicalTenantId !== browserTrace.logicalTenantId)
      errors.push('Endpoint and Browser vertical traces do not belong to the same logical tenant')
    for (const [traceLabel, trace] of [['Endpoint', endpointTrace], ['Browser', browserTrace]]) {
      if (trace.receiptRecordId !== trace.sourceRecordId)
        errors.push(`${traceLabel} vertical receipt is not bound to its exact envelope source record`)
    }
  }

  let first = null
  const context = {}
  const evidenceDigests = new Set()
  for (const [kind, refField, digestField, result] of EVIDENCE) {
    if (evidenceDigests.has(value[digestField]))
      errors.push(`${kind} reuses another proof file instead of retaining distinct evidence`)
    evidenceDigests.add(value[digestField])
    const bytes = retained(value[refField], value[digestField], evidenceRoot, kind, errors)
    if (!bytes)
      continue
    let proof
    try {
      proof = JSON.parse(bytes.toString('utf8'))
    }
    catch (error) {
      errors.push(`${kind} is not JSON: ${error.message}`)
      continue
    }
    if (!proof || Array.isArray(proof) || typeof proof !== 'object') {
      errors.push(`${kind} must be one JSON object`)
      continue
    }
    if (JSON.stringify(Object.keys(proof).sort()) !== JSON.stringify([...EVIDENCE_KEYS].sort()))
      errors.push(`${kind} keys must be exactly the frozen proof contract`)
    const expected = {
      schema: 'die.cross-source-gate-evidence.v1',
      gate_id: value.gate_id,
      evidence_kind: kind,
      result,
      runtime_manifest_digest: value.runtime_manifest_digest,
      endpoint_vertical_id: value.endpoint_vertical_id,
      browser_vertical_id: value.browser_vertical_id,
    }
    if (endpointTrace && browserTrace) {
      Object.assign(expected, {
        integration_run_id: endpointTrace.integrationRunId,
        logical_tenant_id: endpointTrace.logicalTenantId,
        endpoint_source_record_id: endpointTrace.sourceRecordId,
        browser_source_record_id: browserTrace.sourceRecordId,
      })
    }
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (proof[field] !== expectedValue)
        errors.push(`${kind}.${field} must be ${expectedValue}`)
    }
    validateAssertion(kind, proof.assertion, kind, context, errors)
    if (!RFC3339.test(proof.observed_at || '') || Number.isNaN(Date.parse(proof.observed_at)))
      errors.push(`${kind}.observed_at must be RFC3339`)
    for (const field of ['integration_run_id', 'logical_tenant_id']) {
      if (!proof[field] || typeof proof[field] !== 'string')
        errors.push(`${kind}.${field} is required`)
    }
    if (!first)
      first = proof
    else {
      for (const field of ['integration_run_id', 'logical_tenant_id']) {
        if (proof[field] !== first[field])
          errors.push(`${kind}.${field} does not match the continuous cross-source run`)
      }
    }
  }
  if (context.positiveBinding && endpointTrace && browserTrace) {
    const exact = new Map([
      ['endpoint_source_object_id', endpointTrace.sourceObjectId],
      ['browser_source_object_id', browserTrace.sourceObjectId],
      ['endpoint_entity_id', endpointTrace.entityId],
      ['browser_entity_id', browserTrace.entityId],
      ['endpoint_evidence_id', endpointTrace.evidenceId],
      ['browser_evidence_id', browserTrace.evidenceId],
    ])
    for (const [field, expected] of exact) {
      if (context.positiveBinding[field] !== expected)
        errors.push(`POSITIVE_BINDING.${field} must match the exact validated source vertical trace`)
    }
  }
  if (context.positiveBinding && context.positiveRelationship) {
    const bound = new Set([
      context.positiveBinding.endpoint_entity_id,
      context.positiveBinding.browser_entity_id,
    ])
    if (!bound.has(context.positiveRelationship.subject_entity_id)
      || !bound.has(context.positiveRelationship.object_entity_id)
      || context.positiveRelationship.subject_entity_id === context.positiveRelationship.object_entity_id) {
      errors.push('POSITIVE_RELATIONSHIP endpoints must be the two trusted-bound entities')
    }
    if (context.positiveRelationship.evidence_id !== context.positiveBinding.binding_evidence_id)
      errors.push('POSITIVE_RELATIONSHIP.evidence_id must match the accepted binding evidence')
    const rule = frozenRelationshipRule(context.positiveRelationship.relationship_rule_id)
    if (rule && endpointTrace && browserTrace) {
      if (context.positiveRelationship.subject_entity_id !== browserTrace.entityId
        || context.positiveRelationship.object_entity_id !== endpointTrace.entityId) {
        errors.push('POSITIVE_RELATIONSHIP must preserve the frozen Browser-subject/Endpoint-object direction')
      }
      if (rule.subject !== browserTrace.entityType || rule.object !== endpointTrace.entityType) {
        errors.push('POSITIVE_RELATIONSHIP rule is not applicable to the exact canonical endpoint types')
      }
    }
  }
  if (context.unresolved && context.noMerge) {
    for (const field of ['endpoint_entity_id', 'browser_entity_id']) {
      if (context.unresolved[field] !== context.noMerge[field])
        errors.push(`NO_FABRICATED_MERGE.${field} must match the unresolved-negative scenario`)
    }
  }
  if (context.unresolved && endpointTrace && browserTrace) {
    if (context.unresolved.endpoint_entity_id !== endpointTrace.entityId
      || context.unresolved.browser_entity_id !== browserTrace.entityId) {
      errors.push('UNRESOLVED_CANDIDATES must use the exact source-vertical canonical entities')
    }
  }
  if (context.pending && context.reevaluation) {
    for (const field of ['candidate_id', 'dependency_id']) {
      if (context.pending[field] !== context.reevaluation[field])
        errors.push(`REEVALUATION.${field} must wake the retained pending dependency`)
    }
    if (context.positiveRelationship
      && context.reevaluation.materialized_relationship_id !== context.positiveRelationship.relationship_id) {
      errors.push('REEVALUATION.materialized_relationship_id must match the exactly-once relationship')
    }
  }
  return errors
}

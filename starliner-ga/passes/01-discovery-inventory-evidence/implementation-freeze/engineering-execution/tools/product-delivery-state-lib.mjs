export const PRODUCT_DELIVERY_HEADER = [
  'capability_id',
  'implementation_state',
  'integration_state',
  'evidence_state',
  'release_state',
  'runtime_mode',
  'highest_proven_stage',
  'development_blocked',
  'blocker_class',
  'blocked_on',
  'blocked_action',
  'blocker_evidence',
  'blocker_owner',
  'unblock_condition',
  'blocker_recheck_at',
  'independent_next_action',
  'authority_commit',
  'last_verified_sha',
  'runtime_manifest',
  'runtime_manifest_digest',
  'next_product_action',
  'limitations_json',
]

const SHA = /^[0-9a-f]{40}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const IMPLEMENTATION = new Set(['NOT_STARTED', 'ACTIVE', 'IMPLEMENTED', 'SUPERSEDED'])
const INTEGRATION = new Set(['NOT_CONNECTED', 'PARTIAL_PATH', 'E2E_DEV', 'E2E_EXACT_SHA'])
const EVIDENCE = new Set(['NOT_RUN', 'TEST_VERIFIED', 'RUNTIME_OBSERVED_DEV', 'EXACT_SHA_LOCAL', 'EXACT_SHA_ISOLATED', 'RELEASE_BOUND'])
const RELEASE = new Set(['NOT_ELIGIBLE', 'INTERNAL_ONLY', 'CANDIDATE', 'RELEASABLE'])
const RUNTIME = new Set(['NONE', 'UNIT_HARNESS', 'DEV_PREVIEW', 'COHERENT_LOCAL_PRODUCT', 'ISOLATED_INTEGRATION', 'RELEASE_CANDIDATE'])
const STAGES = new Set(['NONE', 'NATIVE_CAPTURE', 'LOCAL_WAL', 'INGEST_RECEIPT', 'IMMUTABLE_EVIDENCE', 'NORMALIZED', 'CANONICAL_ENTITY', 'CANONICAL_GRAPH_ACTIVITY', 'PROJECTED', 'AUTHORIZED_API', 'LIVE_UI', 'REBUILD_REPLAY', 'RELEASE_QUALIFIED'])
const BLOCKERS = new Set(['NONE', 'CONTRACT_CONTRADICTION', 'EXTERNAL_CREDENTIAL', 'EXTERNAL_INFRASTRUCTURE', 'PRIVILEGED_USER_ACTION', 'DESTRUCTIVE_APPROVAL'])
const FORBIDDEN_BLOCKER_TARGET = /\bLG-?00[1-8]\b|\bDIE-WP[0-9]{2}\b|remote validator|pull request|PR review/i
const OVERBROAD_BLOCKED_ACTION = /\b(?:all|broad|entire) (?:implementation|coding|development|program)\b/i
const SAFE_EVIDENCE_REF = /^(?!\/)(?!.*\.\.)[A-Za-z0-9_.\/-]+$/

export function parseCsv(text, label = 'CSV') {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      }
      else if (character === '"')
        quoted = false
      else
        field += character
    }
    else if (character === '"')
      quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    }
    else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value !== ''))
        rows.push(row)
      row = []
      field = ''
    }
    else
      field += character
  }
  if (quoted)
    throw new Error(`${label} has an unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length)
    throw new Error(`${label} is empty`)
  const width = rows[0].length
  rows.forEach((candidate, index) => {
    if (candidate.length !== width)
      throw new Error(`${label}:${index + 1} has ${candidate.length} columns; expected ${width}`)
  })
  return rows
}

function csv(value) {
  const string = String(value)
  if (/[",\n\r]/.test(string))
    return `"${string.replaceAll('"', '""')}"`
  return string
}

export function serializeCsv(rows) {
  return `${rows.map(row => row.map(csv).join(',')).join('\n')}\n`
}

function includes(set, value, path, errors) {
  if (!set.has(value))
    errors.push(`${path} has invalid value ${value}`)
}

function exactShaOrNone(value) {
  return value === 'NONE' || SHA.test(value)
}

function manifestPath(value) {
  return value === 'NONE'
    || (/^(?!\/)(?!.*\.\.)[A-Za-z0-9_.\/-]+\.ya?ml$/.test(value))
}

export function rowToExecutionStatus(row, line = 0) {
  const value = Object.fromEntries(PRODUCT_DELIVERY_HEADER.map((name, index) => [name, row[index]]))
  let limitations = null
  try {
    limitations = JSON.parse(value.limitations_json)
  }
  catch {
    limitations = Symbol('invalid limitations JSON')
  }
  return {
    line,
    value: {
      ...value,
      development_blocked: value.development_blocked === 'true'
        ? true
        : value.development_blocked === 'false'
          ? false
          : value.development_blocked,
      limitations,
    },
  }
}

export function validateExecutionStatus(status, label = status.capability_id || 'execution status') {
  const errors = []
  if (!/^PC-[0-9]{3}$/.test(status.capability_id || ''))
    errors.push(`${label}.capability_id is invalid`)
  includes(IMPLEMENTATION, status.implementation_state, `${label}.implementation_state`, errors)
  includes(INTEGRATION, status.integration_state, `${label}.integration_state`, errors)
  includes(EVIDENCE, status.evidence_state, `${label}.evidence_state`, errors)
  includes(RELEASE, status.release_state, `${label}.release_state`, errors)
  includes(RUNTIME, status.runtime_mode, `${label}.runtime_mode`, errors)
  includes(STAGES, status.highest_proven_stage, `${label}.highest_proven_stage`, errors)
  includes(BLOCKERS, status.blocker_class, `${label}.blocker_class`, errors)
  if (typeof status.development_blocked !== 'boolean')
    errors.push(`${label}.development_blocked must be true or false`)
  if (!SHA.test(status.authority_commit || ''))
    errors.push(`${label}.authority_commit must be an exact 40-hex commit`)
  if (!exactShaOrNone(status.last_verified_sha || ''))
    errors.push(`${label}.last_verified_sha is invalid`)
  if (!manifestPath(status.runtime_manifest || ''))
    errors.push(`${label}.runtime_manifest must be NONE or a safe relative YAML path`)
  if (!(status.runtime_manifest_digest === 'NONE' || DIGEST.test(status.runtime_manifest_digest || '')))
    errors.push(`${label}.runtime_manifest_digest is invalid`)
  if (!status.next_product_action)
    errors.push(`${label}.next_product_action is required`)
  if (!Array.isArray(status.limitations)
    || status.limitations.some(item => typeof item !== 'string' || !item)
    || new Set(status.limitations).size !== status.limitations.length) {
    errors.push(`${label}.limitations_json must encode a unique array of non-empty strings`)
  }

  const blockerFields = [
    'blocked_on', 'blocked_action', 'blocker_evidence', 'blocker_owner',
    'unblock_condition', 'blocker_recheck_at', 'independent_next_action',
  ]
  if (status.development_blocked === false) {
    if (status.blocker_class !== 'NONE')
      errors.push(`${label} is unblocked but blocker_class is ${status.blocker_class}`)
    blockerFields.forEach(field => {
      if (status[field] !== 'NONE')
        errors.push(`${label} is unblocked but ${field} is not NONE`)
    })
  }
  else if (status.development_blocked === true) {
    if (status.blocker_class === 'NONE')
      errors.push(`${label} is blocked without a valid blocker_class`)
    for (const field of blockerFields) {
      if (!status[field] || status[field] === 'NONE')
        errors.push(`${label} is blocked without ${field}`)
    }
    if (!RFC3339.test(status.blocker_recheck_at || ''))
      errors.push(`${label}.blocker_recheck_at must be RFC3339 when blocked`)
    if (FORBIDDEN_BLOCKER_TARGET.test(status.blocked_on || ''))
      errors.push(`${label}.blocked_on names a release gate, work package, review, or validator instead of an external condition`)
    if (OVERBROAD_BLOCKED_ACTION.test(status.blocked_action || ''))
      errors.push(`${label}.blocked_action is broader than one exact externally blocked action`)
    if (!SAFE_EVIDENCE_REF.test(status.blocker_evidence || ''))
      errors.push(`${label}.blocker_evidence must be a safe relative retained-evidence path`)
  }

  const requireManifest = () => {
    if (status.runtime_manifest === 'NONE' || !DIGEST.test(status.runtime_manifest_digest || ''))
      errors.push(`${label} must bind a runtime manifest path and digest`)
  }
  const requireVerifiedSha = () => {
    if (!SHA.test(status.last_verified_sha || ''))
      errors.push(`${label} must bind an exact verified SHA`)
  }

  const modeRules = {
    NONE: {
      integration: ['NOT_CONNECTED'], evidence: ['NOT_RUN'], release: ['NOT_ELIGIBLE'],
    },
    UNIT_HARNESS: {
      integration: ['NOT_CONNECTED', 'PARTIAL_PATH'], evidence: ['TEST_VERIFIED'], release: ['NOT_ELIGIBLE', 'INTERNAL_ONLY'],
    },
    DEV_PREVIEW: {
      integration: ['NOT_CONNECTED', 'PARTIAL_PATH'], evidence: ['RUNTIME_OBSERVED_DEV'], release: ['NOT_ELIGIBLE', 'INTERNAL_ONLY'],
    },
    COHERENT_LOCAL_PRODUCT: {
      integration: ['PARTIAL_PATH', 'E2E_DEV'], evidence: ['RUNTIME_OBSERVED_DEV', 'EXACT_SHA_LOCAL'], release: ['NOT_ELIGIBLE', 'INTERNAL_ONLY'],
    },
    ISOLATED_INTEGRATION: {
      integration: ['PARTIAL_PATH', 'E2E_EXACT_SHA'], evidence: ['EXACT_SHA_ISOLATED'], release: ['NOT_ELIGIBLE', 'INTERNAL_ONLY'],
    },
    RELEASE_CANDIDATE: {
      integration: ['PARTIAL_PATH', 'E2E_EXACT_SHA'], evidence: ['EXACT_SHA_ISOLATED', 'RELEASE_BOUND'], release: ['NOT_ELIGIBLE', 'INTERNAL_ONLY', 'CANDIDATE', 'RELEASABLE'],
    },
  }
  const rule = modeRules[status.runtime_mode]
  if (rule) {
    if (!rule.integration.includes(status.integration_state))
      errors.push(`${label} runtime_mode ${status.runtime_mode} cannot claim integration_state ${status.integration_state}`)
    if (!rule.evidence.includes(status.evidence_state))
      errors.push(`${label} runtime_mode ${status.runtime_mode} cannot claim evidence_state ${status.evidence_state}`)
    if (!rule.release.includes(status.release_state))
      errors.push(`${label} runtime_mode ${status.runtime_mode} cannot claim release_state ${status.release_state}`)
  }

  if (status.runtime_mode === 'NONE') {
    if (status.highest_proven_stage !== 'NONE'
      || status.last_verified_sha !== 'NONE'
      || status.runtime_manifest !== 'NONE'
      || status.runtime_manifest_digest !== 'NONE') {
      errors.push(`${label} NONE runtime must have no proven stage, verified SHA, or runtime manifest`)
    }
  }
  else {
    requireVerifiedSha()
    if (status.runtime_mode === 'UNIT_HARNESS') {
      if (status.runtime_manifest !== 'NONE' || status.runtime_manifest_digest !== 'NONE')
        errors.push(`${label} UNIT_HARNESS cannot claim an integrated runtime manifest`)
    }
    else
      requireManifest()
  }

  if (status.implementation_state === 'NOT_STARTED') {
    if (status.runtime_mode !== 'NONE' || status.integration_state !== 'NOT_CONNECTED'
      || status.evidence_state !== 'NOT_RUN' || status.release_state !== 'NOT_ELIGIBLE'
      || status.highest_proven_stage !== 'NONE') {
      errors.push(`${label} NOT_STARTED cannot claim runtime, evidence, integration, release, or product stage progress`)
    }
  }
  if (status.implementation_state === 'IMPLEMENTED') {
    if (status.evidence_state === 'NOT_RUN' || status.runtime_mode === 'NONE'
      || status.highest_proven_stage === 'NONE') {
      errors.push(`${label} IMPLEMENTED requires verified production-path code and a proven stage`)
    }
    requireVerifiedSha()
  }
  if (status.implementation_state === 'SUPERSEDED' && status.release_state !== 'NOT_ELIGIBLE')
    errors.push(`${label} SUPERSEDED cannot be release eligible`)

  if (status.integration_state === 'E2E_DEV' && status.runtime_mode !== 'COHERENT_LOCAL_PRODUCT')
    errors.push(`${label} E2E_DEV requires COHERENT_LOCAL_PRODUCT`)
  if (status.integration_state === 'E2E_EXACT_SHA'
    && !['ISOLATED_INTEGRATION', 'RELEASE_CANDIDATE'].includes(status.runtime_mode)) {
    errors.push(`${label} E2E_EXACT_SHA requires isolated or release-candidate runtime`)
  }
  if (status.release_state === 'CANDIDATE') {
    if (status.integration_state !== 'E2E_EXACT_SHA' || status.evidence_state !== 'RELEASE_BOUND'
      || status.runtime_mode !== 'RELEASE_CANDIDATE') {
      errors.push(`${label} CANDIDATE requires E2E_EXACT_SHA RELEASE_BOUND release-candidate evidence`)
    }
  }
  if (status.release_state === 'RELEASABLE') {
    if (status.integration_state !== 'E2E_EXACT_SHA' || status.evidence_state !== 'RELEASE_BOUND'
      || status.runtime_mode !== 'RELEASE_CANDIDATE' || status.highest_proven_stage !== 'RELEASE_QUALIFIED') {
      errors.push(`${label} RELEASABLE requires release-bound exact-SHA qualification`)
    }
  }
  if (status.highest_proven_stage === 'RELEASE_QUALIFIED' && status.release_state !== 'RELEASABLE')
    errors.push(`${label} RELEASE_QUALIFIED requires RELEASABLE`)
  if (['LIVE_UI', 'REBUILD_REPLAY'].includes(status.highest_proven_stage)
    && !['E2E_DEV', 'E2E_EXACT_SHA'].includes(status.integration_state)) {
    errors.push(`${label} ${status.highest_proven_stage} requires coherent E2E integration`)
  }
  return errors
}

export function requiredCapabilityIds(capabilityMapText) {
  const rows = parseCsv(capabilityMapText, 'product-capability-map.csv')
  const header = rows[0]
  const idIndex = header.indexOf('capability_id')
  const requiredIndex = header.indexOf('completion_required')
  const scopeIndex = header.indexOf('scope')
  if ([idIndex, requiredIndex, scopeIndex].includes(-1))
    throw new Error('product capability map lacks capability_id/completion_required/scope')
  return rows.slice(1)
    .filter(row => row[requiredIndex] === 'YES' && row[scopeIndex] === 'bounded_die')
    .map(row => row[idIndex])
}

export function validateProductDeliveryState(stateText, capabilityMapText) {
  const errors = []
  let rows
  try {
    rows = parseCsv(stateText, 'PRODUCT_DELIVERY_STATE.csv')
  }
  catch (error) {
    return [error.message]
  }
  if (JSON.stringify(rows[0]) !== JSON.stringify(PRODUCT_DELIVERY_HEADER))
    errors.push('PRODUCT_DELIVERY_STATE.csv header does not match the execution-state contract')
  const required = new Set(requiredCapabilityIds(capabilityMapText))
  const seen = new Set()
  rows.slice(1).forEach((row, index) => {
    if (row.length !== PRODUCT_DELIVERY_HEADER.length)
      return
    const { value } = rowToExecutionStatus(row, index + 2)
    if (seen.has(value.capability_id))
      errors.push(`PRODUCT_DELIVERY_STATE.csv duplicates ${value.capability_id}`)
    seen.add(value.capability_id)
    if (!required.has(value.capability_id))
      errors.push(`PRODUCT_DELIVERY_STATE.csv contains non-required capability ${value.capability_id}`)
    errors.push(...validateExecutionStatus(value, `PRODUCT_DELIVERY_STATE.csv:${index + 2}`))
  })
  for (const id of required) {
    if (!seen.has(id))
      errors.push(`PRODUCT_DELIVERY_STATE.csv omits required capability ${id}`)
  }
  return errors
}

export function initializeProductDeliveryState(capabilityMapText, authorityCommit) {
  if (!SHA.test(authorityCommit || ''))
    throw new Error('authority commit must be exactly 40 lowercase hexadecimal characters')
  const ids = requiredCapabilityIds(capabilityMapText)
  const rows = [PRODUCT_DELIVERY_HEADER]
  for (const id of ids) {
    rows.push([
      id,
      'NOT_STARTED',
      'NOT_CONNECTED',
      'NOT_RUN',
      'NOT_ELIGIBLE',
      'NONE',
      'NONE',
      'false',
      'NONE',
      'NONE',
      'NONE',
      'NONE',
      'NONE',
      'NONE',
      'NONE',
      'NONE',
      authorityCommit,
      'NONE',
      'NONE',
      'NONE',
      `Start the next production-path action for ${id} from the frozen authority`,
      '[]',
    ])
  }
  return serializeCsv(rows)
}

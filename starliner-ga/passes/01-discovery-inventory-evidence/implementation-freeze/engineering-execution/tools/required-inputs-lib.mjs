import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

import { parseCsv } from './csv-lib.mjs'

export const REQUIRED_INPUTS_HEADER = [
  'input_id', 'capability_id', 'profile', 'input_class',
  'required_value_or_action', 'normal_product_reason', 'disposition',
  'authority_searches_json', 'evidence_ref', 'evidence_digest',
  'expected_safe_format', 'blocked_action', 'owner', 'unblock_condition',
  'recheck_at', 'independent_next_action', 'status',
]

export const REQUIRED_INPUT_DISPOSITIONS = new Set([
  'FOUND',
  'MISSING_PRODUCT_CODE',
  'EXTERNAL_CREDENTIAL',
  'EXTERNAL_INFRASTRUCTURE',
  'PRIVILEGED_USER_ACTION',
  'DESTRUCTIVE_APPROVAL',
  'CONTRACT_CONTRADICTION',
  'UNKNOWN_AFTER_EXHAUSTIVE_SEARCH',
])

const INPUT_CLASSES = new Set([
  'ORGANIZATION_TENANT',
  'OFFICIAL_INSTALL_ARTIFACT',
  'PERSONA_OR_DEVICE_BOOTSTRAP',
  'WORKLOAD_IDENTITY_OR_CREDENTIAL',
  'ENROLLMENT_OR_CONTROL_ENDPOINT',
  'SIGNING_KEY_OR_TRUST_ROOT',
  'PRODUCT_CONFIGURATION',
  'RUNTIME_INFRASTRUCTURE',
  'PRIVILEGED_INSTALL_OR_APPROVAL',
  'DESTRUCTIVE_OPERATION_APPROVAL',
  'NATIVE_PLATFORM_CAPABILITY',
  'OTHER_NORMAL_PRODUCT_PREREQUISITE',
])
const SEARCH_KINDS = [
  'OFFICIAL_INSTALLATION_DOCUMENTATION',
  'INSTALLER_OR_BUILD_SOURCE',
  'PRODUCT_SOURCE',
  'DEPLOYMENT_CONFIGURATION',
  'SAFE_RUNTIME_EVIDENCE',
]
const SEARCH_OUTCOMES = new Set(['FOUND', 'NOT_FOUND', 'NOT_APPLICABLE', 'CONTRADICTS'])
const STATUS = new Set(['OPEN', 'ACTIVE', 'RESOLVED'])
const SHA256 = /^sha256:[0-9a-f]{64}$/
const SAFE_REF = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9_.\/-]+$/
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const PROFILE_CAPABILITY = new Map([
  ['shared_control_plane', 'PC-001'],
  ['browser', 'PC-002'],
  ['browser_backend', 'PC-003'],
  ['endpoint', 'PC-004'],
  ['llm_gateway', 'PC-005'],
  ['mcp_gateway', 'PC-006'],
])
const SECRET_PATTERN = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{8,}\b|\bAKIA[0-9A-Z]{16}\b|\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/
const OVERBROAD_BLOCKED_ACTION = /\b(?:all|broad|entire|whole) (?:implementation|coding|development|program|platform)\b/i
const FORBIDDEN_SUBSTITUTE = /\b(?:use|inject|mint|hard[- ]?code|patch|seed|start|run)\b[^\n]{0,80}\b(?:fixed (?:tenant|producer|installation|certification) id|synthetic (?:tenant|persona|producer)|shared (?:token|secret|credential)|unsigned manifest|manual (?:browser storage|devtools|plist|environment|sql)|alternate daemon|parallel daemon|localhost[- ]only substitute|fake artifact digest|fixture interior|preview persona)\b/i

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function retainedFile(reference, expectedDigest, evidenceRoot, label, errors) {
  if (!SAFE_REF.test(reference || '')) {
    errors.push(`${label} must be a safe evidence-root-relative file reference`)
    return null
  }
  if (!SHA256.test(expectedDigest || '')) {
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
  const observed = sha256(bytes)
  if (observed !== expectedDigest) {
    errors.push(`${label} digest mismatch: expected ${expectedDigest}; observed ${observed}`)
    return null
  }
  if (SECRET_PATTERN.test(bytes.toString('utf8')))
    errors.push(`${label} contains credential material instead of sanitized objective evidence`)
  return bytes
}

function rowObject(row) {
  return Object.fromEntries(REQUIRED_INPUTS_HEADER.map((name, index) => [name, row[index]]))
}

function nonNone(value) {
  return typeof value === 'string' && value.trim() === value && value.length > 0 && value !== 'NONE'
}

function validateSearches(raw, evidenceRoot, label, errors) {
  let searches
  try {
    searches = JSON.parse(raw)
  }
  catch {
    errors.push(`${label}.authority_searches_json is invalid JSON`)
    return []
  }
  if (!Array.isArray(searches)) {
    errors.push(`${label}.authority_searches_json must be an array`)
    return []
  }
  const expectedKeys = ['authority_kind', 'evidence_ref', 'evidence_digest', 'outcome', 'notes'].sort()
  const kinds = new Set()
  for (const [index, search] of searches.entries()) {
    const searchLabel = `${label}.authority_searches_json[${index}]`
    if (!search || Array.isArray(search) || typeof search !== 'object') {
      errors.push(`${searchLabel} must be an object`)
      continue
    }
    if (JSON.stringify(Object.keys(search).sort()) !== JSON.stringify(expectedKeys))
      errors.push(`${searchLabel} keys must be exactly: ${expectedKeys.join(', ')}`)
    if (!SEARCH_KINDS.includes(search.authority_kind))
      errors.push(`${searchLabel}.authority_kind is invalid`)
    else if (kinds.has(search.authority_kind))
      errors.push(`${searchLabel}.authority_kind is duplicated`)
    kinds.add(search.authority_kind)
    if (!SEARCH_OUTCOMES.has(search.outcome))
      errors.push(`${searchLabel}.outcome is invalid`)
    if (!nonNone(search.notes))
      errors.push(`${searchLabel}.notes must state what was searched and found`)
    retainedFile(
      search.evidence_ref,
      search.evidence_digest,
      evidenceRoot,
      `${searchLabel}.evidence`,
      errors,
    )
  }
  for (const kind of SEARCH_KINDS) {
    if (!kinds.has(kind))
      errors.push(`${label}.authority_searches_json omits ${kind}`)
  }
  return searches
}

export function validateRequiredInputs(text, evidenceRoot = null) {
  const errors = []
  let rows
  try {
    rows = parseCsv(text, 'REQUIRED_INPUTS.csv')
  }
  catch (error) {
    return [error.message]
  }
  if (JSON.stringify(rows[0]) !== JSON.stringify(REQUIRED_INPUTS_HEADER)) {
    errors.push('REQUIRED_INPUTS.csv header does not match the frozen required-input contract')
    return errors
  }

  const ids = new Set()
  for (const [index, row] of rows.slice(1).entries()) {
    const line = index + 2
    const value = rowObject(row)
    const label = `REQUIRED_INPUTS.csv:${line}`
    if (!/^RI-[A-Z0-9-]{3,64}$/.test(value.input_id || ''))
      errors.push(`${label}.input_id is invalid`)
    else if (ids.has(value.input_id))
      errors.push(`${label}.input_id is duplicated`)
    ids.add(value.input_id)
    const capability = PROFILE_CAPABILITY.get(value.profile)
    if (!capability)
      errors.push(`${label}.profile is invalid`)
    else if (value.capability_id !== capability)
      errors.push(`${label}.capability_id must be ${capability} for ${value.profile}`)
    if (!INPUT_CLASSES.has(value.input_class))
      errors.push(`${label}.input_class is invalid`)
    if (!REQUIRED_INPUT_DISPOSITIONS.has(value.disposition))
      errors.push(`${label}.disposition is invalid`)
    if (!STATUS.has(value.status))
      errors.push(`${label}.status is invalid`)
    for (const field of ['required_value_or_action', 'normal_product_reason', 'expected_safe_format']) {
      if (!nonNone(value[field]))
        errors.push(`${label}.${field} is required`)
      else if (SECRET_PATTERN.test(value[field]))
        errors.push(`${label}.${field} contains credential material; record only a safe description`)
    }
    for (const field of ['required_value_or_action', 'blocked_action', 'independent_next_action']) {
      if (FORBIDDEN_SUBSTITUTE.test(value[field] || ''))
        errors.push(`${label}.${field} proposes a prohibited product-path substitute`)
    }

    const searches = validateSearches(value.authority_searches_json, evidenceRoot, label, errors)
    retainedFile(value.evidence_ref, value.evidence_digest, evidenceRoot, `${label}.evidence`, errors)

    if (value.disposition === 'FOUND') {
      if (value.status !== 'RESOLVED')
        errors.push(`${label} FOUND input must be RESOLVED`)
      if (!searches.some(search => search.outcome === 'FOUND'))
        errors.push(`${label} FOUND input has no authority search with outcome FOUND`)
      for (const field of [
        'blocked_action', 'owner', 'unblock_condition', 'recheck_at', 'independent_next_action',
      ]) {
        if (value[field] !== 'NONE')
          errors.push(`${label} FOUND input must set ${field}=NONE`)
      }
      continue
    }

    if (value.disposition === 'MISSING_PRODUCT_CODE') {
      if (value.status !== 'ACTIVE')
        errors.push(`${label} MISSING_PRODUCT_CODE must be ACTIVE owned work`)
      if (value.blocked_action !== 'NONE')
        errors.push(`${label} MISSING_PRODUCT_CODE cannot block development`)
      if (!searches.some(search => search.authority_kind === 'PRODUCT_SOURCE'
        && ['NOT_FOUND', 'CONTRADICTS'].includes(search.outcome))) {
        errors.push(`${label} MISSING_PRODUCT_CODE lacks retained product-source gap evidence`)
      }
      for (const field of ['owner', 'unblock_condition', 'independent_next_action']) {
        if (!nonNone(value[field]))
          errors.push(`${label} MISSING_PRODUCT_CODE requires ${field}`)
      }
      if (!RFC3339.test(value.recheck_at || '') || Number.isNaN(Date.parse(value.recheck_at)))
        errors.push(`${label}.recheck_at must be an actual RFC3339 timestamp`)
      continue
    }

    if (value.status !== 'OPEN')
      errors.push(`${label} unavailable external/contradictory/unknown input must remain OPEN`)
    for (const field of [
      'blocked_action', 'owner', 'unblock_condition', 'independent_next_action',
    ]) {
      if (!nonNone(value[field]))
        errors.push(`${label} open input requires ${field}`)
    }
    if (!RFC3339.test(value.recheck_at || '') || Number.isNaN(Date.parse(value.recheck_at)))
      errors.push(`${label}.recheck_at must be an actual RFC3339 timestamp`)
    if (OVERBROAD_BLOCKED_ACTION.test(value.blocked_action || ''))
      errors.push(`${label}.blocked_action is broader than one exact affected action`)
    if (value.disposition === 'CONTRACT_CONTRADICTION'
      && !searches.some(search => search.outcome === 'CONTRADICTS')) {
      errors.push(`${label} CONTRACT_CONTRADICTION lacks a retained contradictory authority result`)
    }
    if (value.disposition === 'UNKNOWN_AFTER_EXHAUSTIVE_SEARCH') {
      if (!value.required_value_or_action.trim().endsWith('?'))
        errors.push(`${label} UNKNOWN_AFTER_EXHAUSTIVE_SEARCH must ask one concrete question`)
      if (searches.some(search => search.outcome === 'FOUND'))
        errors.push(`${label} UNKNOWN_AFTER_EXHAUSTIVE_SEARCH conflicts with a FOUND authority result`)
    }
    if (value.disposition === 'EXTERNAL_CREDENTIAL'
      && !['WORKLOAD_IDENTITY_OR_CREDENTIAL', 'SIGNING_KEY_OR_TRUST_ROOT'].includes(value.input_class)) {
      errors.push(`${label} EXTERNAL_CREDENTIAL has an incompatible input_class`)
    }
    if (value.disposition === 'EXTERNAL_INFRASTRUCTURE'
      && value.input_class !== 'RUNTIME_INFRASTRUCTURE') {
      errors.push(`${label} EXTERNAL_INFRASTRUCTURE requires RUNTIME_INFRASTRUCTURE input_class`)
    }
    if (value.disposition === 'PRIVILEGED_USER_ACTION'
      && value.input_class !== 'PRIVILEGED_INSTALL_OR_APPROVAL') {
      errors.push(`${label} PRIVILEGED_USER_ACTION requires PRIVILEGED_INSTALL_OR_APPROVAL input_class`)
    }
    if (value.disposition === 'DESTRUCTIVE_APPROVAL') {
      if (value.input_class !== 'DESTRUCTIVE_OPERATION_APPROVAL')
        errors.push(`${label} DESTRUCTIVE_APPROVAL requires DESTRUCTIVE_OPERATION_APPROVAL input_class`)
      if (!/\b(?:delete|erase|reset|uninstall|reimage|destroy|truncate|revoke|overwrite)\b/i.test(value.blocked_action || ''))
        errors.push(`${label} DESTRUCTIVE_APPROVAL must name the exact destructive operation`)
      if (!/\b(?:recover|restore|backup|snapshot|irreversible|reinstall|reimage)\b/i.test(value.unblock_condition || ''))
        errors.push(`${label} DESTRUCTIVE_APPROVAL must state recovery or irreversibility`)
    }
  }
  return errors
}

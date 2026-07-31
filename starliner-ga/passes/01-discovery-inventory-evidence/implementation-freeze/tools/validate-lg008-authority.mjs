#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(toolDir, '..')
const output = join(root, 'lg008')
const consolidateRoot = process.env.CONSOLIDATE_ROOT
  ? resolve(process.env.CONSOLIDATE_ROOT)
  : resolve(toolDir, '../../../../../../..')
const validationMode = process.env.LG008_VALIDATION_MODE || 'intrinsic'
const errors = []

function fail(message) {
  errors.push(message)
}

if (!['intrinsic', 'source'].includes(validationMode))
  fail(`LG008_VALIDATION_MODE must be intrinsic or source, found ${validationMode}`)

function requireFile(path) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    fail(`missing file: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function parseCsv(text, label) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      }
      else if (char === '"') {
        quoted = false
      }
      else {
        field += char
      }
    }
    else if (char === '"') {
      quoted = true
    }
    else if (char === ',') {
      row.push(field)
      field = ''
    }
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value !== ''))
        rows.push(row)
      row = []
      field = ''
    }
    else {
      field += char
    }
  }
  if (quoted)
    fail(`${label}: unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length) {
    fail(`${label}: empty CSV`)
    return []
  }
  const header = rows.shift()
  for (const [index, current] of rows.entries()) {
    if (current.length !== header.length) {
      fail(`${label}:${index + 2}: ${current.length} columns; expected ${header.length}`)
      continue
    }
  }
  return rows
    .filter(current => current.length === header.length)
    .map(current => Object.fromEntries(header.map((name, index) => [name, current[index]])))
}

function csv(name) {
  return parseCsv(requireFile(join(output, name)), name)
}

function unique(rows, key, label) {
  const seen = new Set()
  for (const row of rows) {
    if (!row[key])
      fail(`${label}: empty ${key}`)
    else if (seen.has(row[key]))
      fail(`${label}: duplicate ${key} ${row[key]}`)
    seen.add(row[key])
  }
  return seen
}

function numeric(value, label) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 0)
    fail(`${label}: expected non-negative safe integer, found ${value}`)
  return parsed
}

const manifestText = requireFile(join(output, 'authority-manifest.json'))
let manifest = {}
try {
  manifest = JSON.parse(manifestText)
}
catch (error) {
  fail(`authority-manifest.json: ${error.message}`)
}
let saturation = {}
try {
  saturation = JSON.parse(requireFile(join(output, 'saturation-pass.json')))
}
catch (error) {
  fail(`saturation-pass.json: ${error.message}`)
}

const admissions = csv('profile-admission.csv')
const fields = csv('native-field-disposition.csv')
const records = csv('record-catalog.csv')
const recipes = csv('access-recipes.csv')
const deltas = csv('current-source-delta-files.csv')
const traces = csv('target-field-traceability.csv')

const expectedProfiles = new Set([
  'browser',
  'browser-backend',
  'endpoint',
  'llm-gateway',
  'mcp-gateway',
])
if (admissions.length !== expectedProfiles.size)
  fail(`profile admissions: expected 5, found ${admissions.length}`)
for (const row of admissions) {
  if (!expectedProfiles.delete(row.profile))
    fail(`profile admissions: unexpected or duplicate profile ${row.profile}`)
  if (row.admission_state !== 'ACCEPTED_STATIC_SOURCE_AUTHORITY')
    fail(`profile ${row.profile} is not admitted: ${row.admission_state}`)
  if (!row.proof_boundary.includes('LG-005'))
    fail(`profile ${row.profile} omits the native-runtime proof boundary`)
  for (const selected of row.selected_revisions.split(';')) {
    if (!/^[^@]+@[0-9a-f]{40}$/.test(selected))
      fail(`profile ${row.profile} has non-immutable source revision ${selected}`)
  }
}
if (expectedProfiles.size)
  fail(`missing profiles: ${[...expectedProfiles].join(', ')}`)

const fieldIds = unique(fields, 'global_field_id', 'native fields')
const recordIds = unique(records, 'record_id', 'records')
const recipeIds = unique(recipes, 'access_recipe_id', 'access recipes')
const traceIds = unique(traces, 'trace_id', 'target traces')
void recordIds
void traceIds

for (const row of fields) {
  if (!recipeIds.has(row.access_recipe_id))
    fail(`field ${row.global_field_id} references missing recipe ${row.access_recipe_id}`)
  if (!/^[0-9a-f]{40}$/.test(row.source_revision))
    fail(`field ${row.global_field_id} has non-immutable source revision`)
  if (!row.source_locator || !row.repository || !row.record_type || !row.native_field)
    fail(`field ${row.global_field_id} lacks source lineage`)
  if (row.privacy_disposition === 'PROHIBIT_SECRET'
    && row.target_disposition !== 'DISCARD_WITH_REASON') {
    fail(`prohibited field ${row.global_field_id} is not discarded`)
  }
}
for (const row of recipes) {
  const ids = row.field_ids.split(';').filter(Boolean)
  if (!ids.length)
    fail(`access recipe ${row.access_recipe_id} has no fields`)
  for (const id of ids) {
    if (!fieldIds.has(id))
      fail(`access recipe ${row.access_recipe_id} references missing field ${id}`)
  }
  if (!row.authorization || !row.retrieval_or_reproduction || !row.expected_evidence)
    fail(`access recipe ${row.access_recipe_id} is incomplete`)
  if (/<checkout>|<path-from-source-locator>|<authorized-checkout>/.test(
    row.retrieval_or_reproduction,
  )) {
    fail(`access recipe ${row.access_recipe_id} retains a non-executable placeholder`)
  }
  if (!row.retrieval_or_reproduction.includes(row.source_revision))
    fail(`access recipe ${row.access_recipe_id} does not pin its source revision`)
  if (!row.retrieval_or_reproduction.includes('$CONSOLIDATE_ROOT/Org-Recon-2026-07-30/'))
    fail(`access recipe ${row.access_recipe_id} does not identify the selected checkout`)
}

for (const row of records) {
  const matching = fields.filter(field =>
    field.profile === row.profile && field.record_type === row.record_type)
  if (matching.length !== numeric(row.field_count, `record ${row.record_id} field_count`))
    fail(`record ${row.record_id} count mismatch: ${matching.length} actual`)
}
for (const row of admissions) {
  const profileFields = fields.filter(field => field.profile === row.profile)
  const profileRecords = records.filter(record => record.profile === row.profile)
  const profileTraces = traces.filter(trace => trace.profile === row.profile)
  const profileDeltas = deltas.filter(delta => delta.profile === row.profile)
  if (profileFields.length !== numeric(row.native_fields, `${row.profile} native_fields`))
    fail(`${row.profile}: admission native_fields mismatch`)
  if (profileRecords.length !== numeric(row.native_records, `${row.profile} native_records`))
    fail(`${row.profile}: admission native_records mismatch`)
  if (profileTraces.length !== numeric(row.target_fields, `${row.profile} target_fields`))
    fail(`${row.profile}: admission target_fields mismatch`)
  if (profileDeltas.length !== numeric(row.current_delta_files, `${row.profile} current_delta_files`))
    fail(`${row.profile}: admission current_delta_files mismatch`)
}

for (const row of traces) {
  if (row.support_state === 'REQUIRED_DERIVATION_REVIEW')
    fail(`required target trace remains unresolved: ${row.profile}/${row.payload_kind}.${row.target_field}`)
  if (row.required === 'YES' && row.support_state === 'OPTIONAL_NOT_CURRENTLY_SOURCED')
    fail(`required target field was classified optional: ${row.trace_id}`)
  for (const id of row.source_field_ids.split(';').filter(Boolean)) {
    if (!fieldIds.has(id))
      fail(`target trace ${row.trace_id} references missing field ${id}`)
  }
  if (!row.derivation)
    fail(`target trace ${row.trace_id} has no derivation rule`)
}

const endpointFields = fields.filter(row => row.profile === 'endpoint')
const endpointStates = new Set(endpointFields.map(row => row.collection_state))
if (endpointStates.size < 4)
  fail(`endpoint collection-state reconciliation is too coarse: ${[...endpointStates].join(', ')}`)
if (endpointFields.some(row => row.collection_state === 'OBSERVABLE_AND_COLLECTED'))
  fail('endpoint retains the rejected blanket OBSERVABLE_AND_COLLECTED disposition')

const llmFields = fields.filter(row => row.profile === 'llm-gateway')
if (llmFields.length < 60 || llmFields.length > 500)
  fail(`LLM semantic field catalog is implausibly sized: ${llmFields.length}`)
if (llmFields.some(row =>
  /lg008-llm-gateway|lexical-key|identifier-inventory/i.test(row.source_locator))) {
  fail('LLM catalog contains rows sourced from the rejected lexical identifier dump')
}
for (const record of [
  'ApiRequestLogRow',
  'LlmGatewayLogsV3Row',
  'identity_json',
  'observability_json',
  'features_json',
  'tools_json',
]) {
  if (!llmFields.some(row => row.record_type === record))
    fail(`LLM catalog lacks serialized record ${record}`)
}

function requireNative(profile, record, field) {
  const row = fields.find(item =>
    item.profile === profile
    && item.record_type === record
    && item.native_field === field)
  if (!row)
    fail(`missing native field ${profile}/${record}.${field}`)
  return row
}

const browserSecret = requireNative('browser', 'TrailsArtifactsType', 'authToken')
if (browserSecret?.privacy_disposition !== 'PROHIBIT_SECRET')
  fail('Browser authToken is not prohibited')
for (const record of ['PackageLogEnvelope', 'PackageExtensionLogEnvelope']) {
  const hostname = requireNative('browser', record, 'user.hostname')
  if (hostname?.collection_state !== 'SERIALIZED_OR_EMITTED')
    fail(`${record}.user.hostname is not classified as emitted`)
}
const diagnosticBody = requireNative('browser', 'DiagnosticNetworkResponse', 'body')
if (diagnosticBody?.privacy_disposition !== 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY')
  fail('Browser diagnostic response body is not restricted raw evidence')

for (const record of ['upstream_initialize_capabilities', 'upstream_transport_features']) {
  for (const name of ['auth_context_key', 'endpoint_fingerprint']) {
    const row = requireNative('mcp-gateway', record, name)
    if (row?.privacy_disposition !== 'TOKENIZE_TENANT_KEYED')
      fail(`${record}.${name} is not tenant-key tokenized`)
    if (row?.target_disposition !== 'RELATIONSHIP_SCOPE_TOKEN')
      fail(`${record}.${name} is not restricted to relationship scope`)
  }
}
requireNative('mcp-gateway', 'upstream_initialize_capabilities', 'protocol_version')

const deltaExpected = new Map([
  ['browser', 102],
  ['browser-backend', 6],
  ['mcp-gateway', 32],
])
for (const [profile, expected] of deltaExpected) {
  const actual = deltas.filter(row => row.profile === profile).length
  if (actual !== expected)
    fail(`${profile} current delta count changed: expected ${expected}, found ${actual}`)
}
for (const row of deltas) {
  if (!row.component || !row.path || !row.classification || !row.disposition || !row.reason)
    fail(`unclassified current source delta: ${JSON.stringify(row)}`)
}

const mcpSchema = requireFile(join(root, 'schemas/profile-mcp-gateway-v1.schema.json'))
for (const term of [
  '"capability_scope"',
  '"authorization_context_token"',
  '"endpoint_configuration_token"',
  '"shared_legacy_cache"',
]) {
  if (!mcpSchema.includes(term))
    fail(`MCP profile schema lacks ${term}`)
}
const normalizedSchema = requireFile(join(root, 'schemas/normalized-observation.schema.json'))
if (!normalizedSchema.includes('"scope"') || !normalizedSchema.includes('"authorization_context"'))
  fail('normalized relationship candidate lacks scope')
const postgres = requireFile(join(root, 'sql/001-die-core.sql'))
for (const table of [
  'die_normalized.relationship_candidate',
  'die_canonical.relationship',
  'die_read.relationship_current',
]) {
  const tableStart = postgres.indexOf(`CREATE TABLE IF NOT EXISTS ${table}`)
  const tableEnd = postgres.indexOf('\n);', tableStart)
  const definition = tableStart >= 0 && tableEnd >= 0
    ? postgres.slice(tableStart, tableEnd)
    : ''
  if (!definition.includes('scope_kind') || !definition.includes('scope_key'))
    fail(`${table} does not persist relationship scope`)
}
if (!postgres.includes('OLD.scope_kind, OLD.scope_key')
  || !postgres.includes('NEW.scope_kind, NEW.scope_key')) {
  fail('canonical relationship immutability trigger omits scope identity')
}
const openapi = requireFile(join(root, 'openapi/die-v1.openapi.yaml'))
for (const term of ['McpCapabilityScopeState', 'McpCapabilityCoverage', 'capability_scope_state']) {
  if (!openapi.includes(term))
    fail(`product API omits ${term}`)
}
if (/authorization_context_token|endpoint_configuration_token/.test(
  openapi.slice(openapi.indexOf('McpServerSummary:'), openapi.indexOf('DeviceSummary:')),
)) {
  fail('product MCP DTO exposes internal capability-scope tokens')
}

for (const [name, expected] of Object.entries(manifest.generated_files ?? {})) {
  const content = requireFile(join(output, name))
  if (content && sha256(content) !== expected)
    fail(`manifest digest mismatch for ${name}`)
}
if (process.env.LG008_SKIP_SATURATION !== '1') {
  if (saturation.zero_new_item_result !== 'PASS'
    || (saturation.changed_generated_files ?? []).length !== 0) {
    fail('second LG-008 saturation pass is not a zero-drift PASS')
  }
  for (const name of [
    'authority-manifest.json',
    ...Object.keys(manifest.generated_files ?? {}),
  ]) {
    const content = requireFile(join(output, name))
    const digest = content ? sha256(content) : ''
    if (saturation.pass_one?.generated_digests?.[name] !== digest
      || saturation.pass_two?.generated_digests?.[name] !== digest) {
      fail(`saturation digest mismatch for ${name}`)
    }
  }
}
for (const input of manifest.inputs ?? []) {
  if (!input.path || input.path.startsWith('/') || input.path.includes('..'))
    fail(`source input path is not portable and relative: ${input.path}`)
  if (!/^[0-9a-f]{64}$/.test(input.sha256 ?? ''))
    fail(`source input lacks a SHA-256 digest: ${input.path}`)
  if (validationMode === 'source') {
    const path = join(consolidateRoot, input.path)
    const content = requireFile(path)
    if (content && sha256(content) !== input.sha256)
      fail(`source input digest drift: ${input.path}`)
  }
}
const expectedCounts = {
  profiles: admissions.length,
  records: records.length,
  native_fields: fields.length,
  access_recipes: recipes.length,
  target_fields: traces.length,
  current_delta_files: deltas.length,
  required_derivation_gaps: traces
    .filter(row => row.support_state === 'REQUIRED_DERIVATION_REVIEW').length,
  rejected_profiles: admissions
    .filter(row => row.admission_state !== 'ACCEPTED_STATIC_SOURCE_AUTHORITY').length,
}
for (const [name, expected] of Object.entries(expectedCounts)) {
  if (manifest.counts?.[name] !== expected)
    fail(`manifest count ${name}: expected ${expected}, found ${manifest.counts?.[name]}`)
}

if (errors.length) {
  console.error(`LG-008 authority validation failed with ${errors.length} error(s):`)
  for (const error of errors)
    console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `LG-008 five-profile authority passed (${validationMode}): ${admissions.length} profiles; `
  + `${records.length} records; ${fields.length} native fields; `
  + `${recipes.length} access recipes; ${traces.length} target traces; `
  + `${deltas.length} classified current delta files.`,
)

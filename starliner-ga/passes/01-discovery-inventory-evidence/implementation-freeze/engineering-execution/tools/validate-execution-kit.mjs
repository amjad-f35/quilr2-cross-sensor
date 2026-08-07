#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  initializeProductDeliveryState,
  PRODUCT_DELIVERY_HEADER,
  validateProductDeliveryState,
} from './product-delivery-state-lib.mjs'
import { REQUIRED_INPUTS_HEADER } from './required-inputs-lib.mjs'
import { SENSOR_VERTICAL_HEADER } from './sensor-vertical-state-lib.mjs'
import { CROSS_SOURCE_GATE_HEADER } from './cross-source-gate-lib.mjs'
import {
  buildGateBObligations,
  GATE_B_CERTIFICATION_HEADER,
  GATE_B_OBLIGATION_HEADER,
  initializeGateBCertification,
  serializeGateBObligations,
  validateGateBCertification,
} from './gate-b-certification-lib.mjs'
import { validateRuntimeManifestFile } from './validate-runtime-manifest.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

function fail(message) {
  errors.push(message)
}

function load(path) {
  const full = join(root, path)
  if (!existsSync(full)) {
    fail(`missing execution-kit artifact: ${path}`)
    return ''
  }
  return readFileSync(full, 'utf8')
}

function requireFragments(path, fragments) {
  const text = load(path)
  for (const fragment of fragments) {
    if (!text.includes(fragment))
      fail(`${path} omits required fragment: ${fragment}`)
  }
  return text
}

function parseCsv(text, path) {
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
      else if (character === '"') {
        quoted = false
      }
      else {
        field += character
      }
    }
    else if (character === '"') {
      quoted = true
    }
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
    else {
      field += character
    }
  }
  if (quoted)
    fail(`${path} has an unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length)
    fail(`${path} is empty`)
  const width = rows[0]?.length || 0
  rows.forEach((candidate, index) => {
    if (candidate.length !== width)
      fail(`${path}:${index + 1} has ${candidate.length} columns; expected ${width}`)
  })
  return rows
}

requireFragments('README.md', [
  'Start or resume',
  'Independent lifecycles',
  'One branch represents one coherent work item',
  'never stops local product construction',
])
requireFragments('templates/AGENTS.md', [
  'Resume protocol',
  'test-driven-development skill',
  'One branch is one work item',
  'qualified isolated environment',
  'Raise a focused ADR',
  'native Vue SFCs',
  'clone existing Button/Dialog/Table',
  'Code that is not yet',
  'SOURCE_PRODUCT_PATH.yaml',
  'Required inputs: search, ask, never bypass',
])
requireFragments('templates/WORK_STATE.md', [
  'Architecture authority commit',
  'Last locally verified commit',
  'Last remotely verified commit',
  'Next exact action',
  'Implementation state',
  'Highest proven stage',
  'Exact blocked action',
  'Blocker evidence',
  'Independent next action',
])
requireFragments('templates/PROGRAM_STATE.md', [
  'one coherent cross-repository product candidate',
  'Current runtime manifest',
  'Next integration action',
  'Exact blocked action',
  'Independent next action',
])
requireFragments('templates/TOPOLOGY.md', [
  'Runtime roles and artifacts',
  'Persistence and transport',
  'External repository seams',
  'Product and harness separation',
])
requireFragments('templates/RUNTIME_MANIFEST.yaml', [
  'schema: die.runtime-manifest.v1',
  'authority_commit:',
  'profile_registry:',
  'components:',
  'database_migration_digest:',
  'contamination:',
])
try {
  for (const error of validateRuntimeManifestFile(join(root, 'templates/RUNTIME_MANIFEST.yaml')))
    fail(`templates/RUNTIME_MANIFEST.yaml: ${error}`)
}
catch (error) {
  fail(`templates/RUNTIME_MANIFEST.yaml cannot be parsed: ${error.message}`)
}
requireFragments('templates/SOURCE_PRODUCT_PATH.yaml', [
  'schema: die.source-product-path.v1',
  'normal_path_state:',
  'organization_context:',
  'enrollment:',
  'normal_entrypoint:',
  'prohibited_bypasses:',
  'evidence_bindings:',
  'wal_owner_component_id:',
  'sender_component_id:',
])
requireFragments('BRANCH_HYGIENE_AND_CHANGE_CONTROL.md', [
  'One branch may contain many commits',
  'One writer per branch',
  'SUPERSEDE',
  'zero commits ahead',
])
requireFragments('TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md', [
  'clean detached checkout at exact SHA',
  'It does not patch the remote checkout',
  'Candidate N+1 cannot inherit N',
])
requireFragments('SOURCE_CONTEXT_AND_REPOSITORY_MAP.md', [
  'All 377 organization repositories classified',
  'quilrbusiness/project-starliner',
  'quilrbusiness/macrodata-refinement',
  'quilrbusiness/quilr-llm-gateway',
  'do not copy a shallow analysis',
])
requireFragments('BRANCH_AND_PR_BASELINE.md', [
  '117 dirty paths',
  'PR 227',
  'PR 148',
  'PR 10',
  'No GitHub refs were modified',
])
requireFragments('CODING_AGENT_START_PROMPT.md', [
  'complete bounded',
  'Work only from fresh/current Git checkouts',
  'complete selected-source system end to end',
  'First action: establish an executable program',
  'Do not return merely',
  'UI implementation law',
  '/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt',
  'an open LG never means stop coding',
  'No workaround product',
])
requireFragments('cursor/rules/00-die-authority.mdc', [
  'alwaysApply: true',
  'Read `AGENTS.md`',
])
requireFragments('cursor/rules/10-die-development-loop.mdc', [
  'alwaysApply: true',
  'One branch represents one stable work item',
])
requireFragments('cursor/rules/20-nuxt-shadcn-ui.mdc', [
  'alwaysApply: false',
  'native Nuxt/Vue SFCs',
  'second generic',
  'generated `/die/v1` client',
])
requireFragments('cursor/skills/test-driven-development/SKILL.md', [
  'name: test-driven-development',
  'Add or select a test that fails',
])
requireFragments('cursor/skills/remote-sha-validation/SKILL.md', [
  'name: remote-sha-validation',
  'detach at the exact SHA',
])

const ledgerHeaders = new Map([
  ['templates/CHANGE_LEDGER.csv.template', 'change_id,work_item_id,repository,branch,commit_sha,pr_url,local_verification,remote_validation_id,status,created_at,notes'],
  ['templates/REMOTE_VALIDATION_LEDGER.csv.template', 'validation_id,work_item_id,repository,commit_sha,artifact_digest,configuration_digest,environment,deploy_id,started_at,finished_at,result,commands_ref,evidence_ref,validator,notes'],
  ['templates/BRANCH_PR_REGISTER.csv.template', 'repository,branch,base,work_item_id,owner,state,pr_url,head_sha,ahead,behind,last_activity,disposition,delete_after,notes'],
  ['templates/WORK_ITEMS.csv.template', 'work_item_id,parent_id,title,repository,component,product_capabilities,implementation_state,integration_state,evidence_state,release_state,runtime_mode,priority,hard_code_dependencies,release_gates,development_blocked,blocker_class,blocked_on,blocked_action,blocker_evidence,blocker_owner,unblock_condition,blocker_recheck_at,independent_next_action,highest_proven_stage,owner,branch,last_verified_sha,next_product_action,notes'],
  ['templates/PRODUCT_DELIVERY_STATE.csv.template', PRODUCT_DELIVERY_HEADER.join(',')],
  ['templates/REQUIRED_INPUTS.csv.template', REQUIRED_INPUTS_HEADER.join(',')],
  ['templates/SENSOR_VERTICAL_STATE.csv.template', SENSOR_VERTICAL_HEADER.join(',')],
])
for (const [path, header] of ledgerHeaders) {
  const text = load(path).trim()
  if (text !== header)
    fail(`${path} header does not match the frozen execution ledger contract`)
}

const jiraPath = 'jira/die-work-program-import.csv'
const jiraRows = parseCsv(load(jiraPath), jiraPath)
const jiraHeader = jiraRows[0] || []
const expectedJiraHeader = [
  'External ID',
  'Issue Type',
  'Summary',
  'Description',
  'Priority',
  'Labels',
  'Component',
  'Parent External ID',
  'Hard Code Dependencies',
  'Release Gates',
  'Acceptance Criteria',
]
if (JSON.stringify(jiraHeader) !== JSON.stringify(expectedJiraHeader))
  fail('Jira import header changed')
const jiraIds = new Set()
const jiraById = new Map()
for (const row of jiraRows.slice(1)) {
  const id = row[0]
  if (!id)
    fail('Jira import contains a row without External ID')
  if (jiraIds.has(id))
    fail(`duplicate Jira External ID: ${id}`)
  jiraIds.add(id)
  jiraById.set(id, row)
  if (!row[10])
    fail(`Jira item ${id} has no acceptance criteria`)
  if (/LG-?00[1-8]/.test(row[8] || ''))
    fail(`Jira item ${id} uses a release gate as a hard code dependency`)
  if (/\bDIE-WP00\b/.test(row[8] || ''))
    fail(`Jira item ${id} uses program setup DIE-WP00 as a blanket hard code dependency`)
}
const graphPi = jiraById.get('DIE-PI005')
if (!graphPi
  || !graphPi[8].split(';').includes('DIE-PI002')
  || !graphPi[8].split(';').includes('DIE-PI003A')
  || !/unresolved-negative|unresolved association/i.test(`${graphPi[3]} ${graphPi[10]}`)) {
  fail('DIE-PI005 must follow PI002 plus PI003A and require the immediate unresolved-negative cross-source proof')
}
for (let index = 0; index <= 11; index += 1) {
  const id = `DIE-WP${String(index).padStart(2, '0')}`
  if (!jiraIds.has(id))
    fail(`Jira import omits ${id}`)
}

for (let index = 1; index <= 7; index += 1) {
  const id = `DIE-PI${String(index).padStart(3, '0')}`
  if (!jiraIds.has(id))
    fail(`Jira import omits product increment ${id}`)
}

try {
  const obligations = buildGateBObligations(
    load('../registers/profile-capability-disposition.csv'),
    load('../lg008/target-field-traceability.csv'),
  )
  const generatedCatalog = serializeGateBObligations(obligations)
  const catalog = load('registers/gate-b-certification-obligations.csv')
  if (catalog !== generatedCatalog)
    fail('Gate-B obligation catalog has generated drift')
  const gateBTemplate = load('templates/GATE_B_CERTIFICATION.csv.template')
  if (gateBTemplate !== initializeGateBCertification(obligations))
    fail('Gate-B certification template has generated drift')
  for (const error of validateGateBCertification(gateBTemplate, catalog))
    fail(`Gate-B certification template: ${error}`)
  if (obligations.length !== 309)
    fail(`Gate-B obligation coverage changed unexpectedly: ${obligations.length}`)
  if (parseCsv(catalog, 'gate-b-certification-obligations.csv')[0].join(',')
    !== GATE_B_OBLIGATION_HEADER.join(',')) {
    fail('Gate-B obligation catalog header changed')
  }
  if (parseCsv(gateBTemplate, 'GATE_B_CERTIFICATION.csv.template')[0].join(',')
    !== GATE_B_CERTIFICATION_HEADER.join(',')) {
    fail('Gate-B certification template header changed')
  }
}
catch (error) {
  fail(`Gate-B certification authority failed: ${error.message}`)
}

const crossSourceRows = parseCsv(load('templates/CROSS_SOURCE_GATE.csv.template'), 'CROSS_SOURCE_GATE.csv.template')
if (crossSourceRows[0].join(',') !== CROSS_SOURCE_GATE_HEADER.join(','))
  fail('cross-source gate template header changed')
if (crossSourceRows.length !== 2 || crossSourceRows[1][0] !== 'CSG-ENDPOINT-BROWSER-001'
  || crossSourceRows[1][1] !== 'OPEN') {
  fail('cross-source gate template must contain exactly the open immediate Endpoint+Browser gate')
}

const capabilityPath = 'registers/product-capability-map.csv'
const capabilityRows = parseCsv(load(capabilityPath), capabilityPath)
const capabilityHeader = capabilityRows[0] || []
const expectedCapabilityHeader = [
  'capability_id', 'product_outcome', 'required_stages', 'authority_refs',
  'work_packages', 'hard_code_dependencies', 'release_gates',
  'completion_required', 'scope', 'customer_facing',
  'forbidden_substitute',
]
if (JSON.stringify(capabilityHeader) !== JSON.stringify(expectedCapabilityHeader))
  fail('product capability map header changed')
const capabilityIds = new Set()
const launchProducerCapabilities = new Set(['PC-002', 'PC-003', 'PC-004', 'PC-005', 'PC-006'])
const allowedStages = new Set([
  'NONE', 'NATIVE_CAPTURE', 'LOCAL_WAL', 'INGEST_RECEIPT', 'IMMUTABLE_EVIDENCE',
  'NORMALIZED', 'CANONICAL_ENTITY', 'CANONICAL_GRAPH_ACTIVITY', 'PROJECTED',
  'AUTHORIZED_API', 'LIVE_UI', 'REBUILD_REPLAY', 'RELEASE_QUALIFIED',
])
const requiredCapabilityIds = new Set()
const futureCapabilityIds = new Set()
for (const row of capabilityRows.slice(1)) {
  if (!/^PC-[0-9]{3}$/.test(row[0]) || capabilityIds.has(row[0]))
    fail(`invalid or duplicate product capability ${row[0]}`)
  capabilityIds.add(row[0])
  if (!row[1] || !row[2] || !row[3] || !row[4] || !row[7] || !row[8] || !row[9] || !row[10])
    fail(`product capability ${row[0]} is incomplete`)
  if (/LG-?00[1-8]/.test(row[5] || ''))
    fail(`product capability ${row[0]} treats a release gate as a hard code dependency`)
  const stages = new Set((row[2] || '').split('|'))
  for (const stage of stages) {
    if (!allowedStages.has(stage))
      fail(`product capability ${row[0]} has invalid stage ${stage}`)
  }
  if (!['YES', 'NO'].includes(row[7]))
    fail(`product capability ${row[0]} has invalid completion_required ${row[7]}`)
  if (!['bounded_die', 'future_extension'].includes(row[8]))
    fail(`product capability ${row[0]} has invalid scope ${row[8]}`)
  if (!['YES', 'NO'].includes(row[9]))
    fail(`product capability ${row[0]} has invalid customer_facing ${row[9]}`)
  if (row[7] === 'YES') {
    requiredCapabilityIds.add(row[0])
    if (row[8] !== 'bounded_die' || stages.has('NONE'))
      fail(`required product capability ${row[0]} is not a bounded DIE capability`)
  }
  else {
    futureCapabilityIds.add(row[0])
    if (row[8] !== 'future_extension')
      fail(`non-required product capability ${row[0]} is not a future extension`)
  }
  if (row[9] === 'YES' && !stages.has('LIVE_UI'))
    fail(`customer-facing product capability ${row[0]} omits LIVE_UI`)
  if (row[8] === 'bounded_die') {
    for (const workPackage of row[4].split('|')) {
      if (!/^WP(?:0[0-9]|1[01])$/.test(workPackage))
        fail(`product capability ${row[0]} references invalid work package ${workPackage}`)
    }
    for (const gate of row[6].split('|')) {
      if (!/^LG00[1-7]$/.test(gate))
        fail(`product capability ${row[0]} references invalid release gate ${gate}`)
    }
  }
  if (launchProducerCapabilities.has(row[0])) {
    for (const stage of ['NATIVE_CAPTURE', 'LOCAL_WAL', 'INGEST_RECEIPT', 'IMMUTABLE_EVIDENCE', 'NORMALIZED']) {
      if (!stages.has(stage))
        fail(`launch producer capability ${row[0]} omits required acquisition stage ${stage}`)
    }
  }
}
if (capabilityIds.size < 15)
  fail(`product capability map is too narrow: ${capabilityIds.size}`)
if (requiredCapabilityIds.size !== 15 || futureCapabilityIds.size !== 1 || !futureCapabilityIds.has('PC-016'))
  fail(`product capability completion scope is wrong: ${requiredCapabilityIds.size} required; ${futureCapabilityIds.size} future`)

try {
  const generatedState = initializeProductDeliveryState(load(capabilityPath), 'a'.repeat(40))
  for (const error of validateProductDeliveryState(generatedState, load(capabilityPath)))
    fail(`generated PRODUCT_DELIVERY_STATE.csv is invalid: ${error}`)
  const generatedRows = parseCsv(generatedState, 'generated PRODUCT_DELIVERY_STATE.csv')
  if (generatedRows.length !== requiredCapabilityIds.size + 1)
    fail('PRODUCT_DELIVERY_STATE initializer does not emit every required capability exactly once')
  if (generatedRows.slice(1).some(row => row[0] === 'PC-016'))
    fail('PRODUCT_DELIVERY_STATE initializer incorrectly makes future connector PC-016 a bounded completion requirement')
}
catch (error) {
  fail(`PRODUCT_DELIVERY_STATE initializer failed: ${error.message}`)
}

try {
  const schema = JSON.parse(load('../schemas/execution-status.schema.json'))
  if (schema.title !== 'DIE product capability execution status')
    fail('execution status schema title changed')
  for (const field of [
    'blocker_class', 'blocked_action', 'blocker_evidence', 'blocker_owner',
    'unblock_condition', 'blocker_recheck_at', 'independent_next_action',
    'authority_commit', 'last_verified_sha', 'runtime_manifest',
    'runtime_manifest_digest', 'limitations',
  ]) {
    if (!schema.required?.includes(field))
      fail(`execution status schema does not require ${field}`)
  }
  const runtimeSchema = JSON.parse(load('../schemas/runtime-manifest.schema.json'))
  if (runtimeSchema.title !== 'DIE coherent runtime manifest')
    fail('runtime manifest schema title changed')
  if (!runtimeSchema.required?.includes('profile_registry'))
    fail('runtime manifest schema does not require the digest-bound profile registry')
  if (!runtimeSchema.$defs?.producer?.properties?.profile?.pattern
    || runtimeSchema.$defs.producer.properties.profile.enum) {
    fail('runtime manifest producer profile is not registry-extensible')
  }
  for (const role of ['connector_runner', 'connector_webhook', 'connector_poller', 'connector_cdc']) {
    if (!runtimeSchema.$defs?.component?.properties?.role?.enum?.includes(role))
      fail(`runtime manifest component roles omit ${role}`)
  }
}
catch (error) {
  fail(`execution status schema is invalid JSON: ${error.message}`)
}

const branchPath = 'registers/branch-pr-baseline.csv'
const branchRows = parseCsv(load(branchPath), branchPath)
const branchHeader = branchRows[0] || []
if (branchHeader[0] !== 'repository' || branchHeader[1] !== 'branch'
  || branchHeader[8] !== 'disposition') {
  fail('branch/PR baseline header changed')
}
const branchKeys = new Set()
for (const row of branchRows.slice(1)) {
  const key = `${row[0]}:${row[1]}`
  if (branchKeys.has(key))
    fail(`duplicate branch/PR baseline row: ${key}`)
  branchKeys.add(key)
  if (!row[8] || row[8] === 'UNKNOWN')
    fail(`branch/PR baseline lacks a disposition: ${key}`)
}
for (const requiredBranch of [
  'quilrbusiness/project-starliner:feat/starliner-runtime-trust-and-reality-gates',
  'quilrbusiness/macrodata-refinement:feat/starliner-llm-observe-runtime',
  'quilrbusiness/quilr-llm-gateway:feat/starliner-mcp-observe-runtime',
]) {
  if (!branchKeys.has(requiredBranch))
    fail(`branch/PR baseline omits ${requiredBranch}`)
}

if (errors.length) {
  console.error('DIE engineering execution kit validation FAILED')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log(
  `DIE engineering execution kit validation passed: `
  + `${jiraIds.size} Jira items; ${ledgerHeaders.size} ledger contracts; `
  + `${branchKeys.size} branch/PR dispositions; 3 Cursor rules; 2 Cursor skills.`,
)

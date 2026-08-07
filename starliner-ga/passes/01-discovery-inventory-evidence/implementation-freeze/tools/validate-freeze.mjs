#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const notes = []
const maxSafeInteger = 9007199254740991

function fail(message) {
  errors.push(message)
}

function requireFile(path) {
  const full = join(root, path)
  if (!existsSync(full) || !statSync(full).isFile()) {
    fail(`missing required file: ${path}`)
    return ''
  }
  return readFileSync(full, 'utf8')
}

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const full = join(path, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function parseYaml(path) {
  const python = process.env.DIE_VALIDATOR_PYTHON || 'python3'
  try {
    return JSON.parse(execFileSync(
      python,
      [join(root, 'tools/yaml-to-json.py'), path],
      { encoding: 'utf8' },
    ))
  }
  catch (error) {
    fail(`YAML parse failed for ${relative(root, path)}: ${String(error.message).split('\n')[0]}`)
    return null
  }
}

function parseCsv(text, path) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
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
    fail(`unterminated quoted CSV field: ${path}`)
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length)
    fail(`empty CSV: ${path}`)
  const width = rows[0]?.length ?? 0
  rows.forEach((current, index) => {
    if (current.length !== width)
      fail(`${path}:${index + 1} has ${current.length} columns; expected ${width}`)
  })
  return rows
}

const required = [
  'README.md',
  ...Array.from({ length: 21 }, (_, index) => `${String(index).padStart(2, '0')}-${[
    'current-implementation-disposition',
    'system-architecture',
    'protocol-and-source-profiles',
    'physical-data-and-storage',
    'workers-transactions-and-replay',
    'identity-and-canonicalization',
    'relationships-activity-and-coverage',
    'authorization-and-audit',
    'product-api-contract',
    'nuxt-ui-integration',
    'performance-reliability-and-operations',
    'testing-conformance-and-release-gates',
    'repository-and-delivery-map',
    'closure-and-non-blockers',
    'sensor-adapter-bindings',
    'connected-asset-inventory-and-exposure',
    'sensor-capability-and-field-traceability',
    'customer-information-architecture',
    'future-authoritative-connectors',
    'audit-corrections-and-build-readiness',
    'adversarial-architecture-review',
  ][index]}.md`),
  '21-independent-falsification-and-readiness-verdict.md',
  '22-live-storage-conformance.md',
  '23-production-implementation-handoff.md',
  '24-source-analysis-intake-and-lg-gate-plan.md',
  '25-browser-package-admission-and-owner-inputs.md',
  '26-lg008-cto-evidence-checklist.md',
  '27-quilrbusiness-org-source-reconciliation.md',
  '28-lg008-five-profile-static-authority.md',
  '29-lg008-saturation-and-readiness.md',
  '30-production-architecture-and-runtime-revalidation.md',
  '31-external-readiness-audit-reconciliation.md',
  '32-pre-code-system-design-closure.md',
  '33-enterprise-connector-platform-direction.md',
  '34-agentic-engineering-execution-system.md',
  '35-nuxt-shadcn-ui-engineering-constitution.md',
  '36-source-revision-and-retraction-precedence.md',
  '37-oidc-jwks-and-runtime-session-lifecycle.md',
  '38-manifest-signing-and-key-registry-lifecycle.md',
  '39-implementation-conformance-and-transitional-removal.md',
  '40-final-delta-freeze-closure.md',
  '41-product-first-continuous-delivery-authority.md',
  '42-producer-health-implementation-handoff.md',
  '43-installed-product-lifecycle-and-source-verticals.md',
  'engineering-execution/README.md',
  'engineering-execution/templates/AGENTS.md',
  'engineering-execution/templates/WORK_STATE.md',
  'engineering-execution/templates/PROGRAM_STATE.md',
  'engineering-execution/templates/PRODUCT_DELIVERY_STATE.csv.template',
  'engineering-execution/templates/RUNTIME_MANIFEST.yaml',
  'engineering-execution/templates/SOURCE_PRODUCT_PATH.yaml',
  'engineering-execution/templates/REQUIRED_INPUTS.csv.template',
  'engineering-execution/templates/SENSOR_VERTICAL_STATE.csv.template',
  'engineering-execution/templates/GATE_B_CERTIFICATION.csv.template',
  'engineering-execution/templates/CROSS_SOURCE_GATE.csv.template',
  'engineering-execution/templates/TOPOLOGY.md',
  'engineering-execution/templates/CHANGE_LEDGER.csv.template',
  'engineering-execution/templates/REMOTE_VALIDATION_LEDGER.csv.template',
  'engineering-execution/templates/BRANCH_PR_REGISTER.csv.template',
  'engineering-execution/templates/WORK_ITEMS.csv.template',
  'engineering-execution/cursor/rules/00-die-authority.mdc',
  'engineering-execution/cursor/rules/10-die-development-loop.mdc',
  'engineering-execution/cursor/rules/20-nuxt-shadcn-ui.mdc',
  'engineering-execution/cursor/skills/test-driven-development/SKILL.md',
  'engineering-execution/cursor/skills/remote-sha-validation/SKILL.md',
  'engineering-execution/SOURCE_CONTEXT_AND_REPOSITORY_MAP.md',
  'engineering-execution/BRANCH_AND_PR_BASELINE.md',
  'engineering-execution/registers/branch-pr-baseline.csv',
  'engineering-execution/registers/product-capability-map.csv',
  'engineering-execution/registers/gate-b-certification-obligations.csv',
  'engineering-execution/BRANCH_HYGIENE_AND_CHANGE_CONTROL.md',
  'engineering-execution/TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md',
  'engineering-execution/CODING_AGENT_START_PROMPT.md',
  'engineering-execution/jira/die-work-program-import.csv',
  'engineering-execution/tools/validate-execution-kit.mjs',
  'engineering-execution/tools/validate-runtime-manifest.mjs',
  'engineering-execution/tools/test-runtime-manifest-validator.mjs',
  'engineering-execution/tools/csv-lib.mjs',
  'engineering-execution/tools/sensor-vertical-state-lib.mjs',
  'engineering-execution/tools/test-sensor-vertical-state-validator.mjs',
  'engineering-execution/tools/validate-sensor-vertical-state.mjs',
  'engineering-execution/tools/required-inputs-lib.mjs',
  'engineering-execution/tools/test-required-inputs-validator.mjs',
  'engineering-execution/tools/validate-required-inputs.mjs',
  'engineering-execution/tools/product-delivery-state-lib.mjs',
  'engineering-execution/tools/initialize-product-delivery-state.mjs',
  'engineering-execution/tools/validate-product-delivery-state.mjs',
  'engineering-execution/tools/test-product-delivery-sensor-binding.mjs',
  'engineering-execution/tools/gate-b-certification-lib.mjs',
  'engineering-execution/tools/build-gate-b-obligations.mjs',
  'engineering-execution/tools/validate-gate-b-certification.mjs',
  'engineering-execution/tools/test-gate-b-certification-validator.mjs',
  'engineering-execution/tools/gate-b-test-fixtures.mjs',
  'engineering-execution/tools/sensor-vertical-test-fixtures.mjs',
  'engineering-execution/tools/cross-source-gate-lib.mjs',
  'engineering-execution/tools/validate-cross-source-gate.mjs',
  'engineering-execution/tools/test-cross-source-gate-validator.mjs',
  'cloud-context/README.md',
  'cloud-context/SELECTION_POLICY.md',
  'cloud-context/CLOUD_AGENT_BOOTSTRAP.md',
  'cloud-context/selection.json',
  'cloud-context/manifest.json',
  'production-readiness/README.md',
  'production-readiness/00-assurance-model.md',
  'production-readiness/01-lg001-postgresql.md',
  'production-readiness/02-lg002-clickhouse.md',
  'production-readiness/03-lg003-object-storage.md',
  'production-readiness/04-lg004-api-nuxt.md',
  'production-readiness/05-lg005-native-adapters.md',
  'production-readiness/06-lg006-cross-language-crypto.md',
  'production-readiness/07-lg007-erasure-completeness.md',
  'production-readiness/08-environments-ci-and-release-evidence.md',
  'production-readiness/09-implementation-work-packages.md',
  'production-readiness/registers/readiness-levels.csv',
  'production-readiness/registers/gate-test-catalog.csv',
  'schemas/execution-status.schema.json',
  'schemas/runtime-manifest.schema.json',
  'schemas/source-product-path.schema.json',
  'authz/model.yaml',
  'authz/api-field-policy.yaml',
  'ontology/entity-types.yaml',
  'ontology/predicates.yaml',
  'ontology/activity-types.yaml',
  'ontology/field-authority.yaml',
  'ontology/source-normalization.yaml',
  'ontology/source-relationship-rules.yaml',
  'ontology/profile-envelope-bindings.yaml',
  'openapi/die-v1.openapi.yaml',
  'openapi/starliner-ingest-v1.openapi.yaml',
  'openapi/starliner-control-v1.openapi.yaml',
  'registers/decisions.yaml',
  'registers/input-disposition.yaml',
  'registers/module-disposition.csv',
  'registers/data-authority.csv',
  'registers/profile-capability-disposition.csv',
  'registers/profile-entity-disposition.csv',
  'registers/sensor-capability-register.csv',
  'registers/field-disposition.csv',
  'registers/relationship-support.csv',
  'registers/future-connector-backlog.csv',
  'registers/ui-field-lineage.csv',
  'registers/defect-closure-ledger.csv',
  'registers/source-analysis-inputs.csv',
  'registers/lg-evidence-needs.csv',
  'registers/lg008-owner-inputs.csv',
  'registers/github-repository-relevance.csv',
  'registers/source-revision-selection.csv',
  'registers/production-source-reachability.csv',
  'registers/source-temporal-precedence.csv',
  'registers/implementation-conformance.csv',
  'evidence/github/quilrbusiness-repositories.json',
  'evidence/github/quilrbusiness-repository-snapshot.json',
  'evidence/github/quilrbusiness-repository-relevance-summary.json',
  'evidence/github/local-source-checkouts.json',
  'evidence/github/selected-revision-and-build-evidence.json',
  'evidence/runtime/2026-07-30-source-input-validation.txt',
  'evidence/runtime/2026-07-30-org-source-validation.md',
  'lg008/README.md',
  'lg008/authority-manifest.json',
  'lg008/profile-admission.csv',
  'lg008/native-field-disposition.csv',
  'lg008/record-catalog.csv',
  'lg008/access-recipes.csv',
  'lg008/current-source-delta-files.csv',
  'lg008/target-field-traceability.csv',
  'lg008/saturation-pass.json',
  'schemas/delivery-batch.schema.json',
  'schemas/edge-configuration.schema.json',
  'schemas/ingest-receipt.schema.json',
  'schemas/normalized-observation.schema.json',
  'schemas/normalization-bundle.schema.json',
  'schemas/canonical-change-pointer.schema.json',
  'schemas/producer-enrollment-manifest.schema.json',
  'schemas/sensor-enrollment-request.schema.json',
  'schemas/sensor-enrollment-response.schema.json',
  'schemas/producer-component-set.schema.json',
  'schemas/tenant-bootstrap-manifest.schema.json',
  'schemas/gate-evidence-package.schema.json',
  'schemas/trusted-oidc-issuer.schema.json',
  'schemas/runtime-session-record.schema.json',
  'schemas/manifest-signer-key.schema.json',
  'schemas/source-temporal-precedence-case.schema.json',
  'schemas/execution-status.schema.json',
  'schemas/runtime-manifest.schema.json',
  'schemas/profile-browser-v1.schema.json',
  'schemas/profile-browser-backend-v1.schema.json',
  'schemas/profile-endpoint-v1.schema.json',
  'schemas/profile-llm-gateway-v1.schema.json',
  'schemas/profile-mcp-gateway-v1.schema.json',
  'fixtures/final-delta-freeze/trusted-oidc-issuer.valid.json',
  'fixtures/final-delta-freeze/runtime-session-record.valid.json',
  'fixtures/final-delta-freeze/manifest-signer-key.valid.json',
  'fixtures/final-delta-freeze/source-temporal-precedence-cases.json',
  'sql/001-die-core.sql',
  'sql/002-die-clickhouse.sql',
  'sql/003-die-roles-and-grants.sql',
  'ui/screen-api-matrix.csv',
  'ui/nuxt-seam-verification.yaml',
  'tools/requirements-test.txt',
  'tools/requirements-test.lock',
  'tools/test-schema-contracts.py',
  'tools/test-postgres-ddl.py',
  'tools/test-openapi-contracts.py',
  'tools/test-validator-mutations.mjs',
  'tools/yaml-to-json.py',
  'tools/run-live-storage-conformance.sh',
  'tools/run-clean-room-validation.mjs',
  'tools/build-cloud-context.mjs',
  'tools/validate-cloud-context.mjs',
  'tools/snapshot-quilrbusiness-org.mjs',
  'tools/classify-quilrbusiness-repositories.mjs',
  'tools/snapshot-local-source-checkouts.mjs',
  'tools/snapshot-selected-github-revisions.mjs',
  'tools/build-lg008-authority.mjs',
  'tools/validate-lg008-authority.mjs',
  'tools/query-lg008-authority.mjs',
  'tools/run-lg008-saturation.mjs',
  'tools/live/postgres-conformance.sql',
  'tools/live/clickhouse-conformance.sql',
]

required.forEach(requireFile)

try {
  const result = execFileSync(
    'node',
    [join(root, 'tools/validate-lg008-authority.mjs')],
    {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        LG008_VALIDATION_MODE: 'intrinsic',
      },
    },
  ).trim()
  notes.push(result)
}
catch (error) {
  fail(`LG-008 authority validation failed: ${String(error.stderr || error.message).trim()}`)
}

// Historical source-analysis fixtures in the portable payload are
// non-normative and have their own exact digest/path/size validator.
const cloudContextPayload = `${join(root, 'cloud-context/payload')}/`
const allFiles = walk(root).filter(path => !path.startsWith(cloudContextPayload))
for (const path of allFiles.filter(item => item.endsWith('.json'))) {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'))
    if (path.includes('/schemas/')) {
      if (value.$schema !== 'https://json-schema.org/draft/2020-12/schema')
        fail(`${relative(root, path)} is not Draft 2020-12`)
      if (!value.$id)
        fail(`${relative(root, path)} has no $id`)
      const checkIntegerBounds = (node, pointer = '#') => {
        if (!node || typeof node !== 'object')
          return
        const types = Array.isArray(node.type) ? node.type : [node.type]
        if (types.includes('integer')) {
          if (!Number.isSafeInteger(node.maximum) || node.maximum > maxSafeInteger)
            fail(`${relative(root, path)}${pointer} integer lacks a JavaScript-safe maximum`)
          if (node.minimum !== undefined
            && (!Number.isSafeInteger(node.minimum) || node.minimum < -maxSafeInteger))
            fail(`${relative(root, path)}${pointer} integer has an unsafe minimum`)
        }
        if (types.includes('number')) {
          if (!Number.isFinite(node.maximum) || node.maximum > maxSafeInteger)
            fail(`${relative(root, path)}${pointer} number lacks a finite wire-safe maximum`)
          if (!Number.isFinite(node.minimum) || node.minimum < -maxSafeInteger)
            fail(`${relative(root, path)}${pointer} number lacks a finite wire-safe minimum`)
        }
        Object.entries(node).forEach(([key, child]) => checkIntegerBounds(child, `${pointer}/${key}`))
      }
      checkIntegerBounds(value)
    }
  }
  catch (error) {
    fail(`JSON parse failed for ${relative(root, path)}: ${error.message}`)
  }
}

const profilePaths = allFiles.filter(path => /schemas\/profile-.*\.json$/.test(path))
const prohibitedProducerKeys = [
  'canonical_entity',
  'canonical_entity_id',
  'canonical_relationship_id',
  'raw_prompt',
  'raw_response',
  'raw_tool_arguments',
  'raw_tool_result',
  'authorization_header',
  'api_key',
  'password',
  'private_key',
]
for (const path of profilePaths) {
  const schema = JSON.parse(readFileSync(path, 'utf8'))
  const text = JSON.stringify(schema)
  for (const key of prohibitedProducerKeys) {
    if (new RegExp(`"${key}"\\s*:`).test(text))
      fail(`${relative(root, path)} defines prohibited producer key ${key}`)
  }
  if (!/(?:\.snapshot|reconciliation_snapshot)"/.test(text))
    fail(`${relative(root, path)} lacks a typed reconciliation snapshot record`)
}
const deliverySchema = JSON.parse(requireFile('schemas/delivery-batch.schema.json'))
const admittedCaptureStates = deliverySchema.$defs?.privacy?.properties?.capture_state?.enum ?? []
if (admittedCaptureStates.includes('prohibited'))
  fail('delivery schema admits prohibited facts instead of rejecting them before the WAL')

const yamlPaths = allFiles.filter(path => path.endsWith('.yaml') || path.endsWith('.yml'))
const yaml = new Map(yamlPaths.map(path => [path, parseYaml(path)]))
const authzModel = yaml.get(join(root, 'authz/model.yaml'))
const authzCapabilities = new Set(authzModel?.capabilities ?? [])
const authzFieldClasses = new Set(authzModel?.field_classifications ?? [])
for (const [role, definition] of Object.entries(authzModel?.roles ?? {})) {
  for (const capability of definition.capabilities ?? []) {
    if (!authzCapabilities.has(capability))
      fail(`authorization role ${role} uses unknown capability ${capability}`)
  }
  if (!authzFieldClasses.has(definition.maximum_field_classification))
    fail(`authorization role ${role} lacks a valid maximum_field_classification`)
}

const openapiPath = join(root, 'openapi/die-v1.openapi.yaml')
const openapi = yaml.get(openapiPath)
const operationIds = new Set()
const operationCapabilities = new Map()
if (openapi) {
  if (openapi.openapi !== '3.1.0')
    fail(`OpenAPI version must be 3.1.0, got ${openapi.openapi}`)
  if (!openapi.paths || !openapi.components?.schemas)
    fail('OpenAPI must define paths and component schemas')

  const refs = []
  function visit(value) {
    if (!value || typeof value !== 'object')
      return
    if (typeof value.operationId === 'string') {
      if (operationIds.has(value.operationId))
        fail(`duplicate OpenAPI operationId: ${value.operationId}`)
      operationIds.add(value.operationId)
      const capability = value['x-quilr-capability']
      if (!authzCapabilities.has(capability))
        fail(`OpenAPI operation ${value.operationId} has missing or unknown x-quilr-capability ${capability}`)
      else
        operationCapabilities.set(value.operationId, capability)
    }
    if (typeof value.$ref === 'string')
      refs.push(value.$ref)
    const types = Array.isArray(value.type) ? value.type : [value.type]
    if (types.includes('integer')) {
      if (!Number.isSafeInteger(value.maximum) || value.maximum > maxSafeInteger)
        fail('customer OpenAPI contains an integer without a JavaScript-safe maximum')
      if (value.minimum !== undefined
        && (!Number.isSafeInteger(value.minimum) || value.minimum < -maxSafeInteger))
        fail('customer OpenAPI contains an integer with an unsafe minimum')
    }
    if (types.includes('number')) {
      if (!Number.isFinite(value.maximum) || value.maximum > maxSafeInteger)
        fail('customer OpenAPI contains a number without a finite wire-safe maximum')
      if (!Number.isFinite(value.minimum) || value.minimum < -maxSafeInteger)
        fail('customer OpenAPI contains a number without a finite wire-safe minimum')
    }
    Object.values(value).forEach(visit)
  }
  visit(openapi)

  for (const ref of refs.filter(value => value.startsWith('#/'))) {
    let target = openapi
    for (const rawPart of ref.slice(2).split('/')) {
      const part = rawPart.replaceAll('~1', '/').replaceAll('~0', '~')
      target = target?.[part]
    }
    if (target === undefined)
      fail(`unresolved OpenAPI reference: ${ref}`)
  }

  const requiredOperations = [
    'getOverview', 'listEntities', 'getEntity', 'listEntityRelationships',
    'listAgentDeployments', 'getAgentDeployment', 'listAgentExposurePaths',
    'listApplications', 'getApplication', 'listModels', 'getModel',
    'listMcpServers', 'getMcpServer', 'listDevices', 'getDevice',
    'listIdentities', 'getIdentity',
    'listActivity', 'getActivity', 'listEvidence', 'getEvidence',
    'getEvidenceLineage', 'createEvidenceContentAccess', 'redeemEvidenceContentAccess',
    'listCoverage', 'listCoverageGaps', 'listProducers',
    'listIdentityConflicts', 'previewIdentityAction', 'commitIdentityAction', 'getIdentityAction',
    'listRoleBindings', 'previewAuthorizationAction', 'commitAuthorizationAction',
    'createExport', 'listAuditEvents',
    'downloadExport',
  ]
  requiredOperations.forEach(id => {
    if (!operationIds.has(id))
      fail(`OpenAPI missing required operationId: ${id}`)
  })
  for (const [pathName, pathItem] of Object.entries(openapi.paths)) {
    const operation = pathItem.post
    if (!operation)
      continue
    const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]
    if (!parameters.some(parameter => parameter.$ref === '#/components/parameters/IdempotencyKey'))
      fail(`customer POST ${pathName} lacks mandatory Idempotency-Key`)
  }
  if (operationCapabilities.get('downloadExport') !== 'export.download')
    fail('export content download does not require the distinct export.download capability')

  const deferredProperties = ['risk_score', 'finding_count', 'policy_status', 'cost', 'spend', 'recommendation']
  const schemaProperties = new Set()
  for (const schema of Object.values(openapi.components.schemas)) {
    const collect = value => {
      if (!value || typeof value !== 'object')
        return
      if (value.properties)
        Object.keys(value.properties).forEach(key => schemaProperties.add(key))
      Object.values(value).forEach(collect)
    }
    collect(schema)
  }
  deferredProperties.forEach(key => {
    if (schemaProperties.has(key))
      fail(`deferred product property appears in OpenAPI: ${key}`)
  })
  const coverageRequired = new Set(openapi.components.schemas.CoverageInterval?.required ?? [])
  for (const field of ['population_id', 'population_type']) {
    if (!coverageRequired.has(field))
      fail(`CoverageInterval does not require authoritative ${field}`)
  }
  for (const [schemaName, schema] of Object.entries(openapi.components.schemas)) {
    for (const branch of schema.allOf ?? []) {
      if (typeof branch.$ref !== 'string' || !branch.$ref.startsWith('#/components/schemas/'))
        continue
      const targetName = branch.$ref.slice('#/components/schemas/'.length)
      if (openapi.components.schemas[targetName]?.additionalProperties === false)
        fail(`${schemaName} allOf-extends closed schema ${targetName}; use explicit nested composition`)
    }
  }
  for (const schemaName of [
    'EntityDetail',
    'AgentDeploymentDetail',
    'ApplicationDetail',
    'ModelDetail',
    'McpServerDetail',
    'DeviceDetail',
    'IdentityDetail',
    'ActivityDetail',
    'ProducerDetail',
  ]) {
    const schema = openapi.components.schemas[schemaName]
    if (!schema?.required?.includes('summary') || !schema?.properties?.summary?.$ref)
      fail(`${schemaName} must compose its closed list-row schema under required summary`)
  }
  const coverageGap = openapi.components.schemas.CoverageGap
  if (!coverageGap?.required?.includes('interval')
    || coverageGap?.properties?.interval?.$ref !== '#/components/schemas/CoverageInterval')
    fail('CoverageGap must compose CoverageInterval under required interval')

  const fieldPolicy = yaml.get(join(root, 'authz/api-field-policy.yaml'))
  const classificationOrder = fieldPolicy?.classification_order ?? []
  const defaultClassBySchema = new Map()
  for (const [classification, schemaNames] of Object.entries(fieldPolicy?.schema_defaults ?? {})) {
    if (!classificationOrder.includes(classification))
      fail(`API field policy uses unknown classification ${classification}`)
    for (const schemaName of schemaNames ?? []) {
      if (defaultClassBySchema.has(schemaName))
        fail(`API schema ${schemaName} has multiple default field classifications`)
      defaultClassBySchema.set(schemaName, classification)
    }
  }
  for (const [schemaName, schema] of Object.entries(openapi.components.schemas)) {
    if (schema.properties && !defaultClassBySchema.has(schemaName))
      fail(`API schema ${schemaName} has properties but no field-policy default`)
  }
  for (const schemaName of defaultClassBySchema.keys()) {
    if (!openapi.components.schemas[schemaName]?.properties)
      fail(`API field policy references unknown or propertyless schema ${schemaName}`)
  }
  const dynamicFields = fieldPolicy?.dynamic_fields ?? {}
  const propertyAt = (fieldPath) => {
    const [schemaName, propertyName, ...extra] = fieldPath.split('.')
    return extra.length ? null : openapi.components.schemas[schemaName]?.properties?.[propertyName]
  }
  for (const [classification, fieldPaths] of Object.entries(fieldPolicy?.field_overrides ?? {})) {
    const overrideRank = classificationOrder.indexOf(classification)
    if (overrideRank < 0)
      fail(`API field override uses unknown classification ${classification}`)
    for (const fieldPath of fieldPaths ?? []) {
      const property = propertyAt(fieldPath)
      if (!property) {
        fail(`API field override references unknown field ${fieldPath}`)
        continue
      }
      const schemaName = fieldPath.split('.')[0]
      const defaultRank = classificationOrder.indexOf(defaultClassBySchema.get(schemaName))
      if (overrideRank < defaultRank)
        fail(`API field override ${fieldPath} weakens its schema default`)
    }
  }
  for (const [fieldPath, handler] of Object.entries(dynamicFields)) {
    if (!propertyAt(fieldPath))
      fail(`API dynamic-field policy references unknown field ${fieldPath}`)
    if (typeof handler !== 'string' || !handler)
      fail(`API dynamic-field policy ${fieldPath} lacks a handler`)
  }
  for (const [schemaName, schema] of Object.entries(openapi.components.schemas)) {
    for (const [propertyName, property] of Object.entries(schema.properties ?? {})) {
      const serialized = JSON.stringify(property)
      const isDynamic = serialized.includes('#/components/schemas/SafeAttributeMap')
        || (property.type === 'object' && property.additionalProperties
          && property.additionalProperties !== false)
      if (isDynamic && !dynamicFields[`${schemaName}.${propertyName}`])
        fail(`API dynamic object ${schemaName}.${propertyName} lacks a key-classification handler`)
    }
  }
}

const relationshipEndReasons = openapi?.components?.schemas?.Relationship?.properties?.end_reason?.enum ?? []
for (const reason of ['source_ended', 'retracted', 'reconciliation_absent', 'corrected', 'unknown']) {
  if (!relationshipEndReasons.includes(reason))
    fail(`Relationship.end_reason omits frozen value ${reason}`)
}

// Producer health is one closed common vocabulary shared by the API, the read
// projection and every source profile. Sensor-native states outside it are
// normalized by the adapter and preserved in evidence, never added here.
const producerHealthStates = ['unknown', 'healthy', 'degraded', 'unhealthy', 'offline']
const openapiHealthStates = openapi?.components?.schemas?.ProducerHealthState?.enum ?? []
if ([...openapiHealthStates].sort().join(',') !== [...producerHealthStates].sort().join(','))
  fail(`ProducerHealthState must be exactly ${producerHealthStates.join(', ')}`)
if (openapi?.components?.schemas?.Producer?.properties?.health_state?.$ref
  !== '#/components/schemas/ProducerHealthState')
  fail('Producer.health_state must reference the common ProducerHealthState vocabulary')
for (const field of ['health_state', 'health_evaluated_at']) {
  if (!openapi?.components?.schemas?.Producer?.required?.includes(field))
    fail(`Producer does not require ${field}`)
}
if (!openapi?.components?.schemas?.ProducerDetail?.required?.includes('health')
  || openapi?.components?.schemas?.ProducerDetail?.properties?.health?.$ref
    !== '#/components/schemas/ProducerHealth')
  fail('getProducer must explain health through the required ProducerHealth detail')
const producerHealthComponent = openapi?.components?.schemas?.ProducerHealthComponent
for (const field of ['component', 'required', 'state', 'evidence_state']) {
  if (!producerHealthComponent?.required?.includes(field))
    fail(`ProducerHealthComponent does not require ${field}`)
}
if (producerHealthComponent?.properties?.state?.$ref !== '#/components/schemas/ProducerHealthState')
  fail('ProducerHealthComponent.state must reference the common ProducerHealthState vocabulary')
if (!producerHealthComponent?.properties?.source_native_state)
  fail('ProducerHealthComponent must preserve the pre-normalization sensor-native state')
const producerHealthReasons = openapi?.components?.schemas?.ProducerHealthReason?.enum ?? []
for (const reason of [
  'no_health_policy', 'insufficient_evidence',
  'required_component_offline', 'producer_liveness_expired',
  'required_component_unhealthy', 'delivery_queue_unhealthy',
  'required_component_degraded', 'required_component_stale',
  'required_component_missing', 'delivery_queue_degraded',
  'all_required_components_healthy',
]) {
  if (!producerHealthReasons.includes(reason))
    fail(`ProducerHealthReason omits frozen value ${reason}`)
}
for (const profile of [
  'profile-browser-v1.schema.json',
  'profile-endpoint-v1.schema.json',
  'profile-llm-gateway-v1.schema.json',
  'profile-mcp-gateway-v1.schema.json',
]) {
  const schemaText = requireFile(`schemas/${profile}`)
  const stateEnums = [...schemaText.matchAll(/"state":\s*\{\s*"enum":\s*\[([^\]]*)\]/g)]
    .map(match => [...match[1].matchAll(/"([^"]+)"/g)].map(value => value[1]))
  const healthEnum = stateEnums.find(values => values.includes('offline'))
  if (!healthEnum)
    fail(`${profile} no longer declares a producer health state enum`)
  else if ([...healthEnum].sort().join(',') !== [...producerHealthStates].sort().join(','))
    fail(`${profile} health state diverges from the common ProducerHealthState vocabulary`)
}

// The signed health policy is the only source of health timing. Neither manifest
// may carry an unfrozen timing constant, and neither may omit the policy.
const healthPolicyFields = [
  'policy_version',
  'expected_report_interval_seconds',
  'degraded_after_seconds',
  'offline_after_seconds',
  'queue_degraded_after_ms',
  'queue_unhealthy_after_ms',
  'required_components',
]
const enrollmentSchema = JSON.parse(requireFile('schemas/producer-enrollment-manifest.schema.json'))
const enrollmentHealthPolicy = enrollmentSchema.$defs?.healthPolicy
if (!enrollmentSchema.properties?.health_policy)
  fail('producer enrollment manifest does not carry a signed health policy')
const enrollmentOperationBranches = enrollmentSchema.oneOf ?? []
const enrollmentApplyBranch = enrollmentOperationBranches
  .find(branch => branch.properties?.operation?.const === 'apply')
if (!enrollmentApplyBranch?.required?.includes('health_policy'))
  fail('producer enrollment apply does not require a signed health policy')
const expectedManifestOperations = ['apply', 'rotate', 'revoke', 'certify']
for (const operation of expectedManifestOperations) {
  const branches = enrollmentOperationBranches.filter(
    branch => branch.properties?.operation?.const === operation,
  )
  if (branches.length !== 1)
    fail(`producer enrollment ${operation} must have exactly one discriminated oneOf arm`)
  else if (!(branches[0].not?.anyOf?.length > 0))
    fail(`producer enrollment ${operation} does not reject stale fields from other operation arms`)
}
if ((enrollmentSchema.allOf ?? []).some(
  branch => branch.if?.properties?.operation?.const,
)) {
  fail('producer enrollment operations use overlapping conditional arms instead of exact oneOf payloads')
}
for (const operation of expectedManifestOperations) {
  if (!enrollmentSchema['x-starliner-stateful-rules']?.[operation])
    fail(`producer enrollment ${operation} lacks a frozen stateful admission rule`)
}
const edgeConfigurationSchema = JSON.parse(requireFile('schemas/edge-configuration.schema.json'))
const edgeHealthPolicy = edgeConfigurationSchema.properties?.health_policy
if (!edgeConfigurationSchema.required?.includes('health_policy'))
  fail('edge configuration does not require a signed health policy')
for (const [label, policy] of [
  ['producer enrollment manifest', enrollmentHealthPolicy],
  ['edge configuration', edgeHealthPolicy],
]) {
  if (!policy) {
    fail(`${label} health policy is missing`)
    continue
  }
  if (policy.additionalProperties !== false)
    fail(`${label} health policy admits an unfrozen timing constant`)
  for (const field of healthPolicyFields) {
    if (!policy.required?.includes(field))
      fail(`${label} health policy does not require ${field}`)
  }
  if ((policy.properties?.required_components?.minItems ?? 0) < 1)
    fail(`${label} health policy allows an empty required-component set`)
}

const edgeOpenapiPath = join(root, 'openapi/starliner-ingest-v1.openapi.yaml')
const edgeOpenapi = yaml.get(edgeOpenapiPath)
if (edgeOpenapi) {
  if (edgeOpenapi.openapi !== '3.1.0')
    fail(`edge OpenAPI version must be 3.1.0, got ${edgeOpenapi.openapi}`)
  const edgeOperations = new Set()
  const edgeRefs = []
  const visitEdge = value => {
    if (!value || typeof value !== 'object')
      return
    if (typeof value.operationId === 'string')
      edgeOperations.add(value.operationId)
    if (typeof value.$ref === 'string')
      edgeRefs.push(value.$ref)
    const types = Array.isArray(value.type) ? value.type : [value.type]
    if (types.includes('integer')) {
      if (!Number.isSafeInteger(value.maximum) || value.maximum > maxSafeInteger)
        fail('edge OpenAPI contains an integer without a JavaScript-safe maximum')
      if (value.minimum !== undefined
        && (!Number.isSafeInteger(value.minimum) || value.minimum < -maxSafeInteger))
        fail('edge OpenAPI contains an integer with an unsafe minimum')
    }
    if (types.includes('number')) {
      if (!Number.isFinite(value.maximum) || value.maximum > maxSafeInteger)
        fail('edge OpenAPI contains a number without a finite wire-safe maximum')
      if (!Number.isFinite(value.minimum) || value.minimum < -maxSafeInteger)
        fail('edge OpenAPI contains a number without a finite wire-safe minimum')
    }
    Object.values(value).forEach(visitEdge)
  }
  visitEdge(edgeOpenapi)
  for (const id of ['ingestStarlinerBatch', 'getStarlinerEdgeConfiguration']) {
    if (!edgeOperations.has(id))
      fail(`edge OpenAPI missing required operationId: ${id}`)
  }
  for (const ref of edgeRefs.filter(value => !value.startsWith('#/'))) {
    const target = ref.split('#')[0]
    if (!existsSync(resolve(dirname(edgeOpenapiPath), target)))
      fail(`edge OpenAPI has broken external reference: ${ref}`)
  }
}

const uiRows = parseCsv(requireFile('ui/screen-api-matrix.csv'), 'ui/screen-api-matrix.csv')
const uiHeader = uiRows[0] ?? []
const primaryIndex = uiHeader.indexOf('primary_operation')
const supportingIndex = uiHeader.indexOf('supporting_operations')
const requiredCapabilityIndex = uiHeader.indexOf('required_capability')
const actionGatingIndex = uiHeader.indexOf('action_gating')
if (primaryIndex < 0 || supportingIndex < 0 || requiredCapabilityIndex < 0 || actionGatingIndex < 0) {
  fail('UI matrix lacks operation columns')
}
else {
  for (const [index, row] of uiRows.slice(1).entries()) {
    const operations = [
      row[primaryIndex]?.split('?')[0],
      ...(row[supportingIndex]?.split('|') ?? []),
    ].filter(Boolean)
    operations.forEach(operation => {
      if (!operationIds.has(operation))
        fail(`UI matrix row ${index + 2} references missing OpenAPI operationId ${operation}`)
    })
    const primaryOperation = row[primaryIndex]?.split('?')[0]
    const requiredCapability = row[requiredCapabilityIndex]
    if (primaryOperation && operationCapabilities.get(primaryOperation) !== requiredCapability)
      fail(`UI matrix row ${index + 2} capability ${requiredCapability} disagrees with ${primaryOperation}`)
    if (row[actionGatingIndex] !== 'per_operation_server_capability')
      fail(`UI matrix row ${index + 2} does not gate actions by each operation capability`)
  }
}

for (const path of [
  'registers/module-disposition.csv',
  'registers/data-authority.csv',
  'registers/profile-capability-disposition.csv',
  'registers/profile-entity-disposition.csv',
  'registers/sensor-capability-register.csv',
  'registers/field-disposition.csv',
  'registers/relationship-support.csv',
  'registers/future-connector-backlog.csv',
  'registers/ui-field-lineage.csv',
  'registers/defect-closure-ledger.csv',
  'registers/source-analysis-inputs.csv',
  'registers/lg-evidence-needs.csv',
  'registers/source-temporal-precedence.csv',
  'registers/implementation-conformance.csv',
  'engineering-execution/registers/product-capability-map.csv',
])
  parseCsv(requireFile(path), path)

function csvObjects(path) {
  const rows = parseCsv(requireFile(path), path)
  const header = rows[0] ?? []
  return rows.slice(1).map(row => Object.fromEntries(header.map((name, index) => [name, row[index]])))
}

const profileCapabilityRows = csvObjects('registers/profile-capability-disposition.csv')
const allowedSupportStates = new Set([
  'adapter_derivable',
  'new_capture_required',
  'legacy_backend_only',
  'future_connector_required',
  'prohibited',
  'prohibited_default',
  'unresolved',
])
const profileKinds = new Map()
for (const row of profileCapabilityRows) {
  const key = `${row.profile}:${row.payload_kind}`
  if (profileKinds.has(key))
    fail(`duplicate profile capability disposition ${key}`)
  profileKinds.set(key, row)
  if (!allowedSupportStates.has(row.support_state))
    fail(`profile capability ${key} has unknown support_state ${row.support_state}`)
  if (!row.native_evidence || !row.adapter_requirement || !row.production_gate)
    fail(`profile capability ${key} lacks evidence, adapter requirement, or production gate`)
}

const profileFileNames = {
  browser: 'profile-browser-v1.schema.json',
  browser_backend: 'profile-browser-backend-v1.schema.json',
  endpoint: 'profile-endpoint-v1.schema.json',
  llm_gateway: 'profile-llm-gateway-v1.schema.json',
  mcp_gateway: 'profile-mcp-gateway-v1.schema.json',
}
for (const [profile, fileName] of Object.entries(profileFileNames)) {
  const schema = JSON.parse(requireFile(`schemas/${fileName}`))
  const kinds = new Set()
  const collectKinds = value => {
    if (!value || typeof value !== 'object')
      return
    if (typeof value.properties?.kind?.const === 'string')
      kinds.add(value.properties.kind.const)
    Object.values(value).forEach(collectKinds)
  }
  collectKinds(schema)
  for (const kind of kinds) {
    if (!profileKinds.has(`${profile}:${kind}`))
      fail(`profile capability register omits ${profile}:${kind}`)
  }
  for (const key of profileKinds.keys()) {
    if (key.startsWith(`${profile}:`) && !kinds.has(key.slice(profile.length + 1)))
      fail(`profile capability register contains ${key} absent from ${fileName}`)
  }
}

const temporalRows = csvObjects('registers/source-temporal-precedence.csv')
const temporalKinds = new Map()
const allowedComparators = new Set(['none', 'numeric_decimal_string'])
for (const row of temporalRows) {
  const key = `${row.profile}:${row.payload_kind}`
  if (temporalKinds.has(key))
    fail(`duplicate temporal precedence row ${key}`)
  temporalKinds.set(key, row)
  if (!profileKinds.has(key))
    fail(`temporal precedence row ${key} is not an admitted profile kind`)
  if (!allowedComparators.has(row.comparator))
    fail(`temporal precedence row ${key} has unsupported comparator ${row.comparator}`)
  if (!row.aggregate_class || !row.revision_presence || !row.observed_time
    || !row.tie_breaker || !row.end_carrier || !row.retraction_carrier
    || !row.stale_effect || !row.current_head_effect)
    fail(`temporal precedence row ${key} is incomplete`)
  if (row.revision_presence === 'absent' && (row.revision_field || row.comparator !== 'none'))
    fail(`temporal precedence row ${key} fabricates a revision carrier`)
  if (row.revision_presence !== 'absent' && (!row.revision_field || row.comparator === 'none'))
    fail(`temporal precedence row ${key} lacks its comparator`)
}
for (const key of profileKinds.keys()) {
  if (!temporalKinds.has(key))
    fail(`temporal precedence register omits admitted kind ${key}`)
}

const precedenceCases = JSON.parse(requireFile('fixtures/final-delta-freeze/source-temporal-precedence-cases.json'))
const precedenceIds = new Set()
for (const [index, item] of precedenceCases.entries()) {
  const expectedId = `PRC-${String(index + 1).padStart(3, '0')}`
  if (item.case_id !== expectedId || precedenceIds.has(item.case_id))
    fail(`temporal precedence fixtures must be contiguous and unique at ${expectedId}`)
  precedenceIds.add(item.case_id)
  const key = `${item.profile}:${item.payload_kind}`
  const fixtureIds = new Set((temporalKinds.get(key)?.fixture_ids ?? '').split('|').filter(Boolean))
  if (!temporalKinds.has(key) || !fixtureIds.has(item.case_id))
    fail(`temporal precedence case ${item.case_id} is not linked from ${key}`)
}
if (precedenceCases.length !== 25)
  fail(`temporal precedence corpus must contain exactly 25 cases, found ${precedenceCases.length}`)

const conformanceRows = csvObjects('registers/implementation-conformance.csv')
const conformanceIds = new Set()
const conformanceStates = new Set([
  'specified_not_implemented', 'transitional_must_remove',
  'implemented_not_certified', 'release_evidence_missing',
  'implementation_contradiction', 'remediation_required', 'accepted_complete',
])
for (const row of conformanceRows) {
  if (!/^IC-[0-9]{3}$/.test(row.item_id) || conformanceIds.has(row.item_id))
    fail(`missing invalid or duplicate implementation conformance ID ${row.item_id}`)
  conformanceIds.add(row.item_id)
  if (!conformanceStates.has(row.current_classification))
    fail(`implementation conformance ${row.item_id} has invalid classification ${row.current_classification}`)
  if (!/^[0-9a-f]{40}$/.test(row.implementation_revision))
    fail(`implementation conformance ${row.item_id} lacks an exact commit or explicit zero revision`)
  for (const field of ['domain', 'required_contract', 'implementation_repository', 'evidence', 'closure_condition', 'release_effect', 'owner_work_package']) {
    if (!row[field])
      fail(`implementation conformance ${row.item_id} lacks ${field}`)
  }
  if (row.current_classification === 'accepted_complete'
    && (!row.evidence.includes('gate-evidence') || row.implementation_revision === '0'.repeat(40)))
    fail(`implementation conformance ${row.item_id} claims accepted_complete without retained gate evidence`)
}

const capabilityRows = csvObjects('registers/sensor-capability-register.csv')
const capabilityIds = new Set()
for (const row of capabilityRows) {
  if (!row.capability_id || capabilityIds.has(row.capability_id))
    fail(`missing or duplicate sensor capability ID ${row.capability_id}`)
  capabilityIds.add(row.capability_id)
  if (!allowedSupportStates.has(row.support_state))
    fail(`sensor capability ${row.capability_id} has unknown support_state ${row.support_state}`)
  if (!row.native_object_or_seam || !row.captured_fields || !row.evidence)
    fail(`sensor capability ${row.capability_id} lacks native seam, captured fields, or evidence`)
}

const fieldRows = csvObjects('registers/field-disposition.csv')
for (const [index, row] of fieldRows.entries()) {
  if (!row.sensor || !row.source_structure || !row.source_fields || !row.disposition || !row.evidence)
    fail(`field disposition row ${index + 2} lacks its evidence-bearing identity`)
}

const relationshipRows = csvObjects('registers/relationship-support.csv')
const relationshipIds = new Set()
for (const row of relationshipRows) {
  if (!row.relationship_id || relationshipIds.has(row.relationship_id))
    fail(`missing or duplicate relationship support ID ${row.relationship_id}`)
  relationshipIds.add(row.relationship_id)
  if (!allowedSupportStates.has(row.support_state))
    fail(`relationship ${row.relationship_id} has unknown support_state ${row.support_state}`)
  if (!row.subject || !row.predicate || !row.object || !row.evidence_rule)
    fail(`relationship ${row.relationship_id} lacks endpoint, predicate, or evidence rule`)
  if (row.automatic_materialization === 'yes' && row.support_state !== 'adapter_derivable')
    fail(`relationship ${row.relationship_id} auto-materializes despite support_state ${row.support_state}`)
  if (['future_connector_required', 'unresolved', 'legacy_backend_only'].includes(row.support_state)
    && row.automatic_materialization !== 'no')
    fail(`relationship ${row.relationship_id} must not auto-materialize with support_state ${row.support_state}`)
}

const connectorRows = csvObjects('registers/future-connector-backlog.csv')
for (const [index, row] of connectorRows.entries()) {
  if (!row.connector_family || !row.authoritative_objects || !row.authoritative_relationships || !row.minimum_acceptance_contract)
    fail(`future connector row ${index + 2} lacks authority, entities, or relationships`)
  if (row.status !== 'future_connector_required')
    fail(`future connector row ${index + 2} must remain future_connector_required`)
}

const uiFieldRows = csvObjects('registers/ui-field-lineage.csv')
const uiFieldIds = new Set()
for (const row of uiFieldRows) {
  if (!row.field_id || uiFieldIds.has(row.field_id))
    fail(`missing or duplicate UI field lineage ID ${row.field_id}`)
  uiFieldIds.add(row.field_id)
  if (!row.screen || !row.ui_field || !row.native_fields_or_rule || !row.profile_payload
    || !row.canonical_or_projection_rule || !row.read_model || !row.api_operation
    || !row.api_field || !row.unknown_behavior || !row.evidence)
    fail(`UI field lineage ${row.field_id} has an incomplete source-to-UI chain`)
  if (!allowedSupportStates.has(row.support_state))
    fail(`UI field lineage ${row.field_id} has unknown support_state ${row.support_state}`)
  if (!operationIds.has(row.api_operation))
    fail(`UI field lineage ${row.field_id} references missing OpenAPI operation ${row.api_operation}`)
}

const readinessRows = csvObjects('production-readiness/registers/readiness-levels.csv')
const readinessIds = new Set()
for (const row of readinessRows) {
  if (!/^RL-[0-9]{3}$/.test(row.level_id) || readinessIds.has(row.level_id))
    fail(`missing, invalid, or duplicate readiness level ${row.level_id}`)
  readinessIds.add(row.level_id)
  if (!['PASS', 'NOT_REACHED_AT_FREEZE'].includes(row.freeze_publication_state))
    fail(`readiness level ${row.level_id} has invalid freeze-publication state ${row.freeze_publication_state}`)
  for (const field of [
    'name', 'entry_rule', 'exit_rule', 'permitted_work', 'prohibited_claim',
    'blocks_implementation',
  ]) {
    if (!row[field])
      fail(`readiness level ${row.level_id} lacks ${field}`)
  }
  if (row.blocks_implementation !== 'NO')
    fail(`readiness level ${row.level_id} incorrectly blocks implementation`)
}
if (readinessRows.length !== 6)
  fail(`readiness ladder must contain exactly 6 levels, found ${readinessRows.length}`)

const gateTestRows = csvObjects('production-readiness/registers/gate-test-catalog.csv')
const gateTestIds = new Set()
const gateTestCounts = new Map()
const gateTestStates = new Set(['PLANNED', 'PASS_LOCAL_SMOKE', 'PASS', 'FAIL', 'BLOCKED'])
for (const row of gateTestRows) {
  const match = row.test_id?.match(/^LG00([1-7])-T[0-9]{3}$/)
  if (!match || gateTestIds.has(row.test_id))
    fail(`missing, invalid, or duplicate production gate test ${row.test_id}`)
  gateTestIds.add(row.test_id)
  const expectedGate = `LG-00${match?.[1]}`
  if (row.gate !== expectedGate)
    fail(`gate test ${row.test_id} names ${row.gate}; expected ${expectedGate}`)
  if (!['YES', 'NO'].includes(row.required))
    fail(`gate test ${row.test_id} has invalid required state ${row.required}`)
  if (!gateTestStates.has(row.current_state))
    fail(`gate test ${row.test_id} has invalid current state ${row.current_state}`)
  if (row.current_state === 'PASS_LOCAL_SMOKE' && !['LG-001', 'LG-002'].includes(row.gate))
    fail(`only exact target-engine gates may use PASS_LOCAL_SMOKE: ${row.test_id}`)
  for (const field of [
    'domain', 'scenario', 'invariant', 'required_evidence',
  ]) {
    if (!row[field])
      fail(`gate test ${row.test_id} lacks ${field}`)
  }
  gateTestCounts.set(row.gate, (gateTestCounts.get(row.gate) ?? 0) + 1)
}
for (let index = 1; index <= 7; index += 1) {
  const gate = `LG-00${index}`
  if ((gateTestCounts.get(gate) ?? 0) < 10)
    fail(`${gate} has fewer than 10 executable production tests`)
}

const defectRows = csvObjects('registers/defect-closure-ledger.csv')
const defectIds = new Set()
const defectStates = new Set([
  'fixed',
  'verified',
  // An authority fix that independent review found incomplete. It is not
  // reopened as unfixed and it is not closed; the accepted part stands while
  // the named remainder is corrected before implementation may proceed.
  'remediation_required',
  'engineering_action',
  'release_evidence_open',
  'external_input_required',
  'out_of_scope',
])
const severities = new Set(['P0', 'P1', 'P2', 'P3'])
for (const row of defectRows) {
  if (!row.id || defectIds.has(row.id))
    fail(`missing or duplicate defect ID ${row.id}`)
  defectIds.add(row.id)
  if (!severities.has(row.severity))
    fail(`defect ${row.id} has invalid severity ${row.severity}`)
  if (!defectStates.has(row.state))
    fail(`defect ${row.id} has invalid closure state ${row.state}`)
  for (const field of [
    'area', 'evidence', 'violated_invariant', 'failure_scenario',
    'affected_artifacts', 'smallest_correct_remediation', 'verification',
  ]) {
    if (!row[field])
      fail(`defect ${row.id} lacks ${field}`)
  }
}
for (const requiredId of [
  'FP-016', 'FP-018', 'FP-019', 'FP-047', 'FP-048',
  'LG-001', 'LG-002', 'LG-006', 'LG-008',
]) {
  if (!defectIds.has(requiredId))
    fail(`defect ledger omits required independent-review item ${requiredId}`)
}
if (defectRows.filter(row => row.state === 'release_evidence_open').length < 6)
  fail('defect ledger does not preserve every open release-evidence gate')

const productCapabilityRows = csvObjects('engineering-execution/registers/product-capability-map.csv')
const productCapabilityIds = new Set()
const launchProducerCapabilities = new Set(['PC-002', 'PC-003', 'PC-004', 'PC-005', 'PC-006'])
const productStages = new Set([
  'NONE', 'NATIVE_CAPTURE', 'LOCAL_WAL', 'INGEST_RECEIPT', 'IMMUTABLE_EVIDENCE',
  'NORMALIZED', 'CANONICAL_ENTITY', 'CANONICAL_GRAPH_ACTIVITY', 'PROJECTED',
  'AUTHORIZED_API', 'LIVE_UI', 'REBUILD_REPLAY', 'RELEASE_QUALIFIED',
])
let boundedCapabilityCount = 0
let futureCapabilityCount = 0
for (const row of productCapabilityRows) {
  if (!/^PC-[0-9]{3}$/.test(row.capability_id) || productCapabilityIds.has(row.capability_id))
    fail(`invalid or duplicate product capability ${row.capability_id}`)
  productCapabilityIds.add(row.capability_id)
  for (const field of [
    'product_outcome', 'required_stages', 'authority_refs', 'work_packages',
    'completion_required', 'scope', 'customer_facing', 'forbidden_substitute',
  ]) {
    if (!row[field])
      fail(`product capability ${row.capability_id} lacks ${field}`)
  }
  const stages = new Set(row.required_stages.split('|'))
  for (const stage of stages) {
    if (!productStages.has(stage))
      fail(`product capability ${row.capability_id} has invalid stage ${stage}`)
  }
  if (!['YES', 'NO'].includes(row.completion_required))
    fail(`product capability ${row.capability_id} has invalid completion_required ${row.completion_required}`)
  if (!['bounded_die', 'future_extension'].includes(row.scope))
    fail(`product capability ${row.capability_id} has invalid scope ${row.scope}`)
  if (!['YES', 'NO'].includes(row.customer_facing))
    fail(`product capability ${row.capability_id} has invalid customer_facing ${row.customer_facing}`)
  if (row.completion_required === 'YES') {
    boundedCapabilityCount += 1
    if (row.scope !== 'bounded_die' || stages.has('NONE'))
      fail(`required capability ${row.capability_id} must be bounded_die with real required stages`)
  }
  else {
    futureCapabilityCount += 1
    if (row.scope !== 'future_extension')
      fail(`non-required capability ${row.capability_id} must be future_extension`)
  }
  if (row.customer_facing === 'YES' && !stages.has('LIVE_UI'))
    fail(`customer-facing capability ${row.capability_id} omits LIVE_UI`)
  if (row.scope === 'bounded_die') {
    for (const workPackage of row.work_packages.split('|')) {
      if (!/^WP(?:0[0-9]|1[01])$/.test(workPackage))
        fail(`product capability ${row.capability_id} references invalid work package ${workPackage}`)
    }
    for (const gate of row.release_gates.split('|')) {
      if (!/^LG00[1-7]$/.test(gate))
        fail(`product capability ${row.capability_id} references invalid release gate ${gate}`)
    }
  }
  if (/LG-?00[1-8]/.test(row.hard_code_dependencies ?? ''))
    fail(`product capability ${row.capability_id} uses a release gate as a hard code dependency`)
  if (launchProducerCapabilities.has(row.capability_id)) {
    for (const stage of ['NATIVE_CAPTURE', 'LOCAL_WAL', 'INGEST_RECEIPT', 'IMMUTABLE_EVIDENCE', 'NORMALIZED']) {
      if (!stages.has(stage))
        fail(`launch producer capability ${row.capability_id} omits required acquisition stage ${stage}`)
    }
  }
}
if (productCapabilityRows.length < 15)
  fail(`product capability map is too narrow: ${productCapabilityRows.length}`)
if (boundedCapabilityCount !== 15 || futureCapabilityCount !== 1)
  fail(`product capability scope is wrong: ${boundedCapabilityCount} bounded, ${futureCapabilityCount} future`)

const executionStatusSchema = JSON.parse(requireFile('schemas/execution-status.schema.json'))
if (executionStatusSchema.title !== 'DIE product capability execution status')
  fail('execution status schema is not the frozen product capability status contract')
for (const field of [
  'blocker_class', 'blocked_action', 'blocker_evidence', 'blocker_owner',
  'unblock_condition', 'blocker_recheck_at', 'independent_next_action',
  'authority_commit', 'last_verified_sha', 'runtime_manifest',
  'runtime_manifest_digest', 'limitations',
]) {
  if (!executionStatusSchema.required?.includes(field))
    fail(`execution status schema does not require ${field}`)
}
const runtimeManifestSchema = JSON.parse(requireFile('schemas/runtime-manifest.schema.json'))
if (runtimeManifestSchema.title !== 'DIE coherent runtime manifest')
  fail('runtime manifest schema is not the frozen coherent-runtime contract')

const sourceInputRows = csvObjects('registers/source-analysis-inputs.csv')
const sourceInputIds = new Set()
const allowedInputClasses = new Set([
  'mission_prompt',
  'architecture_context',
  'historical_audit',
  'future_domain_context',
  'historical_mission',
  'platform_context',
  'sensor_analysis',
  'legacy_platform_analysis',
  'implementation_audit',
  'official_product_lifecycle',
])
for (const row of sourceInputRows) {
  if (!row.input_id || sourceInputIds.has(row.input_id))
    fail(`missing or duplicate source-analysis input ID ${row.input_id}`)
  sourceInputIds.add(row.input_id)
  if (!allowedInputClasses.has(row.input_class))
    fail(`source-analysis input ${row.input_id} has invalid class ${row.input_class}`)
  for (const field of [
    'subject', 'workspace_path', 'pinned_revisions', 'anchor_sha256',
    'evidence_strength', 'admission_status', 'accepted_use', 'prohibited_use',
    'remaining_action',
  ]) {
    if (!row[field])
      fail(`source-analysis input ${row.input_id} lacks ${field}`)
  }
  if (!/^[a-f0-9]{64}$/.test(row.anchor_sha256))
    fail(`source-analysis input ${row.input_id} has invalid anchor SHA-256`)
}
for (const requiredId of ['CTX-001', 'CTX-007', 'SRC-001', 'SRC-007', 'SRC-008', 'SRC-010']) {
  if (!sourceInputIds.has(requiredId))
    fail(`source-analysis input register omits ${requiredId}`)
}

const organizationRepositoryPath = join(root, 'evidence/github/quilrbusiness-repositories.json')
const organizationRepositories = JSON.parse(readFileSync(organizationRepositoryPath, 'utf8'))
if (organizationRepositories.length !== 377)
  fail(`organization snapshot has ${organizationRepositories.length} repositories instead of 377`)
const organizationNames = new Set(organizationRepositories.map(row => row.name))
if (organizationNames.size !== organizationRepositories.length)
  fail('organization snapshot contains duplicate repository names')

const repositoryRelevanceRows = csvObjects('registers/github-repository-relevance.csv')
if (repositoryRelevanceRows.length !== organizationRepositories.length)
  fail(`repository relevance has ${repositoryRelevanceRows.length} rows for ${organizationRepositories.length} repositories`)
const relevanceNames = new Set()
for (const row of repositoryRelevanceRows) {
  if (!row.repository || relevanceNames.has(row.repository))
    fail(`missing or duplicate repository relevance row ${row.repository}`)
  relevanceNames.add(row.repository)
  if (!organizationNames.has(row.repository))
    fail(`repository relevance includes unknown organization repository ${row.repository}`)
  for (const field of ['repository_url', 'classification', 'evidence_basis', 'lg008_action']) {
    if (!row[field])
      fail(`repository relevance ${row.repository} lacks ${field}`)
  }
}
for (const name of organizationNames) {
  if (!relevanceNames.has(name))
    fail(`repository relevance omits organization repository ${name}`)
}

const selectedEvidencePath = join(root, 'evidence/github/selected-revision-and-build-evidence.json')
const selectedEvidenceText = readFileSync(selectedEvidencePath, 'utf8')
const selectedEvidence = JSON.parse(selectedEvidenceText)
if (selectedEvidence.rows.length < 30)
  fail(`selected GitHub evidence contains only ${selectedEvidence.rows.length} repositories`)
const selectedEvidenceNames = new Set()
for (const row of selectedEvidence.rows) {
  if (!row.repository || selectedEvidenceNames.has(row.repository))
    fail(`missing or duplicate selected GitHub repository ${row.repository}`)
  selectedEvidenceNames.add(row.repository)
  if (!/^[a-f0-9]{40}$/.test(row.selected_source_sha ?? ''))
    fail(`selected GitHub repository ${row.repository} lacks an immutable source SHA`)
}
for (const name of [
  'Project-Vanguard',
  'project-sentinel',
  'sentinel-endpoint-agent',
  'macrodata-refinement',
  'quilr-llm-gateway',
  'browser-extension-service',
  'extension-log-service',
  'quilr-migration-service',
  'data-explorer-service',
]) {
  if (!selectedEvidenceNames.has(name))
    fail(`selected GitHub evidence omits ${name}`)
}
const selectedRowsDigest = createHash('sha256')
  .update(JSON.stringify(selectedEvidence.rows))
  .digest('hex')
if (selectedEvidence.rows_sha256 !== selectedRowsDigest)
  fail('selected GitHub evidence rows_sha256 does not match rows')

const src009 = sourceInputRows.find(row => row.input_id === 'SRC-009')
if (!src009)
  fail('source-analysis input register omits SRC-009')
else {
  const selectedFileDigest = createHash('sha256').update(selectedEvidenceText).digest('hex')
  if (src009.anchor_sha256 !== selectedFileDigest)
    fail('SRC-009 anchor does not match selected-revision-and-build-evidence.json')
}

const sourceRevisionRows = csvObjects('registers/source-revision-selection.csv')
if (sourceRevisionRows.length < 14)
  fail(`source revision selection contains only ${sourceRevisionRows.length} rows`)
for (const row of sourceRevisionRows) {
  for (const field of [
    'profile', 'component', 'component_role', 'historical_analysis_revision',
    'selected_source_revision', 'selected_branch', 'selection_disposition',
    'build_or_release_qualification',
  ]) {
    if (!row[field])
      fail(`source revision row ${row.component} lacks ${field}`)
  }
  if (!/^[a-f0-9]{40}$/.test(row.selected_source_revision))
    fail(`source revision row ${row.component} has invalid selected revision`)
}

const sourceReachabilityRows = csvObjects('registers/production-source-reachability.csv')
const reachabilityIds = new Set()
const allowedReachability = new Set([
  'SOURCE_PROVEN',
  'SOURCE_PROVEN_AND_ROUTED',
  'SOURCE_PROVEN_CONFIGURATION_DEPENDENT',
  'SOURCE_PROVEN_SCHEMA_CONTRADICTION',
  'SOURCE_PROVEN_ROUTE_ONLY',
  'SOURCE_PROVEN_SELECTED_REVISION',
  'SOURCE_PRESENT_NOT_REACHABILITY_PROVEN',
])
if (sourceReachabilityRows.length < 16)
  fail(`production source reachability contains only ${sourceReachabilityRows.length} rows`)
for (const row of sourceReachabilityRows) {
  if (!row.edge_id || reachabilityIds.has(row.edge_id))
    fail(`missing or duplicate production source edge ${row.edge_id}`)
  reachabilityIds.add(row.edge_id)
  for (const field of [
    'origin', 'transport_or_call', 'destination', 'payload_or_contract',
    'source_evidence', 'reachability', 'lg008_use',
  ]) {
    if (!row[field])
      fail(`production source edge ${row.edge_id} lacks ${field}`)
  }
  if (!allowedReachability.has(row.reachability))
    fail(`production source edge ${row.edge_id} has invalid reachability ${row.reachability}`)
}

const lg008OwnerRows = csvObjects('registers/lg008-owner-inputs.csv')
const lg008OwnerIds = new Set()
const ownerInputStates = new Set([
  'RESOLVED_FROM_GITHUB',
  'RESOLVED_IN_AUTHORITY_COMMIT',
  'MOVED_TO_LG005',
  'ENGINEERING_ACTION',
])
for (const row of lg008OwnerRows) {
  if (!row.input_id || lg008OwnerIds.has(row.input_id))
    fail(`missing or duplicate LG-008 owner input ${row.input_id}`)
  lg008OwnerIds.add(row.input_id)
  for (const field of [
    'profile', 'required_input', 'evidence_reason', 'exact_artifact', 'owner',
    'needed_for', 'can_engineering_derive', 'unavailable_disposition', 'status',
  ]) {
    if (!row[field])
      fail(`LG-008 owner input ${row.input_id} lacks ${field}`)
  }
  if (!['YES', 'NO'].includes(row.can_engineering_derive))
    fail(`LG-008 owner input ${row.input_id} has invalid derivability`)
  if (!ownerInputStates.has(row.status))
    fail(`LG-008 owner input ${row.input_id} has invalid status ${row.status}`)
}
for (const requiredId of [
  'LG8-IN-001', 'LG8-IN-006', 'LG8-IN-007', 'LG8-IN-008',
  'LG8-IN-010', 'LG8-IN-012', 'LG8-IN-014',
]) {
  if (!lg008OwnerIds.has(requiredId))
    fail(`LG-008 owner input register omits ${requiredId}`)
}

const lgEvidenceRows = csvObjects('registers/lg-evidence-needs.csv')
const lgEvidenceIds = new Set()
for (const row of lgEvidenceRows) {
  if (!row.gate_id || lgEvidenceIds.has(row.gate_id))
    fail(`missing or duplicate LG evidence gate ${row.gate_id}`)
  lgEvidenceIds.add(row.gate_id)
  for (const field of [
    'scope', 'what_existing_material_now_proves', 'remaining_evidence_or_work',
    'additional_documents_needed', 'external_runtime_or_authority_needed',
    'development_effect', 'closure_state',
  ]) {
    if (!row[field])
      fail(`LG evidence gate ${row.gate_id} lacks ${field}`)
  }
  if (!['OPEN', 'CLOSED_STATIC_SOURCE_AUTHORITY'].includes(row.closure_state))
    fail(`LG evidence gate ${row.gate_id} has unsupported closure state ${row.closure_state}`)
  if (row.gate_id === 'LG-008' && row.closure_state !== 'CLOSED_STATIC_SOURCE_AUTHORITY')
    fail('LG-008 must be closed by the generated static source authority')
  if (row.gate_id !== 'LG-008' && row.closure_state !== 'OPEN')
    fail(`${row.gate_id} must remain open until its live evidence is retained`)
}
for (let index = 1; index <= 8; index += 1) {
  const requiredId = `LG-${String(index).padStart(3, '0')}`
  if (!lgEvidenceIds.has(requiredId))
    fail(`LG evidence register omits ${requiredId}`)
}

const decisions = yaml.get(join(root, 'registers/decisions.yaml'))
if (decisions) {
  const ids = new Set()
  for (const decision of decisions.decisions ?? []) {
    if (!decision.id || !decision.decision || decision.status !== 'frozen')
      fail(`invalid frozen decision entry: ${JSON.stringify(decision)}`)
    if (ids.has(decision.id))
      fail(`duplicate decision ID: ${decision.id}`)
    ids.add(decision.id)
  }
  for (const requiredId of [
    'DIE-ACQUISITION-001',
    'DIE-SCALING-001',
    'DIE-RESOLVER-001',
    'DIE-RELEASE-001',
    'DIE-TEMPORAL-001',
    'DIE-AUTHN-001',
    'DIE-SESSION-001',
    'DIE-KEY-001',
    'DIE-CONFORMANCE-001',
    'DIE-HEALTH-001',
    'DIE-HEALTH-002',
  ]) {
    if (!ids.has(requiredId))
      fail(`decision register omits architectural amendment ${requiredId}`)
  }
  if (ids.size < 40)
    fail(`decision register is unexpectedly small: ${ids.size}`)
  notes.push(`${ids.size} frozen decisions`)
}

const systemArchitecture = requireFile('01-system-architecture.md')
for (const fragment of [
  '## Source acquisition framework',
  'durable connector inbox + cursor/snapshot ledger',
  'signed platform-release manifest',
  'N/N-1 rolling window',
]) {
  if (!systemArchitecture.includes(fragment))
    fail(`system architecture omits frozen acquisition/release fragment: ${fragment}`)
}
const performanceArchitecture = requireFile('10-performance-reliability-and-operations.md')
for (const fragment of [
  '## Workload isolation lanes',
  'lane:<control|inventory|activity|bulk>:<stable-partition>',
  'mixed normalization bundle',
  'There is no tenant-global or platform-global activity lock.',
]) {
  if (!performanceArchitecture.includes(fragment))
    fail(`performance architecture omits frozen workload-lane fragment: ${fragment}`)
}
if (performanceArchitecture.includes('Scaling adds replicas of the same release digest with a role flag.'))
  fail('performance architecture retains superseded lockstep role-artifact topology')
const repositoryDeliveryMap = requireFile('12-repository-and-delivery-map.md')
for (const fragment of [
  '## One codebase, explicit role artifacts',
  'platform-release manifest',
  'Different roles may run different',
]) {
  if (!repositoryDeliveryMap.includes(fragment))
    fail(`repository/delivery map omits frozen role-artifact fragment: ${fragment}`)
}
if (repositoryDeliveryMap.includes('Production runs independent replicas per role from the same signed digest.'))
  fail('repository/delivery map retains superseded lockstep role-artifact topology')
const workerArchitecture = requireFile('04-workers-transactions-and-replay.md')
for (const fragment of [
  'lane:<control|inventory|activity|bulk>:',
  'startup self-test refuses an unrecognized or overlapping assignment',
  'An activity-only normalization run uses the `activity` lane.',
]) {
  if (!workerArchitecture.includes(fragment))
    fail(`worker architecture omits frozen workload-lane fragment: ${fragment}`)
}
const identityArchitecture = requireFile('05-identity-and-canonicalization.md')
for (const fragment of [
  '## Resolver framework and type modules',
  'versioned registry keyed by canonical entity',
  'never falls through to fuzzy global',
]) {
  if (!identityArchitecture.includes(fragment))
    fail(`identity architecture omits frozen type-resolver fragment: ${fragment}`)
}
const connectorArchitecture = requireFile('33-enterprise-connector-platform-direction.md')
for (const fragment of [
  '## Source acquisition framework',
  'durable webhook inbox or poll/CDC page ledger',
  'Every connector instance additionally declares:',
]) {
  if (!connectorArchitecture.includes(fragment))
    fail(`connector architecture omits frozen extension-contract fragment: ${fragment}`)
}
const engineeringExecution = requireFile('34-agentic-engineering-execution-system.md')
for (const fragment of [
  'Chat history, an agent memory',
  'exact authority revision',
  'last remotely verified commit',
  'one-branch-per-work-item hygiene',
]) {
  if (!engineeringExecution.includes(fragment))
    fail(`agentic engineering system omits durable-execution fragment: ${fragment}`)
}
const uiEngineering = requireFile('35-nuxt-shadcn-ui-engineering-constitution.md')
for (const fragment of [
  'Meaning of “native Nuxt/Vue/shadcn”',
  'Product/domain components are required and permitted',
  'a new wrapper design system over shadcn-vue',
  'page or product component',
  'UI-GATE-001..010',
  'Preserve the 117-path dirty baseline',
]) {
  if (!uiEngineering.includes(fragment))
    fail(`Nuxt/shadcn UI constitution omits frozen fragment: ${fragment}`)
}

const predicates = yaml.get(join(root, 'ontology/predicates.yaml'))
const entityOntology = yaml.get(join(root, 'ontology/entity-types.yaml'))
const canonicalEntityTypes = new Set([
  ...Object.keys(entityOntology?.primary ?? {}),
  ...Object.keys(entityOntology?.context ?? {}),
])
const openapiEntityTypes = new Set(
  (openapi?.components?.schemas?.EntityType?.enum ?? []).filter(value => value !== 'unknown'),
)
for (const entityType of canonicalEntityTypes) {
  if (!openapiEntityTypes.has(entityType))
    fail(`OpenAPI EntityType omits canonical ontology type ${entityType}`)
}
for (const entityType of openapiEntityTypes) {
  if (!canonicalEntityTypes.has(entityType))
    fail(`OpenAPI EntityType contains unknown canonical ontology type ${entityType}`)
}
if (predicates) {
  const validSemantics = new Set(['structural', 'configured', 'entitlement', 'observed', 'ownership', 'coverage'])
  for (const [name, predicate] of Object.entries(predicates.predicates ?? {})) {
    if (!validSemantics.has(predicate.semantic))
      fail(`predicate ${name} has invalid semantic ${predicate.semantic}`)
    if (!Array.isArray(predicate.pairs) || !predicate.pairs.length)
      fail(`predicate ${name} has no valid endpoint pairs`)
    for (const [subjectType, objectType] of predicate.pairs ?? []) {
      if (!canonicalEntityTypes.has(subjectType))
        fail(`predicate ${name} uses unknown subject entity type ${subjectType}`)
      if (!canonicalEntityTypes.has(objectType))
        fail(`predicate ${name} uses unknown object entity type ${objectType}`)
    }
  }
}
for (const row of relationshipRows) {
  if (!canonicalEntityTypes.has(row.subject))
    fail(`relationship ${row.relationship_id} has unknown canonical subject ${row.subject}`)
  if (!canonicalEntityTypes.has(row.object))
    fail(`relationship ${row.relationship_id} has unknown canonical object ${row.object}`)
  const predicate = predicates?.predicates?.[row.predicate]
  if (!predicate)
    fail(`relationship ${row.relationship_id} has unknown canonical predicate ${row.predicate}`)
  else if (!(predicate.pairs ?? []).some(pair => pair[0] === row.subject && pair[1] === row.object))
    fail(`relationship ${row.relationship_id} uses invalid ${row.subject} ${row.predicate} ${row.object} pair`)
}

const sourceNormalization = yaml.get(join(root, 'ontology/source-normalization.yaml'))
if (sourceNormalization) {
  for (const [profile, routing] of Object.entries(sourceNormalization.profiles ?? {})) {
    for (const sourceType of routing.source_objects ?? []) {
      if (!canonicalEntityTypes.has(sourceType))
        fail(`normalization routing ${profile} declares unknown canonical source object ${sourceType}`)
    }
    for (const [sourceType, canonicalType] of Object.entries(routing.entity_mapping ?? {})) {
      if (!canonicalEntityTypes.has(canonicalType))
        fail(`normalization routing ${profile}.${sourceType} maps to unknown entity type ${canonicalType}`)
    }
  }
  const entityProfileSchemas = {
    endpoint: 'schemas/profile-endpoint-v1.schema.json',
    llm_gateway: 'schemas/profile-llm-gateway-v1.schema.json',
    mcp_gateway: 'schemas/profile-mcp-gateway-v1.schema.json',
  }
  for (const [profile, file] of Object.entries(entityProfileSchemas)) {
    const schema = JSON.parse(requireFile(file))
    const sourceTypes = new Set(schema.$defs?.entity?.properties?.entity_type?.enum ?? [])
    const mappings = sourceNormalization.profiles?.[profile]?.entity_mapping ?? {}
    for (const sourceType of sourceTypes) {
      if (!mappings[sourceType])
        fail(`normalization routing omits ${profile} entity type ${sourceType}`)
    }
    for (const sourceType of Object.keys(mappings)) {
      if (!sourceTypes.has(sourceType))
        fail(`normalization routing contains unknown ${profile} entity type ${sourceType}`)
    }
  }
}

const profileEntityRows = csvObjects('registers/profile-entity-disposition.csv')
const profileEntityKeys = new Set()
for (const row of profileEntityRows) {
  const key = `${row.profile}:${row.source_entity_type}`
  if (profileEntityKeys.has(key))
    fail(`duplicate profile entity disposition ${key}`)
  profileEntityKeys.add(key)
  if (!allowedSupportStates.has(row.support_state))
    fail(`profile entity ${key} has unknown support_state ${row.support_state}`)
  if (!canonicalEntityTypes.has(row.target_canonical_type))
    fail(`profile entity ${key} maps to unknown canonical type ${row.target_canonical_type}`)
  if (!row.native_evidence || !row.conditions || !row.prohibited_promotions)
    fail(`profile entity ${key} lacks evidence, conditions, or prohibited promotions`)
  const normalizedTarget = sourceNormalization?.profiles?.[row.profile]?.entity_mapping?.[row.source_entity_type]
  if (normalizedTarget !== row.target_canonical_type)
    fail(`profile entity ${key} target ${row.target_canonical_type} disagrees with source normalization ${normalizedTarget}`)
}
for (const profile of ['endpoint', 'llm_gateway', 'mcp_gateway']) {
  const schemaName = profileFileNames[profile]
  const schema = JSON.parse(requireFile(`schemas/${schemaName}`))
  const sourceEntityTypes = schema.$defs?.entity?.properties?.entity_type?.enum ?? []
  for (const type of sourceEntityTypes) {
    if (!profileEntityKeys.has(`${profile}:${type}`))
      fail(`profile entity disposition omits ${profile}:${type}`)
  }
  for (const key of profileEntityKeys) {
    if (key.startsWith(`${profile}:`) && !sourceEntityTypes.includes(key.slice(profile.length + 1)))
      fail(`profile entity disposition contains ${key} absent from ${schemaName}`)
  }
}

if (predicates && sourceNormalization) {
  const canonicalPredicates = new Set(Object.keys(predicates.predicates ?? {}))
  const relationshipProfiles = {
    browser: 'schemas/profile-browser-v1.schema.json',
    endpoint: 'schemas/profile-endpoint-v1.schema.json',
    llm_gateway: 'schemas/profile-llm-gateway-v1.schema.json',
    mcp_gateway: 'schemas/profile-mcp-gateway-v1.schema.json',
  }
  for (const [profile, file] of Object.entries(relationshipProfiles)) {
    const schema = JSON.parse(requireFile(file))
    const sourcePredicates = new Set()
    const collect = value => {
      if (!value || typeof value !== 'object')
        return
      if (value.properties?.predicate?.enum)
        value.properties.predicate.enum.forEach(predicate => sourcePredicates.add(predicate))
      Object.values(value).forEach(collect)
    }
    collect(schema)
    const mappings = sourceNormalization.profiles?.[profile]?.predicate_mapping ?? {}
    for (const sourcePredicate of sourcePredicates) {
      if (!mappings[sourcePredicate])
        fail(`normalization routing omits ${profile} predicate ${sourcePredicate}`)
    }
    for (const [sourcePredicate, mapping] of Object.entries(mappings)) {
      if (!sourcePredicates.has(sourcePredicate))
        fail(`normalization routing contains unknown ${profile} predicate ${sourcePredicate}`)
      for (const [mappingKind, target] of Object.entries(mapping)) {
        if (mappingKind === 'direction')
          continue
        if (!canonicalPredicates.has(target))
          fail(`normalization routing maps ${profile}.${sourcePredicate} to unknown predicate ${target}`)
      }
    }
  }
}

const sourceRelationshipRules = yaml.get(join(root, 'ontology/source-relationship-rules.yaml'))
if (sourceRelationshipRules && predicates && sourceNormalization) {
  const relationshipProfiles = {
    browser: 'schemas/profile-browser-v1.schema.json',
    endpoint: 'schemas/profile-endpoint-v1.schema.json',
    llm_gateway: 'schemas/profile-llm-gateway-v1.schema.json',
    mcp_gateway: 'schemas/profile-mcp-gateway-v1.schema.json',
  }
  const relationshipSourceNames = {
    browser: 'Browser',
    endpoint: 'Endpoint',
    llm_gateway: 'LLM Gateway',
    mcp_gateway: 'MCP Gateway',
  }
  const enumAt = (schema, property) => {
    const direct = property?.enum
    if (direct)
      return direct
    if (!property?.$ref?.startsWith('#/'))
      return []
    let value = schema
    for (const rawPart of property.$ref.slice(2).split('/'))
      value = value?.[rawPart.replaceAll('~1', '/').replaceAll('~0', '~')]
    return value?.enum ?? []
  }
  for (const [profile, file] of Object.entries(relationshipProfiles)) {
    const schema = JSON.parse(requireFile(file))
    const relation = schema.$defs?.relationship
    const sourceSubjects = new Set(enumAt(schema, relation?.properties?.subject_type))
    const sourceObjects = new Set(enumAt(schema, relation?.properties?.object_type))
    const sourcePredicates = new Set(enumAt(schema, relation?.properties?.predicate))
    const sourceSemantics = new Set(enumAt(schema, relation?.properties?.semantic))
    const rules = sourceRelationshipRules.profiles?.[profile] ?? []
    const seenSourceTuples = new Set()
    const predicatesWithRules = new Set()
    for (const [index, rule] of rules.entries()) {
      if (!Array.isArray(rule) || rule.length !== 7) {
        fail(`source relationship rule ${profile}[${index}] must contain exactly seven values`)
        continue
      }
      const [sourceSubject, sourcePredicate, sourceObject, semantic, canonicalSubject, canonicalPredicate, canonicalObject] = rule
      const sourceTuple = [sourceSubject, sourcePredicate, sourceObject, semantic].join('|')
      if (seenSourceTuples.has(sourceTuple))
        fail(`duplicate source relationship rule ${profile}:${sourceTuple}`)
      seenSourceTuples.add(sourceTuple)
      predicatesWithRules.add(sourcePredicate)
      if (!sourceSubjects.has(sourceSubject))
        fail(`source relationship rule ${profile}:${sourceTuple} uses unknown source subject ${sourceSubject}`)
      if (!sourceObjects.has(sourceObject))
        fail(`source relationship rule ${profile}:${sourceTuple} uses unknown source object ${sourceObject}`)
      if (!sourcePredicates.has(sourcePredicate))
        fail(`source relationship rule ${profile}:${sourceTuple} uses unknown source predicate ${sourcePredicate}`)
      if (!sourceSemantics.has(semantic))
        fail(`source relationship rule ${profile}:${sourceTuple} uses unsupported source semantic ${semantic}`)
      const predicate = predicates.predicates?.[canonicalPredicate]
      if (!predicate)
        fail(`source relationship rule ${profile}:${sourceTuple} maps to unknown canonical predicate ${canonicalPredicate}`)
      else {
        if (predicate.semantic !== semantic)
          fail(`source relationship rule ${profile}:${sourceTuple} changes semantic ${semantic} to ${predicate.semantic}`)
        if (!(predicate.pairs ?? []).some(pair => pair[0] === canonicalSubject && pair[1] === canonicalObject))
          fail(`source relationship rule ${profile}:${sourceTuple} maps to invalid canonical pair ${canonicalSubject} ${canonicalPredicate} ${canonicalObject}`)
      }
      const entityMappings = sourceNormalization.profiles?.[profile]?.entity_mapping ?? {}
      if (entityMappings[sourceSubject] !== canonicalSubject)
        fail(`source relationship rule ${profile}:${sourceTuple} subject disagrees with entity mapping ${entityMappings[sourceSubject]}`)
      if (entityMappings[sourceObject] !== canonicalObject)
        fail(`source relationship rule ${profile}:${sourceTuple} object disagrees with entity mapping ${entityMappings[sourceObject]}`)
      const predicateTargets = Object.entries(sourceNormalization.profiles?.[profile]?.predicate_mapping?.[sourcePredicate] ?? {})
        .filter(([kind]) => kind !== 'direction')
        .map(([, target]) => target)
      if (!predicateTargets.includes(canonicalPredicate))
        fail(`source relationship rule ${profile}:${sourceTuple} predicate target disagrees with source normalization`)
      const supportMatches = relationshipRows.filter(row =>
        row.source === relationshipSourceNames[profile]
        && row.subject === canonicalSubject
        && row.predicate === canonicalPredicate
        && row.object === canonicalObject)
      if (supportMatches.length !== 1)
        fail(`source relationship rule ${profile}:${sourceTuple} must match exactly one audited relationship-support row; found ${supportMatches.length}`)
      else if (supportMatches[0].support_state !== 'adapter_derivable'
        || !['yes', 'conditional'].includes(supportMatches[0].automatic_materialization))
        fail(`source relationship rule ${profile}:${sourceTuple} is not enabled by audited adapter support`)
    }
    for (const sourcePredicate of sourcePredicates) {
      if (!predicatesWithRules.has(sourcePredicate))
        fail(`source relationship predicate ${profile}.${sourcePredicate} has no exact admissible type-pair rule`)
    }
  }
}

const profileBindings = yaml.get(join(root, 'ontology/profile-envelope-bindings.yaml'))
const profileFileMap = {
  browser: 'schemas/profile-browser-v1.schema.json',
  browser_backend: 'schemas/profile-browser-backend-v1.schema.json',
  endpoint: 'schemas/profile-endpoint-v1.schema.json',
  llm_gateway: 'schemas/profile-llm-gateway-v1.schema.json',
  mcp_gateway: 'schemas/profile-mcp-gateway-v1.schema.json',
}
if (profileBindings) {
  const deliveryEnvelope = JSON.parse(requireFile('schemas/delivery-batch.schema.json')).$defs.envelope
  const validRecordTypes = new Set(deliveryEnvelope.properties.record_type.enum)
  const profileIdentifier = deliveryEnvelope.properties.profile
  if (profileIdentifier.pattern !== '^[a-z][a-z0-9_.-]{0,127}$')
    fail('delivery envelope source profile is not registry-extensible with the frozen identifier grammar')
  if (!profileIdentifier.description?.includes('release-managed source-profile registry'))
    fail('delivery envelope does not bind dynamic profile identifiers to registry admission')
  for (const [profile, file] of Object.entries(profileFileMap)) {
    const schema = JSON.parse(requireFile(file))
    const kinds = new Set()
    const collectKinds = value => {
      if (!value || typeof value !== 'object')
        return
      const kind = value.properties?.kind
      if (kind?.const)
        kinds.add(kind.const)
      for (const item of kind?.enum ?? [])
        kinds.add(item)
      Object.values(value).forEach(collectKinds)
    }
    collectKinds(schema)
    const bindings = profileBindings.profiles?.[profile] ?? {}
    for (const kind of kinds) {
      if (!bindings[kind])
        fail(`profile/envelope bindings omit ${profile} payload kind ${kind}`)
    }
    for (const [kind, binding] of Object.entries(bindings)) {
      if (!kinds.has(kind))
        fail(`profile/envelope bindings contain unknown ${profile} payload kind ${kind}`)
      const recordTypes = [
        binding.record_type,
        ...Object.values(binding.values ?? {}),
      ].filter(Boolean)
      recordTypes.forEach(recordType => {
        if (!validRecordTypes.has(recordType))
          fail(`profile/envelope binding ${profile}.${kind} uses unknown record type ${recordType}`)
      })
    }
  }
}

const backendRelayBinding = profileBindings?.profiles?.browser_backend?.browser_event
if (backendRelayBinding?.record_type !== 'source_processing.observed')
  fail('Browser Backend accepted/transformed/published stages are not bound to source_processing.observed')
if (backendRelayBinding?.lineage_carrier !== 'payload.qualified_client_record')
  fail('Browser Backend relay has no single canonical payload lineage carrier')
const backendNormalization = sourceNormalization?.profiles?.browser_backend
if (JSON.stringify(backendNormalization?.mappings?.source_processing) !== JSON.stringify(['lineage_only_observation']))
  fail('Browser Backend source-processing stages do not normalize lineage-only')
if (backendNormalization?.mappings?.activity)
  fail('Browser Backend relay still maps to customer activity candidates')
const backendProcessingRule = backendNormalization?.source_processing_mapping?.browser_event
if (backendProcessingRule?.lineage_carrier !== 'payload.qualified_client_record'
  || !backendProcessingRule?.output_rule?.includes('activity_candidates MUST be empty'))
  fail('Browser Backend source-processing mapping lacks canonical lineage/no-double-count semantics')
const deliveryRecordText = JSON.stringify(deliverySchema.$defs?.record ?? {})
for (const fragment of [
  'source_processing.observed',
  'qualified_client_record',
  'qualified_parent_record',
]) {
  if (!deliveryRecordText.includes(fragment))
    fail(`delivery record does not enforce Browser Backend relay rule fragment ${fragment}`)
}

const browserBackendSchemaText = requireFile('schemas/profile-browser-backend-v1.schema.json')
const browserBackendSchemaDigest = createHash('sha256').update(browserBackendSchemaText).digest('hex')
if (browserBackendSchemaDigest !== 'd07d20c3141e148dcc596ad18d17e537202821789cb3ea5119857404c1d8543e')
  fail(`Browser Backend 1.0.0 corrected schema digest drifted: ${browserBackendSchemaDigest}`)
const postgresCoreText = requireFile('sql/001-die-core.sql')
for (const fragment of [
  'sha256:e5bab26ef08a3eea4f96fa8a2919d0a96ba292dd3d650f3051b85bf02e6ed442',
  `sha256:${browserBackendSchemaDigest}`,
  'browser_backend 1.0.0 has unknown schema digest %; refusing silent convergence',
]) {
  if (!postgresCoreText.includes(fragment))
    fail(`Browser Backend profile convergence omits ${fragment}`)
}

const activityOntology = yaml.get(join(root, 'ontology/activity-types.yaml'))
if (activityOntology && sourceNormalization && profileBindings) {
  const canonicalActivities = new Set()
  for (const [family, definition] of Object.entries(activityOntology.families ?? {})) {
    for (const subtype of definition.subtypes ?? []) {
      if (canonicalActivities.has(subtype))
        fail(`canonical activity subtype is repeated: ${subtype}`)
      canonicalActivities.add(subtype)
      if (!subtype.includes('.'))
        fail(`canonical activity subtype lacks a namespace: ${family}.${subtype}`)
    }
  }

  const enumValues = property => property?.enum ?? (property?.const === undefined ? [] : [property.const])
  const findKindNode = (value, kind) => {
    if (!value || typeof value !== 'object')
      return null
    const kinds = enumValues(value.properties?.kind)
    if (kinds.includes(kind))
      return value
    for (const child of Object.values(value)) {
      const found = findKindNode(child, kind)
      if (found)
        return found
    }
    return null
  }
  const discriminatorValues = (schema, node, kind, discriminator) => {
    for (const condition of node.allOf ?? schema.allOf ?? []) {
      const conditionKinds = enumValues(condition.if?.properties?.kind)
      if (conditionKinds.includes(kind)) {
        const constrained = enumValues(condition.then?.properties?.[discriminator])
        if (constrained.length)
          return constrained
      }
    }
    return enumValues(node.properties?.[discriminator])
  }
  const validateCanonicalTarget = (target, location) => {
    if (!canonicalActivities.has(target))
      fail(`${location} maps to unknown canonical activity ${target}`)
  }

  for (const [profile, file] of Object.entries(profileFileMap)) {
    const schema = JSON.parse(requireFile(file))
    const mappings = sourceNormalization.profiles?.[profile]?.activity_mapping ?? {}
    const bindings = profileBindings.profiles?.[profile] ?? {}
    for (const [kind, binding] of Object.entries(bindings)) {
      const targetRecordTypes = [binding.record_type, ...Object.values(binding.values ?? {})].filter(Boolean)
      if (targetRecordTypes.some(value => /^(activity|decision|outcome)\./.test(value)) && !mappings[kind])
        fail(`normalization routing omits activity mapping for ${profile}.${kind}`)
    }
    for (const [kind, mapping] of Object.entries(mappings)) {
      const node = findKindNode(schema, kind)
      if (!node) {
        fail(`normalization routing contains activity mapping for unknown ${profile}.${kind}`)
        continue
      }
      if (mapping.constant) {
        validateCanonicalTarget(mapping.constant, `${profile}.${kind}`)
        continue
      }
      if (!mapping.discriminator || !mapping.cases) {
        fail(`activity mapping ${profile}.${kind} requires a constant or discriminator cases`)
        continue
      }
      const sourceValues = discriminatorValues(schema, node, kind, mapping.discriminator)
      if (!sourceValues.length)
        fail(`activity mapping ${profile}.${kind} discriminator ${mapping.discriminator} has no schema enum`)
      for (const sourceValue of sourceValues) {
        if (mapping.cases[sourceValue] === undefined)
          fail(`activity mapping ${profile}.${kind} omits ${mapping.discriminator}=${sourceValue}`)
      }
      for (const [sourceValue, target] of Object.entries(mapping.cases)) {
        if (!sourceValues.includes(sourceValue))
          fail(`activity mapping ${profile}.${kind} contains unknown ${mapping.discriminator}=${sourceValue}`)
        if (typeof target === 'string') {
          validateCanonicalTarget(target, `${profile}.${kind}.${sourceValue}`)
          continue
        }
        if (!target?.default || !target?.outcomes)
          fail(`activity mapping ${profile}.${kind}.${sourceValue} requires default and outcomes`)
        else {
          validateCanonicalTarget(target.default, `${profile}.${kind}.${sourceValue}.default`)
          const outcomeValues = enumValues(node.properties?.[mapping.outcome_field])
          for (const outcome of outcomeValues) {
            if (target.outcomes[outcome] === undefined)
              fail(`activity mapping ${profile}.${kind}.${sourceValue} omits ${mapping.outcome_field}=${outcome}`)
          }
          for (const [outcome, outcomeTarget] of Object.entries(target.outcomes)) {
            if (!outcomeValues.includes(outcome))
              fail(`activity mapping ${profile}.${kind}.${sourceValue} contains unknown ${mapping.outcome_field}=${outcome}`)
            validateCanonicalTarget(outcomeTarget, `${profile}.${kind}.${sourceValue}.${outcome}`)
          }
        }
      }
    }
  }

  const normalizedFamilies = JSON.parse(requireFile('schemas/normalized-observation.schema.json'))
    .properties?.activity_candidates?.items?.properties?.family?.enum ?? []
  const canonicalFamilies = Object.keys(activityOntology.families ?? {})
  for (const family of canonicalFamilies) {
    if (!normalizedFamilies.includes(family))
      fail(`normalized observation schema omits canonical activity family ${family}`)
  }
  for (const family of normalizedFamilies) {
    if (!canonicalFamilies.includes(family))
      fail(`normalized observation schema contains unknown activity family ${family}`)
  }
}

const browserSchema = JSON.parse(requireFile('schemas/profile-browser-v1.schema.json'))
const browserBackendSchema = JSON.parse(requireFile('schemas/profile-browser-backend-v1.schema.json'))
const canonicalAccountEnum = entityOntology?.primary?.application_account?.attributes?.account_context?.values ?? []
const accountProfiles = [
  ['browser', browserSchema.$defs?.accountContext?.properties],
  ['browser_backend', browserBackendSchema.properties],
]
for (const [profile, properties] of accountProfiles) {
  const routing = sourceNormalization?.profiles?.[profile]?.account_context ?? {}
  for (const field of ['authentication_context', 'account_usage_type']) {
    const values = properties?.[field]?.enum ?? []
    const mapping = routing?.[field]?.canonical_mapping ?? {}
    for (const value of values) {
      if (mapping[value] === undefined)
        fail(`${profile}.${field}=${value} lacks a canonical account-context mapping`)
      else if (!canonicalAccountEnum.includes(mapping[value]))
        fail(`${profile}.${field}=${value} maps to unknown canonical account context ${mapping[value]}`)
    }
    for (const value of Object.keys(mapping)) {
      if (!values.includes(value))
        fail(`${profile}.${field} maps source value ${value} absent from the profile schema`)
    }
  }
}

const normalizedSchema = JSON.parse(requireFile('schemas/normalized-observation.schema.json'))
const normalizedRequired = new Set(normalizedSchema.required ?? [])
for (const field of ['normalization_run_id', 'output_key']) {
  if (!normalizedRequired.has(field))
    fail(`normalized observation does not require ${field}`)
}
const normalizedNormalizerRequired = new Set(normalizedSchema.properties?.normalizer?.required ?? [])
for (const field of ['name', 'version', 'artifact_digest', 'profile', 'profile_version']) {
  if (!normalizedNormalizerRequired.has(field))
    fail(`normalized observation normalizer identity does not require ${field}`)
}
if (!normalizedSchema.properties?.normalizer?.properties?.artifact_digest?.pattern)
  fail('normalized observation normalizer artifact_digest is not constrained')
const normalizedClaimRequired = new Set(normalizedSchema.properties?.claims?.items?.required ?? [])
if (!normalizedClaimRequired.has('claim_key'))
  fail('normalized claims do not require deterministic claim_key')
if (!normalizedSchema.properties?.claims?.items?.properties?.normalized_value_type)
  fail('normalized claims do not carry a distinct normalized_value_type')
const normalizedCoverageRequired = new Set(normalizedSchema.properties?.coverage_candidates?.items?.required ?? [])
if (!normalizedCoverageRequired.has('population'))
  fail('normalized coverage candidates do not require exact population reference')
const enrollmentPopulationTypes = new Set(
  JSON.parse(requireFile('schemas/producer-enrollment-manifest.schema.json'))
    .properties?.expected_populations?.items?.properties?.population_type?.enum ?? [],
)
const normalizedPopulationTypes = new Set(normalizedSchema.$defs?.populationRef?.properties?.population_type?.enum ?? [])
for (const type of enrollmentPopulationTypes) {
  if (!normalizedPopulationTypes.has(type))
    fail(`normalized coverage population enum omits enrollment population type ${type}`)
}
for (const type of normalizedPopulationTypes) {
  if (!enrollmentPopulationTypes.has(type))
    fail(`normalized coverage population enum admits unsupported enrollment population type ${type}`)
}
const normalizedSourceRefRequired = new Set(normalizedSchema.$defs?.sourceRef?.required ?? [])
for (const field of ['producer_id', 'profile', 'namespace', 'type', 'id']) {
  if (!normalizedSourceRefRequired.has(field))
    fail(`normalized sourceRef does not require cross-producer qualifier ${field}`)
}

const postgres = requireFile('sql/001-die-core.sql')
for (const [profile, fileName] of Object.entries(profileFileNames)) {
  const schemaBytes = requireFile(`schemas/${fileName}`)
  const schemaDigest = `sha256:${createHash('sha256').update(schemaBytes).digest('hex')}`
  const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const seedPattern = profile === 'browser_backend'
    ? new RegExp(
      `'browser_backend',\\s*'([^']+)',\\s*'schemas/${escapedFileName}',\\s*'(${schemaDigest})',\\s*'accepted'`,
    )
    : new RegExp(
      `\\('${profile}',\\s*'([^']+)',\\s*'schemas/${escapedFileName}',\\s*'(${schemaDigest})',\\s*'accepted'`,
    )
  if (!seedPattern.test(postgres)) {
    fail(`PostgreSQL accepted profile seed for ${profile} does not bind current ${fileName} digest ${schemaDigest}`)
  }
}
const pointerSchema = JSON.parse(requireFile('schemas/canonical-change-pointer.schema.json'))
const pointerAggregateTypes = pointerSchema?.properties?.aggregate_type?.enum ?? []
if ([...pointerAggregateTypes].sort().join(',')
  !== ['entity','relationship','activity','coverage','evidence'].sort().join(','))
  fail('canonical pointer schema aggregate types diverge from the frozen authority set')
const sqlEntityTypeMatch = postgres.match(/entity_type text NOT NULL CHECK \(entity_type IN \(([^)]+)\)\)/)
if (!sqlEntityTypeMatch) {
  fail('PostgreSQL canonical entity_type constraint was not found')
}
else {
  const sqlEntityTypes = new Set(
    [...sqlEntityTypeMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]),
  )
  for (const type of canonicalEntityTypes) {
    if (!sqlEntityTypes.has(type))
      fail(`PostgreSQL canonical entity_type constraint omits ${type}`)
  }
  for (const type of sqlEntityTypes) {
    if (!canonicalEntityTypes.has(type))
      fail(`PostgreSQL canonical entity_type constraint contains unknown ${type}`)
  }
}
const sqlHealthStateMatch = postgres.match(
  /health_state text NOT NULL CHECK \(health_state IN \(([\s\S]*?)\)\)/,
)
if (!sqlHealthStateMatch) {
  fail('die_read.producer_current lacks the common producer health_state constraint')
}
else {
  const sqlHealthStates = [...sqlHealthStateMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1])
  if ([...sqlHealthStates].sort().join(',') !== [...producerHealthStates].sort().join(','))
    fail('PostgreSQL producer health_state constraint diverges from ProducerHealthState')
}
const requiredPgFragments = [
  // Producer health is derived from a signed policy on a scheduled evaluation.
  // It is never computed at request time, and no cron job may write the
  // projection directly.
  'CREATE TABLE IF NOT EXISTS die_control.producer_health_policy',
  'CHECK (expected_report_interval_seconds < degraded_after_seconds)',
  'CHECK (degraded_after_seconds < offline_after_seconds)',
  'CHECK (queue_degraded_after_ms < queue_unhealthy_after_ms)',
  "CHECK (health_policy_version IS NOT NULL OR health_state = 'unknown')",
  "CHECK (health_state <> 'healthy'\n    OR (health_evaluated_at IS NOT NULL AND health_policy_version IS NOT NULL))",
  "'producer_health_evaluation'",
  'CREATE SCHEMA IF NOT EXISTS die_evidence',
  'CREATE TABLE IF NOT EXISTS die_pipeline.work_item',
  "CHECK (implementation_version ~ '^sha256:[0-9a-f]{64}$')",
  'UNIQUE (tenant_id, work_id, implementation_version)',
  'tenant_id, stage, subject_kind, subject_id, input_version,\n    implementation_version',
  'FOREIGN KEY (tenant_id, work_id, implementation_version)',
  "'relationship_candidate','activity_candidate'",
  "'coverage_candidate','reconciliation_run'",
  'CREATE TABLE IF NOT EXISTS die_pipeline.mutation_preview',
  'CREATE TABLE IF NOT EXISTS die_pipeline.api_idempotency',
  'CREATE TABLE IF NOT EXISTS die_pipeline.evidence_access_grant',
  'CREATE TABLE IF NOT EXISTS die_control.enrollment_manifest',
  'CREATE TABLE IF NOT EXISTS die_control.manifest_signer_key',
  'CREATE UNIQUE INDEX IF NOT EXISTS uq_manifest_signer_one_active',
  'CREATE TABLE IF NOT EXISTS die_control.manifest_signer_key_version',
  'CREATE OR REPLACE FUNCTION die_control.record_manifest_signer_key_version()',
  'CREATE TABLE IF NOT EXISTS die_control.manifest_verification',
  'CREATE OR REPLACE FUNCTION die_control.enforce_manifest_signer_key_transition()',
  'CREATE TABLE IF NOT EXISTS die_control.expected_population',
  'CREATE TABLE IF NOT EXISTS die_control.expected_population_version',
  'CREATE TABLE IF NOT EXISTS die_control.source_profile',
  'CREATE TABLE IF NOT EXISTS die_control.source_profile_version',
  'REFERENCES die_control.source_profile(profile_id)',
  'REFERENCES die_control.source_profile_version(profile_id, profile_version)',
  'CREATE TABLE IF NOT EXISTS die_pipeline.projection_checkpoint',
  'CREATE TABLE IF NOT EXISTS die_pipeline.projection_required_partition',
  "projection_name text NOT NULL CHECK (projection_name = 'die_product_v1')",
  'CREATE OR REPLACE FUNCTION die_pipeline.enforce_stage_execution_fence()',
  'CREATE OR REPLACE FUNCTION die_pipeline.runtime_stage_allowed(',
  'CREATE OR REPLACE FUNCTION die_pipeline.require_terminal_execution()',
  'CREATE OR REPLACE FUNCTION die_pipeline.require_execution_terminal_work()',
  'leased work cannot become terminal without its matching fenced execution',
  'CREATE OR REPLACE FUNCTION die_normalized.enforce_source_object_update()',
  'stage execution requires a matching live lease or exact exhausted recovery fence',
  "execution_kind IN ('worker','lease_recovery')",
  'attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 4096)',
  'max_attempts integer NOT NULL DEFAULT 12 CHECK (max_attempts BETWEEN 1 AND 4096)',
  "CHECK (status <> 'retry' OR attempt_count < max_attempts)",
  'only the maintenance role may recover an expired lease',
  'runtime role is not authorized to handle stage',
  "pg_has_role(login.oid, relation.relowner, 'member')",
  'lease renewal must extend expiry',
  'UNIQUE (tenant_id, work_id, lease_token)',
  'CREATE TABLE IF NOT EXISTS die_control.tenant_cell_assignment',
  'CREATE TABLE IF NOT EXISTS die_control.tenant_cell_principal',
  'CREATE OR REPLACE FUNCTION die_control.enforce_tenant_cell_principal_transition()',
  'database principal must be a NOBYPASSRLS login with exactly its declared DIE workload role',
  'effective_die_role_count',
  "WHERE pg_has_role(NEW.database_principal, runtime_role.role_name, 'member')",
  'principal.database_principal = session_user',
  "pg_has_role(session_user, 'die_control_admin', 'member')",
  "pg_has_role(session_user, 'die_authz_admin', 'member')",
  'CREATE TABLE IF NOT EXISTS die_evidence.evidence_disposition',
  "'deletion_pending','object_deleted','deleted'",
  'CREATE OR REPLACE FUNCTION die_evidence.enforce_disposition_append()',
  'legal hold must remain held until an explicit release',
  'CREATE TABLE IF NOT EXISTS die_evidence.ingest_receipt_item',
  'CREATE TABLE IF NOT EXISTS die_normalized.normalization_run',
  'CREATE TABLE IF NOT EXISTS die_normalized.cross_sensor_assertion_use',
  'UNIQUE (tenant_id, issuer_producer_id, nonce_hash)',
  'CREATE OR REPLACE FUNCTION die_normalized.enforce_cross_sensor_assertion_use()',
  'source_profile text NOT NULL',
  'FOREIGN KEY (tenant_id, evidence_id, producer_id, source_profile, profile_version)',
  'CREATE TABLE IF NOT EXISTS die_normalized.claim_supersession',
  'CREATE TABLE IF NOT EXISTS die_normalized.candidate_evaluation',
  'CREATE TABLE IF NOT EXISTS die_normalized.candidate_dependency',
  'CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_candidate',
  'CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_member',
  'CREATE TABLE IF NOT EXISTS die_normalized.reconciliation_run',
  'CREATE TABLE IF NOT EXISTS die_normalized.activity_candidate_resource',
  'CREATE TABLE IF NOT EXISTS die_identity.resolution_decision',
  'CREATE TABLE IF NOT EXISTS die_identity.resolution_decision_claim',
  'CREATE TABLE IF NOT EXISTS die_identity.resolution_decision_entity',
  'CREATE TABLE IF NOT EXISTS die_identity.entity_alias',
  'CREATE TABLE IF NOT EXISTS die_identity.correction_claim',
  'CREATE TABLE IF NOT EXISTS die_authz.oidc_trust',
  'CREATE TABLE IF NOT EXISTS die_authz.runtime_session',
  'issuer_revision bigint NOT NULL CHECK',
  "current_setting('app.change_reason', true) <> 'session_retention_expired'",
  "purge_after <= revoked_at + interval '7 days'",
  'CREATE OR REPLACE FUNCTION die_authz.enforce_oidc_trust_transition()',
  'CREATE OR REPLACE FUNCTION die_authz.enforce_runtime_session_transition()',
  'CREATE TABLE IF NOT EXISTS die_canonical.entity_version',
  'CREATE TABLE IF NOT EXISTS die_canonical.entity_version_claim',
  'CREATE TABLE IF NOT EXISTS die_canonical.entity_version_correction_claim',
  "end_reason text CHECK (end_reason IS NULL OR end_reason IN (",
  'CREATE TABLE IF NOT EXISTS die_canonical.relationship_version',
  'CREATE TABLE IF NOT EXISTS die_canonical.relationship_version_evidence',
  'CREATE TABLE IF NOT EXISTS die_canonical.activity_version',
  'CREATE TABLE IF NOT EXISTS die_canonical.activity_version_resource',
  'CREATE TABLE IF NOT EXISTS die_canonical.activity_version_evidence',
  'CREATE TABLE IF NOT EXISTS die_canonical.activity_version_candidate',
  'CREATE TABLE IF NOT EXISTS die_canonical.activity_source_binding',
  'CREATE TABLE IF NOT EXISTS die_canonical.coverage_interval_candidate',
  'CREATE TABLE IF NOT EXISTS die_canonical.reconciliation_evaluation',
  'CREATE TABLE IF NOT EXISTS die_audit.audit_event_evidence',
  'CREATE TABLE IF NOT EXISTS die_outbox.canonical_change',
  'payload_version text NOT NULL CHECK (payload_version = \'die.outbox.pointer.v1\')',
  'aggregate_digest text NOT NULL',
  'CREATE OR REPLACE FUNCTION die_outbox.enforce_canonical_pointer()',
  'CREATE OR REPLACE FUNCTION die_outbox.require_head_pointer()',
  'outbox change type is incompatible with its aggregate type',
  'canonical aggregate version committed without an outbox pointer',
  'CREATE CONSTRAINT TRIGGER canonical_entity_requires_outbox',
  'CREATE CONSTRAINT TRIGGER evidence_disposition_requires_outbox',
  "aggregate_type text NOT NULL CHECK (aggregate_type IN ('entity','relationship','activity','coverage','evidence'))",
  'UNIQUE (tenant_id, aggregate_type, aggregate_id, aggregate_version)',
  'CREATE TABLE IF NOT EXISTS die_read.agent_deployment_current',
  'CREATE TABLE IF NOT EXISTS die_read.application_current',
  'CREATE TABLE IF NOT EXISTS die_read.model_current',
  'CREATE TABLE IF NOT EXISTS die_read.mcp_server_current',
  'CREATE TABLE IF NOT EXISTS die_read.device_current',
  'CREATE TABLE IF NOT EXISTS die_read.identity_current',
  'CREATE TABLE IF NOT EXISTS die_read.export_job_field',
  'observed_user_id uuid',
  'configured_local_mcp_server_count bigint NOT NULL',
  'configured_remote_mcp_server_count bigint NOT NULL',
  'configured_model_count bigint NOT NULL',
  'configured_component_count bigint NOT NULL',
  'repository_count bigint NOT NULL',
  'observation_producer_id uuid NOT NULL',
  'subject_producer_id uuid NOT NULL',
  'object_producer_id uuid NOT NULL',
  'actor_producer_id uuid',
  'candidate_producer_id uuid NOT NULL',
  'source_producer_id uuid NOT NULL',
  'normalized_value_type text',
  'CHECK ((normalized_value_json IS NULL) = (normalized_value_type IS NULL))',
  'authorization_filter_digest text NOT NULL',
  'field_mask_digest text NOT NULL',
  "projection_name text NOT NULL DEFAULT 'die_product_v1' CHECK (projection_name = 'die_product_v1')",
  'export snapshot must bind the active caught-up product generation',
  'projection_generation bigint NOT NULL CHECK (projection_generation BETWEEN 1 AND 9007199254740991)',
  'CREATE TABLE IF NOT EXISTS die_authz.role_binding',
  'CREATE TABLE IF NOT EXISTS die_authz.bootstrap_manifest',
  'CREATE TABLE IF NOT EXISTS die_audit.audit_event',
  'CREATE TABLE IF NOT EXISTS die_audit.audit_head',
  'CREATE TABLE IF NOT EXISTS die_audit.audit_checkpoint',
  'CREATE OR REPLACE FUNCTION die_audit.enforce_audit_event_insert()',
  'CREATE OR REPLACE FUNCTION die_audit.require_audit_head_advance()',
  'audit event committed without advancing its shard head',
  'UNIQUE (tenant_id, producer_id, source_profile, source_namespace, source_object_type, source_object_id)',
  "presence_state text NOT NULL CHECK (presence_state IN ('referenced_only','observed'))",
  "presence_state = 'referenced_only'",
  'observed source object cannot regress to referenced_only',
  'FOREIGN KEY (tenant_id, producer_id, producer_epoch, sequence_no, record_id, evidence_id, content_sha256)',
  'object_size_bytes bigint NOT NULL',
  'expected_count bigint CHECK (expected_count IS NULL OR expected_count BETWEEN 0 AND 9007199254740991)',
  'source_count bigint NOT NULL CHECK (source_count BETWEEN 0 AND 9007199254740991)',
  'record_count integer NOT NULL CHECK (record_count BETWEEN 1 AND 500)',
  'result_index integer NOT NULL CHECK (result_index BETWEEN 0 AND 499)',
  'CREATE UNIQUE INDEX IF NOT EXISTS uq_reconciliation_page',
  'CREATE UNIQUE INDEX IF NOT EXISTS uq_reconciliation_terminal',
  'ADD CONSTRAINT activity_version_business_scope_fk',
  'ADD CONSTRAINT coverage_business_scope_fk',
  'WITH CHECK (tenant_id = die_authz.current_tenant_id())',
  'binding_current_valid_time_no_overlap',
  'coverage_current_valid_time_no_overlap',
  'role_binding_valid_time_no_overlap',
  'relation_tuple_valid_time_no_overlap',
  'PRIMARY KEY (tenant_id, revision, ancestor_scope_id, descendant_scope_id)',
  'closed_revision bigint',
  'CREATE OR REPLACE FUNCTION die_authz.enforce_binding_close()',
  'CREATE OR REPLACE FUNCTION die_authz.enforce_authorization_revision()',
  'CREATE OR REPLACE FUNCTION die_authz.enforce_scope_closure_insert()',
  'business scope revision must equal the current authorization revision',
  'authorization grant must be open and stamped with the current authorization revision',
  'CREATE OR REPLACE FUNCTION die_control.enforce_producer_transition()',
  'OLD.last_seen_at IS NOT NULL AND NEW.last_seen_at IS NULL',
  'CREATE TABLE IF NOT EXISTS die_evidence.erasure_plan',
  'CREATE TABLE IF NOT EXISTS die_evidence.erasure_target',
  'CREATE TABLE IF NOT EXISTS die_evidence.erasure_receipt',
  'CREATE OR REPLACE FUNCTION die_evidence.enforce_erasure_plan_transition()',
  'CREATE OR REPLACE FUNCTION die_evidence.require_erasure_completion(',
  'evidence erasure target manifest is incomplete or has a digest mismatch',
  'evidence erasure receipt is outside its exact unheld deletion phase',
  "'object_deleted' THEN",
  "'deleted' THEN",
  "'evidence_erasure'",
  'CREATE OR REPLACE FUNCTION die_control.enforce_capability_close()',
  'CREATE OR REPLACE FUNCTION die_control.enforce_expected_population_head()',
  'CREATE OR REPLACE FUNCTION die_control.allow_only_expected_population_version_close()',
  'CREATE OR REPLACE FUNCTION die_control.require_expected_population_version_successor()',
  'CREATE OR REPLACE FUNCTION die_canonical.require_version_head()',
  'CREATE OR REPLACE FUNCTION die_canonical.require_closed_version_successor()',
  'canonical head version must start at one',
  'CREATE OR REPLACE FUNCTION die_canonical.enforce_coverage_revision_insert()',
  'CREATE OR REPLACE FUNCTION die_canonical.require_coverage_successor()',
  'coverage revision must advance exactly one',
  'CREATE UNIQUE INDEX IF NOT EXISTS uq_activity_version_system_current',
  'projection watermark is not acknowledged by every required partition',
  "'standby'",
  'ALTER TABLE die_canonical.activity_version_default FORCE ROW LEVEL SECURITY',
  'CREATE POLICY tenant_isolation_activity_version_default ON die_canonical.activity_version_default',
]
requiredPgFragments.forEach(fragment => {
  if (!postgres.includes(fragment))
    fail(`PostgreSQL DDL missing required fragment: ${fragment}`)
})
for (const unsafeCountName of [
  'expected_count', 'observed_count', 'declared_page_count',
  'declared_observed_count', 'page_count', 'source_count',
  'relationship_count', 'configured_mcp_server_count',
  'configured_local_mcp_server_count', 'configured_remote_mcp_server_count',
  'configured_model_count', 'configured_component_count', 'repository_count',
  'surface_count', 'deployment_count', 'account_count',
  'observed_identity_count', 'device_count', 'configured_application_count',
  'tool_count', 'resource_count', 'prompt_count', 'application_count',
  'agent_count', 'installation_count', 'observed_device_count',
  'observed_application_count', 'open_gap_count',
]) {
  if (new RegExp(`\\b${unsafeCountName}\\s+integer\\b`).test(postgres))
    fail(`PostgreSQL authority narrows JavaScript-safe count to integer: ${unsafeCountName}`)
}
if (/(?:valid|system|effective)_to\s+IS NULL\s+OR\s+[a-z_]+_to\s+>=\s+[a-z_]+_from/i.test(postgres))
  fail('PostgreSQL DDL permits a zero-length valid/system/effective interval')
const ddlBeforeFunctions = postgres.split('CREATE OR REPLACE FUNCTION')[0]
for (const match of ddlBeforeFunctions.matchAll(/^\s{2}([a-z_][a-z0-9_]*)\s+jsonb\b/gm)) {
  const column = match[1]
  if (!new RegExp(`pg_column_size\\(${column}\\)\\s*<=\\s*\\d+`).test(ddlBeforeFunctions)
    && !new RegExp(`${column}\\s+IS\\s+NULL\\s+OR\\s+pg_column_size\\(${column}\\)\\s*<=\\s*\\d+`).test(ddlBeforeFunctions))
    fail(`PostgreSQL JSONB column ${column} has no database byte bound`)
}
const tableDefinitions = [...postgres.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z_]+\.[a-z_]+)\s*\(([\s\S]*?)^\)(?:\s+PARTITION BY[\s\S]*?)?;/gm)]
const sqlTables = new Map()
for (const definition of tableDefinitions) {
  const [, table, body] = definition
  const columnNames = [...body.matchAll(/^\s{2}([a-z_][a-z0-9_]*)\s+/gm)]
    .map(match => match[1])
    .filter(name => !['primary', 'unique', 'foreign', 'check', 'constraint'].includes(name))
  const columns = new Set(columnNames)
  const duplicateColumns = [...new Set(columnNames.filter((name, index) => columnNames.indexOf(name) !== index))]
  if (duplicateColumns.length)
    fail(`PostgreSQL table ${table} repeats columns: ${duplicateColumns.join(', ')}`)
  const primaryKeys = [...body.matchAll(/^\s*PRIMARY KEY/gm)].length
  if (primaryKeys > 1)
    fail(`PostgreSQL table ${table} defines ${primaryKeys} primary keys`)
  const candidateKeys = [...body.matchAll(/^\s*(?:PRIMARY KEY|UNIQUE)\s*\(([^)]+)\)/gm)]
    .map(match => match[1].split(',').map(value => value.trim()).join(','))
  sqlTables.set(table, { body, columns, candidateKeys: new Set(candidateKeys), position: definition.index })
}
const foreignKeys = [
  ...tableDefinitions.flatMap((definition) => {
    const [, table, body] = definition
    return (
    [...body.matchAll(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-z_]+\.[a-z_]+)\s*\(([^)]+)\)/g)]
      .map(match => ({ table, local: match[1], target: match[2], remote: match[3], inline: true }))
    )
  }),
  ...[...postgres.matchAll(/ALTER TABLE\s+([a-z_]+\.[a-z_]+)([\s\S]*?);/g)]
    .flatMap((statement) => {
      const foreignKey = statement[2].match(
        /ADD CONSTRAINT\s+[a-z_][a-z0-9_]*\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-z_]+\.[a-z_]+)\s*\(([^)]+)\)/,
      )
      return foreignKey
        ? [{ table: statement[1], local: foreignKey[1], target: foreignKey[2], remote: foreignKey[3], inline: false }]
        : []
    }),
]
for (const foreignKey of foreignKeys) {
  const source = sqlTables.get(foreignKey.table)
  const target = sqlTables.get(foreignKey.target)
  const local = foreignKey.local.split(',').map(value => value.trim())
  const remote = foreignKey.remote.split(',').map(value => value.trim())
  if (!source)
    fail(`PostgreSQL foreign key source table is unknown: ${foreignKey.table}`)
  if (!target)
    fail(`PostgreSQL foreign key target table is unknown: ${foreignKey.target}`)
  for (const column of local) {
    if (source && !source.columns.has(column))
      fail(`PostgreSQL foreign key ${foreignKey.table} uses unknown local column ${column}`)
  }
  for (const column of remote) {
    if (target && !target.columns.has(column))
      fail(`PostgreSQL foreign key ${foreignKey.table} references unknown ${foreignKey.target}.${column}`)
  }
  if (local.length !== remote.length)
    fail(`PostgreSQL foreign key ${foreignKey.table} has ${local.length} local and ${remote.length} remote columns`)
  if (target && !target.candidateKeys.has(remote.join(',')))
    fail(`PostgreSQL foreign key ${foreignKey.table} references non-key ${foreignKey.target}(${remote.join(', ')})`)
  if (foreignKey.inline && source && target && foreignKey.table !== foreignKey.target && target.position > source.position)
    fail(`PostgreSQL inline foreign key ${foreignKey.table} references table created later: ${foreignKey.target}`)
}
if (!requireFile('04-workers-transactions-and-replay.md').includes('FOR UPDATE SKIP LOCKED'))
  fail('worker specification lacks the fenced SKIP LOCKED claim transaction')
if (!/UNIQUE\s*\(\s*tenant_id\s*,\s*object_key\s*\)/i.test(postgres))
  fail('evidence object key must be unique per tenant so evidence-scoped hold and erasure cannot affect another record')
if (/\buuid\s*\[\s*\]/i.test(postgres))
  fail('authoritative PostgreSQL DDL uses UUID arrays instead of foreign-keyed provenance link ledgers')
const globalControlMetadataTables = new Set([
  'die_control.tenant_cell_assignment',
  'die_control.tenant_cell_principal',
])
const tenantTables = [...postgres.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z_]+\.[a-z_]+)\s*\(([\s\S]*?)(?=CREATE TABLE IF NOT EXISTS|CREATE INDEX|CREATE UNIQUE INDEX|ALTER TABLE|CREATE OR REPLACE FUNCTION|COMMIT;)/g)]
  .filter(match => /\btenant_id\s+text\b/.test(match[2]))
  .map(match => match[1])
for (const table of tenantTables) {
  if (globalControlMetadataTables.has(table)) {
    if (!postgres.includes(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`)
      || !postgres.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`))
      fail(`${table} lacks RLS enforcement`)
    if (table === 'die_control.tenant_cell_assignment'
      && (!postgres.includes(`CREATE POLICY cell_worker_read_assignment ON ${table}`)
        || !postgres.includes('principal.database_principal = session_user')))
      fail(`${table} lacks session-principal-bound assignment isolation`)
    if (table === 'die_control.tenant_cell_principal'
      && (!postgres.includes(`CREATE POLICY cell_principal_self_read ON ${table}`)
        || !postgres.includes('database_principal = session_user')
        || !postgres.includes('uq_tenant_cell_principal_active')
        || !postgres.includes('principal_binding_id uuid NOT NULL')
        || !postgres.includes('cell move requires every principal in the old cell to be revoked first')
        || !postgres.includes('new tenant cell principal must target the current active cell assignment')))
      fail(`${table} lacks session-principal self-read isolation`)
    continue
  }
  if (!postgres.includes(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`))
    fail(`tenant table lacks FORCE ROW LEVEL SECURITY: ${table}`)
  if (!postgres.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`))
    fail(`tenant table lacks ENABLE ROW LEVEL SECURITY: ${table}`)
  const escapedTable = table.replace('.', '\\.')
  const policy = new RegExp(`CREATE POLICY\\s+[a-z_][a-z0-9_]*\\s+ON\\s+${escapedTable}\\s+USING[\\s\\S]*?WITH CHECK`, 'm')
  if (!policy.test(postgres))
    fail(`tenant table lacks tenant USING/WITH CHECK policy: ${table}`)
}

const clickhouse = requireFile('sql/002-die-clickhouse.sql')
if (/TTL\s+.*INTERVAL\s+\d+/i.test(clickhouse))
  fail('ClickHouse DDL hardcodes a retention duration; retention must be an environment policy migration')
if (!clickhouse.includes('AggregatingMergeTree') || !clickhouse.includes('projection_generation'))
  fail('ClickHouse DDL lacks versioned rebuildable projection structure')
if (clickhouse.includes('ReplacingMergeTree'))
  fail('ClickHouse DDL uses ReplacingMergeTree before deterministic digest tie selection')
if (!/ORDER BY \(tenant_id, projection_generation,/m.test(clickhouse))
  fail('ClickHouse rebuild generations are not isolated in sorting/current-state keys')
for (const field of ['business_scope_id', 'environment', 'sensitivity']) {
  if (!clickhouse.includes(field))
    fail(`ClickHouse authorization projection omits ${field}`)
}
for (const fragment of [
  'lifecycle',
  'visibility',
  'evidence_search_current_v1',
  'source_object_token',
  'correlation_tokens',
  'Tuple(UInt64, FixedString(64))',
  'tuple(source.canonical_watermark, source.row_digest)',
  'disposition_state',
  "WHERE disposition_state NOT IN ('object_deleted', 'deleted')",
  'ENGINE = MergeTree',
  'bounded_evidence_correlation',
  "CAST(correlation_tokens, 'Map(String, String)')",
  'SET async_insert = 0',
]) {
  if (!clickhouse.includes(fragment))
    fail(`ClickHouse DDL lacks hardened projection fragment ${fragment}`)
}
for (const prohibited of ['source_object_id String', 'correlation_ids Map']) {
  if (clickhouse.includes(prohibited))
    fail(`ClickHouse DDL leaks raw metadata field: ${prohibited}`)
}

const grants = requireFile('sql/003-die-roles-and-grants.sql')
for (const role of ['die_ingest', 'die_normalizer', 'die_truth', 'die_projector', 'die_api', 'die_bff', 'die_maintenance', 'die_control_admin', 'die_authz_admin']) {
  if (!grants.includes(role))
    fail(`PostgreSQL role/grant DDL omits ${role}`)
}
if (!grants.includes('NOBYPASSRLS') || !grants.includes('REVOKE ALL'))
  fail('PostgreSQL role/grant DDL lacks RLS and public-revocation safeguards')
if (!grants.includes('GRANT EXECUTE ON FUNCTION die_authz.current_tenant_id()'))
  fail('runtime roles cannot execute the RLS tenant-context function')
if (!grants.includes('GRANT SELECT ON die_authz.business_scope TO die_control_admin'))
  fail('producer enrollment role cannot validate the target business scope')
if (!grants.includes('GRANT USAGE ON SCHEMA die_authz, die_control TO die_bff')
  || !grants.includes('GRANT INSERT ON die_authz.runtime_session TO die_bff'))
  fail('server-private BFF lacks its narrow OIDC/session authority')
if (!grants.includes('GRANT DELETE ON die_authz.runtime_session TO die_maintenance'))
  fail('bounded runtime-session tombstones have no maintenance-only purge path')
if (!grants.includes('GRANT SELECT, INSERT, UPDATE ON die_control.manifest_signer_key'))
  fail('controlled trust administration cannot manage manifest signer keys')
if (!/GRANT SELECT ON die_control\.source_profile, die_control\.source_profile_version,\s+die_control\.producer, die_control\.producer_capability,\s+die_control\.certification, die_control\.tenant_cell_assignment,\s+die_control\.tenant_cell_principal TO die_normalizer/.test(grants))
  fail('normalizer cannot validate enrolled cross-sensor assertion issuers')
if (!grants.includes('die_normalized.cross_sensor_assertion_use'))
  fail('normalizer cannot persist cross-sensor assertion replay state')
if (!grants.includes('GRANT SELECT, INSERT ON die_outbox.canonical_change TO die_ingest'))
  fail('ingest cannot atomically publish initial evidence disposition')
if (!/DELETE ON die_pipeline\.api_idempotency TO die_maintenance/.test(grants))
  fail('expired terminal API idempotency rows have no maintenance-only purge grant')
if (/GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA die_read[\s\S]*?TO die_projector/.test(grants))
  fail('projector has broad die_read mutation rights, including export jobs')
if (/GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA die_pipeline[\s\S]*?TO die_maintenance/.test(grants))
  fail('maintenance has broad pipeline mutation rights')
if (/GRANT SELECT, INSERT, UPDATE, DELETE ON die_pipeline\.work_item TO die_(?:normalizer|truth)/.test(grants))
  fail('ordinary workers may delete durable work items')
if (/GRANT SELECT, INSERT, UPDATE ON die_normalized\.source_object TO die_normalizer/.test(grants))
  fail('normalizer has unrestricted source-object UPDATE instead of lifecycle-only column grants')
if (/GRANT SELECT, INSERT, UPDATE ON die_pipeline\.stage_execution TO die_maintenance/.test(grants))
  fail('maintenance may mutate immutable stage executions')

const liveRunnerPath = join(root, 'tools/run-live-storage-conformance.sh')
if ((statSync(liveRunnerPath).mode & 0o111) === 0)
  fail('live storage conformance runner is not executable')
const repositoryRoot = resolve(root, '../../../..')
for (const path of [
  '.tool-versions',
  '.github/workflows/die-freeze-validation.yml',
]) {
  if (!existsSync(join(repositoryRoot, path)))
    fail(`clean-room reproducibility artifact is missing: ${path}`)
}
const toolVersions = readFileSync(join(repositoryRoot, '.tool-versions'), 'utf8')
if (!toolVersions.includes('nodejs 24.18.0') || !toolVersions.includes('python 3.12.13'))
  fail('clean-room Node/Python versions are not frozen')
const validationWorkflow = readFileSync(
  join(repositoryRoot, '.github/workflows/die-freeze-validation.yml'),
  'utf8',
)
for (const fragment of [
  'actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09',
  'actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444',
  'actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1',
  'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02',
  'run-clean-room-validation.mjs',
]) {
  if (!validationWorkflow.includes(fragment))
    fail(`clean-room workflow lacks immutable fragment ${fragment}`)
}
const liveRunner = requireFile('tools/run-live-storage-conformance.sh')
for (const fragment of [
  'postgres:17.10-alpine3.24',
  'clickhouse/clickhouse-server:26.3.17.56',
  'docker image inspect',
  'tools/live/postgres-conformance.sql',
  'tools/live/clickhouse-conformance.sql',
]) {
  if (!liveRunner.includes(fragment))
    fail(`live storage conformance runner lacks ${fragment}`)
}
const livePostgres = requireFile('tools/live/postgres-conformance.sql')
for (const fragment of [
  "OR SQLSTATE <> '23505'",
  "position('runtime role is not authorized to handle stage truth' in SQLERRM) = 0",
  "position('leased work cannot become terminal without its matching fenced execution' in SQLERRM) = 0",
  "position('export snapshot must bind the active caught-up product generation' in SQLERRM) = 0",
]) {
  if (!livePostgres.includes(fragment))
    fail(`PostgreSQL live conformance lacks exact negative assertion: ${fragment}`)
}
for (const [index, match] of [...livePostgres.matchAll(/WHEN OTHERS THEN([\s\S]*?)END IF;/g)].entries()) {
  if (!/\bOR\s+(?:position\(|SQLSTATE\s*<>)/.test(match[1]))
    fail(`PostgreSQL negative handler ${index + 1} accepts an unrelated failure`)
}
const seam = yaml.get(join(root, 'ui/nuxt-seam-verification.yaml'))
if (seam?.readiness?.verdict !== 'blocked_for_live_ui_binding')
  fail('Nuxt seam verification overclaims live UI readiness')
if ((seam?.required_transition_gates ?? []).length < 10)
  fail('Nuxt seam verification lacks the complete transition gate set')
const normalizationRouting = yaml.get(join(root, 'ontology/source-normalization.yaml'))
if (normalizationRouting?.output_contract?.schema !== '../schemas/normalization-bundle.schema.json')
  fail('normalization routing is not bound to the executable bundle schema')
if (!normalizationRouting?.output_contract?.cross_sensor_replay_ledger)
  fail('normalization routing omits the cross-sensor replay ledger')

// --- Producer health execution semantics (FP-095 remediation, DIE-HEALTH-002)
// Maintenance schedules and the projector executes against one exact
// generation; component health is typed and generation-bound; component and
// aggregate rows are written atomically; state and reason are exactly paired.

// Maintenance may schedule producer health but may never execute or project it.
if (!/OR \(stage = 'maintenance' AND subject_kind IN \(\n {6}'maintenance_job','evidence_erasure','producer_health_schedule'\n {4}\)\)/.test(postgres))
  fail('the maintenance stage must own producer_health_schedule and nothing else for producer health')
if (/stage = 'maintenance' AND subject_kind IN \([^)]*producer_health_evaluation/.test(postgres))
  fail('producer_health_evaluation must not be executable on the maintenance stage')
if (!/OR \(stage = 'project_postgres' AND subject_kind IN \(\n {6}'canonical_change','projection_generation','producer_health_evaluation'\n {4}\)\)/.test(postgres))
  fail('the projector must execute producer_health_evaluation on the project_postgres stage')
if (/stage = 'project_clickhouse' AND subject_kind IN \([^)]*producer_health/.test(postgres))
  fail('producer health must not be evaluated on the ClickHouse projection stage')
// The execution subject names one producer and one exact generation.
const healthSubjectIdCheck = "CHECK (subject_kind <> 'producer_health_evaluation'\n    OR subject_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[1-9][0-9]{0,15}$')"
const healthScheduleIdCheck = "CHECK (subject_kind <> 'producer_health_schedule'\n    OR subject_id ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$')"
for (const [label, fragment] of [
  ['producer_health_evaluation', healthSubjectIdCheck],
  ['producer_health_schedule', healthScheduleIdCheck],
]) {
  const occurrences = postgres.split(fragment).length - 1
  if (occurrences < 2)
    fail(`${label} must bind its subject_id format on both work_item and stage_execution`)
}

// The typed component projection and its generation binding.
const componentTable = 'CREATE TABLE IF NOT EXISTS die_read.producer_health_component_current'
if (!postgres.includes(componentTable))
  fail('die_read.producer_health_component_current is missing from the frozen schema')
for (const fragment of [
  'PRIMARY KEY (tenant_id, projection_generation, producer_id, component)',
  'FOREIGN KEY (tenant_id, projection_generation, producer_id)\n    REFERENCES die_read.producer_current(tenant_id, projection_generation, producer_id)',
  "CHECK (component_state IN (\n    'unknown','healthy','degraded','unhealthy','offline'\n  ))",
  "CHECK (evidence_state IN ('fresh','stale','missing'))",
  'CHECK ((evidence_state = \'missing\') = (observed_at IS NULL))',
  "CHECK (evidence_state <> 'missing' OR component_state = 'unknown')",
  "CHECK (component_state <> 'healthy'\n    OR (evidence_state = 'fresh' AND source_native_state IS NOT NULL))",
  'CHECK ((observed_at IS NOT NULL) = (evidence_id IS NOT NULL))',
  'CHECK ((observed_at IS NOT NULL) = (normalization_run_id IS NOT NULL))',
  'CHECK ((observed_at IS NOT NULL) = (source_native_state IS NOT NULL))',
  "CHECK (oldest_queue_age_ms IS NULL OR source_profile IN ('browser','llm_gateway'))",
  "CHECK (active_sessions IS NULL OR source_profile = 'mcp_gateway')",
  "CHECK (snapshot_watermark IS NULL OR source_profile = 'endpoint')",
  'ALTER TABLE die_read.producer_health_component_current ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE die_read.producer_health_component_current FORCE ROW LEVEL SECURITY',
  'CREATE POLICY tenant_isolation_read_producer_health_component',
]) {
  if (!postgres.includes(fragment))
    fail(`die_read.producer_health_component_current lacks required invariant: ${fragment.split('\n')[0]}`)
}

// Component and aggregate health are written together for one generation.
for (const fragment of [
  'health_component_count integer NOT NULL DEFAULT 0',
  'health_required_component_count integer NOT NULL DEFAULT 0',
  'CHECK (health_required_component_count <= health_component_count)',
  "CHECK (health_state <> 'healthy' OR health_required_component_count >= 1)",
  'CHECK (health_component_count = 0 OR health_evaluated_at IS NOT NULL)',
  "CHECK (health_reason_code <> 'insufficient_evidence' OR health_component_count = 0)",
]) {
  if (!postgres.includes(fragment))
    fail(`die_read.producer_current lacks the atomic component-projection invariant: ${fragment}`)
}

// The exact state/reason matrix. Every reason belongs to exactly one state.
const frozenHealthReasonMatrix = new Map([
  ['unknown', ['no_health_policy', 'insufficient_evidence']],
  ['healthy', ['all_required_components_healthy']],
  ['degraded', [
    'required_component_degraded', 'required_component_stale',
    'required_component_missing', 'delivery_queue_degraded',
  ]],
  ['unhealthy', ['required_component_unhealthy', 'delivery_queue_unhealthy']],
  ['offline', ['required_component_offline', 'producer_liveness_expired']],
])
const healthMatrixBlock = postgres.match(
  /-- The exact allowed state\/reason pairs\.[\s\S]*?\n {2}\),\n/,
)
if (!healthMatrixBlock) {
  fail('die_read.producer_current lacks the exact health state/reason matrix')
}
else {
  const seenReasons = new Set()
  for (const [state, reasons] of frozenHealthReasonMatrix) {
    const clause = healthMatrixBlock[0].match(
      new RegExp(`health_state = '${state}' AND health_reason_code (?:IN \\(([\\s\\S]*?)\\)|= '([a-z_]+)')`),
    )
    if (!clause) {
      fail(`health state/reason matrix omits ${state}`)
      continue
    }
    const allowed = clause[2] ? [clause[2]] : [...clause[1].matchAll(/'([a-z_]+)'/g)].map(match => match[1])
    if ([...allowed].sort().join(',') !== [...reasons].sort().join(','))
      fail(`health state ${state} allows ${allowed.join(', ')} instead of the frozen ${reasons.join(', ')}`)
    for (const reason of allowed) {
      if (seenReasons.has(reason))
        fail(`health reason ${reason} is allowed for more than one state`)
      seenReasons.add(reason)
    }
  }
  if ([...seenReasons].sort().join(',') !== [...producerHealthReasons].sort().join(','))
    fail('the health state/reason matrix does not cover exactly the frozen ProducerHealthReason vocabulary')
}
for (const fragment of [
  "CHECK (health_reason_code <> 'delivery_queue_degraded' OR health_queue_state = 'degraded')",
  "CHECK (health_reason_code <> 'delivery_queue_unhealthy' OR health_queue_state = 'unhealthy')",
]) {
  if (!postgres.includes(fragment))
    fail(`die_read.producer_current lacks the queue-reason coherence invariant: ${fragment}`)
}

// Health, trust and coverage stay independent axes: no constraint on the
// producer projection may make one a function of another.
const producerCurrentBlock = postgres.match(
  /CREATE TABLE IF NOT EXISTS die_read\.producer_current \(([\s\S]*?)\n\);/,
)
if (!producerCurrentBlock) {
  fail('die_read.producer_current could not be read for axis-independence checking')
}
else {
  for (const check of producerCurrentBlock[1].matchAll(/CHECK \(([\s\S]*?)\)(?=,\n|\n\);|$)/g)) {
    const body = check[1]
    if (/health_(?:state|reason_code|queue_state)/.test(body) && /trust_state|coverage_state/.test(body))
      fail('a producer_current constraint couples producer health to trust or coverage; the axes must stay independent')
  }
}

// Grants: the projector writes both health read models and nothing else does.
if (!/GRANT SELECT, INSERT, UPDATE, DELETE ON[\s\S]*?die_read\.producer_health_component_current[\s\S]*?TO die_projector;/.test(grants))
  fail('the projector must hold write access to die_read.producer_health_component_current')
for (const table of ['die_read.producer_current', 'die_read.producer_health_component_current']) {
  if (!new RegExp(`REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ${table.replace('.', '\\.')}\\n {2}FROM die_maintenance;`).test(grants))
    fail(`maintenance must be explicitly revoked from writing ${table}`)
}
if (/GRANT[^;]*(?:INSERT|UPDATE|DELETE)[^;]*die_read\.producer_health_component_current[^;]*TO die_maintenance/.test(grants))
  fail('maintenance must never be granted write access to the component health projection')

// Typed component-health observations in the normalized contract.
const healthObservations = normalizedSchema.properties?.health_observations
if (!normalizedSchema.required?.includes('health_observations'))
  fail('the normalized observation contract must require typed health_observations')
if (healthObservations?.items?.additionalProperties !== false)
  fail('typed health observations must be closed objects, not unconstrained JSON')
for (const field of ['observation_key', 'component', 'state', 'source_native_state', 'observed_at']) {
  if (!healthObservations?.items?.required?.includes(field))
    fail(`typed health observations must require ${field}`)
}
const observationStates = healthObservations?.items?.properties?.state?.enum ?? []
if ([...observationStates].sort().join(',') !== [...producerHealthStates].sort().join(','))
  fail('typed health observation state diverges from the common ProducerHealthState vocabulary')
if (healthObservations?.items?.properties?.component?.enum === undefined)
  fail('typed health observation component must be a closed vocabulary')

// Exact source-to-component mappings for all five profiles, agreeing across the
// ontology, the normalized contract, the API and the read projection.
const componentMappingBlock = postgres.match(
  /-- Exact source-to-component mapping for all five profiles\.[\s\S]*?\n {2}\),\n/,
)
if (!componentMappingBlock) {
  fail('die_read.producer_health_component_current lacks the per-profile component mapping')
}
else {
  const ontologyComponents = new Set()
  for (const profile of ['browser', 'browser_backend', 'endpoint', 'llm_gateway', 'mcp_gateway']) {
    const mapping = sourceNormalization?.profiles?.[profile]?.health_mapping
    if (!mapping)
      fail(`profile ${profile} has no frozen health_mapping`)
    const components = mapping?.components ?? []
    if (!Array.isArray(components) || components.length === 0)
      fail(`profile ${profile} declares no health components`)
    if (!mapping?.canonical_mapping)
      fail(`profile ${profile} has no canonical health state mapping`)
    const mapped = Object.values(mapping?.canonical_mapping ?? {})
    for (const state of mapped) {
      if (!producerHealthStates.includes(state))
        fail(`profile ${profile} maps a source health token to ${state}, outside ProducerHealthState`)
    }
    if (profile === 'browser_backend' && mapped.includes('offline'))
      fail('Browser Backend carries no offline value; offline must be derived centrally')
    const clause = componentMappingBlock[0].match(
      new RegExp(`source_profile = '${profile}' AND component IN \\(([\\s\\S]*?)\\)`),
    )
    if (!clause) {
      fail(`the component projection does not constrain profile ${profile}`)
      continue
    }
    const sqlComponents = [...clause[1].matchAll(/'([a-z_]+)'/g)].map(match => match[1])
    if ([...sqlComponents].sort().join(',') !== [...components].sort().join(','))
      fail(`profile ${profile} component set diverges between the ontology and the read projection`)
    for (const component of components) ontologyComponents.add(component)
  }
  const contractComponents = healthObservations?.items?.properties?.component?.enum ?? []
  if ([...contractComponents].sort().join(',') !== [...ontologyComponents].sort().join(','))
    fail('the typed health observation component vocabulary diverges from the five frozen profile component sets')
  const apiComponents = openapi?.components?.schemas?.ProducerHealthComponentName?.enum ?? []
  if ([...apiComponents].sort().join(',') !== [...ontologyComponents].sort().join(','))
    fail('ProducerHealthComponentName diverges from the five frozen profile component sets')
}
if (openapi?.components?.schemas?.ProducerHealthComponent?.properties?.component?.$ref
  !== '#/components/schemas/ProducerHealthComponentName')
  fail('ProducerHealthComponent.component must reference the closed component vocabulary')
if (!openapi?.components?.schemas?.ProducerHealth?.required?.includes('projection_generation'))
  fail('ProducerHealth must name the exact projection generation it was derived for')
for (const rule of ['producer_health_component_rule', 'producer_health_ownership_rule']) {
  if (!sourceNormalization?.global?.[rule])
    fail(`the normalization ontology omits the frozen ${rule}`)
}

const markdownPaths = allFiles.filter(path => path.endsWith('.md'))
for (const path of markdownPaths) {
  const text = readFileSync(path, 'utf8')
  const links = [...text.matchAll(/\[[^\]]*]\(([^)]+)\)/g)].map(match => match[1])
  for (const raw of links) {
    const target = raw.split('#')[0]
    if (!target || /^(https?:|mailto:|sandbox:|\/)/.test(target))
      continue
    const decoded = decodeURIComponent(target)
    if (!existsSync(resolve(dirname(path), decoded)))
      fail(`${relative(root, path)} has broken local link: ${raw}`)
  }
}

if (errors.length) {
  console.error(`DIE implementation freeze validation failed with ${errors.length} error(s):`)
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

notes.push(`${operationIds.size} OpenAPI operations`)
notes.push(`${profilePaths.length} typed source-profile schemas`)
notes.push(`${profileCapabilityRows.length} profile-kind dispositions`)
notes.push(`${profileEntityRows.length} profile-entity dispositions`)
notes.push(`${fieldRows.length} field dispositions`)
notes.push(`${relationshipRows.length} relationship support rules`)
notes.push(`${uiFieldRows.length} UI field lineage rules`)
notes.push(`${temporalRows.length} source-temporal kind rules`)
notes.push(`${precedenceCases.length} temporal precedence fixtures`)
notes.push(`${conformanceRows.length} implementation conformance rows`)
notes.push(`${gateTestRows.length} production gate tests`)
notes.push(`${defectRows.length} defect/live-gate ledger rows`)
notes.push(`${organizationRepositories.length} organization repositories classified`)
notes.push(`${selectedEvidence.rows.length} selected source/build evidence rows`)
notes.push(`${sourceReachabilityRows.length} source reachability edges`)
notes.push(`${allFiles.length} package files`)
console.log(`DIE implementation freeze validation passed: ${notes.join('; ')}.`)

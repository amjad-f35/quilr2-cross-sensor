#!/usr/bin/env node

import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const toolDir = dirname(fileURLToPath(import.meta.url))
const freezeRoot = resolve(toolDir, '..')
const consolidateRoot = process.env.CONSOLIDATE_ROOT
  ? resolve(process.env.CONSOLIDATE_ROOT)
  : resolve(toolDir, '../../../../../../..')
const outputRoot = join(freezeRoot, 'lg008')
const generatedDate = '2026-07-30'

const analysis = {
  browser: join(
    consolidateRoot,
    'Browser-Extension-System/Browser-extension-sensor-analysis/outputs/'
      + 'browser-extension-sensor-intelligence/matrices/sensor-intelligence/browser-extension',
  ),
  browserBackend: join(
    consolidateRoot,
    'Browser-Extension-System/Browser-extension-sensor-analysis/outputs/'
      + 'browser-backend-sensor-intelligence/matrices/sensor-intelligence/browser-backend',
  ),
  endpoint: join(
    consolidateRoot,
    'ENDPOINT-AGENT-ANALYSIS-COMPLETE/matrices/sensor-intelligence/endpoint-sensor',
  ),
}

const source = {
  browser: join(consolidateRoot, 'Org-Recon-2026-07-30/Project-Vanguard'),
  browserNative: join(consolidateRoot, 'Org-Recon-2026-07-30/project-sentinel'),
  browserBackend: join(consolidateRoot, 'Org-Recon-2026-07-30/browser-extension-service'),
  endpoint: join(consolidateRoot, 'Org-Recon-2026-07-30/sentinel-endpoint-agent'),
  llm: join(consolidateRoot, 'Org-Recon-2026-07-30/macrodata-refinement'),
  mcp: join(consolidateRoot, 'Org-Recon-2026-07-30/quilr-llm-gateway'),
}

const baseline = {
  browser: join(
    consolidateRoot,
    'Browser-Extension-System/Browser-Extension-Analysis-Complete-2026-07-30/'
      + 'Browser-extension-sensor-analysis/work/repositories/Project-Vanguard',
  ),
  browserNative: join(
    consolidateRoot,
    'Browser-Extension-System/Browser-Extension-Analysis-Complete-2026-07-30/'
      + 'Browser-extension-sensor-analysis/work/repositories/project-sentinel',
  ),
  browserBackend: join(
    consolidateRoot,
    'Browser-Extension-System/Browser-Extension-Analysis-Complete-2026-07-30/'
      + 'Browser-extension-sensor-analysis/work/repositories/browser-extension-service',
  ),
}

const revisions = {
  browser: {
    'Project-Vanguard': '8e7a3e0c22c3ec29d0c642b211d59e9abc0071cb',
    'project-sentinel': '6f55960ff5c3bf3cf1838985acd4155fc9f16334',
  },
  'browser-backend': {
    'browser-extension-service': '496b8c216025e5d21871f5959e61dcdd01836106',
  },
  endpoint: {
    'sentinel-endpoint-agent': 'a022e52bf2fff6a9445ebad96c3afeaf277e259f',
  },
  'llm-gateway': {
    'macrodata-refinement': '92b0462c583b908f8ce0cadd1bc89d2e702f5a7d',
  },
  'mcp-gateway': {
    'quilr-llm-gateway': '99f759d75aa8260f97db6904433c941647a755e5',
  },
}

const profileIds = Object.fromEntries(
  ['browser', 'browser-backend', 'endpoint', 'llm-gateway', 'mcp-gateway']
    .map(profile => [profile, stableId('profile', profile)]),
)

function fail(message) {
  throw new Error(message)
}

function requirePath(path) {
  if (!existsSync(path))
    fail(`required LG-008 input is missing: ${path}`)
  return path
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function fileSha256(path) {
  return sha256(readFileSync(path))
}

function stableId(kind, ...parts) {
  const digest = sha256(parts.map(value => String(value).trim()).join('\u001f'))
  return `urn:quilr:lg008:${kind}:${digest}`
}

function parseCsv(text, path = '<memory>') {
  const table = []
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
        table.push(row)
      row = []
      field = ''
    }
    else {
      field += char
    }
  }
  if (quoted)
    fail(`unterminated quoted field in ${path}`)
  if (field !== '' || row.length) {
    row.push(field)
    table.push(row)
  }
  if (!table.length)
    fail(`empty CSV input: ${path}`)
  const headers = table[0]
  return table.slice(1).map((values, index) => {
    if (values.length !== headers.length)
      fail(`${path}:${index + 2} has ${values.length} columns; expected ${headers.length}`)
    return Object.fromEntries(headers.map((header, offset) => [header, values[offset]]))
  })
}

function readCsv(path) {
  requirePath(path)
  return parseCsv(readFileSync(path, 'utf8'), path)
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function writeCsv(path, headers, rows) {
  const body = [
    headers.map(csvEscape).join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n'
  writeFileSync(path, body)
}

function sourceRepository(locator, profile) {
  if (profile === 'browser') {
    if (locator.startsWith('project-sentinel/'))
      return 'project-sentinel'
    return 'Project-Vanguard'
  }
  if (profile === 'browser-backend')
    return 'browser-extension-service'
  if (profile === 'endpoint')
    return 'sentinel-endpoint-agent'
  if (profile === 'llm-gateway')
    return 'macrodata-refinement'
  return 'quilr-llm-gateway'
}

function revisionFor(profile, repository) {
  const revision = revisions[profile]?.[repository]
  if (!revision)
    fail(`no selected revision for ${profile}/${repository}`)
  return revision
}

function normalizeEvidence(value) {
  const normalized = String(value || '').toUpperCase()
  if (normalized.includes('VERIFIED') || normalized.includes('SOURCE_PROVEN'))
    return 'SOURCE_PROVEN'
  if (normalized.includes('RUNTIME'))
    return 'RUNTIME_OBSERVED'
  if (normalized.includes('INFER'))
    return 'INFERRED'
  return 'SOURCE_PROVEN'
}

function browserCollectionState(row) {
  const availability = row['Platform availability'] || ''
  const destination = row['Current destination'] || ''
  const meaning = row.Meaning || ''
  if (/not observable/i.test(availability))
    return 'NOT_OBSERVABLE_BY_PROFILE'
  if (/requires minor sensor instrumentation/i.test(availability))
    return 'NEW_CAPTURE_REQUIRED'
  if (/unresolved/i.test(availability))
    return 'UNRESOLVED_REACHABILITY'
  if (/diagnostic uploader|diagnostic.*cache/i.test(destination))
    return 'USER_INITIATED_DIAGNOSTIC_ONLY'
  if (/HTTPS request|BES |backend|Neo4j|Kafka|HTTP|API client/i.test(destination))
    return 'SERIALIZED_OR_EMITTED'
  if (/IndexedDB|chrome\\.storage|local|memory|transient|sender inactive/i.test(destination)
    || /local|transient/i.test(meaning))
    return 'SOURCE_LOCAL_CAPTURE'
  return 'SOURCE_NATIVE_CAPTURE'
}

function endpointCollectionState(row, record) {
  const text = [
    row.transformation,
    row.persistence,
    row.missing_invalid_behavior,
    record?.status,
    record?.persistence_or_transport,
  ].join(' ')
  if (/not serialized|current builder (?:sets )?(?:none|vec empty)|ignored evaluator|producer absent/i.test(text))
    return 'CAPTURED_NOT_CURRENTLY_EMITTED'
  if (/Control input|backend to endpoint|Configuration input|Control current state/i.test(`${record?.class} ${record?.producer}`))
    return 'CONTROL_INPUT_NOT_TELEMETRY'
  if (/HTTP|backend|broker|alert JSON|gzip/i.test(text))
    return 'SERIALIZED_OR_EMITTED'
  if (/SQLite|file|local IPC|Unix-socket|JSON endpoint|vault/i.test(text))
    return 'LOCAL_SERIALIZED_OR_PERSISTED'
  if (/memory|transient|None/i.test(text))
    return 'SOURCE_LOCAL_CAPTURE'
  return 'SOURCE_NATIVE_CAPTURE'
}

function privacyDisposition(sensitivity, productDisposition, fieldName = '') {
  const text = `${sensitivity} ${productDisposition} ${fieldName}`.toLowerCase()
  if (/auth_context_key|endpoint_fingerprint|authorization context|endpoint configuration token/.test(text))
    return 'TOKENIZE_TENANT_KEYED'
  if (/secret|credential|access_token|auth.?token|bearer_token|client_secret|password/.test(text))
    return 'PROHIBIT_SECRET'
  if (/raw-only|highly sensitive content|raw prompt|raw response|response body|tool_arguments|response_content/.test(text))
    return 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY'
  if (/operator-only|diagnostic/.test(text))
    return 'OPERATOR_DIAGNOSTIC_ONLY'
  if (/sensitive|personal|human identity|email|hostname|machine|device identifier|network/.test(text))
    return 'FIELD_AUTHORIZED_SENSITIVE_CLAIM'
  return 'ADMIT_MINIMIZED'
}

function targetDisposition(productDisposition, collectionState, privacy) {
  if (privacy === 'PROHIBIT_SECRET')
    return 'DISCARD_WITH_REASON'
  if (collectionState === 'NOT_OBSERVABLE_BY_PROFILE')
    return 'UNSUPPORTED_DO_NOT_EMIT'
  if (collectionState === 'NEW_CAPTURE_REQUIRED')
    return 'NEW_CAPTURE_REQUIRED'
  if (privacy === 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY')
    return 'RAW_EVIDENCE_REFERENCE_ONLY'
  const text = String(productDisposition || '').toLowerCase()
  if (/discard/.test(text))
    return 'DISCARD_WITH_REASON'
  if (/inventory|entity detail/.test(text))
    return 'CANONICAL_INVENTORY_INPUT'
  if (/relationship/.test(text))
    return 'RELATIONSHIP_CLAIM'
  if (/activity|evidence|analytics|finding signal/.test(text))
    return 'ACTIVITY_OR_EVIDENCE'
  if (/coverage|health/.test(text))
    return 'COVERAGE_OR_HEALTH'
  if (/configuration/.test(text))
    return 'CONFIGURATION_CLAIM'
  return 'SOURCE_LOCAL_OR_UNMAPPED'
}

const nativeFields = []

function addNativeField({
  profile,
  record,
  nativeField,
  nativeType = 'unknown',
  meaning,
  sourceLocator,
  repository,
  collectionState,
  target,
  privacy,
  sensitivity = 'Unclassified',
  nullability = 'Unresolved',
  unit = 'N/A',
  origin = 'Source',
  directOrDerived = 'Direct or propagated',
  evidence = 'SOURCE_PROVEN',
  availability = '',
  notes = '',
}) {
  const revision = revisionFor(profile, repository)
  const globalFieldId = stableId(
    'field',
    profile,
    repository,
    revision,
    record,
    nativeField,
    sourceLocator,
  )
  const accessRecipeId = stableId('access-recipe', profile, repository, record, sourceLocator)
  nativeFields.push({
    global_field_id: globalFieldId,
    profile_id: profileIds[profile],
    profile,
    record_type: record,
    native_field: nativeField,
    native_type: nativeType,
    meaning,
    repository,
    source_revision: revision,
    source_locator: sourceLocator,
    collection_state: collectionState,
    target_disposition: target,
    privacy_disposition: privacy,
    sensitivity,
    nullability,
    unit,
    origin,
    direct_or_derived: directOrDerived,
    evidence_status: evidence,
    source_availability: availability,
    access_recipe_id: accessRecipeId,
    notes,
  })
}

function loadBrowserFields() {
  const path = join(analysis.browser, 'native-fields.csv')
  for (const row of readCsv(path)) {
    const locator = row['Exact location']
    if (locator.startsWith('browser-extension-service/'))
      continue
    const profile = 'browser'
    const repository = sourceRepository(locator, profile)
    const collectionState = browserCollectionState(row)
    const privacy = privacyDisposition(
      row.Sensitivity,
      row['Product disposition'],
      row['Native field'],
    )
    addNativeField({
      profile,
      record: row.Record,
      nativeField: row['Native field'],
      nativeType: row['Native type'],
      meaning: row.Meaning,
      sourceLocator: locator,
      repository,
      collectionState,
      target: targetDisposition(row['Product disposition'], collectionState, privacy),
      privacy,
      sensitivity: row.Sensitivity,
      nullability: row.Nullability,
      unit: row.Unit,
      origin: row.Origin,
      directOrDerived: row['Direct or derived'],
      evidence: normalizeEvidence(row.Evidence),
      availability: row['Platform availability'],
      notes: row['Current destination'],
    })
  }
}

function loadBrowserBackendFields() {
  const path = join(analysis.browserBackend, 'native-fields.csv')
  for (const row of readCsv(path)) {
    const profile = 'browser-backend'
    const collectionState = browserCollectionState(row)
    const privacy = privacyDisposition(
      row.Sensitivity,
      row['Product disposition'],
      row['Native field'],
    )
    addNativeField({
      profile,
      record: row.Record,
      nativeField: row['Native field'],
      nativeType: row['Native type'],
      meaning: row.Meaning,
      sourceLocator: row['Exact location'],
      repository: 'browser-extension-service',
      collectionState,
      target: targetDisposition(row['Product disposition'], collectionState, privacy),
      privacy,
      sensitivity: row.Sensitivity,
      nullability: row.Nullability,
      unit: row.Unit,
      origin: row.Origin,
      directOrDerived: row['Direct or derived'],
      evidence: normalizeEvidence(row.Evidence),
      availability: row['Platform availability'],
      notes: row['Current destination'],
    })
  }
}

function loadEndpointFields() {
  const fieldPath = join(analysis.endpoint, 'native-fields.csv')
  const recordPath = join(analysis.endpoint, 'native-record-types.csv')
  const dispositionPath = join(analysis.endpoint, 'product-disposition.csv')
  const records = new Map(readCsv(recordPath).map(row => [row.record_id, row]))
  const dispositions = new Map(
    readCsv(dispositionPath)
      .filter(row => row.item_kind === 'field')
      .map(row => [row.item_id, row]),
  )
  for (const row of readCsv(fieldPath)) {
    const record = records.get(row.record_id)
    if (!record)
      fail(`Endpoint field ${row.field_id} has no record ${row.record_id}`)
    const product = dispositions.get(row.field_id)
    if (!product)
      fail(`Endpoint field ${row.field_id} has no product disposition`)
    const collectionState = endpointCollectionState(row, record)
    const privacy = privacyDisposition(
      row.sensitivity,
      product.product_disposition,
      row.field_path,
    )
    addNativeField({
      profile: 'endpoint',
      record: `${row.record_id}:${record.native_type}`,
      nativeField: row.field_path,
      nativeType: row.type,
      meaning: row.meaning_consumers,
      sourceLocator: `${row.evidence_status}; ${record.producer}; ${record.current_consumer}`,
      repository: 'sentinel-endpoint-agent',
      collectionState,
      target: targetDisposition(product.product_disposition, collectionState, privacy),
      privacy,
      sensitivity: row.sensitivity,
      nullability: row.required_default,
      unit: 'SOURCE_DEFINED',
      origin: row.origin,
      directOrDerived: row.transformation,
      evidence: normalizeEvidence(row.evidence_status),
      availability: record.status,
      notes: [
        `persistence=${row.persistence}`,
        `transport=${record.persistence_or_transport}`,
        `required_action=${product.required_action}`,
        `trust_boundary=${row.trust_boundary}`,
        `missing_invalid=${row.missing_invalid_behavior}`,
      ].join('; '),
    })
  }
}

function addDeltaFields() {
  const rows = [
    {
      profile: 'browser', record: 'PackageLogEnvelope', nativeField: 'user.hostname',
      nativeType: 'string', meaning: 'Native hostname added to ordinary browser activity logs',
      sourceLocator: 'Project-Vanguard/src/core/LogDrop/PackageLog/index.ts:40',
      repository: 'Project-Vanguard', collectionState: 'SERIALIZED_OR_EMITTED',
      target: 'CANONICAL_INVENTORY_INPUT', sensitivity: 'Sensitive device claim',
      notes: 'New after the pinned Browser dossier; source-scoped only and never a hostname-only merge key.',
    },
    {
      profile: 'browser', record: 'PackageExtensionLogEnvelope', nativeField: 'user.hostname',
      nativeType: 'string', meaning: 'Native hostname added to extension inventory/activity logs',
      sourceLocator: 'Project-Vanguard/src/core/LogDrop/PackageExtensionLogs/index.ts:37',
      repository: 'Project-Vanguard', collectionState: 'SERIALIZED_OR_EMITTED',
      target: 'CANONICAL_INVENTORY_INPUT', sensitivity: 'Sensitive device claim',
      notes: 'New after the pinned Browser dossier; source-scoped only and never a hostname-only merge key.',
    },
    {
      profile: 'browser', record: 'TrailsArtifactsType', nativeField: 'authToken',
      nativeType: 'string?', meaning: 'Intercepted authentication token used locally to derive an email',
      sourceLocator: 'Project-Vanguard/src/types/request.interceptor.d.ts:80; '
        + 'Project-Vanguard/src/core/processChain/activationFunctions/ArtifactsToTrails.ts:52-71',
      repository: 'Project-Vanguard', collectionState: 'SOURCE_LOCAL_CAPTURE',
      target: 'DISCARD_WITH_REASON', sensitivity: 'Secret',
      notes: 'The value is parsed locally and removed from trail artifacts; it must never enter evidence.',
    },
    {
      profile: 'browser', record: 'ManagedPersona', nativeField: 'quilr_persona_email',
      nativeType: 'string', meaning: 'Administrator-provisioned work email in chrome.storage.managed',
      sourceLocator: 'Project-Vanguard/src/core/persona/ManagedPersona.ts:7-92',
      repository: 'Project-Vanguard', collectionState: 'SOURCE_LOCAL_CAPTURE',
      target: 'CANONICAL_INVENTORY_INPUT', sensitivity: 'Human identity',
      notes: 'Managed source claim with stronger assurance than DOM discovery; central resolver still owns person identity.',
    },
    {
      profile: 'browser', record: 'PersonaEmailFoundMessage', nativeField: 'email',
      nativeType: 'string', meaning: 'Work email observed from a supported identity-provider page',
      sourceLocator: 'Project-Vanguard/src/background/InternalMessages/personaEmailFound.ts:14-52',
      repository: 'Project-Vanguard', collectionState: 'LOCAL_SERIALIZED_OR_PERSISTED',
      target: 'CANONICAL_INVENTORY_INPUT', sensitivity: 'Human identity',
      notes: 'Local message feeds Persona registration; not a standalone enterprise-person assertion.',
    },
    {
      profile: 'browser', record: 'PersonaEmailFoundMessage', nativeField: 'provider',
      nativeType: 'string', meaning: 'Identity-provider source label for the observed email',
      sourceLocator: 'Project-Vanguard/src/core/contents/personaEmailWatcher.ts:67-104',
      repository: 'Project-Vanguard', collectionState: 'LOCAL_SERIALIZED_OR_PERSISTED',
      target: 'ACTIVITY_OR_EVIDENCE', sensitivity: 'Internal',
      notes: 'Provenance label only.',
    },
    ...['email', 'emailDomain', 'loginType', 'enforce', 'consume', 'hostname', 'relyingParty']
      .map(field => ({
        profile: 'browser',
        record: 'LoginControlVerdictRequest',
        nativeField: field,
        nativeType: ['enforce', 'consume'].includes(field) ? 'boolean' : 'string?',
        meaning: `Local login-control request field ${field}`,
        sourceLocator: 'Project-Vanguard/src/background/InternalMessages/loginControlVerdict.ts:375-455',
        repository: 'Project-Vanguard',
        collectionState: 'LOCAL_SERIALIZED_OR_PERSISTED',
        target: field === 'email' ? 'ACTIVITY_OR_EVIDENCE' : 'SOURCE_LOCAL_OR_UNMAPPED',
        sensitivity: ['email', 'emailDomain', 'hostname', 'relyingParty'].includes(field)
          ? 'Sensitive identity or origin'
          : 'Internal',
        notes: 'Policy/control-plane local message; only the existing minimized auth outcome log enters this pass.',
      })),
    ...['verdict', 'host', 'appDomain', 'consumed', 'justified'].map(field => ({
      profile: 'browser',
      record: 'LoginControlVerdictResponse',
      nativeField: field,
      nativeType: ['consumed', 'justified'].includes(field) ? 'boolean?' : 'string?',
      meaning: `Local login-control response field ${field}`,
      sourceLocator: 'Project-Vanguard/src/background/InternalMessages/loginControlVerdict.ts:392-455',
      repository: 'Project-Vanguard',
      collectionState: 'LOCAL_SERIALIZED_OR_PERSISTED',
      target: field === 'verdict' ? 'ACTIVITY_OR_EVIDENCE' : 'SOURCE_LOCAL_OR_UNMAPPED',
      sensitivity: ['host', 'appDomain'].includes(field) ? 'Sensitive origin' : 'Internal',
      notes: 'Decision is source-native; effect must be observed separately through the normal interaction/log path.',
    })),
    ...['url', 'method', 'status', 'statusText', 'mimeType', 'body', 'size', 'truncated']
      .map(field => ({
        profile: 'browser',
        record: 'DiagnosticNetworkResponse',
        nativeField: field,
        nativeType: ['status', 'size'].includes(field)
          ? 'number'
          : field === 'truncated' ? 'boolean' : 'string',
        meaning: `User-initiated diagnostic network response ${field}`,
        sourceLocator: 'Project-Vanguard/src/types/diagnostic.d.ts:80-90; '
          + 'Project-Vanguard/src/core/contents/DiagnosticService/diagnosticContentCollector.ts:434-500',
        repository: 'Project-Vanguard',
        collectionState: 'USER_INITIATED_DIAGNOSTIC_ONLY',
        target: field === 'body'
          ? 'RAW_EVIDENCE_REFERENCE_ONLY'
          : 'SOURCE_LOCAL_OR_UNMAPPED',
        sensitivity: field === 'body' ? 'Highly sensitive content' : 'Sensitive diagnostic metadata',
        notes: 'Not ordinary discovery/activity telemetry. Requires explicit diagnostic consent and operator-only authorization.',
      })),
    {
      profile: 'browser-backend', record: 'FabricAppSettingsRequest', nativeField: 'tenant',
      nativeType: 'string', meaning: 'Caller-supplied tenant for the new legacy fabric mutation endpoint',
      sourceLocator: 'browser-extension-service/src/main/java/io/quilr/browserextensionservice/'
        + 'deployment/controller/GraphUpdateController.java:67-91',
      repository: 'browser-extension-service', collectionState: 'CONTROL_INPUT_NOT_TELEMETRY',
      target: 'SOURCE_LOCAL_OR_UNMAPPED', sensitivity: 'Tenant identifier',
      notes: 'Out of the bounded pass. Endpoint has no @RequiresPermission and must not be reused by Quilr 2.',
    },
    {
      profile: 'browser-backend', record: 'FabricAppSettingsRequest', nativeField: 'subscriber',
      nativeType: 'string', meaning: 'Caller-supplied subscriber for the new legacy fabric mutation endpoint',
      sourceLocator: 'browser-extension-service/src/main/java/io/quilr/browserextensionservice/'
        + 'deployment/controller/GraphUpdateController.java:67-91',
      repository: 'browser-extension-service', collectionState: 'CONTROL_INPUT_NOT_TELEMETRY',
      target: 'SOURCE_LOCAL_OR_UNMAPPED', sensitivity: 'Subscriber identifier',
      notes: 'Out of the bounded pass. Caller identity is not proof of authorization.',
    },
    {
      profile: 'browser-backend', record: 'FabricAppSettingsRequest', nativeField: 'appIds',
      nativeType: 'array<string>', meaning: 'Application IDs mutated by the legacy fabric endpoint',
      sourceLocator: 'browser-extension-service/src/main/java/io/quilr/browserextensionservice/'
        + 'deployment/controller/GraphUpdateController.java:80-89',
      repository: 'browser-extension-service', collectionState: 'CONTROL_INPUT_NOT_TELEMETRY',
      target: 'SOURCE_LOCAL_OR_UNMAPPED', sensitivity: 'Configuration identifiers',
      notes: 'Out of the bounded pass; no discovery/profile contract change.',
    },
    {
      profile: 'browser-backend', record: 'FabricAppSettingsRequest', nativeField: 'appSettings',
      nativeType: 'object', meaning: 'Application settings mutated by the legacy fabric endpoint',
      sourceLocator: 'browser-extension-service/src/main/java/io/quilr/browserextensionservice/'
        + 'deployment/controller/GraphUpdateController.java:80-89',
      repository: 'browser-extension-service', collectionState: 'CONTROL_INPUT_NOT_TELEMETRY',
      target: 'SOURCE_LOCAL_OR_UNMAPPED', sensitivity: 'Sensitive configuration',
      notes: 'Out of the bounded pass; current code logs this object and requires a separate security review.',
    },
    {
      profile: 'browser-backend', record: 'ApplicationConfiguration', nativeField: 'DEFAULT_LOGO_URL_OVERRIDE',
      nativeType: 'string', meaning: 'Deployment-specific default logo URL override',
      sourceLocator: 'browser-extension-service/src/main/resources/application.yml:36',
      repository: 'browser-extension-service', collectionState: 'CONTROL_INPUT_NOT_TELEMETRY',
      target: 'SOURCE_LOCAL_OR_UNMAPPED', sensitivity: 'Configuration',
      notes: 'Visual configuration only; no discovery/profile contract change.',
    },
  ]

  for (const row of rows) {
    const privacy = privacyDisposition(row.sensitivity, row.target, row.nativeField)
    addNativeField({
      ...row,
      privacy,
      nullability: row.nativeType.endsWith('?') ? 'nullable' : 'source-defined',
      unit: 'N/A',
      origin: 'Current source delta',
      directOrDerived: 'Direct or propagated',
      evidence: 'SOURCE_PROVEN',
      availability: 'CURRENT_SELECTED_REVISION',
    })
  }
}

function structFields(text, structName) {
  const match = text.match(new RegExp(`pub struct ${structName} \\{([\\s\\S]*?)^\\}`, 'm'))
  if (!match)
    fail(`Rust struct ${structName} not found`)
  return [...match[1].matchAll(/^\s*pub\s+([a-zA-Z0-9_]+)\s*:\s*([^,]+),/gm)]
    .map(item => ({ name: item[1], type: item[2].trim() }))
}

function pythonList(text, name) {
  const match = text.match(new RegExp(`${name}\\s*=\\s*\\[([\\s\\S]*?)\\n\\]`))
  if (!match)
    fail(`Python list ${name} not found`)
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(item => item[1])
}

function pythonClassFields(text, className) {
  const match = text.match(new RegExp(`(?:class|@dataclass\\s*\\nclass) ${className}[^:]*:\\n([\\s\\S]*?)(?=\\n(?:class|@dataclass)|$)`))
  if (!match)
    fail(`Python class ${className} not found`)
  return [...match[1].matchAll(/^\s{4}([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^=\n#]+)(?:=|$)/gm)]
    .map(item => ({ name: item[1], type: item[2].trim() }))
}

function loadLlmFields() {
  const rowsPath = join(source.llm, 'WORKERS/db_batch_writer/src/rows.rs')
  const v3Path = join(source.llm, 'WORKERS/db_batch_writer/src/llmgateway_logs_v3.rs')
  const rowsText = readFileSync(requirePath(rowsPath), 'utf8')
  const v3Text = readFileSync(requirePath(v3Path), 'utf8')

  for (const field of structFields(rowsText, 'ApiRequestLogRow')) {
    const privacy = privacyDisposition(
      /error_message|extra_data|actions_and_categories|processing_times|chunk_funnel/.test(field.name)
        ? 'Sensitive or dynamic JSON'
        : 'Operational metadata',
      '',
      field.name,
    )
    addNativeField({
      profile: 'llm-gateway',
      record: 'ApiRequestLogRow',
      nativeField: field.name,
      nativeType: field.type,
      meaning: `Final serialized LLM request-log field ${field.name}`,
      sourceLocator: `macrodata-refinement/WORKERS/db_batch_writer/src/rows.rs#ApiRequestLogRow.${field.name}`,
      repository: 'macrodata-refinement',
      collectionState: 'SERIALIZED_OR_EMITTED',
      target: targetDisposition(
        /request_id|tenant_id|model_name|provider|endpoint|api_key_name/.test(field.name)
          ? 'Inventory list; Entity detail; Activity explorer'
          : 'Activity explorer; Evidence drill-down; Analytics',
        'SERIALIZED_OR_EMITTED',
        privacy,
      ),
      privacy,
      sensitivity: /api_key_hash|tenant_id|api_key_name/.test(field.name)
        ? 'Pseudonymous or tenant identifier'
        : /error_message|extra_data/.test(field.name)
          ? 'Potentially sensitive content'
          : 'Operational metadata',
      nullability: field.type.startsWith('Option') ? 'nullable' : 'required',
      unit: /_ms$/.test(field.name) ? 'milliseconds' : /tokens/.test(field.name) ? 'tokens' : 'N/A',
      origin: 'PerformanceLoggerAsync → db_write_queue → Rust db_batch_writer',
      directOrDerived: /latency|blocked|anonymized|outcome/.test(field.name) ? 'Derived' : 'Direct or propagated',
      notes: 'This is an actual typed writer row; unlike the rejected lexical catalog it is serialized and stored.',
    })
  }

  for (const field of structFields(v3Text, 'LlmGatewayLogsV3Row')) {
    const privacy = privacyDisposition(
      /source_row_json|messages_json/.test(field.name) ? 'Highly sensitive content' : 'Operational metadata',
      '',
      field.name,
    )
    addNativeField({
      profile: 'llm-gateway',
      record: 'LlmGatewayLogsV3Row',
      nativeField: field.name,
      nativeType: field.type,
      meaning: `Stored unified LLM gateway projection field ${field.name}`,
      sourceLocator: `macrodata-refinement/WORKERS/db_batch_writer/src/llmgateway_logs_v3.rs#LlmGatewayLogsV3Row.${field.name}`,
      repository: 'macrodata-refinement',
      collectionState: 'SERIALIZED_OR_EMITTED',
      target: /source_row_json|messages_json/.test(field.name)
        ? 'RAW_EVIDENCE_REFERENCE_ONLY'
        : 'ACTIVITY_OR_EVIDENCE',
      privacy,
      sensitivity: /source_row_json|messages_json/.test(field.name)
        ? 'Highly sensitive content'
        : 'Operational metadata',
      nullability: field.type.startsWith('Option') ? 'nullable' : 'required',
      origin: 'Rust llmgateway_logs_v3 projector',
      directOrDerived: 'Derived',
      notes: 'Legacy projection is evidence for available semantics, not Quilr 2 canonical authority.',
    })
  }

  const nested = {
    request_json: [
      'api_key_name', 'provider', 'provider_label', 'surface', 'model_name', 'endpoint',
      'stream', 'status_code', 'error_type', 'error_message', 'request_tokens',
      'response_tokens', 'cache_read_tokens', 'cache_write_tokens', 'reasoning_tokens',
      'token_saving', 'max_tokens_requested', 'upstream_latency_ms',
      'quilr_processing_time_ms', 'guardrails_latency_ms', 'total_latency_ms',
      'first_response_time_ms', 'is_blocked_by_quilr', 'is_anonymized_by_quilr',
      'guardrails_outcome', 'routing_group_id', 'routing_mode',
    ],
    identity_json: ['primary_email', 'user_email', 'emails', 'ids', 'values', 'sources'],
    observability_json: [
      'has_observability', 'server_name', 'client_ip', 'conversation_id', 'trace_id',
      'external_request_id', 'correlation_id', 'session_id', 'agent_run_id', 'agent_id',
      'agent_name', 'agent_version', 'agent_framework', 'agent_thread_id', 'agent_span_id',
      'agent_parent_span_id', 'agent_step_name', 'agent_step_type', 'workflow_id',
      'workflow_run_id', 'upstream_request_id', 'vendor_trace_context', 'stream_trace',
    ],
    features_json: [
      'has_system_message', 'has_images', 'has_structured_output', 'structured_output_type',
      'has_refusal', 'has_native_anthropic_body', 'has_native_vertex_body',
      'has_openai_responses_body', 'has_embedding_input', 'has_audio_input',
      'has_audio_output',
    ],
    tools_json: [
      'has_input_tools', 'has_output_tool_calls', 'has_tool_results', 'has_legacy_functions',
      'has_tool_activity', 'input_tool_names', 'output_tool_names', 'tool_result_names',
      'legacy_function_names', 'all_tool_names', 'events',
    ],
    'tools_json.events[]': ['direction', 'kind', 'name', 'call_id', 'index', 'arguments_json'],
    actions_json: [
      'request_actions', 'response_actions', 'all_actions', 'fallback_actions',
      'effective_actions', 'has_blocked', 'has_monitored', 'has_anonymized',
    ],
  }
  const functionByRecord = {
    request_json: 'build_request_v3_row',
    identity_json: 'extract_identity_json',
    observability_json: 'extract_observability_json',
    features_json: 'extract_features_json',
    tools_json: 'extract_tools_json',
    'tools_json.events[]': 'tool_event',
    actions_json: 'extract_actions_json',
  }
  for (const [record, fields] of Object.entries(nested)) {
    for (const field of fields) {
      const dynamicOrRaw = /sources|vendor_trace_context|stream_trace|events|arguments_json|error_message|token_saving/.test(field)
      const identity = /email|client_ip|agent_|workflow_|session_id/.test(field)
      const privacy = privacyDisposition(
        dynamicOrRaw ? 'Potentially sensitive dynamic content' : identity ? 'Sensitive claim' : 'Operational metadata',
        '',
        field,
      )
      addNativeField({
        profile: 'llm-gateway',
        record,
        nativeField: field,
        nativeType: /has_|stream$/.test(field) ? 'boolean' : 'source-defined JSON scalar or collection',
        meaning: `Serialized ${record} semantic field ${field}`,
        sourceLocator: `macrodata-refinement/WORKERS/db_batch_writer/src/llmgateway_logs_v3.rs#${functionByRecord[record]}`,
        repository: 'macrodata-refinement',
        collectionState: 'SERIALIZED_OR_EMITTED',
        target: field === 'arguments_json'
          ? 'RAW_EVIDENCE_REFERENCE_ONLY'
          : /agent_|workflow_/.test(field)
            ? 'CANONICAL_INVENTORY_INPUT'
            : 'ACTIVITY_OR_EVIDENCE',
        privacy,
        sensitivity: dynamicOrRaw
          ? 'Potentially sensitive dynamic content'
          : identity ? 'Sensitive source-scoped claim' : 'Operational metadata',
        nullability: 'conditional',
        origin: 'Rust llmgateway_logs_v3 projector from api_request_logs/extra_data',
        directOrDerived: 'Derived',
        notes: /agent_|workflow_/.test(field)
          ? 'Optional instrumentation only; never assert universal agent visibility or merge with Endpoint without signed attribution.'
          : 'Only fields emitted by an explicit serializer are admitted; lexical keys elsewhere are excluded.',
      })
    }
  }
}

function loadMcpFields() {
  const syncPath = join(source.mcp, 'mcpgateway/clickhouse_sync_utils/syncer.py')
  const backendPath = join(source.mcp, 'mcpgateway/models/backend.py')
  const logPath = join(source.mcp, 'mcpgateway/models/log_models.py')
  const cacheRepoPath = join(source.mcp, 'mcpgateway/db/upstream_protocol_cache_repository.py')
  const syncText = readFileSync(requirePath(syncPath), 'utf8')
  const backendText = readFileSync(requirePath(backendPath), 'utf8')
  const logText = readFileSync(requirePath(logPath), 'utf8')

  for (const [listName, record] of [
    ['TOOL_COLUMNS', 'mcp_tool_calls_v2'],
    ['EVENT_COLUMNS', 'mcp_events_v2'],
    ['REJECTED_COLUMNS', 'mcp_rejected_requests_v2'],
  ]) {
    for (const field of pythonList(syncText, listName)) {
      const secretOrRaw = /encrypted|token|headers|arguments|response_content|(?:^|_)data$|metadata|message|error_message/.test(field)
      const identity = /user_email|client_ip|origin_host|referer_host|forwarded_host|agent_/.test(field)
      const privacy = privacyDisposition(
        secretOrRaw ? 'Potential secret or content' : identity ? 'Sensitive claim' : 'Operational metadata',
        '',
        field,
      )
      addNativeField({
        profile: 'mcp-gateway',
        record,
        nativeField: field,
        nativeType: 'ClickHouse source-defined',
        meaning: `Serialized MCP analytics field ${field}`,
        sourceLocator: `quilr-llm-gateway/mcpgateway/clickhouse_sync_utils/syncer.py#${listName}`,
        repository: 'quilr-llm-gateway',
        collectionState: 'SERIALIZED_OR_EMITTED',
        target: secretOrRaw
          ? privacy === 'PROHIBIT_SECRET' ? 'DISCARD_WITH_REASON' : 'RAW_EVIDENCE_REFERENCE_ONLY'
          : /backend|tool_name|tenant|agent_name/.test(field)
            ? 'CANONICAL_INVENTORY_INPUT'
            : 'ACTIVITY_OR_EVIDENCE',
        privacy,
        sensitivity: secretOrRaw
          ? 'Potential secret or customer content'
          : identity ? 'Sensitive source-scoped claim' : 'Operational metadata',
        nullability: 'source-defined',
        origin: 'SQLite source row → current syncer transformation → ClickHouse v2',
        directOrDerived: /_lc|counts|blocked|tenantless|keyword|host$/.test(field) ? 'Derived' : 'Direct or propagated',
        notes: /agent_keyword|agent_name/.test(field)
          ? 'Heuristic display evidence only; never sufficient for an agent entity or actor relationship.'
          : '',
      })
    }
  }

  for (const [className, record] of [
    ['BackendInfo', 'BackendInfo'],
    ['BackendCapabilities', 'BackendCapabilities'],
    ['ProbeResponse', 'ProbeResponse'],
  ]) {
    for (const field of pythonClassFields(backendText, className)) {
      const privacy = field.name === 'oauth_token_url'
        ? 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY'
        : field.name === 'requires_custom_oauth_credentials'
          ? 'ADMIT_MINIMIZED'
          : privacyDisposition(
              /user_id|tenant_id|url|error|settings|key/.test(field.name)
                ? 'Sensitive configuration'
                : 'Operational metadata',
              '',
              field.name,
            )
      addNativeField({
        profile: 'mcp-gateway',
        record,
        nativeField: field.name,
        nativeType: field.type,
        meaning: `Current MCP ${className} field ${field.name}`,
        sourceLocator: `quilr-llm-gateway/mcpgateway/models/backend.py#${className}.${field.name}`,
        repository: 'quilr-llm-gateway',
        collectionState: 'SERIALIZED_OR_EMITTED',
        target: field.name === 'oauth_token_url'
          ? 'RAW_EVIDENCE_REFERENCE_ONLY'
          : /id|name|transport|status|catalog|tenant|tools|resources|prompts|capabilities|auth/.test(field.name)
            ? 'CANONICAL_INVENTORY_INPUT'
            : 'CONFIGURATION_CLAIM',
        privacy,
        sensitivity: /user_id|tenant_id|url|error|settings|key/.test(field.name)
          ? 'Sensitive configuration'
          : 'Operational metadata',
        nullability: field.type.includes('Optional') ? 'nullable' : 'required',
        origin: 'Pydantic serialization',
        directOrDerived: 'Direct or propagated',
        notes: /error/.test(field.name) ? 'Coverage/fetch evidence; never a finding by itself.' : '',
      })
    }
  }

  for (const field of pythonClassFields(logText, 'ToolCallLog')) {
    const privacy = privacyDisposition(
      /token|headers|arguments|response_content|predictions|message|metadata/.test(field.name)
        ? 'Potential secret or customer content'
        : /user_email|transport_url/.test(field.name)
          ? 'Sensitive claim'
          : 'Operational metadata',
      '',
      field.name,
    )
    addNativeField({
      profile: 'mcp-gateway',
      record: 'ToolCallLog',
      nativeField: field.name,
      nativeType: field.type,
      meaning: `In-process MCP tool-call log field ${field.name}`,
      sourceLocator: `quilr-llm-gateway/mcpgateway/models/log_models.py#ToolCallLog.${field.name}`,
      repository: 'quilr-llm-gateway',
      collectionState: 'SERIALIZED_OR_EMITTED',
      target: privacy === 'PROHIBIT_SECRET'
        ? 'DISCARD_WITH_REASON'
        : privacy === 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY'
          ? 'RAW_EVIDENCE_REFERENCE_ONLY'
          : 'ACTIVITY_OR_EVIDENCE',
      privacy,
      sensitivity: /token|headers|arguments|response_content|predictions|message|metadata/.test(field.name)
        ? 'Potential secret or customer content'
        : 'Operational metadata',
      nullability: field.type.includes('Optional') ? 'nullable' : 'required',
      origin: 'Gateway handler/logging service',
      directOrDerived: 'Direct or propagated',
      notes: '',
    })
  }

  for (const [record, fields] of [
    ['upstream_initialize_capabilities', [
      'backend_id', 'auth_context_key', 'endpoint_fingerprint', 'protocol_version',
      'capabilities', 'fetched_at',
    ]],
    ['upstream_transport_features', [
      'backend_id', 'auth_context_key', 'endpoint_fingerprint',
      'standalone_get_supported', 'observed_at',
    ]],
  ]) {
    for (const field of fields) {
      const dynamic = field === 'capabilities'
      const privacy = privacyDisposition(
        /auth_context|endpoint_fingerprint/.test(field)
          ? 'Pseudonymous authorization/configuration token'
          : dynamic ? 'Dynamic capability document' : 'Operational metadata',
        '',
        field,
      )
      addNativeField({
        profile: 'mcp-gateway',
        record,
        nativeField: field,
        nativeType: dynamic ? 'JSON object' : field === 'standalone_get_supported' ? 'boolean?' : 'string',
        meaning: `Authorization-scoped MCP protocol observation ${field}`,
        sourceLocator: `quilr-llm-gateway/mcpgateway/db/upstream_protocol_cache_repository.py#${record}.${field}`,
        repository: 'quilr-llm-gateway',
        collectionState: 'LOCAL_SERIALIZED_OR_PERSISTED',
        target: /auth_context|endpoint_fingerprint/.test(field)
          ? 'RELATIONSHIP_SCOPE_TOKEN'
          : /backend_id|protocol_version|capabilities/.test(field)
            ? 'CANONICAL_INVENTORY_INPUT'
            : 'CONFIGURATION_CLAIM',
        privacy,
        sensitivity: /auth_context|endpoint_fingerprint/.test(field)
          ? 'Pseudonymous source-scoped token'
          : dynamic ? 'Configuration capability document' : 'Operational metadata',
        nullability: field === 'standalone_get_supported' ? 'nullable' : 'required',
        origin: 'Current MCP protocol cache',
        directOrDerived: /key|fingerprint/.test(field) ? 'Derived hash' : 'Direct or propagated',
        notes: 'Capability identity and EXPOSES relationships must retain backend + authorization context '
          + '+ endpoint fingerprint + protocol version scope.',
      })
    }
  }
  requirePath(cacheRepoPath)
}

function walkFiles(root, current = root) {
  return readdirSync(current, { withFileTypes: true }).flatMap(entry => {
    const full = join(current, entry.name)
    const rel = relative(root, full)
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'target')
        return []
      return walkFiles(root, full)
    }
    if (rel === '.pinned-revision' || rel === '.tsconfig.check.tsbuildinfo')
      return []
    return [rel]
  })
}

function compareDirectories(oldRoot, newRoot, profile, component) {
  requirePath(oldRoot)
  requirePath(newRoot)
  const oldFiles = new Set(walkFiles(oldRoot))
  const newFiles = new Set(walkFiles(newRoot))
  const all = [...new Set([...oldFiles, ...newFiles])].sort()
  return all.flatMap(file => {
    const oldPath = join(oldRoot, file)
    const newPath = join(newRoot, file)
    const oldExists = existsSync(oldPath)
    const newExists = existsSync(newPath)
    if (oldExists && newExists && fileSha256(oldPath) === fileSha256(newPath))
      return []
    const status = oldExists && newExists ? 'M' : newExists ? 'A' : 'D'
    return [deltaRow(profile, component, status, file)]
  })
}

function deltaRow(profile, component, status, file) {
  let classification = 'IMPLEMENTATION_CHANGE'
  if (/(^|\/)(test|tests|e2e_test)\//.test(file) || /test_.*\.py$|\.test\./.test(file))
    classification = 'TEST_CHANGE'
  else if (/README|docs\/|for_coding_agents/.test(file))
    classification = 'DOCUMENTATION_CHANGE'
  else if (/package|lock|Cargo|requirements|Jenkins|\.github|tsconfig|jest|application\.yml|managed_schema|host-extensions/.test(file))
    classification = 'BUILD_CONFIGURATION_CHANGE'
  else if (/tsbuildinfo$/.test(file))
    classification = 'GENERATED_ARTIFACT_CHANGE'

  let disposition = 'NO_PROFILE_CONTRACT_CHANGE'
  let reason = 'No new serialized discovery, inventory, activity, or evidence datum identified.'
  const browserMaterial = [
    'src/core/LogDrop/PackageLog/index.ts',
    'src/core/LogDrop/PackageExtensionLogs/index.ts',
    'src/types/request.interceptor.d.ts',
    'src/types/diagnostic.d.ts',
    'src/core/contents/DiagnosticService/diagnosticContentCollector.ts',
    'src/core/persona/ManagedPersona.ts',
    'src/core/contents/personaEmailWatcher.ts',
    'src/background/InternalMessages/personaEmailFound.ts',
    'src/background/InternalMessages/loginControlVerdict.ts',
    'src/core/contents/LoginControl/',
    'src/core/mainWorldContent/LoginControl/',
  ]
  if (profile === 'browser' && browserMaterial.some(item => file === item || file.startsWith(item))) {
    disposition = 'RECONCILED_IN_DELTA_FIELD_ADDENDUM'
    reason = 'Adds or changes source-native identity, decision, diagnostic, or emitted log semantics.'
  }
  if (profile === 'browser-backend' && /GraphUpdateController|GraphUpdateService/.test(file)) {
    disposition = 'OUT_OF_PASS_LEGACY_CONTROL_SECURITY_REVIEW'
    reason = 'Adds a legacy mutation path, not a discovery/evidence producer contract.'
  }
  if (profile === 'mcp-gateway' && /upstream_protocol_cache|mcp_protocol_cache|mcp_streamable_http|mcp_capabilities|routes\/mcp|services\/registry/.test(file)) {
    disposition = 'RECONCILED_IN_DELTA_FIELD_ADDENDUM'
    reason = 'Changes authorization-scoped capability and transport-observation semantics.'
  }
  if (classification === 'TEST_CHANGE')
    reason = 'Test evidence reviewed; no independent production field authority.'
  if (classification === 'DOCUMENTATION_CHANGE')
    reason = 'Documentation is not executable source authority.'
  return {
    profile,
    component,
    status,
    path: file,
    classification,
    disposition,
    reason,
  }
}

function currentDeltaRows() {
  const rows = [
    ...compareDirectories(baseline.browser, source.browser, 'browser', 'Project-Vanguard'),
    ...compareDirectories(baseline.browserNative, source.browserNative, 'browser', 'project-sentinel'),
    ...compareDirectories(
      baseline.browserBackend,
      source.browserBackend,
      'browser-backend',
      'browser-extension-service',
    ),
  ]
  const mcpDiff = execFileSync(
    'git',
    [
      '-C', source.mcp,
      'diff', '--name-status',
      '1b2f2b399c4ac8cacb71aa3ff434d84122d88d7a..99f759d75aa8260f97db6904433c941647a755e5',
      '--', 'mcpgateway',
    ],
    { encoding: 'utf8' },
  )
  for (const line of mcpDiff.trim().split('\n').filter(Boolean)) {
    const [status, path] = line.split('\t')
    rows.push(deltaRow('mcp-gateway', 'quilr-llm-gateway', status, path))
  }
  return rows.sort((a, b) => `${a.profile}/${a.path}`.localeCompare(`${b.profile}/${b.path}`))
}

function buildRecords() {
  const groups = new Map()
  for (const field of nativeFields) {
    const key = `${field.profile}\u001f${field.record_type}`
    if (!groups.has(key)) {
      groups.set(key, {
        record_id: stableId('record', field.profile, field.record_type),
        profile_id: field.profile_id,
        profile: field.profile,
        record_type: field.record_type,
        field_count: 0,
        collection_states: new Set(),
        target_dispositions: new Set(),
        source_revisions: new Set(),
        repositories: new Set(),
        evidence_statuses: new Set(),
      })
    }
    const row = groups.get(key)
    row.field_count += 1
    row.collection_states.add(field.collection_state)
    row.target_dispositions.add(field.target_disposition)
    row.source_revisions.add(field.source_revision)
    row.repositories.add(field.repository)
    row.evidence_statuses.add(field.evidence_status)
  }
  return [...groups.values()].map(row => ({
    ...row,
    collection_states: [...row.collection_states].sort().join(';'),
    target_dispositions: [...row.target_dispositions].sort().join(';'),
    source_revisions: [...row.source_revisions].sort().join(';'),
    repositories: [...row.repositories].sort().join(';'),
    evidence_statuses: [...row.evidence_statuses].sort().join(';'),
  })).sort((a, b) => `${a.profile}/${a.record_type}`.localeCompare(`${b.profile}/${b.record_type}`))
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`
}

const sourceCheckoutByRepository = {
  'Project-Vanguard': source.browser,
  'project-sentinel': source.browserNative,
  'browser-extension-service': source.browserBackend,
  'sentinel-endpoint-agent': source.endpoint,
  'macrodata-refinement': source.llm,
  'quilr-llm-gateway': source.mcp,
}

function sourcePathFromLocator(locator, repository) {
  const matches = String(locator).match(
    /[A-Za-z0-9_.@+-]+(?:\/[A-Za-z0-9_.@+-]+)+\.(?:d\.ts|tsx|ts|mjs|js|rs|py|java|kt|go|proto|sql|yaml|yml|json|toml|xml|gradle|properties)/g,
  ) ?? []
  for (let candidate of matches) {
    if (candidate.startsWith(`${repository}/`))
      candidate = candidate.slice(repository.length + 1)
    const checkout = sourceCheckoutByRepository[repository]
    if (checkout && existsSync(join(checkout, candidate)))
      return candidate
  }
  return ''
}

function sourceSearchToken(field) {
  const checkout = sourceCheckoutByRepository[field.repository]
  const candidates = [
    field.native_field,
    field.native_field.replaceAll('[]', ''),
    ...field.native_field
      .replaceAll('[]', '')
      .split(/[.:[\]]+/)
      .reverse(),
  ].filter((value, index, values) =>
    value.length >= 3 && values.indexOf(value) === index)
  for (const candidate of candidates) {
    try {
      execFileSync(
        'git',
        ['-C', checkout, 'grep', '-n', '-F', '--', candidate, field.source_revision],
        { stdio: 'ignore' },
      )
      return candidate
    }
    catch {
      // Try the next exact serialized/native-name component.
    }
  }
  fail(
    `no pinned-revision source search token for `
    + `${field.profile}/${field.record_type}.${field.native_field}`,
  )
}

function buildAccessRecipes() {
  const groups = new Map()
  for (const field of nativeFields) {
    if (!groups.has(field.access_recipe_id)) {
      const sourcePath = sourcePathFromLocator(field.source_locator, field.repository)
      const checkout = `$CONSOLIDATE_ROOT/Org-Recon-2026-07-30/${field.repository}`
      const searchToken = sourcePath ? '' : sourceSearchToken(field)
      const retrieval = sourcePath
        ? `git -C "${checkout}" show ${shellQuote(`${field.source_revision}:${sourcePath}`)}`
        : [
            `node tools/query-lg008-authority.mjs --field-id ${shellQuote(field.global_field_id)}`,
            `git -C "${checkout}" grep -n -F -- ${shellQuote(searchToken)} ${shellQuote(field.source_revision)}`,
          ].join(' && ')
      groups.set(field.access_recipe_id, {
        access_recipe_id: field.access_recipe_id,
        profile: field.profile,
        record_type: field.record_type,
        repository: field.repository,
        source_revision: field.source_revision,
        source_locator: field.source_locator,
        authorization: 'Authorized quilrbusiness source-repository reader; set CONSOLIDATE_ROOT to the source-evidence workspace root. Customer runtime access is a separate tenant-scoped product authorization.',
        retrieval_or_reproduction: retrieval,
        expected_evidence: sourcePath
          ? `Pinned source file ${field.repository}/${sourcePath}; locate ${field.native_field} or the source_locator symbol within it.`
          : `The authority row and pinned-revision source matches for ${searchToken}; use source_locator to disambiguate ${field.native_field} declarations, serializers, writers, or persistence paths.`,
        freshness_and_retention: `Pinned source revision ${field.source_revision}; runtime retention is source-record specific.`,
        field_ids: [],
      })
    }
    groups.get(field.access_recipe_id).field_ids.push(field.global_field_id)
  }
  return [...groups.values()].map(row => ({
    ...row,
    field_ids: row.field_ids.sort().join(';'),
  })).sort((a, b) => a.access_recipe_id.localeCompare(b.access_recipe_id))
}

function schemaPayloads(profile, schema) {
  if (profile === 'browser-backend') {
    return (schema.properties?.kind?.enum ?? []).map(kind => ({
      payload_kind: kind,
      required: new Set(schema.required ?? []),
      properties: schema.properties ?? {},
    }))
  }
  return Object.entries(schema.$defs ?? {})
    .filter(([, value]) => value && value.type === 'object' && value.properties)
    .map(([name, value]) => ({
      payload_kind: name,
      required: new Set(value.required ?? []),
      properties: value.properties ?? {},
    }))
}

function fieldNameCandidates(field) {
  const candidates = new Set([field.toLowerCase()])
  candidates.add(field.replace(/_source_id$/, '_id').toLowerCase())
  candidates.add(field.replace(/_source_id$/, '').toLowerCase())
  candidates.add(field.replace(/_token$/, '').toLowerCase())
  const aliases = {
    display_name: ['name', 'app_name', 'backend_name'],
    hostname: ['user.hostname', 'hostname'],
    machine_id: ['machinename', 'device_id', 'machine_id'],
    device_source_id: ['device', 'device_id', 'machinename'],
    account_name: ['accountname', 'account_name'],
    browser_family: ['browser.name', 'browsername'],
    component_version: ['extension.version', 'extensionversion', 'version'],
    application_id: ['application.name', 'app_name', 'application_id'],
    provider_model_id: ['model_name', 'provider_model_id'],
    model_source_id: ['model_name', 'model_source_id'],
    route_source_id: ['routing_group_id', 'route_name'],
    tool_source_id: ['tool_name'],
    server_source_id: ['backend_id', 'server_id'],
    actor_source_id: ['user_email', 'user_id'],
    latency_ms: ['duration_ms', 'total_latency_ms'],
    time_to_first_token_ms: ['first_response_time_ms'],
    cached_input_tokens: ['cache_read_tokens'],
    was_blocked: ['is_blocked_by_quilr', 'blocked'],
    was_anonymized: ['is_anonymized_by_quilr'],
    safe_description: ['description'],
    input_schema_digest: ['inputschema', 'input_schema'],
    configuration_scope_token: ['auth_context_key', 'scope'],
    authorization_context_token: ['auth_context_key'],
    endpoint_configuration_token: ['endpoint_fingerprint'],
    protocol_version: ['mcp_protocol_version', 'protocol_version'],
    authentication_context: ['authenticationtype', 'authentication_type', 'loginstatus', 'login_status'],
    origin: ['url', 'hostname', 'domain'],
    file_count: ['filecount', 'files', 'uploadedfiles'],
    surface: ['called_via', 'transport_type', 'content_type', 'mcp_method', 'method'],
    activity_type: ['event_type', 'mcp_method', 'method', 'called_via', 'type'],
    entity_type: ['source_table', 'schema_version', 'type'],
    decision: ['guardrails_outcome', 'dlp_input_outcome', 'dlp_output_outcome', 'blocked', 'action'],
    effect: ['is_blocked_by_quilr', 'is_anonymized_by_quilr', 'blocked', 'response_success', 'action'],
  }
  for (const alias of aliases[field] ?? [])
    candidates.add(alias.toLowerCase())
  return candidates
}

function buildTargetTraceability() {
  const rows = []
  const newCaptureKinds = new Set([
    'browser/localBinding', 'browser/snapshot', 'browser/gap',
    'browser-backend/reconciliation_snapshot', 'browser-backend/publication_gap',
    'endpoint/snapshot', 'endpoint/gap',
    'llm-gateway/crossSensorAttribution', 'llm-gateway/snapshot', 'llm-gateway/gap',
    'mcp-gateway/crossSensorAttribution', 'mcp-gateway/snapshot', 'mcp-gateway/gap',
  ])
  const envelopeFields = new Set([
    'kind', 'operation', 'stage', 'lifecycle', 'status', 'state', 'reason_code',
    'completeness', 'source_revision', 'page_sequence', 'page_count', 'cursor',
    'expected_count', 'observed_count', 'snapshot_digest', 'from', 'to',
    'estimated_records', 'component', 'capability', 'capabilities', 'surfaces',
    'transports', 'scope_type', 'members', 'safe_labels', 'labels',
  ])
  const contractDerivedFields = new Set([
    'activity_type', 'decision', 'effect', 'entity_type', 'object_type',
    'predicate', 'semantic', 'subject_type', 'surface',
  ])
  const adapterComputedFields = new Set([
    'file_count', 'snapshot_watermark',
  ])
  const edgeOwnedPayloads = new Set([
    'browser/bindingSignature',
    'browser/endpointDeviceRef',
    'browser/endpointIdentityRef',
    'llm-gateway/attributionSignature',
    'mcp-gateway/attributionSignature',
  ])
  for (const profile of Object.keys(profileIds)) {
    const schemaPath = join(freezeRoot, 'schemas', `profile-${profile}-v1.schema.json`)
    const schema = JSON.parse(readFileSync(requirePath(schemaPath), 'utf8'))
    const profileFields = nativeFields.filter(row => row.profile === profile)
    for (const payload of schemaPayloads(profile, schema)) {
      for (const field of Object.keys(payload.properties)) {
        const candidates = fieldNameCandidates(field)
        const matched = profileFields.filter(native => {
          const nativeName = native.native_field.toLowerCase()
          const tail = nativeName.split('.').at(-1)
          return candidates.has(nativeName) || candidates.has(tail)
        })
        const payloadKey = `${profile}/${payload.payload_kind}`
        let supportState
        let derivation
        if (newCaptureKinds.has(payloadKey)) {
          supportState = 'NEW_CAPTURE_REQUIRED_BY_FROZEN_CONTRACT'
          derivation = 'Edge Runtime, signed attribution, snapshot, or gap instrumentation defined by the capability disposition.'
        }
        else if (edgeOwnedPayloads.has(payloadKey)) {
          supportState = 'EDGE_RUNTIME_OR_ADAPTER_ENVELOPE'
          derivation = 'Produced and verified by the frozen Edge Runtime binding/signature contract; it is not asserted as a native sensor observation.'
        }
        else if (matched.length) {
          supportState = 'SOURCE_SUPPORTED'
          derivation = 'Direct or bounded adapter derivation from the cited source-native fields.'
        }
        else if (profile === 'browser' && payload.payload_kind === 'application' && field === 'origin') {
          supportState = 'CONTRACT_BOUNDED_DERIVATION'
          derivation = 'Reduce a captured application URL/domain to scheme and authority; reject user info, path, query and fragment.'
        }
        else if (contractDerivedFields.has(field)) {
          supportState = 'CONTRACT_BOUNDED_DERIVATION'
          derivation = 'Deterministic allowlisted mapping from the source record/event kind through frozen profile and relationship rules; unknown values remain unknown or are quarantined.'
        }
        else if (adapterComputedFields.has(field)) {
          supportState = 'CONTRACT_BOUNDED_DERIVATION'
          derivation = field === 'file_count'
            ? 'Count the captured uploadedFiles/files array after privacy filtering; never infer file content.'
            : 'Monotonic adapter/Edge Runtime snapshot checkpoint, scoped to producer, profile and component.'
        }
        else if (envelopeFields.has(field)) {
          supportState = 'EDGE_RUNTIME_OR_ADAPTER_ENVELOPE'
          derivation = 'Typed profile discriminator, lifecycle state, pagination, or coverage metadata—not a fabricated sensor fact.'
        }
        else if (/(_source_id|_id)$/.test(field)) {
          supportState = 'ADAPTER_SOURCE_ID'
          derivation = 'Deterministic source-scoped ID over stable native keys; never a canonical entity ID.'
        }
        else if (payload.required.has(field)) {
          supportState = 'REQUIRED_DERIVATION_REVIEW'
          derivation = 'Required target field has no direct lexical match and must be justified manually.'
        }
        else {
          supportState = 'OPTIONAL_NOT_CURRENTLY_SOURCED'
          derivation = 'The adapter must omit this optional field until a cited source path or new certified capture supplies it.'
        }
        rows.push({
          trace_id: stableId('target-trace', profile, payload.payload_kind, field),
          profile,
          payload_kind: payload.payload_kind,
          target_field: field,
          required: payload.required.has(field) ? 'YES' : 'NO',
          support_state: supportState,
          source_field_ids: matched.map(row => row.global_field_id).join(';'),
          derivation,
          evidence: matched.map(row => `${row.repository}@${row.source_revision}:${row.source_locator}`).join(' | '),
        })
      }
    }
  }
  return rows.sort((a, b) =>
    `${a.profile}/${a.payload_kind}/${a.target_field}`
      .localeCompare(`${b.profile}/${b.payload_kind}/${b.target_field}`),
  )
}

function profileAdmissionRows(records, traceability, deltas) {
  return Object.keys(profileIds).map(profile => {
    const fields = nativeFields.filter(row => row.profile === profile)
    const profileRecords = records.filter(row => row.profile === profile)
    const traces = traceability.filter(row => row.profile === profile)
    const delta = deltas.filter(row => row.profile === profile)
    return {
      profile_id: profileIds[profile],
      profile,
      admission_state: traces.some(row => row.support_state === 'REQUIRED_DERIVATION_REVIEW')
        ? 'REJECTED_REQUIRED_TRACE_GAP'
        : 'ACCEPTED_STATIC_SOURCE_AUTHORITY',
      repositories: Object.keys(revisions[profile]).join(';'),
      selected_revisions: Object.entries(revisions[profile])
        .map(([repository, revision]) => `${repository}@${revision}`)
        .join(';'),
      native_records: profileRecords.length,
      native_fields: fields.length,
      serialized_or_emitted_fields: fields.filter(row =>
        ['SERIALIZED_OR_EMITTED', 'LOCAL_SERIALIZED_OR_PERSISTED']
          .includes(row.collection_state),
      ).length,
      prohibited_or_restricted_fields: fields.filter(row =>
        ['PROHIBIT_SECRET', 'RESTRICTED_RAW_EVIDENCE_REFERENCE_ONLY']
          .includes(row.privacy_disposition),
      ).length,
      target_fields: traces.length,
      optional_unsourced_target_fields: traces
        .filter(row => row.support_state === 'OPTIONAL_NOT_CURRENTLY_SOURCED').length,
      current_delta_files: delta.length,
      current_delta_files_requiring_addendum: delta
        .filter(row => row.disposition === 'RECONCILED_IN_DELTA_FIELD_ADDENDUM').length,
      proof_boundary: 'Static source and executable artifact authority; native runtime golden certification remains LG-005.',
    }
  })
}

function writeAuthority() {
  Object.values(analysis).forEach(requirePath)
  Object.values(source).forEach(requirePath)
  Object.values(baseline).forEach(requirePath)
  mkdirSync(outputRoot, { recursive: true })

  loadBrowserFields()
  loadBrowserBackendFields()
  loadEndpointFields()
  addDeltaFields()
  loadLlmFields()
  loadMcpFields()

  const duplicateIds = nativeFields
    .map(row => row.global_field_id)
    .filter((id, index, all) => all.indexOf(id) !== index)
  if (duplicateIds.length)
    fail(`duplicate global native field IDs: ${[...new Set(duplicateIds)].join(', ')}`)

  nativeFields.sort((a, b) =>
    `${a.profile}/${a.record_type}/${a.native_field}/${a.source_locator}`
      .localeCompare(`${b.profile}/${b.record_type}/${b.native_field}/${b.source_locator}`),
  )
  const records = buildRecords()
  const recipes = buildAccessRecipes()
  const deltas = currentDeltaRows()
  const traceability = buildTargetTraceability()
  const admissions = profileAdmissionRows(records, traceability, deltas)

  writeCsv(join(outputRoot, 'native-field-disposition.csv'), [
    'global_field_id', 'profile_id', 'profile', 'record_type', 'native_field',
    'native_type', 'meaning', 'repository', 'source_revision', 'source_locator',
    'collection_state', 'target_disposition', 'privacy_disposition', 'sensitivity',
    'nullability', 'unit', 'origin', 'direct_or_derived', 'evidence_status',
    'source_availability', 'access_recipe_id', 'notes',
  ], nativeFields)
  writeCsv(join(outputRoot, 'record-catalog.csv'), [
    'record_id', 'profile_id', 'profile', 'record_type', 'field_count',
    'collection_states', 'target_dispositions', 'source_revisions', 'repositories',
    'evidence_statuses',
  ], records)
  writeCsv(join(outputRoot, 'access-recipes.csv'), [
    'access_recipe_id', 'profile', 'record_type', 'repository', 'source_revision',
    'source_locator', 'authorization', 'retrieval_or_reproduction',
    'expected_evidence', 'freshness_and_retention', 'field_ids',
  ], recipes)
  writeCsv(join(outputRoot, 'current-source-delta-files.csv'), [
    'profile', 'component', 'status', 'path', 'classification', 'disposition', 'reason',
  ], deltas)
  writeCsv(join(outputRoot, 'target-field-traceability.csv'), [
    'trace_id', 'profile', 'payload_kind', 'target_field', 'required',
    'support_state', 'source_field_ids', 'derivation', 'evidence',
  ], traceability)
  writeCsv(join(outputRoot, 'profile-admission.csv'), [
    'profile_id', 'profile', 'admission_state', 'repositories', 'selected_revisions',
    'native_records', 'native_fields', 'serialized_or_emitted_fields',
    'prohibited_or_restricted_fields', 'target_fields',
    'optional_unsourced_target_fields', 'current_delta_files',
    'current_delta_files_requiring_addendum', 'proof_boundary',
  ], admissions)

  const inputFiles = [
    join(analysis.browser, 'native-fields.csv'),
    join(analysis.browserBackend, 'native-fields.csv'),
    join(analysis.endpoint, 'native-fields.csv'),
    join(analysis.endpoint, 'native-record-types.csv'),
    join(analysis.endpoint, 'product-disposition.csv'),
    join(source.llm, 'WORKERS/db_batch_writer/src/rows.rs'),
    join(source.llm, 'WORKERS/db_batch_writer/src/llmgateway_logs_v3.rs'),
    join(source.mcp, 'mcpgateway/clickhouse_sync_utils/syncer.py'),
    join(source.mcp, 'mcpgateway/models/backend.py'),
    join(source.mcp, 'mcpgateway/models/log_models.py'),
    join(source.mcp, 'mcpgateway/db/upstream_protocol_cache_repository.py'),
  ]
  const generatedFiles = [
    'native-field-disposition.csv',
    'record-catalog.csv',
    'access-recipes.csv',
    'current-source-delta-files.csv',
    'target-field-traceability.csv',
    'profile-admission.csv',
  ]
  const manifest = {
    authority_version: 'lg008-five-profile-source-authority/1.0.0',
    generated_at: generatedDate,
    source_cutoff: revisions,
    source_profiles: admissions,
    inputs: inputFiles.map(path => ({
      path: relative(consolidateRoot, path),
      sha256: fileSha256(path),
    })),
    generated_files: Object.fromEntries(
      generatedFiles.map(file => [file, fileSha256(join(outputRoot, file))]),
    ),
    counts: {
      profiles: admissions.length,
      records: records.length,
      native_fields: nativeFields.length,
      access_recipes: recipes.length,
      target_fields: traceability.length,
      current_delta_files: deltas.length,
      required_derivation_gaps: traceability
        .filter(row => row.support_state === 'REQUIRED_DERIVATION_REVIEW').length,
      rejected_profiles: admissions
        .filter(row => row.admission_state !== 'ACCEPTED_STATIC_SOURCE_AUTHORITY').length,
    },
    supersedes: [
      'Browser package two-profile global reconciliation closure state',
      'Endpoint generated assertion that every native field is observable_and_collected',
      'LLM Gateway 26,292-row lexical-key field catalog',
      'MCP Gateway historical 1b2f2b399c4a access/field reconciliation',
    ],
    assurance_boundary: {
      proven: 'Static source, schema, serializer, persistence, delta, disposition, and target traceability.',
      not_claimed: 'Native runtime capture certification, rollout reachability, or customer production behavior.',
      remaining_gate: 'LG-005 native golden certification and LG-006 cross-language wire/signature vectors.',
    },
  }
  writeFileSync(
    join(outputRoot, 'authority-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  console.log(JSON.stringify(manifest.counts))
}

writeAuthority()

#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
const freezeRoot = resolve(executionRoot, '..')

const SHA = /^[0-9a-f]{40}$/
const DIGEST = /^sha256:[0-9a-f]{64}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const COMPONENT_ID = /^[a-z][a-z0-9_-]{2,63}$/
const PROFILE_ID = /^[a-z][a-z0-9_.-]{0,127}$/
const PROFILE_VERSION = /^[1-9][0-9]*\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
const SAFE_SOURCE_PATH_REF = /^(?!\/)(?!.*\.\.)(?!.*\\)[A-Za-z0-9_.\/-]+\.ya?ml$/
const SAFE_EVIDENCE_FILE_REF = /^(?!\/)(?!.*\\)[A-Za-z0-9_./-]+$/
const SOURCE_PATH_STATES = new Set([
  'UNASSIGNED', 'UNKNOWN', 'SOURCE_PROVEN', 'MISSING_PRODUCT_CODE',
  'EXTERNAL_INPUT_REQUIRED', 'INSTALLED_UNOBSERVED', 'INSTALLED_OBSERVED', 'COHERENT_E2E',
])
const SOURCE_COMPONENT_KINDS = new Set([
  'browser_extension', 'browser_native_host', 'browser_backend',
  'endpoint_agent', 'endpoint_monitor', 'endpoint_proxy', 'endpoint_ipc_broker',
  'endpoint_template_engine', 'endpoint_system_extension', 'endpoint_network_extension',
  'gateway_service', 'sidecar', 'connector',
])
const SOURCE_PREREQUISITE_CLASSES = new Set([
  'PRODUCT_CODE', 'EXTERNAL_CREDENTIAL', 'EXTERNAL_INFRASTRUCTURE',
  'PRIVILEGED_USER_ACTION', 'DESTRUCTIVE_APPROVAL', 'CONTRACT_CONTRADICTION',
  'UNKNOWN_AFTER_EXHAUSTIVE_SEARCH',
])
const SOURCE_PREREQUISITE_STATES = new Set(['MISSING', 'AVAILABLE', 'SATISFIED', 'NOT_APPLICABLE'])
const SOURCE_ENROLLMENT_STATES = new Set([
  'UNASSIGNED', 'MISSING_PRODUCT_CODE', 'EXTERNAL_INPUT_REQUIRED', 'SOURCE_PROVEN', 'RUNTIME_OBSERVED',
])
const SOURCE_OWNERSHIP = new Set(['originating', 'supporting', 'relay_only'])
const SOURCE_TENANT_INPUT_KINDS = new Set([
  'UNASSIGNED', 'organization_tenant_uuid', 'platform_tenant_binding',
])
const SOURCE_EVIDENCE_KINDS = new Set([
  'UNASSIGNED',
  'installation_documentation', 'installation_artifact', 'installation_command',
  'package_build_evidence', 'package_install_manifest',
  'installation_observation', 'enrollment_observation', 'component_installed_artifact',
  'component_installation_observation', 'component_configuration_observation',
  'native_capture_observation', 'wal_observation', 'sender_observation',
  'ingest_receipt', 'prerequisite_observation', 'general',
])
const REQUIRED_PROHIBITED_BYPASSES = new Set([
  'fixed_shared_identity_or_token',
  'second_tenant_or_persona_shim',
  'manual_storage_or_devtools_injection',
  'manual_plist_env_or_sql_override',
  'alternate_or_parallel_daemon',
  'fake_dirty_or_mixed_artifact_provenance',
  'fixture_interior_stage',
  'normal_entrypoint_bypass',
])
const SOURCE_COMPONENT_REQUIREMENTS = new Map([
  ['browser', [
    ['browser_extension'],
    ['browser_native_host'],
  ]],
  ['browser_backend', [['browser_backend']]],
  ['endpoint', [
    ['endpoint_agent'],
    ['endpoint_monitor'],
    ['endpoint_proxy'],
    ['endpoint_ipc_broker'],
    ['endpoint_template_engine'],
    ['endpoint_system_extension', 'endpoint_network_extension'],
  ]],
  ['llm_gateway', [['gateway_service']]],
  ['mcp_gateway', [['gateway_service']]],
])
const SOURCE_COMPONENT_ALLOWED = new Map([
  ['browser', new Set(['browser_extension', 'browser_native_host'])],
  ['browser_backend', new Set(['browser_backend'])],
  ['endpoint', new Set([
    'endpoint_agent', 'endpoint_monitor', 'endpoint_proxy', 'endpoint_ipc_broker',
    'endpoint_template_engine', 'endpoint_system_extension', 'endpoint_network_extension',
  ])],
  ['llm_gateway', new Set(['gateway_service', 'sidecar'])],
  ['mcp_gateway', new Set(['gateway_service', 'sidecar'])],
])
const RUNTIME_MODES = new Set([
  'NONE',
  'DEV_PREVIEW',
  'COHERENT_LOCAL_PRODUCT',
  'ISOLATED_INTEGRATION',
  'RELEASE_CANDIDATE',
])
const COHERENT_MODES = new Set([
  'COHERENT_LOCAL_PRODUCT',
  'ISOLATED_INTEGRATION',
  'RELEASE_CANDIDATE',
])
const COMPONENT_ROLES = new Set([
  'ingest', 'normalizer', 'truth', 'projector', 'api', 'maintenance',
  'bff', 'ui', 'browser', 'browser_backend', 'endpoint', 'llm_gateway', 'mcp_gateway',
  'connector_runner', 'connector_webhook', 'connector_poller', 'connector_cdc',
])
const LAUNCH_PROFILES = new Set(['browser', 'browser_backend', 'endpoint', 'llm_gateway', 'mcp_gateway'])
const EXTENSION_COMPONENT_ROLES = new Set([
  'connector_runner', 'connector_webhook', 'connector_poller', 'connector_cdc',
])
const CREDENTIAL_CLASSES = new Set([
  'preview_synthetic', 'dpop_jwt', 'mtls', 'workload_jwt', 'oidc_workload', 'platform_signed',
])
const CREDENTIAL_ISSUER_CLASSES = new Set(['preview_synthetic', 'starliner_control', 'external_oidc', 'platform_pki'])
const PROVENANCE = new Set(['exact_source_build', 'signed_artifact', 'immutable_image_digest'])
const INSTALLATION_CLASSES = new Set([
  'package', 'browser_extension', 'container_image', 'compiled_binary', 'managed_service',
])
const SUPERVISORS = new Set([
  'launchd', 'systemd', 'kubernetes', 'docker', 'browser_runtime', 'process_manager', 'managed_service',
])
const TOP_LEVEL_KEYS = new Set([
  'schema_version', 'schema', 'manifest_id', 'candidate_digest', 'environment_id',
  'runtime_mode', 'authority_commit', 'generated_contract_digest', 'database_migration_digest',
  'configuration_digest', 'tenant_authority', 'components', 'stores', 'producers',
  'profile_registry',
  'customer_endpoints', 'contamination', 'created_at', 'started_at', 'evidence_ref',
  'limitations',
])

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactKeys(value, expected, path, errors) {
  if (!object(value)) {
    errors.push(`${path} must be an object`)
    return
  }
  for (const key of expected) {
    if (!(key in value))
      errors.push(`${path} omits ${key}`)
  }
  for (const key of Object.keys(value)) {
    if (!expected.has(key))
      errors.push(`${path} contains unknown key ${key}`)
  }
}

function nonPlaceholder(value) {
  return typeof value === 'string' && value.length > 0 && value !== 'UNASSIGNED'
}

function httpUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//.test(value))
    return false
  try {
    const parsed = new URL(value)
    return Boolean(parsed.hostname)
  }
  catch {
    return false
  }
}

function safeEvidenceRef(value) {
  return nonPlaceholder(value)
    && SAFE_EVIDENCE_FILE_REF.test(value)
    && !value.split('/').includes('..')
}

function uniqueStringArray(value, path, errors, { nonempty = false, refs = false } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`)
    return false
  }
  if (nonempty && value.length === 0)
    errors.push(`${path} must not be empty`)
  if (value.some(item => typeof item !== 'string' || !item))
    errors.push(`${path} must contain only non-empty strings`)
  if (refs && value.some(item => !safeEvidenceRef(item)))
    errors.push(`${path} must contain only safe relative references`)
  if (new Set(value).size !== value.length)
    errors.push(`${path} must not contain duplicates`)
  return true
}

function expectedLogicalSensor(profile) {
  return LAUNCH_PROFILES.has(profile) ? profile : 'connector'
}

function sourceComponentRequirements(profile) {
  return SOURCE_COMPONENT_REQUIREMENTS.get(profile) || [['connector']]
}

function sourceComponentAllowed(profile) {
  return SOURCE_COMPONENT_ALLOWED.get(profile) || new Set(['connector', 'sidecar'])
}

function sourcePathContextEntry(context, reference) {
  if (context?.sourceProductPaths instanceof Map)
    return context.sourceProductPaths.get(reference)
  if (object(context?.sourceProductPaths))
    return context.sourceProductPaths[reference]
  return undefined
}

function requireSourceEvidenceBinding(reference, expectedKind, path, bindingsByRef, errors) {
  if (!safeEvidenceRef(reference)) {
    errors.push(`${path} must be a safe relative retained-evidence file reference`)
    return
  }
  const binding = bindingsByRef.get(reference)
  if (!binding) {
    errors.push(`${path} is not backed by source_product_path.evidence_bindings: ${reference}`)
    return
  }
  if (binding.evidence_kind !== expectedKind) {
    errors.push(
      `${path} requires evidence_kind ${expectedKind}, got ${binding.evidence_kind}`,
    )
  }
}

function resolveSourceEvidenceBindings(binding, evidenceRoot) {
  const errors = []
  let rootReal
  try {
    rootReal = realpathSync(evidenceRoot)
  }
  catch (error) {
    return [`source evidence root cannot be resolved: ${error.message}`]
  }

  for (const [index, evidence] of (binding.evidence_bindings || []).entries()) {
    const path = `source_product_path.evidence_bindings[${index}]`
    if (!object(evidence) || !safeEvidenceRef(evidence.ref))
      continue
    const candidate = resolve(rootReal, evidence.ref)
    const lexicalRelative = relative(rootReal, candidate)
    if (lexicalRelative.startsWith('..') || isAbsolute(lexicalRelative)) {
      errors.push(`${path}.ref escapes the manifest evidence root: ${evidence.ref}`)
      continue
    }
    if (!existsSync(candidate)) {
      errors.push(`${path}.ref does not exist: ${evidence.ref}`)
      continue
    }
    let candidateReal
    try {
      candidateReal = realpathSync(candidate)
    }
    catch (error) {
      errors.push(`${path}.ref cannot be resolved: ${evidence.ref}: ${error.message}`)
      continue
    }
    const resolvedRelative = relative(rootReal, candidateReal)
    if (resolvedRelative.startsWith('..') || isAbsolute(resolvedRelative)) {
      errors.push(`${path}.ref symlink escapes the manifest evidence root: ${evidence.ref}`)
      continue
    }
    let bytes
    try {
      bytes = readFileSync(candidateReal)
    }
    catch (error) {
      errors.push(`${path}.ref cannot be read as a retained evidence file: ${evidence.ref}: ${error.message}`)
      continue
    }
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    if (evidence.digest !== digest) {
      errors.push(
        `${path}.digest does not match exact referenced file bytes for ${evidence.ref}`,
      )
    }
  }
  return errors
}

export function runtimeProfileRegistryDigest(entries) {
  const canonical = [...entries]
    .map(entry => ({
      profile: entry.profile,
      profile_version: entry.profile_version,
      component_role: entry.component_role,
      schema_digest: entry.schema_digest,
    }))
    .sort((left, right) => {
      const leftKey = `${String(left.profile)}\u0000${String(left.profile_version)}`
      const rightKey = `${String(right.profile)}\u0000${String(right.profile_version)}`
      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0
    })
  return `sha256:${createHash('sha256').update(JSON.stringify(canonical)).digest('hex')}`
}

function canonicalJson(value) {
  if (Array.isArray(value))
    return `[${value.map(canonicalJson).join(',')}]`
  if (object(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function componentSetDigest(componentSet) {
  const unsigned = structuredClone(componentSet)
  delete unsigned.component_set_digest
  return `sha256:${createHash('sha256').update(canonicalJson(unsigned)).digest('hex')}`
}

function validateStore(store, path, errors, objectStore = false, active = false) {
  const keys = new Set(objectStore
    ? ['provider', 'version', 'endpoint_ref', 'configuration_digest']
    : ['version', 'endpoint_ref', 'configuration_digest'])
  exactKeys(store, keys, path, errors)
  if (!object(store))
    return
  if (objectStore && typeof store.provider !== 'string')
    errors.push(`${path}.provider must be a string`)
  for (const field of ['version', 'endpoint_ref']) {
    if (typeof store[field] !== 'string' || !store[field])
      errors.push(`${path}.${field} must be a non-empty string`)
  }
  if (typeof store.configuration_digest !== 'string')
    errors.push(`${path}.configuration_digest must be a string`)
  if (active) {
    if (objectStore && !nonPlaceholder(store.provider))
      errors.push(`${path}.provider cannot be UNASSIGNED in an active runtime`)
    if (!nonPlaceholder(store.version) || !nonPlaceholder(store.endpoint_ref))
      errors.push(`${path} version and endpoint_ref must be assigned in an active runtime`)
    if (!DIGEST.test(store.configuration_digest || ''))
      errors.push(`${path}.configuration_digest must be a SHA-256 digest in an active runtime`)
  }
}

export function parseRuntimeManifest(path, python = process.env.DIE_VALIDATOR_PYTHON || 'python3') {
  const parser = resolve(freezeRoot, 'tools/yaml-to-json.py')
  const result = spawnSync(python, [parser, path], { encoding: 'utf8' })
  if (result.status !== 0)
    throw new Error(`cannot parse runtime manifest YAML: ${(result.stderr || result.stdout).trim()}`)
  return JSON.parse(result.stdout)
}

export function validateSourceProductPath(binding, context = {}) {
  const errors = []
  exactKeys(binding, new Set([
    'schema_version', 'schema', 'binding_id', 'profile', 'logical_sensor',
    'authority_commit', 'source_commit', 'normal_path_state', 'installation',
    'component_set', 'package_installations',
    'organization_context', 'enrollment', 'components', 'data_path', 'prerequisites',
    'prohibited_bypasses', 'evidence_bindings', 'evidence_refs',
  ]), 'source_product_path', errors)
  if (!object(binding))
    return errors

  if (binding.schema_version !== '1.0')
    errors.push('source_product_path.schema_version must be 1.0')
  if (binding.schema !== 'die.source-product-path.v1')
    errors.push('source_product_path.schema must be die.source-product-path.v1')
  if (!(binding.binding_id === 'UNASSIGNED'
    || /^[a-z][a-z0-9_.-]{2,127}$/.test(binding.binding_id || ''))) {
    errors.push('source_product_path.binding_id is invalid')
  }
  if (!(binding.profile === 'UNASSIGNED' || PROFILE_ID.test(binding.profile || '')))
    errors.push('source_product_path.profile is invalid')
  if (!(binding.logical_sensor === 'UNASSIGNED'
    || new Set([...LAUNCH_PROFILES, 'connector']).has(binding.logical_sensor))) {
    errors.push('source_product_path.logical_sensor is invalid')
  }
  for (const field of ['authority_commit', 'source_commit']) {
    if (!(binding[field] === 'UNASSIGNED' || SHA.test(binding[field] || '')))
      errors.push(`source_product_path.${field} must be UNASSIGNED or an exact 40-hex commit`)
  }
  if (!SOURCE_PATH_STATES.has(binding.normal_path_state))
    errors.push(`source_product_path.normal_path_state is invalid: ${binding.normal_path_state}`)

  const installationKeys = new Set([
    'documentation_refs', 'installer_repository', 'installer_commit', 'install_artifact_ref',
    'install_artifact_digest', 'normal_install_command_ref', 'installation_evidence_ref',
  ])
  exactKeys(binding.installation, installationKeys, 'source_product_path.installation', errors)
  if (object(binding.installation)) {
    uniqueStringArray(
      binding.installation.documentation_refs,
      'source_product_path.installation.documentation_refs',
      errors,
      { refs: true },
    )
    if (!(binding.installation.installer_repository === 'UNASSIGNED'
      || REPOSITORY.test(binding.installation.installer_repository || ''))) {
      errors.push('source_product_path.installation.installer_repository is invalid')
    }
    if (!(binding.installation.installer_commit === 'UNASSIGNED'
      || SHA.test(binding.installation.installer_commit || ''))) {
      errors.push('source_product_path.installation.installer_commit is invalid')
    }
    if (!(binding.installation.install_artifact_digest === 'UNASSIGNED'
      || DIGEST.test(binding.installation.install_artifact_digest || ''))) {
      errors.push('source_product_path.installation.install_artifact_digest is invalid')
    }
    for (const field of ['install_artifact_ref', 'normal_install_command_ref', 'installation_evidence_ref']) {
      if (!(binding.installation[field] === 'UNASSIGNED' || safeEvidenceRef(binding.installation[field])))
        errors.push(`source_product_path.installation.${field} must be UNASSIGNED or a safe relative reference`)
    }
  }

  const componentSet = binding.component_set
  const componentSetPackagesById = new Map()
  const componentSetComponentsById = new Map()
  if (!(componentSet === 'UNASSIGNED' || object(componentSet))) {
    errors.push('source_product_path.component_set must be UNASSIGNED or an installed component-set object')
  }
  else if (object(componentSet)) {
    exactKeys(componentSet, new Set([
      'schema_version', 'component_set_id', 'component_set_digest', 'source_profile',
      'measured_at', 'packages', 'components', 'ownership',
    ]), 'source_product_path.component_set', errors)
    if (componentSet.schema_version !== 'starliner.producer-component-set.v1')
      errors.push('source_product_path.component_set.schema_version is invalid')
    if (!UUID.test(componentSet.component_set_id || ''))
      errors.push('source_product_path.component_set.component_set_id must be a UUID')
    if (componentSet.source_profile !== binding.profile)
      errors.push('source_product_path.component_set.source_profile does not match profile')
    if (!RFC3339.test(componentSet.measured_at || ''))
      errors.push('source_product_path.component_set.measured_at must be RFC3339')
    if (!DIGEST.test(componentSet.component_set_digest || '')
      || componentSet.component_set_digest !== componentSetDigest(componentSet)) {
      errors.push('source_product_path.component_set.component_set_digest does not bind the canonical component set')
    }
    if (!Array.isArray(componentSet.packages) || !componentSet.packages.length) {
      errors.push('source_product_path.component_set.packages must be non-empty')
    }
    else {
      componentSet.packages.forEach((item, index) => {
        const path = `source_product_path.component_set.packages[${index}]`
        if (!object(item) || !nonPlaceholder(item.package_id)) {
          errors.push(`${path}.package_id is required`)
          return
        }
        if (componentSetPackagesById.has(item.package_id))
          errors.push(`${path}.package_id is duplicated: ${item.package_id}`)
        else
          componentSetPackagesById.set(item.package_id, item)
        if (!REPOSITORY.test(item.source_repository || '') || !SHA.test(item.source_commit || '')
          || !DIGEST.test(item.package_digest || '') || !safeEvidenceRef(item.build_evidence_ref)) {
          errors.push(`${path} must bind repository, commit, package digest and build evidence`)
        }
      })
    }
    if (!Array.isArray(componentSet.components) || !componentSet.components.length) {
      errors.push('source_product_path.component_set.components must be non-empty')
    }
    else {
      componentSet.components.forEach((item, index) => {
        const path = `source_product_path.component_set.components[${index}]`
        if (!object(item) || !COMPONENT_ID.test(item.component_id || '')) {
          errors.push(`${path}.component_id is invalid`)
          return
        }
        if (componentSetComponentsById.has(item.component_id))
          errors.push(`${path}.component_id is duplicated: ${item.component_id}`)
        else
          componentSetComponentsById.set(item.component_id, item)
        if (!componentSetPackagesById.has(item.package_id))
          errors.push(`${path}.package_id does not reference a measured package`)
        if (!REPOSITORY.test(item.source_repository || '') || !SHA.test(item.source_commit || '')
          || !DIGEST.test(item.package_member_digest || '')
          || !DIGEST.test(item.installed_artifact_digest || '')
          || !DIGEST.test(item.runtime_artifact_digest || '')
          || !nonPlaceholder(item.runtime_identity)) {
          errors.push(`${path} lacks exact package/installed/runtime provenance`)
        }
      })
    }
    if (!object(componentSet.ownership)) {
      errors.push('source_product_path.component_set.ownership must be an object')
    }
    else {
      const ownershipIds = new Set([
        ...(componentSet.ownership.capture_component_ids || []),
        componentSet.ownership.wal_component_id,
        componentSet.ownership.delivery_component_id,
        ...(componentSet.ownership.health_component_ids || []),
      ])
      for (const componentId of ownershipIds) {
        if (!componentSetComponentsById.has(componentId))
          errors.push(`source_product_path.component_set.ownership references unknown component ${componentId}`)
      }
      if (new Set(componentSet.ownership.health_component_ids || []).size !== componentSetComponentsById.size
        || [...componentSetComponentsById.keys()].some(id => !(componentSet.ownership.health_component_ids || []).includes(id))) {
        errors.push('source_product_path.component_set health ownership must cover every installed component')
      }
    }
  }

  const packageInstallationsById = new Map()
  if (!Array.isArray(binding.package_installations)) {
    errors.push('source_product_path.package_installations must be an array')
  }
  else {
    binding.package_installations.forEach((item, index) => {
      const path = `source_product_path.package_installations[${index}]`
      exactKeys(item, new Set([
        'package_id', 'component_ids', 'package_artifact_ref', 'package_artifact_digest',
        'install_manifest_ref', 'install_manifest_digest', 'installation_evidence_ref',
      ]), path, errors)
      if (!object(item))
        return
      if (!nonPlaceholder(item.package_id))
        errors.push(`${path}.package_id is required`)
      else if (packageInstallationsById.has(item.package_id))
        errors.push(`${path}.package_id is duplicated: ${item.package_id}`)
      else
        packageInstallationsById.set(item.package_id, item)
      uniqueStringArray(item.component_ids, `${path}.component_ids`, errors, { nonempty: true })
      for (const field of ['package_artifact_ref', 'install_manifest_ref', 'installation_evidence_ref']) {
        if (!(item[field] === 'UNASSIGNED' || safeEvidenceRef(item[field])))
          errors.push(`${path}.${field} is invalid`)
      }
      for (const field of ['package_artifact_digest', 'install_manifest_digest']) {
        if (!(item[field] === 'UNASSIGNED' || DIGEST.test(item[field] || '')))
          errors.push(`${path}.${field} is invalid`)
      }
    })
  }

  const organizationKeys = new Set([
    'tenant_input_kind', 'tenant_source_symbol', 'discovery_or_bootstrap_symbol',
    'persona_or_workload_prerequisite', 'effective_configuration_source',
  ])
  exactKeys(binding.organization_context, organizationKeys, 'source_product_path.organization_context', errors)
  if (object(binding.organization_context)) {
    if (!SOURCE_TENANT_INPUT_KINDS.has(binding.organization_context.tenant_input_kind))
      errors.push('source_product_path.organization_context.tenant_input_kind is invalid')
    for (const field of [
      'tenant_source_symbol', 'discovery_or_bootstrap_symbol',
      'persona_or_workload_prerequisite', 'effective_configuration_source',
    ]) {
      if (typeof binding.organization_context[field] !== 'string' || !binding.organization_context[field])
        errors.push(`source_product_path.organization_context.${field} must be a non-empty string`)
    }
  }

  const enrollmentKeys = new Set([
    'production_writer_symbol', 'credential_issuer', 'credential_store',
    'producer_identity_source', 'installation_identity_source', 'evidence_ref', 'status',
  ])
  exactKeys(binding.enrollment, enrollmentKeys, 'source_product_path.enrollment', errors)
  if (object(binding.enrollment)) {
    for (const field of [
      'production_writer_symbol', 'credential_issuer', 'credential_store',
      'producer_identity_source', 'installation_identity_source',
    ]) {
      if (typeof binding.enrollment[field] !== 'string' || !binding.enrollment[field])
        errors.push(`source_product_path.enrollment.${field} must be a non-empty string`)
    }
    if (!(binding.enrollment.evidence_ref === 'UNASSIGNED' || safeEvidenceRef(binding.enrollment.evidence_ref)))
      errors.push('source_product_path.enrollment.evidence_ref must be UNASSIGNED or a safe relative reference')
    if (!SOURCE_ENROLLMENT_STATES.has(binding.enrollment.status))
      errors.push('source_product_path.enrollment.status is invalid')
  }

  const sourceComponentsById = new Map()
  if (!Array.isArray(binding.components)) {
    errors.push('source_product_path.components must be an array')
  }
  else {
    binding.components.forEach((component, index) => {
      const path = `source_product_path.components[${index}]`
      exactKeys(component, new Set([
        'component_id', 'component_kind', 'repository', 'source_commit',
        'installed_artifact_ref', 'installed_artifact_digest', 'supervisor', 'service_unit',
        'normal_entrypoint', 'effective_configuration_digest', 'installation_evidence_ref',
        'configuration_evidence_ref', 'observation_ownership',
      ]), path, errors)
      if (!object(component))
        return
      if (!COMPONENT_ID.test(component.component_id || ''))
        errors.push(`${path}.component_id is invalid`)
      else if (sourceComponentsById.has(component.component_id))
        errors.push(`${path}.component_id is duplicated: ${component.component_id}`)
      else
        sourceComponentsById.set(component.component_id, component)
      if (!SOURCE_COMPONENT_KINDS.has(component.component_kind))
        errors.push(`${path}.component_kind is invalid: ${component.component_kind}`)
      if (!(component.repository === 'UNASSIGNED' || REPOSITORY.test(component.repository || '')))
        errors.push(`${path}.repository is invalid`)
      if (!(component.source_commit === 'UNASSIGNED' || SHA.test(component.source_commit || '')))
        errors.push(`${path}.source_commit is invalid`)
      if (!(component.installed_artifact_ref === 'UNASSIGNED' || safeEvidenceRef(component.installed_artifact_ref)))
        errors.push(`${path}.installed_artifact_ref is invalid`)
      if (!(component.installed_artifact_digest === 'UNASSIGNED'
        || DIGEST.test(component.installed_artifact_digest || ''))) {
        errors.push(`${path}.installed_artifact_digest is invalid`)
      }
      if (!(component.effective_configuration_digest === 'UNASSIGNED'
        || DIGEST.test(component.effective_configuration_digest || ''))) {
        errors.push(`${path}.effective_configuration_digest is invalid`)
      }
      for (const field of ['installation_evidence_ref', 'configuration_evidence_ref']) {
        if (!(component[field] === 'UNASSIGNED' || safeEvidenceRef(component[field])))
          errors.push(`${path}.${field} is invalid`)
      }
      if (!(component.supervisor === 'UNASSIGNED' || SUPERVISORS.has(component.supervisor)))
        errors.push(`${path}.supervisor is invalid`)
      for (const field of ['service_unit', 'normal_entrypoint']) {
        if (typeof component[field] !== 'string' || !component[field])
          errors.push(`${path}.${field} must be a non-empty string`)
      }
      if (!SOURCE_OWNERSHIP.has(component.observation_ownership))
        errors.push(`${path}.observation_ownership is invalid`)
    })
  }

  const dataPathKeys = new Set([
    'native_capture_symbols', 'native_capture_evidence_refs', 'privacy_mapper_symbol',
    'wal_owner_component_id', 'wal_owner_component_kind', 'wal_owner_symbol', 'wal_evidence_ref',
    'sender_component_id', 'sender_component_kind', 'sender_symbol', 'sender_evidence_ref',
    'receipt_handler_symbol', 'receipt_evidence_ref', 'relay_lineage_rule',
  ])
  exactKeys(binding.data_path, dataPathKeys, 'source_product_path.data_path', errors)
  if (object(binding.data_path)) {
    uniqueStringArray(binding.data_path.native_capture_symbols, 'source_product_path.data_path.native_capture_symbols', errors)
    uniqueStringArray(
      binding.data_path.native_capture_evidence_refs,
      'source_product_path.data_path.native_capture_evidence_refs',
      errors,
      { refs: true },
    )
    for (const field of [
      'privacy_mapper_symbol', 'wal_owner_component_id', 'wal_owner_component_kind',
      'wal_owner_symbol', 'wal_evidence_ref', 'sender_component_id', 'sender_component_kind',
      'sender_symbol', 'sender_evidence_ref', 'receipt_handler_symbol', 'receipt_evidence_ref',
      'relay_lineage_rule',
    ]) {
      if (typeof binding.data_path[field] !== 'string' || !binding.data_path[field])
        errors.push(`source_product_path.data_path.${field} must be a non-empty string`)
    }
  }

  if (!Array.isArray(binding.prerequisites)) {
    errors.push('source_product_path.prerequisites must be an array')
  }
  else {
    const prerequisiteIds = new Set()
    binding.prerequisites.forEach((prerequisite, index) => {
      const path = `source_product_path.prerequisites[${index}]`
      exactKeys(prerequisite, new Set([
        'prerequisite_id', 'class', 'required_input_or_action', 'status', 'evidence_ref',
      ]), path, errors)
      if (!object(prerequisite))
        return
      if (!/^[A-Z][A-Z0-9_-]{2,63}$/.test(prerequisite.prerequisite_id || ''))
        errors.push(`${path}.prerequisite_id is invalid`)
      else if (prerequisiteIds.has(prerequisite.prerequisite_id))
        errors.push(`${path}.prerequisite_id is duplicated: ${prerequisite.prerequisite_id}`)
      else
        prerequisiteIds.add(prerequisite.prerequisite_id)
      if (!SOURCE_PREREQUISITE_CLASSES.has(prerequisite.class))
        errors.push(`${path}.class is invalid`)
      if (typeof prerequisite.required_input_or_action !== 'string' || !prerequisite.required_input_or_action)
        errors.push(`${path}.required_input_or_action must be a non-empty string`)
      if (!SOURCE_PREREQUISITE_STATES.has(prerequisite.status))
        errors.push(`${path}.status is invalid`)
      if (!(prerequisite.evidence_ref === 'UNASSIGNED' || safeEvidenceRef(prerequisite.evidence_ref)))
        errors.push(`${path}.evidence_ref is invalid`)
    })
  }
  if (uniqueStringArray(
    binding.prohibited_bypasses,
    'source_product_path.prohibited_bypasses',
    errors,
  )) {
    for (const bypass of binding.prohibited_bypasses) {
      if (!REQUIRED_PROHIBITED_BYPASSES.has(bypass))
        errors.push(`source_product_path.prohibited_bypasses contains unknown value ${bypass}`)
    }
  }
  uniqueStringArray(binding.evidence_refs, 'source_product_path.evidence_refs', errors, { refs: true })

  const evidenceBindingsByRef = new Map()
  if (!Array.isArray(binding.evidence_bindings)) {
    errors.push('source_product_path.evidence_bindings must be an array')
  }
  else {
    binding.evidence_bindings.forEach((evidence, index) => {
      const path = `source_product_path.evidence_bindings[${index}]`
      exactKeys(evidence, new Set(['ref', 'digest', 'evidence_kind']), path, errors)
      if (!object(evidence))
        return
      if (!safeEvidenceRef(evidence.ref))
        errors.push(`${path}.ref must be a safe relative retained-evidence file reference`)
      else if (evidenceBindingsByRef.has(evidence.ref))
        errors.push(`${path}.ref duplicates retained evidence ${evidence.ref}`)
      else
        evidenceBindingsByRef.set(evidence.ref, evidence)
      if (!(evidence.digest === 'UNASSIGNED' || DIGEST.test(evidence.digest || '')))
        errors.push(`${path}.digest must be UNASSIGNED or a SHA-256 digest`)
      if (!SOURCE_EVIDENCE_KINDS.has(evidence.evidence_kind))
        errors.push(`${path}.evidence_kind is invalid: ${evidence.evidence_kind}`)
    })
  }

  if (binding.normal_path_state === 'UNASSIGNED') {
    for (const field of ['binding_id', 'profile', 'logical_sensor', 'authority_commit', 'source_commit']) {
      if (binding[field] !== 'UNASSIGNED')
        errors.push(`UNASSIGNED source product path must retain ${field}=UNASSIGNED`)
    }
    if (binding.component_set !== 'UNASSIGNED' || binding.package_installations?.length
      || binding.components?.length || binding.prerequisites?.length
      || binding.prohibited_bypasses?.length || binding.evidence_bindings?.length
      || binding.evidence_refs?.length) {
      errors.push('UNASSIGNED source product path cannot contain components, prerequisites, bypasses or evidence')
    }
    return errors
  }

  if (binding.logical_sensor !== expectedLogicalSensor(binding.profile)) {
    errors.push(
      `source_product_path.logical_sensor ${binding.logical_sensor} does not match profile ${binding.profile}`,
    )
  }

  if (['INSTALLED_OBSERVED', 'COHERENT_E2E'].includes(binding.normal_path_state)) {
    if (!nonPlaceholder(binding.binding_id)
      || !SHA.test(binding.authority_commit || '') || !SHA.test(binding.source_commit || '')) {
      errors.push(`${binding.normal_path_state} source product path must bind an ID and exact authority/source commits`)
    }
    if (!binding.installation?.documentation_refs?.length
      || !REPOSITORY.test(binding.installation?.installer_repository || '')
      || !SHA.test(binding.installation?.installer_commit || '')
      || !safeEvidenceRef(binding.installation?.install_artifact_ref)
      || !DIGEST.test(binding.installation?.install_artifact_digest || '')
      || !safeEvidenceRef(binding.installation?.normal_install_command_ref)
      || !safeEvidenceRef(binding.installation?.installation_evidence_ref)) {
      errors.push(`${binding.normal_path_state} source product path lacks complete normal installation evidence`)
    }
    if (!object(componentSet) || !componentSetPackagesById.size || !componentSetComponentsById.size)
      errors.push(`${binding.normal_path_state} source product path lacks a measured component/package graph`)
    if (!binding.components?.length) {
      errors.push(`${binding.normal_path_state} source product path must contain installed components`)
    }
    else {
      for (const component of binding.components) {
        if (!REPOSITORY.test(component.repository || '') || !SHA.test(component.source_commit || '')
          || !safeEvidenceRef(component.installed_artifact_ref)
          || !DIGEST.test(component.installed_artifact_digest || '')
          || !safeEvidenceRef(component.installation_evidence_ref)
          || !SUPERVISORS.has(component.supervisor)
          || !nonPlaceholder(component.service_unit) || !nonPlaceholder(component.normal_entrypoint)) {
          errors.push(`${binding.normal_path_state} source component ${component.component_id || 'unknown'} is not installed-path bound`)
        }
      }
    }

    const sourceComponentIds = [...sourceComponentsById.keys()].sort()
    const measuredComponentIds = [...componentSetComponentsById.keys()].sort()
    if (JSON.stringify(sourceComponentIds) !== JSON.stringify(measuredComponentIds)) {
      errors.push(`${binding.normal_path_state} source components do not exactly match component_set.components`)
    }
    const roleToKind = role => ({
      llm_gateway: 'gateway_service', mcp_gateway: 'gateway_service',
      llm_edge_runtime: 'sidecar', mcp_edge_runtime: 'sidecar',
    })[role] || role
    for (const [componentId, sourceComponent] of sourceComponentsById) {
      const measured = componentSetComponentsById.get(componentId)
      if (!measured)
        continue
      for (const [field, expected] of [
        ['repository', measured.source_repository],
        ['source_commit', measured.source_commit],
        ['installed_artifact_digest', measured.installed_artifact_digest],
        ['component_kind', roleToKind(measured.role)],
      ]) {
        if (sourceComponent[field] !== expected) {
          errors.push(`${binding.normal_path_state} source component ${componentId}.${field} does not match component_set`)
        }
      }
    }

    const packageIds = [...componentSetPackagesById.keys()].sort()
    const installedPackageIds = [...packageInstallationsById.keys()].sort()
    if (JSON.stringify(packageIds) !== JSON.stringify(installedPackageIds)) {
      errors.push(`${binding.normal_path_state} package_installations do not exactly cover component_set.packages`)
    }
    for (const [packageId, installed] of packageInstallationsById) {
      const measuredPackage = componentSetPackagesById.get(packageId)
      if (!measuredPackage)
        continue
      if (installed.package_artifact_digest !== measuredPackage.package_digest)
        errors.push(`${binding.normal_path_state} package ${packageId} artifact digest does not match component_set`)
      const expectedIds = [...componentSetComponentsById.values()]
        .filter(component => component.package_id === packageId)
        .map(component => component.component_id)
        .sort()
      if (JSON.stringify([...(installed.component_ids || [])].sort()) !== JSON.stringify(expectedIds)) {
        errors.push(`${binding.normal_path_state} package ${packageId} component_ids do not match component_set package membership`)
      }
    }
    const deliveryComponent = componentSetComponentsById.get(componentSet?.ownership?.delivery_component_id)
    if (deliveryComponent && binding.source_commit !== deliveryComponent.source_commit) {
      errors.push(`${binding.normal_path_state} source_commit must match the component-set delivery owner commit`)
    }

    for (const reference of binding.installation?.documentation_refs || []) {
      requireSourceEvidenceBinding(
        reference, 'installation_documentation',
        'source_product_path.installation.documentation_refs', evidenceBindingsByRef, errors,
      )
    }
    for (const [field, kind] of [
      ['install_artifact_ref', 'installation_artifact'],
      ['normal_install_command_ref', 'installation_command'],
      ['installation_evidence_ref', 'installation_observation'],
    ]) {
      requireSourceEvidenceBinding(
        binding.installation?.[field], kind,
        `source_product_path.installation.${field}`, evidenceBindingsByRef, errors,
      )
    }
    for (const [packageId, item] of packageInstallationsById) {
      const measuredPackage = componentSetPackagesById.get(packageId)
      requireSourceEvidenceBinding(
        measuredPackage?.build_evidence_ref, 'package_build_evidence',
        `source_product_path.component_set.packages.${packageId}.build_evidence_ref`, evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        item.package_artifact_ref, 'installation_artifact',
        `source_product_path.package_installations.${packageId}.package_artifact_ref`, evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        item.install_manifest_ref, 'package_install_manifest',
        `source_product_path.package_installations.${packageId}.install_manifest_ref`, evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        item.installation_evidence_ref, 'installation_observation',
        `source_product_path.package_installations.${packageId}.installation_evidence_ref`, evidenceBindingsByRef, errors,
      )
      const artifactEvidence = evidenceBindingsByRef.get(item.package_artifact_ref)
      const manifestEvidence = evidenceBindingsByRef.get(item.install_manifest_ref)
      if (artifactEvidence && artifactEvidence.digest !== item.package_artifact_digest)
        errors.push(`${binding.normal_path_state} package ${packageId} artifact evidence digest does not match`)
      if (manifestEvidence && manifestEvidence.digest !== item.install_manifest_digest)
        errors.push(`${binding.normal_path_state} package ${packageId} install manifest digest does not match`)
    }
    for (const [index, component] of (binding.components || []).entries()) {
      requireSourceEvidenceBinding(
        component.installed_artifact_ref, 'component_installed_artifact',
        `source_product_path.components[${index}].installed_artifact_ref`, evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        component.installation_evidence_ref, 'component_installation_observation',
        `source_product_path.components[${index}].installation_evidence_ref`, evidenceBindingsByRef, errors,
      )
    }
    if (context.evidenceRoot)
      errors.push(...resolveSourceEvidenceBindings(binding, context.evidenceRoot))
  }

  if (binding.normal_path_state === 'COHERENT_E2E') {
    if (!nonPlaceholder(binding.binding_id)
      || !SHA.test(binding.authority_commit || '') || !SHA.test(binding.source_commit || '')) {
      errors.push('COHERENT_E2E source product path must bind an ID and exact authority/source commits')
    }
    if (!binding.installation?.documentation_refs?.length
      || !REPOSITORY.test(binding.installation?.installer_repository || '')
      || !SHA.test(binding.installation?.installer_commit || '')
      || !safeEvidenceRef(binding.installation?.install_artifact_ref)
      || !DIGEST.test(binding.installation?.install_artifact_digest || '')
      || !safeEvidenceRef(binding.installation?.normal_install_command_ref)
      || !safeEvidenceRef(binding.installation?.installation_evidence_ref)) {
      errors.push('COHERENT_E2E source product path lacks complete normal installation evidence')
    }
    if (binding.organization_context?.tenant_input_kind !== 'organization_tenant_uuid'
      || ['tenant_source_symbol', 'discovery_or_bootstrap_symbol',
        'persona_or_workload_prerequisite', 'effective_configuration_source']
        .some(field => !nonPlaceholder(binding.organization_context?.[field]))) {
      errors.push('COHERENT_E2E source product path lacks organization/persona/workload configuration authority')
    }
    if (binding.enrollment?.status !== 'RUNTIME_OBSERVED'
      || !safeEvidenceRef(binding.enrollment?.evidence_ref)
      || ['production_writer_symbol', 'credential_issuer', 'credential_store',
        'producer_identity_source', 'installation_identity_source']
        .some(field => !nonPlaceholder(binding.enrollment?.[field]))) {
      errors.push('COHERENT_E2E source product path enrollment is not runtime observed and fully evidenced')
    }
    if (!binding.components?.length) {
      errors.push('COHERENT_E2E source product path must contain installed components')
    }
    else {
      for (const component of binding.components) {
        if (!REPOSITORY.test(component.repository || '') || !SHA.test(component.source_commit || '')
          || !safeEvidenceRef(component.installed_artifact_ref)
          || !DIGEST.test(component.installed_artifact_digest || '')
          || !DIGEST.test(component.effective_configuration_digest || '')
          || !safeEvidenceRef(component.installation_evidence_ref)
          || !safeEvidenceRef(component.configuration_evidence_ref)
          || !SUPERVISORS.has(component.supervisor)
          || !nonPlaceholder(component.service_unit) || !nonPlaceholder(component.normal_entrypoint)) {
          errors.push(`COHERENT_E2E source component ${component.component_id || 'unknown'} is not fully bound`)
        }
      }
      const kinds = binding.components.map(component => component.component_kind)
      const allowedKinds = sourceComponentAllowed(binding.profile)
      for (const kind of kinds) {
        if (!allowedKinds.has(kind)) {
          errors.push(
            `COHERENT_E2E ${binding.profile} source product path contains incompatible component kind ${kind}`,
          )
        }
      }
      for (const alternatives of sourceComponentRequirements(binding.profile)) {
        if (!alternatives.some(kind => kinds.includes(kind))) {
          errors.push(
            `COHERENT_E2E ${binding.profile} source product path lacks required component kind ${alternatives.join(' or ')}`,
          )
        }
      }
    }
    if (!binding.data_path?.native_capture_symbols?.length
      || !binding.data_path?.native_capture_evidence_refs?.length
      || ['privacy_mapper_symbol', 'wal_owner_component_id', 'wal_owner_component_kind',
        'wal_owner_symbol', 'wal_evidence_ref', 'sender_component_id', 'sender_component_kind',
        'sender_symbol', 'sender_evidence_ref', 'receipt_handler_symbol', 'receipt_evidence_ref',
        'relay_lineage_rule']
        .some(field => !nonPlaceholder(binding.data_path?.[field]))) {
      errors.push('COHERENT_E2E source product path lacks a complete native-capture-to-receipt data path')
    }
    const walOwner = sourceComponentsById.get(binding.data_path?.wal_owner_component_id)
    const senderOwner = sourceComponentsById.get(binding.data_path?.sender_component_id)
    if (!walOwner || walOwner.component_kind !== binding.data_path?.wal_owner_component_kind) {
      errors.push('COHERENT_E2E WAL owner ID/kind does not resolve to an installed component')
    }
    if (!senderOwner || senderOwner.component_kind !== binding.data_path?.sender_component_kind) {
      errors.push('COHERENT_E2E sender owner ID/kind does not resolve to an installed component')
    }
    if (binding.profile === 'browser') {
      const extensions = [...sourceComponentsById.values()]
        .filter(component => component.component_kind === 'browser_extension')
      const nativeHosts = [...sourceComponentsById.values()]
        .filter(component => component.component_kind === 'browser_native_host')
      if (extensions.length !== 1 || extensions[0].observation_ownership !== 'originating') {
        errors.push('COHERENT_E2E Browser requires exactly one originating Browser Extension component')
      }
      if (nativeHosts.length !== 1 || nativeHosts[0].observation_ownership !== 'supporting') {
        errors.push('COHERENT_E2E Browser native host must be one supporting capture component')
      }
      if (binding.data_path?.wal_owner_component_id !== extensions[0]?.component_id
        || binding.data_path?.sender_component_id !== extensions[0]?.component_id
        || binding.data_path?.wal_owner_component_kind !== 'browser_extension'
        || binding.data_path?.sender_component_kind !== 'browser_extension') {
        errors.push('COHERENT_E2E Browser Extension must be the sole WAL and delivery owner')
      }
    }
    for (const prerequisite of binding.prerequisites || []) {
      if (!['SATISFIED', 'NOT_APPLICABLE'].includes(prerequisite.status)) {
        errors.push(
          `COHERENT_E2E source product path prerequisite ${prerequisite.prerequisite_id || 'unknown'} is not satisfied`,
        )
      }
    }
    const bypassSet = new Set(binding.prohibited_bypasses || [])
    if (bypassSet.size !== REQUIRED_PROHIBITED_BYPASSES.size
      || [...REQUIRED_PROHIBITED_BYPASSES].some(value => !bypassSet.has(value))) {
      errors.push('COHERENT_E2E source product path must record the complete prohibited-bypass set')
    }
    if (!binding.prohibited_bypasses?.length || !binding.evidence_bindings?.length
      || !binding.evidence_refs?.length) {
      errors.push('COHERENT_E2E source product path must record prohibited bypasses and retained evidence')
    }

    for (const reference of binding.installation?.documentation_refs || []) {
      requireSourceEvidenceBinding(
        reference, 'installation_documentation',
        'source_product_path.installation.documentation_refs', evidenceBindingsByRef, errors,
      )
    }
    for (const [field, kind] of [
      ['install_artifact_ref', 'installation_artifact'],
      ['normal_install_command_ref', 'installation_command'],
      ['installation_evidence_ref', 'installation_observation'],
    ]) {
      requireSourceEvidenceBinding(
        binding.installation?.[field], kind,
        `source_product_path.installation.${field}`, evidenceBindingsByRef, errors,
      )
    }
    const installationArtifactEvidence = evidenceBindingsByRef.get(
      binding.installation?.install_artifact_ref,
    )
    if (installationArtifactEvidence
      && installationArtifactEvidence.digest !== binding.installation?.install_artifact_digest) {
      errors.push(
        'source_product_path.installation.install_artifact_digest does not match its content-addressed artifact evidence',
      )
    }
    requireSourceEvidenceBinding(
      binding.enrollment?.evidence_ref, 'enrollment_observation',
      'source_product_path.enrollment.evidence_ref', evidenceBindingsByRef, errors,
    )
    for (const [index, component] of (binding.components || []).entries()) {
      requireSourceEvidenceBinding(
        component.installed_artifact_ref, 'component_installed_artifact',
        `source_product_path.components[${index}].installed_artifact_ref`,
        evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        component.installation_evidence_ref, 'component_installation_observation',
        `source_product_path.components[${index}].installation_evidence_ref`,
        evidenceBindingsByRef, errors,
      )
      requireSourceEvidenceBinding(
        component.configuration_evidence_ref, 'component_configuration_observation',
        `source_product_path.components[${index}].configuration_evidence_ref`,
        evidenceBindingsByRef, errors,
      )
      const installedArtifactEvidence = evidenceBindingsByRef.get(component.installed_artifact_ref)
      if (installedArtifactEvidence
        && installedArtifactEvidence.digest !== component.installed_artifact_digest) {
        errors.push(
          `source_product_path.components[${index}].installed_artifact_digest does not match its content-addressed artifact evidence`,
        )
      }
      const configurationEvidence = evidenceBindingsByRef.get(component.configuration_evidence_ref)
      if (configurationEvidence
        && configurationEvidence.digest !== component.effective_configuration_digest) {
        errors.push(
          `source_product_path.components[${index}].effective_configuration_digest does not match its content-addressed configuration evidence`,
        )
      }
    }
    for (const reference of binding.data_path?.native_capture_evidence_refs || []) {
      requireSourceEvidenceBinding(
        reference, 'native_capture_observation',
        'source_product_path.data_path.native_capture_evidence_refs',
        evidenceBindingsByRef, errors,
      )
    }
    for (const [field, kind] of [
      ['wal_evidence_ref', 'wal_observation'],
      ['sender_evidence_ref', 'sender_observation'],
      ['receipt_evidence_ref', 'ingest_receipt'],
    ]) {
      requireSourceEvidenceBinding(
        binding.data_path?.[field], kind,
        `source_product_path.data_path.${field}`, evidenceBindingsByRef, errors,
      )
    }
    for (const [index, prerequisite] of (binding.prerequisites || []).entries()) {
      if (prerequisite.evidence_ref !== 'UNASSIGNED') {
        requireSourceEvidenceBinding(
          prerequisite.evidence_ref, 'prerequisite_observation',
          `source_product_path.prerequisites[${index}].evidence_ref`,
          evidenceBindingsByRef, errors,
        )
      }
    }
    for (const reference of binding.evidence_refs || []) {
      requireSourceEvidenceBinding(
        reference, 'general', 'source_product_path.evidence_refs', evidenceBindingsByRef, errors,
      )
    }
    const referencedEvidence = new Set([
      ...(binding.installation?.documentation_refs || []),
      binding.installation?.install_artifact_ref,
      binding.installation?.normal_install_command_ref,
      binding.installation?.installation_evidence_ref,
      ...(binding.component_set?.packages || []).map(item => item.build_evidence_ref),
      ...(binding.package_installations || []).flatMap(item => [
        item.package_artifact_ref,
        item.install_manifest_ref,
        item.installation_evidence_ref,
      ]),
      binding.enrollment?.evidence_ref,
      ...(binding.components || []).flatMap(component => [
        component.installed_artifact_ref,
        component.installation_evidence_ref,
        component.configuration_evidence_ref,
      ]),
      ...(binding.data_path?.native_capture_evidence_refs || []),
      binding.data_path?.wal_evidence_ref,
      binding.data_path?.sender_evidence_ref,
      binding.data_path?.receipt_evidence_ref,
      ...(binding.prerequisites || []).map(item => item.evidence_ref),
      ...(binding.evidence_refs || []),
    ].filter(safeEvidenceRef))
    for (const [index, evidence] of (binding.evidence_bindings || []).entries()) {
      if (evidence.evidence_kind === 'UNASSIGNED' || !DIGEST.test(evidence.digest || '')) {
        errors.push(
          `COHERENT_E2E source_product_path.evidence_bindings[${index}] must bind a kind and SHA-256 digest`,
        )
      }
      if (safeEvidenceRef(evidence.ref) && !referencedEvidence.has(evidence.ref)) {
        errors.push(
          `source_product_path.evidence_bindings[${index}] ${evidence.ref} is unreferenced; use evidence_refs for general evidence`,
        )
      }
    }
    if (context.evidenceRoot)
      errors.push(...resolveSourceEvidenceBindings(binding, context.evidenceRoot))
  }

  return errors
}

function crossBindSourceProductPath(manifest, producer, producerPath, componentsById, context, errors) {
  const entry = sourcePathContextEntry(context, producer.source_product_path_ref)
  if (!entry || !object(entry.binding)) {
    errors.push(
      `${producerPath} coherent runtime source_product_path_ref was not loaded and semantically validated`,
    )
    return
  }

  const binding = entry.binding
  for (const error of validateSourceProductPath(binding, { evidenceRoot: entry.evidenceRoot }))
    errors.push(`${producerPath} source product path invalid: ${error}`)
  if (!DIGEST.test(entry.digest || ''))
    errors.push(`${producerPath} loaded source product path lacks its exact-file SHA-256 digest`)
  else if (entry.digest !== producer.source_product_path_digest) {
    errors.push(
      `${producerPath}.source_product_path_digest does not match exact referenced file bytes`,
    )
  }

  if (binding.normal_path_state !== 'COHERENT_E2E') {
    errors.push(
      `${producerPath} source product path must be COHERENT_E2E, got ${binding.normal_path_state}`,
    )
  }
  if (binding.profile !== producer.profile)
    errors.push(`${producerPath} source product path profile ${binding.profile} does not match ${producer.profile}`)
  if (binding.logical_sensor !== expectedLogicalSensor(producer.profile)) {
    errors.push(
      `${producerPath} source product path logical_sensor ${binding.logical_sensor} does not match ${producer.profile}`,
    )
  }
  if (binding.authority_commit !== manifest.authority_commit) {
    errors.push(
      `${producerPath} source product path authority_commit does not match runtime authority_commit`,
    )
  }
  if (binding.enrollment?.status !== 'RUNTIME_OBSERVED')
    errors.push(`${producerPath} source product path enrollment is not RUNTIME_OBSERVED`)
  if (binding.enrollment?.evidence_ref !== producer.enrollment_evidence_ref) {
    errors.push(
      `${producerPath} enrollment_evidence_ref does not match source product path enrollment evidence`,
    )
  }
  if (binding.component_set?.component_set_digest !== producer.component_set_digest) {
    errors.push(`${producerPath}.component_set_digest does not match source product path component set`)
  }

  const sourceComponents = new Map()
  for (const component of binding.components || []) {
    if (object(component) && typeof component.component_id === 'string')
      sourceComponents.set(component.component_id, component)
  }
  const manifestComponentIds = [...(producer.component_ids || [])].sort()
  const sourceComponentIds = [...sourceComponents.keys()].sort()
  if (JSON.stringify(manifestComponentIds) !== JSON.stringify(sourceComponentIds)) {
    errors.push(
      `${producerPath}.component_ids do not exactly match the source product path component set`,
    )
  }

  const primaryComponent = componentsById.get(producer.component_id)
  if (primaryComponent) {
    if (binding.source_commit !== primaryComponent.commit_sha) {
      errors.push(
        `${producerPath} source product path source_commit does not match primary component commit_sha`,
      )
    }
    if (producer.configuration_digest !== primaryComponent.effective_configuration_digest) {
      errors.push(
        `${producerPath}.configuration_digest does not match primary component effective configuration`,
      )
    }
  }

  for (const componentId of producer.component_ids || []) {
    const runtimeComponent = componentsById.get(componentId)
    const sourceComponent = sourceComponents.get(componentId)
    const measuredComponent = new Map(
      (binding.component_set?.components || []).map(item => [item.component_id, item]),
    ).get(componentId)
    if (!runtimeComponent || !sourceComponent)
      continue
    const comparisons = [
      ['repository', runtimeComponent.repository],
      ['source_commit', runtimeComponent.commit_sha],
      ['installed_artifact_ref', runtimeComponent.installed_path_ref],
      ['installed_artifact_digest', runtimeComponent.installed_artifact_digest],
      ['supervisor', runtimeComponent.supervisor],
      ['service_unit', runtimeComponent.service_unit],
      ['normal_entrypoint', runtimeComponent.normal_entrypoint],
      ['effective_configuration_digest', runtimeComponent.effective_configuration_digest],
      ['installation_evidence_ref', runtimeComponent.installation_evidence_ref],
    ]
    for (const [field, expected] of comparisons) {
      if (sourceComponent[field] !== expected) {
        errors.push(
          `${producerPath} source component ${componentId}.${field} does not match runtime component`,
        )
      }
    }
    if (measuredComponent) {
      if (measuredComponent.installed_artifact_digest !== runtimeComponent.installed_artifact_digest) {
        errors.push(
          `${producerPath} component-set ${componentId}.installed_artifact_digest does not match runtime component`,
        )
      }
      if (measuredComponent.runtime_artifact_digest !== runtimeComponent.artifact_digest) {
        errors.push(
          `${producerPath} component-set ${componentId}.runtime_artifact_digest does not match runtime component artifact`,
        )
      }
      if (measuredComponent.runtime_identity !== runtimeComponent.runtime_identity) {
        errors.push(
          `${producerPath} component-set ${componentId}.runtime_identity does not match runtime component`,
        )
      }
    }
  }

  const installerMatchesRuntime = [...componentsById.values()].some(component => (
    producer.component_ids?.includes(component.component_id)
      && component.repository === binding.installation?.installer_repository
      && component.commit_sha === binding.installation?.installer_commit
      && component.install_artifact_digest === binding.installation?.install_artifact_digest
  ))
  if (!installerMatchesRuntime) {
    errors.push(
      `${producerPath} normal installation repository/commit/artifact is not bound to a runtime component`,
    )
  }

  if (producer.profile === 'browser') {
    const primarySource = sourceComponents.get(producer.component_id)
    if (primarySource?.component_kind !== 'browser_extension') {
      errors.push(`${producerPath} primary Browser component must be the Browser Extension`)
    }
    if (binding.data_path?.wal_owner_component_id !== producer.component_id
      || binding.data_path?.sender_component_id !== producer.component_id) {
      errors.push(`${producerPath} Browser WAL and sender owners must equal primary Browser Extension component_id`)
    }
  }
}

export function validateRuntimeManifest(manifest, context = {}) {
  const errors = []
  exactKeys(manifest, TOP_LEVEL_KEYS, 'manifest', errors)
  if (!object(manifest))
    return errors

  if (manifest.schema_version !== '1.0')
    errors.push('manifest.schema_version must be 1.0')
  if (manifest.schema !== 'die.runtime-manifest.v1')
    errors.push('manifest.schema must be die.runtime-manifest.v1')
  if (!RUNTIME_MODES.has(manifest.runtime_mode))
    errors.push(`manifest.runtime_mode is invalid: ${manifest.runtime_mode}`)
  if (!Array.isArray(manifest.components))
    errors.push('manifest.components must be an array')
  if (!Array.isArray(manifest.producers))
    errors.push('manifest.producers must be an array')
  if (!Array.isArray(manifest.limitations) || manifest.limitations.some(item => typeof item !== 'string' || !item))
    errors.push('manifest.limitations must be an array of non-empty strings')

  exactKeys(manifest.tenant_authority, new Set(['mode', 'tenant_ref', 'configuration_digest']), 'manifest.tenant_authority', errors)
  exactKeys(manifest.profile_registry, new Set(['registry_ref', 'registry_digest', 'entries']), 'manifest.profile_registry', errors)
  exactKeys(manifest.stores, new Set(['postgresql', 'object_store', 'clickhouse']), 'manifest.stores', errors)
  exactKeys(manifest.customer_endpoints, new Set(['api', 'bff', 'ui']), 'manifest.customer_endpoints', errors)
  exactKeys(manifest.contamination, new Set([
    'mixed_candidates', 'dirty_components', 'manual_database_mutation',
    'untracked_hotfixes', 'overlapping_runtime', 'manual_configuration_override',
    'parallel_product_daemon', 'devtools_or_storage_injection',
    'synthetic_identity_or_persona', 'fixture_interior_stage',
    'uninstalled_artifact', 'normal_entrypoint_bypassed', 'notes',
  ]), 'manifest.contamination', errors)

  const active = manifest.runtime_mode !== 'NONE'
  if (object(manifest.stores)) {
    validateStore(manifest.stores.postgresql, 'manifest.stores.postgresql', errors, false, active)
    validateStore(manifest.stores.object_store, 'manifest.stores.object_store', errors, true, active)
    validateStore(manifest.stores.clickhouse, 'manifest.stores.clickhouse', errors, false, active)
  }

  const profileRegistryEntries = new Map()
  if (object(manifest.profile_registry)) {
    if (!Array.isArray(manifest.profile_registry.entries)) {
      errors.push('manifest.profile_registry.entries must be an array')
    }
    else {
      manifest.profile_registry.entries.forEach((entry, index) => {
        const path = `manifest.profile_registry.entries[${index}]`
        exactKeys(entry, new Set([
          'profile', 'profile_version', 'component_role', 'schema_digest',
        ]), path, errors)
        if (!object(entry))
          return
        if (!PROFILE_ID.test(entry.profile || ''))
          errors.push(`${path}.profile is invalid`)
        if (!PROFILE_VERSION.test(entry.profile_version || ''))
          errors.push(`${path}.profile_version is invalid`)
        if (!DIGEST.test(entry.schema_digest || ''))
          errors.push(`${path}.schema_digest must be a SHA-256 digest`)
        if (!COMPONENT_ROLES.has(entry.component_role)) {
          errors.push(`${path}.component_role is invalid: ${entry.component_role}`)
        }
        else if (LAUNCH_PROFILES.has(entry.profile) && entry.component_role !== entry.profile) {
          errors.push(`${path} launch profile ${entry.profile} must use component_role ${entry.profile}`)
        }
        else if (!LAUNCH_PROFILES.has(entry.profile) && !EXTENSION_COMPONENT_ROLES.has(entry.component_role)) {
          errors.push(`${path} extension profile ${entry.profile} must use a connector component role`)
        }
        const key = `${entry.profile}:${entry.profile_version}`
        if (profileRegistryEntries.has(key))
          errors.push(`${path} duplicates registered profile version ${key}`)
        else
          profileRegistryEntries.set(key, entry)
      })
    }
  }

  const componentsById = new Map()
  if (Array.isArray(manifest.components)) {
    manifest.components.forEach((component, index) => {
      const path = `manifest.components[${index}]`
      exactKeys(component, new Set([
        'component_id', 'repository', 'branch', 'commit_sha', 'artifact_digest',
        'contract_digest', 'role', 'clean_tree', 'provenance', 'build_ref',
        'installation_class', 'install_artifact_digest', 'installed_artifact_digest',
        'installed_path_ref', 'supervisor', 'service_unit', 'runtime_identity', 'normal_entrypoint',
        'effective_configuration_digest', 'installation_evidence_ref',
      ]), path, errors)
      if (!object(component))
        return
      if (!COMPONENT_ID.test(component.component_id || ''))
        errors.push(`${path}.component_id is invalid`)
      else if (componentsById.has(component.component_id))
        errors.push(`${path}.component_id is duplicated: ${component.component_id}`)
      else
        componentsById.set(component.component_id, component)
      if (!REPOSITORY.test(component.repository || ''))
        errors.push(`${path}.repository must be owner/repository`)
      if (!nonPlaceholder(component.branch) || !SHA.test(component.commit_sha || ''))
        errors.push(`${path} must bind a branch and exact 40-hex commit`)
      if (!DIGEST.test(component.artifact_digest || '') || !DIGEST.test(component.contract_digest || ''))
        errors.push(`${path} must bind artifact and contract SHA-256 digests`)
      if (!COMPONENT_ROLES.has(component.role))
        errors.push(`${path}.role is invalid: ${component.role}`)
      if (typeof component.clean_tree !== 'boolean')
        errors.push(`${path}.clean_tree must be boolean`)
      if (!PROVENANCE.has(component.provenance))
        errors.push(`${path}.provenance is invalid: ${component.provenance}`)
      if (!nonPlaceholder(component.build_ref))
        errors.push(`${path}.build_ref must identify retained build evidence`)
      if (!(component.install_artifact_digest === 'UNASSIGNED' || DIGEST.test(component.install_artifact_digest || '')))
        errors.push(`${path}.install_artifact_digest must be UNASSIGNED or a SHA-256 digest`)
      if (!(component.installed_artifact_digest === 'UNASSIGNED' || DIGEST.test(component.installed_artifact_digest || '')))
        errors.push(`${path}.installed_artifact_digest must be UNASSIGNED or a SHA-256 digest`)
      if (!INSTALLATION_CLASSES.has(component.installation_class))
        errors.push(`${path}.installation_class is invalid: ${component.installation_class}`)
      if (!SUPERVISORS.has(component.supervisor))
        errors.push(`${path}.supervisor is invalid: ${component.supervisor}`)
      for (const field of [
        'installed_path_ref', 'service_unit', 'runtime_identity', 'normal_entrypoint',
        'installation_evidence_ref',
      ]) {
        if (typeof component[field] !== 'string' || !component[field])
          errors.push(`${path}.${field} must be a non-empty string`)
      }
      if (!(component.effective_configuration_digest === 'UNASSIGNED'
        || DIGEST.test(component.effective_configuration_digest || ''))) {
        errors.push(`${path}.effective_configuration_digest must be UNASSIGNED or a SHA-256 digest`)
      }
    })
  }

  const producerKeys = new Set()
  const seenProfiles = new Set()
  if (Array.isArray(manifest.producers)) {
    manifest.producers.forEach((producer, index) => {
      const path = `manifest.producers[${index}]`
      exactKeys(producer, new Set([
        'profile', 'profile_version', 'producer_id', 'installation_id', 'certification_id',
        'component_id', 'component_ids', 'artifact_digest', 'component_set_digest',
        'configuration_digest', 'credential_class',
        'credential_issuer_class', 'enrollment_evidence_ref',
        'source_product_path_ref', 'source_product_path_digest',
      ]), path, errors)
      if (!object(producer))
        return
      if (!PROFILE_ID.test(producer.profile || ''))
        errors.push(`${path}.profile is invalid: ${producer.profile}`)
      else
        seenProfiles.add(producer.profile)
      if (!PROFILE_VERSION.test(producer.profile_version || ''))
        errors.push(`${path}.profile_version is invalid: ${producer.profile_version}`)
      if (!UUID.test(producer.producer_id || '') || !UUID.test(producer.certification_id || ''))
        errors.push(`${path} must bind UUID producer and certification identities`)
      if (!nonPlaceholder(producer.installation_id))
        errors.push(`${path}.installation_id must be assigned`)
      const producerComponent = componentsById.get(producer.component_id)
      if (!producerComponent) {
        errors.push(`${path}.component_id does not reference a manifest component`)
      }
      else {
        const registryEntry = profileRegistryEntries.get(`${producer.profile}:${producer.profile_version}`)
        if (!registryEntry) {
          errors.push(
            `${path} profile ${producer.profile}@${producer.profile_version} is not admitted by the bound profile registry`,
          )
        }
        else if (producerComponent.role !== registryEntry.component_role) {
          errors.push(
            `${path} referenced component role ${producerComponent.role} does not match registered profile role ${registryEntry.component_role}`,
          )
        }
        if (producer.artifact_digest !== producerComponent.artifact_digest) {
          errors.push(
            `${path}.artifact_digest does not match referenced component ${producer.component_id} artifact_digest`,
          )
        }
      }
      if (!Array.isArray(producer.component_ids) || !producer.component_ids.length
        || producer.component_ids.some(componentId => !COMPONENT_ID.test(componentId || ''))
        || new Set(producer.component_ids).size !== producer.component_ids.length) {
        errors.push(`${path}.component_ids must be a unique non-empty component-id array`)
      }
      else {
        if (!producer.component_ids.includes(producer.component_id))
          errors.push(`${path}.component_ids must include primary component_id ${producer.component_id}`)
        for (const componentId of producer.component_ids) {
          const component = componentsById.get(componentId)
          if (!component) {
            errors.push(`${path}.component_ids references unknown component ${componentId}`)
            continue
          }
          const registryEntry = profileRegistryEntries.get(`${producer.profile}:${producer.profile_version}`)
          if (registryEntry && component.role !== registryEntry.component_role) {
            errors.push(
              `${path}.component_ids component ${componentId} role ${component.role} does not match registered profile role ${registryEntry.component_role}`,
            )
          }
        }
      }
      if (!DIGEST.test(producer.artifact_digest || '')
        || !DIGEST.test(producer.component_set_digest || '')
        || !DIGEST.test(producer.configuration_digest || '')) {
        errors.push(`${path} must bind artifact, component-set and configuration digests`)
      }
      if (!CREDENTIAL_CLASSES.has(producer.credential_class))
        errors.push(`${path}.credential_class is invalid: ${producer.credential_class}`)
      if (!CREDENTIAL_ISSUER_CLASSES.has(producer.credential_issuer_class))
        errors.push(`${path}.credential_issuer_class is invalid: ${producer.credential_issuer_class}`)
      for (const field of ['enrollment_evidence_ref', 'source_product_path_ref']) {
        if (typeof producer[field] !== 'string' || !producer[field])
          errors.push(`${path}.${field} must be a non-empty string`)
      }
      if (!(producer.source_product_path_digest === 'UNASSIGNED'
        || DIGEST.test(producer.source_product_path_digest || ''))) {
        errors.push(`${path}.source_product_path_digest must be UNASSIGNED or a SHA-256 digest`)
      }
      const key = `${producer.profile}:${producer.producer_id}:${producer.installation_id}`
      if (producerKeys.has(key))
        errors.push(`${path} duplicates producer binding ${key}`)
      producerKeys.add(key)
    })
  }

  if (object(manifest.contamination)) {
    for (const field of [
      'mixed_candidates', 'dirty_components', 'manual_database_mutation', 'untracked_hotfixes',
      'overlapping_runtime', 'manual_configuration_override', 'parallel_product_daemon',
      'devtools_or_storage_injection', 'synthetic_identity_or_persona', 'fixture_interior_stage',
      'uninstalled_artifact', 'normal_entrypoint_bypassed',
    ]) {
      if (typeof manifest.contamination[field] !== 'boolean')
        errors.push(`manifest.contamination.${field} must be boolean`)
    }
    if (!Array.isArray(manifest.contamination.notes)
      || manifest.contamination.notes.some(item => typeof item !== 'string' || !item)) {
      errors.push('manifest.contamination.notes must be an array of non-empty strings')
    }
  }

  if (!active) {
    for (const [field, expected] of [
      ['manifest_id', 'UNASSIGNED'], ['candidate_digest', 'UNASSIGNED'],
      ['environment_id', 'UNASSIGNED'], ['authority_commit', 'UNASSIGNED'],
      ['generated_contract_digest', 'UNASSIGNED'], ['database_migration_digest', 'UNASSIGNED'],
      ['configuration_digest', 'UNASSIGNED'], ['created_at', 'UNASSIGNED'],
      ['started_at', 'UNASSIGNED'], ['evidence_ref', 'UNASSIGNED'],
    ]) {
      if (manifest[field] !== expected)
        errors.push(`manifest.${field} must be ${expected} when runtime_mode is NONE`)
    }
    if (manifest.components?.length || manifest.producers?.length)
      errors.push('NONE runtime cannot contain components or producers')
    if (manifest.profile_registry?.registry_ref !== 'UNASSIGNED'
      || manifest.profile_registry?.registry_digest !== 'UNASSIGNED'
      || manifest.profile_registry?.entries?.length) {
      errors.push('NONE runtime must retain an unassigned empty profile registry')
    }
    if (manifest.tenant_authority?.mode !== 'UNASSIGNED'
      || manifest.tenant_authority?.tenant_ref !== 'REDACTED'
      || manifest.tenant_authority?.configuration_digest !== 'UNASSIGNED') {
      errors.push('NONE runtime must retain unassigned tenant authority')
    }
    for (const field of ['api', 'bff', 'ui']) {
      if (manifest.customer_endpoints?.[field] !== 'UNASSIGNED')
        errors.push(`NONE runtime customer endpoint ${field} must be UNASSIGNED`)
    }
    return errors
  }

  if (!UUID.test(manifest.manifest_id || ''))
    errors.push('active runtime manifest_id must be a UUID')
  for (const field of ['candidate_digest', 'generated_contract_digest', 'database_migration_digest', 'configuration_digest']) {
    if (!DIGEST.test(manifest[field] || ''))
      errors.push(`active runtime manifest.${field} must be a SHA-256 digest`)
  }
  if (!nonPlaceholder(manifest.environment_id) || !SHA.test(manifest.authority_commit || ''))
    errors.push('active runtime must bind environment_id and exact authority_commit')
  if (manifest.tenant_authority?.mode !== 'starliner_control'
    || !/^tenant-ref:sha256:[0-9a-f]{64}$/.test(manifest.tenant_authority?.tenant_ref || '')
    || !DIGEST.test(manifest.tenant_authority?.configuration_digest || '')) {
    errors.push('active runtime must bind hashed Starliner tenant authority and its configuration digest')
  }
  if (!manifest.components?.length || !manifest.producers?.length)
    errors.push('active runtime must bind at least one component and producer')
  if (!safeEvidenceRef(manifest.profile_registry?.registry_ref)
    || !DIGEST.test(manifest.profile_registry?.registry_digest || '')
    || !manifest.profile_registry?.entries?.length) {
    errors.push('active runtime must bind a non-empty release-managed profile registry and retained evidence reference')
  }
  else {
    const calculatedRegistryDigest = runtimeProfileRegistryDigest(manifest.profile_registry.entries)
    if (manifest.profile_registry.registry_digest !== calculatedRegistryDigest) {
      errors.push(
        `manifest.profile_registry.registry_digest mismatch: expected ${calculatedRegistryDigest}`,
      )
    }
  }
  for (const field of ['api', 'bff', 'ui']) {
    if (!httpUrl(manifest.customer_endpoints?.[field]))
      errors.push(`active runtime customer endpoint ${field} must be an HTTP(S) URL`)
  }
  if (!RFC3339.test(manifest.created_at || '') || !RFC3339.test(manifest.started_at || ''))
    errors.push('active runtime must bind RFC3339 created_at and started_at')
  else if (Date.parse(manifest.created_at) > Date.parse(manifest.started_at))
    errors.push('manifest.created_at cannot be after started_at')
  if (!safeEvidenceRef(manifest.evidence_ref))
    errors.push('active runtime evidence_ref must be a safe relative retained-evidence reference')

  if (COHERENT_MODES.has(manifest.runtime_mode)) {
    for (const component of manifest.components || []) {
      if (component.clean_tree !== true)
        errors.push(`coherent runtime component ${component.component_id || 'unknown'} is not clean`)
      if (!DIGEST.test(component.install_artifact_digest || '')
        || !DIGEST.test(component.installed_artifact_digest || '')
        || !DIGEST.test(component.effective_configuration_digest || '')) {
        errors.push(`coherent runtime component ${component.component_id || 'unknown'} lacks installed-product digest binding`)
      }
      if (component.artifact_digest !== component.installed_artifact_digest) {
        errors.push(
          `coherent runtime component ${component.component_id || 'unknown'} artifact_digest does not match installed artifact`,
        )
      }
      for (const field of ['installed_path_ref', 'installation_evidence_ref']) {
        if (!safeEvidenceRef(component[field]))
          errors.push(`coherent runtime component ${component.component_id || 'unknown'} lacks safe ${field}`)
      }
      for (const field of ['service_unit', 'runtime_identity', 'normal_entrypoint']) {
        if (!nonPlaceholder(component[field]))
          errors.push(`coherent runtime component ${component.component_id || 'unknown'} lacks ${field}`)
      }
    }
    for (const [index, producer] of (manifest.producers || []).entries()) {
      const producerPath = `manifest.producers[${index}]`
      if (producer.credential_class === 'preview_synthetic'
        || producer.credential_issuer_class === 'preview_synthetic') {
        errors.push(`coherent runtime producer ${producer.profile || 'unknown'} cannot use synthetic enrollment or credentials`)
      }
      if (LAUNCH_PROFILES.has(producer.profile) && producer.credential_class !== 'dpop_jwt') {
        errors.push(
          `coherent installed producer ${producer.profile || 'unknown'} must use enrollment-issued dpop_jwt credentials`,
        )
      }
      if (!safeEvidenceRef(producer.enrollment_evidence_ref)
        || !SAFE_SOURCE_PATH_REF.test(producer.source_product_path_ref || '')
        || !DIGEST.test(producer.source_product_path_digest || '')) {
        errors.push(`coherent runtime producer ${producer.profile || 'unknown'} lacks real enrollment and source-product-path binding`)
      }
      crossBindSourceProductPath(manifest, producer, producerPath, componentsById, context, errors)
    }
    for (const field of [
      'mixed_candidates', 'dirty_components', 'manual_database_mutation', 'untracked_hotfixes',
      'overlapping_runtime', 'manual_configuration_override', 'parallel_product_daemon',
      'devtools_or_storage_injection', 'synthetic_identity_or_persona', 'fixture_interior_stage',
      'uninstalled_artifact', 'normal_entrypoint_bypassed',
    ]) {
      if (manifest.contamination?.[field] !== false)
        errors.push(`coherent runtime cannot set contamination.${field}`)
    }
  }

  for (const producer of manifest.producers || []) {
    if ((producer.credential_class === 'preview_synthetic'
      || producer.credential_issuer_class === 'preview_synthetic')
      && manifest.runtime_mode !== 'DEV_PREVIEW') {
      errors.push('preview_synthetic credentials and enrollment are allowed only in DEV_PREVIEW')
    }
  }

  if (manifest.runtime_mode === 'RELEASE_CANDIDATE') {
    for (const profile of LAUNCH_PROFILES) {
      if (!seenProfiles.has(profile))
        errors.push(`release candidate omits producer profile ${profile}`)
    }
    for (const producer of manifest.producers || []) {
      if (producer.credential_class === 'preview_synthetic')
        errors.push('release candidate cannot use preview_synthetic credentials')
    }
  }

  return errors
}

function loadSourceProductPath(reference, root, python) {
  const errors = []
  if (!SAFE_SOURCE_PATH_REF.test(reference || '')) {
    errors.push(`source product path reference is unsafe or is not YAML: ${reference}`)
    return { errors }
  }

  let rootReal
  try {
    rootReal = realpathSync(root)
  }
  catch (error) {
    errors.push(`source product path root cannot be resolved: ${error.message}`)
    return { errors }
  }

  const candidate = resolve(rootReal, reference)
  const lexicalRelative = relative(rootReal, candidate)
  if (lexicalRelative.startsWith('..') || isAbsolute(lexicalRelative)) {
    errors.push(`source product path escapes the manifest evidence root: ${reference}`)
    return { errors }
  }
  if (!existsSync(candidate)) {
    errors.push(`source product path does not exist: ${reference}`)
    return { errors }
  }

  let candidateReal
  try {
    candidateReal = realpathSync(candidate)
  }
  catch (error) {
    errors.push(`source product path cannot be resolved: ${reference}: ${error.message}`)
    return { errors }
  }
  const resolvedRelative = relative(rootReal, candidateReal)
  if (resolvedRelative.startsWith('..') || isAbsolute(resolvedRelative)) {
    errors.push(`source product path symlink escapes the manifest evidence root: ${reference}`)
    return { errors }
  }

  let bytes
  try {
    bytes = readFileSync(candidateReal)
  }
  catch (error) {
    errors.push(`source product path cannot be read: ${reference}: ${error.message}`)
    return { errors }
  }
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`

  try {
    const binding = parseRuntimeManifest(candidateReal, python)
    return { binding, digest, resolvedPath: candidateReal, errors }
  }
  catch (error) {
    errors.push(`source product path cannot be parsed: ${reference}: ${error.message}`)
    return { digest, resolvedPath: candidateReal, errors }
  }
}

export function validateRuntimeManifestFile(path, python, sourcePathRoot = dirname(resolve(path))) {
  const manifest = parseRuntimeManifest(path, python)
  const errors = []
  const sourceProductPaths = new Map()

  if (COHERENT_MODES.has(manifest.runtime_mode)) {
    for (const producer of manifest.producers || []) {
      const reference = producer.source_product_path_ref
      if (sourceProductPaths.has(reference))
        continue
      const loaded = loadSourceProductPath(reference, sourcePathRoot, python)
      errors.push(...loaded.errors)
      if (loaded.binding) {
        sourceProductPaths.set(reference, {
          binding: loaded.binding,
          digest: loaded.digest,
          resolvedPath: loaded.resolvedPath,
          evidenceRoot: realpathSync(sourcePathRoot),
        })
      }
    }
  }

  errors.push(...validateRuntimeManifest(manifest, { sourceProductPaths }))
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = resolve(process.argv[2] || resolve(executionRoot, 'templates/RUNTIME_MANIFEST.yaml'))
  const errors = validateRuntimeManifestFile(path)
  if (errors.length) {
    console.error('DIE runtime manifest validation FAILED')
    errors.forEach(error => console.error(`- ${error}`))
    process.exit(1)
  }
  const schema = JSON.parse(readFileSync(resolve(freezeRoot, 'schemas/runtime-manifest.schema.json'), 'utf8'))
  if (schema.title !== 'DIE coherent runtime manifest') {
    console.error('DIE runtime manifest validation FAILED\n- runtime manifest schema title changed')
    process.exit(1)
  }
  console.log(`DIE runtime manifest validation passed: ${path}`)
}

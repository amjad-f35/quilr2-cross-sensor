#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
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
const CREDENTIAL_CLASSES = new Set(['preview_synthetic', 'mtls', 'workload_jwt', 'oidc_workload', 'platform_signed'])
const PROVENANCE = new Set(['exact_source_build', 'signed_artifact', 'immutable_image_digest'])
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
  return nonPlaceholder(value) && !value.startsWith('/') && !value.includes('..')
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

export function validateRuntimeManifest(manifest) {
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
    'untracked_hotfixes', 'overlapping_runtime', 'notes',
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
    })
  }

  const producerKeys = new Set()
  const seenProfiles = new Set()
  if (Array.isArray(manifest.producers)) {
    manifest.producers.forEach((producer, index) => {
      const path = `manifest.producers[${index}]`
      exactKeys(producer, new Set([
        'profile', 'profile_version', 'producer_id', 'installation_id', 'certification_id',
        'component_id', 'artifact_digest', 'configuration_digest', 'credential_class',
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
      if (!DIGEST.test(producer.artifact_digest || '') || !DIGEST.test(producer.configuration_digest || ''))
        errors.push(`${path} must bind artifact and configuration digests`)
      if (!CREDENTIAL_CLASSES.has(producer.credential_class))
        errors.push(`${path}.credential_class is invalid: ${producer.credential_class}`)
      const key = `${producer.profile}:${producer.producer_id}:${producer.installation_id}`
      if (producerKeys.has(key))
        errors.push(`${path} duplicates producer binding ${key}`)
      producerKeys.add(key)
    })
  }

  if (object(manifest.contamination)) {
    for (const field of ['mixed_candidates', 'dirty_components', 'manual_database_mutation', 'untracked_hotfixes', 'overlapping_runtime']) {
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
    }
    for (const field of ['mixed_candidates', 'dirty_components', 'manual_database_mutation', 'untracked_hotfixes', 'overlapping_runtime']) {
      if (manifest.contamination?.[field] !== false)
        errors.push(`coherent runtime cannot set contamination.${field}`)
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

export function validateRuntimeManifestFile(path, python) {
  return validateRuntimeManifest(parseRuntimeManifest(path, python))
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

#!/usr/bin/env node

import {
  runtimeProfileRegistryDigest,
  validateRuntimeManifest,
} from './validate-runtime-manifest.mjs'

const DIGEST_A = `sha256:${'a'.repeat(64)}`
const DIGEST_B = `sha256:${'b'.repeat(64)}`

const endpointRegistryEntries = [{
  profile: 'endpoint',
  profile_version: '1.0.0',
  component_role: 'endpoint',
  schema_digest: `sha256:${'e'.repeat(64)}`,
}]

const validManifest = {
  schema_version: '1.0',
  schema: 'die.runtime-manifest.v1',
  manifest_id: '11111111-1111-4111-8111-111111111111',
  candidate_digest: DIGEST_A,
  environment_id: 'runtime-manifest-validator',
  runtime_mode: 'COHERENT_LOCAL_PRODUCT',
  authority_commit: 'a'.repeat(40),
  generated_contract_digest: DIGEST_A,
  database_migration_digest: DIGEST_A,
  configuration_digest: DIGEST_A,
  tenant_authority: {
    mode: 'starliner_control',
    tenant_ref: `tenant-ref:sha256:${'c'.repeat(64)}`,
    configuration_digest: DIGEST_A,
  },
  profile_registry: {
    registry_ref: 'evidence/control/source-profile-registry.json',
    registry_digest: runtimeProfileRegistryDigest(endpointRegistryEntries),
    entries: endpointRegistryEntries,
  },
  components: [{
    component_id: 'endpoint-agent',
    repository: 'quilrbusiness/sentinel-endpoint-agent',
    branch: 'feat/die-endpoint',
    commit_sha: 'b'.repeat(40),
    artifact_digest: DIGEST_B,
    contract_digest: DIGEST_A,
    role: 'endpoint',
    clean_tree: true,
    provenance: 'exact_source_build',
    build_ref: 'evidence/build/endpoint-agent.json',
  }],
  stores: {
    postgresql: {
      version: '17.10',
      endpoint_ref: 'secret-ref:pg',
      configuration_digest: DIGEST_A,
    },
    object_store: {
      provider: 's3-compatible',
      version: '2026.1',
      endpoint_ref: 'secret-ref:object',
      configuration_digest: DIGEST_A,
    },
    clickhouse: {
      version: '26.3',
      endpoint_ref: 'secret-ref:ch',
      configuration_digest: DIGEST_A,
    },
  },
  producers: [{
    profile: 'endpoint',
    profile_version: '1.0.0',
    producer_id: '22222222-2222-4222-8222-222222222222',
    installation_id: 'endpoint-installation-1',
    certification_id: '33333333-3333-4333-8333-333333333333',
    component_id: 'endpoint-agent',
    artifact_digest: DIGEST_B,
    configuration_digest: DIGEST_A,
    credential_class: 'workload_jwt',
  }],
  customer_endpoints: {
    api: 'http://127.0.0.1:62069/die/v1',
    bff: 'http://127.0.0.1:3000/die/v1',
    ui: 'http://127.0.0.1:3000/estate',
  },
  contamination: {
    mixed_candidates: false,
    dirty_components: false,
    manual_database_mutation: false,
    untracked_hotfixes: false,
    overlapping_runtime: false,
    notes: [],
  },
  created_at: '2026-08-04T12:00:00Z',
  started_at: '2026-08-04T12:01:00Z',
  evidence_ref: 'evidence/runtime/runtime-manifest-validator',
  limitations: ['Endpoint-only validator fixture'],
}

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

function assertValid(manifest, label) {
  const errors = validateRuntimeManifest(manifest)
  if (errors.length)
    throw new Error(`${label} unexpectedly failed:\n${errors.join('\n')}`)
}

function assertRejected(manifest, expected, label) {
  const errors = validateRuntimeManifest(manifest)
  if (!errors.some(error => error.includes(expected))) {
    throw new Error(
      `${label} did not produce expected error ${JSON.stringify(expected)}:\n${errors.join('\n')}`,
    )
  }
}

assertValid(validManifest, 'matching Endpoint producer/component provenance')

const roleMismatch = copy(validManifest)
roleMismatch.components[0].role = 'api'
assertRejected(
  roleMismatch,
  'referenced component role api does not match registered profile role endpoint',
  'producer/component role mismatch',
)

const artifactMismatch = copy(validManifest)
artifactMismatch.producers[0].artifact_digest = `sha256:${'d'.repeat(64)}`
assertRejected(
  artifactMismatch,
  'artifact_digest does not match referenced component endpoint-agent artifact_digest',
  'producer/component artifact mismatch',
)

const registeredExtension = copy(validManifest)
const extensionEntry = {
  profile: 'salesforce.discovery',
  profile_version: '1.0.0',
  component_role: 'connector_poller',
  schema_digest: `sha256:${'f'.repeat(64)}`,
}
registeredExtension.profile_registry.entries = [extensionEntry]
registeredExtension.profile_registry.registry_digest = runtimeProfileRegistryDigest([extensionEntry])
registeredExtension.components[0].component_id = 'salesforce-poller'
registeredExtension.components[0].repository = 'quilrbusiness/salesforce-connector'
registeredExtension.components[0].role = 'connector_poller'
registeredExtension.producers[0].profile = 'salesforce.discovery'
registeredExtension.producers[0].component_id = 'salesforce-poller'
assertValid(registeredExtension, 'registered connector extension provenance')

const unregisteredExtension = copy(registeredExtension)
unregisteredExtension.producers[0].profile = 'unregistered.discovery'
assertRejected(
  unregisteredExtension,
  'profile unregistered.discovery@1.0.0 is not admitted by the bound profile registry',
  'unregistered connector extension',
)

const illegalExtensionRole = copy(registeredExtension)
illegalExtensionRole.profile_registry.entries[0].component_role = 'api'
illegalExtensionRole.profile_registry.registry_digest = runtimeProfileRegistryDigest(
  illegalExtensionRole.profile_registry.entries,
)
illegalExtensionRole.components[0].role = 'api'
assertRejected(
  illegalExtensionRole,
  'extension profile salesforce.discovery must use a connector component role',
  'connector extension using a platform role',
)

const registryDigestMismatch = copy(validManifest)
registryDigestMismatch.profile_registry.registry_digest = DIGEST_A
assertRejected(
  registryDigestMismatch,
  'manifest.profile_registry.registry_digest mismatch',
  'profile registry digest mismatch',
)

console.log('DIE runtime manifest semantic tests passed: 2 accepted; 5 rejected.')

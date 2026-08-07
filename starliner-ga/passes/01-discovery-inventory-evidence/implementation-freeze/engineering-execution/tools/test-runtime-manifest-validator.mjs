#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  runtimeProfileRegistryDigest,
  validateRuntimeManifest,
  validateRuntimeManifestFile,
  validateSourceProductPath,
} from './validate-runtime-manifest.mjs'
import { validateExecutionStatus } from './product-delivery-state-lib.mjs'

const DIGEST_A = `sha256:${'a'.repeat(64)}`
const DIGEST_B = `sha256:${'b'.repeat(64)}`
const DIGEST_C = `sha256:${'c'.repeat(64)}`
const ENDPOINT_KINDS = new Map([
  ['endpoint-agent', 'endpoint_agent'],
  ['endpoint-monitor', 'endpoint_monitor'],
  ['endpoint-proxy', 'endpoint_proxy'],
  ['endpoint-ipc-broker', 'endpoint_ipc_broker'],
  ['endpoint-template-engine', 'endpoint_template_engine'],
  ['endpoint-system-extension', 'endpoint_system_extension'],
])

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

function digestBytes(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function canonicalJson(value) {
  if (Array.isArray(value))
    return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function componentRole(profile, componentId) {
  if (profile === 'endpoint')
    return ENDPOINT_KINDS.get(componentId)
  if (profile === 'browser')
    return componentId === 'browser-extension' ? 'browser_extension' : 'browser_native_host'
  if (profile === 'browser_backend')
    return 'browser_backend'
  if (profile === 'llm_gateway')
    return componentId.includes('edge') ? 'llm_edge_runtime' : 'llm_gateway'
  if (profile === 'mcp_gateway')
    return componentId.includes('edge') ? 'mcp_edge_runtime' : 'mcp_gateway'
  return 'connector'
}

function componentSetFor(manifest) {
  const producer = manifest.producers[0]
  const runtimeComponents = producer.component_ids.map(componentId => (
    manifest.components.find(item => item.component_id === componentId)
  ))
  const value = {
    schema_version: 'starliner.producer-component-set.v1',
    component_set_id: '44444444-4444-4444-8444-444444444444',
    component_set_digest: DIGEST_A,
    source_profile: producer.profile,
    measured_at: '2026-08-04T12:00:00Z',
    packages: runtimeComponents.map(component => ({
      package_id: `${component.component_id}-package`,
      product: component.component_id,
      version: '1.0.0',
      format: component.installation_class === 'browser_extension' ? 'chrome_extension' : 'binary_bundle',
      source_repository: component.repository,
      source_commit: component.commit_sha,
      package_digest: component.install_artifact_digest,
      build_evidence_ref: `evidence/build/${component.component_id}.json`,
    })),
    components: runtimeComponents.map(component => ({
      component_id: component.component_id,
      package_id: `${component.component_id}-package`,
      role: componentRole(producer.profile, component.component_id),
      product: component.component_id,
      version: '1.0.0',
      source_repository: component.repository,
      source_commit: component.commit_sha,
      package_member_path: component.component_id,
      package_member_digest: component.artifact_digest,
      installed_artifact_digest: component.installed_artifact_digest,
      runtime_artifact_digest: component.artifact_digest,
      runtime_identity: component.service_unit,
    })),
    ownership: {
      capture_component_ids: producer.component_ids,
      wal_component_id: producer.component_id,
      wal_component_role: componentRole(producer.profile, producer.component_id),
      delivery_component_id: producer.component_id,
      delivery_component_role: componentRole(producer.profile, producer.component_id),
      health_component_ids: producer.component_ids,
    },
  }
  const unsigned = copy(value)
  delete unsigned.component_set_digest
  value.component_set_digest = digestBytes(canonicalJson(unsigned))
  producer.component_set_digest = value.component_set_digest
  return value
}

function runtimeComponent(componentId, role = 'endpoint', overrides = {}) {
  const serviceUnit = overrides.service_unit || `com.quilr.${componentId}`
  return {
    component_id: componentId,
    repository: 'quilrbusiness/sentinel-endpoint-agent',
    branch: 'feat/die-endpoint',
    commit_sha: 'b'.repeat(40),
    artifact_digest: DIGEST_B,
    contract_digest: DIGEST_A,
    role,
    clean_tree: true,
    provenance: 'exact_source_build',
    build_ref: `evidence/build/${componentId}.json`,
    installation_class: 'package',
    install_artifact_digest: DIGEST_B,
    installed_artifact_digest: DIGEST_B,
    installed_path_ref: `evidence/install/${componentId}-path.json`,
    supervisor: 'launchd',
    service_unit: serviceUnit,
    runtime_identity: overrides.runtime_identity || serviceUnit,
    normal_entrypoint: `evidence/install/${componentId}-entrypoint.json`,
    effective_configuration_digest: DIGEST_A,
    installation_evidence_ref: `evidence/install/${componentId}.json`,
    ...overrides,
  }
}

function registryEntry(profile, componentRole = profile) {
  return {
    profile,
    profile_version: '1.0.0',
    component_role: componentRole,
    schema_digest: `sha256:${'e'.repeat(64)}`,
  }
}

function baseManifest() {
  const endpointEntries = [registryEntry('endpoint')]
  const components = [...ENDPOINT_KINDS.keys()].map(componentId => runtimeComponent(componentId))
  return {
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
      registry_digest: runtimeProfileRegistryDigest(endpointEntries),
      entries: endpointEntries,
    },
    components,
    stores: {
      postgresql: { version: '17.10', endpoint_ref: 'secret-ref:pg', configuration_digest: DIGEST_A },
      object_store: {
        provider: 's3-compatible', version: '2026.1',
        endpoint_ref: 'secret-ref:object', configuration_digest: DIGEST_A,
      },
      clickhouse: { version: '26.3', endpoint_ref: 'secret-ref:ch', configuration_digest: DIGEST_A },
    },
    producers: [{
      profile: 'endpoint',
      profile_version: '1.0.0',
      producer_id: '22222222-2222-4222-8222-222222222222',
      installation_id: 'endpoint-installation-1',
      certification_id: '33333333-3333-4333-8333-333333333333',
      component_id: 'endpoint-agent',
      component_ids: components.map(component => component.component_id),
      artifact_digest: DIGEST_B,
      component_set_digest: DIGEST_C,
      configuration_digest: DIGEST_A,
      credential_class: 'dpop_jwt',
      credential_issuer_class: 'starliner_control',
      enrollment_evidence_ref: 'evidence/enrollment/endpoint-agent.json',
      source_product_path_ref: 'source-path/endpoint.yaml',
      source_product_path_digest: DIGEST_A,
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
      manual_configuration_override: false,
      parallel_product_daemon: false,
      devtools_or_storage_injection: false,
      synthetic_identity_or_persona: false,
      fixture_interior_stage: false,
      uninstalled_artifact: false,
      normal_entrypoint_bypassed: false,
      notes: [],
    },
    created_at: '2026-08-04T12:00:00Z',
    started_at: '2026-08-04T12:01:00Z',
    evidence_ref: 'evidence/runtime/runtime-manifest-validator',
    limitations: ['Endpoint-only validator fixture'],
  }
}

function sourceKind(profile, componentId) {
  if (profile === 'endpoint')
    return ENDPOINT_KINDS.get(componentId)
  if (profile === 'browser')
    return componentId === 'browser-extension' ? 'browser_extension' : 'browser_native_host'
  if (profile === 'browser_backend')
    return 'browser_backend'
  if (profile === 'llm_gateway' || profile === 'mcp_gateway')
    return 'gateway_service'
  return 'connector'
}

function sourcePathFor(manifest) {
  const producer = manifest.producers[0]
  const primary = manifest.components.find(component => component.component_id === producer.component_id)
  const componentSet = componentSetFor(manifest)
  const binding = {
    schema_version: '1.0',
    schema: 'die.source-product-path.v1',
    binding_id: `${producer.profile.replaceAll('.', '-')}-installed-path`,
    profile: producer.profile,
    logical_sensor: ['browser', 'browser_backend', 'endpoint', 'llm_gateway', 'mcp_gateway']
      .includes(producer.profile) ? producer.profile : 'connector',
    authority_commit: manifest.authority_commit,
    source_commit: primary.commit_sha,
    normal_path_state: 'COHERENT_E2E',
    installation: {
      documentation_refs: ['evidence/install/documentation.json'],
      installer_repository: primary.repository,
      installer_commit: primary.commit_sha,
      install_artifact_ref: `evidence/install/${producer.component_id}-package.bin`,
      install_artifact_digest: primary.install_artifact_digest,
      normal_install_command_ref: 'evidence/install/normal-command.json',
      installation_evidence_ref: 'evidence/install/product-installation.json',
    },
    component_set: componentSet,
    package_installations: componentSet.packages.map(item => ({
      package_id: item.package_id,
      component_ids: componentSet.components
        .filter(component => component.package_id === item.package_id)
        .map(component => component.component_id),
      package_artifact_ref: `evidence/install/${item.package_id}.bin`,
      package_artifact_digest: item.package_digest,
      install_manifest_ref: `evidence/install/${item.package_id}-manifest.json`,
      install_manifest_digest: DIGEST_A,
      installation_evidence_ref: `evidence/install/${item.package_id}-observation.json`,
    })),
    organization_context: {
      tenant_input_kind: 'organization_tenant_uuid',
      tenant_source_symbol: 'enrollment.organization_tenant_id',
      discovery_or_bootstrap_symbol: 'starliner.control.enroll',
      persona_or_workload_prerequisite: 'installed-product enrollment prerequisite',
      effective_configuration_source: 'signed edge configuration',
    },
    enrollment: {
      production_writer_symbol: 'starliner.control.enroll',
      credential_issuer: 'starliner_control',
      credential_store: 'installed-product secure store',
      producer_identity_source: 'signed enrollment response producer_id',
      installation_identity_source: 'signed enrollment response installation_id',
      evidence_ref: producer.enrollment_evidence_ref,
      status: 'RUNTIME_OBSERVED',
    },
    components: producer.component_ids.map(componentId => {
      const component = manifest.components.find(item => item.component_id === componentId)
      return {
        component_id: componentId,
        component_kind: sourceKind(producer.profile, componentId),
        repository: component.repository,
        source_commit: component.commit_sha,
        installed_artifact_ref: component.installed_path_ref,
        installed_artifact_digest: component.installed_artifact_digest,
        supervisor: component.supervisor,
        service_unit: component.service_unit,
        normal_entrypoint: component.normal_entrypoint,
        effective_configuration_digest: component.effective_configuration_digest,
        installation_evidence_ref: component.installation_evidence_ref,
        configuration_evidence_ref: `evidence/config/${componentId}.json`,
        observation_ownership: componentId === producer.component_id ? 'originating' : 'supporting',
      }
    }),
    data_path: {
      native_capture_symbols: ['native.capture.entrypoint'],
      native_capture_evidence_refs: ['evidence/data/native-capture.json'],
      privacy_mapper_symbol: 'adapter.privacy.map',
      wal_owner_component_id: producer.component_id,
      wal_owner_component_kind: sourceKind(producer.profile, producer.component_id),
      wal_owner_symbol: 'starliner.edge.wal',
      wal_evidence_ref: 'evidence/data/wal.json',
      sender_component_id: producer.component_id,
      sender_component_kind: sourceKind(producer.profile, producer.component_id),
      sender_symbol: 'starliner.edge.sender',
      sender_evidence_ref: 'evidence/data/sender.json',
      receipt_handler_symbol: 'starliner.edge.receipt',
      receipt_evidence_ref: 'evidence/data/ingest-receipt.json',
      relay_lineage_rule: 'preserve originating component and native source identity',
    },
    prerequisites: [{
      prerequisite_id: 'TENANT_INPUT',
      class: 'EXTERNAL_CREDENTIAL',
      required_input_or_action: 'Supply the organization tenant identifier through normal enrollment.',
      status: 'SATISFIED',
      evidence_ref: 'evidence/prerequisites/tenant.json',
    }],
    prohibited_bypasses: [
      'fixed_shared_identity_or_token',
      'second_tenant_or_persona_shim',
      'manual_storage_or_devtools_injection',
      'manual_plist_env_or_sql_override',
      'alternate_or_parallel_daemon',
      'fake_dirty_or_mixed_artifact_provenance',
      'fixture_interior_stage',
      'normal_entrypoint_bypass',
    ],
    evidence_bindings: [],
    evidence_refs: ['evidence/general/source-path-summary.json'],
  }

  const addEvidence = (ref, evidence_kind, digest = DIGEST_A) => {
    if (!binding.evidence_bindings.some(item => item.ref === ref))
      binding.evidence_bindings.push({ ref, digest, evidence_kind })
  }
  binding.installation.documentation_refs.forEach(ref => addEvidence(ref, 'installation_documentation'))
  addEvidence(binding.installation.install_artifact_ref, 'installation_artifact', binding.installation.install_artifact_digest)
  addEvidence(binding.installation.normal_install_command_ref, 'installation_command')
  addEvidence(binding.installation.installation_evidence_ref, 'installation_observation')
  for (const item of binding.component_set.packages)
    addEvidence(item.build_evidence_ref, 'package_build_evidence')
  for (const item of binding.package_installations) {
    addEvidence(item.package_artifact_ref, 'installation_artifact', item.package_artifact_digest)
    addEvidence(item.install_manifest_ref, 'package_install_manifest', item.install_manifest_digest)
    addEvidence(item.installation_evidence_ref, 'installation_observation')
  }
  addEvidence(binding.enrollment.evidence_ref, 'enrollment_observation')
  for (const component of binding.components) {
    addEvidence(component.installed_artifact_ref, 'component_installed_artifact', component.installed_artifact_digest)
    addEvidence(component.installation_evidence_ref, 'component_installation_observation')
    addEvidence(component.configuration_evidence_ref, 'component_configuration_observation', component.effective_configuration_digest)
  }
  binding.data_path.native_capture_evidence_refs.forEach(ref => addEvidence(ref, 'native_capture_observation'))
  addEvidence(binding.data_path.wal_evidence_ref, 'wal_observation')
  addEvidence(binding.data_path.sender_evidence_ref, 'sender_observation')
  addEvidence(binding.data_path.receipt_evidence_ref, 'ingest_receipt')
  binding.prerequisites.forEach(item => addEvidence(item.evidence_ref, 'prerequisite_observation'))
  binding.evidence_refs.forEach(ref => addEvidence(ref, 'general'))
  return binding
}

function sourceContext(manifest, binding = sourcePathFor(manifest), synchronizeDigest = true) {
  const digest = digestBytes(JSON.stringify(binding))
  if (synchronizeDigest)
    manifest.producers[0].source_product_path_digest = digest
  return {
    sourceProductPaths: new Map([[
      manifest.producers[0].source_product_path_ref,
      { binding, digest, resolvedPath: 'in-memory-test-source-path' },
    ]]),
  }
}

let acceptedCount = 0
let rejectedCount = 0

function assertValid(manifest, label, binding = sourcePathFor(manifest)) {
  const errors = validateRuntimeManifest(manifest, sourceContext(manifest, binding))
  if (errors.length)
    throw new Error(`${label} unexpectedly failed:\n${errors.join('\n')}`)
  acceptedCount += 1
}

function assertRejected(manifest, expected, label, binding = sourcePathFor(manifest), synchronizeDigest = true) {
  const errors = validateRuntimeManifest(manifest, sourceContext(manifest, binding, synchronizeDigest))
  if (!errors.some(error => error.includes(expected))) {
    throw new Error(
      `${label} did not produce expected error ${JSON.stringify(expected)}:\n${errors.join('\n')}`,
    )
  }
  rejectedCount += 1
}

const validManifest = baseManifest()
assertValid(validManifest, 'matching Endpoint compound-product provenance')

const noSourceContext = baseManifest()
const noSourceErrors = validateRuntimeManifest(noSourceContext)
if (!noSourceErrors.some(error => error.includes('was not loaded and semantically validated')))
  throw new Error(`coherent manifest without loaded source path was accepted:\n${noSourceErrors.join('\n')}`)
rejectedCount += 1

const incompleteBypassPath = sourcePathFor(baseManifest())
incompleteBypassPath.prohibited_bypasses.pop()
assertRejected(
  baseManifest(),
  'complete prohibited-bypass set',
  'coherent path omitting a required prohibited bypass',
  incompleteBypassPath,
)

const unknownBypassPath = sourcePathFor(baseManifest())
unknownBypassPath.prohibited_bypasses[0] = 'none'
assertRejected(
  baseManifest(),
  'contains unknown value none',
  'coherent path using an arbitrary prohibited-bypass assertion',
  unknownBypassPath,
)

const roleMismatch = baseManifest()
roleMismatch.components[0].role = 'api'
assertRejected(
  roleMismatch,
  'referenced component role api does not match registered profile role endpoint',
  'producer/component role mismatch',
)

const artifactMismatch = baseManifest()
artifactMismatch.producers[0].artifact_digest = `sha256:${'d'.repeat(64)}`
assertRejected(
  artifactMismatch,
  'artifact_digest does not match referenced component endpoint-agent artifact_digest',
  'producer/component artifact mismatch',
)

const genericJwt = baseManifest()
genericJwt.producers[0].credential_class = 'workload_jwt'
assertRejected(
  genericJwt,
  'must use enrollment-issued dpop_jwt credentials',
  'coherent installed producer using generic bearer JWT',
)

const registeredExtension = baseManifest()
const extensionEntry = registryEntry('salesforce.discovery', 'connector_poller')
registeredExtension.profile_registry.entries = [extensionEntry]
registeredExtension.profile_registry.registry_digest = runtimeProfileRegistryDigest([extensionEntry])
registeredExtension.components = [runtimeComponent('salesforce-poller', 'connector_poller', {
  repository: 'quilrbusiness/salesforce-connector',
})]
Object.assign(registeredExtension.producers[0], {
  profile: 'salesforce.discovery',
  component_id: 'salesforce-poller',
  component_ids: ['salesforce-poller'],
  credential_class: 'oidc_workload',
  artifact_digest: DIGEST_B,
})
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

const registryDigestMismatch = baseManifest()
registryDigestMismatch.profile_registry.registry_digest = DIGEST_A
assertRejected(
  registryDigestMismatch,
  'manifest.profile_registry.registry_digest mismatch',
  'profile registry digest mismatch',
)

const browserCompound = baseManifest()
const browserEntry = registryEntry('browser')
browserCompound.profile_registry.entries = [browserEntry]
browserCompound.profile_registry.registry_digest = runtimeProfileRegistryDigest([browserEntry])
browserCompound.components = [
  runtimeComponent('browser-extension', 'browser', {
    repository: 'quilrbusiness/Project-Vanguard',
    installation_class: 'browser_extension',
    supervisor: 'browser_runtime',
    service_unit: 'managed-extension-id',
  }),
  runtimeComponent('browser-native-host', 'browser', {
    repository: 'quilrbusiness/project-sentinel',
    service_unit: 'com.quilr.sentinel.native',
  }),
]
Object.assign(browserCompound.producers[0], {
  profile: 'browser',
  component_id: 'browser-extension',
  component_ids: ['browser-extension', 'browser-native-host'],
  artifact_digest: DIGEST_B,
})
assertValid(browserCompound, 'Browser compound extension and native-host producer')

const browserNativeDeliveryPath = sourcePathFor(browserCompound)
browserNativeDeliveryPath.data_path.wal_owner_component_id = 'browser-native-host'
browserNativeDeliveryPath.data_path.wal_owner_component_kind = 'browser_native_host'
browserNativeDeliveryPath.data_path.sender_component_id = 'browser-native-host'
browserNativeDeliveryPath.data_path.sender_component_kind = 'browser_native_host'
assertRejected(
  copy(browserCompound),
  'Browser Extension must be the sole WAL and delivery owner',
  'Browser native host falsely claiming WAL/delivery ownership',
  browserNativeDeliveryPath,
)

const browserNativePrimary = copy(browserCompound)
browserNativePrimary.producers[0].component_id = 'browser-native-host'
browserNativePrimary.producers[0].artifact_digest = browserNativePrimary.components[1].artifact_digest
assertRejected(
  browserNativePrimary,
  'primary Browser component must be the Browser Extension',
  'Browser native host falsely selected as primary delivery component',
  sourcePathFor(browserNativePrimary),
)

for (const [profile, componentId, repository] of [
  ['browser_backend', 'browser-backend', 'quilrbusiness/browser-extension-service'],
  ['llm_gateway', 'llm-gateway', 'quilrbusiness/macrodata-refinement'],
  ['mcp_gateway', 'mcp-gateway', 'quilrbusiness/quilr-llm-gateway'],
]) {
  const manifest = baseManifest()
  const entry = registryEntry(profile)
  manifest.profile_registry.entries = [entry]
  manifest.profile_registry.registry_digest = runtimeProfileRegistryDigest([entry])
  manifest.components = [runtimeComponent(componentId, profile, {
    repository,
    installation_class: 'container_image',
    supervisor: 'kubernetes',
    service_unit: `${profile}-deployment`,
  })]
  Object.assign(manifest.producers[0], {
    profile,
    component_id: componentId,
    component_ids: [componentId],
    artifact_digest: DIGEST_B,
  })
  assertValid(manifest, `${profile} installed producer provenance`)
}

const missingBrowserNativePath = sourcePathFor(browserCompound)
missingBrowserNativePath.components = missingBrowserNativePath.components
  .filter(component => component.component_kind !== 'browser_native_host')
assertRejected(
  copy(browserCompound),
  'lacks required component kind browser_native_host',
  'Browser source path without native host',
  missingBrowserNativePath,
)

const unknownCompoundComponent = copy(browserCompound)
const knownBrowserPath = sourcePathFor(browserCompound)
unknownCompoundComponent.producers[0].component_ids.push('missing-native-host')
assertRejected(
  unknownCompoundComponent,
  'component_ids references unknown component missing-native-host',
  'compound producer with unknown component',
  knownBrowserPath,
)

const missingEndpointProxyPath = sourcePathFor(baseManifest())
missingEndpointProxyPath.components = missingEndpointProxyPath.components
  .filter(component => component.component_kind !== 'endpoint_proxy')
assertRejected(
  baseManifest(),
  'lacks required component kind endpoint_proxy',
  'Endpoint source path without proxy component',
  missingEndpointProxyPath,
)

const sourceWrongProfile = sourcePathFor(baseManifest())
sourceWrongProfile.profile = 'browser'
sourceWrongProfile.logical_sensor = 'browser'
assertRejected(
  baseManifest(),
  'source product path profile browser does not match endpoint',
  'source product path with wrong profile',
  sourceWrongProfile,
)

const sourceEnrollmentNotObserved = sourcePathFor(baseManifest())
sourceEnrollmentNotObserved.enrollment.status = 'SOURCE_PROVEN'
assertRejected(
  baseManifest(),
  'enrollment is not RUNTIME_OBSERVED',
  'source product path without runtime-observed enrollment',
  sourceEnrollmentNotObserved,
)

const sourceDigestMismatch = baseManifest()
sourceDigestMismatch.producers[0].source_product_path_digest = DIGEST_A
assertRejected(
  sourceDigestMismatch,
  'does not match exact referenced file bytes',
  'source product path digest mismatch',
  sourcePathFor(sourceDigestMismatch),
  false,
)

const missingInstalledBinding = baseManifest()
missingInstalledBinding.components[0].installed_artifact_digest = 'UNASSIGNED'
assertRejected(
  missingInstalledBinding,
  'lacks installed-product digest binding',
  'coherent runtime without installed artifact binding',
)

for (const field of [
  'manual_configuration_override', 'normal_entrypoint_bypassed', 'parallel_product_daemon',
  'devtools_or_storage_injection', 'synthetic_identity_or_persona', 'fixture_interior_stage',
  'uninstalled_artifact',
]) {
  const contaminated = baseManifest()
  contaminated.contamination[field] = true
  assertRejected(
    contaminated,
    `coherent runtime cannot set contamination.${field}`,
    `coherent runtime with ${field}`,
  )
}

const missingEnrollment = baseManifest()
missingEnrollment.producers[0].enrollment_evidence_ref = 'UNASSIGNED'
assertRejected(
  missingEnrollment,
  'lacks real enrollment and source-product-path binding',
  'coherent runtime without real enrollment evidence',
)

const syntheticCoherent = baseManifest()
syntheticCoherent.producers[0].credential_class = 'preview_synthetic'
syntheticCoherent.producers[0].credential_issuer_class = 'preview_synthetic'
assertRejected(
  syntheticCoherent,
  'allowed only in DEV_PREVIEW',
  'coherent runtime with synthetic enrollment',
)

const syntheticPreview = baseManifest()
syntheticPreview.runtime_mode = 'DEV_PREVIEW'
syntheticPreview.producers[0].credential_class = 'preview_synthetic'
syntheticPreview.producers[0].credential_issuer_class = 'preview_synthetic'
const previewErrors = validateRuntimeManifest(syntheticPreview)
if (previewErrors.length)
  throw new Error(`DEV_PREVIEW with explicitly synthetic enrollment unexpectedly failed:\n${previewErrors.join('\n')}`)
acceptedCount += 1

const unassignedSourceTemplate = {
  schema_version: '1.0',
  schema: 'die.source-product-path.v1',
  binding_id: 'UNASSIGNED',
  profile: 'UNASSIGNED',
  logical_sensor: 'UNASSIGNED',
  authority_commit: 'UNASSIGNED',
  source_commit: 'UNASSIGNED',
  normal_path_state: 'UNASSIGNED',
  installation: {
    documentation_refs: [], installer_repository: 'UNASSIGNED', installer_commit: 'UNASSIGNED',
    install_artifact_ref: 'UNASSIGNED', install_artifact_digest: 'UNASSIGNED',
    normal_install_command_ref: 'UNASSIGNED', installation_evidence_ref: 'UNASSIGNED',
  },
  component_set: 'UNASSIGNED',
  package_installations: [],
  organization_context: {
    tenant_input_kind: 'UNASSIGNED', tenant_source_symbol: 'UNASSIGNED',
    discovery_or_bootstrap_symbol: 'UNASSIGNED', persona_or_workload_prerequisite: 'UNASSIGNED',
    effective_configuration_source: 'UNASSIGNED',
  },
  enrollment: {
    production_writer_symbol: 'UNASSIGNED', credential_issuer: 'UNASSIGNED',
    credential_store: 'UNASSIGNED', producer_identity_source: 'UNASSIGNED',
    installation_identity_source: 'UNASSIGNED', evidence_ref: 'UNASSIGNED', status: 'UNASSIGNED',
  },
  components: [],
  data_path: {
    native_capture_symbols: [], native_capture_evidence_refs: [],
    privacy_mapper_symbol: 'UNASSIGNED',
    wal_owner_component_id: 'UNASSIGNED', wal_owner_component_kind: 'UNASSIGNED',
    wal_owner_symbol: 'UNASSIGNED', wal_evidence_ref: 'UNASSIGNED',
    sender_component_id: 'UNASSIGNED', sender_component_kind: 'UNASSIGNED',
    sender_symbol: 'UNASSIGNED', sender_evidence_ref: 'UNASSIGNED',
    receipt_handler_symbol: 'UNASSIGNED', receipt_evidence_ref: 'UNASSIGNED',
    relay_lineage_rule: 'UNASSIGNED',
  },
  prerequisites: [],
  prohibited_bypasses: [],
  evidence_bindings: [],
  evidence_refs: [],
}
const sourceTemplateErrors = validateSourceProductPath(unassignedSourceTemplate)
if (sourceTemplateErrors.length)
  throw new Error(`UNASSIGNED source path template unexpectedly failed:\n${sourceTemplateErrors.join('\n')}`)
acceptedCount += 1

function materializeBoundEvidence(root, manifest, binding) {
  const runtimeById = new Map(manifest.components.map(component => [component.component_id, component]))
  const evidenceByRef = new Map(binding.evidence_bindings.map(item => [item.ref, item]))
  for (const evidence of binding.evidence_bindings) {
    const bytes = `${evidence.evidence_kind}:${evidence.ref}\n`
    mkdirSync(dirname(join(root, evidence.ref)), { recursive: true })
    writeFileSync(join(root, evidence.ref), bytes)
    evidence.digest = digestBytes(bytes)
  }
  binding.installation.install_artifact_digest = evidenceByRef
    .get(binding.installation.install_artifact_ref).digest
  const primaryRuntime = runtimeById.get(manifest.producers[0].component_id)
  primaryRuntime.install_artifact_digest = binding.installation.install_artifact_digest
  for (const sourceComponent of binding.components) {
    const runtimeComponent = runtimeById.get(sourceComponent.component_id)
    sourceComponent.installed_artifact_digest = evidenceByRef
      .get(sourceComponent.installed_artifact_ref).digest
    sourceComponent.effective_configuration_digest = evidenceByRef
      .get(sourceComponent.configuration_evidence_ref).digest
    runtimeComponent.installed_artifact_digest = sourceComponent.installed_artifact_digest
    runtimeComponent.artifact_digest = sourceComponent.installed_artifact_digest
    runtimeComponent.effective_configuration_digest = sourceComponent.effective_configuration_digest
    const measured = binding.component_set.components.find(item => item.component_id === sourceComponent.component_id)
    measured.installed_artifact_digest = sourceComponent.installed_artifact_digest
    measured.runtime_artifact_digest = runtimeComponent.artifact_digest
    measured.package_member_digest = runtimeComponent.artifact_digest
  }
  for (const installation of binding.package_installations) {
    installation.package_artifact_digest = evidenceByRef.get(installation.package_artifact_ref).digest
    installation.install_manifest_digest = evidenceByRef.get(installation.install_manifest_ref).digest
    const measuredPackage = binding.component_set.packages.find(item => item.package_id === installation.package_id)
    measuredPackage.package_digest = installation.package_artifact_digest
    for (const componentId of installation.component_ids)
      runtimeById.get(componentId).install_artifact_digest = installation.package_artifact_digest
  }
  const unsignedSet = copy(binding.component_set)
  delete unsignedSet.component_set_digest
  binding.component_set.component_set_digest = digestBytes(canonicalJson(unsignedSet))
  manifest.producers[0].component_set_digest = binding.component_set.component_set_digest
  manifest.producers[0].artifact_digest = primaryRuntime.artifact_digest
  manifest.producers[0].configuration_digest = primaryRuntime.effective_configuration_digest
}

function runFileValidation({
  manifest,
  binding,
  writeBinding = true,
  wrongDigest = false,
  materializeEvidence = true,
  mutateAfterMaterialization,
}) {
  const root = mkdtempSync(join(tmpdir(), 'die-runtime-manifest-'))
  try {
    mkdirSync(join(root, 'source-path'), { recursive: true })
    if (writeBinding) {
      if (materializeEvidence)
        materializeBoundEvidence(root, manifest, binding)
      if (mutateAfterMaterialization)
        mutateAfterMaterialization({ root, manifest, binding })
      const sourceBytes = `${JSON.stringify(binding, null, 2)}\n`
      writeFileSync(join(root, manifest.producers[0].source_product_path_ref), sourceBytes)
      manifest.producers[0].source_product_path_digest = wrongDigest ? DIGEST_A : digestBytes(sourceBytes)
    }
    const manifestPath = join(root, 'runtime-manifest.yaml')
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    return validateRuntimeManifestFile(manifestPath, undefined, root)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}

const fileManifest = baseManifest()
const fileErrors = runFileValidation({ manifest: fileManifest, binding: sourcePathFor(fileManifest) })
if (fileErrors.length)
  throw new Error(`exact-file source product path unexpectedly failed:\n${fileErrors.join('\n')}`)
acceptedCount += 1

const missingEvidenceManifest = baseManifest()
const missingEvidenceBinding = sourcePathFor(missingEvidenceManifest)
const missingEvidenceErrors = runFileValidation({
  manifest: missingEvidenceManifest,
  binding: missingEvidenceBinding,
  mutateAfterMaterialization: ({ root, binding }) => {
    rmSync(join(root, binding.data_path.wal_evidence_ref))
  },
})
if (!missingEvidenceErrors.some(error => error.includes('.ref does not exist'))) {
  throw new Error(`missing bound evidence file was accepted:\n${missingEvidenceErrors.join('\n')}`)
}
rejectedCount += 1

const evidenceDigestManifest = baseManifest()
const evidenceDigestBinding = sourcePathFor(evidenceDigestManifest)
const evidenceDigestErrors = runFileValidation({
  manifest: evidenceDigestManifest,
  binding: evidenceDigestBinding,
  mutateAfterMaterialization: ({ root, binding }) => {
    writeFileSync(join(root, binding.data_path.sender_evidence_ref), 'tampered-after-binding\n')
  },
})
if (!evidenceDigestErrors.some(error => error.includes('digest does not match exact referenced file bytes'))) {
  throw new Error(`bound evidence digest drift was accepted:\n${evidenceDigestErrors.join('\n')}`)
}
rejectedCount += 1

const evidenceTraversalManifest = baseManifest()
const evidenceTraversalBinding = sourcePathFor(evidenceTraversalManifest)
evidenceTraversalBinding.evidence_bindings.find(
  item => item.ref === evidenceTraversalBinding.data_path.receipt_evidence_ref,
).ref = '../receipt.json'
const evidenceTraversalErrors = runFileValidation({
  manifest: evidenceTraversalManifest,
  binding: evidenceTraversalBinding,
  materializeEvidence: false,
})
if (!evidenceTraversalErrors.some(error => error.includes('safe relative retained-evidence'))) {
  throw new Error(`bound evidence traversal was accepted:\n${evidenceTraversalErrors.join('\n')}`)
}
rejectedCount += 1

const wrongEvidenceKindManifest = baseManifest()
const wrongEvidenceKindBinding = sourcePathFor(wrongEvidenceKindManifest)
wrongEvidenceKindBinding.evidence_bindings.find(
  item => item.ref === wrongEvidenceKindBinding.data_path.wal_evidence_ref,
).evidence_kind = 'sender_observation'
const wrongEvidenceKindErrors = runFileValidation({
  manifest: wrongEvidenceKindManifest,
  binding: wrongEvidenceKindBinding,
})
if (!wrongEvidenceKindErrors.some(error => error.includes('requires evidence_kind wal_observation'))) {
  throw new Error(`wrong evidence kind was accepted:\n${wrongEvidenceKindErrors.join('\n')}`)
}
rejectedCount += 1

const missingEvidenceBindingManifest = baseManifest()
const missingEvidenceBindingPath = sourcePathFor(missingEvidenceBindingManifest)
missingEvidenceBindingPath.evidence_bindings = missingEvidenceBindingPath.evidence_bindings.filter(
  item => item.ref !== missingEvidenceBindingPath.enrollment.evidence_ref,
)
const missingEvidenceBindingErrors = runFileValidation({
  manifest: missingEvidenceBindingManifest,
  binding: missingEvidenceBindingPath,
})
if (!missingEvidenceBindingErrors.some(error => error.includes('is not backed by source_product_path.evidence_bindings'))) {
  throw new Error(`self-asserted evidence reference without binding was accepted:\n${missingEvidenceBindingErrors.join('\n')}`)
}
rejectedCount += 1

const everyBindingManifest = baseManifest()
const everyBindingPath = sourcePathFor(everyBindingManifest)
const everyBindingErrors = runFileValidation({
  manifest: everyBindingManifest,
  binding: everyBindingPath,
  mutateAfterMaterialization: ({ binding }) => {
    binding.evidence_bindings.push({
      ref: 'evidence/general/unreferenced-but-bound.json',
      digest: DIGEST_A,
      evidence_kind: 'general',
    })
  },
})
if (!everyBindingErrors.some(error => error.includes('unreferenced-but-bound.json'))) {
  throw new Error(`unresolvable extra evidence binding was not checked:\n${everyBindingErrors.join('\n')}`)
}
rejectedCount += 1

const evidenceSymlinkRoot = mkdtempSync(join(tmpdir(), 'die-evidence-symlink-external-'))
try {
  const evidenceSymlinkManifest = baseManifest()
  const evidenceSymlinkBinding = sourcePathFor(evidenceSymlinkManifest)
  const evidenceSymlinkErrors = runFileValidation({
    manifest: evidenceSymlinkManifest,
    binding: evidenceSymlinkBinding,
    mutateAfterMaterialization: ({ root, binding }) => {
      const ref = binding.data_path.native_capture_evidence_refs[0]
      const external = join(evidenceSymlinkRoot, 'native-capture.json')
      writeFileSync(external, 'external evidence\n')
      rmSync(join(root, ref))
      symlinkSync(external, join(root, ref))
    },
  })
  if (!evidenceSymlinkErrors.some(error => error.includes('symlink escapes the manifest evidence root'))) {
    throw new Error(`bound evidence symlink escape was accepted:\n${evidenceSymlinkErrors.join('\n')}`)
  }
  rejectedCount += 1
}
finally {
  rmSync(evidenceSymlinkRoot, { recursive: true, force: true })
}

const nonexistentManifest = baseManifest()
const nonexistentErrors = runFileValidation({
  manifest: nonexistentManifest,
  binding: sourcePathFor(nonexistentManifest),
  writeBinding: false,
})
if (!nonexistentErrors.some(error => error.includes('source product path does not exist')))
  throw new Error(`nonexistent source product path was accepted:\n${nonexistentErrors.join('\n')}`)
rejectedCount += 1

const wrongFileDigestManifest = baseManifest()
const wrongFileDigestErrors = runFileValidation({
  manifest: wrongFileDigestManifest,
  binding: sourcePathFor(wrongFileDigestManifest),
  wrongDigest: true,
})
if (!wrongFileDigestErrors.some(error => error.includes('does not match exact referenced file bytes')))
  throw new Error(`wrong exact-file source path digest was accepted:\n${wrongFileDigestErrors.join('\n')}`)
rejectedCount += 1

const traversalManifest = baseManifest()
traversalManifest.producers[0].source_product_path_ref = '../endpoint.yaml'
const traversalErrors = runFileValidation({
  manifest: traversalManifest,
  binding: sourcePathFor(traversalManifest),
  writeBinding: false,
})
if (!traversalErrors.some(error => error.includes('unsafe or is not YAML')))
  throw new Error(`source product path traversal was accepted:\n${traversalErrors.join('\n')}`)
rejectedCount += 1

const symlinkRoot = mkdtempSync(join(tmpdir(), 'die-runtime-symlink-root-'))
const externalRoot = mkdtempSync(join(tmpdir(), 'die-runtime-symlink-external-'))
try {
  const symlinkManifest = baseManifest()
  const symlinkBinding = sourcePathFor(symlinkManifest)
  const externalSource = join(externalRoot, 'endpoint.yaml')
  const sourceBytes = `${JSON.stringify(symlinkBinding, null, 2)}\n`
  writeFileSync(externalSource, sourceBytes)
  mkdirSync(join(symlinkRoot, 'source-path'), { recursive: true })
  symlinkSync(externalSource, join(symlinkRoot, 'source-path/endpoint.yaml'))
  symlinkManifest.producers[0].source_product_path_digest = digestBytes(sourceBytes)
  const symlinkManifestPath = join(symlinkRoot, 'runtime-manifest.yaml')
  writeFileSync(symlinkManifestPath, `${JSON.stringify(symlinkManifest, null, 2)}\n`)
  const symlinkErrors = validateRuntimeManifestFile(symlinkManifestPath, undefined, symlinkRoot)
  if (!symlinkErrors.some(error => error.includes('symlink escapes the manifest evidence root')))
    throw new Error(`source product path symlink escape was accepted:\n${symlinkErrors.join('\n')}`)
  rejectedCount += 1
}
finally {
  rmSync(symlinkRoot, { recursive: true, force: true })
  rmSync(externalRoot, { recursive: true, force: true })
}

const installedOnlyManifest = baseManifest()
const installedOnlyPath = sourcePathFor(installedOnlyManifest)
installedOnlyPath.normal_path_state = 'INSTALLED_OBSERVED'
installedOnlyPath.enrollment.status = 'EXTERNAL_INPUT_REQUIRED'
installedOnlyPath.prerequisites[0].status = 'MISSING'
const installedOnlyErrors = validateSourceProductPath(installedOnlyPath)
if (installedOnlyErrors.length) {
  throw new Error(
    `installed observation was incorrectly forced to claim capture-to-receipt E2E:\n${installedOnlyErrors.join('\n')}`,
  )
}
acceptedCount += 1

const missingPackageInstallation = sourcePathFor(baseManifest())
missingPackageInstallation.package_installations.pop()
const missingPackageErrors = validateSourceProductPath(missingPackageInstallation)
if (!missingPackageErrors.some(error => error.includes('do not exactly cover component_set.packages'))) {
  throw new Error(`incomplete package installation graph was accepted:\n${missingPackageErrors.join('\n')}`)
}
rejectedCount += 1

const browserMissingNativePackage = sourcePathFor(copy(browserCompound))
browserMissingNativePackage.package_installations = browserMissingNativePackage.package_installations
  .filter(item => !item.component_ids.includes('browser-native-host'))
const browserPackageErrors = validateSourceProductPath(browserMissingNativePackage)
if (!browserPackageErrors.some(error => error.includes('do not exactly cover component_set.packages'))) {
  throw new Error(`Browser extension-only installation graph was accepted:\n${browserPackageErrors.join('\n')}`)
}
rejectedCount += 1

const componentSetMismatchManifest = baseManifest()
const componentSetMismatchPath = sourcePathFor(componentSetMismatchManifest)
componentSetMismatchManifest.producers[0].component_set_digest = `sha256:${'9'.repeat(64)}`
assertRejected(
  componentSetMismatchManifest,
  'component_set_digest does not match source product path component set',
  'runtime producer using a different measured component set',
  componentSetMismatchPath,
  false,
)

const runtimeIdentityMismatchManifest = baseManifest()
const runtimeIdentityMismatchPath = sourcePathFor(runtimeIdentityMismatchManifest)
runtimeIdentityMismatchManifest.components[0].runtime_identity = 'com.quilr.unrelated-runtime'
assertRejected(
  runtimeIdentityMismatchManifest,
  'runtime_identity does not match runtime component',
  'runtime component using a different measured runtime identity',
  runtimeIdentityMismatchPath,
  false,
)

const implementedUnitStatus = {
  capability_id: 'PC-004',
  implementation_state: 'IMPLEMENTED',
  integration_state: 'NOT_CONNECTED',
  evidence_state: 'TEST_VERIFIED',
  release_state: 'NOT_ELIGIBLE',
  runtime_mode: 'UNIT_HARNESS',
  highest_proven_stage: 'NONE',
  development_blocked: false,
  blocker_class: 'NONE',
  blocked_on: 'NONE',
  blocked_action: 'NONE',
  blocker_evidence: 'NONE',
  blocker_owner: 'NONE',
  unblock_condition: 'NONE',
  blocker_recheck_at: 'NONE',
  independent_next_action: 'NONE',
  authority_commit: 'a'.repeat(40),
  last_verified_sha: 'b'.repeat(40),
  runtime_manifest: 'NONE',
  runtime_manifest_digest: 'NONE',
  next_product_action: 'Integrate the normal installed Endpoint path.',
  limitations: ['Source and unit verified; not integrated.'],
}
const implementedUnitErrors = validateExecutionStatus(implementedUnitStatus, 'implemented unit code')
if (implementedUnitErrors.length)
  throw new Error(`implemented unit code with integrated stage NONE unexpectedly failed:\n${implementedUnitErrors.join('\n')}`)
acceptedCount += 1

const falseNativeCapture = { ...implementedUnitStatus, highest_proven_stage: 'NATIVE_CAPTURE' }
const falseNativeCaptureErrors = validateExecutionStatus(falseNativeCapture, 'fixture native-capture claim')
if (!falseNativeCaptureErrors.some(error => error.includes('UNIT_HARNESS cannot claim an integrated product stage'))) {
  throw new Error(`UNIT_HARNESS false native-capture claim was accepted:\n${falseNativeCaptureErrors.join('\n')}`)
}
rejectedCount += 1

console.log(`DIE runtime/execution semantic tests passed: ${acceptedCount} accepted; ${rejectedCount} rejected.`)

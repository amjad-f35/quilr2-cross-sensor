import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { serializeCsv } from './csv-lib.mjs'
import { SENSOR_VERTICAL_HEADER, VERTICAL_STAGES } from './sensor-vertical-state-lib.mjs'
import { runtimeProfileRegistryDigest } from './validate-runtime-manifest.mjs'

const AUTHORITY = 'a'.repeat(40)
const EXTENSION_COMMIT = 'b'.repeat(40)
const NATIVE_COMMIT = 'c'.repeat(40)
const ENDPOINT_COMMIT = 'd'.repeat(40)
const TENANT = '442e052d-4c60-4cdc-961e-bc9db74a40ca'
const PRODUCER = '22222222-2222-4222-8222-222222222222'
const ENDPOINT_PRODUCER = '22222222-2222-4222-8222-222222222223'
const CERTIFICATION = '33333333-3333-4333-8333-333333333333'
const ENDPOINT_CERTIFICATION = '33333333-3333-4333-8333-333333333334'
const MANIFEST_ID = '11111111-1111-4111-8111-111111111111'

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function canonicalJson(value) {
  if (Array.isArray(value))
    return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object')
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function writeRetained(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content)
  writeFileSync(join(root, path), bytes)
  return digest(bytes)
}

function componentSet(extensionPackage, nativePackage, extensionInstalled, nativeInstalled) {
  const value = {
    schema_version: 'starliner.producer-component-set.v1',
    component_set_id: '44444444-4444-4444-8444-444444444444',
    component_set_digest: `sha256:${'0'.repeat(64)}`,
    source_profile: 'browser',
    measured_at: '2026-08-05T00:00:00Z',
    packages: [
      {
        package_id: 'browser-extension-package',
        product: 'Quilr Browser Extension',
        version: '2.0.0',
        format: 'chrome_extension',
        source_repository: 'quilrbusiness/Project-Vanguard',
        source_commit: EXTENSION_COMMIT,
        package_digest: extensionPackage,
        build_evidence_ref: 'evidence/build/browser-extension.json',
      },
      {
        package_id: 'browser-native-host-package',
        product: 'Quilr Browser Native Host',
        version: '2.0.0',
        format: 'macos_pkg',
        source_repository: 'quilrbusiness/project-sentinel',
        source_commit: NATIVE_COMMIT,
        package_digest: nativePackage,
        build_evidence_ref: 'evidence/build/browser-native-host.json',
      },
    ],
    components: [
      {
        component_id: 'browser-extension',
        package_id: 'browser-extension-package',
        role: 'browser_extension',
        product: 'Quilr Browser Extension',
        version: '2.0.0',
        source_repository: 'quilrbusiness/Project-Vanguard',
        source_commit: EXTENSION_COMMIT,
        package_member_path: 'chrome-mv3',
        package_member_digest: extensionInstalled,
        installed_artifact_digest: extensionInstalled,
        runtime_artifact_digest: extensionInstalled,
        runtime_identity: 'chrome-extension://abcdefghijklmnopabcdefghijklmnop',
      },
      {
        component_id: 'browser-native-host',
        package_id: 'browser-native-host-package',
        role: 'browser_native_host',
        product: 'Quilr Browser Native Host',
        version: '2.0.0',
        source_repository: 'quilrbusiness/project-sentinel',
        source_commit: NATIVE_COMMIT,
        package_member_path: 'Library/Application Support/Quilr/native-host',
        package_member_digest: nativeInstalled,
        installed_artifact_digest: nativeInstalled,
        runtime_artifact_digest: nativeInstalled,
        runtime_identity: 'ai.quilr.browser.native-host',
      },
    ],
    ownership: {
      capture_component_ids: ['browser-extension', 'browser-native-host'],
      wal_component_id: 'browser-extension',
      wal_component_role: 'browser_extension',
      delivery_component_id: 'browser-extension',
      delivery_component_role: 'browser_extension',
      health_component_ids: ['browser-extension', 'browser-native-host'],
    },
  }
  const unsigned = structuredClone(value)
  delete unsigned.component_set_digest
  value.component_set_digest = digest(canonicalJson(unsigned))
  return value
}

function sourcePath(root, coherent) {
  const evidence = new Map()
  const add = (path, kind, content = `${path}\n`) => {
    const fileDigest = writeRetained(root, path, content)
    evidence.set(path, { ref: path, digest: fileDigest, evidence_kind: kind })
    return fileDigest
  }
  const extensionPackage = add('artifacts/browser-extension.zip', 'installation_artifact', Buffer.from([1, 2, 3]))
  const nativePackage = add('artifacts/browser-native-host.pkg', 'installation_artifact', Buffer.from([4, 5, 6]))
  const extensionInstalled = add('artifacts/browser-extension.bin', 'component_installed_artifact', Buffer.from([7, 8, 9]))
  const nativeInstalled = add('artifacts/browser-native-host.bin', 'component_installed_artifact', Buffer.from([10, 11, 12]))
  const extensionConfig = add('evidence/config/browser-extension.json', 'component_configuration_observation')
  const nativeConfig = add('evidence/config/browser-native-host.json', 'component_configuration_observation')
  const extensionManifest = add('evidence/install/browser-extension-manifest.json', 'package_install_manifest')
  const nativeManifest = add('evidence/install/browser-native-host-manifest.json', 'package_install_manifest')
  const set = componentSet(extensionPackage, nativePackage, extensionInstalled, nativeInstalled)

  for (const [path, kind] of [
    ['evidence/install/documentation.json', 'installation_documentation'],
    ['evidence/install/normal-command.json', 'installation_command'],
    ['evidence/install/browser-extension-observation.json', 'installation_observation'],
    ['evidence/install/browser-native-host-observation.json', 'installation_observation'],
    ['evidence/enrollment/browser.json', 'enrollment_observation'],
    ['evidence/components/browser-extension-install.json', 'component_installation_observation'],
    ['evidence/components/browser-native-host-install.json', 'component_installation_observation'],
    ['evidence/build/browser-extension.json', 'package_build_evidence'],
    ['evidence/build/browser-native-host.json', 'package_build_evidence'],
    ['evidence/data/browser-capture.json', 'native_capture_observation'],
    ['evidence/data/browser-wal.json', 'wal_observation'],
    ['evidence/data/browser-sender.json', 'sender_observation'],
    ['evidence/data/browser-receipt.json', 'ingest_receipt'],
    ['evidence/prerequisites/tenant.json', 'prerequisite_observation'],
    ['evidence/general/source-path-summary.json', 'general'],
  ]) add(path, kind)

  const value = {
    schema_version: '1.0',
    schema: 'die.source-product-path.v1',
    binding_id: 'browser-installed-path',
    profile: 'browser',
    logical_sensor: 'browser',
    authority_commit: AUTHORITY,
    source_commit: EXTENSION_COMMIT,
    normal_path_state: coherent ? 'COHERENT_E2E' : 'INSTALLED_OBSERVED',
    installation: {
      documentation_refs: ['evidence/install/documentation.json'],
      installer_repository: 'quilrbusiness/Project-Vanguard',
      installer_commit: EXTENSION_COMMIT,
      install_artifact_ref: 'artifacts/browser-extension.zip',
      install_artifact_digest: extensionPackage,
      normal_install_command_ref: 'evidence/install/normal-command.json',
      installation_evidence_ref: 'evidence/install/browser-extension-observation.json',
    },
    component_set: set,
    package_installations: [
      {
        package_id: 'browser-extension-package',
        component_ids: ['browser-extension'],
        package_artifact_ref: 'artifacts/browser-extension.zip',
        package_artifact_digest: extensionPackage,
        install_manifest_ref: 'evidence/install/browser-extension-manifest.json',
        install_manifest_digest: extensionManifest,
        installation_evidence_ref: 'evidence/install/browser-extension-observation.json',
      },
      {
        package_id: 'browser-native-host-package',
        component_ids: ['browser-native-host'],
        package_artifact_ref: 'artifacts/browser-native-host.pkg',
        package_artifact_digest: nativePackage,
        install_manifest_ref: 'evidence/install/browser-native-host-manifest.json',
        install_manifest_digest: nativeManifest,
        installation_evidence_ref: 'evidence/install/browser-native-host-observation.json',
      },
    ],
    organization_context: {
      tenant_input_kind: 'organization_tenant_uuid',
      tenant_source_symbol: 'enrollment.organization_tenant_id',
      discovery_or_bootstrap_symbol: 'starliner.control.enrollSensor',
      persona_or_workload_prerequisite: 'normal organization enrollment',
      effective_configuration_source: 'signed edge configuration',
    },
    enrollment: {
      production_writer_symbol: coherent ? 'starliner.control.enrollSensor' : 'UNASSIGNED',
      credential_issuer: coherent ? 'starliner_control' : 'UNASSIGNED',
      credential_store: coherent ? 'browser secure storage' : 'UNASSIGNED',
      producer_identity_source: coherent ? 'signed enrollment producer_id' : 'UNASSIGNED',
      installation_identity_source: coherent ? 'signed enrollment installation_id' : 'UNASSIGNED',
      evidence_ref: coherent ? 'evidence/enrollment/browser.json' : 'UNASSIGNED',
      status: coherent ? 'RUNTIME_OBSERVED' : 'EXTERNAL_INPUT_REQUIRED',
    },
    components: [
      {
        component_id: 'browser-extension', component_kind: 'browser_extension',
        repository: 'quilrbusiness/Project-Vanguard', source_commit: EXTENSION_COMMIT,
        installed_artifact_ref: 'artifacts/browser-extension.bin', installed_artifact_digest: extensionInstalled,
        supervisor: 'browser_runtime', service_unit: 'managed-extension-id',
        normal_entrypoint: 'extension service worker', effective_configuration_digest: coherent ? extensionConfig : 'UNASSIGNED',
        installation_evidence_ref: 'evidence/components/browser-extension-install.json',
        configuration_evidence_ref: coherent ? 'evidence/config/browser-extension.json' : 'UNASSIGNED', observation_ownership: 'originating',
      },
      {
        component_id: 'browser-native-host', component_kind: 'browser_native_host',
        repository: 'quilrbusiness/project-sentinel', source_commit: NATIVE_COMMIT,
        installed_artifact_ref: 'artifacts/browser-native-host.bin', installed_artifact_digest: nativeInstalled,
        supervisor: 'launchd', service_unit: 'com.quilr.browser.native-host',
        normal_entrypoint: 'registered native messaging host', effective_configuration_digest: coherent ? nativeConfig : 'UNASSIGNED',
        installation_evidence_ref: 'evidence/components/browser-native-host-install.json',
        configuration_evidence_ref: coherent ? 'evidence/config/browser-native-host.json' : 'UNASSIGNED', observation_ownership: 'supporting',
      },
    ],
    data_path: coherent ? {
      native_capture_symbols: ['PackageLog.sendLogs', 'nativeMessaging.onMessage'],
      native_capture_evidence_refs: ['evidence/data/browser-capture.json'],
      privacy_mapper_symbol: 'browserInventoryAdapter', wal_owner_component_id: 'browser-extension',
      wal_owner_component_kind: 'browser_extension', wal_owner_symbol: 'extension IndexedDB WAL',
      wal_evidence_ref: 'evidence/data/browser-wal.json', sender_component_id: 'browser-extension',
      sender_component_kind: 'browser_extension', sender_symbol: 'extension delivery worker',
      sender_evidence_ref: 'evidence/data/browser-sender.json', receipt_handler_symbol: 'receipt transition',
      receipt_evidence_ref: 'evidence/data/browser-receipt.json', relay_lineage_rule: 'native host supports extension-owned stream',
    } : {
      native_capture_symbols: ['PackageLog.sendLogs'], native_capture_evidence_refs: ['evidence/data/browser-capture.json'],
      privacy_mapper_symbol: 'browserInventoryAdapter', wal_owner_component_id: 'browser-extension',
      wal_owner_component_kind: 'browser_extension', wal_owner_symbol: 'extension IndexedDB WAL',
      wal_evidence_ref: 'evidence/data/browser-wal.json', sender_component_id: 'UNASSIGNED', sender_component_kind: 'UNASSIGNED',
      sender_symbol: 'UNASSIGNED', sender_evidence_ref: 'UNASSIGNED', receipt_handler_symbol: 'UNASSIGNED',
      receipt_evidence_ref: 'UNASSIGNED', relay_lineage_rule: 'native host supports extension-owned stream',
    },
    prerequisites: [{
      prerequisite_id: 'ORG_TENANT', class: 'EXTERNAL_CREDENTIAL', required_input_or_action: 'normal organization enrollment',
      status: coherent ? 'SATISFIED' : 'MISSING', evidence_ref: coherent ? 'evidence/prerequisites/tenant.json' : 'UNASSIGNED',
    }],
    prohibited_bypasses: coherent ? [
      'fixed_shared_identity_or_token', 'second_tenant_or_persona_shim', 'manual_storage_or_devtools_injection',
      'manual_plist_env_or_sql_override', 'alternate_or_parallel_daemon', 'fake_dirty_or_mixed_artifact_provenance',
      'fixture_interior_stage', 'normal_entrypoint_bypass',
    ] : [],
    evidence_bindings: [...evidence.values()].filter(item => {
      if (coherent)
        return true
      return !item.ref.includes('/enrollment/') && !item.ref.includes('/config/')
        && !item.ref.includes('/sender.') && !item.ref.includes('/receipt.') && !item.ref.includes('/prerequisites/')
    }),
    evidence_refs: coherent ? ['evidence/general/source-path-summary.json'] : [],
  }
  return value
}

const ENDPOINT_COMPONENTS = [
  ['endpoint-agent', 'endpoint_agent'],
  ['endpoint-monitor', 'endpoint_monitor'],
  ['endpoint-proxy', 'endpoint_proxy'],
  ['endpoint-ipc-broker', 'endpoint_ipc_broker'],
  ['endpoint-template-engine', 'endpoint_template_engine'],
  ['endpoint-system-extension', 'endpoint_system_extension'],
]

function endpointSourcePath(root) {
  const evidence = new Map()
  const add = (path, kind, content = `${path}\n`) => {
    const fileDigest = writeRetained(root, path, content)
    evidence.set(path, { ref: path, digest: fileDigest, evidence_kind: kind })
    return fileDigest
  }
  const packageRef = 'artifacts/endpoint/endpoint.pkg'
  const packageDigest = add(packageRef, 'installation_artifact', Buffer.from([21, 22, 23]))
  const packageBuildRef = 'evidence/endpoint/build/endpoint-package.json'
  add(packageBuildRef, 'package_build_evidence')
  const installManifestRef = 'evidence/endpoint/install/endpoint-manifest.json'
  const installManifestDigest = add(installManifestRef, 'package_install_manifest')
  const installObservationRef = 'evidence/endpoint/install/endpoint-observation.json'
  add(installObservationRef, 'installation_observation')
  const documentationRef = 'evidence/endpoint/install/documentation.json'
  const commandRef = 'evidence/endpoint/install/normal-command.json'
  add(documentationRef, 'installation_documentation')
  add(commandRef, 'installation_command')
  const enrollmentRef = 'evidence/endpoint/enrollment/endpoint.json'
  add(enrollmentRef, 'enrollment_observation')

  const measured = []
  const sourceComponents = []
  for (const [componentId, role] of ENDPOINT_COMPONENTS) {
    const installedRef = `artifacts/endpoint/${componentId}.bin`
    const installedDigest = add(
      installedRef,
      'component_installed_artifact',
      Buffer.from(`installed:${componentId}`),
    )
    const installationRef = `evidence/endpoint/components/${componentId}-install.json`
    const configurationRef = `evidence/endpoint/config/${componentId}.json`
    add(installationRef, 'component_installation_observation')
    const configurationDigest = add(configurationRef, 'component_configuration_observation')
    measured.push({
      component_id: componentId,
      package_id: 'endpoint-package',
      role,
      product: `Quilr ${componentId}`,
      version: '2.0.0',
      source_repository: 'quilrbusiness/sentinel-endpoint-agent',
      source_commit: ENDPOINT_COMMIT,
      package_member_path: componentId,
      package_member_digest: installedDigest,
      installed_artifact_digest: installedDigest,
      runtime_artifact_digest: installedDigest,
      runtime_identity: `ai.quilr.${componentId}`,
    })
    sourceComponents.push({
      component_id: componentId,
      component_kind: role,
      repository: 'quilrbusiness/sentinel-endpoint-agent',
      source_commit: ENDPOINT_COMMIT,
      installed_artifact_ref: installedRef,
      installed_artifact_digest: installedDigest,
      supervisor: 'launchd',
      service_unit: `ai.quilr.${componentId}`,
      normal_entrypoint: `normal ${componentId} entrypoint`,
      effective_configuration_digest: configurationDigest,
      installation_evidence_ref: installationRef,
      configuration_evidence_ref: configurationRef,
      observation_ownership: componentId === 'endpoint-monitor' ? 'originating' : 'supporting',
    })
  }
  const componentSet = {
    schema_version: 'starliner.producer-component-set.v1',
    component_set_id: '44444444-4444-4444-8444-444444444445',
    component_set_digest: `sha256:${'0'.repeat(64)}`,
    source_profile: 'endpoint',
    measured_at: '2026-08-05T00:00:00Z',
    packages: [{
      package_id: 'endpoint-package',
      product: 'Quilr Endpoint',
      version: '2.0.0',
      format: 'macos_pkg',
      source_repository: 'quilrbusiness/sentinel-endpoint-agent',
      source_commit: ENDPOINT_COMMIT,
      package_digest: packageDigest,
      build_evidence_ref: packageBuildRef,
    }],
    components: measured,
    ownership: {
      capture_component_ids: ENDPOINT_COMPONENTS.map(([componentId]) => componentId),
      wal_component_id: 'endpoint-monitor',
      wal_component_role: 'endpoint_monitor',
      delivery_component_id: 'endpoint-monitor',
      delivery_component_role: 'endpoint_monitor',
      health_component_ids: ENDPOINT_COMPONENTS.map(([componentId]) => componentId),
    },
  }
  const unsigned = structuredClone(componentSet)
  delete unsigned.component_set_digest
  componentSet.component_set_digest = digest(canonicalJson(unsigned))
  for (const [path, kind] of [
    ['evidence/endpoint/data/capture.json', 'native_capture_observation'],
    ['evidence/endpoint/data/wal.json', 'wal_observation'],
    ['evidence/endpoint/data/sender.json', 'sender_observation'],
    ['evidence/endpoint/data/receipt.json', 'ingest_receipt'],
    ['evidence/endpoint/prerequisites/tenant.json', 'prerequisite_observation'],
    ['evidence/endpoint/general/source-path-summary.json', 'general'],
  ]) add(path, kind)

  return {
    schema_version: '1.0',
    schema: 'die.source-product-path.v1',
    binding_id: 'endpoint-installed-path',
    profile: 'endpoint',
    logical_sensor: 'endpoint',
    authority_commit: AUTHORITY,
    source_commit: ENDPOINT_COMMIT,
    normal_path_state: 'COHERENT_E2E',
    installation: {
      documentation_refs: [documentationRef],
      installer_repository: 'quilrbusiness/sentinel-endpoint-agent',
      installer_commit: ENDPOINT_COMMIT,
      install_artifact_ref: packageRef,
      install_artifact_digest: packageDigest,
      normal_install_command_ref: commandRef,
      installation_evidence_ref: installObservationRef,
    },
    component_set: componentSet,
    package_installations: [{
      package_id: 'endpoint-package',
      component_ids: ENDPOINT_COMPONENTS.map(([componentId]) => componentId),
      package_artifact_ref: packageRef,
      package_artifact_digest: packageDigest,
      install_manifest_ref: installManifestRef,
      install_manifest_digest: installManifestDigest,
      installation_evidence_ref: installObservationRef,
    }],
    organization_context: {
      tenant_input_kind: 'organization_tenant_uuid',
      tenant_source_symbol: 'enrollment.organization_tenant_id',
      discovery_or_bootstrap_symbol: 'starliner.control.enrollSensor',
      persona_or_workload_prerequisite: 'normal organization enrollment',
      effective_configuration_source: 'signed edge configuration',
    },
    enrollment: {
      production_writer_symbol: 'starliner.control.enrollSensor',
      credential_issuer: 'starliner_control',
      credential_store: 'endpoint secure store',
      producer_identity_source: 'signed enrollment producer_id',
      installation_identity_source: 'signed enrollment installation_id',
      evidence_ref: enrollmentRef,
      status: 'RUNTIME_OBSERVED',
    },
    components: sourceComponents,
    data_path: {
      native_capture_symbols: ['endpoint.discovery.observe_device'],
      native_capture_evidence_refs: ['evidence/endpoint/data/capture.json'],
      privacy_mapper_symbol: 'endpointSourceAdapter',
      wal_owner_component_id: 'endpoint-monitor',
      wal_owner_component_kind: 'endpoint_monitor',
      wal_owner_symbol: 'endpoint durable WAL',
      wal_evidence_ref: 'evidence/endpoint/data/wal.json',
      sender_component_id: 'endpoint-monitor',
      sender_component_kind: 'endpoint_monitor',
      sender_symbol: 'endpoint delivery supervisor',
      sender_evidence_ref: 'evidence/endpoint/data/sender.json',
      receipt_handler_symbol: 'endpoint receipt transition',
      receipt_evidence_ref: 'evidence/endpoint/data/receipt.json',
      relay_lineage_rule: 'compound Endpoint components publish through the sole monitor-owned WAL',
    },
    prerequisites: [{
      prerequisite_id: 'ORG_TENANT',
      class: 'EXTERNAL_CREDENTIAL',
      required_input_or_action: 'normal organization enrollment',
      status: 'SATISFIED',
      evidence_ref: 'evidence/endpoint/prerequisites/tenant.json',
    }],
    prohibited_bypasses: [
      'fixed_shared_identity_or_token', 'second_tenant_or_persona_shim',
      'manual_storage_or_devtools_injection', 'manual_plist_env_or_sql_override',
      'alternate_or_parallel_daemon', 'fake_dirty_or_mixed_artifact_provenance',
      'fixture_interior_stage', 'normal_entrypoint_bypass',
    ],
    evidence_bindings: [...evidence.values()],
    evidence_refs: ['evidence/endpoint/general/source-path-summary.json'],
  }
}

function runtimeManifest(sourcePathValue, sourcePathDigest) {
  const entries = [{ profile: 'browser', profile_version: '1.0.0', component_role: 'browser', schema_digest: `sha256:${'e'.repeat(64)}` }]
  const sourceComponents = new Map(sourcePathValue.components.map(item => [item.component_id, item]))
  const measuredComponents = new Map(sourcePathValue.component_set.components.map(item => [item.component_id, item]))
  const components = ['browser-extension', 'browser-native-host'].map(componentId => {
    const source = sourceComponents.get(componentId)
    const measured = measuredComponents.get(componentId)
    const packageValue = sourcePathValue.component_set.packages.find(item => item.package_id === measured.package_id)
    return {
      component_id: componentId, repository: source.repository, branch: 'feat/die-browser', commit_sha: source.source_commit,
      artifact_digest: source.installed_artifact_digest, contract_digest: `sha256:${'d'.repeat(64)}`, role: 'browser',
      clean_tree: true, provenance: 'exact_source_build', build_ref: packageValue.build_evidence_ref,
      installation_class: componentId === 'browser-extension' ? 'browser_extension' : 'package',
      install_artifact_digest: packageValue.package_digest, installed_artifact_digest: source.installed_artifact_digest,
      installed_path_ref: source.installed_artifact_ref, supervisor: source.supervisor, service_unit: source.service_unit,
      runtime_identity: measured.runtime_identity,
      normal_entrypoint: source.normal_entrypoint, effective_configuration_digest: source.effective_configuration_digest,
      installation_evidence_ref: source.installation_evidence_ref,
    }
  })
  const config = sourcePathValue.components[0].effective_configuration_digest
  return {
    schema_version: '1.0', schema: 'die.runtime-manifest.v1', manifest_id: MANIFEST_ID,
    candidate_digest: `sha256:${'f'.repeat(64)}`, environment_id: 'browser-e2e', runtime_mode: 'COHERENT_LOCAL_PRODUCT',
    authority_commit: AUTHORITY, generated_contract_digest: `sha256:${'d'.repeat(64)}`,
    database_migration_digest: `sha256:${'d'.repeat(64)}`, configuration_digest: config,
    tenant_authority: { mode: 'starliner_control', tenant_ref: `tenant-ref:sha256:${createHash('sha256').update(TENANT).digest('hex')}`, configuration_digest: config },
    profile_registry: { registry_ref: 'evidence/control/profile-registry.json', registry_digest: runtimeProfileRegistryDigest(entries), entries },
    components,
    stores: {
      postgresql: { version: '17.10', endpoint_ref: 'secret-ref:pg', configuration_digest: config },
      object_store: { provider: 's3-compatible', version: '2026.1', endpoint_ref: 'secret-ref:object', configuration_digest: config },
      clickhouse: { version: '26.3', endpoint_ref: 'secret-ref:ch', configuration_digest: config },
    },
    producers: [{
      profile: 'browser', profile_version: '1.0.0', producer_id: PRODUCER, installation_id: 'browser-installation-1',
      certification_id: CERTIFICATION, component_id: 'browser-extension', component_ids: ['browser-extension', 'browser-native-host'],
      artifact_digest: components[0].artifact_digest, component_set_digest: sourcePathValue.component_set.component_set_digest,
      configuration_digest: config, credential_class: 'dpop_jwt', credential_issuer_class: 'starliner_control',
      enrollment_evidence_ref: sourcePathValue.enrollment.evidence_ref,
      source_product_path_ref: 'source-product/browser.yaml', source_product_path_digest: sourcePathDigest,
    }],
    customer_endpoints: { api: 'http://127.0.0.1:62069/die/v1', bff: 'http://127.0.0.1:3000/die/v1', ui: 'http://127.0.0.1:3000/estate' },
    contamination: {
      mixed_candidates: false, dirty_components: false, manual_database_mutation: false, untracked_hotfixes: false,
      overlapping_runtime: false, manual_configuration_override: false, parallel_product_daemon: false,
      devtools_or_storage_injection: false, synthetic_identity_or_persona: false, fixture_interior_stage: false,
      uninstalled_artifact: false, normal_entrypoint_bypassed: false, notes: [],
    },
    created_at: '2026-08-05T00:00:00Z', started_at: '2026-08-05T00:00:01Z',
    evidence_ref: 'evidence/runtime/browser', limitations: [],
  }
}

function assertion(stage, profile = 'browser') {
  const endpoint = profile === 'endpoint'
  const ids = {
    receipt: endpoint ? '55555555-5555-4555-8555-555555555556' : '55555555-5555-4555-8555-555555555555',
    evidence: endpoint ? '66666666-6666-4666-8666-666666666667' : '66666666-6666-4666-8666-666666666666',
    normalization: endpoint ? '77777777-7777-4777-8777-777777777778' : '77777777-7777-4777-8777-777777777777',
    output: endpoint ? '88888888-8888-4888-8888-888888888889' : '88888888-8888-4888-8888-888888888888',
    entity: endpoint ? '99999999-9999-4999-8999-999999999998' : '99999999-9999-4999-8999-999999999999',
    binding: endpoint ? 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab' : 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    claim: endpoint ? 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc' : 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    graph: endpoint ? 'cccccccc-cccc-4ccc-8ccc-cccccccccccd' : 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  }
  const digestA = `sha256:${'1'.repeat(64)}`
  const prefix = endpoint ? 'endpoint' : 'browser'
  const captureComponent = endpoint ? 'endpoint-monitor' : 'browser-extension'
  const captureSymbol = endpoint ? 'endpoint.discovery.observe_device' : 'PackageLog.sendLogs'
  return {
    NATIVE_CAPTURE: { native_record_id: `native-${prefix}-1`, capture_component_id: captureComponent, capture_symbol: captureSymbol, native_record_digest: digestA },
    LOCAL_WAL: { native_record_id: `native-${prefix}-1`, wal_entry_id: `wal-${prefix}-1`, wal_component_id: captureComponent, wal_sequence: '1', wal_payload_digest: digestA, durable_before_send: true },
    INGEST_RECEIPT: { wal_entry_id: `wal-${prefix}-1`, batch_id: endpoint ? '44444444-4444-4444-8444-444444444445' : '44444444-4444-4444-8444-444444444444', receipt_id: ids.receipt, receipt_record_id: `${prefix}-record-1`, disposition: 'accepted', ingest_operation_id: 'acceptDeliveryBatch', receipt_payload_digest: digestA },
    IMMUTABLE_EVIDENCE: { receipt_id: ids.receipt, evidence_id: ids.evidence, evidence_object_ref: `evidence/${prefix}/record-1`, evidence_payload_digest: digestA, evidence_state: 'immutable_accepted' },
    NORMALIZED: { evidence_id: ids.evidence, normalization_run_id: ids.normalization, output_count: 1, output_ids: [ids.output], bundle_digest: digestA },
    CANONICAL_ENTITY: { normalization_run_id: ids.normalization, evidence_id: ids.evidence, entity_id: ids.entity, entity_type: endpoint ? 'device' : 'browser_installation', entity_version: '1', binding_id: ids.binding, source_object_id: endpoint ? 'endpoint:device:1' : 'browser:installation:1', selected_claim_ids: [ids.claim] },
    CANONICAL_GRAPH_ACTIVITY: { entity_id: ids.entity, entity_version: '1', result_kind: 'relationship', result_id: ids.graph, rule_id: endpoint ? 'REL-EP-002' : 'REL-BR-001', applicability: 'applicable_supported', reason_code: 'trusted_bound_endpoints', dependency_ids: [] },
    PROJECTED: { entity_id: ids.entity, graph_result_id: ids.graph, projection_name: 'die_product_v1', projection_generation: '1', canonical_watermark: '10', projection_watermark: '10', destination_ack_id: 'ack-1' },
    AUTHORIZED_API: { entity_id: ids.entity, graph_result_id: ids.graph, projection_generation: '1', projection_watermark: '10', operation_id: 'listEntities', request_id: `request-${prefix}-1`, authorization_revision: '2', subject_id: 'user-1', response_member_id: ids.entity, response_digest: digestA, status_code: 200 },
    LIVE_UI: { api_request_id: `request-${prefix}-1`, operation_id: 'listEntities', authorization_revision: '2', ui_build_digest: digestA, route: '/estate/inventory', browser_session_id: `browser-session-${prefix}-1`, rendered_member_id: ids.entity, browser_assertions: ['authorized_member_visible', 'fixture_mode_absent', 'session_authz_context_matches'] },
  }[stage]
}

export function sensorVerticalCsv(...rows) {
  return serializeCsv([SENSOR_VERTICAL_HEADER, ...rows.map(row => SENSOR_VERTICAL_HEADER.map(field => row[field]))])
}

function sharedRuntimeComponent(source, measured, profile) {
  const packageValue = source.component_set.packages.find(item => item.package_id === measured.package_id)
  const sourceComponent = source.components.find(item => item.component_id === measured.component_id)
  return {
    component_id: measured.component_id,
    repository: sourceComponent.repository,
    branch: `feat/die-${profile}`,
    commit_sha: sourceComponent.source_commit,
    artifact_digest: sourceComponent.installed_artifact_digest,
    contract_digest: `sha256:${'d'.repeat(64)}`,
    role: profile,
    clean_tree: true,
    provenance: 'exact_source_build',
    build_ref: packageValue.build_evidence_ref,
    installation_class: measured.role === 'browser_extension' ? 'browser_extension' : 'package',
    install_artifact_digest: packageValue.package_digest,
    installed_artifact_digest: sourceComponent.installed_artifact_digest,
    installed_path_ref: sourceComponent.installed_artifact_ref,
    supervisor: sourceComponent.supervisor,
    service_unit: sourceComponent.service_unit,
    runtime_identity: measured.runtime_identity,
    normal_entrypoint: sourceComponent.normal_entrypoint,
    effective_configuration_digest: sourceComponent.effective_configuration_digest,
    installation_evidence_ref: sourceComponent.installation_evidence_ref,
  }
}

function sharedRuntimeManifest(browser, browserDigest, endpoint, endpointDigest) {
  const entries = [
    { profile: 'browser', profile_version: '1.0.0', component_role: 'browser', schema_digest: `sha256:${'e'.repeat(64)}` },
    { profile: 'endpoint', profile_version: '1.0.0', component_role: 'endpoint', schema_digest: `sha256:${'f'.repeat(64)}` },
  ]
  const components = [
    ...browser.component_set.components.map(item => sharedRuntimeComponent(browser, item, 'browser')),
    ...endpoint.component_set.components.map(item => sharedRuntimeComponent(endpoint, item, 'endpoint')),
  ]
  const componentById = new Map(components.map(item => [item.component_id, item]))
  const config = browser.components[0].effective_configuration_digest
  const producer = (profile, source, sourceDigest, producerId, certificationId, installationId, sourceRef) => {
    const primary = source.component_set.ownership.delivery_component_id
    return {
      profile,
      profile_version: '1.0.0',
      producer_id: producerId,
      installation_id: installationId,
      certification_id: certificationId,
      component_id: primary,
      component_ids: source.component_set.components.map(item => item.component_id),
      artifact_digest: componentById.get(primary).artifact_digest,
      component_set_digest: source.component_set.component_set_digest,
      configuration_digest: componentById.get(primary).effective_configuration_digest,
      credential_class: 'dpop_jwt',
      credential_issuer_class: 'starliner_control',
      enrollment_evidence_ref: source.enrollment.evidence_ref,
      source_product_path_ref: sourceRef,
      source_product_path_digest: sourceDigest,
    }
  }
  return {
    schema_version: '1.0',
    schema: 'die.runtime-manifest.v1',
    manifest_id: MANIFEST_ID,
    candidate_digest: `sha256:${'9'.repeat(64)}`,
    environment_id: 'browser-endpoint-cross-source-e2e',
    runtime_mode: 'COHERENT_LOCAL_PRODUCT',
    authority_commit: AUTHORITY,
    generated_contract_digest: `sha256:${'d'.repeat(64)}`,
    database_migration_digest: `sha256:${'d'.repeat(64)}`,
    configuration_digest: config,
    tenant_authority: {
      mode: 'starliner_control',
      tenant_ref: `tenant-ref:sha256:${createHash('sha256').update(TENANT).digest('hex')}`,
      configuration_digest: config,
    },
    profile_registry: {
      registry_ref: 'evidence/control/shared-profile-registry.json',
      registry_digest: runtimeProfileRegistryDigest(entries),
      entries,
    },
    components,
    stores: {
      postgresql: { version: '17.10', endpoint_ref: 'secret-ref:pg', configuration_digest: config },
      object_store: { provider: 's3-compatible', version: '2026.1', endpoint_ref: 'secret-ref:object', configuration_digest: config },
      clickhouse: { version: '26.3', endpoint_ref: 'secret-ref:ch', configuration_digest: config },
    },
    producers: [
      producer(
        'browser', browser, browserDigest, PRODUCER, CERTIFICATION,
        'browser-installation-1', 'source-product/browser.yaml',
      ),
      producer(
        'endpoint', endpoint, endpointDigest, ENDPOINT_PRODUCER, ENDPOINT_CERTIFICATION,
        'endpoint-installation-1', 'source-product/endpoint.yaml',
      ),
    ],
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
    created_at: '2026-08-05T00:00:00Z',
    started_at: '2026-08-05T00:00:01Z',
    evidence_ref: 'evidence/runtime/shared',
    limitations: [],
  }
}

function buildSharedVerticalRow(root, profile, source, sourceDigest, runtime, runtimeDigest) {
  const endpoint = profile === 'endpoint'
  const prefix = endpoint ? 'endpoint' : 'browser'
  const primaryId = source.component_set.ownership.delivery_component_id
  const primary = source.components.find(item => item.component_id === primaryId)
  const producerId = endpoint ? ENDPOINT_PRODUCER : PRODUCER
  const row = {
    vertical_id: endpoint ? 'SV-ENDPOINT-001' : 'SV-BROWSER-001',
    capability_id: endpoint ? 'PC-004' : 'PC-002',
    profile,
    source_product_path_ref: `source-product/${prefix}.yaml`,
    source_product_path_digest: sourceDigest,
    implementation_state: 'ACTIVE',
    normal_path_state: 'COHERENT_E2E',
    proof_origin: 'EXACT_INSTALLED_PRODUCT',
    artifact_binding: 'FULL_EXACT',
    source_commit: source.source_commit,
    install_artifact_ref: source.installation.install_artifact_ref,
    install_artifact_digest: source.installation.install_artifact_digest,
    installed_artifact_ref: primary.installed_artifact_ref,
    installed_artifact_digest: primary.installed_artifact_digest,
    component_set_digest: source.component_set.component_set_digest,
    runtime_manifest_ref: 'runtime/shared.json',
    runtime_manifest_digest: runtimeDigest,
    runtime_manifest_id: runtime.manifest_id,
    highest_integrated_stage: 'LIVE_UI',
    limitations_json: '[]',
    next_action: `complete ${profile} Gate B breadth`,
  }
  for (const [, refField, digestField] of VERTICAL_STAGES) {
    row[refField] = 'NONE'
    row[digestField] = 'NONE'
  }
  let predecessor = 'NONE'
  for (const [index, [stage, refField, digestField]] of VERTICAL_STAGES.entries()) {
    const value = {
      schema: 'die.sensor-stage-evidence.v1',
      vertical_id: row.vertical_id,
      capability_id: row.capability_id,
      profile,
      stage,
      observed_at: `2026-08-05T01:${String(index).padStart(2, '0')}:00Z`,
      integration_run_id: 'run-cross-source-001',
      logical_tenant_id: TENANT,
      producer_id: producerId,
      installation_id: `${prefix}-installation-1`,
      source_record_id: `${prefix}-record-1`,
      source_commit: row.source_commit,
      source_product_path_digest: sourceDigest,
      install_artifact_digest: row.install_artifact_digest,
      installed_artifact_digest: row.installed_artifact_digest,
      component_set_digest: row.component_set_digest,
      runtime_manifest_digest: index >= 2 ? runtimeDigest : 'NONE',
      runtime_manifest_id: index >= 2 ? runtime.manifest_id : 'NONE',
      proof_origin: row.proof_origin,
      runtime_mode: runtime.runtime_mode,
      normal_entrypoint: true,
      fixture_substitution: false,
      manual_bypass: false,
      preview_path: false,
      contamination_state: 'CLEAN',
      predecessor_digest: predecessor,
      assertion: assertion(stage, profile),
    }
    const path = `evidence/${prefix}/stages/${String(index).padStart(2, '0')}-${stage.toLowerCase()}.json`
    const stageDigest = writeRetained(root, path, `${JSON.stringify(value)}\n`)
    row[refField] = path
    row[digestField] = stageDigest
    predecessor = stageDigest
  }
  return row
}

export function buildCrossSourceSensorVerticalFixture() {
  const root = mkdtempSync(join(tmpdir(), 'die-cross-source-vertical-'))
  const browser = sourcePath(root, true)
  const endpoint = endpointSourcePath(root)
  const browserDigest = writeRetained(
    root,
    'source-product/browser.yaml',
    `${JSON.stringify(browser, null, 2)}\n`,
  )
  const endpointDigest = writeRetained(
    root,
    'source-product/endpoint.yaml',
    `${JSON.stringify(endpoint, null, 2)}\n`,
  )
  writeRetained(root, 'evidence/control/shared-profile-registry.json', '{"profiles":["browser","endpoint"]}\n')
  const runtime = sharedRuntimeManifest(browser, browserDigest, endpoint, endpointDigest)
  const runtimeDigest = writeRetained(root, 'runtime/shared.json', `${JSON.stringify(runtime, null, 2)}\n`)
  const browserRow = buildSharedVerticalRow(root, 'browser', browser, browserDigest, runtime, runtimeDigest)
  const endpointRow = buildSharedVerticalRow(root, 'endpoint', endpoint, endpointDigest, runtime, runtimeDigest)
  return {
    root,
    runtime,
    runtimeRef: 'runtime/shared.json',
    runtimeDigest,
    browserSource: browser,
    endpointSource: endpoint,
    browserRow,
    endpointRow,
    sensorText: sensorVerticalCsv(endpointRow, browserRow),
  }
}

export function buildSensorVerticalFixture(highestStage = 'LIVE_UI') {
  const root = mkdtempSync(join(tmpdir(), 'die-sensor-vertical-'))
  const highestIndex = highestStage === 'NONE' ? -1 : VERTICAL_STAGES.findIndex(([stage]) => stage === highestStage)
  const coherent = highestIndex >= 2
  const source = sourcePath(root, coherent)
  const sourceBytes = `${JSON.stringify(source, null, 2)}\n`
  const sourceDigest = writeRetained(root, 'source-product/browser.yaml', sourceBytes)
  let runtime = null
  let runtimeDigest = 'NONE'
  if (coherent) {
    writeRetained(root, 'evidence/control/profile-registry.json', '{"profile":"browser"}\n')
    runtime = runtimeManifest(source, sourceDigest)
    runtimeDigest = writeRetained(root, 'runtime/browser.json', `${JSON.stringify(runtime, null, 2)}\n`)
  }
  const row = {
    vertical_id: 'SV-BROWSER-001', capability_id: 'PC-002', profile: 'browser',
    source_product_path_ref: 'source-product/browser.yaml', source_product_path_digest: sourceDigest,
    implementation_state: 'ACTIVE', normal_path_state: source.normal_path_state,
    proof_origin: 'EXACT_INSTALLED_PRODUCT', artifact_binding: 'FULL_EXACT', source_commit: EXTENSION_COMMIT,
    install_artifact_ref: source.installation.install_artifact_ref, install_artifact_digest: source.installation.install_artifact_digest,
    installed_artifact_ref: source.components[0].installed_artifact_ref, installed_artifact_digest: source.components[0].installed_artifact_digest,
    component_set_digest: source.component_set.component_set_digest,
    runtime_manifest_ref: coherent ? 'runtime/browser.json' : 'NONE', runtime_manifest_digest: runtimeDigest,
    runtime_manifest_id: coherent ? runtime.manifest_id : 'NONE', highest_integrated_stage: highestStage,
    limitations_json: '[]', next_action: 'advance exact installed Browser source',
  }
  for (const [, refField, digestField] of VERTICAL_STAGES) {
    row[refField] = 'NONE'
    row[digestField] = 'NONE'
  }
  let predecessor = 'NONE'
  for (const [index, [stage, refField, digestField]] of VERTICAL_STAGES.entries()) {
    if (index > highestIndex)
      break
    const value = {
      schema: 'die.sensor-stage-evidence.v1', vertical_id: row.vertical_id, capability_id: row.capability_id,
      profile: row.profile, stage, observed_at: `2026-08-05T00:${String(index + 2).padStart(2, '0')}:00Z`,
      integration_run_id: 'run-browser-001', logical_tenant_id: TENANT, producer_id: PRODUCER,
      installation_id: 'browser-installation-1', source_record_id: 'browser-record-1', source_commit: row.source_commit,
      source_product_path_digest: sourceDigest, install_artifact_digest: row.install_artifact_digest,
      installed_artifact_digest: row.installed_artifact_digest, component_set_digest: row.component_set_digest,
      runtime_manifest_digest: index >= 2 ? runtimeDigest : 'NONE', runtime_manifest_id: index >= 2 ? MANIFEST_ID : 'NONE',
      proof_origin: row.proof_origin, runtime_mode: 'COHERENT_LOCAL_PRODUCT', normal_entrypoint: true,
      fixture_substitution: false, manual_bypass: false, preview_path: false, contamination_state: 'CLEAN',
      predecessor_digest: predecessor, assertion: assertion(stage),
    }
    const path = `evidence/stages/${stage.toLowerCase().replaceAll('_', '-')}.json`
    const stageDigest = writeRetained(root, path, `${JSON.stringify(value)}\n`)
    row[refField] = path
    row[digestField] = stageDigest
    predecessor = stageDigest
  }
  return { root, row, source, runtime }
}

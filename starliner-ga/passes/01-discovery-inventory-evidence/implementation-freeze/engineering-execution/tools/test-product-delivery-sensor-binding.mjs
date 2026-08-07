#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildGateBTestFixture } from './gate-b-test-fixtures.mjs'
import {
  initializeProductDeliveryState,
  PRODUCT_DELIVERY_HEADER,
  validateProductDeliveryState,
} from './product-delivery-state-lib.mjs'
import { parseCsv, serializeCsv } from './csv-lib.mjs'
import {
  buildCrossSourceSensorVerticalFixture,
  buildSensorVerticalFixture,
  sensorVerticalCsv,
} from './sensor-vertical-test-fixtures.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fullCapabilityMap = readFileSync(resolve(root, 'registers/product-capability-map.csv'), 'utf8')

function setProduct(row, field, value) {
  row[PRODUCT_DELIVERY_HEADER.indexOf(field)] = value
}

const browser = buildSensorVerticalFixture('LIVE_UI')
const productRows = parseCsv(initializeProductDeliveryState(fullCapabilityMap, 'a'.repeat(40)))
const browserProduct = productRows.find(row => row[0] === 'PC-002')
for (const [field, value] of Object.entries({
  implementation_state: 'IMPLEMENTED', integration_state: 'E2E_DEV',
  evidence_state: 'EXACT_SHA_LOCAL', release_state: 'INTERNAL_ONLY',
  runtime_mode: 'COHERENT_LOCAL_PRODUCT', highest_proven_stage: 'LIVE_UI',
  last_verified_sha: 'b'.repeat(40), runtime_manifest: 'runtime/browser.yaml',
  runtime_manifest_digest: browser.row.runtime_manifest_digest,
})) setProduct(browserProduct, field, value)
const product = serializeCsv(productRows)
const browserSensors = sensorVerticalCsv(browser.row)

assert(validateProductDeliveryState(product, fullCapabilityMap)
  .some(error => /without SENSOR_VERTICAL_STATE/.test(error)))
assert.deepEqual(validateProductDeliveryState(product, fullCapabilityMap, {
  sensorVerticalText: browserSensors, sensorEvidenceRoot: browser.root,
}), [])

const behind = buildSensorVerticalFixture('PROJECTED')
assert(validateProductDeliveryState(product, fullCapabilityMap, {
  sensorVerticalText: sensorVerticalCsv(behind.row), sensorEvidenceRoot: behind.root,
}).some(error => /exceeds every PC-002/.test(error)))

const corrupt = buildSensorVerticalFixture('LIVE_UI')
writeFileSync(join(corrupt.root, corrupt.row.live_ui_ref), '{"not":"the bound proof"}\n')
assert(validateProductDeliveryState(product, fullCapabilityMap, {
  sensorVerticalText: sensorVerticalCsv(corrupt.row), sensorEvidenceRoot: corrupt.root,
}).some(error => /SENSOR_VERTICAL_STATE: .*digest mismatch/.test(error)))

const capabilityRows = parseCsv(fullCapabilityMap)
const releaseMap = serializeCsv([
  capabilityRows[0],
  ...capabilityRows.slice(1).filter(row => ['PC-002', 'PC-004'].includes(row[0])),
])
const shared = buildCrossSourceSensorVerticalFixture()
const releaseRows = parseCsv(initializeProductDeliveryState(releaseMap, shared.runtime.authority_commit))
for (const row of releaseRows.slice(1)) {
  for (const [field, value] of Object.entries({
    implementation_state: 'IMPLEMENTED', integration_state: 'E2E_EXACT_SHA',
    evidence_state: 'RELEASE_BOUND', release_state: 'RELEASABLE',
    runtime_mode: 'RELEASE_CANDIDATE', highest_proven_stage: 'RELEASE_QUALIFIED',
    last_verified_sha: 'e'.repeat(40), runtime_manifest: 'runtime/release-candidate.yaml',
    runtime_manifest_digest: shared.runtimeDigest,
  })) setProduct(row, field, value)
}
const releaseProduct = serializeCsv(releaseRows)
const gates = buildGateBTestFixture(['browser', 'endpoint'])
const releaseContext = {
  sensorVerticalText: shared.sensorText, sensorEvidenceRoot: shared.root,
  gateBCertificationText: gates.certificationText, gateBObligationText: gates.catalogText,
  gateBEvidenceRoot: gates.root,
}
assert.deepEqual(validateProductDeliveryState(releaseProduct, releaseMap, releaseContext), [])

assert(validateProductDeliveryState(releaseProduct, releaseMap, {
  sensorVerticalText: shared.sensorText, sensorEvidenceRoot: shared.root,
}).some(error => /requires complete Gate-B/.test(error)))

const browserOnlyGate = buildGateBTestFixture(['browser'])
assert(validateProductDeliveryState(releaseProduct, releaseMap, {
  ...releaseContext,
  gateBCertificationText: browserOnlyGate.certificationText,
  gateBObligationText: browserOnlyGate.catalogText,
  gateBEvidenceRoot: browserOnlyGate.root,
}).some(error => /terminal Gate-B evidence for endpoint/.test(error)))

const corruptShared = buildCrossSourceSensorVerticalFixture()
writeFileSync(join(corruptShared.root, corruptShared.endpointRow.live_ui_ref), '{"corrupt":true}\n')
assert(validateProductDeliveryState(releaseProduct, releaseMap, {
  ...releaseContext,
  sensorVerticalText: corruptShared.sensorText,
  sensorEvidenceRoot: corruptShared.root,
}).some(error => /SENSOR_VERTICAL_STATE: .*digest mismatch/.test(error)))

console.log('DIE product/sensor/Gate-B composition tests passed: semantic library validation and all-included-profile release closure.')

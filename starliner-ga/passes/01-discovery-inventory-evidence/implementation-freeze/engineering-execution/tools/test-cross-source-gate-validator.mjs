#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { CROSS_SOURCE_GATE_HEADER, validateCrossSourceGate } from './cross-source-gate-lib.mjs'
import { serializeCsv } from './product-delivery-state-lib.mjs'
import { SENSOR_VERTICAL_HEADER } from './sensor-vertical-state-lib.mjs'
import { buildCrossSourceSensorVerticalFixture } from './sensor-vertical-test-fixtures.mjs'

const fixture = buildCrossSourceSensorVerticalFixture()
const {
  root, endpointRow: endpoint, browserRow: browser, sensorText,
  runtimeRef, runtimeDigest,
} = fixture
function retain(path, content) {
  const full = join(root, path)
  mkdirSync(dirname(full), { recursive: true })
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content)
  writeFileSync(full, bytes)
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}
function gateCsv(value) {
  return serializeCsv([
    CROSS_SOURCE_GATE_HEADER,
    CROSS_SOURCE_GATE_HEADER.map(field => value[field]),
  ])
}

let mutationSequence = 0
function mutateProof(gate, field, mutate) {
  const changed = structuredClone(gate)
  const originalRef = gate[`${field}_ref`]
  const value = JSON.parse(readFileSync(join(root, originalRef), 'utf8'))
  mutate(value)
  mutationSequence += 1
  const ref = `evidence/cross-source/mutated-${String(mutationSequence).padStart(2, '0')}-${field}.json`
  changed[`${field}_ref`] = ref
  changed[`${field}_digest`] = retain(ref, `${JSON.stringify(value)}\n`)
  return changed
}

const emptySensors = serializeCsv([SENSOR_VERTICAL_HEADER])
const open = Object.fromEntries(CROSS_SOURCE_GATE_HEADER.map(field => [field, 'NONE']))
Object.assign(open, {
  gate_id: 'CSG-ENDPOINT-BROWSER-001',
  state: 'OPEN',
  next_action: 'complete Endpoint and Browser exact-product verticals',
})
assert.deepEqual(validateCrossSourceGate(gateCsv(open), emptySensors), [])

const proven = structuredClone(open)
Object.assign(proven, {
  state: 'PROVEN',
  endpoint_vertical_id: endpoint.vertical_id,
  browser_vertical_id: browser.vertical_id,
  runtime_manifest_ref: runtimeRef,
  runtime_manifest_digest: runtimeDigest,
  next_action: 'expand cross-source graph coverage while remaining Gate-A sources integrate',
})
const kinds = [
  ['POSITIVE_BINDING', 'positive_binding', 'trusted_binding_accepted'],
  ['POSITIVE_RELATIONSHIP', 'positive_relationship', 'materialized_once'],
  ['UNRESOLVED_CANDIDATES', 'unresolved_candidates', 'candidates_retained_separate'],
  ['NO_FABRICATED_MERGE', 'no_fabricated_merge', 'zero_weak_key_merge'],
  ['PENDING_DEPENDENCY', 'pending_dependency', 'pending_dependency_durable'],
  ['REEVALUATION', 'reevaluation', 'reevaluated_after_binding'],
  ['REPLAY', 'replay', 'no_duplicate_binding_relationship'],
]
const assertions = {
  POSITIVE_BINDING: {
    binding_rule_id: 'browser.local_binding',
    endpoint_source_object_id: 'endpoint:device:1',
    browser_source_object_id: 'browser:installation:1',
    endpoint_entity_id: '99999999-9999-4999-8999-999999999998',
    browser_entity_id: '99999999-9999-4999-8999-999999999999',
    endpoint_evidence_id: '66666666-6666-4666-8666-666666666667',
    browser_evidence_id: '66666666-6666-4666-8666-666666666666',
    binding_evidence_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    trust_basis: 'signed_local_binding',
    weak_key_only: false,
  },
  POSITIVE_RELATIONSHIP: {
    relationship_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    relationship_rule_id: 'REL-X-001',
    relationship_version: 1,
    predicate: 'installed_on',
    subject_entity_id: '99999999-9999-4999-8999-999999999999',
    object_entity_id: '99999999-9999-4999-8999-999999999998',
    evidence_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    materialized_count: 1,
  },
  UNRESOLVED_CANDIDATES: {
    endpoint_candidate_id: 'candidate-endpoint-weak-001',
    browser_candidate_id: 'candidate-browser-weak-001',
    endpoint_entity_id: '99999999-9999-4999-8999-999999999998',
    browser_entity_id: '99999999-9999-4999-8999-999999999999',
    resolution_state: 'unresolved',
    reason_code: 'weak_key_only',
    visible_in_api: true,
  },
  NO_FABRICATED_MERGE: {
    endpoint_entity_id: '99999999-9999-4999-8999-999999999998',
    browser_entity_id: '99999999-9999-4999-8999-999999999999',
    weak_key: 'same-email-or-hostname',
    fabricated_merge_count: 0,
  },
  PENDING_DEPENDENCY: {
    candidate_id: 'relationship-candidate-001',
    dependency_id: 'binding-dependency-001',
    state: 'pending_dependency',
    persisted: true,
    wake_count: 0,
  },
  REEVALUATION: {
    candidate_id: 'relationship-candidate-001',
    dependency_id: 'binding-dependency-001',
    trigger_binding_id: 'binding-trigger-001',
    state: 'materialized',
    materialized_relationship_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    wake_count: 1,
  },
  REPLAY: {
    original_delivery_id: 'delivery-original-001',
    replay_delivery_id: 'delivery-replay-001',
    canonical_entity_count_delta: 0,
    binding_count_delta: 0,
    relationship_count_delta: 0,
    outbox_count_delta: 0,
  },
}
for (const [kind, field, result] of kinds) {
  const proof = {
    schema: 'die.cross-source-gate-evidence.v1',
    gate_id: proven.gate_id,
    evidence_kind: kind,
    result,
    observed_at: '2026-08-05T02:00:00Z',
    integration_run_id: 'run-cross-source-001',
    logical_tenant_id: '442e052d-4c60-4cdc-961e-bc9db74a40ca',
    runtime_manifest_digest: runtimeDigest,
    endpoint_vertical_id: endpoint.vertical_id,
    browser_vertical_id: browser.vertical_id,
    endpoint_source_record_id: 'endpoint-record-1',
    browser_source_record_id: 'browser-record-1',
    assertion: assertions[kind],
  }
  proven[`${field}_ref`] = `evidence/cross-source/${field}.json`
  proven[`${field}_digest`] = retain(proven[`${field}_ref`], `${JSON.stringify(proof)}\n`)
}
assert.deepEqual(validateCrossSourceGate(gateCsv(proven), sensorText, root), [])

const missingNegative = structuredClone(proven)
missingNegative.no_fabricated_merge_ref = 'NONE'
missingNegative.no_fabricated_merge_digest = 'NONE'
assert(validateCrossSourceGate(gateCsv(missingNegative), sensorText, root)
  .some(error => /NO_FABRICATED_MERGE/.test(error)))

const borrowedRun = structuredClone(proven)
const borrowed = {
  schema: 'die.cross-source-gate-evidence.v1',
  gate_id: proven.gate_id,
  evidence_kind: 'REPLAY',
  result: 'no_duplicate_binding_relationship',
  observed_at: '2026-08-05T02:01:00Z',
  integration_run_id: 'borrowed-run',
  logical_tenant_id: '442e052d-4c60-4cdc-961e-bc9db74a40ca',
  runtime_manifest_digest: runtimeDigest,
  endpoint_vertical_id: endpoint.vertical_id,
  browser_vertical_id: browser.vertical_id,
  endpoint_source_record_id: 'endpoint-record-1',
  browser_source_record_id: 'browser-record-1',
  assertion: assertions.REPLAY,
}
borrowedRun.replay_ref = 'evidence/cross-source/replay-borrowed.json'
borrowedRun.replay_digest = retain(borrowedRun.replay_ref, `${JSON.stringify(borrowed)}\n`)
assert(validateCrossSourceGate(gateCsv(borrowedRun), sensorText, root)
  .some(error => /integration_run_id must be|integration_run_id does not match/.test(error)))

let mutated = mutateProof(proven, 'replay', value => {
  value.endpoint_source_record_id = 'endpoint-record-forged'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /endpoint_source_record_id must be endpoint-record-1/.test(error)))

mutated = mutateProof(proven, 'positive_binding', value => {
  value.assertion.binding_rule_id = 'BIND-INVENTED-001'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /binding_rule_id does not resolve/.test(error)))

mutated = mutateProof(proven, 'positive_binding', value => {
  value.assertion.endpoint_source_object_id = 'endpoint:device:forged'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /endpoint_source_object_id must match the exact validated source vertical trace/.test(error)))

mutated = mutateProof(proven, 'positive_binding', value => {
  value.assertion.browser_evidence_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /browser_evidence_id must match the exact validated source vertical trace/.test(error)))

mutated = mutateProof(proven, 'positive_binding', value => {
  value.assertion.endpoint_entity_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /endpoint_entity_id must match the exact validated source vertical trace/.test(error)))

mutated = mutateProof(proven, 'positive_relationship', value => {
  value.assertion.relationship_rule_id = 'REL-INVENTED-999'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /relationship_rule_id does not exist in the frozen relationship registry/.test(error)))

mutated = mutateProof(proven, 'positive_relationship', value => {
  value.assertion.predicate = 'used'
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /predicate does not match the frozen relationship rule/.test(error)))

mutated = mutateProof(proven, 'positive_relationship', value => {
  const subject = value.assertion.subject_entity_id
  value.assertion.subject_entity_id = value.assertion.object_entity_id
  value.assertion.object_entity_id = subject
})
assert(validateCrossSourceGate(gateCsv(mutated), sensorText, root)
  .some(error => /preserve the frozen Browser-subject\/Endpoint-object direction/.test(error)))

let alternateRun = structuredClone(proven)
for (const [, field] of kinds)
  alternateRun = mutateProof(alternateRun, field, value => { value.integration_run_id = 'borrowed-complete-run' })
assert(validateCrossSourceGate(gateCsv(alternateRun), sensorText, root)
  .some(error => /integration_run_id must be run-cross-source-001/.test(error)))

const wrongBrowser = structuredClone(browser)
wrongBrowser.highest_integrated_stage = 'AUTHORIZED_API'
wrongBrowser.live_ui_ref = 'NONE'
wrongBrowser.live_ui_digest = 'NONE'
const behindSensorText = serializeCsv([
  SENSOR_VERTICAL_HEADER,
  SENSOR_VERTICAL_HEADER.map(field => endpoint[field]),
  SENSOR_VERTICAL_HEADER.map(field => wrongBrowser[field]),
])
assert(validateCrossSourceGate(gateCsv(proven), behindSensorText, root)
  .some(error => /Browser vertical must reach LIVE_UI/.test(error)))

console.log('DIE immediate Endpoint+Browser cross-source gate tests passed: exact vertical binding, authority, predicate, direction, negative, replay, and high-water rejection.')

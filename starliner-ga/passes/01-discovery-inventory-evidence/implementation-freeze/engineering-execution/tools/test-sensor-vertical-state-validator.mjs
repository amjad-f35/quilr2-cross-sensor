#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { validateSensorVerticalState } from './sensor-vertical-state-lib.mjs'
import {
  buildCrossSourceSensorVerticalFixture,
  buildSensorVerticalFixture,
  sensorVerticalCsv,
} from './sensor-vertical-test-fixtures.mjs'

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function rewriteJson(root, path, mutate) {
  const full = join(root, path)
  const value = JSON.parse(readFileSync(full, 'utf8'))
  mutate(value)
  const bytes = Buffer.from(`${JSON.stringify(value)}\n`)
  writeFileSync(full, bytes)
  return digest(bytes)
}

function reject(highest, mutate, pattern) {
  const fixture = buildSensorVerticalFixture(highest)
  mutate(fixture)
  const errors = validateSensorVerticalState(sensorVerticalCsv(fixture.row), fixture.root)
  assert(errors.some(error => pattern.test(error)), errors.join('\n'))
}

for (const stage of ['LOCAL_WAL', 'INGEST_RECEIPT', 'LIVE_UI']) {
  const fixture = buildSensorVerticalFixture(stage)
  assert.deepEqual(
    validateSensorVerticalState(sensorVerticalCsv(fixture.row), fixture.root),
    [],
    `${stage} positive failed`,
  )
}

const shared = buildCrossSourceSensorVerticalFixture()
assert.deepEqual(
  validateSensorVerticalState(shared.sensorText, shared.root),
  [],
  'shared Endpoint+Browser runtime vertical fixture failed',
)

reject('LOCAL_WAL', ({ row }) => {
  row.native_capture_ref = 'NONE'
  row.native_capture_digest = 'NONE'
}, /without NATIVE_CAPTURE evidence/)

reject('LOCAL_WAL', ({ row }) => {
  row.local_wal_digest = `sha256:${'d'.repeat(64)}`
}, /digest mismatch/)

reject('LOCAL_WAL', ({ row }) => {
  row.source_product_path_ref = '../source.json'
}, /safe evidence-root-relative/)

reject('LOCAL_WAL', ({ row }) => {
  row.component_set_digest = `sha256:${'e'.repeat(64)}`
}, /component_set_digest does not match/)

reject('LOCAL_WAL', fixture => {
  fixture.row.local_wal_digest = rewriteJson(fixture.root, fixture.row.local_wal_ref, value => {
    value.assertion.native_record_id = 'borrowed-record'
  })
}, /LOCAL_WAL does not reference the captured native record/)

reject('INGEST_RECEIPT', fixture => {
  fixture.row.ingest_receipt_digest = rewriteJson(fixture.root, fixture.row.ingest_receipt_ref, value => {
    value.assertion.ingest_operation_id = 'genericPost'
  })
}, /ingest_operation_id must be acceptDeliveryBatch/)

reject('INGEST_RECEIPT', fixture => {
  fixture.row.ingest_receipt_digest = rewriteJson(fixture.root, fixture.row.ingest_receipt_ref, value => {
    value.assertion.receipt_record_id = 'another-envelope-record'
  })
}, /receipt_record_id does not match the exact envelope source_record_id/)

reject('INGEST_RECEIPT', fixture => {
  fixture.row.runtime_manifest_digest = rewriteJson(fixture.root, fixture.row.runtime_manifest_ref, value => {
    value.producers[0].producer_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  })
  for (const [field, stage] of [
    ['ingest_receipt_digest', 'ingest_receipt_ref'],
  ]) {
    fixture.row[field] = rewriteJson(fixture.root, fixture.row[stage], value => {
      value.runtime_manifest_digest = fixture.row.runtime_manifest_digest
    })
  }
}, /producer_id does not match RUNTIME_MANIFEST producer|source product path invalid/)

reject('LIVE_UI', fixture => {
  fixture.row.authorized_api_digest = rewriteJson(fixture.root, fixture.row.authorized_api_ref, value => {
    value.assertion.authorization_revision = '9'
  })
}, /LIVE_UI does not reference the authorized API request\/member\/revision/)

reject('LIVE_UI', fixture => {
  fixture.row.live_ui_digest = rewriteJson(fixture.root, fixture.row.live_ui_ref, value => {
    value.assertion.browser_assertions = ['authorized_member_visible', 'session_authz_context_matches']
  })
}, /three required real-browser assertions/)

reject('LIVE_UI', fixture => {
  fixture.row.canonical_graph_activity_digest = rewriteJson(
    fixture.root,
    fixture.row.canonical_graph_activity_ref,
    value => {
      value.assertion.result_kind = 'pending_dependency'
      value.assertion.result_id = 'NONE'
      value.assertion.applicability = 'applicable_pending_dependency'
      value.assertion.dependency_ids = []
    },
  )
}, /pending_dependency requires NONE result, pending applicability and dependency IDs/)

reject('CANONICAL_GRAPH_ACTIVITY', fixture => {
  fixture.row.canonical_graph_activity_digest = rewriteJson(
    fixture.root,
    fixture.row.canonical_graph_activity_ref,
    value => {
      value.assertion.rule_id = 'REL-INVENTED-999'
    },
  )
}, /rule_id does not exist in the frozen relationship registry/)

reject('CANONICAL_GRAPH_ACTIVITY', fixture => {
  fixture.row.canonical_graph_activity_digest = rewriteJson(
    fixture.root,
    fixture.row.canonical_graph_activity_ref,
    value => {
      value.assertion.rule_id = 'REL-BR-002'
    },
  )
}, /rule_id is not applicable to canonical entity type browser_installation/)

reject('CANONICAL_GRAPH_ACTIVITY', fixture => {
  fixture.row.canonical_graph_activity_digest = rewriteJson(
    fixture.root,
    fixture.row.canonical_graph_activity_ref,
    value => {
      value.assertion.result_kind = 'activity'
      value.assertion.rule_id = 'tool.completed'
    },
  )
}, /rule_id is not an activity mapping for profile browser/)

reject('AUTHORIZED_API', fixture => {
  fixture.row.authorized_api_digest = rewriteJson(fixture.root, fixture.row.authorized_api_ref, value => {
    value.assertion.operation_id = 'inventedInventoryOperation'
  })
}, /operation_id does not exist in the frozen die-v1 OpenAPI/)

reject('AUTHORIZED_API', fixture => {
  fixture.row.authorized_api_digest = rewriteJson(fixture.root, fixture.row.authorized_api_ref, value => {
    value.assertion.operation_id = 'listActivity'
  })
}, /operation does not apply to the asserted canonical entity\/activity/)

reject('LIVE_UI', fixture => {
  fixture.row.live_ui_ref = 'evidence/preview/live-ui.json'
}, /fixture, preview, mock, manual, synthetic, hotfix, or temporary proof path/)

const duplicateFixture = buildSensorVerticalFixture('LOCAL_WAL')
assert(validateSensorVerticalState(
  sensorVerticalCsv(duplicateFixture.row, structuredClone(duplicateFixture.row)),
  duplicateFixture.root,
).some(error => /duplicated/.test(error)))

const noRoot = buildSensorVerticalFixture('LOCAL_WAL')
assert(validateSensorVerticalState(sensorVerticalCsv(noRoot.row))
  .some(error => /without an evidence root/.test(error)))

console.log('DIE sensor vertical state semantic tests passed: 4 accepted; 18 rejected.')

#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { serializeCsv } from './product-delivery-state-lib.mjs'
import { REQUIRED_INPUTS_HEADER, validateRequiredInputs } from './required-inputs-lib.mjs'

const root = mkdtempSync(join(tmpdir(), 'die-required-inputs-'))

function retain(path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

const authorities = [
  ['OFFICIAL_INSTALLATION_DOCUMENTATION', 'evidence/search/install-docs.txt', 'official install guide inspected'],
  ['INSTALLER_OR_BUILD_SOURCE', 'evidence/search/installer.txt', 'installer source inspected'],
  ['PRODUCT_SOURCE', 'evidence/search/product.txt', 'product source inspected'],
  ['DEPLOYMENT_CONFIGURATION', 'evidence/search/deployment.txt', 'deployment configuration inspected'],
  ['SAFE_RUNTIME_EVIDENCE', 'evidence/search/runtime.txt', 'safe runtime state inspected'],
].map(([authority_kind, evidence_ref, notes]) => ({
  authority_kind,
  evidence_ref,
  evidence_digest: retain(evidence_ref, `${notes}\n`),
  outcome: authority_kind === 'SAFE_RUNTIME_EVIDENCE' ? 'NOT_FOUND' : 'FOUND',
  notes,
}))
const reportRef = 'evidence/input-report.txt'
const reportDigest = retain(reportRef, 'test machine approval is unavailable; no credential material retained\n')

function openRow() {
  return {
    input_id: 'RI-ENDPOINT-APPROVAL-001',
    capability_id: 'PC-004',
    profile: 'endpoint',
    input_class: 'PRIVILEGED_INSTALL_OR_APPROVAL',
    required_value_or_action: 'approve the Endpoint system extension on the named test machine',
    normal_product_reason: 'the normal signed package requires operating-system approval',
    disposition: 'PRIVILEGED_USER_ACTION',
    authority_searches_json: JSON.stringify(authorities),
    evidence_ref: reportRef,
    evidence_digest: reportDigest,
    expected_safe_format: 'one approval action and a sanitized systemextensionsctl success record',
    blocked_action: 'activate the Endpoint system extension on test machine mac-test-01',
    owner: 'test-machine administrator',
    unblock_condition: 'systemextensionsctl reports the exact signed extension active',
    recheck_at: '2026-08-06T00:00:00Z',
    independent_next_action: 'finish the unprivileged sender and receipt tests',
    status: 'OPEN',
  }
}

function foundRow() {
  const row = openRow()
  row.input_id = 'RI-ENDPOINT-INSTALLER-001'
  row.input_class = 'OFFICIAL_INSTALL_ARTIFACT'
  row.required_value_or_action = 'locate the exact official Endpoint package artifact'
  row.normal_product_reason = 'the installed-product trace must bind the package users install'
  row.disposition = 'FOUND'
  row.expected_safe_format = 'content-addressed package artifact and build provenance'
  row.blocked_action = 'NONE'
  row.owner = 'NONE'
  row.unblock_condition = 'NONE'
  row.recheck_at = 'NONE'
  row.independent_next_action = 'NONE'
  row.status = 'RESOLVED'
  return row
}

function destructiveRow() {
  const row = openRow()
  row.input_id = 'RI-ENDPOINT-RESET-001'
  row.input_class = 'DESTRUCTIVE_OPERATION_APPROVAL'
  row.required_value_or_action = 'approve resetting the named disposable Endpoint test installation'
  row.normal_product_reason = 'the uninstall and recovery path must be exercised without changing an unapproved machine'
  row.disposition = 'DESTRUCTIVE_APPROVAL'
  row.expected_safe_format = 'approval naming the exact disposable installation and retained recovery snapshot'
  row.blocked_action = 'reset and uninstall Endpoint from disposable machine mac-test-01'
  row.unblock_condition = 'approval confirms the retained snapshot can restore or reimage mac-test-01'
  row.independent_next_action = 'complete non-destructive replay and delivery tests'
  return row
}

function csv(...rows) {
  return serializeCsv([
    REQUIRED_INPUTS_HEADER,
    ...rows.map(row => REQUIRED_INPUTS_HEADER.map(field => row[field])),
  ])
}

function rejects(mutator, pattern, factory = openRow) {
  const row = factory()
  mutator(row)
  const errors = validateRequiredInputs(csv(row), root)
  assert(errors.some(error => pattern.test(error)), errors.join('\n'))
}

assert.deepEqual(validateRequiredInputs(csv(openRow(), foundRow(), destructiveRow()), root), [])

rejects(row => {
  row.authority_searches_json = JSON.stringify(authorities.slice(1))
}, /omits OFFICIAL_INSTALLATION_DOCUMENTATION/)

rejects(row => {
  row.evidence_digest = `sha256:${'a'.repeat(64)}`
}, /digest mismatch/)

rejects(row => {
  row.evidence_ref = '../outside.txt'
}, /safe evidence-root-relative/)

rejects(row => {
  row.disposition = 'WAITING_FOR_ENGINEER'
}, /disposition is invalid/)

rejects(row => {
  row.blocked_action = 'block the entire implementation program'
}, /broader than one exact affected action/)

rejects(row => {
  row.independent_next_action = 'use a fixed tenant id until approval arrives'
}, /prohibited product-path substitute/)

rejects(row => {
  row.status = 'RESOLVED'
}, /must remain OPEN/)

rejects(row => {
  row.disposition = 'EXTERNAL_INFRASTRUCTURE'
}, /requires RUNTIME_INFRASTRUCTURE/)

rejects(row => {
  row.disposition = 'UNKNOWN_AFTER_EXHAUSTIVE_SEARCH'
  row.required_value_or_action = 'tell us the missing installer authority'
}, /must ask one concrete question/)

rejects(row => {
  row.disposition = 'MISSING_PRODUCT_CODE'
  row.input_class = 'PRODUCT_CONFIGURATION'
  row.status = 'ACTIVE'
}, /cannot block development/)

rejects(row => {
  row.blocked_action = 'approve the test'
}, /must name the exact destructive operation/, destructiveRow)

rejects(row => {
  row.unblock_condition = 'approval is received'
}, /must state recovery or irreversibility/, destructiveRow)

rejects(row => {
  row.input_class = 'PRIVILEGED_INSTALL_OR_APPROVAL'
}, /requires DESTRUCTIVE_OPERATION_APPROVAL/, destructiveRow)

const duplicate = openRow()
assert(validateRequiredInputs(csv(duplicate, duplicate), root).some(error => /duplicated/.test(error)))
assert(validateRequiredInputs(csv(openRow())).some(error => /without an evidence root/.test(error)))

console.log('DIE required-input semantic tests passed: 3 accepted; 15 rejected.')

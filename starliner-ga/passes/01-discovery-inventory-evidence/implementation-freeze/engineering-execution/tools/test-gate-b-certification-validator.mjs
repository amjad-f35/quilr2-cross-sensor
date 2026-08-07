#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  GATE_B_CERTIFICATION_HEADER,
  GATE_B_OBLIGATION_HEADER,
  initializeGateBCertification,
  validateGateBCertification,
} from './gate-b-certification-lib.mjs'
import { buildGateBTestFixture } from './gate-b-test-fixtures.mjs'
import { parseCsv, serializeCsv } from './csv-lib.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
const actualCatalog = readFileSync(resolve(executionRoot, 'registers/gate-b-certification-obligations.csv'), 'utf8')
const actualObligations = parseCsv(actualCatalog).slice(1)
  .map(row => Object.fromEntries(GATE_B_OBLIGATION_HEADER.map((field, index) => [field, row[index]])))
const pending = initializeGateBCertification(actualObligations)
assert.deepEqual(validateGateBCertification(pending, actualCatalog), [])

const pendingRows = parseCsv(pending)
const missing = serializeCsv([pendingRows[0], ...pendingRows.slice(2)])
assert(validateGateBCertification(missing, actualCatalog).some(error => /omits generated obligation/.test(error)))

function csv(rows) {
  return serializeCsv([
    GATE_B_CERTIFICATION_HEADER,
    ...rows.map(value => GATE_B_CERTIFICATION_HEADER.map(field => value[field])),
  ])
}

function retain(root, path, value) {
  const full = join(root, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, value)
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

const certified = buildGateBTestFixture(['browser'])
assert.deepEqual(validateGateBCertification(
  certified.certificationText, certified.catalogText, certified.root,
), [])

const missingPrivacy = structuredClone(certified.certificationRows[0])
missingPrivacy.privacy_ref = 'NONE'
missingPrivacy.privacy_digest = 'NONE'
assert(validateGateBCertification(csv([missingPrivacy]), certified.catalogText, certified.root)
  .some(error => /privacy_ref/.test(error)))

const generic = buildGateBTestFixture(['browser'])
const genericRow = structuredClone(generic.certificationRows[0])
const genericProof = {
  schema: 'die.gate-b-stage-evidence.v1', obligation_id: genericRow.obligation_id,
  profile: genericRow.profile, payload_kind: genericRow.payload_kind,
  evidence_stage: 'NATIVE_CALLER', result: 'PASS', observed_at: '2026-08-05T02:00:00Z',
  source_commit: genericRow.source_commit, artifact_digest: genericRow.artifact_digest,
  runtime_manifest_digest: genericRow.runtime_manifest_digest,
  integration_run_id: 'run-cross-source-001', logical_tenant_id: 'tenant-1',
  producer_id: 'producer-1', installation_id: 'install-1', source_record_id: 'record-1',
}
genericRow.native_caller_digest = retain(
  generic.root, genericRow.native_caller_ref, `${JSON.stringify(genericProof)}\n`,
)
assert(validateGateBCertification(csv([genericRow]), generic.catalogText, generic.root)
  .some(error => /keys must be exactly|raw_artifact|assertion/.test(error)))

const falseReplay = buildGateBTestFixture(['browser'])
const falseReplayRow = structuredClone(falseReplay.certificationRows[0])
const replayProofPath = join(falseReplay.root, falseReplayRow.replay_degraded_ref)
const replayProof = JSON.parse(readFileSync(replayProofPath, 'utf8'))
replayProof.assertion.degraded_state_visible = false
const replayRawPath = join(falseReplay.root, replayProof.raw_artifact_ref)
const replayRaw = JSON.parse(readFileSync(replayRawPath, 'utf8'))
replayRaw.observations.degraded_state_visible = false
replayProof.raw_artifact_digest = retain(
  falseReplay.root, replayProof.raw_artifact_ref, `${JSON.stringify(replayRaw)}\n`,
)
falseReplayRow.replay_degraded_digest = retain(
  falseReplay.root, falseReplayRow.replay_degraded_ref, `${JSON.stringify(replayProof)}\n`,
)
assert(validateGateBCertification(csv([falseReplayRow]), falseReplay.catalogText, falseReplay.root)
  .some(error => /idempotent replay plus visible degraded behavior/.test(error)))

const manifestMismatch = buildGateBTestFixture(['browser'])
manifestMismatch.certificationRows[0].source_commit = 'e'.repeat(40)
assert(validateGateBCertification(
  csv(manifestMismatch.certificationRows), manifestMismatch.catalogText, manifestMismatch.root,
).some(error => /runtime manifest|source commit and artifact/.test(error)))

function authorityRepo(obligationId, { status = 'accepted', bind = true, duplicate = false } = {}) {
  const repo = mkdtempSync(join(tmpdir(), 'die-gate-b-authority-'))
  const register = join(repo, 'starliner-ga/passes/01-discovery-inventory-evidence/registers/decisions.yaml')
  mkdirSync(dirname(register), { recursive: true })
  const entries = [
    `  - id: DIE-ADR-099\n    status: ${status}`
      + `${bind ? `\n    gate_b_disposition: APPROVED_UNSUPPORTED\n    gate_b_obligation_ids:\n      - ${obligationId}` : ''}`,
  ]
  if (duplicate) {
    entries.push(`  - id: DIE-ADR-098\n    status: accepted\n    gate_b_disposition: APPROVED_UNSUPPORTED\n    gate_b_obligation_ids:\n      - ${obligationId}`)
  }
  writeFileSync(register, `decisions:\n${entries.join('\n')}\n`)
  for (const args of [
    ['init', '-q'], ['config', 'user.name', 'Gate B Test'],
    ['config', 'user.email', 'gate-b@example.invalid'], ['add', '.'],
    ['commit', '-q', '-m', 'authority fixture'],
  ]) {
    const result = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
  }
  const commit = spawnSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim()
  return { repo, commit }
}

function unsupportedFixture(authorityOptions) {
  const fixture = buildGateBTestFixture(['browser'])
  const value = structuredClone(fixture.certificationRows[0])
  value.outcome = 'APPROVED_UNSUPPORTED'
  value.authority_commit = authorityOptions.commit
  value.change_control_id = 'DIE-ADR-099'
  for (const field of GATE_B_CERTIFICATION_HEADER) {
    if (field.endsWith('_ref') || field.endsWith('_digest')
      || field === 'source_commit' || field === 'artifact_digest') {
      value[field] = 'NONE'
    }
  }
  value.change_control_ref = 'evidence/change-control.json'
  const proof = {
    schema: 'die.gate-b-change-control.v1', change_control_id: value.change_control_id,
    obligation_id: value.obligation_id, profile: value.profile, payload_kind: value.payload_kind,
    decision: 'APPROVED_UNSUPPORTED', rationale: 'the exact native route is excluded by accepted authority',
    approved_at: '2026-08-05T02:00:00Z', approved_by: 'architecture-authority',
    authority_commit: value.authority_commit,
  }
  value.change_control_digest = retain(fixture.root, value.change_control_ref, `${JSON.stringify(proof)}\n`)
  return { fixture, value, proof }
}

const acceptedAuthority = authorityRepo(certified.obligations[0].obligation_id)
const unsupported = unsupportedFixture(acceptedAuthority)
assert.deepEqual(validateGateBCertification(
  csv([unsupported.value]), unsupported.fixture.catalogText, unsupported.fixture.root,
  { authorityRepo: acceptedAuthority.repo, authorityCommit: acceptedAuthority.commit },
), [])

const arbitrary = structuredClone(unsupported.value)
arbitrary.change_control_id = 'DIE-CC-101'
assert(validateGateBCertification(
  csv([arbitrary]), unsupported.fixture.catalogText, unsupported.fixture.root,
  { authorityRepo: acceptedAuthority.repo, authorityCommit: acceptedAuthority.commit },
).some(error => /accepted bounded-pass ADR|not an accepted/.test(error)))

const stale = unsupportedFixture(acceptedAuthority)
stale.value.authority_commit = 'f'.repeat(40)
stale.proof.authority_commit = stale.value.authority_commit
stale.value.change_control_digest = retain(stale.fixture.root, stale.value.change_control_ref, `${JSON.stringify(stale.proof)}\n`)
assert(validateGateBCertification(
  csv([stale.value]), stale.fixture.catalogText, stale.fixture.root,
  { authorityRepo: acceptedAuthority.repo, authorityCommit: acceptedAuthority.commit },
).some(error => /current authority commit/.test(error)))

for (const options of [{ bind: false }, { status: 'deferred_parallel' }, { duplicate: true }]) {
  const authority = authorityRepo(certified.obligations[0].obligation_id, options)
  const value = unsupportedFixture(authority)
  assert(validateGateBCertification(
    csv([value.value]), value.fixture.catalogText, value.fixture.root,
    { authorityRepo: authority.repo, authorityCommit: authority.commit },
  ).some(error => /exactly one accepted|not an accepted exact-obligation/.test(error)))
}

const blocked = buildGateBTestFixture(['browser'])
const blockedRow = structuredClone(blocked.certificationRows[0])
blockedRow.profile_gate_state = 'OPEN'
blockedRow.outcome = 'EXTERNAL_BLOCKED'
for (const field of GATE_B_CERTIFICATION_HEADER) {
  if (field.endsWith('_ref') || field.endsWith('_digest')
    || ['authority_commit', 'source_commit', 'artifact_digest'].includes(field)) {
    blockedRow[field] = 'NONE'
  }
}
blockedRow.blocker_class = 'EXTERNAL_INFRASTRUCTURE'
blockedRow.blocker_ref = 'evidence/blocker.json'
blockedRow.unblock_condition = 'the exact isolated environment is available'
blockedRow.next_action = 'continue deterministic owned-code tests'
blockedRow.blocker_digest = retain(blocked.root, blockedRow.blocker_ref, `${JSON.stringify({
  schema: 'die.gate-b-blocker.v1', obligation_id: blockedRow.obligation_id,
  profile: blockedRow.profile, payload_kind: blockedRow.payload_kind,
  blocker_class: blockedRow.blocker_class,
  blocked_action: 'execute the exact installed artifact in the isolated native environment',
  blocker_owner: 'environment-owner', unblock_condition: blockedRow.unblock_condition,
  observed_at: '2026-08-05T02:00:00Z',
})}\n`)
assert.deepEqual(validateGateBCertification(csv([blockedRow]), blocked.catalogText, blocked.root), [])

console.log('DIE Gate-B certification tests passed: typed exact-runtime proof, raw execution binding, committed ADR authority, and fail-closed negatives.')

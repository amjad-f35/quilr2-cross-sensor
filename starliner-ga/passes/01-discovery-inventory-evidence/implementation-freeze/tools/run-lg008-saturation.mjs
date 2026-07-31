#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(toolDir, '..')
const output = join(root, 'lg008')
const generatedFiles = [
  'authority-manifest.json',
  'profile-admission.csv',
  'native-field-disposition.csv',
  'record-catalog.csv',
  'access-recipes.csv',
  'current-source-delta-files.csv',
  'target-field-traceability.csv',
]

function run(name, env = {}) {
  return execFileSync('node', [join(toolDir, name)], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env: {
      ...process.env,
      LG008_VALIDATION_MODE: 'source',
      ...env,
    },
  }).trim()
}

function digests() {
  return Object.fromEntries(generatedFiles.map(name => [
    name,
    createHash('sha256').update(readFileSync(join(output, name))).digest('hex'),
  ]))
}

const passOneBuild = run('build-lg008-authority.mjs')
const passOneValidate = run('validate-lg008-authority.mjs', { LG008_SKIP_SATURATION: '1' })
const passOneDigests = digests()
const passTwoBuild = run('build-lg008-authority.mjs')
const passTwoValidate = run('validate-lg008-authority.mjs', { LG008_SKIP_SATURATION: '1' })
const passTwoDigests = digests()
const changed = generatedFiles.filter(name =>
  passOneDigests[name] !== passTwoDigests[name])

if (changed.length)
  throw new Error(`LG-008 saturation drift: ${changed.join(', ')}`)

const manifest = JSON.parse(readFileSync(join(output, 'authority-manifest.json'), 'utf8'))
const report = {
  saturation_version: 'lg008-static-saturation/1.0.0',
  executed_at: '2026-07-30',
  pass_one: {
    build: passOneBuild,
    validation: passOneValidate,
    generated_digests: passOneDigests,
  },
  pass_two: {
    build: passTwoBuild,
    validation: passTwoValidate,
    generated_digests: passTwoDigests,
  },
  zero_new_item_result: 'PASS',
  changed_generated_files: changed,
  counts: manifest.counts,
  assurance_boundary: {
    closed: 'Static selected-source reconciliation and deterministic contract propagation for five profiles.',
    separate_live_gate: 'LG-005 native capture-to-profile certification for each built artifact and supported runtime.',
  },
}
writeFileSync(
  join(output, 'saturation-pass.json'),
  `${JSON.stringify(report, null, 2)}\n`,
)

run('validate-lg008-authority.mjs')

console.log(
  `LG-008 saturation passed twice with zero generated drift: `
  + `${manifest.counts.native_fields} fields; ${manifest.counts.target_fields} target traces.`,
)

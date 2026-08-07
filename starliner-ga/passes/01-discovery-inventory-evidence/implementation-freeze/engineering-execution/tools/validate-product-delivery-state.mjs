#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  parseCsv,
  PRODUCT_DELIVERY_HEADER,
  rowToExecutionStatus,
  validateProductDeliveryState,
} from './product-delivery-state-lib.mjs'
import { validateRuntimeManifestFile } from './validate-runtime-manifest.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
const statePath = resolve(process.argv[2] || '')
if (!process.argv[2]) {
  console.error('usage: validate-product-delivery-state.mjs <PRODUCT_DELIVERY_STATE.csv> [product-capability-map.csv] [SENSOR_VERTICAL_STATE.csv] [evidence-root] [GATE_B_CERTIFICATION.csv] [gate-b-obligations.csv] [authority-repo] [authority-commit]')
  process.exit(2)
}
const mapPath = resolve(process.argv[3] || resolve(executionRoot, 'registers/product-capability-map.csv'))
const stateText = readFileSync(statePath, 'utf8')
const mapText = readFileSync(mapPath, 'utf8')
const sensorPath = process.argv[4] ? resolve(process.argv[4]) : null
const evidenceRoot = process.argv[5] ? resolve(process.argv[5]) : null
const sensorText = sensorPath ? readFileSync(sensorPath, 'utf8') : null
const gateBPath = process.argv[6] ? resolve(process.argv[6]) : null
const gateBObligationPath = process.argv[7]
  ? resolve(process.argv[7])
  : resolve(executionRoot, 'registers/gate-b-certification-obligations.csv')
const authorityRepo = process.argv[8] ? resolve(process.argv[8]) : null
const authorityCommit = process.argv[9] || null
const gateBCertificationText = gateBPath ? readFileSync(gateBPath, 'utf8') : null
const gateBObligationText = gateBPath ? readFileSync(gateBObligationPath, 'utf8') : null
const errors = validateProductDeliveryState(stateText, mapText, {
  sensorVerticalText: sensorText,
  sensorEvidenceRoot: evidenceRoot,
  gateBCertificationText,
  gateBObligationText,
  gateBEvidenceRoot: evidenceRoot,
  gateBAuthority: { authorityRepo, authorityCommit },
})

let rows = []
try {
  rows = parseCsv(stateText, statePath)
}
catch {
  // The primary validator already recorded the parse failure.
}
if (rows.length && JSON.stringify(rows[0]) === JSON.stringify(PRODUCT_DELIVERY_HEADER)) {
  for (const [index, row] of rows.slice(1).entries()) {
    const { value } = rowToExecutionStatus(row, index + 2)
    if (value.runtime_manifest === 'NONE')
      continue
    const manifestPath = resolve(dirname(statePath), value.runtime_manifest)
    if (!existsSync(manifestPath)) {
      errors.push(`${statePath}:${index + 2} runtime manifest does not exist: ${value.runtime_manifest}`)
      continue
    }
    const digest = `sha256:${createHash('sha256').update(readFileSync(manifestPath)).digest('hex')}`
    if (digest !== value.runtime_manifest_digest)
      errors.push(`${statePath}:${index + 2} runtime manifest digest mismatch`)
    try {
      errors.push(...validateRuntimeManifestFile(manifestPath).map(error => `${statePath}:${index + 2} ${error}`))
    }
    catch (error) {
      errors.push(`${statePath}:${index + 2} ${error.message}`)
    }
  }
}

if (errors.length) {
  console.error('DIE product delivery state validation FAILED')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}
console.log(`DIE product delivery state validation passed: ${statePath}`)

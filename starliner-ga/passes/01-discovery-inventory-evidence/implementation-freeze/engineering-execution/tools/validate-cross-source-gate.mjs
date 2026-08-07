#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { validateCrossSourceGate } from './cross-source-gate-lib.mjs'

if (!process.argv[2] || !process.argv[3]) {
  console.error('usage: validate-cross-source-gate.mjs <CROSS_SOURCE_GATE.csv> <SENSOR_VERTICAL_STATE.csv> [evidence-root]')
  process.exit(2)
}
const gatePath = resolve(process.argv[2])
const sensorPath = resolve(process.argv[3])
const evidenceRoot = process.argv[4] ? resolve(process.argv[4]) : null
const errors = validateCrossSourceGate(
  readFileSync(gatePath, 'utf8'),
  readFileSync(sensorPath, 'utf8'),
  evidenceRoot,
)
if (errors.length) {
  console.error('DIE cross-source gate validation FAILED')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}
console.log(`DIE cross-source gate validation passed: ${gatePath}`)

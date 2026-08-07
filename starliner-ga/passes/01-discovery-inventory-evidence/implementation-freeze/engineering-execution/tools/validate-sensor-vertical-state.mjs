#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { validateSensorVerticalState } from './sensor-vertical-state-lib.mjs'

const [ledgerPath, evidenceRootArg] = process.argv.slice(2)
if (!ledgerPath) {
  console.error('usage: validate-sensor-vertical-state.mjs <SENSOR_VERTICAL_STATE.csv> [evidence-root]')
  process.exit(2)
}
const absoluteLedger = resolve(ledgerPath)
const evidenceRoot = resolve(evidenceRootArg || dirname(absoluteLedger))
const errors = validateSensorVerticalState(readFileSync(absoluteLedger, 'utf8'), evidenceRoot)
if (errors.length) {
  errors.forEach(error => console.error(`ERROR: ${error}`))
  process.exit(1)
}
console.log(`Sensor vertical-state validation passed: ${absoluteLedger}`)

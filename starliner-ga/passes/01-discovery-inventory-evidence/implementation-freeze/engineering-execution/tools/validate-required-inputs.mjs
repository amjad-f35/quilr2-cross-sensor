#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { validateRequiredInputs } from './required-inputs-lib.mjs'

const [ledgerPath, evidenceRootArg] = process.argv.slice(2)
if (!ledgerPath) {
  console.error('usage: validate-required-inputs.mjs <REQUIRED_INPUTS.csv> [evidence-root]')
  process.exit(2)
}
const absoluteLedger = resolve(ledgerPath)
const evidenceRoot = resolve(evidenceRootArg || dirname(absoluteLedger))
const errors = validateRequiredInputs(readFileSync(absoluteLedger, 'utf8'), evidenceRoot)
if (errors.length) {
  errors.forEach(error => console.error(`ERROR: ${error}`))
  process.exit(1)
}
console.log(`Required-input ledger validation passed: ${absoluteLedger}`)

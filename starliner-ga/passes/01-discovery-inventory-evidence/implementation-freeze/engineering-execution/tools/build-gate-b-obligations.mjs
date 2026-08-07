#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildGateBObligations,
  initializeGateBCertification,
  serializeGateBObligations,
} from './gate-b-certification-lib.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
const freezeRoot = resolve(executionRoot, '..')
const dispositionPath = resolve(freezeRoot, 'registers/profile-capability-disposition.csv')
const tracePath = resolve(freezeRoot, 'lg008/target-field-traceability.csv')
const catalogPath = resolve(executionRoot, 'registers/gate-b-certification-obligations.csv')
const templatePath = resolve(executionRoot, 'templates/GATE_B_CERTIFICATION.csv.template')
const obligations = buildGateBObligations(
  readFileSync(dispositionPath, 'utf8'),
  readFileSync(tracePath, 'utf8'),
)
const catalog = serializeGateBObligations(obligations)
const template = initializeGateBCertification(obligations)

if (process.argv.includes('--write')) {
  writeFileSync(catalogPath, catalog)
  writeFileSync(templatePath, template)
  console.log(`Wrote ${obligations.length} Gate-B obligations.`)
}
else {
  const errors = []
  if (readFileSync(catalogPath, 'utf8') !== catalog)
    errors.push('checked-in Gate-B obligation catalog has generated drift')
  if (readFileSync(templatePath, 'utf8') !== template)
    errors.push('checked-in Gate-B certification template has generated drift')
  if (errors.length) {
    errors.forEach(error => console.error(`- ${error}`))
    process.exit(1)
  }
  console.log(`Gate-B obligation catalog is complete and drift-free: ${obligations.length} obligations.`)
}

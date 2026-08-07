#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateGateBCertification } from './gate-b-certification-lib.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
if (!process.argv[2]) {
  console.error('usage: validate-gate-b-certification.mjs <GATE_B_CERTIFICATION.csv> [evidence-root] [obligation-catalog] [authority-repo] [authority-commit]')
  process.exit(2)
}
const certificationPath = resolve(process.argv[2])
const evidenceRoot = process.argv[3] ? resolve(process.argv[3]) : null
const catalogPath = resolve(process.argv[4] || resolve(executionRoot, 'registers/gate-b-certification-obligations.csv'))
const errors = validateGateBCertification(
  readFileSync(certificationPath, 'utf8'),
  readFileSync(catalogPath, 'utf8'),
  evidenceRoot,
  {
    authorityRepo: process.argv[5] ? resolve(process.argv[5]) : null,
    authorityCommit: process.argv[6] || null,
  },
)
if (errors.length) {
  console.error('DIE Gate-B certification validation FAILED')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}
console.log(`DIE Gate-B certification validation passed: ${certificationPath}`)

#!/usr/bin/env node

import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const toolDir = dirname(fileURLToPath(import.meta.url))
const freezeRoot = resolve(toolDir, '..')
const repositoryRoot = resolve(freezeRoot, '../../../..')
const python = process.env.DIE_VALIDATOR_PYTHON || 'python3'

const cases = [
  {
    id: 'MUT-001',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/lg008/authority-manifest.json',
    mutate(text) {
      return replaceRequired(
        text,
        /"sha256": "([0-9a-f])/,
        (_, first) => `"sha256": "${first === 'a' ? 'b' : 'a'}`,
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-lg008-authority.mjs'],
    environment: { LG008_VALIDATION_MODE: 'intrinsic' },
  },
  {
    id: 'MUT-002',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/sql/001-die-core.sql',
    mutate(text) {
      return replaceRequired(
        text,
        /ALTER TABLE ([a-z_]+\.[a-z_]+) FORCE ROW LEVEL SECURITY;/,
        'ALTER TABLE $1 NO FORCE ROW LEVEL SECURITY;',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-003',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/openapi/die-v1.openapi.yaml',
    mutate(text) {
      return replaceRequired(
        text,
        /x-quilr-capability: [a-z.]+/,
        'x-quilr-capability: mutation.invalid',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-004',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/production-readiness/registers/gate-test-catalog.csv',
    mutate(text) {
      return replaceRequired(text, ',"PLANNED"', ',"SKIPPED"', this.id)
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-005',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/gate-evidence-package.schema.json',
    mutate(text) {
      return replaceRequired(
        text,
        '"pattern": "^(?!/)(?!.*\\\\.\\\\.).+$"',
        '"pattern": "^.*$"',
        this.id,
      )
    },
    command: [
      python,
      'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/test-schema-contracts.py',
    ],
  },
  {
    id: 'MUT-006',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/live/postgres-conformance.sql',
    mutate(text) {
      return replaceRequired(
        text,
        "OR SQLSTATE <> '23505'",
        "OR SQLSTATE = '23505'",
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-007',
    path: 'starliner-ga/README.md',
    mutate(text) {
      return `${text}\n[mutation-broken-link](missing-mutation-target.md)\n`
    },
    command: ['node', 'starliner-ga/tools/validate-corpus.mjs'],
  },
  {
    id: 'MUT-008',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/registers/source-temporal-precedence.csv',
    mutate(text) {
      return replaceRequired(text, ',numeric_decimal_string,', ',lexicographic,', this.id)
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-009',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/registers/implementation-conformance.csv',
    mutate(text) {
      return replaceRequired(text, ',transitional_must_remove,', ',done_enough,', this.id)
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-010',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/openapi/die-v1.openapi.yaml',
    mutate(text) {
      return replaceRequired(text, 'source_ended, retracted, reconciliation_absent, corrected, unknown', 'source_ended, corrected, unknown', this.id)
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
]

function replaceRequired(text, search, replacement, id) {
  const changed = text.replace(search, replacement)
  if (changed === text)
    throw new Error(`${id}: mutation target was not found`)
  return changed
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'die-validator-mutations-'))
try {
  cpSync(repositoryRoot, temporaryRoot, {
    recursive: true,
    filter(source) {
      return !source.split('/').includes('.git')
    },
  })

  const failures = []
  for (const test of cases) {
    const path = join(temporaryRoot, test.path)
    const original = readFileSync(path, 'utf8')
    writeFileSync(path, test.mutate(original))
    const [command, ...args] = test.command
    const result = spawnSync(command, args, {
      cwd: temporaryRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        DIE_VALIDATOR_PYTHON: python,
        LG008_VALIDATION_MODE: 'intrinsic',
        ...test.environment,
      },
    })
    writeFileSync(path, original)
    if (result.status === 0) {
      failures.push(`${test.id}: validator accepted the injected defect`)
      appendFileSync(
        join(temporaryRoot, 'mutation-failures.log'),
        `${test.id}\n${result.stdout}\n${result.stderr}\n`,
      )
    }
    else {
      console.log(`${test.id}: detected`)
    }
  }
  if (failures.length)
    throw new Error(failures.join('\n'))
  console.log(`Validator mutation tests passed: ${cases.length} defects detected.`)
}
finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}

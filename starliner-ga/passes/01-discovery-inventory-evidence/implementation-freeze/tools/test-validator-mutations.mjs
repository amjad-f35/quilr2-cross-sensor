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
  {
    id: 'MUT-011',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/registers/product-capability-map.csv',
    mutate(text) {
      return replaceRequired(
        text,
        ',"PC-001 plus ingest profile and receipt contracts","LG004|LG005|LG006",',
        ',"LG005","LG004|LG005|LG006",',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-012',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/registers/product-capability-map.csv',
    mutate(text) {
      return replaceRequired(
        text,
        '"PC-003","Browser Backend catalog configuration and event evidence as a distinct producer in the shared estate","NATIVE_CAPTURE|LOCAL_WAL|',
        '"PC-003","Browser Backend catalog configuration and event evidence as a distinct producer in the shared estate","',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-013',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/execution-status.schema.json',
    mutate(text) {
      let changed = replaceRequired(
        text,
        '"integration_state": { "enum": ["NOT_CONNECTED", "PARTIAL_PATH"] },\n          "evidence_state": { "const": "RUNTIME_OBSERVED_DEV" }',
        '"integration_state": { "enum": ["NOT_CONNECTED", "PARTIAL_PATH", "E2E_DEV"] },\n          "evidence_state": { "const": "RUNTIME_OBSERVED_DEV" }',
        this.id,
      )
      changed = replaceRequired(
        changed,
        '"runtime_mode": { "const": "COHERENT_LOCAL_PRODUCT" },\n          "evidence_state": { "enum": ["RUNTIME_OBSERVED_DEV", "EXACT_SHA_LOCAL"] }',
        '"runtime_mode": { "enum": ["DEV_PREVIEW", "COHERENT_LOCAL_PRODUCT"] },\n          "evidence_state": { "enum": ["RUNTIME_OBSERVED_DEV", "EXACT_SHA_LOCAL"] }',
        this.id,
      )
      return changed
    },
    command: [
      python,
      'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/test-schema-contracts.py',
    ],
  },
  {
    id: 'MUT-014',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/execution-status.schema.json',
    mutate(text) {
      return replaceRequired(text, '    "blocker_class",\n', '', this.id)
    },
    command: [
      python,
      'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/test-schema-contracts.py',
    ],
  },
  {
    id: 'MUT-015',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/execution-status.schema.json',
    mutate(text) {
      return replaceRequired(
        text,
        '"then": { "properties": { "release_state": { "const": "RELEASABLE" } } }',
        '"then": { "properties": { "release_state": { "enum": ["NOT_ELIGIBLE", "INTERNAL_ONLY", "RELEASABLE"] } } }',
        this.id,
      )
    },
    command: [
      python,
      'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/test-schema-contracts.py',
    ],
  },
  {
    id: 'MUT-016',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/templates/RUNTIME_MANIFEST.yaml',
    mutate(text) {
      return replaceRequired(text, 'runtime_mode: NONE', 'runtime_mode: COHERENT_LOCAL_PRODUCT', this.id)
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-017',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/registers/product-capability-map.csv',
    mutate(text) {
      return replaceRequired(
        text,
        '"future","NO","future_extension","NO",',
        '"future","YES","bounded_die","NO",',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-018',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/jira/die-work-program-import.csv',
    mutate(text) {
      return replaceRequired(
        text,
        '"DIE-PRODUCT","frozen physical data and storage contracts","LG001;LG002"',
        '"DIE-PRODUCT","DIE-WP00","LG001;LG002"',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-019',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/execution-status.schema.json',
    mutate(text) {
      return replaceRequired(
        text,
        '"blocker_evidence": { "pattern": "^(?!NONE$)(?!/)(?!.*\\\\.\\\\.)[A-Za-z0-9_.\\\\/-]+$" }',
        '"blocker_evidence": { "minLength": 1 }',
        this.id,
      )
    },
    command: [
      python,
      'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/test-schema-contracts.py',
    ],
  },
  {
    id: 'MUT-020',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/registers/product-capability-map.csv',
    mutate(text) {
      return replaceRequired(
        text,
        '"LG004|LG005|LG006","YES","bounded_die","YES"',
        '"LG004|LG005|LG006","NO","future_extension","YES"',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-execution-kit.mjs'],
  },
  {
    id: 'MUT-021',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-runtime-manifest.mjs',
    mutate(text) {
      return replaceRequired(
        text,
        'else if (producerComponent.role !== registryEntry.component_role) {',
        'else if (false && producerComponent.role !== registryEntry.component_role) {',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/test-runtime-manifest-validator.mjs'],
  },
  {
    id: 'MUT-022',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-runtime-manifest.mjs',
    mutate(text) {
      return replaceRequired(
        text,
        'if (producer.artifact_digest !== producerComponent.artifact_digest) {',
        'if (false && producer.artifact_digest !== producerComponent.artifact_digest) {',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/test-runtime-manifest-validator.mjs'],
  },
  {
    id: 'MUT-023',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-runtime-manifest.mjs',
    mutate(text) {
      return replaceRequired(
        text,
        'if (!registryEntry) {',
        'if (false && !registryEntry) {',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/test-runtime-manifest-validator.mjs'],
  },
  {
    id: 'MUT-024',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-runtime-manifest.mjs',
    mutate(text) {
      return replaceRequired(
        text,
        'if (manifest.profile_registry.registry_digest !== calculatedRegistryDigest) {',
        'if (false && manifest.profile_registry.registry_digest !== calculatedRegistryDigest) {',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/test-runtime-manifest-validator.mjs'],
  },
  {
    id: 'MUT-025',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/validate-runtime-manifest.mjs',
    mutate(text) {
      return replaceRequired(
        text,
        "else if (!LAUNCH_PROFILES.has(entry.profile) && !EXTENSION_COMPONENT_ROLES.has(entry.component_role)) {",
        "else if (false && !LAUNCH_PROFILES.has(entry.profile) && !EXTENSION_COMPONENT_ROLES.has(entry.component_role)) {",
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/engineering-execution/tools/test-runtime-manifest-validator.mjs'],
  },
  {
    id: 'MUT-026',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/openapi/die-v1.openapi.yaml',
    mutate(text) {
      return replaceRequired(
        text,
        'enum: [unknown, healthy, degraded, unhealthy, offline]',
        'enum: [unknown, healthy, degraded, unhealthy, offline, critical]',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-027',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/sql/001-die-core.sql',
    mutate(text) {
      return replaceRequired(
        text,
        "'unknown','healthy','degraded','unhealthy','offline'",
        "'unknown','healthy','degraded','unhealthy','offline','stale'",
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-028',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/edge-configuration.schema.json',
    mutate(text) {
      return replaceRequired(
        text,
        '    "health_policy",\n    "signature"',
        '    "signature"',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-029',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/sql/001-die-core.sql',
    mutate(text) {
      return replaceRequired(
        text,
        "  CHECK (health_policy_version IS NOT NULL OR health_state = 'unknown'),",
        '',
        this.id,
      )
    },
    command: ['node', 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/tools/validate-freeze.mjs'],
  },
  {
    id: 'MUT-030',
    path: 'starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/schemas/producer-enrollment-manifest.schema.json',
    mutate(text) {
      return replaceRequired(
        text,
        '"additionalProperties": false,\n      "description": "Signed producer health policy.',
        '"additionalProperties": true,\n      "description": "Signed producer health policy.',
        this.id,
      )
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

  function commandEnvironment(test) {
    return {
      ...process.env,
      DIE_VALIDATOR_PYTHON: python,
      LG008_VALIDATION_MODE: 'intrinsic',
      ...test.environment,
    }
  }

  function runValidator(test) {
    const [command, ...args] = test.command
    return spawnSync(command, args, {
      cwd: temporaryRoot,
      encoding: 'utf8',
      env: commandEnvironment(test),
    })
  }

  // A mutation is evidence only when its validator is healthy on the pristine
  // copied tree. Without this preflight, a missing dependency or validator
  // crash would be misreported as successful defect detection merely because
  // the subprocess returned nonzero.
  const baselineCommands = new Map()
  for (const test of cases) {
    const key = JSON.stringify({ command: test.command, environment: test.environment || {} })
    if (!baselineCommands.has(key))
      baselineCommands.set(key, test)
  }
  const baselineFailures = []
  for (const test of baselineCommands.values()) {
    const result = runValidator(test)
    if (result.status !== 0) {
      const commandLabel = test.command.join(' ')
      baselineFailures.push(`${commandLabel}: pristine validator exited ${String(result.status)}`)
      appendFileSync(
        join(temporaryRoot, 'mutation-baseline-failures.log'),
        `${commandLabel}\nstatus=${String(result.status)}\n${result.stdout || ''}\n${result.stderr || ''}\n`,
      )
    }
  }
  if (baselineFailures.length) {
    throw new Error(
      `Validator mutation baseline preflight FAILED; no mutation result is valid:\n${baselineFailures.join('\n')}`,
    )
  }
  console.log(`Validator mutation baseline preflight passed: ${baselineCommands.size} distinct validator commands.`)

  const failures = []
  for (const test of cases) {
    const path = join(temporaryRoot, test.path)
    const original = readFileSync(path, 'utf8')
    writeFileSync(path, test.mutate(original))
    const result = runValidator(test)
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

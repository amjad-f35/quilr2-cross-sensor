#!/usr/bin/env node

import { createHash } from 'node:crypto'
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const toolDir = dirname(fileURLToPath(import.meta.url))
const freezeRoot = resolve(toolDir, '..')
const repositoryRoot = resolve(freezeRoot, '../../../..')
const mode = process.argv.includes('--source') ? 'source' : 'intrinsic'
const allowDirty = process.argv.includes('--allow-dirty')
const python = process.env.DIE_VALIDATOR_PYTHON || 'python3'
const evidenceDir = resolve(
  process.env.DIE_VALIDATION_EVIDENCE_DIR
    || join(tmpdir(), `die-static-validation-${Date.now()}`),
)
const startedAt = new Date().toISOString()
const results = []
let failed = false

mkdirSync(evidenceDir, { recursive: true })

function execute(name, command, args, environment = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, ...environment },
  })
  const record = {
    name,
    command: [command, ...args],
    exit_code: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  }
  results.push(record)
  process.stdout.write(`\n=== ${name} ===\n`)
  process.stdout.write(result.stdout || '')
  process.stderr.write(result.stderr || '')
  if (result.status !== 0)
    failed = true
  return record
}

function git(...args) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0)
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`)
  return result.stdout.trim()
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function version(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  return `${result.stdout || ''}${result.stderr || ''}`.trim()
}

const initialStatus = git('status', '--porcelain=v1')
if (initialStatus && !allowDirty) {
  console.error('authoritative clean-room validation requires a clean worktree')
  console.error(initialStatus)
  failed = true
}

execute(
  'whole corpus structure',
  'node',
  [join(repositoryRoot, 'starliner-ga/tools/validate-corpus.mjs')],
)
execute(
  'outer DIE pass',
  'node',
  [join(freezeRoot, '../tools/validate-pass.mjs')],
)
execute(
  'implementation freeze and intrinsic LG-008 authority',
  'node',
  [join(toolDir, 'validate-freeze.mjs')],
  {
    DIE_VALIDATOR_PYTHON: python,
    LG008_VALIDATION_MODE: 'intrinsic',
  },
)
execute(
  'portable cloud-agent source context',
  'node',
  [join(toolDir, 'validate-cloud-context.mjs')],
)
execute(
  'agentic engineering execution kit',
  'node',
  [join(freezeRoot, 'engineering-execution/tools/validate-execution-kit.mjs')],
)
execute(
  'runtime manifest semantic contracts',
  'node',
  [join(freezeRoot, 'engineering-execution/tools/test-runtime-manifest-validator.mjs')],
)
execute(
  'JSON Schema contracts',
  python,
  [join(toolDir, 'test-schema-contracts.py')],
)
execute(
  'OpenAPI contracts',
  python,
  [join(toolDir, 'test-openapi-contracts.py')],
)
execute(
  'PostgreSQL grammar and dependency order',
  python,
  [join(toolDir, 'test-postgres-ddl.py')],
)
execute(
  'validator mutation tests',
  'node',
  [join(toolDir, 'test-validator-mutations.mjs')],
  {
    DIE_VALIDATOR_PYTHON: python,
  },
)
execute(
  'runner shell syntax',
  'sh',
  [
    '-n',
    join(toolDir, 'run-live-storage-conformance.sh'),
    join(toolDir, 'run-local-postgres-conformance.sh'),
    join(toolDir, 'run-local-clickhouse-conformance.sh'),
  ],
)
execute(
  'Git whitespace check outside byte-exact source evidence',
  'git',
  [
    'diff',
    '--check',
    'HEAD',
    '--',
    '.',
    ':(exclude)starliner-ga/passes/01-discovery-inventory-evidence/implementation-freeze/cloud-context/payload/**',
  ],
)

if (mode === 'source') {
  execute(
    'source-backed LG-008 regeneration and saturation',
    'node',
    [join(toolDir, 'run-lg008-saturation.mjs')],
    {
      CONSOLIDATE_ROOT: process.env.CONSOLIDATE_ROOT || '',
      LG008_VALIDATION_MODE: 'source',
    },
  )
  execute(
    'generated authority drift check',
    'git',
    [
      'diff',
      '--exit-code',
      '--',
      relative(repositoryRoot, join(freezeRoot, 'lg008')),
    ],
  )
}

const report = {
  schema_version: 'die-static-validation-evidence/1.0.0',
  mode,
  authoritative: !allowDirty,
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  repository: {
    commit: git('rev-parse', 'HEAD'),
    tree: git('rev-parse', 'HEAD^{tree}'),
    initial_status: initialStatus,
    final_status: git('status', '--porcelain=v1'),
  },
  environment: {
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    python_command: python,
    python: version(python),
    git: version('git'),
  },
  normative_artifacts: Object.fromEntries([
    'sql/001-die-core.sql',
    'sql/002-die-clickhouse.sql',
    'sql/003-die-roles-and-grants.sql',
    'openapi/die-v1.openapi.yaml',
    'openapi/starliner-ingest-v1.openapi.yaml',
    'lg008/authority-manifest.json',
  ].map(path => [path, sha256(join(freezeRoot, path))])),
  results,
  result: failed ? 'FAIL' : 'PASS',
}

const reportPath = join(evidenceDir, 'static-validation-report.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`\nValidation evidence: ${reportPath}`)

if (failed)
  process.exit(1)

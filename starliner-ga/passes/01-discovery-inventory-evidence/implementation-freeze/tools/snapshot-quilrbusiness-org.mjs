#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = join(root, 'evidence', 'github')
mkdirSync(outputDirectory, { recursive: true })

const output = execFileSync(
  'gh',
  [
    'api',
    '--paginate',
    '--slurp',
    '/orgs/quilrbusiness/repos?per_page=100&type=all',
  ],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)

const pages = JSON.parse(output)
const repositories = pages
  .flat()
  .map(repository => ({
    id: repository.id,
    node_id: repository.node_id,
    name: repository.name,
    full_name: repository.full_name,
    html_url: repository.html_url,
    clone_url: repository.clone_url,
    visibility: repository.visibility,
    private: repository.private,
    archived: repository.archived,
    disabled: repository.disabled,
    fork: repository.fork,
    default_branch: repository.default_branch,
    created_at: repository.created_at,
    updated_at: repository.updated_at,
    pushed_at: repository.pushed_at,
    size_kib: repository.size,
    language: repository.language,
    description: repository.description,
    topics: repository.topics ?? [],
    classification:
      repository.archived || repository.name.startsWith('DEPRECATED-')
        ? 'DEPRECATED_OR_ARCHIVED'
        : /(^|[-_])(poc|demo|test|workshop|simulator)([-_]|$)/i.test(repository.name)
            ? 'POC_DEMO_OR_TEST_CANDIDATE'
            : 'ACTIVE_CANDIDATE',
  }))
  .sort((left, right) => left.name.localeCompare(right.name))

const canonical = `${JSON.stringify(repositories, null, 2)}\n`
const sha256 = createHash('sha256').update(canonical).digest('hex')
const snapshot = {
  schema_version: '1.0',
  organization: 'quilrbusiness',
  generated_at: new Date().toISOString(),
  repository_count: repositories.length,
  archived_count: repositories.filter(repository => repository.archived).length,
  deprecated_or_archived_count: repositories.filter(
    repository => repository.classification === 'DEPRECATED_OR_ARCHIVED',
  ).length,
  poc_demo_or_test_candidate_count: repositories.filter(
    repository => repository.classification === 'POC_DEMO_OR_TEST_CANDIDATE',
  ).length,
  active_candidate_count: repositories.filter(
    repository => repository.classification === 'ACTIVE_CANDIDATE',
  ).length,
  repositories_sha256: sha256,
}

const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`
const csvHeader = [
  'name',
  'full_name',
  'visibility',
  'archived',
  'fork',
  'default_branch',
  'pushed_at',
  'size_kib',
  'language',
  'classification',
  'html_url',
  'description',
]
const csv = [
  csvHeader.join(','),
  ...repositories.map(repository =>
    csvHeader.map(field => csvCell(repository[field])).join(',')),
  '',
].join('\n')

writeFileSync(
  join(outputDirectory, 'quilrbusiness-repositories.json'),
  canonical,
  'utf8',
)
writeFileSync(
  join(outputDirectory, 'quilrbusiness-repositories.csv'),
  csv,
  'utf8',
)
writeFileSync(
  join(outputDirectory, 'quilrbusiness-repository-snapshot.json'),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  'utf8',
)

process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`)

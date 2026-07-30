#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = join(root, 'evidence', 'github')
mkdirSync(outputDirectory, { recursive: true })

const configuredRepositories = [
  // Native producers.
  'Project-Vanguard',
  'project-sentinel',
  'sentinel-endpoint-agent',
  'macrodata-refinement',
  'quilr-llm-gateway',
  // Current ingress, relay, persistence, and graph consumers.
  'browser-extension-service',
  'extension-api-service',
  'extension-log-service',
  'extension-ingestion-service',
  'quilr-ingestion-service',
  'quilr-entities-service',
  'data-explorer-service',
  'quilr-migration-service',
  // Inspected graph candidate; source does not currently prove an incoming
  // producer/deployment edge, so classification remains adjacent.
  'quilr-graph-service',
  // Direct source-available build/runtime libraries.
  'sentinel-macro-lib',
  'ai-internal-sdks',
  'ipc-event-bus',
  'quilr-api-lib',
  'quilr-kafka-client',
  'quilr-metrics-lib',
  'quilr-authz-lib',
  'quilr-forwarder-library',
  'api-caching-lib',
  'jwt-decoder-library',
  // Source-controlled reachability/configuration evidence.
  'quilr-bff',
  'nginx-ingress-controller',
  'ConstantsConfigsSync',
  'ExtensionConstantsConfigs',
  'extension-configs',
  // Target fit-gap context.
  'project-starliner',
]

const requestedRepositories = process.argv.slice(2)
const repositories = requestedRepositories.length > 0
  ? requestedRepositories
  : configuredRepositories

const organizationRepositories = JSON.parse(readFileSync(
  join(outputDirectory, 'quilrbusiness-repositories.json'),
  'utf8',
))
const organizationByName = new Map(
  organizationRepositories.map(repository => [repository.name, repository]),
)

const localManifest = JSON.parse(readFileSync(
  join(outputDirectory, 'local-source-checkouts.json'),
  'utf8',
))
const localByName = new Map(
  localManifest.rows.map(row => [row.repository, row]),
)

function gh(endpoint) {
  return JSON.parse(execFileSync(
    'gh',
    ['api', endpoint],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  ))
}

function optionalGh(endpoint, fallback) {
  try {
    return gh(endpoint)
  }
  catch {
    return fallback
  }
}

const outputPath = join(outputDirectory, 'selected-revision-and-build-evidence.json')
const existingRows = existsSync(outputPath)
  ? JSON.parse(readFileSync(outputPath, 'utf8')).rows
  : []
const rowByName = new Map(existingRows.map(row => [row.repository, row]))

for (const repository of repositories) {
  const metadata = organizationByName.get(repository)
  if (!metadata)
    throw new Error(`Repository ${repository} is absent from the organization snapshot`)
  const local = localByName.get(repository)
  if (!local?.commit)
    throw new Error(`Repository ${repository} has no pinned local checkout in local-source-checkouts.json`)
  const runResponse = optionalGh(`/repos/quilrbusiness/${repository}/actions/runs?per_page=40`, { workflow_runs: [] })
  const runs = (runResponse.workflow_runs ?? []).map(run => ({
    id: run.id,
    name: run.name,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    head_branch: run.head_branch,
    head_sha: run.head_sha,
    run_attempt: run.run_attempt,
    created_at: run.created_at,
    updated_at: run.updated_at,
    html_url: run.html_url,
  }))
  rowByName.set(repository, {
    repository,
    repository_url: metadata.html_url,
    default_branch: metadata.default_branch,
    selected_source_sha: local.commit,
    selected_source_branch: local.branch,
    selected_source_is_shallow_checkout: local.shallow,
    pushed_at: metadata.pushed_at,
    archived: metadata.archived,
    latest_run: runs[0] ?? null,
    latest_successful_default_branch_run:
      runs.find(run => run.head_branch === metadata.default_branch && run.conclusion === 'success') ?? null,
    latest_successful_run:
      runs.find(run => run.conclusion === 'success') ?? null,
    recent_runs: runs,
  })

  const progressRows = [...rowByName.values()]
    .sort((left, right) => left.repository.localeCompare(right.repository))
  const progressCanonical = JSON.stringify(progressRows)
  writeFileSync(
    outputPath,
    `${JSON.stringify({
      schema: 'quilr.github.selected_revision_and_build_evidence.v1',
      organization: 'quilrbusiness',
      generated_at: new Date().toISOString(),
      repository_count: progressRows.length,
      rows_sha256: createHash('sha256').update(progressCanonical).digest('hex'),
      qualification: [
        'The selected source SHA is the immutable checkout inspected at the cutoff; it is not proof of customer deployment.',
        'A successful GitHub Actions run is source-controlled build evidence, not proof of production rollout.',
        'Release/tag identity is a separate deployment/release concern and is not inferred when a repository publishes no release.',
      ],
      rows: progressRows,
    }, null, 2)}\n`,
  )
}

const rows = [...rowByName.values()]
  .sort((left, right) => left.repository.localeCompare(right.repository))
const canonicalRows = JSON.stringify(rows)
const output = {
  schema: 'quilr.github.selected_revision_and_build_evidence.v1',
  organization: 'quilrbusiness',
  generated_at: new Date().toISOString(),
  repository_count: rows.length,
  rows_sha256: createHash('sha256').update(canonicalRows).digest('hex'),
  qualification: [
    'The selected source SHA is the immutable checkout inspected at the cutoff; it is not proof of customer deployment.',
    'A successful GitHub Actions run is source-controlled build evidence, not proof of production rollout.',
    'Release/tag identity is a separate deployment/release concern and is not inferred when a repository publishes no release.',
  ],
  rows,
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)

process.stdout.write(`${JSON.stringify({
  generated_at: output.generated_at,
  repository_count: output.repository_count,
  rows_sha256: output.rows_sha256,
}, null, 2)}\n`)

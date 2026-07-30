#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const sourcePath = join(root, 'evidence/github/quilrbusiness-repositories.json')
const rows = JSON.parse(readFileSync(sourcePath, 'utf8'))

const exact = new Map()

function assign(names, classification, evidenceBasis, lg008Action) {
  for (const name of names)
    exact.set(name, { classification, evidence_basis: evidenceBasis, lg008_action: lg008Action })
}

assign(
  ['Project-Vanguard', 'project-sentinel', 'sentinel-endpoint-agent', 'macrodata-refinement', 'quilr-llm-gateway'],
  'LG008_PRIMARY_PRODUCER',
  'Manual: current source, build workflow, existing sensor dossier, and cross-repository reference evidence.',
  'Exhaustively reconcile the selected immutable source revision and every reachable native record, field, event, relationship, artifact, and access path.',
)

assign(
  [
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
  ],
  'LG008_BUILD_RUNTIME_DEPENDENCY',
  'Manual: a selected producer or current ingress/consumer manifest, submodule pointer, or build workflow directly consumes this repository.',
  'Pin the selected revision and include dependency-mediated serialization, authentication, authorization, transport, retry, and storage behavior in the relevant lineage.',
)

assign(
  [
    'browser-extension-service',
    'extension-api-service',
    'extension-log-service',
    'extension-ingestion-service',
    'quilr-ingestion-service',
    'quilr-entities-service',
    'data-explorer-service',
    'quilr-migration-service',
  ],
  'LG008_CURRENT_INGRESS_CONSUMER',
  'Manual: primary sensor URL/topic references plus BFF and production/pre-production ingress routing establish a current source-to-platform path.',
  'Trace native payloads through validation, transformation, transport, persistence, identity mutation, APIs, and failure behavior; do not promote the service to a sensor profile merely because it relays source evidence.',
)

assign(
  ['ConstantsConfigsSync', 'ExtensionConstantsConfigs', 'extension-configs'],
  'LG008_SENSOR_CONFIGURATION',
  'Manual: the Browser build and runtime load these extension constants, environment, tenant, and managed-browser configuration artifacts.',
  'Inventory source-controlled effective configuration shapes and map every capability-affecting key to its producer behavior; secrets and live values remain excluded.',
)

assign(
  [
    'quilr-bff',
    'nginx-ingress-controller',
    'quilr-helm-charts',
    'quilr-helm-charts-axis-bank',
    'quilr-cloud-infra',
    'quilr-data-plane',
    'QuilrConfig',
    'quilr-configloader-service',
  ],
  'LG008_DEPLOYMENT_REACHABILITY_EVIDENCE',
  'Manual: service routing, deployment, data-plane, or configuration repository referenced by current sensor/platform paths.',
  'Use only to prove source-controlled reachability, ports, routes, stores, and configuration contracts; do not infer a live deployment from source alone.',
)

assign(
  [
    'quilr-query-builder',
    'quilr-web',
    'quilr-ai-config-manager',
    'project-starliner',
    'quilr-platform-analytics-backend',
    'quilr-discover',
  ],
  'LG008_PLATFORM_OR_TARGET_CONTEXT',
  'Manual: existing Quilr 1/Better Console lineage or current Starliner implementation fit-gap authority.',
  'Use for verified compatibility, UI/access, legacy consumer, or implementation fit-gap evidence; never use as native sensor truth or frozen target authority.',
)

assign(
  [
    'sentinel-application-discovery',
    'sentinel-system-monitor',
    'sentinel-context-engine',
    'proxy-core',
    'lib-activity-modules',
    'endpoint-config-manager',
    'vigil-graph',
    'Agentic-Ai-Entity-DB',
    'agentic_ecosystem_discovery',
    'project-half-sentinel',
    'sentinel-dashboard',
    'sentinel-proxy-dashboard',
    'quilr-graph-service',
    'ea-discovery-scripts',
    'QuilrEndpoint-msi-builder',
    'QuilrEndpoint-pkg-builder',
    'quilr-custom-mcp-servers',
    'aisecurity-mcp-connectors',
    'aisecurity-mcp-server',
    'mcp_intel',
    'quilr-canary',
    'quilrai-endpoint-agent-doc',
  ],
  'LG008_RELATED_CANDIDATE_NOT_PROVEN_REACHABLE',
  'Manual: sensor-adjacent naming or content exists, but no current primary-producer import/submodule/build or production route proves it is part of the selected sensor artifact.',
  'Compare for omitted capabilities and source overlap. Admit only if an executable dependency or selected release path is proven; otherwise retain as adjacent/experimental evidence.',
)

assign(
  ['netsentinel', 'quilr-homegrown-agent', 'quilrai-pov-test-agent'],
  'POC_DEMO_TEST_CANDIDATE',
  'Manual: repository content and/or metadata identifies an experiment, POV, test agent, or alternate prototype rather than a selected customer sensor artifact.',
  'Use only as comparison or fixture evidence. Do not expand the five-profile product boundary from naming similarity.',
)

assign(
  ['quilr-agent-service', 'quilr-monitoring-agents', 'quilr-vllm-fabric'],
  'ACTIVE_ORG_REPOSITORY_OUTSIDE_CURRENT_TRACE',
  'Manual: active agent/monitoring infrastructure exists, but no selected sensor build, import, route, or deployment edge makes it part of the bounded five-profile capture path.',
  'No LG-008 action unless a selected producer or current ingress path introduces a verified executable edge.',
)

function infer(row) {
  if (exact.has(row.name))
    return exact.get(row.name)

  if (row.archived || /^DEPRECATED[-_]/i.test(row.name)) {
    return {
      classification: 'ARCHIVED_OR_DEPRECATED',
      evidence_basis: 'GitHub archived flag or explicit DEPRECATED repository name.',
      lg008_action: 'Exclude from current sensor closure unless a selected current artifact references the exact repository revision.',
    }
  }

  if (
    row.classification === 'POC_DEMO_TEST_CANDIDATE'
    || /(?:^|[-_])(poc|demo|sample|sandbox|workshop|testdata|mock)(?:$|[-_])/i.test(row.name)
  ) {
    return {
      classification: 'POC_DEMO_TEST_CANDIDATE',
      evidence_basis: 'Repository metadata/name indicates proof-of-concept, demo, mock, sample, workshop, or test scope.',
      lg008_action: 'Use only as fixtures or test evidence after verifying it matches a selected production contract.',
    }
  }

  if (/(?:sensor|sentinel|endpoint|browser|extension|gateway|mcp|llm|agent|discovery|entity|graph)/i.test(row.name)) {
    return {
      classification: 'ACTIVE_SENSOR_ADJACENT_UNTRACED',
      evidence_basis: 'Machine triage: active repository name is sensor/domain-adjacent; no manual production edge has yet been recorded.',
      lg008_action: 'Search for executable references and compare capabilities before final LG-008 saturation.',
    }
  }

  return {
    classification: 'ACTIVE_ORG_REPOSITORY_OUTSIDE_CURRENT_TRACE',
    evidence_basis: 'Machine triage: active organization repository with no current sensor dependency or domain-name match.',
    lg008_action: 'No LG-008 action unless dependency closure, code search, deployment manifests, or source comparison introduces a verified edge.',
  }
}

const classified = rows.map((row) => ({
  repository: row.name,
  repository_url: row.html_url,
  archived: row.archived,
  default_branch: row.default_branch,
  pushed_at: row.pushed_at,
  language: row.language,
  description: row.description,
  ...infer(row),
}))

const columns = [
  'repository',
  'repository_url',
  'archived',
  'default_branch',
  'pushed_at',
  'language',
  'classification',
  'evidence_basis',
  'lg008_action',
  'description',
]

function csvValue(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

const csv = [
  columns.join(','),
  ...classified.map(row => columns.map(column => csvValue(row[column])).join(',')),
].join('\n') + '\n'

const counts = {}
for (const row of classified)
  counts[row.classification] = (counts[row.classification] ?? 0) + 1

const canonical = JSON.stringify(classified)
const summary = {
  schema: 'quilr.github.repository_relevance.v1',
  source: 'evidence/github/quilrbusiness-repositories.json',
  total_repositories: classified.length,
  classifications: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))),
  classified_rows_sha256: createHash('sha256').update(canonical).digest('hex'),
  warning: 'Machine-triaged rows are discovery aids, not proof of production reachability. Manual rows state their evidence basis.',
}

writeFileSync(join(root, 'registers/github-repository-relevance.csv'), csv)
writeFileSync(
  join(root, 'evidence/github/quilrbusiness-repository-relevance-summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
)

console.log(JSON.stringify(summary, null, 2))

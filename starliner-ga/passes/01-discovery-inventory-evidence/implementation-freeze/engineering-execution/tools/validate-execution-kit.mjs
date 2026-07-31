#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

function fail(message) {
  errors.push(message)
}

function load(path) {
  const full = join(root, path)
  if (!existsSync(full)) {
    fail(`missing execution-kit artifact: ${path}`)
    return ''
  }
  return readFileSync(full, 'utf8')
}

function requireFragments(path, fragments) {
  const text = load(path)
  for (const fragment of fragments) {
    if (!text.includes(fragment))
      fail(`${path} omits required fragment: ${fragment}`)
  }
  return text
}

function parseCsv(text, path) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      }
      else if (character === '"') {
        quoted = false
      }
      else {
        field += character
      }
    }
    else if (character === '"') {
      quoted = true
    }
    else if (character === ',') {
      row.push(field)
      field = ''
    }
    else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value !== ''))
        rows.push(row)
      row = []
      field = ''
    }
    else {
      field += character
    }
  }
  if (quoted)
    fail(`${path} has an unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length)
    fail(`${path} is empty`)
  const width = rows[0]?.length || 0
  rows.forEach((candidate, index) => {
    if (candidate.length !== width)
      fail(`${path}:${index + 1} has ${candidate.length} columns; expected ${width}`)
  })
  return rows
}

requireFragments('README.md', [
  'Start or resume',
  'Work-item lifecycle',
  'One branch represents one coherent work item',
  'remote Ubuntu',
])
requireFragments('templates/AGENTS.md', [
  'Resume protocol',
  'test-driven-development skill',
  'One branch is one work item',
  'remote validation agent fetches an exact pushed SHA',
  'Raise a focused ADR',
  'native Vue SFCs',
  'clone existing Button/Dialog/Table',
])
requireFragments('templates/WORK_STATE.md', [
  'Architecture authority commit',
  'Last locally verified commit',
  'Last remotely verified commit',
  'Next exact action',
])
requireFragments('templates/TOPOLOGY.md', [
  'Runtime roles and artifacts',
  'Persistence and transport',
  'External repository seams',
])
requireFragments('BRANCH_HYGIENE_AND_CHANGE_CONTROL.md', [
  'One branch may contain many commits',
  'One writer per branch',
  'SUPERSEDE',
  'zero commits ahead',
])
requireFragments('TWO_AGENT_DEVELOPMENT_AND_REMOTE_VALIDATION.md', [
  'clean detached checkout at exact SHA',
  'It does not patch the remote checkout',
  'Candidate N+1 cannot inherit N',
])
requireFragments('SOURCE_CONTEXT_AND_REPOSITORY_MAP.md', [
  'All 377 organization repositories classified',
  'quilrbusiness/project-starliner',
  'quilrbusiness/macrodata-refinement',
  'quilrbusiness/quilr-llm-gateway',
  'do not copy a shallow analysis',
])
requireFragments('BRANCH_AND_PR_BASELINE.md', [
  '117 dirty paths',
  'PR 227',
  'PR 148',
  'PR 10',
  'No GitHub refs were modified',
])
requireFragments('CODING_AGENT_START_PROMPT.md', [
  'complete bounded',
  'Work only from fresh/current Git checkouts',
  'complete selected-source system end to end',
  'First action: establish an executable program',
  'Do not return merely with another plan',
  'UI implementation law',
  '/Users/t4ctic4l/STAR-PLATFORM/quilr-platform-nuxt',
])
requireFragments('cursor/rules/00-die-authority.mdc', [
  'alwaysApply: true',
  'Read `AGENTS.md`',
])
requireFragments('cursor/rules/10-die-development-loop.mdc', [
  'alwaysApply: true',
  'One branch represents one stable work item',
])
requireFragments('cursor/rules/20-nuxt-shadcn-ui.mdc', [
  'alwaysApply: false',
  'native Nuxt/Vue SFCs',
  'second generic',
  'generated `/die/v1` client',
])
requireFragments('cursor/skills/test-driven-development/SKILL.md', [
  'name: test-driven-development',
  'Add or select a test that fails',
])
requireFragments('cursor/skills/remote-sha-validation/SKILL.md', [
  'name: remote-sha-validation',
  'detach at the exact SHA',
])

const ledgerHeaders = new Map([
  ['templates/CHANGE_LEDGER.csv.template', 'change_id,work_item_id,repository,branch,commit_sha,pr_url,local_verification,remote_validation_id,status,created_at,notes'],
  ['templates/REMOTE_VALIDATION_LEDGER.csv.template', 'validation_id,work_item_id,repository,commit_sha,artifact_digest,configuration_digest,environment,deploy_id,started_at,finished_at,result,commands_ref,evidence_ref,validator,notes'],
  ['templates/BRANCH_PR_REGISTER.csv.template', 'repository,branch,base,work_item_id,owner,state,pr_url,head_sha,ahead,behind,last_activity,disposition,delete_after,notes'],
  ['templates/WORK_ITEMS.csv.template', 'work_item_id,parent_id,title,repository,component,status,priority,depends_on,acceptance_ref,owner,branch,pr_url,last_verified_sha,notes'],
])
for (const [path, header] of ledgerHeaders) {
  const text = load(path).trim()
  if (text !== header)
    fail(`${path} header does not match the frozen execution ledger contract`)
}

const jiraPath = 'jira/die-work-program-import.csv'
const jiraRows = parseCsv(load(jiraPath), jiraPath)
const jiraHeader = jiraRows[0] || []
const expectedJiraHeader = [
  'External ID',
  'Issue Type',
  'Summary',
  'Description',
  'Priority',
  'Labels',
  'Component',
  'Parent External ID',
  'Depends On',
  'Acceptance Criteria',
]
if (JSON.stringify(jiraHeader) !== JSON.stringify(expectedJiraHeader))
  fail('Jira import header changed')
const jiraIds = new Set()
for (const row of jiraRows.slice(1)) {
  const id = row[0]
  if (!id)
    fail('Jira import contains a row without External ID')
  if (jiraIds.has(id))
    fail(`duplicate Jira External ID: ${id}`)
  jiraIds.add(id)
  if (!row[9])
    fail(`Jira item ${id} has no acceptance criteria`)
}
for (let index = 0; index <= 11; index += 1) {
  const id = `DIE-WP${String(index).padStart(2, '0')}`
  if (!jiraIds.has(id))
    fail(`Jira import omits ${id}`)
}

const branchPath = 'registers/branch-pr-baseline.csv'
const branchRows = parseCsv(load(branchPath), branchPath)
const branchHeader = branchRows[0] || []
if (branchHeader[0] !== 'repository' || branchHeader[1] !== 'branch'
  || branchHeader[8] !== 'disposition') {
  fail('branch/PR baseline header changed')
}
const branchKeys = new Set()
for (const row of branchRows.slice(1)) {
  const key = `${row[0]}:${row[1]}`
  if (branchKeys.has(key))
    fail(`duplicate branch/PR baseline row: ${key}`)
  branchKeys.add(key)
  if (!row[8] || row[8] === 'UNKNOWN')
    fail(`branch/PR baseline lacks a disposition: ${key}`)
}
for (const requiredBranch of [
  'quilrbusiness/project-starliner:feat/starliner-runtime-trust-and-reality-gates',
  'quilrbusiness/macrodata-refinement:feat/starliner-llm-observe-runtime',
  'quilrbusiness/quilr-llm-gateway:feat/starliner-mcp-observe-runtime',
]) {
  if (!branchKeys.has(requiredBranch))
    fail(`branch/PR baseline omits ${requiredBranch}`)
}

if (errors.length) {
  console.error('DIE engineering execution kit validation FAILED')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log(
  `DIE engineering execution kit validation passed: `
  + `${jiraIds.size} Jira items; ${ledgerHeaders.size} ledger contracts; `
  + `${branchKeys.size} branch/PR dispositions; 3 Cursor rules; 2 Cursor skills.`,
)

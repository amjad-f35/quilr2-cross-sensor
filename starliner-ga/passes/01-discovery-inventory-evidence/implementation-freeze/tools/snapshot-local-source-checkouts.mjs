#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const workspace = join(root, '../../../../../..')
const checkoutRoot = join(workspace, 'Org-Recon-2026-07-30')

function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' }).trim()
}

function countTrackedFiles(dir) {
  const output = git(dir, ['ls-files'])
  return output ? output.split('\n').length : 0
}

const rows = []
for (const name of readdirSync(checkoutRoot).sort()) {
  const dir = join(checkoutRoot, name)
  if (!statSync(dir).isDirectory())
    continue
  try {
    const commit = git(dir, ['rev-parse', 'HEAD'])
    rows.push({
      repository: name,
      checkout_path: relative(workspace, dir),
      commit,
      branch: git(dir, ['branch', '--show-current']),
      origin: git(dir, ['remote', 'get-url', 'origin']),
      tracked_files: countTrackedFiles(dir),
      shallow: git(dir, ['rev-parse', '--is-shallow-repository']) === 'true',
    })
  }
  catch {
    rows.push({
      repository: name,
      checkout_path: relative(workspace, dir),
      commit: null,
      branch: null,
      origin: null,
      tracked_files: 0,
      shallow: null,
      note: 'Repository checkout has no resolvable HEAD (for example, an empty repository).',
    })
  }
}

const canonical = JSON.stringify(rows)
const output = {
  schema: 'quilr.local_source_checkout_manifest.v1',
  checkout_root: relative(workspace, checkoutRoot),
  repositories: rows.length,
  rows_sha256: createHash('sha256').update(canonical).digest('hex'),
  rows,
}

writeFileSync(
  join(root, 'evidence/github/local-source-checkouts.json'),
  JSON.stringify(output, null, 2) + '\n',
)
console.log(JSON.stringify({
  repositories: output.repositories,
  rows_sha256: output.rows_sha256,
}, null, 2))

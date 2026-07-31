#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { isUtf8 } from 'node:buffer'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDir = dirname(fileURLToPath(import.meta.url))
const freezeRoot = resolve(toolDir, '..')
const contextRoot = join(freezeRoot, 'cloud-context')
const payloadRoot = join(contextRoot, 'payload')
const selection = JSON.parse(readFileSync(join(contextRoot, 'selection.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(join(contextRoot, 'manifest.json'), 'utf8'))
const errors = []

function fail(message) {
  errors.push(message)
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const path = join(directory, entry.name)
      if (entry.isSymbolicLink()) {
        fail(`symbolic link is prohibited: ${relative(contextRoot, path)}`)
        return []
      }
      return entry.isDirectory() ? walk(path) : [path]
    })
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

if (manifest.schema_version !== 'die-cloud-context-manifest/1.0.0')
  fail(`unknown manifest schema: ${manifest.schema_version}`)
if (manifest.authority !== 'NON_NORMATIVE_SOURCE_EVIDENCE')
  fail('cloud context must remain non-normative source evidence')

const allowedExtensions = new Set(selection.allowed_extensions)
const forbiddenSegments = new Set([
  '.git', '.venv', 'archives', 'build', 'coverage', 'dist', 'node_modules',
  'production-build', 'source-snapshot', 'work',
])
const actualFiles = existsSync(payloadRoot)
  ? walk(payloadRoot).map(path => relative(contextRoot, path).split(sep).join('/')).sort()
  : []
const listedFiles = manifest.files.map(file => file.bundle_path).sort()
if (JSON.stringify(actualFiles) !== JSON.stringify(listedFiles))
  fail('manifest file list does not exactly match payload files')

const ids = new Set()
const bundlePaths = new Set()
let totalBytes = 0
for (const file of manifest.files) {
  if (!/^CTX-[0-9a-f]{16}$/.test(file.context_id))
    fail(`invalid stable context ID: ${file.context_id}`)
  if (ids.has(file.context_id))
    fail(`duplicate context ID: ${file.context_id}`)
  ids.add(file.context_id)
  if (bundlePaths.has(file.bundle_path))
    fail(`duplicate bundle path: ${file.bundle_path}`)
  bundlePaths.add(file.bundle_path)
  if (file.authority !== 'SOURCE_EVIDENCE')
    fail(`${file.bundle_path} has invalid authority ${file.authority}`)
  if (file.source_path.startsWith('/') || file.bundle_path.startsWith('/'))
    fail(`${file.bundle_path} contains an absolute manifest path`)
  if (file.bundle_path.includes('..') || file.source_path.includes('..'))
    fail(`${file.bundle_path} contains parent traversal`)
  if (!allowedExtensions.has(extname(file.bundle_path).toLowerCase()))
    fail(`${file.bundle_path} has a prohibited extension`)
  for (const segment of file.bundle_path.split('/')) {
    if (forbiddenSegments.has(segment))
      fail(`${file.bundle_path} includes prohibited segment ${segment}`)
  }

  const full = join(contextRoot, file.bundle_path)
  if (!existsSync(full) || !statSync(full).isFile()) {
    fail(`manifest file is missing: ${file.bundle_path}`)
    continue
  }
  const buffer = readFileSync(full)
  totalBytes += buffer.byteLength
  if (!isUtf8(buffer))
    fail(`${file.bundle_path} is not valid UTF-8 text`)
  if (buffer.byteLength !== file.bytes)
    fail(`${file.bundle_path} byte size differs from manifest`)
  if (buffer.byteLength > selection.maximum_file_bytes)
    fail(`${file.bundle_path} exceeds the maximum individual file size`)
  if (sha256(buffer) !== file.sha256)
    fail(`${file.bundle_path} digest differs from manifest`)

  const text = buffer.toString('utf8')
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bsk-[A-Za-z0-9]{32,}\b/,
  ]
  if (secretPatterns.some(pattern => pattern.test(text)))
    fail(`${file.bundle_path} contains a secret-like value`)
}

const aggregate = sha256(Buffer.from(
  manifest.files.map(file => `${file.bundle_path}\0${file.sha256}\n`).join(''),
))
if (aggregate !== manifest.payload_sha256)
  fail('aggregate payload digest differs from manifest')
if (totalBytes !== manifest.total_bytes)
  fail(`manifest total_bytes ${manifest.total_bytes} differs from ${totalBytes}`)
if (totalBytes > selection.maximum_bundle_bytes)
  fail(`bundle exceeds ${selection.maximum_bundle_bytes} bytes`)
if (manifest.file_count !== manifest.files.length)
  fail('manifest file_count is incorrect')

const requiredPackages = new Set(selection.source_packages.map(item => item.id))
for (const packageId of requiredPackages) {
  const count = manifest.files.filter(file => file.source_package === packageId).length
  if (count < 2)
    fail(`source package ${packageId} has insufficient context (${count} files)`)
  if (manifest.source_package_counts?.[packageId] !== count)
    fail(`source package count differs for ${packageId}`)
}

for (const required of [
  'README.md',
  'SELECTION_POLICY.md',
  'CLOUD_AGENT_BOOTSTRAP.md',
  'selection.json',
  'manifest.json',
]) {
  if (!existsSync(join(contextRoot, required)))
    fail(`cloud context control file is missing: ${required}`)
}

if (errors.length) {
  errors.forEach(error => console.error(`ERROR: ${error}`))
  process.exit(1)
}

console.log(
  `Cloud context validation passed: ${manifest.file_count} files; `
  + `${manifest.total_bytes} bytes; ${requiredPackages.size} source packages; `
  + `payload ${manifest.payload_sha256}`,
)

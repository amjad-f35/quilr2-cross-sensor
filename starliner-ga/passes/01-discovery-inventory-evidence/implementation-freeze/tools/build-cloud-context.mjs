#!/usr/bin/env node

import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDir = dirname(fileURLToPath(import.meta.url))
const freezeRoot = resolve(toolDir, '..')
const repositoryRoot = resolve(freezeRoot, '../../../..')
const consolidateRoot = resolve(
  process.env.CONSOLIDATE_ROOT || resolve(repositoryRoot, '../..'),
)
const contextRoot = join(freezeRoot, 'cloud-context')
const payloadRoot = join(contextRoot, 'payload')
const selection = JSON.parse(
  readFileSync(join(contextRoot, 'selection.json'), 'utf8'),
)

if (!payloadRoot.startsWith(`${contextRoot}${sep}`))
  throw new Error(`unsafe payload path: ${payloadRoot}`)

const allowedExtensions = new Set(selection.allowed_extensions)
const manifestFiles = []
const bundlePaths = new Set()

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function walk(directory, maximumDepth = Number.POSITIVE_INFINITY, currentDepth = 0) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap(entry => {
      const path = join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`symbolic links are not admitted: ${path}`)
      if (entry.isDirectory())
        return currentDepth < maximumDepth
          ? walk(path, maximumDepth, currentDepth + 1)
          : []
      return [path]
    })
}

function selectedFiles(source, item) {
  if (!existsSync(source))
    throw new Error(`selected source is missing: ${relative(consolidateRoot, source)}`)
  if (statSync(source).isFile())
    return [{ source, relativePath: '' }]

  const excluded = new Set(item.exclude_files || [])
  return walk(source, item.maximum_depth)
    .map(path => ({ source: path, relativePath: relative(source, path) }))
    .filter(({ relativePath }) => {
      if (excluded.has(relativePath) || excluded.has(relativePath.split(sep).at(-1)))
        return false
      return allowedExtensions.has(extname(relativePath).toLowerCase())
    })
}

rmSync(payloadRoot, { recursive: true, force: true })
mkdirSync(payloadRoot, { recursive: true })

for (const sourcePackage of selection.source_packages) {
  for (const item of sourcePackage.selections) {
    const source = resolve(consolidateRoot, sourcePackage.source_root, item.path)
    for (const selected of selectedFiles(source, item)) {
      const destinationRelative = selected.relativePath
        ? join(item.destination, selected.relativePath)
        : item.destination
      const bundlePath = join('payload', sourcePackage.id, destinationRelative)
        .split(sep).join('/')
      if (bundlePaths.has(bundlePath))
        throw new Error(`duplicate bundle path: ${bundlePath}`)
      bundlePaths.add(bundlePath)

      const buffer = readFileSync(selected.source)
      if (buffer.byteLength > selection.maximum_file_bytes)
        throw new Error(`selected file exceeds maximum size: ${relative(consolidateRoot, selected.source)}`)
      const extension = extname(selected.source).toLowerCase()
      if (!allowedExtensions.has(extension))
        throw new Error(`selected file type is not admitted: ${selected.source}`)

      const destination = join(contextRoot, bundlePath)
      mkdirSync(dirname(destination), { recursive: true })
      copyFileSync(selected.source, destination)

      const sourcePath = relative(consolidateRoot, selected.source).split(sep).join('/')
      manifestFiles.push({
        context_id: `CTX-${sha256Buffer(Buffer.from(sourcePath)).slice(0, 16)}`,
        source_package: sourcePackage.id,
        evidence_role: sourcePackage.evidence_role,
        source_path: sourcePath,
        bundle_path: bundlePath,
        sha256: sha256Buffer(buffer),
        bytes: buffer.byteLength,
        authority: 'SOURCE_EVIDENCE',
      })
    }
  }
}

manifestFiles.sort((left, right) => left.bundle_path.localeCompare(right.bundle_path))
const totalBytes = manifestFiles.reduce((sum, file) => sum + file.bytes, 0)
if (totalBytes > selection.maximum_bundle_bytes)
  throw new Error(`bundle is ${totalBytes} bytes; maximum is ${selection.maximum_bundle_bytes}`)

const aggregate = sha256Buffer(Buffer.from(
  manifestFiles.map(file => `${file.bundle_path}\0${file.sha256}\n`).join(''),
))
const counts = Object.fromEntries(selection.source_packages.map(sourcePackage => [
  sourcePackage.id,
  manifestFiles.filter(file => file.source_package === sourcePackage.id).length,
]))
const manifest = {
  schema_version: 'die-cloud-context-manifest/1.0.0',
  selection_schema_version: selection.schema_version,
  authority: 'NON_NORMATIVE_SOURCE_EVIDENCE',
  payload_sha256: aggregate,
  file_count: manifestFiles.length,
  total_bytes: totalBytes,
  source_package_counts: counts,
  files: manifestFiles,
}
writeFileSync(
  join(contextRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(
  `Cloud context built: ${manifestFiles.length} files; ${totalBytes} bytes; ${aggregate}`,
)

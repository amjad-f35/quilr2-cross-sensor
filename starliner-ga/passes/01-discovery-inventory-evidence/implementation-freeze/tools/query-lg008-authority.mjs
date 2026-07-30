#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const filters = new Map()

for (let index = 0; index < args.length; index += 2) {
  const option = args[index]
  const value = args[index + 1]
  if (!option?.startsWith('--') || value === undefined) {
    console.error('Usage: query-lg008-authority.mjs [--field-id ID] [--profile PROFILE] [--record RECORD] [--field FIELD]')
    process.exit(2)
  }
  filters.set(option.slice(2), value)
}

if (![...filters.keys()].every(key => ['field-id', 'profile', 'record', 'field'].includes(key))) {
  console.error('Unknown option. Supported: --field-id, --profile, --record, --field')
  process.exit(2)
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      }
      else if (char === '"') {
        quoted = false
      }
      else {
        field += char
      }
    }
    else if (char === '"') {
      quoted = true
    }
    else if (char === ',') {
      row.push(field)
      field = ''
    }
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value !== ''))
        rows.push(row)
      row = []
      field = ''
    }
    else {
      field += char
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const header = rows.shift() ?? []
  return rows.map(values =>
    Object.fromEntries(header.map((name, index) => [name, values[index] ?? ''])))
}

const rows = parseCsv(readFileSync(join(root, 'lg008/native-field-disposition.csv'), 'utf8'))
const matches = rows.filter(row =>
  (!filters.has('field-id') || row.global_field_id === filters.get('field-id'))
  && (!filters.has('profile') || row.profile === filters.get('profile'))
  && (!filters.has('record') || row.record_type === filters.get('record'))
  && (!filters.has('field') || row.native_field === filters.get('field')))

if (!matches.length) {
  console.error('No matching LG-008 authority row.')
  process.exit(1)
}

process.stdout.write(`${JSON.stringify(matches, null, 2)}\n`)

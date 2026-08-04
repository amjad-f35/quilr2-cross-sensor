#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { initializeProductDeliveryState } from './product-delivery-state-lib.mjs'

const toolDir = dirname(fileURLToPath(import.meta.url))
const executionRoot = resolve(toolDir, '..')
const authorityIndex = process.argv.indexOf('--authority')
if (authorityIndex === -1 || !process.argv[authorityIndex + 1]) {
  console.error('usage: initialize-product-delivery-state.mjs --authority <40-hex-commit> [capability-map.csv]')
  process.exit(2)
}
const mapPath = resolve(process.argv[authorityIndex + 2]
  || resolve(executionRoot, 'registers/product-capability-map.csv'))
try {
  process.stdout.write(initializeProductDeliveryState(
    readFileSync(mapPath, 'utf8'),
    process.argv[authorityIndex + 1],
  ))
}
catch (error) {
  console.error(`cannot initialize PRODUCT_DELIVERY_STATE.csv: ${error.message}`)
  process.exit(1)
}

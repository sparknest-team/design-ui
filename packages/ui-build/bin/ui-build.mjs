#!/usr/bin/env node

import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildLibrary } from '../src/index.mjs'

const command = process.argv[2]
if (command !== 'compile') {
  console.error('Usage: ui-build compile [config]')
  process.exit(1)
}

const configPath = resolve(process.cwd(), process.argv[3] ?? 'ui-build.config.mjs')
const config = (await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)).default
await buildLibrary(config)

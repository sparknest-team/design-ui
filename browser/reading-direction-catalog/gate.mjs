import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
// Raw full-run failures remain in coverage.json. Acceptance records exact-version
// targeted retries separately; input drift or persistent failures still fail.
const run = name => spawnSync(process.execPath, [fileURLToPath(new URL(name, import.meta.url))], { stdio: 'inherit', env: process.env })
const full = run('./check.mjs')
if (full.error) throw full.error
const accepted = run('./retry.mjs')
if (accepted.error) throw accepted.error
process.exitCode = accepted.status ?? 1

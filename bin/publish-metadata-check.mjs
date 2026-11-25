import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

function normalizeRepo(value) {
  let repo = value.trim().replace(/^git\+/i, '')
  if (/^https?:\/\/github\.com\//i.test(repo)) {
    repo = new URL(repo).pathname.slice(1)
  } else {
    repo = repo.replace(/^(?:git@github\.com:|ssh:\/\/git@github\.com\/)/i, '')
  }
  return repo
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '')
    .toLowerCase()
}

export function evaluateManifests({ entries, expectedRepo }) {
  const normalizedExpected = normalizeRepo(expectedRepo)
  const problems = []
  let checked = 0
  let skipped = 0

  for (const { dir, manifest } of entries) {
    if (manifest.private === true) {
      skipped++
      continue
    }

    checked++
    const { name, repository } = manifest
    if (repository === undefined) {
      problems.push({ dir, name, message: 'missing repository field' })
      continue
    }

    const url = typeof repository === 'string' ? repository : repository?.url
    if (typeof url !== 'string' || !url.trim()) {
      problems.push({ dir, name, message: 'empty repository.url' })
    } else if (normalizeRepo(url) !== normalizedExpected) {
      problems.push({ dir, name, message: `repository.url "${url}" does not match ${expectedRepo}` })
    }

    const directory = repository?.directory
    if (directory !== dir) {
      problems.push({ dir, name, message: `repository.directory "${directory}" should be "${dir}"` })
    }
  }

  return { problems, checked, skipped }
}

function readManifests() {
  const entries = []
  for (const child of readdirSync('packages', { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!child.isDirectory()) {
      continue
    }

    const dir = posix.join('packages', child.name)
    const manifestPath = posix.join(dir, 'package.json')
    try {
      entries.push({ dir, manifest: JSON.parse(readFileSync(manifestPath, 'utf8')) })
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue
      }
      throw new Error(`${manifestPath}: ${error.message}`, { cause: error })
    }
  }
  return entries
}

function main() {
  const { values } = parseArgs({ options: { repo: { type: 'string' } } })
  let expectedRepo = values.repo
  if (expectedRepo === undefined) {
    try {
      expectedRepo = execFileSync('git', ['remote', 'get-url', 'origin'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch {
      throw new Error('Cannot determine the repository from Git remote origin. Pass --repo <owner/repo>.')
    }
  }
  expectedRepo = expectedRepo.trim()
  if (!/^[\w.-]+\/[\w.-]+$/.test(normalizeRepo(expectedRepo))) {
    throw new Error('Cannot determine a valid GitHub repository. Pass --repo <owner/repo>.')
  }

  const entries = readManifests()
  const { problems, checked } = evaluateManifests({ entries, expectedRepo })
  for (const { dir, manifest } of entries) {
    if (manifest.private === true) {
      continue
    }

    const messages = problems.filter((problem) => problem.dir === dir).map((problem) => problem.message)
    if (messages.length) {
      console.log(`  FAIL ${manifest.name} ${dir}: ${messages.join(' | ')}`)
    } else {
      console.log(`  OK   ${manifest.name} ${dir}`)
    }
  }

  console.log(`Publish metadata: ${checked} packages checked, ${problems.length} problem(s)`)
  return problems.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main()
  } catch (error) {
    console.error(`Publish metadata: ${error.message}`)
    process.exitCode = 1
  }
}

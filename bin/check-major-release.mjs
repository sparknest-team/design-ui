import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function checkMajorRelease(releases, approvedCommit, currentCommit) {
  const majors = releases.filter(
    ({ oldVersion, newVersion }) => Number(newVersion.split('.')[0]) > Number(oldVersion.split('.')[0]),
  )
  if (!majors.length) return

  const packages = majors.map(({ name, oldVersion, newVersion }) => `${name} ${oldVersion} → ${newVersion}`).join(', ')
  if (!approvedCommit || approvedCommit !== currentCommit) {
    throw new Error(
      `Major release requires confirmation for ${currentCommit}: ${packages}. Run the Release workflow on main with "Confirm major release" selected.`,
    )
  }
  console.log(`Confirmed major release for ${currentCommit}: ${packages}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Use the calling workspace's Changesets version and dependency graph.
  const require = createRequire(resolve('package.json'))
  const directory = mkdtempSync(join(tmpdir(), 'changesets-plan-'))
  try {
    const plan = join(directory, 'plan.json')
    execFileSync(process.execPath, [require.resolve('@changesets/cli/bin.js'), 'status', '--output', plan], {
      stdio: 'inherit',
    })
    const { releases } = JSON.parse(readFileSync(plan, 'utf8'))
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    checkMajorRelease(releases, process.env.CONFIRMED_MAJOR_COMMIT, commit)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

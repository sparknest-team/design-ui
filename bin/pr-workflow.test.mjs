import assert from 'node:assert/strict'
import test from 'node:test'
import { checkMajorRelease } from './check-major-release.mjs'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
const workspace = fileURLToPath(new URL('../../', import.meta.url))
const repos = ['cedar-design-web', 'maple-design-mobile', 'design-ui']
const require = createRequire(import.meta.url)
const yaml = createRequire(join(workspace, 'cedar-design-web/package.json'))('yaml')

for (const repo of repos) {
  const root = join(workspace, repo)
  const hook = await import(pathToFileURL(join(root, 'scripts/git-hooks.mjs')))
  const helper = await import(pathToFileURL(join(root, 'scripts/pr-merge.mjs')))
  const refs = require(join(root, 'scripts/resolve-ci-refs.cjs'))
  test(`${repo}: light hooks inspect staged JSON without touching unstaged edits or invoking dependencies`, () => {
    const fixture = mkdtempSync(join(tmpdir(), 'light-hooks-'))
    const git = args => execFileSync('git', args, { cwd: fixture, stdio: 'pipe' })
    try {
      git(['init', '-q'])
      writeFileSync(join(fixture, 'example.json'), '{"valid":true}\n')
      git(['add', 'example.json'])
      writeFileSync(join(fixture, 'example.json'), '{ unfinished work')
      let result = spawnSync(process.execPath, [join(root, 'scripts/git-hooks.mjs'), 'pre-commit'], { cwd: fixture, encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr)
      assert.equal(readFileSync(join(fixture, 'example.json'), 'utf8'), '{ unfinished work')
      git(['add', 'example.json'])
      result = spawnSync(process.execPath, [join(root, 'scripts/git-hooks.mjs'), 'pre-commit'], { cwd: fixture, encoding: 'utf8' })
      assert.notEqual(result.status, 0)
      assert.match(result.stderr, /Invalid staged JSON/)
      const source = readFileSync(join(root, 'scripts/git-hooks.mjs'), 'utf8')
      assert.doesNotMatch(source, /execFileSync\('(?:pnpm|npm|eslint|prettier)'/)
      hook.checkMessage('fix(input): correct focus\n\nDetails')
      assert.throws(() => hook.checkMessage('unstructured subject'))
    } finally { rmSync(fixture, { recursive: true, force: true }) }
  })
  test(`${repo}: main push guard rejects direct pushes but accepts a feature branch`, () => {
    const script = join(root, '.githooks/pre-push')
    const run = ref => spawnSync('sh', [script], { input: `refs/heads/local abc ${ref} def\n`, encoding: 'utf8' })
    assert.notEqual(run('refs/heads/main').status, 0)
    assert.equal(run('refs/heads/feat/test').status, 0)
  })
  test(`${repo}: related PR parser refuses unknown repositories and duplicate sibling refs`, () => {
    const sibling = repos.find(value => value !== repo)
    const line = `Related-PR: https://github.com/loca-spirit/${sibling}/pull/42`
    assert.deepEqual(refs.related(line, repo), [{ repo: sibling, number: 42 }])
    assert.throws(() => refs.related(line + '\n' + line, repo))
    assert.throws(() => refs.related('Related-PR: https://github.com/attacker/untrusted/pull/2', repo))
    assert.throws(() => refs.related(`Related-PR: https://github.com/loca-spirit/${repo}/pull/1`, repo))
  })
  test(`${repo}: resolver records exact sibling and tested commits and explains token permission failures`, async () => {
    const temporary = mkdtempSync(join(tmpdir(), 'ci-related-'))
    const saved = { PR_NUMBER: process.env.PR_NUMBER, RUNNER_TEMP: process.env.RUNNER_TEMP, GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE, CI_LINKS: process.env.CI_LINKS }
    const sibling = repos.find(value => value !== repo), sha = 'c'.repeat(40), outputs = {}
    let changed = false
    const github = { rest: { pulls: { get: async args => ({ data: args.repo === repo
      ? { base: { ref: 'main' }, head: { ref: 'feature' }, body: `Related-PR: https://github.com/loca-spirit/${sibling}/pull/42` }
      : { state: 'open', head: { sha: changed ? 'd'.repeat(40) : sha } } }) } } }
    try {
      process.env.PR_NUMBER = '1'
      process.env.RUNNER_TEMP = temporary
      process.env.GITHUB_WORKSPACE = workspace
      await refs.resolve({ github, context: { repo: { owner: 'loca-spirit', repo }, payload: {} }, core: { setOutput: (key, value) => { outputs[key] = value }, info() {} } })
      assert.equal(outputs.refs[sibling], sha)
      const snapshot = JSON.parse(readFileSync(join(temporary, 'linked-prs.json'), 'utf8'))
      assert.match(snapshot.testedSha, /^[a-f0-9]{40}$/)
      assert.deepEqual(snapshot.links, [{ repo: sibling, number: 42, sha }])
      process.env.CI_LINKS = JSON.stringify(snapshot.links)
      await refs.validate({ github })
      changed = true
      await assert.rejects(refs.validate({ github }), /changed during CI/)
      await assert.rejects(refs.resolve({ github: { rest: { pulls: { get: async () => { throw Object.assign(new Error('forbidden'), { status: 403 }) } } } }, context: { repo: { owner: 'loca-spirit', repo }, payload: {} }, core: {} }), /grant Contents: Read-only and Pull requests: Read-only/)
    } finally {
      for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value }
      rmSync(temporary, { recursive: true, force: true })
    }
  })
  test(`${repo}: merges fail closed on missing, skipped, pending, failed or stale quality`, () => {
    for (const checks of [[], [{ id: 1, name: 'quality', status: 'completed', conclusion: 'skipped', app: { slug: 'github-actions' } }], [{ id: 1, name: 'quality', status: 'in_progress', app: { slug: 'github-actions' } }]]) assert.throws(() => helper.requirePassingQuality(checks))
    const pass = { id: 1, name: 'quality', status: 'completed', conclusion: 'success', app: { slug: 'github-actions' } }
    assert.equal(helper.requirePassingQuality([pass]), pass)
    assert.throws(() => helper.requirePassingQuality([pass, { ...pass, id: 2, conclusion: 'failure' }]))
    helper.verifyLinked({ repo: 'design-ui', number: 1, sha: 'old' }, { state: 'open', head: { sha: 'old' } })
    assert.throws(() => helper.verifyLinked({ repo: 'design-ui', number: 1, sha: 'old' }, { state: 'open', head: { sha: 'new' } }))
    assert.throws(() => helper.verifyLinked({ sha: 'old' }, { state: 'closed', merged: false, head: { sha: 'old' } }))
  })
  test(`${repo}: checked merge reaches GitHub only with the current tested merge SHA and unchanged siblings`, () => {
    const head = 'a'.repeat(40), tested = 'b'.repeat(40), sibling = 'c'.repeat(40)
    const calls = []
    const fake = args => {
      calls.push(args)
      if (args[0] === 'repo') return JSON.stringify({ nameWithOwner: 'loca-spirit/' + repo })
      if (args[0] === 'run') {
        const directory = args[args.indexOf('--dir') + 1]
        mkdirSync(directory, { recursive: true })
        writeFileSync(join(directory, 'linked-prs.json'), JSON.stringify({ testedSha: tested, links: [{ repo: 'maple-design-mobile', number: 2, sha: sibling }] }))
        return ''
      }
      const route = args[1]
      if (route.endsWith('/pulls/1/merge')) return JSON.stringify({ merged: true })
      if (route.endsWith('/pulls/1')) return JSON.stringify({ state: 'open', draft: false, base: { ref: 'main' }, head: { sha: head }, merge_commit_sha: tested })
      if (route.endsWith('/pulls/2')) return JSON.stringify({ state: 'open', head: { sha: sibling } })
      if (route.includes('/check-runs?')) return JSON.stringify({ check_runs: [{ id: 1, name: 'quality', status: 'completed', conclusion: 'success', app: { slug: 'github-actions' }, details_url: 'https://github.com/loca-spirit/' + repo + '/actions/runs/42/job/5' }] })
      if (route.includes('/artifacts?')) return JSON.stringify({ artifacts: [{ name: 'ci-linked-prs-fixture', expired: false }] })
      if (route.endsWith('/actions/runs/42')) return JSON.stringify({ path: '.github/workflows/quality.yml@main', conclusion: 'success' })
      throw new Error('Unexpected API route ' + route)
    }
    helper.merge('1', fake)
    const merge = calls.find(args => args[0] === 'api' && args[1].endsWith('/pulls/1/merge'))
    assert.ok(merge.includes('merge_method=squash'))
    assert.ok(merge.includes('sha=' + head))
    calls.length = 0
    assert.throws(() => helper.merge('1', args => {
      if (args[0] === 'api' && args[1].endsWith('/pulls/2')) return JSON.stringify({ state: 'open', head: { sha: 'new' } })
      return fake(args)
    }), /changed after CI/)
    assert.equal(calls.some(args => args[0] === 'api' && args[1].endsWith('/pulls/1/merge')), false)
  })
  test(`${repo}: PR CI retains full quality, validates bot PRs and emits merge snapshots`, () => {
    const source = readFileSync(join(root, '.github/workflows/quality.yml'), 'utf8')
    const flow = yaml.parse(source)
    assert.ok(flow.on.pull_request)
    assert.ok(flow.on.workflow_dispatch.inputs.pull_request_number)
    assert.equal(flow.permissions.contents, 'read')
    assert.ok(source.includes('ci-linked-prs-'))
    assert.ok(source.includes('changeset status --since=origin/main'))
    const jobs = Object.values(flow.jobs)
    assert.ok(jobs.some(job => job.steps.some(step => step.run === 'pnpm quality')))
    assert.ok(source.includes('Verify linked PRs stayed unchanged'))
    const release = yaml.parse(readFileSync(join(root, '.github/workflows/release.yml'), 'utf8'))
    assert.deepEqual(release.on.push.branches, ['main'])
    const action = release.jobs.version.steps.find(step => step.uses === 'changesets/action@v1')
    assert.ok(action)
    assert.equal(action.with.publish, undefined, 'main push must only prepare a version PR')
    if (repo === 'cedar-design-web' || repo === 'design-ui') {
      const confirm = release.on.workflow_dispatch.inputs.confirm_major
      assert.equal(confirm.type, 'boolean')
      assert.equal(confirm.default, false)
      assert.equal(action.env.CONFIRMED_MAJOR_COMMIT, "${{ github.event_name == 'workflow_dispatch' && inputs.confirm_major && github.sha || '' }}")
      assert.equal(action.with.version, 'pnpm version-packages')
      const command = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts['version-packages']
      assert.match(command, /check-major-release\.mjs && changeset version/)
    }
    assert.ok(JSON.stringify(release).includes('createWorkflowDispatch'))
    const config = JSON.parse(readFileSync(join(root, '.changeset/config.json'), 'utf8'))
    assert.equal(config.changelog[1].repo, 'loca-spirit/' + repo)
  })
}

test('Changesets really consumes a patch description and writes its version and CHANGELOG', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'changesets-release-'))
  try {
    mkdirSync(join(fixture, '.changeset'))
    mkdirSync(join(fixture, 'packages/example'), { recursive: true })
    writeFileSync(join(fixture, 'package.json'), JSON.stringify({ name: 'release-fixture', private: true, workspaces: ['packages/*'] }))
    writeFileSync(join(fixture, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
    writeFileSync(join(fixture, 'packages/example/package.json'), JSON.stringify({ name: '@example/component', version: '1.0.0' }))
    writeFileSync(join(fixture, '.changeset/config.json'), JSON.stringify({ changelog: '@changesets/cli/changelog', commit: false, fixed: [], linked: [], access: 'public', baseBranch: 'main', updateInternalDependencies: 'patch', ignore: [] }))
    execFileSync('git', ['init', '-q'], { cwd: fixture })
    execFileSync('git', ['add', '.'], { cwd: fixture })
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'initial'], { cwd: fixture })
    writeFileSync(join(fixture, '.changeset/focus-fix.md'), '---\n"@example/component": patch\n---\n\nRestore focus after closing.\n')
    execFileSync(process.execPath, [require.resolve('@changesets/cli/bin.js'), 'version'], { cwd: fixture, stdio: 'pipe' })
    assert.equal(JSON.parse(readFileSync(join(fixture, 'packages/example/package.json'), 'utf8')).version, '1.0.1')
    assert.match(readFileSync(join(fixture, 'packages/example/CHANGELOG.md'), 'utf8'), /Restore focus after closing/)
    assert.equal(existsSync(join(fixture, '.changeset/focus-fix.md')), false)
  } finally { rmSync(fixture, { recursive: true, force: true }) }
})

test('only a confirmation for the planned commit permits crossing a major version', () => {
  const routine = [{ name: 'ui', oldVersion: '1.1.10', newVersion: '1.2.0' },
    { name: 'theme', oldVersion: '1.1.10', newVersion: '1.1.11' }]
  checkMajorRelease(routine, undefined, 'current')
  const mixed = [...routine, { name: 'resolver', oldVersion: '1.1.10', newVersion: '2.0.0', changesets: [] }]
  for (const approval of [undefined, '', 'previous']) {
    assert.throws(() => checkMajorRelease(mixed, approval, 'current'), /resolver 1\.1\.10 → 2\.0\.0/)
  }
  checkMajorRelease(mixed, 'current', 'current')
})

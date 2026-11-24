import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateManifests } from './publish-metadata-check.mjs'

const dir = 'packages/ui-build'
const name = '@sparknest/ui-build'
const expectedRepo = 'sparknest-team/design-ui'
const repository = { url: 'git+https://github.com/sparknest-team/design-ui.git', directory: dir }

function evaluate(manifest) {
  return evaluateManifests({ entries: [{ dir, manifest: { name, ...manifest } }], expectedRepo })
}

for (const url of [
  repository.url,
  'https://github.com/sparknest-team/design-ui',
  'git+ssh://git@github.com/sparknest-team/design-ui.git',
  'git@github.com:SparkNest-Team/Design-UI.git/',
]) {
  test(`accepts repository URL ${url}`, () => {
    assert.deepEqual(evaluate({ repository: { ...repository, url } }), {
      problems: [],
      checked: 1,
      skipped: 0,
    })
  })
}

for (const { label, manifest, message } of [
  { label: 'missing repository', manifest: {}, message: 'missing repository field' },
  {
    label: 'empty repository URL',
    manifest: { repository: { ...repository, url: '' } },
    message: 'empty repository.url',
  },
  {
    label: 'missing repository URL',
    manifest: { repository: { directory: dir } },
    message: 'empty repository.url',
  },
  {
    label: 'repository URL for another repository',
    manifest: { repository: { ...repository, url: 'git+https://github.com/sparknest-team/maple-design-mobile.git' } },
    message:
      'repository.url "git+https://github.com/sparknest-team/maple-design-mobile.git" does not match sparknest-team/design-ui',
  },
  {
    label: 'missing repository directory',
    manifest: { repository: { url: repository.url } },
    message: 'repository.directory "undefined" should be "packages/ui-build"',
  },
  {
    label: 'incorrect repository directory',
    manifest: { repository: { ...repository, directory: 'packages/ui-icons' } },
    message: 'repository.directory "packages/ui-icons" should be "packages/ui-build"',
  },
  {
    label: 'string repository without a directory',
    manifest: { repository: repository.url },
    message: 'repository.directory "undefined" should be "packages/ui-build"',
  },
]) {
  test(`reports one problem for ${label}`, () => {
    assert.deepEqual(evaluate(manifest), { problems: [{ dir, name, message }], checked: 1, skipped: 0 })
  })
}

test('skips private packages with no repository metadata', () => {
  assert.deepEqual(evaluate({ private: true }), { problems: [], checked: 0, skipped: 1 })
})

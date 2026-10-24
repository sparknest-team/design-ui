import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const repositories = ['cedar-design-web', 'maple-design-mobile']

for (const repo of repositories) {
  test(`${repo}: clean CI uses sibling repositories and the complete quality entry`, () => {
    const root = resolve(workspace, repo)
    const workflow = readFileSync(resolve(root, '.github/workflows/quality.yml'), 'utf8')
    const { scripts } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    for (const directory of [...repositories, 'design-ui']) {
      assert.match(workflow, new RegExp(`path: ${directory}\\s`), `${directory} must be a sibling checkout`)
    }
    assert.match(workflow, new RegExp(`working-directory: ${repo}\\s`))
    assert.match(workflow, /node-version: 20\s/)
    assert.match(workflow, /version: 9\.6\.0\s/)
    assert.equal((workflow.match(/install --frozen-lockfile/g) ?? []).length, 3)
    assert.match(workflow, /corepack pnpm install --frozen-lockfile\s+working-directory: design-ui/)
    assert.match(workflow, /- run: pnpm quality\s/)
    assert.match(workflow, /shared-source-contract\.test\.mjs/)
    assert.match(workflow, /ci-contract\.test\.mjs/)
    assert.match(workflow, /- run: node \.\.\/design-ui\/bin\/ci-toolchain-check\.mjs/)
    assert.match(workflow, /ci-toolchain-check\.test\.mjs/)
    assert.match(workflow, /ui-build\/test\/environment\.test\.mjs/)
    assert.match(workflow, /- run: node \.\.\/design-ui\/bin\/case-paths-check\.mjs/)
    assert.match(workflow, /case-paths-check\.test\.mjs/)
    assert.doesNotMatch(workflow, /continue-on-error|--no-frozen-lockfile|\|\| true/)
    for (const gate of ['check:runtime-dependencies', 'check:shared', 'spec:check', 'check:style-vars', 'typecheck', 'test', 'check:cli', 'package:check', 'check:published-environment', 'check:doc-pipeline', 'check:docs-theme', 'check:docs-components']) {
      assert.ok(scripts.quality.split(' && ').includes(`pnpm ${gate}`), `${gate} must run in quality`)
    }
    assert.match(workflow, /- run: pnpm exec playwright install --with-deps chromium/)
    assert.ok(workflow.indexOf('playwright install --with-deps chromium') < workflow.indexOf('- run: pnpm quality'))
    assert.ok(scripts.quality.indexOf('pnpm build:doc') < scripts.quality.indexOf('pnpm check:docs-theme'))
    assert.ok(scripts.quality.indexOf('pnpm check:doc-pipeline') < scripts.quality.indexOf('pnpm build:doc'))
    assert.equal(scripts['check:docs-theme'], 'node --test scripts/browser/docs-theme.test.mjs')
    assert.equal(scripts['check:docs-components'], 'node --test scripts/browser/components.test.mjs')
    assert.ok(scripts.quality.indexOf('pnpm build:doc') < scripts.quality.indexOf('pnpm check:docs-components'))
    assert.match(workflow, /browser\/inventory\.test\.mjs/)
    assert.match(workflow, /actions\/upload-artifact@v4/)
    assert.match(workflow, /if: always\(\)/)
    if (repo === 'cedar-design-web') {
      assert.ok(scripts.quality.includes('pnpm lint &&'))
      assert.ok(scripts.quality.includes('pnpm build:lib &&'))
      assert.ok(scripts.quality.includes('pnpm build:doc &&'))
      assert.ok(scripts.quality.indexOf('pnpm build:lib') < scripts.quality.indexOf('pnpm typecheck'))
      assert.ok(scripts.quality.indexOf('pnpm build:lib') < scripts.quality.indexOf('pnpm test &&'))
      assert.ok(scripts['build:lib'].includes('pnpm build:presets &&'))
      const ui = JSON.parse(readFileSync(resolve(root, 'packages/cedar-ui/package.json'), 'utf8'))
      assert.match(ui.scripts['build:doc'], /node --max-old-space-size=6144 .*vuepress.* build docs --dest dist/)
      const docsConfig = readFileSync(resolve(root, 'packages/cedar-ui/docs/.vuepress/config.ts'), 'utf8')
      assert.match(docsConfig, /preprocessorMaxWorkers:\s*2\s*,/)
      assert.match(docsConfig, /api:\s*'modern-compiler'/)
    } else {
      for (const gate of ['build:lib', 'build:doc', 'lint:check', 'check:dev-boundary', 'check:cross-platform', 'check:test-collection', 'check:doc-pipeline', 'check:source-normalization', 'check:icon-bundle', 'check:component-bundle', 'check:docs-theme']) {
        assert.ok(scripts.quality.split(' && ').includes(`pnpm ${gate}`), `${gate} must run in quality`)
      }
      assert.ok(workflow.indexOf('playwright install --with-deps chromium') < workflow.indexOf('- run: pnpm quality'))
    }
  })
}

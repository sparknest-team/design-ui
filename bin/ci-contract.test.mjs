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
    if (repo === 'cedar-design-web') {
      assert.match(workflow, /node-version-file: cedar-design-web\/\.nvmrc\s/)
      const version = readFileSync(resolve(root, '.nvmrc'), 'utf8').trim()
      assert.equal(version, '26.13.1')
      assert.equal(readFileSync(resolve(root, '.node-version'), 'utf8').trim(), version)
      const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
      assert.equal(manifest.volta.node, version)
      assert.equal(manifest.engines.node, `>=${version}`)
      assert.ok(readFileSync(resolve(root, '.npmrc'), 'utf8').split('\n').includes(`use-node-version=${version}`))
    } else assert.match(workflow, /node-version: 20\s/)
    assert.match(workflow, /version: 9\.6\.0\s/)
    assert.equal((workflow.match(/install --frozen-lockfile/g) ?? []).length, 3)
    assert.match(workflow, repo === 'cedar-design-web' ? /npm exec --yes --package=.*packageManager\.split.* -- pnpm install --frozen-lockfile\s+working-directory: design-ui/ : /corepack pnpm install --frozen-lockfile\s+working-directory: design-ui/)
    assert.match(workflow, /- run: pnpm quality\s/)
    assert.match(workflow, /shared-source-contract\.test\.mjs/)
    assert.match(workflow, /ci-contract\.test\.mjs/)
    assert.match(workflow, /- run: node \.\.\/design-ui\/bin\/ci-toolchain-check\.mjs/)
    assert.match(workflow, /ci-toolchain-check\.test\.mjs/)
    assert.match(workflow, /ui-build\/test\/environment\.test\.mjs/)
    assert.match(workflow, /- run: node \.\.\/design-ui\/bin\/case-paths-check\.mjs/)
    assert.match(workflow, /case-paths-check\.test\.mjs/)
    assert.doesNotMatch(workflow, /continue-on-error|--no-frozen-lockfile|\|\| true/)
    for (const gate of ['check:runtime-dependencies', 'check:shared', 'check:vue-compat:source', 'check:vue-compat', 'spec:check', 'check:style-vars', 'typecheck', 'test', 'check:cli', 'package:check', 'check:published-environment', 'check:doc-pipeline', 'check:docs-theme', 'check:docs-components', 'check:compatibility']) {
      assert.ok(scripts.quality.split(' && ').includes(`pnpm ${gate}`), `${gate} must run in quality`)
    }
    assert.ok(scripts.quality.indexOf('pnpm check:vue-compat:source') < scripts.quality.indexOf('pnpm build:lib'))
    assert.ok(scripts.quality.indexOf('pnpm build:lib') < scripts.quality.indexOf('pnpm check:vue-compat &&'))
    assert.match(workflow, /- run: pnpm exec playwright install --with-deps chromium firefox webkit/)
    assert.ok(workflow.indexOf('playwright install --with-deps chromium') < workflow.indexOf('- run: pnpm quality'))
    assert.ok(scripts.quality.indexOf('pnpm build:doc') < scripts.quality.indexOf('pnpm check:docs-theme'))
    assert.ok(scripts.quality.indexOf('pnpm check:doc-pipeline') < scripts.quality.indexOf('pnpm build:doc'))
    assert.equal(scripts['check:docs-theme'], 'node --test scripts/browser/docs-theme.test.mjs')
    assert.equal(scripts['check:docs-components'], 'node --test scripts/browser/components.test.mjs')
    assert.ok(scripts.quality.indexOf('pnpm build:doc') < scripts.quality.indexOf('pnpm check:docs-components'))
    assert.match(workflow, /browser\/inventory\.test\.mjs/)
    assert.match(workflow, /browser\/navigation\.test\.mjs/)
    const browserEntry = readFileSync(resolve(root, 'scripts/browser/components.test.mjs'), 'utf8')
    assert.match(browserEntry, /defineProductionNavigationTests\(/)
    assert.match(workflow, /actions\/upload-artifact@v4/)
    assert.match(workflow, /if: always\(\)/)
    if (repo === 'cedar-design-web') {
      assert.ok(scripts.quality.includes('pnpm lint &&'))
      assert.ok(scripts.quality.includes('pnpm build:lib &&'))
      assert.ok(scripts.quality.includes('pnpm build:doc &&'))
      assert.ok(scripts.quality.indexOf('pnpm build:lib') < scripts.quality.indexOf('pnpm typecheck'))
      assert.ok(scripts.quality.indexOf('pnpm build:lib') < scripts.quality.indexOf('pnpm test &&'))
      assert.ok(scripts['build:lib'].includes('pnpm build:presets &&'))
      const ui = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'))
      assert.match(ui.scripts['build:doc'], /node --max-old-space-size=6144 .*vuepress.* build docs --dest dist/)
      const docsConfig = readFileSync(resolve(root, 'packages/ui/docs/.vuepress/config.ts'), 'utf8')
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
